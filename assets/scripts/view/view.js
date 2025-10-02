/*
 * VIEW - DOM Rendering & UI Management
 * 
 * BEGINNER: This file handles everything you see on the screen - creating, updating, and removing HTML elements.
 * ADVANCED: View layer in MVC pattern - manages all DOM manipulation and user interface rendering.
 * EXPERT: Presentation layer with imperative DOM manipulation, event delegation, and accessibility features.
 */

// BEGINNER: Import the data and action functions we need
// ADVANCED: Import model and controller dependencies for view coordination
// EXPERT: Dependency injection for MVC integration and command dispatch
import { AppState } from '../model/AppState.js';
import { dispatchAction } from '../model/ActionDispatcher.js';

// BEGINNER: The main View object that handles everything on the screen
// ADVANCED: View controller with DOM element caching and rendering methods
// EXPERT: Presentation layer with cached DOM references and imperative rendering strategies
export const View = {
    // BEGINNER: Store references to important HTML elements so we can use them easily
    // ADVANCED: Cache DOM element references for performance
    // EXPERT: DOM reference caching - avoid repeated queries for performance optimization
    todoForm: document.querySelector('form'),
    todoInput: document.getElementById('todo-input'),
    todoListUL: document.getElementById('todo-list'),
    themeToggle: document.getElementById("theme-toggle"),
    body: document.body,
    homepage: null, // Will be created dynamically

    // BEGINNER: Show the main page with all the todo lists
    // ADVANCED: Render homepage UI with list management interface
    // EXPERT: Complex view rendering with conditional UI generation and event delegation
    renderHomepage() {
        // BEGINNER: Hide the todo form and list since we're on the homepage
        // ADVANCED: Manage UI element visibility for different application states
        // EXPERT: View state management - show/hide elements based on navigation context
        if (this.todoForm) this.todoForm.style.display = 'none';
        if (this.todoListUL) this.todoListUL.style.display = 'none';
        
        // BEGINNER: Hide the back button since we don't need it on homepage
        const backBtn = document.getElementById('back-home-btn');
        if (backBtn) backBtn.style.display = 'none';
        
        // BEGINNER: Create the homepage element if it doesn't exist yet
        // ADVANCED: Lazy creation of homepage DOM structure
        // EXPERT: Dynamic DOM creation with lifecycle management
        if (!this.homepage) {
            this.homepage = document.createElement('div');
            this.homepage.className = 'homepage';
            this.body.querySelector('.wrapper').appendChild(this.homepage);
        }
        
        this.homepage.style.display = '';
        this.homepage.innerHTML = ''; // Clear previous content
        
        // BEGINNER: Create the section where users can create new lists
        // ADVANCED: Generate list creation interface
        // EXPERT: Dynamic UI generation with accessibility considerations
        const createListContainer = document.createElement('div');
        createListContainer.className = 'create-list-container';
        
        // BEGINNER: If no lists exist, show a helpful message
        if (AppState.lists.length === 0) {
            const emptyMsg = document.createElement('div');
            emptyMsg.className = 'empty-msg';
            emptyMsg.textContent = 'No lists found. Create a new list to continue.';
            createListContainer.appendChild(emptyMsg);
        }
        
        // BEGINNER: Create input field for new list name
        // ADVANCED: Form input generation with accessibility attributes
        // EXPERT: Semantic HTML generation with ARIA labeling for screen readers
        const newListInput = document.createElement('input');
        newListInput.type = 'text';
        newListInput.placeholder = 'Enter new list name';
        newListInput.className = 'new-list-input';
        newListInput.setAttribute('aria-label', 'New list name');
        
        // BEGINNER: Create button to actually create the list
        const newListBtn = document.createElement('button');
        newListBtn.textContent = 'Create New List';
        newListBtn.className = 'new-list-btn';
        newListBtn.setAttribute('aria-label', 'Create new list');
        
        // BEGINNER: When button is clicked, create the list if name is not empty
        // ADVANCED: Event handler with validation and action dispatch
        // EXPERT: User interaction handling with input validation and command dispatch
        newListBtn.onclick = () => {
            const name = newListInput.value.trim();
            if (name.length > 0) {
                dispatchAction('ADD_LIST', { name });
                newListInput.value = ''; // Clear input after creation
            }
        };
        
        createListContainer.appendChild(newListInput);
        createListContainer.appendChild(newListBtn);
        this.homepage.appendChild(createListContainer);
        
        // BEGINNER: If there are existing lists, show them
        // ADVANCED: Conditional rendering of existing lists
        // EXPERT: Dynamic list rendering with edit/delete functionality
        if (AppState.lists.length > 0) {
            const listTitle = document.createElement('h2');
            listTitle.textContent = 'Your Lists';
            this.homepage.appendChild(listTitle);
            
            // BEGINNER: Create a list to hold all our todo lists
            // ADVANCED: Generate list container with semantic HTML
            // EXPERT: Semantic markup with ARIA roles for accessibility
            const ul = document.createElement('ul');
            ul.className = 'list-selector';
            ul.setAttribute('role', 'list');
            
            // BEGINNER: Go through each list and create a display item for it
            // ADVANCED: Iterate through lists and generate list items
            // EXPERT: Dynamic rendering with conditional edit state handling
            AppState.lists.forEach(list => {
                const li = document.createElement('li');
                li.className = 'list-item flex-center';
                li.setAttribute('role', 'listitem');
                
                // BEGINNER: If this list is being edited, show edit controls
                // ADVANCED: Conditional rendering based on edit state
                // EXPERT: State-driven UI with inline editing functionality
                if (list.editing) {
                    // BEGINNER: Create input field with current list name
                    const editInput = document.createElement('input');
                    editInput.type = 'text';
                    editInput.value = list.name;
                    editInput.className = 'edit-input';
                    editInput.autoFocus = true;
                    editInput.setAttribute('aria-label', 'Edit list name');
                    
                    // BEGINNER: Create save button
                    const saveBtn = document.createElement('button');
                    saveBtn.textContent = 'Save';
                    saveBtn.className = 'save-edit-button';
                    saveBtn.setAttribute('aria-label', 'Save edited list name');
                    
                    // BEGINNER: When save is clicked, update the list name
                    saveBtn.onclick = () => {
                        const newName = editInput.value.trim();
                        if (newName.length > 0) {
                            dispatchAction('EDIT_LIST', { id: list.id, newName });
                        }
                    };
                    
                    li.appendChild(editInput);
                    li.appendChild(saveBtn);
                } else {
                    // BEGINNER: Show normal list display with name and action buttons
                    // ADVANCED: Render list item with interaction handlers
                    // EXPERT: Complex interaction handling with event delegation and modal integration
                    
                    // BEGINNER: Show the list name - clicking it opens the list
                    const nameSpan = document.createElement('span');
                    nameSpan.textContent = list.name;
                    nameSpan.style.flexGrow = '1';
                    nameSpan.onclick = () => dispatchAction('SELECT_LIST', { id: list.id });
                    
                    // BEGINNER: Create edit button with icon
                    const editBtn = document.createElement('button');
                    editBtn.className = 'edit-button';
                    editBtn.innerHTML = `<img src="assets/image/edit_24dp_E3E3E3_FILL0_wght400_GRAD0_opsz24.svg" alt="Edit">`;
                    editBtn.setAttribute('aria-label', 'Edit list');
                    
                    // BEGINNER: When edit is clicked, put this list into edit mode
                    // ADVANCED: Toggle edit state and re-render
                    // EXPERT: State mutation with immediate UI update
                    editBtn.onclick = (e) => {
                        e.stopPropagation(); // Don't trigger list selection
                        list.editing = true;
                        this.renderHomepage(); // Re-render to show edit controls
                    };
                    
                    // BEGINNER: Create delete button with icon
                    const deleteBtn = document.createElement('button');
                    deleteBtn.className = 'delete-button';
                    deleteBtn.innerHTML = `<img src="assets/image/delete_24dp_000000.svg" alt="">`;
                    deleteBtn.setAttribute('aria-label', 'Delete list');
                    
                    // BEGINNER: When delete is clicked, ask for confirmation
                    deleteBtn.onclick = (e) => {
                        e.stopPropagation(); // Don't trigger list selection
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

    // BEGINNER: Show the todo list page with all todos for the selected list
    // ADVANCED: Render todo list interface with interactive todo items
    // EXPERT: Complex list rendering with inline editing, checkboxes, and action buttons
    renderTodos() {
        // BEGINNER: Hide homepage and show todo form and list
        // ADVANCED: Manage UI element visibility for todo list view
        // EXPERT: View state management for todo list navigation context
        if (this.homepage) this.homepage.style.display = 'none';
        if (this.todoForm) this.todoForm.style.display = '';
        if (this.todoListUL) this.todoListUL.style.display = '';
        
        // BEGINNER: Show or create the back button to return to homepage
        // ADVANCED: Manage back navigation UI element
        // EXPERT: Navigation element lifecycle with lazy creation
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
        
        // BEGINNER: Clear any existing todos from the display
        this.todoListUL.innerHTML = '';
        
        // BEGINNER: Find the list we're currently viewing
        const list = AppState.lists.find(l => l.id === AppState.selectedListId);
        if (!list) return; // Exit if list not found
        
        // BEGINNER: Go through each todo and create a display item for it
        // ADVANCED: Iterate through todos and generate interactive list items
        // EXPERT: Dynamic rendering with conditional edit states and accessibility features
        list.todos.forEach((todo, i) => {
            // BEGINNER: Create unique ID for each todo for accessibility
            const todoId = 'todo-' + i;
            const todoLI = document.createElement('li');
            todoLI.className = 'todo';
            todoLI.setAttribute('role', 'listitem');
            
            // BEGINNER: If this todo is being edited, show edit controls
            // ADVANCED: Conditional rendering for edit state
            // EXPERT: Inline editing with immediate state synchronization
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
                // BEGINNER: Show normal todo with checkbox, text, and action buttons
                // ADVANCED: Complex todo item with multiple interactive elements
                // EXPERT: Accessible form controls with semantic HTML and ARIA labels
                
                // BEGINNER: Create hidden checkbox for completion state
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.id = todoId;
                checkbox.checked = todo.completed;
                checkbox.setAttribute('aria-label', 'Mark todo as completed');
                
                // BEGINNER: Create custom checkbox visual (replaces default checkbox)
                const customCheckbox = document.createElement('label');
                customCheckbox.htmlFor = todoId;
                customCheckbox.className = 'custom-checkbox';
                customCheckbox.innerHTML = `<img src="assets/image/check_24dp_E3E3E3_FILL0_wght400_GRAD0_opsz24.svg" alt="">`;
                
                // BEGINNER: Create the todo text label
                const todoText = document.createElement('label');
                todoText.htmlFor = todoId;
                todoText.className = 'todo-text';
                todoText.textContent = todo.text;
                todoText.setAttribute('aria-label', 'Todo text');
                
                // BEGINNER: Create edit button
                const editBtn = document.createElement('button');
                editBtn.className = 'edit-button';
                editBtn.innerHTML = `<img src="assets/image/edit_24dp_E3E3E3_FILL0_wght400_GRAD0_opsz24.svg" alt="Edit">`;
                editBtn.setAttribute('aria-label', 'Edit todo');
                
                // BEGINNER: When edit is clicked, put this todo into edit mode
                editBtn.onclick = (e) => {
                    e.preventDefault();
                    todo.editing = true;
                    this.renderTodos(); // Re-render to show edit controls
                };
                
                // BEGINNER: Create delete button
                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'delete-button';
                deleteBtn.innerHTML = `<img src="assets/image/delete_24dp_000000.svg" alt="">`;
                deleteBtn.setAttribute('aria-label', 'Delete todo');
                
                // BEGINNER: When delete is clicked, ask for confirmation
                deleteBtn.onclick = (e) => {
                    e.preventDefault();
                    this.showDeleteTodoModal(i, todo.text);
                };
                
                // BEGINNER: When checkbox changes, update the todo's completion status
                // ADVANCED: Event handling for state change
                // EXPERT: Form control event handling with immediate state synchronization
                checkbox.addEventListener('change', () => {
                    dispatchAction('TOGGLE_TODO', { index: i, completed: checkbox.checked });
                });
                
                // BEGINNER: Add all elements in the right order (important for CSS styling)
                // ADVANCED: Maintain DOM structure for CSS selector compatibility
                // EXPERT: DOM structure maintenance for CSS cascade and accessibility
                todoLI.appendChild(checkbox);
                todoLI.appendChild(customCheckbox);
                todoLI.appendChild(todoText);
                todoLI.appendChild(editBtn);
                todoLI.appendChild(deleteBtn);
            }
            
            this.todoListUL.appendChild(todoLI);
        });
    },

    // BEGINNER: Update the page colors based on current theme (dark/light)
    // ADVANCED: Apply theme state to DOM classes
    // EXPERT: UI theme synchronization with state-driven class management
    renderTheme() {
        if (AppState.theme === "light") {
            this.body.classList.add("light-theme");
            this.themeToggle.checked = true;
        } else {
            this.body.classList.remove("light-theme");
            this.themeToggle.checked = false;
        }
    },

    // BEGINNER: Show the loading screen while the app starts up
    // ADVANCED: Render loading state UI with dynamic content generation
    // EXPERT: Loading state management with SVG generation and semantic structure
    renderLoadingScreen() {
        let loading = document.getElementById('loading-screen');
        if (!loading) {
            // BEGINNER: Create the loading screen element if it doesn't exist
            // ADVANCED: Lazy creation of loading screen DOM structure
            // EXPERT: Dynamic DOM generation with inline SVG and semantic markup
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

    // BEGINNER: Hide the loading screen
    // ADVANCED: Hide loading state UI
    // EXPERT: Loading state cleanup
    hideLoadingScreen() {
        const loading = document.getElementById('loading-screen');
        if (loading) loading.style.display = 'none';
    },

    // BEGINNER: Show a popup asking if user really wants to delete a list
    // ADVANCED: Generate confirmation modal for list deletion
    // EXPERT: Modal dialog generation with accessibility features and focus management
    showDeleteListModal(listId, listName) {
        // BEGINNER: Remove any existing modal first
        let modal = document.getElementById('delete-list-modal');
        if (modal) modal.remove();

        // BEGINNER: Create new modal popup
        // ADVANCED: Generate modal DOM structure with event handlers
        // EXPERT: Accessible modal with ARIA attributes and semantic structure
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

        // BEGINNER: Focus on the delete button so user can press Enter to confirm
        // ADVANCED: Focus management for keyboard accessibility
        // EXPERT: Accessibility focus management - immediate focus for keyboard users
        modal.querySelector('#confirm-delete-list').focus();

        // BEGINNER: Set up click handlers for the buttons
        // ADVANCED: Event delegation for modal interactions
        // EXPERT: Modal interaction handling with cleanup
        modal.querySelector('#confirm-delete-list').onclick = () => {
            dispatchAction('DELETE_LIST', { id: listId });
            modal.remove();
        };
        modal.querySelector('#cancel-delete-list').onclick = () => {
            modal.remove();
        };
    },

    // BEGINNER: Show a popup asking if user really wants to delete a todo
    // ADVANCED: Generate confirmation modal for todo deletion
    // EXPERT: Modal dialog with accessibility and cleanup (similar pattern to list deletion)
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