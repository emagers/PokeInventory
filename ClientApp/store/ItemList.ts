import { fetch, addTask } from 'domain-task';
import { Action, Reducer, ActionCreator } from 'redux';
import { AppThunkAction } from './';
import * as Inventory from "./Inventory";

// STATE

export interface ItemListState {
    loading: boolean;
    query: string;
    list: Item[];
    selecteditem?: Item;
    value: number,
    hidelist: boolean,
    valueError: string,
    itemError: string
}

export interface Item {
    name: string;
    url: number;
    type: string;
}

// ACTIONS 

interface RequestItemListAction {
    type: 'REQUEST_ITEM_LIST';
    query: string;
}

interface ReceiveItemListAction {
    type: 'RECEIVE_ITEM_LIST';
    list: Item[];
    query: string;
}

interface SelectItemAction {
    type: 'SELECT_ITEM',
    item?: Item
}

interface SelectValueAction {
    type: 'SELECT_VALUE',
    value: number
}

interface AddItemAction {
    type: 'ADD_ITEM',
    name: string,
    value: number
}

interface SetValueErrorAction {
    type: 'SET_VALUE_ERROR'
}

interface SetItemErrorAction {
    type: 'SET_ITEM_ERROR'
}

type KnownAction = RequestItemListAction | ReceiveItemListAction | SelectItemAction | SelectValueAction | AddItemAction | SetValueErrorAction | SetItemErrorAction;

// ACTION CREATORS

export const actionCreators = {
    requestItemList: (query: string): AppThunkAction<KnownAction> => (dispatch, getState) => {
        // Only load data if it's something we don't already have (and are not already loading)
        if (query !== getState().itemlist.query) {
            let fetchTask = fetch(`api/list?q=${ query }`)
                .then(response => response.json() as Promise<Item[]>)
                .then(data => {
                    dispatch({ type: 'RECEIVE_ITEM_LIST', list: data, query: query });
                });

            addTask(fetchTask); 
            dispatch({ type: 'REQUEST_ITEM_LIST', query: query });
        }
    },
    selectItem: (item?: Item): AppThunkAction<KnownAction> => (dispatch, getState) => {
        if (item !== undefined && item !== getState().itemlist.selecteditem) {
            let fetchTask = fetch(`api/list?q=${item.name}`)
                .then(response => response.json() as Promise<Item[]>)
                .then(data => {
                    dispatch({ type: 'RECEIVE_ITEM_LIST', list: data, query: item.name });
                });

            addTask(fetchTask);
            dispatch({ type: 'SELECT_ITEM', item: item });
        }
    },
    selectValue: (value: number): AppThunkAction<KnownAction> => (dispatch, getState) => {
        if (value !== getState().itemlist.value) {
            dispatch({ type: 'SELECT_VALUE', value: value });
        }
    },
    addItem: (): AppThunkAction<KnownAction> => (dispatch, getState) => {
        let item = getState().itemlist.selecteditem;
        let value = getState().itemlist.value;

        if (value <= 0 || value > 9999)
            dispatch({ type: 'SET_VALUE_ERROR' });
        if (!item)
            dispatch({ type: 'SET_ITEM_ERROR' });

        if ((value > 0 && value <= 9999) && item) {
            let fetchTask = fetch(`api/Inventory/?session=` + getState().inventory.session, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: item.name,
                    value: value,
                })
            })
            .then(response => response.json() as Promise<Inventory.InventoryItem[]>)
            .then(data => {
                Inventory.actionCreators.requestInventory();
            });

            addTask(fetchTask);
            dispatch({ type: 'ADD_ITEM', name: item.name, value: value });
        }
    }
};

// REDUCER

const unloadedState: ItemListState = { list: [], loading: false, query: "", selecteditem: undefined, hidelist: false, value: 0, valueError: "", itemError: "" };

export const reducer: Reducer<ItemListState> = (state: ItemListState, incomingAction: Action) => {
    const action = incomingAction as KnownAction;
    switch (action.type) {
        case 'REQUEST_ITEM_LIST':
            return {
                query: action.query,
                list: state.list,
                loading: true,
                selecteditem: state.selecteditem,
                hidelist: state.hidelist,
                value: state.value,
                valueError: "",
                itemError: ""
            };
        case 'RECEIVE_ITEM_LIST':
            if (action.query === state.query) {
                return {
                    query: action.query,
                    list: action.list,
                    loading: false,
                    selecteditem: state.selecteditem,
                    hidelist: (state.selecteditem === undefined || state.selecteditem.name !== state.query) ? true : false,
                    value: state.value,
                    valueError: "",
                    itemError: ""
                };
            }
            break;
        case 'SELECT_ITEM':
            if (action.item !== undefined) {
                return {
                    query: action.item.name,
                    list: state.list,
                    loading: true,
                    selecteditem: action.item,
                    hidelist: state.hidelist,
                    value: state.value,
                    valueError: state.valueError,
                    itemError: ""
                };
            }
            break;
        case 'SELECT_VALUE':
            return {
                query: state.query,
                list: state.list,
                loading: state.loading,
                selecteditem: state.selecteditem,
                hidelist: state.hidelist,
                value: action.value,
                valueError: "",
                itemError: state.itemError
            }
        case 'ADD_ITEM':
            return {
                query: '',
                list: [],
                loading: false,
                selecteditem: undefined,
                hidelist: false,
                value: 0,
                valueError: "",
                itemError: ""
            };
        case 'SET_VALUE_ERROR':
            return {
                query: state.query,
                list: state.list,
                loading: state.loading,
                selecteditem: state.selecteditem,
                hidelist: state.hidelist,
                value: state.value,
                valueError: 'Value must be greater than 0',
                itemError: state.itemError
            };
        case 'SET_ITEM_ERROR':
            return {
                query: state.query,
                list: state.list,
                loading: state.loading,
                selecteditem: state.selecteditem,
                hidelist: state.hidelist,
                value: state.value,
                valueError: state.valueError,
                itemError: 'You must select an item to add'
            };
        default:
            // The following line guarantees that every action in the KnownAction union has been covered by a case above
            const exhaustiveCheck: never = action;
    }

    return state || unloadedState;
};
