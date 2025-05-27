// src/context/DocumentStatusContext.jsx
import React, { createContext, useState, useEffect } from 'react';

export const DocumentStatusContext = createContext({
  status: 'not_submitted',
  markSubmitted: () => {}
});

export const DocumentStatusProvider = ({ children }) => {
  const [status, setStatus] = useState(
    () => localStorage.getItem('documentStatus') || 'not_submitted'
  );

  // Whenever the window regains focus, re-read localStorage
  useEffect(() => {
    const onFocus = () => {
      // re-sync from localStorage into our `status` state
      setStatus(localStorage.getItem('documentStatus') || 'not_submitted');
    };

    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

  const markSubmitted = () => {
    localStorage.setItem('documentStatus', 'submitted');
    setStatus('submitted');
  };

  const markPending = () => {
    localStorage.setItem('documentStatus', 'pending');
    setStatus('pending');
  };

  const markApproved = () => {
    localStorage.setItem('documentStatus', 'approved');
    setStatus('approved');
  };

  return (
    <DocumentStatusContext.Provider value={{ status, markSubmitted, markPending, markApproved }}>
      {children}
    </DocumentStatusContext.Provider>
  );
};
