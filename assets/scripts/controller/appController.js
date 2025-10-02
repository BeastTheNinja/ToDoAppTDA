/*
 * APP CONTROLLER - Event Coordination & Initialization
 * 
 * BEGINNER: This file connects user actions (clicks, typing) to the functions that handle them.
 * ADVANCED: Controller layer in MVC pattern - coordinates between Model and View with event handling.
 * EXPERT: Application controller implementing MVC pattern with event delegation and lifecycle management.
 */

// BEGINNER: Import the parts of our app we need to control
// ADVANCED: Import MVC components for coordination
// EXPERT: Dependency injection for MVC layer coordination
import { AppState } from '../model/AppState.js';
import { dispatchAction } from '../model/ActionDispatcher.js';
import { View } from '../view/View.js';

// BEGINNER: The main controller object that sets up all our event listeners
// ADVANCED: Controller singleton with initialization guard and event management
// EXPERT: Application controller with lifecycle management and event delegation
export const Controller = {
    // BEGINNER: Flag to make sure we don't initialize twice
    // ADVANCED: Initialization guard to prevent duplicate setup
    // EXPERT: Idempotent initialization pattern - prevents side effect duplication
    _initialized: false,

    // BEGINNER: Set up all the event listeners and start the app
    // ADVANCED: Initialize MVC coordination and event binding
    // EXPERT: Application bootstrap with state hydration and reactive UI setup
    init() {
        // BEGINNER: Don't run this more than once
        if (this._initialized) return;
        this._initialized = true;

        // BEGINNER: Load any saved data from browser storage
        // ADVANCED: Hydrate application state from persistence layer
        // EXPERT: State rehydration - restore application state from localStorage
        AppState.loadState();
        
        // BEGINNER: Decide whether to show homepage or a specific list based on saved data
        // ADVANCED: Set initial UI state based on persisted selection
        // EXPERT: State-driven navigation - determine initial route from persisted state
        AppState.uiState = AppState.selectedListId ? 'list' : 'homepage';
        
        // BEGINNER: Set up the theme (dark/light mode) from saved preferences
        // ADVANCED: Apply theme state to UI
        // EXPERT: UI preference application - sync visual state with model
        View.renderTheme();

        // BEGINNER: Set up a function that runs every time our data changes
        // ADVANCED: Subscribe to state changes for reactive UI updates
        // EXPERT: Observer pattern subscription - reactive UI based on state mutations
        AppState.subscribe(() => {
            // BEGINNER: Check what screen we should show and display it
            // ADVANCED: Route UI based on current application state
            // EXPERT: State-driven view routing with centralized UI state management
            switch (AppState.uiState) {
                case 'loading':
                    View.renderLoadingScreen();
                    break;
                case 'homepage':
                    View.hideLoadingScreen();
                    View.renderHomepage();
                    break;
                case 'list':
                    View.hideLoadingScreen();
                    View.renderTodos();
                    break;
            }
            
            // BEGINNER: Always update the theme in case it changed
            // ADVANCED: Ensure theme consistency across state changes
            // EXPERT: Cross-cutting concern - theme applies to all UI states
            View.renderTheme();
        });

        // BEGINNER: Listen for when user submits the form (adds a new todo)
        // ADVANCED: Form submission event handling with validation
        // EXPERT: Event delegation for form interactions with input validation
        View.todoForm.addEventListener('submit', (e) => {
            // BEGINNER: Prevent the page from refreshing (default form behavior)
            e.preventDefault();
            
            // BEGINNER: Get the text the user typed and remove extra spaces
            const text = View.todoInput.value.trim();
            
            // BEGINNER: Only add the todo if they actually typed something
            if (text.length > 0) {
                // BEGINNER: Tell the app to add this todo
                // ADVANCED: Dispatch action to add todo
                // EXPERT: Command dispatch with payload - decoupled action handling
                dispatchAction('ADD_TODO', { text });
                
                // BEGINNER: Clear the input box so they can type a new todo
                View.todoInput.value = '';
            }
        });

        // BEGINNER: Listen for when user clicks the theme toggle switch
        // ADVANCED: Theme toggle event handling with state synchronization
        // EXPERT: UI preference event handling with state persistence
        View.themeToggle.addEventListener("change", () => {
            // BEGINNER: Figure out what the new theme should be based on current theme
            // ADVANCED: Determine new theme state based on current UI state
            // EXPERT: State derivation from UI interaction - invert current state
            const newTheme = View.body.classList.contains("light-theme") ? "dark" : "light";
            
            // BEGINNER: Tell the app to change to the new theme
            // ADVANCED: Dispatch theme change action
            // EXPERT: Command dispatch for cross-cutting UI concern
            dispatchAction('CHANGE_THEME', { theme: newTheme });
        });
    }
};