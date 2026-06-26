import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { AuthContext } from './AuthContext';

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (loading || !user) return;

    const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
      withCredentials: true,
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      if (user.role === 'admin') {
        newSocket.emit('join_admin');
      } else {
        newSocket.emit('join_room', user.id);
      }
    });

    return () => newSocket.disconnect();
  }, [user, loading]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};
