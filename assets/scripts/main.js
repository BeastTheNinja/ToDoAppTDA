// #region Callbacks
// Central registry for callback functions triggered by key app events.
// These allow you to hook into app logic for analytics, UI feedback, etc.
const Callbacks = {
    onListSelected: null,   // Called when a list is selected
    onTodoEdited: null,     // Called when a todo is edited
    onThemeChanged: null,   // Called when theme changes
    onListEdited: null,     // Called when a list name is edited
    onListAdded: null,      // Called when a list is added
    onTodoAdded: null,      // Called when a todo is added
    onTodoDeleted: null,    // Called when a todo is deleted
    onListDeleted: null,    // Called when a list is deleted
};

// Functions to register (set) callbacks for each event
function setOnListSelected(fn) { Callbacks.onListSelected = fn; }
function setOnTodoEdited(fn) { Callbacks.onTodoEdited = fn; }
function setOnThemeChanged(fn) { Callbacks.onThemeChanged = fn; }
function setOnListEdited(fn) { Callbacks.onListEdited = fn; }
function setOnListAdded(fn) { Callbacks.onListAdded = fn; }
function setOnTodoAdded(fn) { Callbacks.onTodoAdded = fn; }
function setOnTodoDeleted(fn) { Callbacks.onTodoDeleted = fn; }
function setOnListDeleted(fn) { Callbacks.onListDeleted = fn; }
// #endregion

// #region App State (Model)
// This object holds all app data and methods to manipulate it.
// It acts as the "Model" in MVC, storing lists, todos, theme, and notifying listeners.
const APP_STATE_KEY = 'appState';
const AppState = {
    lists: [],                // Array of all todo lists
    selectedListId: null,     // ID of the currently selected list
    theme: 'dark',            // Current theme ('dark' or 'light')
    listeners: [],            // Functions to call when state changes

    // Subscribe a function to state changes
    subscribe(fn) {
        this.listeners.push(fn);
    },
    // Notify all listeners of a state change
    notify() {
        this.listeners.forEach(fn => fn());
    },
    // Add a new list and select it
    addList(name) {
        const newList = { id: Date.now().toString(), name, todos: [] };
        this.lists.push(newList);
        this.selectedListId = newList.id;
        this.saveState();
        this.notify();
        return newList.id;
    },
    // Select a list by ID
    selectList(id) {
        this.selectedListId = id;
        this.saveState();
        this.notify();
    },
    // Add a new todo to the selected list
    addTodo(text) {
        const list = this.lists.find(l => l.id === this.selectedListId);
        if (list) {
            list.todos.push({ text, completed: false, editing: false }); // <-- add editing: false
            this.saveState();
            this.notify();
            return list.todos.length - 1;
        }
        return null;
    },
    // Delete a todo by index from the selected list
    deleteTodo(index) {
        const list = this.lists.find(l => l.id === this.selectedListId);
        if (list) {
            list.todos.splice(index, 1);
            this.saveState();
            this.notify();
        }
    },
    // Edit a todo's text and exit edit mode
    editTodo(index, newText) {
        const list = this.lists.find(l => l.id === this.selectedListId);
        if (list && list.todos[index]) {
            list.todos[index].text = newText;
            list.todos[index].editing = false;
            this.saveState();
            this.notify();
        }
    },
    // Edit a list's name and exit edit mode
    editListName(id, newName) {
        const list = this.lists.find(l => l.id === id);
        if (list) {
            list.name = newName;
            list.editing = false;
            this.saveState();
            this.notify();
        }
    },
    // Toggle a todo's completed state
    toggleTodo(index, completed) {
        const list = this.lists.find(l => l.id === this.selectedListId);
        if (list) {
            list.todos[index].completed = completed;
            this.saveState();
            this.notify();
        }
    },
    // Save current state to localStorage
    saveState() {
        const state = {
            lists: this.lists,
            selectedListId: this.selectedListId,
            theme: this.theme
        };
        localStorage.setItem(APP_STATE_KEY, JSON.stringify(state));
    },
    // Load state from localStorage
    loadState() {
        const state = JSON.parse(localStorage.getItem(APP_STATE_KEY) || '{}');
        this.lists = Array.isArray(state.lists) ? state.lists : [];
        this.selectedListId = state.selectedListId || null;
        this.theme = state.theme || 'dark';
    },
    // Change theme and notify listeners
    setTheme(theme) {
        this.theme = theme;
        this.saveState();
        this.notify();
    }
};
// #endregion

