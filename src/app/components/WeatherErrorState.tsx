import React from 'react';
import { CloudOff, RefreshCw } from 'lucide-react';

interface WeatherErrorStateProps {
  message: string;
  onRetry: () => void;
}

export default function WeatherErrorState({ message, onRetry }: WeatherErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mb-4">
        <CloudOff size={28} className="text-red-400" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">Weather data unavailable</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-6">{message}</p>
      <button
        onClick={onRetry}
        className="flex items-center gap-2 btn-primary"
      >
        <RefreshCw size={15} />
        Try Again
      </button>
    </div>
  );
}