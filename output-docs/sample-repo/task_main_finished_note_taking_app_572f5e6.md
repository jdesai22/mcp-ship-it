---
title: "finished note taking app"
date: "2025-04-23T19:04:58-04:00"
author: "Jai Desai"
commit: "572f5e64158fc57eb574e97ef72b1d6f93d92f87"
shortCommit: "572f5e6"
branch: "main"
tags: ["branch:main", "lang:md", "lang:html", "lang:css", "lang:js"]
files:
  - "README.md"
  - "public/index.html"
  - "src/App.css"
  - "src/App.js"
  - "src/index.css"
---

# Task: finished note taking app

## Commit Details

- **Commit:** 572f5e64158fc57eb574e97ef72b1d6f93d92f87
- **Author:** Jai Desai
- **Date:** 2025-04-23T19:04:58-04:00
- **Branch:** main

## Commit Message

```
finished note taking app
```

## Modified Files

### README.md

```
# Notes App

A simple and elegant note-taking application built with React that helps you organize your thoughts and keep track of important information.

## Features

- Create, edit, and delete notes
- Each note has a title and content
- Notes are automatically saved to localStorage
- Responsive design that works on desktop and mobile devices
- Clean, modern UI with smooth animations

## Quick Demo

1. Type a title for your note
2. Write your note content
3. Click "Add Note" to save it
4. Your note will appear in the list of notes
5. You can edit or delete existing notes

## Getting Started

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

### Prerequisites

- Node.js (v14+)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
   or
   ```
   yarn install
   ```

### Running the App

In the project directory, run:

```
npm start
```

or

```
yarn start
```

This runs the app in development mode. Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

## How It Works

The app uses React's state management (useState) and side effects (useEffect) to:

1. Store notes in the browser's localStorage
2. Load saved notes when the app starts
3. Save notes whenever they change

No backend or database is required as all data is stored locally in the user's browser.

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run eject` - Ejects from Create React App

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)

```

### public/index.html

```
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta
      name="description"
      content="A simple note-taking app to help you organize your thoughts"
    />
    <link rel="apple-touch-icon" href="%PUBLIC_URL%/logo192.png" />
    <!--
      manifest.json provides metadata used when your web app is installed on a
      user's mobile device or desktop. See https://developers.google.com/web/fundamentals/web-app-manifest/
    -->
    <link rel="manifest" href="%PUBLIC_URL%/manifest.json" />
    <!--
      Notice the use of %PUBLIC_URL% in the tags above.
      It will be replaced with the URL of the `public` folder during the build.
      Only files inside the `public` folder can be referenced from the HTML.

      Unlike "/favicon.ico" or "favicon.ico", "%PUBLIC_URL%/favicon.ico" will
      work correctly both with client-side routing and a non-root public URL.
      Learn how to configure a non-root public URL by running `npm run build`.
    -->
    <title>Notes App</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
    <!--
      This HTML file is a template.
      If you open it directly in the browser, you will see an empty page.

      You can add webfonts, meta tags, or analytics to this file.
      The build step will place the bundled scripts into the <body> tag.

      To begin the development, run `npm start` or `yarn start`.
      To create a production bundle, use `npm run build` or `yarn build`.
    -->
  </body>
</html>

```

### src/App.css

```
.App {
  text-align: center;
}

.App-logo {
  height: 40vmin;
  pointer-events: none;
}

@media (prefers-reduced-motion: no-preference) {
  .App-logo {
    animation: App-logo-spin infinite 20s linear;
  }
}

