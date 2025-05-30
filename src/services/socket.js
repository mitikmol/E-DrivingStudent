// src/services/socket.js
import { io } from 'socket.io-client';

let socketInstance = null;

export const connectSocket = (userId) => {
  if (socketInstance) return socketInstance;

  socketInstance = io('https://driving-backend-stmb.onrender.com', {
    path: '/socket.io',
    withCredentials: true,
    transports: ['websocket', 'polling'],
    query: { userId },
    auth: {
      token: localStorage.getItem('token'),
      userId
    },
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    timeout: 20000
  });

  socketInstance.on('connect', () => {
    console.log('Socket connected');
  });

  socketInstance.on('connect_error', (err) => {
    console.error('Connection error:', err);
  });

  return socketInstance;
};

export const onCallInitiated = (callback) => {
  if (socketInstance) {
    socketInstance.on('call_initiated', callback);
  }
};

export const initiateCall = (callData) => {
  if (socketInstance) {
    socketInstance.emit('initiate_call', callData);
    console.log('call initiated:', callData);
  }
};

export const onCallRejected = (callback) => {
  if (socketInstance) {
    socketInstance.on('call_rejected', callback);
  }
};

export const emitCallRejected = (data) => {
  if (socketInstance) {
    socketInstance.emit('call_rejected', data);
  }
};

export const disconnectSocket = () => {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
};

export const getSocket = () => socketInstance;