// #region Action Dispatcher
// Central function to handle all user actions using a switch statement.
// This keeps logic organized and makes it easy to add new actions.
function dispatchAction(type, payload) {
    switch (type) {
        case 'ADD_LIST': {
            const id = AppState.addList(payload.name);
            if (typeof Callbacks.onListAdded === 'function') Callbacks.onListAdded(id, payload.name);
            break;
        }
        case 'SELECT_LIST': {
            AppState.selectList(payload.id);
            if (typeof Callbacks.onListSelected === 'function') Callbacks.onListSelected(payload.id);
            break;
        }
        case 'EDIT_LIST': {
            AppState.editListName(payload.id, payload.newName);
            if (typeof Callbacks.onListEdited === 'function') Callbacks.onListEdited(payload.id, payload.newName);
            break;
        }
        case 'DELETE_LIST': {
            // Optional: implement list deletion logic and callback
            break;
        }
        case 'ADD_TODO': {
            const index = AppState.addTodo(payload.text);
            if (typeof Callbacks.onTodoAdded === 'function') Callbacks.onTodoAdded(index, payload.text);
            break;
        }
        case 'EDIT_TODO': {
            AppState.editTodo(payload.index, payload.newText);
            if (typeof Callbacks.onTodoEdited === 'function') Callbacks.onTodoEdited(payload.index, payload.newText);
            break;
        }
        case 'DELETE_TODO': {
            AppState.deleteTodo(payload.index);
            if (typeof Callbacks.onTodoDeleted === 'function') Callbacks.onTodoDeleted(payload.index);
            break;
        }
        case 'TOGGLE_TODO': {
            AppState.toggleTodo(payload.index, payload.completed);
            break;
        }
        case 'CHANGE_THEME': {
            AppState.setTheme(payload.theme);
            if (typeof Callbacks.onThemeChanged === 'function') Callbacks.onThemeChanged(payload.theme);
            break;
        }
        case 'BACK_HOME': {
            AppState.selectedListId = null;
            AppState.saveState();
            AppState.notify();
            break;
        }
        default:
            console.warn('Unknown action type:', type);
    }
}
// #endregion

