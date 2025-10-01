// Central registry for callback functions triggered by key app events.
const Callbacks = {
    onListSelected: null,
    onTodoEdited: null,
    onThemeChanged: null,
    onListEdited: null,
    onListAdded: null,
    onTodoAdded: null,
    onTodoDeleted: null,
    onListDeleted: null,
};

// Callback setter functions
export function setOnListSelected(fn) { Callbacks.onListSelected = fn; }
export function setOnTodoEdited(fn) { Callbacks.onTodoEdited = fn; }
export function setOnThemeChanged(fn) { Callbacks.onThemeChanged = fn; }
export function setOnListEdited(fn) { Callbacks.onListEdited = fn; }
export function setOnListAdded(fn) { Callbacks.onListAdded = fn; }
export function setOnTodoAdded(fn) { Callbacks.onTodoAdded = fn; }
export function setOnTodoDeleted(fn) { Callbacks.onTodoDeleted = fn; }
export function setOnListDeleted(fn) { Callbacks.onListDeleted = fn; }

export { Callbacks };