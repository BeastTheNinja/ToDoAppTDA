// app initialization


// Loading screen 
// what happens when loading starts check data localStorage if no data make new data send to dataEval
showLoadingScreen();
export const todoData = checkLocalStorage();
if (!todoData) {
    // No data found, create new data
    const newData = createNewData();
    sendDataToDataEval(newData);
} else {
    // Data found, send it to dataEval
    sendDataToDataEval(todoData);
}
