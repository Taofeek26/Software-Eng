// src/App.js
import React, { useState, useEffect } from 'react';
import ListComponent from './ListComponent'; // Import the reusable component
import './App.css'; // For styling

const API_URL = 'https://jsonplaceholder.typicode.com/todos'; // Example API

function App() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTodos = async () => {
      setLoading(true);
      setError(null); // Reset error on new fetch attempt
      try {
        const response = await fetch(API_URL);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setTodos(data.slice(0, 15)); // Let's take only the first 15 for brevity
      } catch (err) {
        setError(err.message);
        setTodos([]); // Clear data on error
      } finally {
        setLoading(false);
      }
    };

    fetchTodos();
  }, []); // Empty dependency array means this effect runs once on mount

  // Custom render function for a todo item
  const renderTodoItem = (todo) => (
    <li key={todo.id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
      <span>{todo.id}. {todo.title}</span>
      <span>{todo.completed ? '✅ Completed' : '⏳ Pending'}</span>
    </li>
  );

  // Custom component for when the list is empty after a successful fetch
  const renderEmptyTodos = () => (
    <p className="empty-message">No todos found from the API.</p>
  );


  if (loading) {
    return <div className="app-container"><p className="loading-message">Loading data...</p></div>;
  }

  if (error) {
    return <div className="app-container"><p className="error-message">Error: {error}</p></div>;
  }

  return (
    <div className="app-container">
      <h1 className="app-title">Fetched Todo List</h1>
      <ListComponent
        items={todos}
        renderItem={renderTodoItem}
        emptyListComponent={renderEmptyTodos} // Pass the custom empty component
      />
    </div>
  );
}

export default App;