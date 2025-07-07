import React from 'react';

const Notepad: React.FC = () => {
  return (
    <div className="h-full w-full bg-white dark:bg-gray-800 text-black dark:text-white">
      <textarea
        className="w-full h-full p-2 bg-transparent resize-none focus:outline-none font-mono text-sm"
        placeholder="Start typing..."
      />
    </div>
  );
};

export default Notepad;
