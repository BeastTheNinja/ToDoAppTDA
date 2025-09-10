// #region Callbacks
// Central registry for callback functions triggered by key app events.
// These allow you to hook into app logic for analytics, UI feedback, etc.
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
// Holds all app data and methods to manipulate it.
const APP_STATE_KEY = 'appState';
const AppState = {
    lists: [],
    selectedListId: null,
    theme: 'dark',
    listeners: [],
    uiState: 'loading', // Tracks current UI state: 'loading', 'homepage', 'list'

    subscribe(fn) {
        this.listeners.push(fn);
    },
    notify() {
        this.listeners.forEach(fn => fn());
    },
    addList(name) {
        const newList = { id: Date.now().toString(), name, todos: [] };
        this.lists.push(newList);
        this.selectedListId = newList.id;
        this.saveState();
        this.notify();
        return newList.id;
    },
    selectList(id) {
        this.selectedListId = id;
        this.saveState();
        this.notify();
    },
    addTodo(text) {
        const list = this.lists.find(l => l.id === this.selectedListId);
        if (list) {
            list.todos.push({ text, completed: false, editing: false });
            this.saveState();
            this.notify();
            return list.todos.length - 1;
        }
        return null;
    },
    deleteTodo(index) {
        const list = this.lists.find(l => l.id === this.selectedListId);
        if (list) {
            list.todos.splice(index, 1);
            this.saveState();
            this.notify();
        }
    },
    editTodo(index, newText) {
        const list = this.lists.find(l => l.id === this.selectedListId);
        if (list && list.todos[index]) {
            list.todos[index].text = newText;
            list.todos[index].editing = false;
            this.saveState();
            this.notify();
        }
    },
    editListName(id, newName) {
        const list = this.lists.find(l => l.id === id);
        if (list) {
            list.name = newName;
            list.editing = false;
            this.saveState();
            this.notify();
        }
    },
    toggleTodo(index, completed) {
        const list = this.lists.find(l => l.id === this.selectedListId);
        if (list) {
            list.todos[index].completed = completed;
            this.saveState();
            this.notify();
        }
    },
    saveState() {
        const state = {
            lists: this.lists,
            selectedListId: this.selectedListId,
            theme: this.theme
        };
        localStorage.setItem(APP_STATE_KEY, JSON.stringify(state));
    },
    loadState() {
        const state = JSON.parse(localStorage.getItem(APP_STATE_KEY) || '{}');
        this.lists = Array.isArray(state.lists) ? state.lists : [];
        this.selectedListId = state.selectedListId || null;
        this.theme = state.theme || 'dark';
    },
    setTheme(theme) {
        this.theme = theme;
        this.saveState();
        this.notify();
    }
};
// #endregion

