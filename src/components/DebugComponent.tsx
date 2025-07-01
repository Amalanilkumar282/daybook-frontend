import React from 'react';

const DebugComponent: React.FC = () => {
  console.log('DebugComponent rendered');
  
  return (
    <div className="fixed top-0 left-0 bg-red-600 text-white p-4 z-50">
      <div className="mb-2">Debug: React is working!</div>
      <div className="text-sm">
        <div>✓ React Component Rendered</div>
        <div>✓ CSS Classes Applied</div>
        <div>✓ Console Logging Working</div>
      </div>
    </div>
  );
};

export default DebugComponent;
