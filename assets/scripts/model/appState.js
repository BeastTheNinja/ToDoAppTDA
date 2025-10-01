// App State (Model)
// Holds all app data and methods to manipulate it.
const APP_STATE_KEY = 'appState';

export const AppState = {
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