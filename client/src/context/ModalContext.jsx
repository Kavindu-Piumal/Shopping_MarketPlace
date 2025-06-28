import React, { createContext, useContext, useState } from 'react';
import CreateShopModal from '../components/CreateShopModal';

// Create context
const ModalContext = createContext();

// Modal provider component
export const ModalProvider = ({ children }) => {
  const [showCreateShopModal, setShowCreateShopModal] = useState(false);
  const [onShopCreatedCallback, setOnShopCreatedCallback] = useState(null);
  
  const openCreateShopModal = (callback) => {
    setShowCreateShopModal(true);
    if (callback) {
      setOnShopCreatedCallback(() => callback);
    }
  };
  
  const closeCreateShopModal = () => {
    setShowCreateShopModal(false);
    setOnShopCreatedCallback(null);
  };
  
  const handleShopCreated = () => {
    if (onShopCreatedCallback) {
      onShopCreatedCallback();
    }
    closeCreateShopModal();
  };
  
  return (
    <ModalContext.Provider value={{ openCreateShopModal, closeCreateShopModal }}>
      {children}
      
      {/* Render modals at the root level */}
      {showCreateShopModal && (
        <CreateShopModal 
          close={closeCreateShopModal}
          onShopCreated={handleShopCreated}
        />
      )}
    </ModalContext.Provider>
  );
};

// Custom hook to use the modal context
export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};
