import React, { useState, useEffect } from 'react';
import { Heart, HeartOff } from 'lucide-react';
import keepAliveService from '@/utils/keepAlive';

export const KeepAliveStatus = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [lastPing, setLastPing] = useState<Date | null>(null);

  useEffect(() => {
    // Check status every 5 seconds
    const interval = setInterval(() => {
      setIsRunning(keepAliveService.isRunning());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleToggle = () => {
    if (isRunning) {
      keepAliveService.stop();
    } else {
      keepAliveService.start();
    }
    setIsRunning(!isRunning);
  };

  // Only show in development
  if (import.meta.env.PROD) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg p-3 shadow-lg z-50">
      <div className="flex items-center space-x-2">
        <button
          onClick={handleToggle}
          className={`p-2 rounded-full transition-colors ${
            isRunning 
              ? 'bg-green-100 text-green-600 hover:bg-green-200' 
              : 'bg-red-100 text-red-600 hover:bg-red-200'
          }`}
          title={isRunning ? 'Stop Keep-Alive' : 'Start Keep-Alive'}
        >
          {isRunning ? <Heart className="w-4 h-4" /> : <HeartOff className="w-4 h-4" />}
        </button>
        <div className="text-xs">
          <div className="font-medium">
            Keep-Alive: {isRunning ? 'Active' : 'Inactive'}
          </div>
          {lastPing && (
            <div className="text-gray-500">
              Last ping: {lastPing.toLocaleTimeString()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
