import React from 'react';
import { AppType } from '../types';
import {
  ChromeIcon, WordIcon, ExcelAppIcon, PowerPointIcon, NotepadIcon, SettingsIcon,
  CalculatorIcon, CalendarIcon, FileExplorerIcon
} from './Icons';

interface StartMenuProps {
    onOpenApp: (appType: AppType) => void;
}

// Componentă generică pentru o iconiță din meniul Start
const AppIcon: React.FC<{ icon: React.ReactNode, label: string, onClick?: () => void }> = ({ icon, label, onClick }) => (
  <button 
    onClick={onClick}
    className="flex flex-col items-center justify-center gap-2 p-2 rounded-md hover:bg-white/10 dark:hover:bg-white/20 text-center w-full active:scale-95 transition-transform"
  >
    {icon}
    <span className="text-xs text-gray-800 dark:text-white">{label}</span>
  </button>
);

const StartMenu: React.FC<StartMenuProps> = ({ onOpenApp }) => {
  return (
    <div
      className="absolute bottom-14 left-1/2 -translate-x-1/2 w-[550px] h-auto bg-slate-200/80 dark:bg-slate-800/80 backdrop-blur-2xl rounded-lg shadow-2xl p-6 z-50 animate-fade-in-up"
      onClick={(e) => e.stopPropagation()} // Previne închiderea la click în interior
    >
      <div className="grid grid-cols-6 gap-x-4 gap-y-6">
        <AppIcon icon={<ChromeIcon className="w-10 h-10" />} label="Chrome" />
        <AppIcon icon={<WordIcon className="w-10 h-10 rounded-md" />} label="Word" />
        <AppIcon icon={<ExcelAppIcon className="w-10 h-10 rounded-md" />} label="Excel" />
        <AppIcon icon={<PowerPointIcon className="w-10 h-10 rounded-md" />} label="PowerPoint" />
        <AppIcon icon={<FileExplorerIcon className="w-10 h-10 text-yellow-500" />} label="Explorer" onClick={() => onOpenApp(AppType.FILE_EXPLORER)} />
        <AppIcon icon={<NotepadIcon className="w-10 h-10 text-blue-700 dark:text-blue-300" />} label="Notepad" onClick={() => onOpenApp(AppType.NOTEPAD)} />
        <AppIcon icon={<SettingsIcon className="w-10 h-10 text-gray-600 dark:text-gray-300" />} label="Settings" />
        <AppIcon icon={<CalculatorIcon className="w-10 h-10 text-gray-600 dark:text-gray-300" />} label="Calculator" onClick={() => onOpenApp(AppType.CALCULATOR)} />
        <AppIcon icon={<CalendarIcon className="w-10 h-10 text-red-500" />} label="Calendar" />
      </div>

      <div className="mt-8">
        <h2 className="text-md font-semibold text-gray-800 dark:text-white mb-2">Recommended</h2>
        <div className="text-center text-sm text-gray-500 dark:text-gray-400 p-4">
          No recent items
        </div>
      </div>
    </div>
  );
};

export default StartMenu;
