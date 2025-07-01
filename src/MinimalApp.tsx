import React from 'react';
import './App.css';

function MinimalApp() {
  console.log('MinimalApp rendered!');
  
  return (
    <div style={{ padding: '20px', backgroundColor: '#f0f0f0' }}>
      <h1 style={{ color: 'blue' }}>Daybook Application</h1>
      <p>If you can see this, the React app is working!</p>
      <div style={{ 
        backgroundColor: 'white', 
        padding: '20px', 
        marginTop: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h2>Test Dashboard</h2>
        <p>This is a minimal test to ensure React is rendering properly.</p>
        <button onClick={() => alert('Button works!')}>Test Button</button>
      </div>
    </div>
  );
}

export default MinimalApp;
