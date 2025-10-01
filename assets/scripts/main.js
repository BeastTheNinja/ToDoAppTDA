import { AppState } from './model/AppState.js';
import { Controller } from './controller/appController.js';
import { View } from './view/View.js';

// #region Init App
View.renderLoadingScreen();
setTimeout(() => {
    Controller.init();
    AppState.uiState = AppState.selectedListId ? 'list' : 'homepage';
    AppState.notify();
}, Math.floor(Math.random() * 3000) + 2000);