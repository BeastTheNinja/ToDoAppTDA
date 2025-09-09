// #region Callbacks
// Central callback registry for key events
const Callbacks = {
    onListSelected: null,
    onTodoEdited: null,
    onThemeChanged: null,
    onListEdited: null, // NEW
    // Add more as needed
};

// Setter functions for callbacks
function setOnListSelected(fn) { Callbacks.onListSelected = fn; }
function setOnTodoEdited(fn) { Callbacks.onTodoEdited = fn; }
function setOnThemeChanged(fn) { Callbacks.onThemeChanged = fn; }
function setOnListEdited(fn) { Callbacks.onListEdited = fn; } // NEW
// #endregion
// #region App State (Model)
// Central state management for lists, todos, and theme
// Possible features:
// - Deadlines for items (add 'deadline' property to todos)
// - Color coding/tags for lists/items (add 'color' or 'tags' property)
// - Sorting/filtering (sort by deadline, status, etc.)
// - List renaming, confirmation before delete
// - Bulk actions, starred/important items
// - Data export/import (JSON/CSV)
// - Accessibility: ARIA labels, keyboard navigation
const APP_STATE_KEY = 'appState';
const AppState = {
    lists: [], // Array of list objects {id, name, todos: [{text, completed, deadline, tags, color, important}]}
    selectedListId: null, // Currently selected list id
    theme: 'dark', // Current theme ('dark' or 'light')
    listeners: [], // Functions to call when state changes
    // Subscribe a function to state changes
    subscribe(fn) {
        this.listeners.push(fn);
    },
    // Notify all listeners about state change
    notify() {
        this.listeners.forEach(fn => fn());
    },
    // Add a new list
    // Possible feature: allow user to pick color/tags for list
    addList(name) {
        const newList = { id: Date.now().toString(), name, todos: [] /* color, tags */ };
        this.lists.push(newList);
        this.selectedListId = newList.id;
        this.saveState();
        this.notify();
    },
    // Select a list by id
    selectList(id) {
        this.selectedListId = id;
        this.saveState();
        this.notify();
    },
    // Add a new todo to the selected list
    // Possible feature: add deadline, tags, color, important/starred
    addTodo(text) {
        const list = this.lists.find(l => l.id === this.selectedListId);
        if (list) {
            list.todos.push({ text, completed: false /*, deadline, tags, color, important */ });
            this.saveState();
            this.notify();
        }
    },
    // Remove a todo from the selected list by index
    // Possible feature: bulk delete, confirmation dialog
    deleteTodo(index) {
        const list = this.lists.find(l => l.id === this.selectedListId);
        if (list) {
            list.todos.splice(index, 1);
            this.saveState();
            this.notify();
        }
    },
    // Edit a todo's text by index
    editTodo(index, newText) {
        const list = this.lists.find(l => l.id === this.selectedListId);
        if (list && list.todos[index]) {
            list.todos[index].text = newText;
            list.todos[index].editing = false; // Exit edit mode
            this.saveState();
            this.notify();
            // Callback for todo edit
            if (typeof Callbacks.onTodoEdited === 'function') {
                Callbacks.onTodoEdited(index, newText);
            }
        }
    },
    // Edit a list's name by id
    editListName(id, newName) {
        const list = this.lists.find(l => l.id === id);
        if (list) {
            list.name = newName;
            list.editing = false; // Exit edit mode
            this.saveState();
            this.notify();
            // Callback for list name edit
            if (typeof Callbacks.onListEdited === 'function') {
                Callbacks.onListEdited(id, newName);
            }
        }
    },
    // Toggle the completed state of a todo in the selected list
    // Possible feature: mark as important/starred
    toggleTodo(index, completed) {
        const list = this.lists.find(l => l.id === this.selectedListId);
        if (list) {
            list.todos[index].completed = completed;
            this.saveState();
            this.notify();
        }
    },
    // Save the current app state to localStorage
    // Possible feature: export/import data
    saveState() {
        const state = {
            lists: this.lists,
            selectedListId: this.selectedListId,
            theme: this.theme
        };
        localStorage.setItem(APP_STATE_KEY, JSON.stringify(state));
    },
    // Load app state from localStorage
    loadState() {
        const state = JSON.parse(localStorage.getItem(APP_STATE_KEY) || '{}');
        this.lists = Array.isArray(state.lists) ? state.lists : [];
        this.selectedListId = state.selectedListId || null;
        this.theme = state.theme || 'dark';
    },
    // Set the theme and update state
    setTheme(theme) {
        this.theme = theme;
        this.saveState();
        this.notify();
    }
};

// #endregion

