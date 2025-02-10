import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorAlertProps {
  message: string;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({ message }) => {
  return (
    <div className="bg-red-500/10 border border-red-500 rounded-lg p-4 m-4">
      <div className="flex items-center gap-2 text-red-500">
        <AlertCircle className="w-6 h-6" />
        <span className="text-lg">{message}</span>
      </div>
    </div>
  );
}; 