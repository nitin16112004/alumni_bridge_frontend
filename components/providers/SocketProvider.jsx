import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import { SOCKET_URL } from '../../config/env';
import { addNotification } from '../../store/slices/notificationSlice';
import { addToast } from '../../store/slices/toastSlice';
import { SocketContext } from './socketContext';

export function SocketProvider({ children }) {
  const dispatch = useDispatch();
  const { token, role } = useSelector((state) => state.auth);
  const [socket, setSocket] = useState(null);
  const [status, setStatus] = useState('disconnected');

  useEffect(() => {
    if (!token || role === 'college') {
      socket?.disconnect();
      setSocket(null);
      setStatus('disconnected');
      return undefined;
    }

    const connection = io(SOCKET_URL, {
      auth: { token },
      transports: ['polling', 'websocket'],
      reconnection: true,
      reconnectionAttempts: 8,
      reconnectionDelay: 1000,
      timeout: 20000,
    });
    setSocket(connection);
    setStatus('connecting');

    const onConnect = () => setStatus('connected');
    const onDisconnect = () => setStatus('disconnected');
    const onConnectError = () => setStatus('disconnected');
    const onNotification = (notification) => {
      dispatch(addNotification(notification));
      dispatch(addToast({
        message: notification.message || 'You have a new notification.',
        type: notification.type || 'info',
      }));
    };

    connection.on('connect', onConnect);
    connection.on('disconnect', onDisconnect);
    connection.on('connect_error', onConnectError);
    connection.on('notification', onNotification);

    return () => {
      connection.off('connect', onConnect);
      connection.off('disconnect', onDisconnect);
      connection.off('connect_error', onConnectError);
      connection.off('notification', onNotification);
      connection.disconnect();
    };
  // A prior connection is always closed by the effect cleanup before token/role changes.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, role, token]);

  const value = useMemo(() => ({ socket, status }), [socket, status]);
  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}