// #region View
// Handles all DOM updates and rendering
// Possible features:
// - Animations for adding/removing items/lists
// - Filters/search bar for tasks
// - Color/tag indicators in UI
// - Sorting options (dropdown)
// - Accessibility: ARIA labels, keyboard navigation
const View = {
    todoForm: document.querySelector('form'), // The form for adding todos
    todoInput: document.getElementById('todo-input'), // Input field for new todo
    todoListUL: document.getElementById('todo-list'), // UL element for todo list
    themeToggle: document.getElementById("theme-toggle"), // Theme toggle switch
    body: document.body, // Reference to <body>
    homepage: null, // Will be created dynamically
    // Render homepage with all lists
    // Render homepage with all lists and new list creation
    // Possible feature: show summary (number of tasks, completed, etc.)
    renderHomepage() {
        // Hide todo form and list
        if (this.todoForm) this.todoForm.style.display = 'none';
        if (this.todoListUL) this.todoListUL.style.display = 'none';
        // Hide back button if present
        const backBtn = document.getElementById('back-home-btn');
        if (backBtn) backBtn.style.display = 'none';
        // Create homepage container if not exists
        if (!this.homepage) {
            this.homepage = document.createElement('div');
            this.homepage.className = 'homepage';
            this.body.querySelector('.wrapper').appendChild(this.homepage);
        }
        this.homepage.style.display = '';
        this.homepage.innerHTML = '';
        // If no lists, show empty state
        const createListContainer = document.createElement('div');
        createListContainer.className = 'create-list-container';
        if (AppState.lists.length === 0) {
            const emptyMsg = document.createElement('div');
            emptyMsg.className = 'empty-msg';
            emptyMsg.textContent = 'No lists found. Create a new list to continue.';
            createListContainer.appendChild(emptyMsg);
        }
        // Add text field and button for new list creation
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
                Controller.handleCreateList(name);
                newListInput.value = '';
            }
        };
        createListContainer.appendChild(newListInput);
        createListContainer.appendChild(newListBtn);
        this.homepage.appendChild(createListContainer);
        // Show all lists if any
        if (AppState.lists.length > 0) {
            const listTitle = document.createElement('h2');
            listTitle.textContent = 'Your Lists';
            this.homepage.appendChild(listTitle);
            const ul = document.createElement('ul');
            ul.className = 'list-selector';
            AppState.lists.forEach(list => {
                const li = document.createElement('li');
                li.className = 'list-item flex-center';
                li.style.display = 'flex';
                li.style.alignItems = 'center';
                if (list.editing) {
                    const editInput = document.createElement('input');
                    editInput.type = 'text';
                    editInput.value = list.name;
                    editInput.className = 'edit-input';
                    editInput.autoFocus = true;
                    const saveBtn = document.createElement('button');
                    saveBtn.textContent = 'Save';
                    saveBtn.className = 'save-edit-button';
                    saveBtn.onclick = () => {
                        Controller.handleSaveListEdit(list.id, editInput.value.trim());
                    };
                    li.appendChild(editInput);
                    li.appendChild(saveBtn);
                } else {
                    const nameSpan = document.createElement('span');
                    nameSpan.textContent = list.name;
                    nameSpan.style.flexGrow = '1';
                    const editBtn = document.createElement('button');
                    editBtn.className = 'edit-button';
                    editBtn.innerHTML = `<img src="assets/image/edit_24dp_E3E3E3_FILL0_wght400_GRAD0_opsz24.svg" alt="Edit">`;
                    editBtn.onclick = (e) => {
                        e.stopPropagation();
                        Controller.handleEditList(list.id);
                    };
                    li.appendChild(nameSpan);
                    li.appendChild(editBtn);
                    li.onclick = (e) => {
                        if (e.target !== editBtn && !editBtn.contains(e.target)) {
                            Controller.handleSelectList(list.id);
                        }
                    };
                }
                ul.appendChild(li);
            });
            this.homepage.appendChild(ul);
        }
    },
    // Render todos for the selected list
    // Render todos for the selected list
    // Possible feature: show deadline, tags, color, important/starred, sorting/filtering
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
            backBtn.onclick = () => Controller.handleBackToHomepage();
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

            if (todo.editing) {
                // Edit mode: show input and save button
                const editInput = document.createElement('input');
                editInput.type = 'text';
                editInput.value = todo.text;
                editInput.className = 'edit-input';
                editInput.autoFocus = true;
                const saveBtn = document.createElement('button');
                saveBtn.textContent = 'Save';
                saveBtn.className = 'save-edit-button';
                saveBtn.onclick = () => {
                    Controller.handleSaveTodoEdit(i, editInput.value.trim());
                };
                todoLI.appendChild(editInput);
                todoLI.appendChild(saveBtn);
            } else {
                // Normal mode
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
                    Controller.handleEditTodo(i);
                };
                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'delete-button';
                deleteBtn.innerHTML = `<img src="assets/image/delete_24dp_000000.svg" alt="">`;
                deleteBtn.addEventListener('click', () => {
                    Controller.handleDelete(i);
                });
                checkbox.addEventListener('change', () => {
                    Controller.handleToggle(i, checkbox.checked);
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
    //  Render the theme (light/dark) based on app state
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
// Handles user interactions and connects Model and View
const Controller = {
    handleSelectList(id) {
        AppState.selectList(id);
        if (typeof Callbacks.onListSelected === 'function') {
            Callbacks.onListSelected(id);
        }
    },

    handleSaveTodoEdit(index, newText) {
        if (newText.length > 0) {
            AppState.editTodo(index, newText);
        } else {
            const list = AppState.lists.find(l => l.id === AppState.selectedListId);
            if (list && list.todos[index]) list.todos[index].editing = false;
            AppState.notify();
        }
    },

    init() {
        AppState.loadState();
        View.renderTheme();
        if (!AppState.selectedListId) {
            View.renderHomepage();
        } else {
            View.renderTodos();
        }
        AppState.subscribe(() => {
            if (!AppState.selectedListId) {
                View.renderHomepage();
            } else {
                View.renderTodos();
            }
            View.renderTheme();
        });
        View.todoForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAdd();
        });
        View.themeToggle.addEventListener("change", () => {
            const newTheme = View.body.classList.contains("light-theme") ? "dark" : "light";
            AppState.setTheme(newTheme);
            if (typeof Callbacks.onThemeChanged === 'function') {
                Callbacks.onThemeChanged(newTheme);
            }
        });
    },

    handleCreateList(name) {
        if (name && name.trim().length > 0) {
            AppState.addList(name.trim());
        }
    },

    handleAdd() {
        const text = View.todoInput.value.trim();
        if (text.length > 0) {
            AppState.addTodo(text);
            View.todoInput.value = '';
        }
    },

    handleDelete(index) {
        AppState.deleteTodo(index);
    },

    handleToggle(index, completed) {
        AppState.toggleTodo(index, completed);
    },

    handleBackToHomepage() {
        AppState.selectedListId = null;
        AppState.saveState();
        AppState.notify();
        const backBtn = document.getElementById('back-home-btn');
        if (backBtn) backBtn.style.display = 'none';
    },

    handleEditList(id) {
        const list = AppState.lists.find(l => l.id === id);
        if (list) {
            list.editing = true;
            AppState.notify();
        }
    },

    handleEditTodo(index) {
        const list = AppState.lists.find(l => l.id === AppState.selectedListId);
        if (list && list.todos[index]) {
            list.todos[index].editing = true;
            AppState.notify();
        }
    },

    handleSaveListEdit(id, newName) {
        if (newName.length > 0) {
            AppState.editListName(id, newName);
        } else {
            const list = AppState.lists.find(l => l.id === id);
            if (list) list.editing = false;
            AppState.notify();
        }
    },
};
// #endregion