.App-header {
  background-color: #282c34;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1.5rem 0;
  color: white;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.App-header h1 {
  margin: 0;
  font-size: 2rem;
}

.App-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

@media (min-width: 768px) {
  .App-content {
    flex-direction: row;
    align-items: flex-start;
  }
}

.note-form, .notes-container {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  width: 100%;
}

@media (min-width: 768px) {
  .note-form {
    width: 40%;
    position: sticky;
    top: 1rem;
  }
  
  .notes-container {
    width: 60%;
  }
}

.note-title-input {
  width: 100%;
  padding: 0.75rem;
  font-size: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 1rem;
  box-sizing: border-box;
}

.note-content-input {
  width: 100%;
  min-height: 200px;
  padding: 0.75rem;
  font-size: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 1rem;
  resize: vertical;
  box-sizing: border-box;
  font-family: inherit;
}

.note-form-actions {
  display: flex;
  gap: 0.5rem;
}

button {
  padding: 0.5rem 1rem;
  background-color: #61dafb;
  color: #282c34;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

button:hover {
  background-color: #4fa8d1;
}

.cancel-button {
  background-color: #e74c3c;
  color: white;
}

.cancel-button:hover {
  background-color: #c0392b;
}

.notes-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
  margin-top: 1.5rem;
}

.note-card {
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 1rem;
  position: relative;
  text-align: left;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #f9f9f9;
  transition: transform 0.2s, box-shadow 0.2s;
}

.note-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.note-card h3 {
  margin-top: 0;
  color: #282c34;
  border-bottom: 1px solid #eee;
  padding-bottom: 0.5rem;
}

.note-preview {
  color: #555;
  margin-bottom: 1rem;
  flex-grow: 1;
  overflow-wrap: break-word;
  white-space: pre-line;
}

.note-card-actions {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.note-date {
  font-size: 0.75rem;
  color: #888;
}

.no-notes {
  color: #888;
  margin-top: 2rem;
  font-style: italic;
}

@keyframes App-logo-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.search-container {
  display: flex;
  gap: 10px;
  margin-bottom: 1.5rem;
  align-items: center;
}

.search-input {
  flex: 1;
  padding: 0.75rem;
  font-size: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
  transition: border-color 0.3s;
}

.search-input:focus {
  border-color: #61dafb;
  box-shadow: 0 0 0 2px rgba(97, 218, 251, 0.2);
}

.clear-search-button {
  background-color: #888;
  color: white;
}

.clear-search-button:hover {
  background-color: #666;
}

.note-category-input {
  width: 100%;
  padding: 0.75rem;
  font-size: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 1rem;
  box-sizing: border-box;
}

.note-category {
  display: inline-block;
  background-color: #61dafb;
  color: #282c34;
  padding: 0.25rem 0.5rem;
  border-radius: 15px;
  font-size: 0.75rem;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.search-filters {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

@media (min-width: 768px) {
  .search-filters {
    flex-direction: row;
    align-items: center;
  }
  
  .search-container {
    flex: 2;
  }
  
  .category-filter {
    flex: 1;
  }
}

.category-filter {
  display: flex;
  gap: 10px;
  align-items: center;
}

.category-select {
  flex: 1;
  padding: 0.75rem;
  font-size: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
  cursor: pointer;
}

.clear-filter-button {
  background-color: #888;
  color: white;
}

.clear-filter-button:hover {
  background-color: #666;
}

```

### src/App.js

```
import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [notes, setNotes] = useState([]);
  const [currentNote, setCurrentNote] = useState('');
  const [currentTitle, setCurrentTitle] = useState('');
  const [currentCategory, setCurrentCategory] = useState('');
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Load notes from localStorage when component mounts
  useEffect(() => {
    const savedNotes = localStorage.getItem('notes');
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes));
    }
  }, []);

  // Save notes to localStorage whenever notes change
  useEffect(() => {
    localStorage.setItem('notes', JSON.stringify(notes));
  }, [notes]);

  const handleAddNote = () => {
    if (!currentTitle.trim()) {
      alert('Please enter a title for your note');
      return;
    }

    if (editingNoteId !== null) {
      // Update existing note
      setNotes(notes.map(note => 
        note.id === editingNoteId 
          ? { 
              ...note, 
              title: currentTitle, 
              content: currentNote,
              category: currentCategory,
              lastModified: new Date().toISOString() 
            } 
          : note
      ));
      setEditingNoteId(null);
    } else {
      // Add new note
      const newNote = {
        id: Date.now(),
        title: currentTitle,
        content: currentNote,
        category: currentCategory,
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString()
      };
      setNotes([...notes, newNote]);
    }

    // Reset input fields
    setCurrentTitle('');
    setCurrentNote('');
    setCurrentCategory('');
  };

  const handleDeleteNote = (id) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      setNotes(notes.filter(note => note.id !== id));
      if (editingNoteId === id) {
        setEditingNoteId(null);
        setCurrentTitle('');
        setCurrentNote('');
        setCurrentCategory('');
      }
    }
  };

  const handleEditNote = (id) => {
    const noteToEdit = notes.find(note => note.id === id);
    if (noteToEdit) {
      setCurrentTitle(noteToEdit.title);
      setCurrentNote(noteToEdit.content);
      setCurrentCategory(noteToEdit.category || '');
      setEditingNoteId(id);
    }
  };

  // Get unique categories from notes
  const categories = ['', ...new Set(notes.map(note => note.category).filter(Boolean))];

  // Filter notes based on search term and category
  const filteredNotes = notes.filter(note => {
    const matchesSearch = 
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !categoryFilter || note.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="App">
      <header className="App-header">
        <h1>Note Taking App</h1>
      </header>
      <main className="App-content">
        <div className="note-form">
          <h2>{editingNoteId !== null ? 'Edit Note' : 'Add New Note'}</h2>
          <input
            type="text"
            placeholder="Note Title"
            value={currentTitle}
            onChange={(e) => setCurrentTitle(e.target.value)}
            className="note-title-input"
          />
          <input
            type="text"
            placeholder="Category (optional)"
            value={currentCategory}
            onChange={(e) => setCurrentCategory(e.target.value)}
            className="note-category-input"
          />
          <textarea
            placeholder="Write your note here..."
            value={currentNote}
            onChange={(e) => setCurrentNote(e.target.value)}
            className="note-content-input"
          ></textarea>
          <div className="note-form-actions">
            <button onClick={handleAddNote}>
              {editingNoteId !== null ? 'Update Note' : 'Add Note'}
            </button>
            {editingNoteId !== null && (
              <button 
                onClick={() => {
                  setEditingNoteId(null);
                  setCurrentTitle('');
                  setCurrentNote('');
                  setCurrentCategory('');
                }}
                className="cancel-button"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
        
        <div className="notes-container">
          <h2>Your Notes</h2>
          <div className="search-filters">
            <div className="search-container">
              <input
                type="text"
                placeholder="Search notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="clear-search-button"
                >
                  Clear
                </button>
              )}
            </div>
            
            {categories.length > 1 && (
              <div className="category-filter">
                <select 
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="category-select"
                >
                  <option value="">All Categories</option>
                  {categories.filter(cat => cat).map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                {categoryFilter && (
                  <button 
                    onClick={() => setCategoryFilter('')}
                    className="clear-filter-button"
                  >
                    Clear
                  </button>
                )}
              </div>
            )}
          </div>
          
          {filteredNotes.length === 0 ? (
            <p className="no-notes">
              {notes.length === 0 ? 'No notes yet. Create one!' : 'No notes match your search.'}
            </p>
          ) : (
            <div className="notes-list">
              {filteredNotes.map(note => (
                <div key={note.id} className="note-card">
                  <h3>{note.title}</h3>
                  {note.category && (
                    <span className="note-category">
                      {note.category}
                    </span>
                  )}
                  <p className="note-preview">{note.content.substring(0, 100)}
                    {note.content.length > 100 ? '...' : ''}
                  </p>
                  <div className="note-card-actions">
                    <button onClick={() => handleEditNote(note.id)}>Edit</button>
                    <button onClick={() => handleDeleteNote(note.id)}>Delete</button>
                  </div>
                  <small className="note-date">
                    Last modified: {new Date(note.lastModified).toLocaleString()}
                  </small>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;

```

### src/index.css

```
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #f5f5f5;
  color: #333;
}

code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
    monospace;
}

h1, h2, h3, h4, h5, h6 {
  margin-top: 0;
  color: #282c34;
}

* {
  box-sizing: border-box;
}

:focus {
  outline-color: #61dafb;
}

::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #555;
}

```

