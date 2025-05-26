import React, { useState } from 'react';
import './App.css'; // We'll create this file next for styling

// Define a constant for the limit
const COUNT_LIMIT = 10;

function App() {
  // State for the counter value, initialized to 0
  const [count, setCount] = useState(0);
  // State for the limit message
  const [message, setMessage] = useState('');

  // Function to handle incrementing the count
  const handleIncrement = () => {
    if (count < COUNT_LIMIT) {
      const newCount = count + 1;
      setCount(newCount);
      if (newCount === COUNT_LIMIT) {
        setMessage("You've reached the limit!");
      } else {
        setMessage(''); // Clear message if not at limit
      }
    }
  };

  // Function to handle decrementing the count
  const handleDecrement = () => {
    if (count > 0) {
      const newCount = count - 1;
      setCount(newCount);
      // Clear message if we were at the limit and now moved away
      if (count === COUNT_LIMIT && newCount < COUNT_LIMIT) {
        setMessage('');
      }
    }
  };

  return (
    <div className="app-container">
      <h1 className="app-title">Mini Project Assessment: Click Counter App</h1>

      <div className="counter-section">
        <p className="counter-display">Count: {count}</p>
        <div className="button-group">
          <button
            className="button decrease-button"
            onClick={handleDecrement}
            disabled={count === 0} // Disable button if count is 0
          >
            Decrease
          </button>
          <button
            className="button increase-button"
            onClick={handleIncrement}
            disabled={count === COUNT_LIMIT} // Disable button if count is at limit
          >
            Increase
          </button>
        </div>
        {message && <p className="limit-message">{message}</p>}
      </div>
    </div>
  );
}

export default App;