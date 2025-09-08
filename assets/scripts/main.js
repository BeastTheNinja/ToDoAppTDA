
// -------------------- App State (Model) --------------------
// Central state management for todos and theme
// Possible feature: add user profiles, due dates, priorities, or tags to todos
const APP_STATE_KEY = 'appState';
const AppState = {
    todos: [], // Array of todo objects {text, completed}
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
    // Add a new todo item to the list
    addTodo(text) {
        this.todos.push({ text, completed: false });
        this.saveState();
        this.notify();
    },
    // Remove a todo item by its index
    deleteTodo(index) {
        this.todos.splice(index, 1);
        this.saveState();
        this.notify();
    },
    // Toggle the completed state of a todo
    toggleTodo(index, completed) {
        this.todos[index].completed = completed;
        this.saveState();
        this.notify();
    },
    // Save the current app state to localStorage
    saveState() {
        const state = {
            todos: this.todos,
            theme: this.theme
        };
        localStorage.setItem(APP_STATE_KEY, JSON.stringify(state));
    },
    // Load app state from localStorage
    loadState() {
        const state = JSON.parse(localStorage.getItem(APP_STATE_KEY) || '{}');
        this.todos = Array.isArray(state.todos) ? state.todos : [];
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
    // Render all todos in the list
    renderTodos() {
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

// -------------------- Controller --------------------
// Handles user interactions and connects Model and View
// Possible feature: undo/redo, bulk actions, keyboard shortcuts
const Controller = {
    // Initialize the app, set up listeners and render UI
    init() {
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
    }
};

// -------------------- Init App --------------------
// Start the application
Controller.init();

