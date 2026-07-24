import { Wifi, WifiOff } from 'lucide-react';
import { useSocket } from '../../hooks/useSocket';

export default function ConnectionStatus() {
  const { status } = useSocket();
  const connected = status === 'connected';
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold ${connected ? 'text-emerald-600' : 'text-slate-400'}`}>
      {connected ? <Wifi className="h-3 w-3" aria-hidden="true" /> : <WifiOff className="h-3 w-3" aria-hidden="true" />}
      {connected ? 'Live' : 'Offline'}
    </span>
  );
}
