import { AppState } from '../model/AppState.js';
import { dispatchAction } from '../model/ActionDispatcher.js';

// Handles all DOM rendering and updates.
export const View = {
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
        newListInput.setAttribute('aria-label', 'New list name');
        const newListBtn = document.createElement('button');
        newListBtn.textContent = 'Create New List';
        newListBtn.className = 'new-list-btn';
        newListBtn.setAttribute('aria-label', 'Create new list');
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
            ul.setAttribute('role', 'list');
            AppState.lists.forEach(list => {
                const li = document.createElement('li');
                li.className = 'list-item flex-center';
                li.setAttribute('role', 'listitem');
                if (list.editing) {
                    const editInput = document.createElement('input');
                    editInput.type = 'text';
                    editInput.value = list.name;
                    editInput.className = 'edit-input';
                    editInput.autoFocus = true;
                    editInput.setAttribute('aria-label', 'Edit list name');
                    const saveBtn = document.createElement('button');
                    saveBtn.textContent = 'Save';
                    saveBtn.className = 'save-edit-button';
                    saveBtn.setAttribute('aria-label', 'Save edited list name');
                    saveBtn.onclick = () => {
                        const newName = editInput.value.trim();
                        if (newName.length > 0) {
                            dispatchAction('EDIT_LIST', { id: list.id, newName });
                        }
                    };
                    li.appendChild(editInput);
                    li.appendChild(saveBtn);
                } else {
                    const nameSpan = document.createElement('span');
                    nameSpan.textContent = list.name;
                    nameSpan.style.flexGrow = '1';
                    nameSpan.onclick = () => dispatchAction('SELECT_LIST', { id: list.id });
                    const editBtn = document.createElement('button');
                    editBtn.className = 'edit-button';
                    editBtn.innerHTML = `<img src="assets/image/edit_24dp_E3E3E3_FILL0_wght400_GRAD0_opsz24.svg" alt="Edit">`;
                    editBtn.setAttribute('aria-label', 'Edit list');
                    editBtn.onclick = (e) => {
                        e.stopPropagation();
                        list.editing = true;
                        this.renderHomepage();
                    };
                    const deleteBtn = document.createElement('button');
                    deleteBtn.className = 'delete-button';
                    deleteBtn.innerHTML = `<img src="assets/image/delete_24dp_000000.svg" alt="">`;
                    deleteBtn.setAttribute('aria-label', 'Delete list');
                    deleteBtn.onclick = (e) => {
                        e.stopPropagation();
                        this.showDeleteListModal(list.id, list.name);
                    };
                    li.appendChild(nameSpan);
                    li.appendChild(editBtn);
                    li.appendChild(deleteBtn);
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
            backBtn.setAttribute('aria-label', 'Back to lists');
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
            todoLI.setAttribute('role', 'listitem');
            
            if (todo.editing) {
                const editInput = document.createElement('input');
                editInput.type = 'text';
                editInput.value = todo.text;
                editInput.className = 'edit-input';
                editInput.autofocus = true;
                editInput.setAttribute('aria-label', 'Edit todo text');
                const saveBtn = document.createElement('button');
                saveBtn.textContent = 'Save';
                saveBtn.className = 'save-edit-button';
                saveBtn.setAttribute('aria-label', 'Save edited todo');
                saveBtn.onclick = () => {
                    const newText = editInput.value.trim();
                    if (newText.length > 0) {
                        dispatchAction('EDIT_TODO', { index: i, newText });
                    }
                };
                todoLI.appendChild(editInput);
                todoLI.appendChild(saveBtn);
            } else {
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.id = todoId;
                checkbox.checked = todo.completed;
                checkbox.setAttribute('aria-label', 'Mark todo as completed');
                
                const customCheckbox = document.createElement('label');
                customCheckbox.htmlFor = todoId;
                customCheckbox.className = 'custom-checkbox';
                customCheckbox.innerHTML = `<img src="assets/image/check_24dp_E3E3E3_FILL0_wght400_GRAD0_opsz24.svg" alt="">`;
                
                const todoText = document.createElement('label');
                todoText.htmlFor = todoId;
                todoText.className = 'todo-text';
                todoText.textContent = todo.text;
                todoText.setAttribute('aria-label', 'Todo text');
                
                const editBtn = document.createElement('button');
                editBtn.className = 'edit-button';
                editBtn.innerHTML = `<img src="assets/image/edit_24dp_E3E3E3_FILL0_wght400_GRAD0_opsz24.svg" alt="Edit">`;
                editBtn.setAttribute('aria-label', 'Edit todo');
                editBtn.onclick = (e) => {
                    e.preventDefault();
                    todo.editing = true;
                    this.renderTodos();
                };
                
                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'delete-button';
                deleteBtn.innerHTML = `<img src="assets/image/delete_24dp_000000.svg" alt="">`;
                deleteBtn.setAttribute('aria-label', 'Delete todo');
                deleteBtn.onclick = (e) => {
                    e.preventDefault();
                    this.showDeleteTodoModal(i, todo.text);
                };
                
                checkbox.addEventListener('change', () => {
                    dispatchAction('TOGGLE_TODO', { index: i, completed: checkbox.checked });
                });
                
                // Append in correct order for CSS selectors to work
                todoLI.appendChild(checkbox);
                todoLI.appendChild(customCheckbox);
                todoLI.appendChild(todoText);
                todoLI.appendChild(editBtn);
                todoLI.appendChild(deleteBtn);
            }
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
    },

    showDeleteListModal(listId, listName) {
        let modal = document.getElementById('delete-list-modal');
        if (modal) modal.remove();

        modal = document.createElement('div');
        modal.id = 'delete-list-modal';
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content" role="dialog" aria-modal="true" aria-labelledby="modal-title">
                <h2 id="modal-title">Delete List</h2>
                <p>Are you sure you want to delete the list "<strong>${listName}</strong>"?</p>
                <button id="confirm-delete-list" aria-label="Confirm delete">Delete</button>
                <button id="cancel-delete-list" aria-label="Cancel delete">Cancel</button>
            </div>
        `;
        document.body.appendChild(modal);

        modal.querySelector('#confirm-delete-list').focus();

        modal.querySelector('#confirm-delete-list').onclick = () => {
            dispatchAction('DELETE_LIST', { id: listId });
            modal.remove();
        };
        modal.querySelector('#cancel-delete-list').onclick = () => {
            modal.remove();
        };
    },

    showDeleteTodoModal(todoIndex, todoText) {
        let modal = document.getElementById('delete-todo-modal');
        if (modal) modal.remove();

        modal = document.createElement('div');
        modal.id = 'delete-todo-modal';
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content" role="dialog" aria-modal="true" aria-labelledby="modal-todo-title">
                <h2 id="modal-todo-title">Delete Todo</h2>
                <p>Are you sure you want to delete the todo "<strong>${todoText}</strong>"?</p>
                <button id="confirm-delete-todo" aria-label="Confirm delete">Delete</button>
                <button id="cancel-delete-todo" aria-label="Cancel delete">Cancel</button>
            </div>
        `;
        document.body.appendChild(modal);

        modal.querySelector('#confirm-delete-todo').focus();

        modal.querySelector('#confirm-delete-todo').onclick = () => {
            dispatchAction('DELETE_TODO', { index: todoIndex });
            modal.remove();
        };
        modal.querySelector('#cancel-delete-todo').onclick = () => {
            modal.remove();
        };
    }
};