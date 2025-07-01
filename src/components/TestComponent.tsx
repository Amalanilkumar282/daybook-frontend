import React from 'react';

const TestComponent: React.FC = () => {
  return (
    <div style={{
      backgroundColor: '#f0f0f0',
      padding: '20px',
      border: '2px solid #333',
      borderRadius: '8px',
      margin: '20px'
    }}>
      <h1 style={{color: '#333', fontSize: '24px', marginBottom: '10px'}}>Test Component</h1>
      <p style={{color: '#666', fontSize: '16px'}}>
        This is a test component without Tailwind CSS classes.
        If you can see this, React components are working correctly.
      </p>
      <button 
        style={{
          backgroundColor: '#007bff',
          color: 'white',
          padding: '10px 20px',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          marginTop: '10px'
        }}
        onClick={() => alert('Button clicked!')}
      >
        Test Button
      </button>
    </div>
  );
};

export default TestComponent;
