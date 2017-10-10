import { fetch, addTask } from 'domain-task';
import { Action, Reducer, ActionCreator } from 'redux';
import { AppThunkAction } from './';

// STATE

export interface InventoryListState {
    inventory: InventoryItem[];
    loading: boolean;
};

export interface InventoryItem {
    id: number,
    count: number,
    url: string,
    img: string,
    level: number,
    name: string
};

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

type KnownAction = RequestInventoryAction | ReceiveInventoryAction | AddInventoryAction | RemoveInventoryAction;

// ACTION CREATORS

export const actionCreators = {
    requestInventory: (): AppThunkAction<KnownAction> => (dispatch, getState) => {
        let fetchTask = fetch(`api/Inventory/`)
            .then(response => response.json() as Promise<InventoryItem[]>)
            .then(data => {
                dispatch({ type: 'RECIEVE_INVENTORY', inventory: data });
            });

        addTask(fetchTask);
        dispatch({ type: 'REQUEST_INVENTORY' });
    },
    addInventory: (name: string, value: number): AppThunkAction<KnownAction> => (dispatch, getState) => {
        let fetchTask = fetch(`api/Inventory/`, {
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
        let fetchTask = fetch(`api/Inventory/${ id }/`, {
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
};

// REDUCER

const unloadedState: InventoryListState = { inventory: [], loading: false };

export const reducer: Reducer<InventoryListState> = (state: InventoryListState, incomingAction: Action) => {
    const action = incomingAction as KnownAction;
    switch (action.type) {
        case 'REQUEST_INVENTORY':
            return {
                inventory: state.inventory,
                loading: true
            };
        case 'RECIEVE_INVENTORY':
            return {
                inventory: action.inventory,
                loading: false
            };
        case 'ADD_INVENTORY':
            return {
                inventory: state.inventory,
                loading: true
            };
        case 'REMOVE_INVENTORY':
            return {
                inventory: state.inventory,
                loading: true
            }
        default:
            const exhaustiveCheck: never = action;
    }

    return state || unloadedState;
};