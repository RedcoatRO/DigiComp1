import React from 'react';

// Interfață extinsă pentru opțiunile meniului, acum suportă iconițe și separatoare
interface ContextMenuOption {
  label: string;
  action: () => void;
  icon?: React.ReactNode;
  isSeparator?: boolean;
}

interface ContextMenuProps {
  x: number;
  y: number;
  options: ContextMenuOption[];
  onClose: () => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, options, onClose }) => {
  // Calculează înălțimea estimată pentru a se asigura că meniul nu iese din ecran
  const getMenuHeight = () => {
    let height = 0;
    options.forEach(opt => {
      height += opt.isSeparator ? 9 : 32; // 32px per item, 9px per separator
    });
    return height;
  };

  const position = (() => {
    const menuWidth = 200;
    const menuHeight = getMenuHeight();
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    let newX = x;
    let newY = y;

    if (x + menuWidth > screenWidth) newX = screenWidth - menuWidth - 5;
    if (y + menuHeight > screenHeight) newY = screenHeight - menuHeight - 5;
    
    return { top: newY, left: newX };
  })();

  const handleMouseMove = (e: React.MouseEvent<HTMLLIElement, MouseEvent>) => {
    const target = e.currentTarget;
    const rect = target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    target.style.setProperty('--mouse-x', `${x}px`);
    target.style.setProperty('--mouse-y', `${y}px`);
  };

  return (
    <div
      style={position}
      className="fixed z-50 w-52 bg-slate-200/80 dark:bg-gray-800/90 backdrop-blur-md border border-gray-400/50 dark:border-gray-600/50 rounded-lg shadow-2xl py-1.5 animate-fade-in-fast"
    >
      <ul>
        {options.map((option, index) => {
          if (option.isSeparator) {
            return <li key={`sep-${index}`}><hr className="border-t border-gray-400/50 dark:border-gray-600/50 my-1" /></li>;
          }
          return (
            <li key={option.label} onMouseMove={handleMouseMove} className="reveal-highlight mx-1.5 rounded">
              <button
                onClick={option.action}
                className="w-full text-left px-3 py-1.5 text-sm text-gray-800 dark:text-gray-200 flex items-center gap-3 rounded"
              >
                <span className="w-4 h-4 text-gray-700 dark:text-gray-300">{option.icon || <span />}</span>
                <span>{option.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default ContextMenu;
