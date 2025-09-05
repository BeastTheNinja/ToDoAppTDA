
// -------------------- App State (Model) --------------------
const AppState = {
    todos: [],
    theme: localStorage.getItem("theme") || "dark",
    listeners: [],
    subscribe(fn) {
        this.listeners.push(fn);
    },
    notify() {
        this.listeners.forEach(fn => fn());
    },
    addTodo(text) {
        this.todos.push({ text, completed: false });
        this.saveTodos();
        this.notify();
    },
    deleteTodo(index) {
        this.todos.splice(index, 1);
        this.saveTodos();
        this.notify();
    },
    toggleTodo(index, completed) {
        this.todos[index].completed = completed;
        this.saveTodos();
        this.notify();
    },
    saveTodos() {
        localStorage.setItem('todos', JSON.stringify(this.todos));
    },
    loadTodos() {
        this.todos = JSON.parse(localStorage.getItem('todos') || '[]');
    },
    setTheme(theme) {
        this.theme = theme;
        localStorage.setItem("theme", theme);
        this.notify();
    }
};

// -------------------- View --------------------
const View = {
    todoForm: document.querySelector('form'),
    todoInput: document.getElementById('todo-input'),
    todoListUL: document.getElementById('todo-list'),
    themeToggle: document.getElementById("theme-toggle"),
    body: document.body,
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
            // Delete button
            todoLI.querySelector('.delete-button').addEventListener('click', () => {
                Controller.handleDelete(i);
            });
            // Checkbox
            const checkbox = todoLI.querySelector('input');
            checkbox.checked = todo.completed;
            checkbox.addEventListener('change', () => {
                Controller.handleToggle(i, checkbox.checked);
            });
            this.todoListUL.appendChild(todoLI);
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
    }
};

// -------------------- Controller --------------------
const Controller = {
    init() {
        AppState.loadTodos();
        View.renderTheme();
        View.renderTodos();
        // Subscribe view updates to state changes
        AppState.subscribe(() => {
            View.renderTodos();
            View.renderTheme();
        });
        // Form submit
        View.todoForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAdd();
        });
        // Theme toggle
        View.themeToggle.addEventListener("change", () => {
            const newTheme = View.body.classList.contains("light-theme") ? "dark" : "light";
            AppState.setTheme(newTheme);
        });
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
    }
};

// -------------------- Init App --------------------
Controller.init();

