// ------------------------------------TODODOM'EN-------------------------------------------------------------------------
const todoForm = document.querySelector('form');
const todoInput = document.getElementById('todo-input');
const todoListUL = document.getElementById('todo-list');
// ------------------------------------DARKMODE/LIGHTMODE-----------------------------------------------------------------
const themeToggle = document.getElementById("theme-toggle");
const body = document.body;

// hent tema fra localStorage
if(localStorage.getItem("theme") === "light") {
  body.classList.add("light-theme");
  themeToggle.checked = true; // flyt slideren til højre
}

themeToggle.addEventListener("change", () => {
  body.classList.toggle("light-theme");
  
  if(body.classList.contains("light-theme")) {
    localStorage.setItem("theme", "light");
  } else {
    localStorage.setItem("theme", "dark");
  }
});
// -----------------------------------------------------------------------------------------------------------------------
let allTodos = getTodos();
updateTodoList();

todoForm.addEventListener('submit', (e) =>{
   e.preventDefault();
   addTodo()
})

function addTodo(){
    const todoText = todoInput.value.trim();
    if(todoText.length > 0 ) {
        const todoObject = {
            text: todoText,
            completed: false
        };
        allTodos.push(todoObject);
        updateTodoList();
        saveTodos();
        todoInput.value = '';
    }
}
function  updateTodoList(){
    todoListUL.innerHTML = '';
    allTodos.forEach((todo, todoIndex) =>{
        const todoItem = createTodoItem(todo, todoIndex);
        todoListUL.appendChild(todoItem);
    })
}
function createTodoItem(todo, todoIndex){
    const todoId = 'todo-' + todoIndex;
    const todoLI = document.createElement('li');
    const todoText = todo.text;
    todoLI.className = 'todo';
    todoLI.innerHTML = `
    <input type="checkbox" id="${todoId}">
    <label for="${todoId}" class="custom-checkbox">
        <img src="assets/image/check_24dp_E3E3E3_FILL0_wght400_GRAD0_opsz24.svg" alt="">
    </label>
    <label for="${todoId}" class="todo-text">
        ${todoText}
    </label>
    <button class="delete-button">
        <img src="assets/image/delete_24dp_000000.svg" alt="">
    </button>
    `;
    const deleteButton = todoLI.querySelector('.delete-button');
    deleteButton.addEventListener('click', () => {
        deleteTodoItem(todoIndex);
    });
    const checkbox = todoLI.querySelector('input');
    checkbox.addEventListener('change', () =>{
        allTodos[todoIndex].completed = checkbox.checked;
        saveTodos();
    })
    checkbox.checked = todo.completed;
    return todoLI;
}

function deleteTodoItem(todoIndex){
    allTodos = allTodos.filter((_, i) => i !== todoIndex);
    updateTodoList();
    saveTodos();
}

function saveTodos(){
    const todosJson = JSON.stringify(allTodos);
    localStorage.setItem('todos', todosJson);
}

function getTodos(){
    const todos = localStorage.getItem('todos') || '[]';
    return JSON.parse(todos);
}

