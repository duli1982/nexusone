
import React from 'react';
import { NexusIcon } from './Icons';

const LoadingBubble: React.FC = () => {
  return (
    <div className="flex items-start gap-4 p-4">
      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center">
        <NexusIcon className="h-6 w-6 text-blue-400" />
      </div>
      <div className="max-w-sm rounded-xl p-4 bg-gray-800 rounded-tl-none flex items-center space-x-2">
        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
      </div>
    </div>
  );
};

export default LoadingBubble;
