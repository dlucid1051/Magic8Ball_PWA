import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-40 flex items-center gap-2 rounded-xl bg-amber-950/90 border border-amber-600/40 px-3.5 py-2 text-xs font-medium text-amber-200 shadow-xl backdrop-blur-md animate-in fade-in">
      <WifiOff className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
      <span>Offline Mode — IndexedDB & Service Worker active.</span>
    </div>
  );
};
