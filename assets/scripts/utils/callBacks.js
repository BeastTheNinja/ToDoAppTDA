/*
 * CALLBACKS - Event Handler Registry
 * 
 * BEGINNER: This file manages functions that get called when specific things happen in the app.
 * ADVANCED: Centralized callback registry for loose coupling between components.
 * EXPERT: Event coordination layer implementing publish-subscribe pattern for cross-cutting concerns.
 */

// BEGINNER: This object holds functions that will be called when certain events happen
// ADVANCED: Registry object for storing event handler functions
// EXPERT: Callback registry implementing observer pattern variant - enables loose coupling between layers
const Callbacks = {
    // BEGINNER: These are all set to null initially - they'll be set to real functions later
    // ADVANCED: Initialize all callback slots to null for optional registration
    // EXPERT: Optional callback slots - allows selective event handling without tight coupling
    onListSelected: null,    // Called when user clicks on a list
    onTodoEdited: null,      // Called when user finishes editing a todo
    onThemeChanged: null,    // Called when user switches between light/dark mode
    onListEdited: null,      // Called when user finishes editing a list name
    onListAdded: null,       // Called when user creates a new list
    onTodoAdded: null,       // Called when user adds a new todo
    onTodoDeleted: null,     // Called when user deletes a todo
    onListDeleted: null,     // Called when user deletes a list
};

// BEGINNER: Functions to set what should happen when events occur
// ADVANCED: Setter functions for registering event handlers
// EXPERT: Registration API for event handlers - allows components to subscribe to specific events

// BEGINNER: Set the function that runs when a list is selected
export function setOnListSelected(fn) { Callbacks.onListSelected = fn; }

// BEGINNER: Set the function that runs when a todo is edited
export function setOnTodoEdited(fn) { Callbacks.onTodoEdited = fn; }

// BEGINNER: Set the function that runs when theme changes
export function setOnThemeChanged(fn) { Callbacks.onThemeChanged = fn; }

// BEGINNER: Set the function that runs when a list is edited
export function setOnListEdited(fn) { Callbacks.onListEdited = fn; }

// BEGINNER: Set the function that runs when a list is added
export function setOnListAdded(fn) { Callbacks.onListAdded = fn; }

// BEGINNER: Set the function that runs when a todo is added
export function setOnTodoAdded(fn) { Callbacks.onTodoAdded = fn; }

// BEGINNER: Set the function that runs when a todo is deleted
export function setOnTodoDeleted(fn) { Callbacks.onTodoDeleted = fn; }

// BEGINNER: Set the function that runs when a list is deleted
export function setOnListDeleted(fn) { Callbacks.onListDeleted = fn; }

// BEGINNER: Export the main callbacks object so other files can use it
// ADVANCED: Export callbacks registry for action dispatcher access
// EXPERT: Export centralized registry for cross-component event coordination
export { Callbacks };