import React from 'react';
import MobileBackButton from './MobileBackButton';

const DashboardMobileLayout = ({ children, backLabel = "My Account", backTo = "/user-menu-mobile" }) => {
  return (
    <>
      {/* Fixed Back Button - Only on mobile, positioned below header */}
      <MobileBackButton 
        label={backLabel} 
        to={backTo}
        isFixed={true}
      />
      
      {/* Content with minimal gap - back button is now compact and floating */}
      <div className="pt-5 lg:pt-0">
        {children}
      </div>
    </>
  );
};

export default DashboardMobileLayout;
