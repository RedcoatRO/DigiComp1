import React, { useState, useEffect } from 'react';
import { StartIcon, SearchIcon, FileExplorerIcon, WifiIcon, SoundIcon, SunIcon, MoonIcon, NotepadIcon, CalculatorIcon, EvaluationIcon } from './Icons';
import ScoreDisplay from './ScoreDisplay'; // Importăm noul component
import { AppWindowState, AppType } from '../types';

interface TaskbarProps {
  onToggleStart: () => void;
  onToggleSearch: () => void;
  onToggleTheme: () => void;
  onEvaluate: () => void;
  theme: 'light' | 'dark';
  openWindows: AppWindowState[];
  onWindowClick: (id: string) => void;
  onToggleMinimize: (id: string) => void;
  currentScore: number; // Prop nou pentru scorul live
}

const getAppIcon = (appType: AppType, className: string = "w-6 h-6") => {
    switch (appType) {
        case AppType.FILE_EXPLORER:
            return <FileExplorerIcon className={className} />;
        case AppType.NOTEPAD:
            return <NotepadIcon className={`${className} text-blue-700 dark:text-blue-300`} />;
        case AppType.CALCULATOR:
            return <CalculatorIcon className={`${className} text-gray-600 dark:text-gray-300`} />;
        default:
            return null;
    }
}

const Taskbar: React.FC<TaskbarProps> = (props) => {
  const { onToggleStart, onToggleSearch, onToggleTheme, onEvaluate, theme, openWindows, onWindowClick, onToggleMinimize, currentScore } = props;
  const [time, setTime] = useState(new Date());
  
  const activeWindowId = openWindows.length > 0 ? openWindows.reduce((max, w) => w.zIndex > max.zIndex ? w : max).id : null;

  useEffect(() => {
    const timerId = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timerId);
  }, []);

  const formatDate = (date: Date) => date.toLocaleDateString('ro-RO');
  const formatTime = (date: Date) => date.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' });
  
  return (
    <div className="absolute bottom-0 left-0 right-0 h-12 flex justify-between items-center px-4 bg-slate-200/70 dark:bg-slate-900/70 backdrop-blur-xl z-40">
      <div></div>

      <div className="flex items-center gap-2">
        <button className="p-2 rounded-md hover:bg-black/10 active:scale-95" onClick={onToggleStart} aria-label="Start Menu">
          <StartIcon className="w-6 h-6 text-blue-500" />
        </button>
        <button className="p-2 rounded-md hover:bg-black/10 active:scale-95" onClick={onToggleSearch} aria-label="Search">
          <SearchIcon className="w-6 h-6 text-gray-800 dark:text-gray-200" />
        </button>
        
        {/* Adăugăm componenta de scor lângă butonul de evaluare */}
        <ScoreDisplay score={currentScore} />
        
        <button
          className="px-3 py-1.5 flex items-center gap-2 rounded-md bg-green-500/80 hover:bg-green-600/80 text-white font-semibold text-sm active:scale-95 transition-all"
          onClick={onEvaluate}
          aria-label="Verifică-mă!"
          title="Finalizează exercițiul și vezi evaluarea performanței tale"
        >
          <EvaluationIcon className="w-5 h-5" />
          <span>Verifică-mă!</span>
        </button>
        
        {/* Randează o iconiță pentru fiecare fereastră deschisă */}
        {openWindows.map(win => (
            <button 
              key={win.id}
              className="p-2 rounded-md hover:bg-black/10 relative"
              onClick={() => {
                // Dacă fereastra e minimizată, o restaurăm. Altfel, o aducem în față.
                if(win.isMinimized) {
                    onToggleMinimize(win.id);
                } else {
                    onWindowClick(win.id);
                }
              }}
              aria-label={win.title}
            >
              {getAppIcon(win.appType)}
              {/* Indicator vizual pentru fereastra activă */}
              {(win.id === activeWindowId && !win.isMinimized) && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-1 bg-blue-500 rounded-full"></div>
              )}
               {/* Indicator vizual pentru fereastra minimizată */}
              {win.isMinimized && (
                 <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1 bg-gray-400 rounded-full"></div>
              )}
            </button>
        ))}
      </div>

      <div className="text-gray-800 dark:text-gray-200 flex items-center gap-4 text-xs">
        <div className="flex items-center gap-2">
            <button onClick={onToggleTheme} className="p-1 rounded-full hover:bg-black/10 active:scale-95" aria-label="Toggle theme">
                {theme === 'light' ? <MoonIcon className="w-5 h-5"/> : <SunIcon className="w-5 h-5"/>}
            </button>
            <WifiIcon className="w-4 h-4" />
            <SoundIcon className="w-4 h-4" />
        </div>
        <div className="text-right">
            <div>{formatTime(time)}</div>
            <div>{formatDate(time)}</div>
        </div>
      </div>
    </div>
  );
};

export default Taskbar;