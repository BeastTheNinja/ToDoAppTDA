# ToDoAppTDA

A modern task management web app built with HTML, SCSS, and JavaScript using MVC architecture, created for a school project.

## Features

- **Multiple Todo Lists**: Create and manage multiple task lists
- **Add, edit, and delete tasks** within each list
- **Task completion tracking** with visual feedback
- **Dark and light mode** preferences
- **Responsive design** with modern UI/UX
- **LocalStorage** support:  
  - No account required; your lists, tasks, and preferences are saved locally on your device
  - Data persists only on your browser/device
- **Loading screen** with smooth animations
- **Confirmation modals** for delete operations

## Architecture

This project follows modern web development practices:

- **MVC (Model-View-Controller)** architecture
- **7-1 SCSS** architecture for organized styling
- **ES6 modules** for clean code separation
- **Component-based** file structure

### Project Structure

```
ToDoAppTDA/
├── assets/
│   ├── css/
│   ├── image/
│   └── scripts/
│       ├── controller/
│       │   └── AppController.js
│       ├── model/
│       │   ├── AppState.js
│       │   └── ActionDispatcher.js
│       ├── utils/
│       │   └── Callbacks.js
│       ├── view/
│       │   └── View.js
│       └── main.js
├── scss/
│   ├── abstracts/
│   ├── base/
│   ├── components/
│   ├── layout/
│   ├── themes/
│   ├── utilities/
│   └── main.scss
├── index.html
└── README.md
```

## Technologies Used

- **HTML5** - Semantic markup
- **SCSS** - Enhanced CSS with 7-1 architecture
- **JavaScript ES6+** - Modern JavaScript with modules
- **CSS Grid & Flexbox** - Modern layout techniques
- **LocalStorage API** - Client-side data persistence
- **MVC Pattern** - Separation of concerns

## Getting Started

1. **Clone or Fork the Repository**
    ```bash
    git clone https://github.com/BeastTheNinja/ToDoAppTDA.git
    ```
    Or fork it via GitHub for your own version.

2. **Setup (Optional - for SCSS compilation)**
    If you want to modify SCSS files:
    ```bash
    # Install a SCSS compiler like sass
    npm install -g sass
    
    # Compile SCSS to CSS (if making changes)
    sass scss/main.scss assets/css/main.css --watch
    ```

3. **Open the App**
    - Simply open `index.html` in your web browser.
    - Or use a local server for development:
    ```bash
    # Using Python
    python -m http.server 8000
    
    # Using Node.js
    npx http-server
    ```

## Usage Instructions

- **Create Lists**: Start by creating your first todo list from the homepage
- **Manage Tasks**: Add, edit, complete, and delete tasks within each list
- **Switch Lists**: Navigate between different lists from the homepage
- **Theme Toggle**: Switch between dark and light modes using the toggle
- **Data Persistence**: Your lists, tasks, and preferences are automatically saved
- **Reset Data**: Clear your browser's site data for the app to start fresh

## Architecture Details

### MVC Components

- **Model** (`model/`): 
  - `AppState.js` - Manages application data and state
  - `ActionDispatcher.js` - Handles all user actions and state updates

- **View** (`view/`):
  - `View.js` - Handles all DOM rendering and UI updates

- **Controller** (`controller/`):
  - `AppController.js` - Coordinates between Model and View, handles events

- **Utils** (`utils/`):
  - `Callbacks.js` - Centralized callback management

### SCSS Architecture (7-1 Pattern)

- **abstracts/** - Variables, mixins, functions
- **base/** - Reset, typography, base styles
- **components/** - Individual component styles
- **layout/** - Layout-related styles
- **themes/** - Theme-specific styles
- **utilities/** - Utility classes and responsive design

## Contributing

We welcome contributions!

1. **Fork** the repository and **clone** it locally.
2. **Check [issues](https://github.com/BeastTheNinja/ToDoAppTDA/issues)** for something to work on.
3. **Create a new branch** named after the issue number (e.g., `issue-12-fix-add-button`).
4. Make your changes following the existing architecture:
   - Model changes go in `model/`
   - View changes go in `view/`
   - Controller changes go in `controller/`
   - Styles go in appropriate SCSS files
5. **Test thoroughly** to ensure no regressions.
6. **Commit** with clear messages and **push** your branch.
7. **Open a Pull Request** and reference the issue you worked on.
8. Wait for review and feedback from the repo author.

## Development Guidelines

- Follow the MVC pattern when adding new features
- Use ES6+ features and maintain module structure
- Follow the 7-1 SCSS architecture for styling
- Ensure responsive design principles
- Test across different browsers
- Maintain accessibility standards

## License

This project is licensed under the [MIT License](LICENSE).

---

> _Made for a school project by [BeastTheNinja](https://github.com/BeastTheNinja)_  
> _Showcasing modern web development practices and clean architecture_