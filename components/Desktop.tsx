import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FileExplorerIcon, RecycleBinIcon } from './Icons';
import { AppType } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface DesktopProps {
  onOpenExplorer: (appType: AppType, state?: object) => void;
}

// Componentă pentru o singură iconiță de pe desktop, acum este draggable.
const DraggableDesktopIcon: React.FC<{
  id: string;
  icon: React.ReactNode;
  label: string;
  onDoubleClick?: () => void;
  initialPosition: { x: number; y: number };
  onPositionChange: (id: string, pos: { x: number; y: number }) => void;
}> = ({ id, icon, label, onDoubleClick, initialPosition, onPositionChange }) => {
  const [position, setPosition] = useState(initialPosition);
  const dragStartOffset = useRef({ x: 0, y: 0 });
  const isDragging = useRef(false);

  useEffect(() => {
    setPosition(initialPosition);
  }, [initialPosition]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging.current) {
      const newPos = {
        x: e.clientX - dragStartOffset.current.x,
        y: e.clientY - dragStartOffset.current.y,
      };
      setPosition(newPos);
    }
  }, []);

  const handleMouseUp = useCallback(() => {
    if (isDragging.current) {
        isDragging.current = false;
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        // We need to read the position from the state, which is tricky inside a listener.
        // A functional update to setPosition or a ref could solve it, but for now we pass the latest position directly.
        setPosition(currentPos => {
            onPositionChange(id, currentPos);
            return currentPos;
        });
    }
  }, [id, onPositionChange, handleMouseMove]);
  
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    isDragging.current = true;
    dragStartOffset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }, [position, handleMouseMove, handleMouseUp]);


  return (
    <div
      style={{ left: position.x, top: position.y }}
      className="absolute flex flex-col items-center gap-1 p-2 rounded hover:bg-white/10 transition-colors cursor-pointer w-24 text-center"
      onMouseDown={handleMouseDown}
      onDoubleClick={onDoubleClick}
      aria-label={label}
      role="button"
      tabIndex={0}
    >
      {icon}
      <span className="text-white text-xs select-none shadow-black [text-shadow:1px_1px_2px_var(--tw-shadow-color)] break-words">{label}</span>
    </div>
  );
};

const Desktop: React.FC<DesktopProps> = ({ onOpenExplorer }) => {
  // Am actualizat cheile de stocare pentru a fi mai descriptive și pentru a reflecta noile denumiri.
  const [iconPositions, setIconPositions] = useLocalStorage<{ [key: string]: { x: number, y: number } }>('desktop-icon-positions-v2', {
    'this-pc-desktop': { x: 20, y: 20 },
    'recycle-bin': { x: 20, y: 120 },
  });

  const handlePositionChange = (id: string, pos: { x: number, y: number }) => {
    setIconPositions(prev => ({ ...prev, [id]: pos }));
  };

  // Configurația iconițelor de pe desktop.
  // "Resurse 2023" a fost redenumit în "This PC", iar acțiunea și iconița sa au fost actualizate.
  const ICONS_CONFIG = [
    {
      id: 'this-pc-desktop',
      icon: <FileExplorerIcon className="w-12 h-12 text-blue-500" />,
      label: 'This PC',
      onDoubleClick: () => onOpenExplorer(AppType.FILE_EXPLORER, { path: ['This PC'] }),
    },
    {
      id: 'recycle-bin',
      icon: <RecycleBinIcon className="w-12 h-12" />,
      label: 'Recycle Bin',
      onDoubleClick: () => onOpenExplorer(AppType.FILE_EXPLORER, { path: ['This PC', 'Recycle Bin'] }),
    }
  ];

  return (
    <div className="absolute inset-0 h-full w-full">
        {ICONS_CONFIG.map(config => (
            <DraggableDesktopIcon
                key={config.id}
                id={config.id}
                icon={config.icon}
                label={config.label}
                onDoubleClick={config.onDoubleClick}
                initialPosition={iconPositions[config.id] || { x: 20, y: 20}}
                onPositionChange={handlePositionChange}
            />
        ))}
    </div>
  );
};

export default Desktop;