import { fetch, addTask } from 'domain-task';
import { Action, Reducer, ActionCreator } from 'redux';
import { AppThunkAction } from './';

let GUID = function () {
    var guid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
    return guid;
};

// STATE

export interface InventoryListState {
    session: string,
    error: string,
    inventory: InventoryItem[];
    loading: boolean;
    itemLoading: boolean;
    selectedPokemon?: PItem;
    selectedItem?: IItem;
};

export interface InventoryItem {
    id: number,
    count: number,
    url: string,
    img: string,
    level: number,
    name: string
};

export interface PItem {
    name: string,
    id: number,
    url: string,
    img: string,
    description: string,
    level: string,
    evolution: Evolution[]
}

export interface IItem {
    name: string,
    id: number,
    url: string,
    img: string,
    count: number,
    description: string
}

export interface Evolution {
    trigger: string,
    item: string,
    level: string, 
    pokemon: string
}

// ACTIONS

interface RequestInventoryAction {
    type: 'REQUEST_INVENTORY'
}

interface ReceiveInventoryAction {
    type: 'RECIEVE_INVENTORY'
    inventory: InventoryItem[]
}

interface AddInventoryAction {
    type: 'ADD_INVENTORY',
    name: string,
    value: number
}

interface RemoveInventoryAction {
    type: 'REMOVE_INVENTORY',
    id: number
}

interface SelectItemAction {
    type: 'SELECT_ITEM',
    id: number
}

interface SelectItemLoadAction {
    type: 'SELECT_ITEM_LOAD',
    item: IItem,
    pokemon: PItem
}

interface ClearItemAction {
    type: 'CLEAR_ITEM'
}

interface LevelUpAction {
    type: 'LEVEL_UP'
}

interface LevelUpLoadAction {
    type: 'LEVEL_UP_LOAD',
    pokemon: PItem
}

interface SetErrorAction {
    type: 'SET_ERROR',
    error: string
}

type KnownAction = RequestInventoryAction | ReceiveInventoryAction | AddInventoryAction | RemoveInventoryAction | SelectItemAction | ClearItemAction | LevelUpAction | SelectItemLoadAction | LevelUpLoadAction | SetErrorAction;

// ACTION CREATORS

export const actionCreators = {
    requestInventory: (): AppThunkAction<KnownAction> => (dispatch, getState) => {
        let fetchTask = fetch(`api/Inventory/?session=` + getState().inventory.session)
            .then(response => response.json() as Promise<InventoryItem[]>)
            .then(data => {
                dispatch({ type: 'RECIEVE_INVENTORY', inventory: data });
            });

        addTask(fetchTask);
        dispatch({ type: 'REQUEST_INVENTORY' });
    },
    addInventory: (name: string, value: number): AppThunkAction<KnownAction> => (dispatch, getState) => {
        let fetchTask = fetch(`api/Inventory/?session=` + getState().inventory.session, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                itemname: name,
                countorlevel: value,
            })
        })
        .then(response => response.json() as Promise<InventoryItem[]>)
        .then(data => {
            dispatch({ type: 'RECIEVE_INVENTORY', inventory: data });
        });

        addTask(fetchTask);
        dispatch({ type: 'ADD_INVENTORY', name: name, value: value });
    },
    removeInventory: (id: number): AppThunkAction<KnownAction> => (dispatch, getState) => {
        let fetchTask = fetch(`api/Inventory/${id}/?session=` + getState().inventory.session, {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            }
        })
        .then(response => response.json() as Promise<InventoryItem[]>)
        .then(data => {
            dispatch({ type: 'RECIEVE_INVENTORY', inventory: data });
        });

        addTask(fetchTask);
        dispatch({ type: 'REMOVE_INVENTORY', id: id });
    },
    selectInventoryItem: (id: number): AppThunkAction<KnownAction> => (dispatch, getState) => {
        let fetchTask = fetch(`api/Inventory/${id}/?session=` + getState().inventory.session)
            .then(response => response.json())
            .then(data => {
                let type = "pokemon";
                if (data.level === undefined || data.level === null) {
                    type = "item";
                }
                dispatch({ type: 'SELECT_ITEM_LOAD', item: (type === "item") ? data : undefined, pokemon: (type === "pokemon") ? data : undefined});
            });

        addTask(fetchTask);
        dispatch({ type: 'SELECT_ITEM', id: id });
    },
    levelUpPokemon: (): AppThunkAction<KnownAction> => (dispatch, getState) => {
        let poke = getState().inventory.selectedPokemon;
        if (poke !== undefined) {
            let fetchTask = fetch(`api/Inventory/${poke.id}/?session=` + getState().inventory.session, {
                method: 'PUT',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    itemId: poke.id,
                    action: 'level',
                    count: null
                })
            })
                .then(response => response.json() as Promise<PItem>)
                .then(data => {
                    dispatch({ type: 'LEVEL_UP_LOAD', pokemon: data });
                });

            addTask(fetchTask);
            dispatch({ type: 'LEVEL_UP' });
        }
    },
    removeSelectedItem: (): AppThunkAction<KnownAction> => (dispatch, getState) => {
        dispatch({ type: 'CLEAR_ITEM' });
    },
    setError: (): AppThunkAction<KnownAction> => (dispatch, getState) => {
        dispatch({ type: 'SET_ERROR', error: "You must have a rare candy to level up this pokemon." });
    }
};

