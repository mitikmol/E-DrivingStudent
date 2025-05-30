// src/context/AuthContext.js
import { createContext } from 'react';

const AuthContext = createContext({
  isAuthenticated: false,
  user: null,
  updateAuthInfo: () => {},
});

export default AuthContext;