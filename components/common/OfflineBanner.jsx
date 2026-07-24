import { WifiOff } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function OfflineBanner() {
  const [online, setOnline] = useState(() => navigator.onLine);

  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };
  }, []);

  if (online) return null;
  return (
    <div className="sticky top-16 z-30 flex items-center justify-center gap-2 bg-amber-500 px-4 py-2 text-center text-xs font-bold text-amber-950 lg:top-0" role="status">
      <WifiOff className="h-3.5 w-3.5" aria-hidden="true" />
      You are offline. Existing content remains visible, but updates will wait for a connection.
    </div>
  );
}
