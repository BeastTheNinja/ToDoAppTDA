// data evaluation
// modtag data fra model 
import { todoData } from '../model/checkLocalStorage.js';
// send data til view
export const renderTodoList = (data) => {
    const todoListContainer = document.getElementById('todo-list');
    todoListContainer.innerHTML = ''; // Clear existing content
    data.forEach(todo => {
        const todoItem = document.createElement('li');
        todoItem.textContent = todo.text;
        todoListContainer.appendChild(todoItem);
    });
};
