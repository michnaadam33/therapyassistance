import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="relative">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-8 w-8 rounded-full border-t-2 border-l-2 border-indigo-400 animate-pulse"></div>
        </div>
      </div>
      <span className="ml-3 text-gray-600">Ładowanie...</span>
    </div>
  );
};

export default LoadingSpinner;