// #region View
// Handles all DOM rendering and updates. This is the "View" in MVC.
const View = {
    todoForm: document.querySelector('form'),           // Reference to the todo form
    todoInput: document.getElementById('todo-input'),   // Input field for new todos
    todoListUL: document.getElementById('todo-list'),   // UL element for todos
    themeToggle: document.getElementById("theme-toggle"), // Theme toggle checkbox
    body: document.body,                               // Reference to <body>
    homepage: null,                                    // Homepage container

    // Render the homepage with all lists and new list creation
    renderHomepage() {
        if (this.todoForm) this.todoForm.style.display = 'none';
        if (this.todoListUL) this.todoListUL.style.display = 'none';
        const backBtn = document.getElementById('back-home-btn');
        if (backBtn) backBtn.style.display = 'none';
        if (!this.homepage) {
            this.homepage = document.createElement('div');
            this.homepage.className = 'homepage';
            this.body.querySelector('.wrapper').appendChild(this.homepage);
        }
        this.homepage.style.display = '';
        this.homepage.innerHTML = '';
        const createListContainer = document.createElement('div');
        createListContainer.className = 'create-list-container';
        if (AppState.lists.length === 0) {
            const emptyMsg = document.createElement('div');
            emptyMsg.className = 'empty-msg';
            emptyMsg.textContent = 'No lists found. Create a new list to continue.';
            createListContainer.appendChild(emptyMsg);
        }
        const newListInput = document.createElement('input');
        newListInput.type = 'text';
        newListInput.placeholder = 'Enter new list name';
        newListInput.className = 'new-list-input';
        const newListBtn = document.createElement('button');
        newListBtn.textContent = 'Create New List';
        newListBtn.className = 'new-list-btn';
        newListBtn.onclick = () => {
            const name = newListInput.value.trim();
            if (name.length > 0) {
                dispatchAction('ADD_LIST', { name });
                newListInput.value = '';
            }
        };
        createListContainer.appendChild(newListInput);
        createListContainer.appendChild(newListBtn);
        this.homepage.appendChild(createListContainer);
        if (AppState.lists.length > 0) {
            const listTitle = document.createElement('h2');
            listTitle.textContent = 'Your Lists';
            this.homepage.appendChild(listTitle);
            const ul = document.createElement('ul');
            ul.className = 'list-selector';
            AppState.lists.forEach(list => {
                const li = document.createElement('li');
                li.className = 'list-item flex-center';
                if (list.editing) {
                    // Edit mode for list name
                    const editInput = document.createElement('input');
                    editInput.type = 'text';
                    editInput.value = list.name;
                    editInput.className = 'edit-input';
                    editInput.autoFocus = true;
                    const saveBtn = document.createElement('button');
                    saveBtn.textContent = 'Save';
                    saveBtn.className = 'save-edit-button';
                    saveBtn.onclick = () => {
                        dispatchAction('EDIT_LIST', { id: list.id, newName: editInput.value.trim() });
                    };
                    li.appendChild(editInput);
                    li.appendChild(saveBtn);
                } else {
                    // Normal mode for list
                    const nameSpan = document.createElement('span');
                    nameSpan.textContent = list.name;
                    nameSpan.style.flexGrow = '1';
                    const editBtn = document.createElement('button');
                    editBtn.className = 'edit-button';
                    editBtn.innerHTML = `<img src="assets/image/edit_24dp_E3E3E3_FILL0_wght400_GRAD0_opsz24.svg" alt="Edit">`;
                    editBtn.onclick = (e) => {
                        e.stopPropagation();
                        // Only one list can be in edit mode at a time
                        AppState.lists.forEach(l => l.editing = false);
                        list.editing = true;
                        AppState.notify();
                    };
                    li.appendChild(nameSpan);
                    li.appendChild(editBtn);
                    li.onclick = (e) => {
                        if (e.target !== editBtn && !editBtn.contains(e.target)) {
                            dispatchAction('SELECT_LIST', { id: list.id });
                        }
                    };
                }
                ul.appendChild(li);
            });
            this.homepage.appendChild(ul);
        }
    },

    // Render todos for the selected list
    renderTodos() {
        if (this.homepage) this.homepage.style.display = 'none';
        if (this.todoForm) this.todoForm.style.display = '';
        if (this.todoListUL) this.todoListUL.style.display = '';
        let backBtn = document.getElementById('back-home-btn');
        if (!backBtn) {
            backBtn = document.createElement('button');
            backBtn.id = 'back-home-btn';
            backBtn.className = 'back-home-btn';
            backBtn.textContent = '← Back to Lists';
            backBtn.onclick = () => dispatchAction('BACK_HOME');
            this.body.querySelector('.wrapper').insertBefore(backBtn, this.todoForm);
        } else {
            backBtn.style.display = '';
        }
        this.todoListUL.innerHTML = '';
        const list = AppState.lists.find(l => l.id === AppState.selectedListId);
        if (!list) return;
        console.log(list.todos.map(t => t.editing)); // Add this before rendering todos
        list.todos.forEach((todo, i) => {
            const todoId = 'todo-' + i;
            const todoLI = document.createElement('li');
            todoLI.className = 'todo';
            if (todo.editing) {
                // Edit mode for todo
                const editInput = document.createElement('input');
                editInput.type = 'text';
                editInput.value = todo.text;
                editInput.className = 'edit-input';
                editInput.autofocus = true;
                const saveBtn = document.createElement('button');
                saveBtn.textContent = 'Save';
                saveBtn.className = 'save-edit-button';
                saveBtn.onclick = () => {
                    dispatchAction('EDIT_TODO', { index: i, newText: editInput.value.trim() });
                };
                // Append input first, then save button
                todoLI.appendChild(editInput);
                todoLI.appendChild(saveBtn);
            } else {
                // Normal mode for todo
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.id = todoId;
                checkbox.checked = todo.completed;
                const customCheckbox = document.createElement('label');
                customCheckbox.htmlFor = todoId;
                customCheckbox.className = 'custom-checkbox';
                customCheckbox.innerHTML = `<img src="assets/image/check_24dp_E3E3E3_FILL0_wght400_GRAD0_opsz24.svg" alt="">`;
                const todoText = document.createElement('label');
                todoText.htmlFor = todoId;
                todoText.className = 'todo-text';
                todoText.textContent = todo.text;
                const editBtn = document.createElement('button');
                editBtn.className = 'edit-button';
                editBtn.innerHTML = `<img src="assets/image/edit_24dp_E3E3E3_FILL0_wght400_GRAD0_opsz24.svg" alt="Edit">`;
                editBtn.onclick = (e) => {
                    e.stopPropagation();
                    // Only one todo can be in edit mode at a time
                    list.todos.forEach(t => t.editing = false);
                    todo.editing = true;
                    AppState.notify();
                };
                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'delete-button';
                deleteBtn.innerHTML = `<img src="assets/image/delete_24dp_000000.svg" alt="">`;
                deleteBtn.addEventListener('click', () => {
                    dispatchAction('DELETE_TODO', { index: i });
                });
                checkbox.addEventListener('change', () => {
                    dispatchAction('TOGGLE_TODO', { index: i, completed: checkbox.checked });
                });
                todoLI.appendChild(checkbox);
                todoLI.appendChild(customCheckbox);
                todoLI.appendChild(todoText);
                todoLI.appendChild(editBtn);
                todoLI.appendChild(deleteBtn);
            }
            View.todoListUL.appendChild(todoLI);
        });
    },

    // Render the theme (light/dark) based on app state
    renderTheme() {
        if (AppState.theme === "light") {
            this.body.classList.add("light-theme");
            this.themeToggle.checked = true;
        } else {
            this.body.classList.remove("light-theme");
            this.themeToggle.checked = false;
        }
    }
};
// #endregion

