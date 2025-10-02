import { useState, useEffect } from 'react';
import socket from '../socket';

function ConnectionStatus() {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [connectionError, setConnectionError] = useState(null);

  useEffect(() => {
    const onConnect = () => {
      setIsConnected(true);
      setConnectionError(null);
    };

    const onDisconnect = () => {
      setIsConnected(false);
      setConnectionError('Disconnected from server');
    };

    const onConnectError = (error) => {
      setIsConnected(false);
      setConnectionError('Failed to connect to server');
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onConnectError);
    };
  }, []);

  return (
    <div style={{
      position: 'fixed',
      top: '1rem',
      right: '1rem',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.75rem 1rem',
      borderRadius: '50px',
      background: isConnected 
        ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
        : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      color: 'white',
      fontSize: '0.875rem',
      fontWeight: '600',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      animation: isConnected ? 'none' : 'pulse 2s ease-in-out infinite'
    }}>
      <div style={{
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        background: 'white',
        animation: isConnected ? 'none' : 'pulse 1s ease-in-out infinite'
      }} />
      <span>
        {isConnected ? '🟢 Connected' : '🔴 ' + (connectionError || 'Connecting...')}
      </span>
    </div>
  );
}

export default ConnectionStatus;