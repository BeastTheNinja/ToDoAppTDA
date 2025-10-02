/*
 * MAIN.JS - Application Entry Point
 * 
 * BEGINNER: This is where the app starts running. It imports other files and sets up the initial loading.
 * ADVANCED: Entry point that orchestrates the MVC initialization with a simulated loading delay.
 * EXPERT: Bootstrap module that handles dependency injection and async initialization with UX-optimized loading states.
 */

// BEGINNER: Import statements bring in code from other files so we can use them here
// ADVANCED: ES6 module imports for clean dependency management
// EXPERT: Dependency injection pattern - importing only what we need from each module
import { AppState } from './model/AppState.js';
import { Controller } from './controller/appController.js';
import { View } from './view/View.js';

// BEGINNER: This section starts up the entire app
// ADVANCED: Application initialization with loading screen UX
// EXPERT: Async bootstrap with randomized delay to simulate real-world loading conditions
// #region Init App

// BEGINNER: Show a loading screen first so users know something is happening
// ADVANCED: Render loading state before heavy initialization
// EXPERT: Immediate UI feedback - prevents perceived performance issues during init
View.renderLoadingScreen();

// BEGINNER: Wait a random amount of time (2-5 seconds) then start the real app
// ADVANCED: Simulate loading time with random delay for realistic UX
// EXPERT: Randomized delay (2-5s) simulates variable network/processing conditions in production
setTimeout(() => {
    // BEGINNER: Start up the main controller that handles everything
    // ADVANCED: Initialize the MVC controller which sets up all event listeners
    // EXPERT: Controller initialization - establishes the entire event-driven architecture
    Controller.init();
    
    // BEGINNER: Decide whether to show the homepage or a specific todo list
    // ADVANCED: Set initial UI state based on persisted application state
    // EXPERT: State-driven UI routing - determines initial view based on localStorage data
    AppState.uiState = AppState.selectedListId ? 'list' : 'homepage';
    
    // BEGINNER: Tell all parts of the app that something changed so they can update
    // ADVANCED: Trigger state change notification to update all subscribed components
    // EXPERT: Observer pattern notification - propagates state changes to all registered listeners
    AppState.notify();
}, Math.floor(Math.random() * 3000) + 2000); // Random delay between 2-5 seconds