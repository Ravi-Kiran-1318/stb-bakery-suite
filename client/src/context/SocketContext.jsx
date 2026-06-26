import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { AuthContext } from './AuthContext';

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (loading || !user) return;

    // Socket.IO must connect to the SERVER ROOT, not the /api sub-path
    const socketUrl = import.meta.env.VITE_SOCKET_URL ||
      (import.meta.env.VITE_API_URL || '').replace('/api', '') ||
      'http://localhost:5000';

    const newSocket = io(socketUrl, {
      withCredentials: true,
      transports: ['websocket', 'polling'],  // prefer websocket to avoid polling CORS issues
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
