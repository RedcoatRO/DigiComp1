import React from 'react';
import { LightbulbIcon, CloseIcon } from './Icons';

interface HintNotificationProps {
  message: string;
  onClose: () => void;
}

/**
 * Componentă pentru afișarea unei notificări cu un indiciu pentru utilizator.
 * Apare discret în colțul ecranului.
 */
const HintNotification: React.FC<HintNotificationProps> = ({ message, onClose }) => {
  return (
    <div
      className="fixed bottom-16 right-4 z-50 w-80 max-w-[calc(100vw-2rem)] bg-yellow-100 dark:bg-yellow-900/90 border border-yellow-300 dark:border-yellow-700 rounded-lg shadow-lg p-4 flex gap-4 animate-fade-in-up"
      role="alert"
    >
      <div className="flex-shrink-0">
        <LightbulbIcon className="w-6 h-6 text-yellow-500 dark:text-yellow-400" />
      </div>
      <div className="flex-grow">
        <p className="text-sm text-yellow-800 dark:text-yellow-200">{message}</p>
      </div>
      <div className="flex-shrink-0 -mr-1 -mt-1">
        <button
          onClick={onClose}
          className="p-1 rounded-full hover:bg-yellow-200 dark:hover:bg-yellow-800"
          aria-label="Close hint"
        >
          <CloseIcon className="w-4 h-4 text-yellow-700 dark:text-yellow-300" />
        </button>
      </div>
    </div>
  );
};

export default HintNotification;