import React from 'react';
import MobileBackButton from '../components/MobileBackButton';

const TestPage = () => {
  return (
    <div>
      {/* Fixed Back Button Test */}
      <MobileBackButton 
        label="My Account" 
        to="/user-menu-mobile"
        isFixed={true}
      />
      
      {/* Content with top padding */}
      <div className="pt-16 lg:pt-0 p-4">
        <h1 className="text-2xl font-bold mb-4">Test Page</h1>
        
        {/* Generate lots of content to test scrolling */}
        {Array.from({ length: 50 }, (_, i) => (
          <div key={i} className="p-4 mb-2 bg-gray-100 rounded">
            <h3>Content Block {i + 1}</h3>
            <p>This is test content to create a scrollable page. The back button should stay fixed at the top while this content scrolls.</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TestPage;