// #region Action Dispatcher
// Handles all user actions using a switch statement.
function dispatchAction(type, payload) {
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
            // Optional: implement list deletion logic and callback
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
// #endregion

// #region View
// Handles all DOM rendering and updates.
const View = {
    todoForm: document.querySelector('form'),
    todoInput: document.getElementById('todo-input'),
    todoListUL: document.getElementById('todo-list'),
    themeToggle: document.getElementById("theme-toggle"),
    body: document.body,
    homepage: null,

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
        newListInput.setAttribute('aria-label', 'New list name'); // ARIA label
        const newListBtn = document.createElement('button');
        newListBtn.textContent = 'Create New List';
        newListBtn.className = 'new-list-btn';
        newListBtn.setAttribute('aria-label', 'Create new list'); // ARIA label
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
            ul.setAttribute('role', 'list'); // ARIA role
            AppState.lists.forEach(list => {
                const li = document.createElement('li');
                li.className = 'list-item flex-center';
                li.setAttribute('role', 'listitem'); // ARIA role
                if (list.editing) {
                    // Edit mode for list name
                    const editInput = document.createElement('input');
                    editInput.type = 'text';
                    editInput.value = list.name;
                    editInput.className = 'edit-input';
                    editInput.autoFocus = true;
                    editInput.setAttribute('aria-label', 'Edit list name'); // ARIA label
                    const saveBtn = document.createElement('button');
                    saveBtn.textContent = 'Save';
                    saveBtn.className = 'save-edit-button';
                    saveBtn.setAttribute('aria-label', 'Save edited list name'); // ARIA label
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
                    editBtn.setAttribute('aria-label', 'Edit list'); // ARIA label
                    editBtn.onclick = (e) => {
                        e.stopPropagation();
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
            backBtn.setAttribute('aria-label', 'Back to lists'); // ARIA label
            backBtn.onclick = () => dispatchAction('BACK_HOME');
            this.body.querySelector('.wrapper').insertBefore(backBtn, this.todoForm);
        } else {
            backBtn.style.display = '';
        }
        this.todoListUL.innerHTML = '';
        const list = AppState.lists.find(l => l.id === AppState.selectedListId);
        if (!list) return;
        list.todos.forEach((todo, i) => {
            const todoId = 'todo-' + i;
            const todoLI = document.createElement('li');
            todoLI.className = 'todo';
            todoLI.setAttribute('role', 'listitem'); // ARIA role
            if (todo.editing) {
                // Edit mode for todo
                const editInput = document.createElement('input');
                editInput.type = 'text';
                editInput.value = todo.text;
                editInput.className = 'edit-input';
                editInput.autofocus = true;
                editInput.setAttribute('aria-label', 'Edit todo text'); // ARIA label
                const saveBtn = document.createElement('button');
                saveBtn.textContent = 'Save';
                saveBtn.className = 'save-edit-button';
                saveBtn.setAttribute('aria-label', 'Save edited todo'); // ARIA label
                saveBtn.onclick = () => {
                    dispatchAction('EDIT_TODO', { index: i, newText: editInput.value.trim() });
                };
                todoLI.appendChild(editInput);
                todoLI.appendChild(saveBtn);
            } else {
                // Normal mode for todo
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.id = todoId;
                checkbox.checked = todo.completed;
                checkbox.setAttribute('aria-label', 'Mark todo as completed'); // ARIA label
                const customCheckbox = document.createElement('label');
                customCheckbox.htmlFor = todoId;
                customCheckbox.className = 'custom-checkbox';
                customCheckbox.innerHTML = `<img src="assets/image/check_24dp_E3E3E3_FILL0_wght400_GRAD0_opsz24.svg" alt="">`;
                const todoText = document.createElement('label');
                todoText.htmlFor = todoId;
                todoText.className = 'todo-text';
                todoText.textContent = todo.text;
                todoText.setAttribute('aria-label', 'Todo text'); // ARIA label
                const editBtn = document.createElement('button');
                editBtn.className = 'edit-button';
                editBtn.innerHTML = `<img src="assets/image/edit_24dp_E3E3E3_FILL0_wght400_GRAD0_opsz24.svg" alt="Edit">`;
                editBtn.setAttribute('aria-label', 'Edit todo'); // ARIA label
                editBtn.onclick = (e) => {
                    e.stopPropagation();
                    list.todos.forEach(t => t.editing = false);
                    todo.editing = true;
                    AppState.notify();
                };
                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'delete-button';
                deleteBtn.innerHTML = `<img src="assets/image/delete_24dp_000000.svg" alt="">`;
                deleteBtn.setAttribute('aria-label', 'Delete todo'); // ARIA label
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

    renderTheme() {
        if (AppState.theme === "light") {
            this.body.classList.add("light-theme");
            this.themeToggle.checked = true;
        } else {
            this.body.classList.remove("light-theme");
            this.themeToggle.checked = false;
        }
    },

    renderLoadingScreen() {
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
    },

    hideLoadingScreen() {
        const loading = document.getElementById('loading-screen');
        if (loading) loading.style.display = 'none';
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
        AppState.uiState = AppState.selectedListId ? 'list' : 'homepage';
        View.renderTheme();

        // Main render logic based on UI state
        AppState.subscribe(() => {
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
            View.renderTheme();
        });

        View.todoForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const text = View.todoInput.value.trim();
            if (text.length > 0) {
                dispatchAction('ADD_TODO', { text });
                View.todoInput.value = '';
            }
        });

        View.themeToggle.addEventListener("change", () => {
            const newTheme = View.body.classList.contains("light-theme") ? "dark" : "light";
            dispatchAction('CHANGE_THEME', { theme: newTheme });
        });
    }
};
// #endregion

// #region Init App
View.renderLoadingScreen();
setTimeout(() => {
    Controller.init();
    AppState.uiState = AppState.selectedListId ? 'list' : 'homepage';
    AppState.notify();
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

