import React, { useRef, useCallback, ReactNode, memo } from 'react';
import { AppWindowState, WindowPosition, WindowSize } from '../types';
import { FileExplorerIcon, NotepadIcon, CalculatorIcon, CloseIcon, MaximizeIcon, MinimizeIcon, RestoreIcon } from './Icons';

interface WindowProps {
  state: AppWindowState;
  children: ReactNode;
  onClose: () => void;
  onMinimize: () => void;
  onFocus: () => void;
  setWindowState: (updater: (prevState: AppWindowState) => AppWindowState) => void;
}

const getAppIcon = (appType: string) => {
    switch (appType) {
        case 'FILE_EXPLORER': return <FileExplorerIcon className="w-4 h-4" />;
        case 'NOTEPAD': return <NotepadIcon className="w-4 h-4 text-blue-700 dark:text-blue-300" />;
        case 'CALCULATOR': return <CalculatorIcon className="w-4 h-4 text-gray-700 dark:text-gray-300" />;
        default: return null;
    }
};

const WindowComponent: React.FC<WindowProps> = ({ state, children, onClose, onMinimize, onFocus, setWindowState }) => {
    const { id, title, position, size, isMaximized, isMinimized, zIndex, appType } = state;
    const dragRef = useRef({ isDragging: false, isResizing: false, handle: '', startX: 0, startY: 0, startWidth: 0, startHeight: 0, startLeft: 0, startTop: 0 });

    const handleMaximizeToggle = () => {
        setWindowState(prev => {
            if (prev.isMaximized) {
                // Restore
                return { 
                    ...prev, 
                    isMaximized: false, 
                    position: prev.preMaximizedState?.position || { x: 100, y: 100 },
                    size: prev.preMaximizedState?.size || { width: 900, height: 600 }
                };
            } else {
                // Maximize
                return {
                    ...prev,
                    isMaximized: true,
                    preMaximizedState: { position: prev.position, size: prev.size }, // Salvează starea curentă
                    position: { x: 0, y: 0 },
                    size: { width: window.innerWidth, height: window.innerHeight - 48 } // Ocupă tot ecranul minus Taskbar
                };
            }
        });
    };

    const handleMouseDown = useCallback((e: React.MouseEvent, handle: string) => {
        e.preventDefault();
        e.stopPropagation();
        onFocus();

        if (isMaximized) return;

        dragRef.current = {
            isDragging: handle === 'drag',
            isResizing: handle !== 'drag',
            handle,
            startX: e.clientX,
            startY: e.clientY,
            startWidth: size.width,
            startHeight: size.height,
            startLeft: position.x,
            startTop: position.y,
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    }, [onFocus, isMaximized, size, position]);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        const { isDragging, isResizing, handle, startX, startY, startWidth, startHeight, startLeft, startTop } = dragRef.current;
        if (!isDragging && !isResizing) return;

        const dx = e.clientX - startX;
        const dy = e.clientY - startY;

        setWindowState(prev => {
            let newPos = { ...prev.position };
            let newSize = { ...prev.size };

            if (isDragging) {
                newPos = { x: startLeft + dx, y: startTop + dy };
            } else if (isResizing) {
                if (handle.includes('right')) newSize.width = Math.max(300, startWidth + dx);
                if (handle.includes('left')) {
                    newSize.width = Math.max(300, startWidth - dx);
                    newPos.x = startLeft + dx;
                }
                if (handle.includes('bottom')) newSize.height = Math.max(200, startHeight + dy);
                if (handle.includes('top')) {
                    newSize.height = Math.max(200, startHeight - dy);
                    newPos.y = startTop + dy;
                }
            }
            return { ...prev, position: newPos, size: newSize };
        });
    }, [setWindowState]);

    const handleMouseUp = useCallback(() => {
        dragRef.current.isDragging = false;
        dragRef.current.isResizing = false;
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
    }, [handleMouseMove]);

    const resizeHandles: { name: string; className: string }[] = [
        { name: 'top-left', className: 'top-0 left-0 w-2 h-2 cursor-nwse-resize' },
        { name: 'top-right', className: 'top-0 right-0 w-2 h-2 cursor-nesw-resize' },
        { name: 'bottom-left', className: 'bottom-0 left-0 w-2 h-2 cursor-nesw-resize' },
        { name: 'bottom-right', className: 'bottom-0 right-0 w-2 h-2 cursor-nwse-resize' },
        { name: 'top', className: 'top-0 left-2 w-[calc(100%-1rem)] h-1 cursor-ns-resize' },
        { name: 'bottom', className: 'bottom-0 left-2 w-[calc(100%-1rem)] h-1 cursor-ns-resize' },
        { name: 'left', className: 'top-2 left-0 w-1 h-[calc(100%-1rem)] cursor-ew-resize' },
        { name: 'right', className: 'top-2 right-0 w-1 h-[calc(100%-1rem)] cursor-ew-resize' },
    ];

    return (
        <div
            style={{
                top: `${position.y}px`,
                left: `${position.x}px`,
                width: `${size.width}px`,
                height: `${size.height}px`,
                zIndex: zIndex,
                display: isMinimized ? 'none' : 'flex',
                transition: isMaximized || state.preMaximizedState ? 'top 0.2s ease, left 0.2s ease, width 0.2s ease, height 0.2s ease' : 'none',
            }}
            className="absolute bg-slate-200/70 dark:bg-gray-800/80 backdrop-blur-xl shadow-2xl rounded-lg flex-col border border-white/10 animate-zoom-in"
            onMouseDown={onFocus}
        >
            {/* Mânere de redimensionare */}
            {!isMaximized && resizeHandles.map(handle => (
                <div key={handle.name} onMouseDown={(e) => handleMouseDown(e, handle.name)} className={`absolute ${handle.className} z-10`} />
            ))}
            
            {/* Bara de titlu */}
            <div
                onMouseDown={(e) => handleMouseDown(e, 'drag')}
                onDoubleClick={handleMaximizeToggle}
                className="flex items-center justify-between h-9 bg-gray-100/80 dark:bg-gray-900/80 rounded-t-lg px-2 text-gray-800 dark:text-gray-200 flex-shrink-0 cursor-move"
            >
                <div className="flex items-center gap-2">
                    {getAppIcon(appType)}
                    <span className="text-xs font-semibold">{title}</span>
                </div>
                <div className="flex items-center" onMouseDown={(e) => e.stopPropagation()}>
                    <button onClick={onMinimize} className="p-2 hover:bg-gray-300/80 dark:hover:bg-gray-700/80 rounded active:scale-95"><MinimizeIcon className="w-4 h-4" /></button>
                    <button onClick={handleMaximizeToggle} className="p-2 hover:bg-gray-300/80 dark:hover:bg-gray-700/80 rounded active:scale-95">
                        {isMaximized ? <RestoreIcon className="w-4 h-4" /> : <MaximizeIcon className="w-4 h-4" />}
                    </button>
                    <button onClick={onClose} className="p-2 hover:bg-red-500 hover:text-white rounded active:scale-95"><CloseIcon className="w-4 h-4" /></button>
                </div>
            </div>
            
            {/* Conținutul ferestrei */}
            <div className="flex-grow overflow-hidden">
                {children}
            </div>
        </div>
    );
};

export default memo(WindowComponent);
