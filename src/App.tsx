import { useState } from 'react';
import './App.css';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="app">
      <header className="app-header">
        <h1>D&D Spellbook Manager</h1>
        <p>Your offline-first spell management tool</p>
      </header>

      <main className="app-main">
        <div className="card">
          <button onClick={() => setCount((count) => count + 1)}>
            count is {count}
          </button>
          <p>
            Project initialized! Ready to build the spell manager.
          </p>
        </div>
      </main>
    </div>
  );
}

export default App;
