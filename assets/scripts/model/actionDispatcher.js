/*
 * ACTION DISPATCHER - Central Command Handler
 * 
 * BEGINNER: This file handles all user actions (like clicking buttons) and decides what to do with them.
 * ADVANCED: Command pattern implementation for centralized action handling with callback coordination.
 * EXPERT: Action dispatcher implementing command pattern with side effect management and cross-cutting concerns.
 */

// BEGINNER: Import the data storage and callback functions we need
// ADVANCED: Import dependencies for state management and event coordination
// EXPERT: Dependency injection - dispatcher coordinates between state layer and callback layer
import { AppState } from './AppState.js';
import { Callbacks } from '../utils/callBacks.js';

// BEGINNER: This function receives an action (like "ADD_TODO") and handles it appropriately
// ADVANCED: Central command dispatcher using switch pattern for action routing
// EXPERT: Command pattern implementation with action type discrimination and payload processing
export function dispatchAction(type, payload) {
    // BEGINNER: Check what type of action this is and do the right thing
    // ADVANCED: Action type switching for command routing
    // EXPERT: Discriminated union pattern - type-safe action handling with exhaustive case coverage
    switch (type) {
        case 'ADD_LIST': {
            // BEGINNER: Create a new list with the given name
            // ADVANCED: Create list, update UI state, trigger callback, notify observers
            // EXPERT: Atomic operation with multiple side effects - state change, UI navigation, callback execution
            const id = AppState.addList(payload.name);
            AppState.uiState = 'list'; // Navigate to the new list
            
            // BEGINNER: If we have a function to call when lists are added, call it
            // ADVANCED: Execute callback if registered
            // EXPERT: Optional callback execution with type safety check
            if (typeof Callbacks.onListAdded === 'function') Callbacks.onListAdded(id, payload.name);
            
            AppState.notify();
            break;
        }
        
        case 'SELECT_LIST': {
            // BEGINNER: Switch to viewing a different list
            // ADVANCED: Navigate to selected list with state management
            // EXPERT: Navigation action with state persistence and callback coordination
            AppState.selectList(payload.id);
            AppState.uiState = 'list';
            
            if (typeof Callbacks.onListSelected === 'function') Callbacks.onListSelected(payload.id);
            AppState.notify();
            break;
        }
        
        case 'EDIT_LIST': {
            // BEGINNER: Update a list's name
            // ADVANCED: Update list entity with callback notification
            // EXPERT: Entity mutation with event propagation
            AppState.editListName(payload.id, payload.newName);
            
            if (typeof Callbacks.onListEdited === 'function') Callbacks.onListEdited(payload.id, payload.newName);
            AppState.notify();
            break;
        }
        
        case 'DELETE_LIST': {
            // BEGINNER: Remove a list completely
            // ADVANCED: Delete list with navigation logic and state cleanup
            // EXPERT: Complex deletion operation with referential integrity and navigation state management
            const idx = AppState.lists.findIndex(l => l.id === payload.id);
            
            if (idx !== -1) {
                // BEGINNER: Remove the list from our array
                AppState.lists.splice(idx, 1);
                
                // BEGINNER: If we were looking at this list, go back to homepage
                // ADVANCED: Handle navigation state when deleting currently selected list
                // EXPERT: Referential integrity - ensure UI state remains consistent after entity deletion
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
            // BEGINNER: Add a new todo to the current list
            // ADVANCED: Create todo entity with callback notification
            // EXPERT: Entity creation within aggregate boundary
            const index = AppState.addTodo(payload.text);
            
            if (typeof Callbacks.onTodoAdded === 'function') Callbacks.onTodoAdded(index, payload.text);
            AppState.notify();
            break;
        }
        
        case 'EDIT_TODO': {
            // BEGINNER: Change the text of an existing todo
            // ADVANCED: Update todo entity with event propagation
            // EXPERT: Entity property mutation with callback coordination
            AppState.editTodo(payload.index, payload.newText);
            
            if (typeof Callbacks.onTodoEdited === 'function') Callbacks.onTodoEdited(payload.index, payload.newText);
            AppState.notify();
            break;
        }
        
        case 'DELETE_TODO': {
            // BEGINNER: Remove a todo from the current list
            // ADVANCED: Delete todo entity with callback notification
            // EXPERT: Entity deletion with index-based reference management
            AppState.deleteTodo(payload.index);
            
            if (typeof Callbacks.onTodoDeleted === 'function') Callbacks.onTodoDeleted(payload.index);
            AppState.notify();
            break;
        }
        
        case 'TOGGLE_TODO': {
            // BEGINNER: Mark a todo as done or not done
            // ADVANCED: Toggle todo completion state
            // EXPERT: Boolean state mutation - simple but effective
            AppState.toggleTodo(payload.index, payload.completed);
            AppState.notify();
            break;
        }
        
        case 'CHANGE_THEME': {
            // BEGINNER: Switch between light and dark mode
            // ADVANCED: Update theme preference with callback notification
            // EXPERT: UI preference management with persistence
            AppState.setTheme(payload.theme);
            
            if (typeof Callbacks.onThemeChanged === 'function') Callbacks.onThemeChanged(payload.theme);
            AppState.notify();
            break;
        }
        
        case 'BACK_HOME': {
            // BEGINNER: Go back to the main page showing all lists
            // ADVANCED: Navigate to homepage with state management
            // EXPERT: Navigation action with state persistence
            AppState.selectedListId = null;
            AppState.uiState = 'homepage';
            AppState.saveState();
            AppState.notify();
            break;
        }
        
        case 'SHOW_LOADING': {
            // BEGINNER: Show the loading screen
            // ADVANCED: Set loading UI state
            // EXPERT: UI state management for async operations
            AppState.uiState = 'loading';
            AppState.notify();
            break;
        }
        
        default:
            // BEGINNER: If we don't recognize the action, show a warning
            // ADVANCED: Handle unknown actions gracefully
            // EXPERT: Defensive programming - log unhandled actions for debugging
            console.warn('Unknown action type:', type);
    }
}