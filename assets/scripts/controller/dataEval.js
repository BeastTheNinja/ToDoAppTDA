// data evaluation
// check if data exists in localStorage
export function checkLocalStorage() {
    const data = localStorage.getItem('todoData');
    if (data) {
        return JSON.parse(data);
    }
    return null;
}
