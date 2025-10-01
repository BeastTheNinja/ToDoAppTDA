import { AppState } from './AppState.js';
import { Callbacks } from '../utils/callBacks.js';

// Action Dispatcher
// Handles all user actions using a switch statement.
export function dispatchAction(type, payload) {
    switch (type) {
        case 'ADD_LIST': {
            const id = AppState.addList(payload.name);
            AppState.uiState = 'list';
            if (typeof Callbacks.onListAdded === 'function') Callbacks.onListAdded(id, payload.name);
            AppState.notify();
            break;
        }
        case 'SELECT_LIST': {
            AppState.selectList(payload.id);
            AppState.uiState = 'list';
            if (typeof Callbacks.onListSelected === 'function') Callbacks.onListSelected(payload.id);
            AppState.notify();
            break;
        }
        case 'EDIT_LIST': {
            AppState.editListName(payload.id, payload.newName);
            if (typeof Callbacks.onListEdited === 'function') Callbacks.onListEdited(payload.id, payload.newName);
            AppState.notify();
            break;
        }
        case 'DELETE_LIST': {
            const idx = AppState.lists.findIndex(l => l.id === payload.id);
            if (idx !== -1) {
                AppState.lists.splice(idx, 1);
                if (AppState.selectedListId === payload.id) {
                    AppState.selectedListId = null;
                    AppState.uiState = 'homepage';
                }
                AppState.saveState();
                AppState.notify();
                if (typeof Callbacks.onListDeleted === 'function') Callbacks.onListDeleted(payload.id);
            }
            break;
        }
        case 'ADD_TODO': {
            const index = AppState.addTodo(payload.text);
            if (typeof Callbacks.onTodoAdded === 'function') Callbacks.onTodoAdded(index, payload.text);
            AppState.notify();
            break;
        }
        case 'EDIT_TODO': {
            AppState.editTodo(payload.index, payload.newText);
            if (typeof Callbacks.onTodoEdited === 'function') Callbacks.onTodoEdited(payload.index, payload.newText);
            AppState.notify();
            break;
        }
        case 'DELETE_TODO': {
            AppState.deleteTodo(payload.index);
            if (typeof Callbacks.onTodoDeleted === 'function') Callbacks.onTodoDeleted(payload.index);
            AppState.notify();
            break;
        }
        case 'TOGGLE_TODO': {
            AppState.toggleTodo(payload.index, payload.completed);
            AppState.notify();
            break;
        }
        case 'CHANGE_THEME': {
            AppState.setTheme(payload.theme);
            if (typeof Callbacks.onThemeChanged === 'function') Callbacks.onThemeChanged(payload.theme);
            AppState.notify();
            break;
        }
        case 'BACK_HOME': {
            AppState.selectedListId = null;
            AppState.uiState = 'homepage';
            AppState.saveState();
            AppState.notify();
            break;
        }
        case 'SHOW_LOADING': {
            AppState.uiState = 'loading';
            AppState.notify();
            break;
        }
        default:
            console.warn('Unknown action type:', type);
    }
}