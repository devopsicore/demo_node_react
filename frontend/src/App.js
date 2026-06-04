import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('http://backend:5000/api/data')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(error => {
        setError(error.message);
        setLoading(false);
      });
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>React + Node Docker Demo</h1>
        <p>This application is running in Docker containers</p>
        
        {loading && <p>Loading data from backend...</p>}
        
        {error && <p className="error">Error: {error}</p>}
        
        {data && (
          <div className="data-container">
            <h2>Backend API Response:</h2>
            <p>{data.message}</p>
            <ul>
              {data.data.map(item => (
                <li key={item.id}>{item.name}</li>
              ))}
            </ul>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;
