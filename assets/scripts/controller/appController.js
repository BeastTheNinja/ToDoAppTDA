import { AppState } from '../model/AppState.js';
import { dispatchAction } from '../model/ActionDispatcher.js';
import { View } from '../view/View.js';

export const Controller = {
    _initialized: false,

    init() {
        if (this._initialized) return;
        this._initialized = true;

        AppState.loadState();
        AppState.uiState = AppState.selectedListId ? 'list' : 'homepage';
        View.renderTheme();

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