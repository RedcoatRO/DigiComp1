import React, { useState, useCallback, useEffect, useRef } from 'react';
import Desktop from './components/Desktop';
import Taskbar from './components/Taskbar';
import FileExplorer from './components/FileExplorer';
import StartMenu from './components/StartMenu';
import Search from './components/Search';
import Window from './components/Window';
import Notepad from './components/Notepad';
import Calculator from './components/Calculator';
import EvaluationModal from './components/EvaluationModal';
import HintNotification from './components/HintNotification';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useActionLogger } from './hooks/useActionLogger';
import { getInitialFileSystem } from './constants';
import { AppWindowState, AppType, FileSystemNode, ActionType, EvaluationResult } from './types';
import * as fs from './utils/fileSystem';
import { calculateScore, calculateLiveScore } from './utils/evaluation';

const App: React.FC = () => {
  // --- STATE MANAGEMENT ---
  const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('theme', 'dark');
  const [fileSystem, setFileSystem] = useLocalStorage<FileSystemNode>('fileSystem', getInitialFileSystem());
  const [openWindows, setOpenWindows] = useLocalStorage<AppWindowState[]>('openWindows', []);
  const [isStartMenuOpen, setIsStartMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // --- EVALUATION & HINT SYSTEM STATE ---
  const { actions, logAction, resetActions } = useActionLogger();
  const [evaluationResult, setEvaluationResult] = useState<EvaluationResult | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [wasHintShown, setWasHintShown] = useState(false);
  const hintTimeoutRef = useRef<number | null>(null);
  // Stare nouă pentru scorul live. Inițializat cu 10.
  const [currentScore, setCurrentScore] = useState(10);


  // --- THEME LOGIC ---
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(theme === 'dark' ? 'light' : 'dark');
    root.classList.add(theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  }, [setTheme]);

  // --- SCORE & HINT SYSTEM LOGIC ---

  /**
   * Acest effect se declanșează la fiecare acțiune a utilizatorului.
   * Calculează scorul live și verifică dacă trebuie afișat un indiciu.
   */
  useEffect(() => {
    // 1. Calculează și actualizează scorul live afișat în Taskbar.
    const liveScore = calculateLiveScore(actions);
    setCurrentScore(liveScore);

    // 2. Logica pentru afișarea indiciilor (nemodificată).
    if (wasHintShown || evaluationResult) return;

    const showHint = (message: string) => {
        setHint(message);
        setWasHintShown(true);
        if(hintTimeoutRef.current) clearTimeout(hintTimeoutRef.current);
        hintTimeoutRef.current = window.setTimeout(() => setHint(null), 15000);
    };

    const navigationActions = actions.filter(a => a.type === ActionType.NAVIGATE);
    if (navigationActions.length >= 5) {
        const hasReachedTargetFolder = navigationActions.some(a => a.payload.path.includes('Resurse 2023'));
        if (!hasReachedTargetFolder) {
            showHint("Indiciu: Fișierul pe care îl cauți se află în folderul 'Resurse 2023'.");
            return;
        }
    }
    
    const searchActions = actions.filter(a => a.type === ActionType.SEARCH);
    if (searchActions.length >= 3) {
        const lastSearch = searchActions[searchActions.length - 1].payload;
        if (!lastSearch.filters.type) {
            showHint("Indiciu: Încearcă să folosești filtrele avansate pentru a rafina căutarea după tipul fișierului.");
            return;
        }
    }

  }, [actions, wasHintShown, evaluationResult]);

  // --- EVALUATION LOGIC ---
  const handleEvaluate = () => {
    const result = calculateScore(actions);
    setEvaluationResult(result);
    setHint(null);
    if(hintTimeoutRef.current) clearTimeout(hintTimeoutRef.current);
  };


  // --- WINDOW MANAGEMENT ---
  const bringToFront = useCallback((windowId: string) => {
    setOpenWindows(windows => {
        const maxZIndex = Math.max(0, ...windows.map(w => w.zIndex));
        return windows.map(w => w.id === windowId ? { ...w, zIndex: maxZIndex + 1, isMinimized: false } : w);
    });
  }, [setOpenWindows]);

  const openApp = useCallback((appType: AppType, appState?: object) => {
    logAction(ActionType.APP_OPEN, { appType, appState });
    const newWindowId = `window-${Date.now()}`;
    const maxZIndex = Math.max(0, ...openWindows.map(w => w.zIndex));
    
    let newWindow: AppWindowState;
    switch(appType) {
        case AppType.FILE_EXPLORER:
            newWindow = {
                id: newWindowId,
                appType,
                title: 'File Explorer',
                position: { x: window.innerWidth / 2 - 450, y: window.innerHeight / 2 - 300 },
                size: { width: 900, height: 600 },
                isMinimized: false, isMaximized: false, zIndex: maxZIndex + 1,
                appState: appState || { path: ['This PC'] },
            };
            break;
        case AppType.NOTEPAD:
            newWindow = {
                id: newWindowId,
                appType,
                title: 'Untitled - Notepad',
                position: { x: window.innerWidth / 2 - 300, y: window.innerHeight / 2 - 250 },
                size: { width: 600, height: 500 },
                isMinimized: false, isMaximized: false, zIndex: maxZIndex + 1,
                appState: { content: '' },
            };
            break;
        case AppType.CALCULATOR:
            newWindow = {
                id: newWindowId,
                appType,
                title: 'Calculator',
                position: { x: window.innerWidth / 2 - 175, y: window.innerHeight / 2 - 250 },
                size: { width: 350, height: 500 },
                isMinimized: false, isMaximized: false, zIndex: maxZIndex + 1,
            };
            break;
    }

    setOpenWindows(prev => [...prev, newWindow]);
    closeAllPopups();
  }, [openWindows, setOpenWindows, logAction]);

  const closeWindow = useCallback((windowId: string) => {
    setOpenWindows(windows => windows.filter(w => w.id !== windowId));
  }, [setOpenWindows]);
  
  const toggleMinimize = useCallback((windowId: string) => {
    setOpenWindows(windows => windows.map(w => {
        if (w.id === windowId) {
            if (w.isMinimized) {
                bringToFront(windowId);
                return { ...w, isMinimized: false };
            }
            return { ...w, isMinimized: true };
        }
        return w;
    }));
  }, [setOpenWindows, bringToFront]);
  
  // --- FILE SYSTEM OPERATIONS ---
  const handleFileSystemUpdate = (updater: (fs: FileSystemNode) => FileSystemNode) => {
      setFileSystem(currentFs => updater(currentFs));
  };
  
  const createFolder = (path: string[], newFolderName: string) => handleFileSystemUpdate(currentFs => fs.addNode(currentFs, path, { id: `folder-${Date.now()}`, name: newFolderName, type: 'folder', children: [] }));
  const renameNode = (path: string[], newName: string) => handleFileSystemUpdate(currentFs => fs.renameNode(currentFs, path, newName));
  const deleteNode = (path: string[]) => handleFileSystemUpdate(currentFs => fs.deleteNode(currentFs, path));
  const restoreNode = (path: string[]) => handleFileSystemUpdate(currentFs => fs.restoreNode(currentFs, path));

  // --- UI TOGGLES ---
  const closeAllPopups = () => {
    setIsStartMenuOpen(false);
    setIsSearchOpen(false);
  };
  
  const toggleStartMenu = useCallback(() => {
      setIsSearchOpen(false);
      setIsStartMenuOpen(prev => !prev);
  }, []);

  const toggleSearch = useCallback(() => {
      setIsStartMenuOpen(false);
      setIsSearchOpen(prev => !prev);
  }, []);

  // --- RENDER LOGIC ---
  const renderAppContent = (windowState: AppWindowState) => {
      const { appType, appState } = windowState;
      switch(appType) {
          case AppType.FILE_EXPLORER:
              return <FileExplorer 
                initialPath={appState?.path || ['This PC']}
                fileSystem={fileSystem}
                createFolder={createFolder}
                renameNode={renameNode}
                deleteNode={deleteNode}
                restoreNode={restoreNode}
                openApp={openApp}
                logAction={logAction}
                onEvaluate={handleEvaluate} // Pasăm funcția de evaluare
              />;
          case AppType.NOTEPAD:
              return <Notepad />;
          case AppType.CALCULATOR:
              return <Calculator />;
          default:
              return null;
      }
  };

  const backgroundImageUrl = 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=2070&auto=format&fit=crop';

  return (
    <div className="w-screen h-screen bg-cover bg-center overflow-hidden select-none" style={{ backgroundImage: `url(${backgroundImageUrl})` }}>
      <Desktop onOpenExplorer={openApp} />
      
      {(isStartMenuOpen || isSearchOpen) && (
        <div className="absolute inset-0 z-30" onClick={closeAllPopups} />
      )}
      
      {isStartMenuOpen && <StartMenu onOpenApp={openApp} />}
      {isSearchOpen && <Search onOpenApp={openApp} fileSystem={fileSystem} />}
      
      <Taskbar 
        onToggleStart={toggleStartMenu}
        onToggleSearch={toggleSearch} 
        onToggleTheme={toggleTheme}
        onEvaluate={handleEvaluate}
        theme={theme}
        openWindows={openWindows}
        onWindowClick={bringToFront}
        onToggleMinimize={toggleMinimize}
        currentScore={currentScore} // Pasăm scorul live către Taskbar
      />
      
      {openWindows.map(windowState => (
        <Window
            key={windowState.id}
            state={windowState}
            onClose={() => closeWindow(windowState.id)}
            onMinimize={() => toggleMinimize(windowState.id)}
            onFocus={() => bringToFront(windowState.id)}
            setWindowState={(updater) => setOpenWindows(wins => wins.map(w => w.id === windowState.id ? updater(w) : w))}
        >
            {renderAppContent(windowState)}
        </Window>
      ))}

      {evaluationResult && (
        <EvaluationModal
          score={evaluationResult.score}
          feedback={evaluationResult.feedback}
          details={evaluationResult.details}
          // Prop-ul onClose a fost eliminat pentru a preveni închiderea ferestrei de evaluare.
          // Acest lucru asigură că rezultatul rămâne vizibil pentru citirea de către platforme externe.
          // Logica de resetare a aplicației, care era în onClose, nu se va mai executa.
        />
      )}

      {hint && (
          <HintNotification message={hint} onClose={() => setHint(null)} />
      )}
    </div>
  );
};

export default App;