// #region Controller
// Handles app startup and event listener registration.
// Ensures initialization only happens once.
const Controller = {
    _initialized: false, // Prevents multiple init calls

    init() {
        if (this._initialized) return; // Only run once
        this._initialized = true;

        AppState.loadState();
        View.renderTheme();
        if (!AppState.selectedListId) {
            View.renderHomepage();
        } else {
            View.renderTodos();
        }
        // Subscribe to state changes and re-render UI
        AppState.subscribe(() => {
            if (!AppState.selectedListId) {
                View.renderHomepage();
            } else {
                View.renderTodos();
            }
            View.renderTheme();
        });
        // Handle new todo submission
        View.todoForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const text = View.todoInput.value.trim();
            if (text.length > 0) {
                dispatchAction('ADD_TODO', { text });
                View.todoInput.value = '';
            }
        });
        // Handle theme toggle
        View.themeToggle.addEventListener("change", () => {
            const newTheme = View.body.classList.contains("light-theme") ? "dark" : "light";
            dispatchAction('CHANGE_THEME', { theme: newTheme });
        });
    }
};
// #endregion

// #region Init App
// Shows a loading screen before initializing the app UI
function showLoadingScreen() {
    let loading = document.getElementById('loading-screen');
    if (!loading) {
        loading = document.createElement('div');
        loading.id = 'loading-screen';
        loading.className = 'loading-screen';
        loading.innerHTML = `
            <div class="loading-content">
                <div class="logo-placeholder">
                    <svg width="7rem" height="7rem" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="50" cy="50" r="50" fill="var(--accent-color)" />
                        <text x="50" y="58" text-anchor="middle" fill="var(--background)" font-size="2.7rem" font-family="Segoe UI, Arial" dy=".3em" dominant-baseline="middle">TDA</text>
                    </svg>
                </div>
                <h1 class="loading-title">ToDoApp</h1>
                <div class="loading-spinner"></div>
            </div>
        `;
        document.body.appendChild(loading);
    }
    loading.style.display = '';
}

// Hides the loading screen
function hideLoadingScreen() {
    const loading = document.getElementById('loading-screen');
    if (loading) loading.style.display = 'none';
}

// Loads the homepage after loading screen
function loadHomepage(data) {
    hideLoadingScreen();
    View.renderHomepage();
}

// Show loading screen, then initialize app after 2-5 seconds
showLoadingScreen();
setTimeout(() => {
    Controller.init();
    loadHomepage(AppState.lists);
}, Math.floor(Math.random() * 3000) + 2000);
// #endregion

// Example usage of callbacks for debugging and extension
setOnListSelected((id) => {
    console.log('List selected:', id);
});
setOnTodoEdited((index, newText) => {
    console.log('Todo edited:', index, newText);
});
setOnThemeChanged((theme) => {
    console.log('Theme changed:', theme);
});
setOnListEdited((id, newName) => {
    console.log('List name edited:', id, newName);
});