// REDUCER

const unloadedState: InventoryListState = { inventory: [], loading: false, itemLoading: false, session: GUID(), error: "", selectedItem: undefined, selectedPokemon: undefined };

export const reducer: Reducer<InventoryListState> = (state: InventoryListState, incomingAction: Action) => {
    const action = incomingAction as KnownAction;
    switch (action.type) {
        case 'REQUEST_INVENTORY':
            return {
                inventory: state.inventory,
                loading: true,
                session: state.session,
                error: state.error,
                itemLoading: state.itemLoading,
                selectedItem: state.selectedItem,
                selectedPokemon: state.selectedPokemon
            };
        case 'RECIEVE_INVENTORY':
            return {
                inventory: action.inventory,
                loading: false,
                session: state.session,
                error: state.error,
                itemLoading: state.itemLoading,
                selectedItem: state.selectedItem,
                selectedPokemon: state.selectedPokemon
            };
        case 'ADD_INVENTORY':
            return {
                inventory: state.inventory,
                loading: true,
                session: state.session,
                error: state.error,
                itemLoading: state.itemLoading,
                selectedItem: state.selectedItem,
                selectedPokemon: state.selectedPokemon
            };
        case 'REMOVE_INVENTORY':
            return {
                inventory: state.inventory,
                loading: true,
                itemLoading: state.itemLoading,
                session: state.session,
                error: state.error,
                selectedItem: state.selectedItem,
                selectedPokemon: state.selectedPokemon
            }
        case 'SELECT_ITEM':
            return {
                inventory: state.inventory,
                loading: false,
                itemLoading: true,
                session: state.session,
                error: state.error,
                selectedItem: state.selectedItem,
                selectedPokemon: state.selectedPokemon
            }
        case 'SELECT_ITEM_LOAD':
            return {
                inventory: state.inventory,
                loading: false,
                itemLoading: false,
                session: state.session,
                error: state.error,
                selectedItem: action.item,
                selectedPokemon: action.pokemon
            }
        case 'CLEAR_ITEM':
            return {
                inventory: state.inventory,
                loading: false,
                itemLoading: false,
                session: state.session,
                error: "",
                selectedItem: undefined,
                selectedPokemon: undefined
            }
        case 'LEVEL_UP': 
            return {
                inventory: state.inventory,
                loading: false,
                itemLoading: true,
                session: state.session,
                error: state.error,
                selectedItem: undefined,
                selectedPokemon: state.selectedPokemon
            }
        case 'LEVEL_UP_LOAD':
            return {
                inventory: state.inventory,
                loading: false,
                itemLoading: false,
                session: state.session,
                error: state.error,
                selectedItem: undefined,
                selectedPokemon: action.pokemon
            }
        case 'SET_ERROR':
            return {
                inventory: state.inventory,
                loading: state.loading,
                itemLoading: state.itemLoading,
                session: state.session,
                error: action.error,
                selectedItem: state.selectedItem,
                selectedPokemon: state.selectedPokemon
            }
        default:
            const exhaustiveCheck: never = action;
    }

    return state || unloadedState;
};