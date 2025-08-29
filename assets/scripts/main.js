// Main JavaScript file for the ToDo App
// 1. function ppLoading():
// visLoadingScreen()
// data = hentFraLocalStorage("homepageData")
// evaluateData(data, "homepage")
// This issue merges and improves the following related issues:
// appStart
// loadHomepage
// goHomepage
// Design localStorage data structure for homepage initialization
// Objective
// Create a seamless app initialization and homepage loading flow with well-structured localStorage data. All homepage logic and navigation should be unified and optimized.
// Tasks
// Refactor appStart, loadHomepage, and goHomepage logic into a single initialization sequence.
// Design and document the localStorage schema for homepage data.
// Ensure homepage navigation and rendering uses the new data structure.
// Remove duplicate or redundant logic from the merged issues.
// Acceptance Criteria
// Homepage initializes reliably from localStorage.
// Navigation to homepage is unified and robust.
// All previous functionality from merged issues is preserved and improved.
// Documentation for the localStorage schema is created.
// Notes
// - Ensure all functions are properly documented.
// - Consider edge cases for localStorage access and data retrieval.

// - Implement error handling for data retrieval and parsing.
// Create DOM elements for the homepage

// Homepage container
const homepageContainer = document.createElement('div');
const taskList = document.createElement('ul');
const addTaskButton = document.createElement('button');
const taskInput = document.createElement('input');
// Loading screen elements
const loadingScreen = document.createElement('div');
const loadingText = document.createElement('p');
const loadingImage = document.createElement('img');
// Loading screen error message elements
const errorMessage = document.createElement('div');
const errorText = document.createElement('p');
const retryButton = document.createElement('button');
// home page elements
const footer = document.createElement('footer');
const header = document.createElement('header');
const title = document.createElement('h1');
const description = document.createElement('p');
const taskItem = document.createElement('li');

// Create buttons for each task item
const completeButton = document.createElement('button');
const deleteButton = document.createElement('button');
const editButton = document.createElement('button');
const saveButton = document.createElement('button');
const cancelButton = document.createElement('button');
const filterContainer = document.createElement('div');
const filterAllButton = document.createElement('button');
const filterActiveButton = document.createElement('button');
const filterCompletedButton = document.createElement('button');
const clearCompletedButton = document.createElement('button');

// Create id's
homepageContainer.id = 'homepageContainer';
taskList.id = 'taskList';
addTaskButton.id = 'addTaskButton';
taskInput.id = 'taskInput';
loadingScreen.id = 'loadingScreen';
errorMessage.id = 'errorMessage';
footer.id = 'footer';
header.id = 'header';
title.id = 'title';
description.id = 'description';
filterContainer.id = 'filterContainer';
filterAllButton.id = 'filterAllButton';
filterActiveButton.id = 'filterActiveButton';
filterCompletedButton.id = 'filterCompletedButton';
clearCompletedButton.id = 'clearCompletedButton';

// Create the homepage layout
homepageContainer.appendChild(taskList);
homepageContainer.appendChild(addTaskButton);
homepageContainer.appendChild(taskInput);
homepageContainer.appendChild(loadingScreen);
homepageContainer.appendChild(errorMessage);
homepageContainer.appendChild(footer);
homepageContainer.appendChild(header);
header.appendChild(title);
header.appendChild(description);
footer.appendChild(filterContainer);
// Filter buttons
filterContainer.appendChild(filterAllButton);
filterContainer.appendChild(filterActiveButton);
filterContainer.appendChild(filterCompletedButton);
filterContainer.appendChild(clearCompletedButton);


// Loading screen
loadingScreen.appendChild(loadingText);
loadingScreen.appendChild(retryButton);
loadingScreen.appendChild(loadingImage);

// Error message elements
errorMessage.appendChild(errorText);
errorMessage.appendChild(retryButton);

// loading screen initialization with import 


