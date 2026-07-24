import { useContext } from 'react';
import { SocketContext } from '../components/providers/socketContext';

export function useSocket() {
  return useContext(SocketContext);
}
