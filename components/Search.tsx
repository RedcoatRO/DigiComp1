import React, { useState, useMemo } from 'react';
import {
  ChromeIcon, WordIcon, ExcelAppIcon, PowerPointIcon, NotepadIcon, SettingsIcon,
  CalculatorIcon, CalendarIcon, FileExplorerIcon, SearchIconLg,
  FolderIcon, PdfIcon, ExcelIcon as FileExcelIcon, TextIcon, WordFileIcon, ImageFileIcon
} from './Icons';
import { AppType, FileSystemNode, FileType } from '../types';
import { searchFileSystem, SearchResult } from '../utils/fileSystem';

interface AppDefinition {
    name: string;
    icon: React.ReactNode;
    appType?: AppType;
}

interface SearchProps {
    onOpenApp: (appType: AppType, state?: object) => void;
    fileSystem: FileSystemNode;
}

const getFileIcon = (node: FileSystemNode) => {
    if (node.type === 'folder') return <FolderIcon className="w-8 h-8" />;
    if (node.type === 'file') {
        switch(node.fileType) {
            case FileType.PDF: return <PdfIcon className="w-8 h-8" />;
            case FileType.Excel: return <FileExcelIcon className="w-8 h-8" />;
            case FileType.Text: return <TextIcon className="w-8 h-8" />;
            case FileType.Word: return <WordFileIcon className="w-8 h-8" />;
            case FileType.PNG: 
            case FileType.JPG: return <ImageFileIcon className="w-8 h-8" />;
            default: return <FolderIcon className="w-8 h-8" />;
        }
    }
    return <FolderIcon className="w-8 h-8" />;
}

const apps: AppDefinition[] = [
    { name: 'Google Chrome', icon: <ChromeIcon className="w-8 h-8" /> },
    { name: 'Word', icon: <WordIcon className="w-8 h-8 rounded" /> },
    { name: 'Excel', icon: <ExcelAppIcon className="w-8 h-8 rounded" /> },
    { name: 'PowerPoint', icon: <PowerPointIcon className="w-8 h-8 rounded" /> },
    { name: 'File Explorer', icon: <FileExplorerIcon className="w-8 h-8 text-yellow-500" />, appType: AppType.FILE_EXPLORER },
    { name: 'Notepad', icon: <NotepadIcon className="w-8 h-8 text-blue-700 dark:text-blue-300" />, appType: AppType.NOTEPAD },
    { name: 'Settings', icon: <SettingsIcon className="w-8 h-8 text-gray-600 dark:text-gray-300" /> },
    { name: 'Calculator', icon: <CalculatorIcon className="w-8 h-8 text-gray-600 dark:text-gray-300" />, appType: AppType.CALCULATOR },
    { name: 'Calendar', icon: <CalendarIcon className="w-8 h-8 text-red-500" /> },
];

const Search: React.FC<SearchProps> = ({ onOpenApp, fileSystem }) => {
    const [searchTerm, setSearchTerm] = useState('');
    
    const filteredApps = useMemo(() => {
        if (!searchTerm) return apps.slice(0, 5); // Display some apps if not searching
        return apps.filter(app => app.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [searchTerm]);

    const fileResults = useMemo(() => {
        if (!searchTerm.trim()) return [];
        return searchFileSystem(fileSystem, searchTerm);
    }, [searchTerm, fileSystem]);

    const handleFileClick = (result: SearchResult) => {
        // Open the parent folder and highlight the file (not implemented, but opens parent)
        const parentPath = result.path.slice(0, -1);
        onOpenApp(AppType.FILE_EXPLORER, { path: parentPath });
    };

    return (
        <div 
            className="absolute bottom-14 left-1/2 -translate-x-1/2 w-[550px] max-h-[70vh] flex flex-col bg-slate-200/80 dark:bg-slate-800/80 backdrop-blur-2xl rounded-lg shadow-2xl p-4 z-50 animate-fade-in-up"
            onClick={(e) => e.stopPropagation()}
        >
            <div className="relative flex items-center w-full mb-4 flex-shrink-0">
                <SearchIconLg className="absolute left-3 w-5 h-5 text-gray-500 dark:text-gray-400" />
                <input 
                    type="text" 
                    placeholder="Type here to search"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    autoFocus
                    className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            <div className="overflow-y-auto flex-grow pr-2 -mr-2">
                {filteredApps.length > 0 && (
                    <div className="mb-4">
                        <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Apps</h3>
                        <div className="space-y-1">
                            {filteredApps.map(app => (
                                <button 
                                    key={app.name} 
                                    onClick={() => app.appType && onOpenApp(app.appType)}
                                    className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-white/50 dark:hover:bg-white/10 text-left"
                                >
                                    {app.icon}
                                    <span className="text-sm text-gray-800 dark:text-gray-100">{app.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {(filteredApps.length > 0 && fileResults.length > 0) && (
                    <hr className="border-gray-300 dark:border-gray-600 my-2" />
                )}

                {fileResults.length > 0 && (
                    <div className="mb-4">
                        <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Files & Folders</h3>
                        <div className="space-y-1">
                            {fileResults.map(result => (
                                <button 
                                    key={result.node.id} 
                                    onClick={() => handleFileClick(result)}
                                    className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-white/50 dark:hover:bg-white/10 text-left"
                                >
                                    {getFileIcon(result.node)}
                                    <div className="overflow-hidden">
                                        <span className="text-sm text-gray-800 dark:text-gray-100 truncate block">{result.node.name}</span>
                                        <span className="text-xs text-gray-500 dark:text-gray-400 truncate block">{result.path.slice(0, -1).join(' > ')}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {filteredApps.length === 0 && fileResults.length === 0 && searchTerm && (
                    <div className="text-center py-8 text-gray-500">
                        No results found for "{searchTerm}"
                    </div>
                )}
            </div>
        </div>
    );
};

export default Search;
