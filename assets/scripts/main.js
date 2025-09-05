
// -------------------- App State (Model) --------------------
// Central state management for todos and theme
// Possible feature: add user profiles, due dates, priorities, or tags to todos
const APP_STATE_KEY = 'appState';
const AppState = {
    todos: [], // Array of todo objects {text, completed}
    theme: 'dark', // Current theme ('dark' or 'light')
    listeners: [], // Functions to call when state changes
    subscribe(fn) {
        // Add a function to be called on state change
        this.listeners.push(fn);
    },
    notify() {
        // Call all subscribed functions
        this.listeners.forEach(fn => fn());
    },
    addTodo(text) {
        // Add a new todo item
        this.todos.push({ text, completed: false });
        this.saveState();
        this.notify();
    },
    deleteTodo(index) {
        // Remove a todo by index
        this.todos.splice(index, 1);
        this.saveState();
        this.notify();
    },
    toggleTodo(index, completed) {
        // Mark a todo as completed or not
        this.todos[index].completed = completed;
        this.saveState();
        this.notify();
    },
    saveState() {
        // Save the whole app state to localStorage
        const state = {
            todos: this.todos,
            theme: this.theme
        };
        localStorage.setItem(APP_STATE_KEY, JSON.stringify(state));
    },
    loadState() {
        // Load app state from localStorage
        const state = JSON.parse(localStorage.getItem(APP_STATE_KEY) || '{}');
        this.todos = Array.isArray(state.todos) ? state.todos : [];
        this.theme = state.theme || 'dark';
    },
    setTheme(theme) {
        // Change theme and save
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
    renderTodos() {
        // Render all todos in the list
        this.todoListUL.innerHTML = '';
        AppState.todos.forEach((todo, i) => {
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
    renderTheme() {
        // Update theme based on app state
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
    init() {
        // Initialize app: load state, render UI, set up listeners
        AppState.loadState();
        View.renderTheme();
        View.renderTodos();
        // Update view when state changes
        AppState.subscribe(() => {
            View.renderTodos();
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
    handleAdd() {
        // Add a new todo from input
        const text = View.todoInput.value.trim();
        if (text.length > 0) {
            AppState.addTodo(text);
            View.todoInput.value = '';
        }
    },
    handleDelete(index) {
        // Delete a todo by index
        AppState.deleteTodo(index);
    },
    handleToggle(index, completed) {
        // Toggle completed state for a todo
        AppState.toggleTodo(index, completed);
    }
};

// -------------------- Init App --------------------
// Start the application
Controller.init();

