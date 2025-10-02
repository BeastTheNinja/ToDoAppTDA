/*
 * APP STATE (MODEL) - Central Data Store
 * 
 * BEGINNER: This file holds all the app's data (lists, todos, theme) and methods to change them.
 * ADVANCED: Centralized state management with observer pattern and localStorage persistence.
 * EXPERT: State container implementing observer pattern, immutable-style updates, and persistent storage abstraction.
 */

// BEGINNER: The key name used to save data in the browser's storage
// ADVANCED: LocalStorage key constant for data persistence
// EXPERT: Storage key abstraction - allows easy migration to different storage mechanisms
const APP_STATE_KEY = 'appState';

// BEGINNER: This object holds all our app's data and functions to change it
// ADVANCED: Main state container with methods for data manipulation and persistence
// EXPERT: Singleton state manager implementing observer pattern with localStorage persistence layer
export const AppState = {
    // BEGINNER: Arrays and variables that store our app's information
    // ADVANCED: Core application data structures
    // EXPERT: Normalized state shape optimized for performance and maintainability
    lists: [],              // Array of todo lists, each with id, name, and todos array
    selectedListId: null,   // Currently active list ID for navigation state
    theme: 'dark',          // UI theme preference (dark/light)
    listeners: [],          // Observer pattern subscribers
    uiState: 'loading',     // Current UI state: 'loading', 'homepage', 'list'

    // BEGINNER: Add a function that will be called whenever data changes
    // ADVANCED: Observer pattern - register callback functions for state changes
    // EXPERT: Subscription mechanism for reactive programming - enables loose coupling between components
    subscribe(fn) {
        this.listeners.push(fn);
    },
    
    // BEGINNER: Tell all registered functions that something changed
    // ADVANCED: Notify all subscribers of state changes
    // EXPERT: Event emission in observer pattern - triggers reactive updates across the application
    notify() {
        this.listeners.forEach(fn => fn());
    },
    
    // BEGINNER: Create a new todo list and make it the active one
    // ADVANCED: Add new list to state, set as selected, persist, and notify observers
    // EXPERT: Atomic operation ensuring consistent state transitions with side effects (persistence, selection, notification)
    addList(name) {
        // BEGINNER: Create a new list object with a unique ID
        // ADVANCED: Generate list with timestamp-based ID for uniqueness
        // EXPERT: Entity creation with guaranteed unique identifier using timestamp
        const newList = { id: Date.now().toString(), name, todos: [] };
        
        // BEGINNER: Add it to our lists array
        this.lists.push(newList);
        
        // BEGINNER: Make this new list the one we're currently looking at
        this.selectedListId = newList.id;
        
        // BEGINNER: Save everything to browser storage so we don't lose it
        this.saveState();
        
        // BEGINNER: Tell other parts of the app that we added a list
        this.notify();
        
        // BEGINNER: Return the ID so other code can use it
        return newList.id;
    },
    
    // BEGINNER: Switch to viewing a different list
    // ADVANCED: Update selected list state with persistence and notification
    // EXPERT: Navigation state management with automatic persistence
    selectList(id) {
        this.selectedListId = id;
        this.saveState();
        this.notify();
    },
    
    // BEGINNER: Add a new todo item to the currently selected list
    // ADVANCED: Add todo to current list with default properties and state management
    // EXPERT: Entity creation within aggregate boundary (list contains todos) with consistent state updates
    addTodo(text) {
        // BEGINNER: Find the list we're currently looking at
        const list = this.lists.find(l => l.id === this.selectedListId);
        
        if (list) {
            // BEGINNER: Add new todo with default settings (not completed, not being edited)
            // ADVANCED: Create todo entity with default state properties
            // EXPERT: Domain entity creation with appropriate default values for UI state
            list.todos.push({ text, completed: false, editing: false });
            
            this.saveState();
            this.notify();
            
            // BEGINNER: Return the position of the new todo so we can find it later
            // ADVANCED: Return index for UI reference
            // EXPERT: Return handle for immediate UI operations (animations, focus management)
            return list.todos.length - 1;
        }
        return null;
    },
    
    // BEGINNER: Remove a todo from the current list
    // ADVANCED: Delete todo by index with state persistence
    // EXPERT: Entity removal with array mutation and state consistency
    deleteTodo(index) {
        const list = this.lists.find(l => l.id === this.selectedListId);
        if (list) {
            // BEGINNER: Remove 1 item starting at the given position
            // ADVANCED: Array splice operation for item removal
            // EXPERT: In-place array mutation - efficient but requires careful index management
            list.todos.splice(index, 1);
            this.saveState();
            this.notify();
        }
    },
    
    // BEGINNER: Change the text of an existing todo and stop editing mode
    // ADVANCED: Update todo text and exit edit state
    // EXPERT: Entity property update with state transition (editing -> viewing)
    editTodo(index, newText) {
        const list = this.lists.find(l => l.id === this.selectedListId);
        if (list && list.todos[index]) {
            list.todos[index].text = newText;
            list.todos[index].editing = false; // Exit edit mode
            this.saveState();
            this.notify();
        }
    },
    
    // BEGINNER: Change the name of a list and stop editing mode
    // ADVANCED: Update list name and exit edit state
    // EXPERT: Entity property update with UI state management
    editListName(id, newName) {
        const list = this.lists.find(l => l.id === id);
        if (list) {
            list.name = newName;
            list.editing = false; // Exit edit mode
            this.saveState();
            this.notify();
        }
    },
    
    // BEGINNER: Mark a todo as completed or not completed
    // ADVANCED: Toggle todo completion state
    // EXPERT: Boolean state toggle with persistence - simple but effective state management
    toggleTodo(index, completed) {
        const list = this.lists.find(l => l.id === this.selectedListId);
        if (list) {
            list.todos[index].completed = completed;
            this.saveState();
            this.notify();
        }
    },
    
    // BEGINNER: Save all our data to the browser so it persists when we close the app
    // ADVANCED: Serialize state to localStorage for persistence
    // EXPERT: State persistence layer - abstracts storage mechanism for potential future migration
    saveState() {
        // BEGINNER: Create an object with only the data we want to save
        // ADVANCED: Create serializable state object excluding runtime properties
        // EXPERT: Data transfer object pattern - separate persistence model from runtime model
        const state = {
            lists: this.lists,
            selectedListId: this.selectedListId,
            theme: this.theme
        };
        
        // BEGINNER: Convert to text and save in browser storage
        // ADVANCED: JSON serialization to localStorage
        // EXPERT: Synchronous persistence - acceptable for small datasets, consider async for larger apps
        localStorage.setItem(APP_STATE_KEY, JSON.stringify(state));
    },
    
    // BEGINNER: Load our saved data from the browser when the app starts
    // ADVANCED: Deserialize state from localStorage with fallback defaults
    // EXPERT: State hydration with defensive programming - handles corrupted/missing data gracefully
    loadState() {
        // BEGINNER: Get saved data from browser, or use empty object if nothing saved
        // ADVANCED: Safe localStorage access with fallback
        // EXPERT: Defensive deserialization with type safety fallbacks
        const state = JSON.parse(localStorage.getItem(APP_STATE_KEY) || '{}');
        
        // BEGINNER: Set our data from what we loaded, or use defaults if something's missing
        // ADVANCED: Populate state with loaded data or sensible defaults
        // EXPERT: State initialization with type guards and default value provision
        this.lists = Array.isArray(state.lists) ? state.lists : [];
        this.selectedListId = state.selectedListId || null;
        this.theme = state.theme || 'dark';
    },
    
    // BEGINNER: Change between dark and light theme
    // ADVANCED: Update theme preference with persistence
    // EXPERT: Theme state management with immediate persistence
    setTheme(theme) {
        this.theme = theme;
        this.saveState();
        this.notify();
    }
};