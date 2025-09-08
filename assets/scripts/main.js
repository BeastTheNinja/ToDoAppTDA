
// -------------------- App State (Model) --------------------
// Central state management for lists, todos, and theme
const APP_STATE_KEY = 'appState';
const AppState = {
    lists: [], // Array of list objects {id, name, todos: [{text, completed}]}
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
    addList(name) {
        const newList = { id: Date.now().toString(), name, todos: [] };
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
    addTodo(text) {
        const list = this.lists.find(l => l.id === this.selectedListId);
        if (list) {
            list.todos.push({ text, completed: false });
            this.saveState();
            this.notify();
        }
    },
    // Remove a todo from the selected list by index
    deleteTodo(index) {
        const list = this.lists.find(l => l.id === this.selectedListId);
        if (list) {
            list.todos.splice(index, 1);
            this.saveState();
            this.notify();
        }
    },
    // Toggle the completed state of a todo in the selected list
    toggleTodo(index, completed) {
        const list = this.lists.find(l => l.id === this.selectedListId);
        if (list) {
            list.todos[index].completed = completed;
            this.saveState();
            this.notify();
        }
    },
    // Save the current app state to localStorage
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

// -------------------- View --------------------
// Handles all DOM updates and rendering
// Possible feature: animations, filters, search, or custom themes
const View = {
    todoForm: document.querySelector('form'), // The form for adding todos
    todoInput: document.getElementById('todo-input'), // Input field for new todo
    todoListUL: document.getElementById('todo-list'), // UL element for todo list
    themeToggle: document.getElementById("theme-toggle"), // Theme toggle switch
    body: document.body, // Reference to <body>
    homepage: null, // Will be created dynamically
    // Render homepage with all lists
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
                li.className = 'list-item';
                li.textContent = list.name;
                li.onclick = () => Controller.handleSelectList(list.id);
                ul.appendChild(li);
            });
            this.homepage.appendChild(ul);
        }
    },
    // Render todos for the selected list
    renderTodos() {
        // Hide homepage if present
        if (this.homepage) this.homepage.style.display = 'none';
        // Show form and todo list
        if (this.todoForm) this.todoForm.style.display = '';
        if (this.todoListUL) this.todoListUL.style.display = '';
        // Show back button above the todo list
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
            todoLI.innerHTML = `
                <input type="checkbox" id="${todoId}">
                <label for="${todoId}" class="custom-checkbox">
                    <img src="assets/image/check_24dp_E3E3E3_FILL0_wght400_GRAD0_opsz24.svg" alt="">
                </label>
                <label for="${todoId}" class="todo-text">${todo.text}</label>
                <button class="delete-button">
                    <img src="assets/image/delete_24dp_000000.svg" alt="">
                </button>
            `;
            // Delete button: removes todo
            todoLI.querySelector('.delete-button').addEventListener('click', () => {
                Controller.handleDelete(i);
            });
            // Checkbox: toggles completed state
            const checkbox = todoLI.querySelector('input');
            checkbox.checked = todo.completed;
            checkbox.addEventListener('change', () => {
                Controller.handleToggle(i, checkbox.checked);
            });
            this.todoListUL.appendChild(todoLI);
        });
    },
    // ...existing code...
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

// -------------------- Controller --------------------
// Handles user interactions and connects Model and View
// Possible feature: undo/redo, bulk actions, keyboard shortcuts
const Controller = {
    // Initialize the app, set up listeners and render UI
    init() {
        AppState.loadState();
        View.renderTheme();
        // If no list selected, show homepage
        if (!AppState.selectedListId) {
            View.renderHomepage();
        } else {
            View.renderTodos();
        }
        // Update view when state changes
        AppState.subscribe(() => {
            if (!AppState.selectedListId) {
                View.renderHomepage();
            } else {
                View.renderTodos();
            }
            View.renderTheme();
        });
        // Add todo on form submit
        View.todoForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAdd();
        });
        // Toggle theme on switch
        View.themeToggle.addEventListener("change", () => {
            const newTheme = View.body.classList.contains("light-theme") ? "dark" : "light";
            AppState.setTheme(newTheme);
        });
    },
    // Handle creating a new list (now receives name from input)
    handleCreateList(name) {
        if (name && name.trim().length > 0) {
            AppState.addList(name.trim());
        }
    },
    // Handle selecting a list
    handleSelectList(id) {
        AppState.selectList(id);
    },
    // Handle adding a new todo from input
    handleAdd() {
        const text = View.todoInput.value.trim();
        if (text.length > 0) {
            AppState.addTodo(text);
            View.todoInput.value = '';
        }
    },
    // Handle deleting a todo by index
    handleDelete(index) {
        AppState.deleteTodo(index);
    },
    // Handle toggling completed state for a todo
    handleToggle(index, completed) {
        AppState.toggleTodo(index, completed);
    },
    // Handle going back to homepage (list selector)
    handleBackToHomepage() {
        AppState.selectedListId = null;
        AppState.saveState();
        AppState.notify();
        // Hide back button after going back
        const backBtn = document.getElementById('back-home-btn');
        if (backBtn) backBtn.style.display = 'none';
    }
};

// -------------------- Init App --------------------
// Start the application
Controller.init();