// #region Init App
// Loading screen logic
function showLoadingScreen() {
    // Create loading screen if not exists
    let loading = document.getElementById('loading-screen');
    if (!loading) {
        loading = document.createElement('div');
        loading.id = 'loading-screen';
        loading.className = 'loading-screen';
        loading.innerHTML = `
            <div class="loading-content">
                <div class="logo-placeholder">
                    <!-- SVG for TDA logo, fills circle and centers text -->
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

function hideLoadingScreen() {
    const loading = document.getElementById('loading-screen');
    if (loading) loading.style.display = 'none';
}

function loadHomepage(data) {
    hideLoadingScreen();
    View.renderHomepage();
}

// Start the application with loading screen
showLoadingScreen();
setTimeout(() => {
    Controller.init();
    // Pass lists data to loadHomepage
    loadHomepage(AppState.lists);
}, Math.floor(Math.random() * 3000) + 2000); // 2-5 seconds
// #endregion


// Example usage of callbacks and checking they work
// setOnListSelected((id) => {
//     console.log('List selected:', id);
// });
// setOnTodoEdited((index, newText) => {
//     console.log('Todo edited:', index, newText);
// });
// setOnThemeChanged((theme) => {
//     console.log('Theme changed:', theme);
// });
// setOnListEdited((id, newName) => {
//     console.log('List name edited:', id, newName);
// });

