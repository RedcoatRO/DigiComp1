import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { findNodeByPath } from '../utils/fileSystem';
import { FileSystemNode, VirtualFileNode, ViewMode, FileType, AppType, ActionType, SearchFilters } from '../types';
import { SearchIconLg, UpArrowIcon, LeftArrowIcon, RightArrowIcon, ViewIcon, CheckIcon, GridIcon, ListIcon, DetailsIcon, FolderIcon, DriveIcon, PdfIcon, ExcelIcon, TextIcon, RecycleBinIcon, RestoreIcon, DeleteIcon, RenameIcon, FilterIcon } from './Icons';
import FileItemRow from './FileItemRow';
import FileItemIcon from './FileItemIcon';
import FileItemList from './FileItemList';
import ContextMenu from './ContextMenu';

interface FileExplorerProps {
    initialPath: string[];
    fileSystem: FileSystemNode;
    createFolder: (path: string[], newFolderName: string) => void;
    renameNode: (path: string[], newName: string) => void;
    deleteNode: (path: string[]) => void;
    restoreNode: (path: string[]) => void;
    openApp: (appType: AppType, appState?: object) => void;
    logAction: (type: ActionType, payload: any) => void;
    onEvaluate: () => void; // Funcție pentru a declanșa evaluarea
}

type SortKey = 'name' | 'modifiedDate' | 'sizeKB' | 'type';
type SortDirection = 'asc' | 'desc';

// Helper pentru a crea o dată în trecut
const daysAgo = (days: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};

const FileExplorer: React.FC<FileExplorerProps> = (props) => {
  const { initialPath, fileSystem, createFolder, renameNode, deleteNode, restoreNode, openApp, logAction, onEvaluate } = props;
  const [currentPath, setCurrentPath] = useState<string[]>(initialPath);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({});
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);

  const [viewMode, setViewMode] = useState<ViewMode>('details');
  const [isViewDropdownOpen, setIsViewDropdownOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, node?: FileSystemNode } | null>(null);
  const [renamingNodeId, setRenamingNodeId] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection }>({ key: 'name', direction: 'asc' });

  const viewDropdownRef = useRef<HTMLDivElement>(null);
  const filterDropdownRef = useRef<HTMLDivElement>(null);
  const fileListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Înregistrează acțiunea de navigare inițială
    logAction(ActionType.NAVIGATE, { path: initialPath });
  }, []); // Rulează o singură dată

  const currentFolderNode = useMemo(() => findNodeByPath(fileSystem, currentPath.slice(1)), [fileSystem, currentPath]);
  const currentFolderContents = useMemo((): FileSystemNode[] => (currentFolderNode && 'children' in currentFolderNode) ? currentFolderNode.children : [], [currentFolderNode]);
  const isInRecycleBin = useMemo(() => currentPath.length > 1 && currentPath[currentPath.length-1] === 'Recycle Bin', [currentPath]);

  // Logica de filtrare și sortare a fost extinsă pentru a include noile filtre avansate.
  const sortedAndFilteredFiles = useMemo(() => {
    let filtered = currentFolderContents
      // 1. Filtrare după textul din search bar
      .filter(node => node.name.toLowerCase().includes(searchQuery.toLowerCase()))
      // 2. Filtrare avansată după tip, mărime și dată
      .filter(node => {
        if (node.type !== 'file') return true; // Păstrează folderele
        const file = node as VirtualFileNode;
        const { type, size, date } = filters;
        
        if (type && file.fileType !== type) return false;
        if (size) {
            if (size.comparison === 'gt' && file.sizeKB <= size.value) return false;
            if (size.comparison === 'lt' && file.sizeKB >= size.value) return false;
        }
        if (date && file.modifiedDate < date.since) return false;
        
        return true;
      });

    // 3. Sortare
    filtered.sort((a, b) => {
      const aIsFolder = a.type === 'folder' || a.type === 'drive';
      const bIsFolder = b.type === 'folder' || b.type === 'drive';
      if (aIsFolder && !bIsFolder) return -1;
      if (!bIsFolder && aIsFolder) return 1;

      let comparison = 0;
      const { key, direction } = sortConfig;
      const valA = a[key as keyof typeof a];
      const valB = b[key as keyof typeof b];

      switch(key) {
        case 'name': comparison = a.name.localeCompare(b.name); break;
        case 'type':
          const typeA = aIsFolder ? 'folder' : (a as VirtualFileNode).fileType;
          const typeB = bIsFolder ? 'folder' : (b as VirtualFileNode).fileType;
          comparison = typeA.localeCompare(typeB);
          break;
        case 'modifiedDate':
          const dateA = (a as VirtualFileNode).modifiedDate?.getTime() || 0;
          const dateB = (b as VirtualFileNode).modifiedDate?.getTime() || 0;
          comparison = dateA - dateB;
          break;
        case 'sizeKB':
          const sizeA = (a as VirtualFileNode).sizeKB ?? -1;
          const sizeB = (b as VirtualFileNode).sizeKB ?? -1;
          comparison = sizeA - sizeB;
          break;
      }
      return direction === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [searchQuery, filters, currentFolderContents, sortConfig]);
  
  // Înregistrează acțiunea de căutare de fiecare dată când se schimbă textul sau filtrele
  useEffect(() => {
    if (searchQuery || Object.keys(filters).length > 0) {
        logAction(ActionType.SEARCH, { query: searchQuery, filters });
    }
  }, [searchQuery, filters, logAction]);


  const requestSort = (key: SortKey) => {
    let direction: SortDirection = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };
  
  const navigateTo = useCallback((path: string[]) => {
      setCurrentPath(path);
      setSearchQuery('');
      setFilters({}); // Resetează filtrele la navigare
      logAction(ActionType.NAVIGATE, { path });
  }, [logAction]);

  const handleNodeDoubleClick = useCallback((node: FileSystemNode) => {
    logAction(ActionType.FILE_OPEN, { path: [...currentPath, node.name], node });
    
    // Dacă se dă dublu-click pe fișierul țintă, se finalizează exercițiul
    if (node.type === 'file' && node.id === 'file-1') {
      onEvaluate();
      return;
    }
    
    if (node.type === 'folder' || node.type === 'drive') {
        navigateTo([...currentPath, node.name]);
    }
  }, [currentPath, navigateTo, logAction, onEvaluate]);
  
  const navigateUp = useCallback(() => { if (currentPath.length > 1) navigateTo(currentPath.slice(0, -1)); }, [currentPath, navigateTo]);
  const handleBreadcrumbClick = (index: number) => navigateTo(currentPath.slice(0, index + 1));
  const closeContextMenu = useCallback(() => setContextMenu(null), []);

  const handleContextMenu = useCallback((e: React.MouseEvent, node?: FileSystemNode) => {
    e.preventDefault();
    e.stopPropagation();
    closeContextMenu();
    setIsViewDropdownOpen(false);
    setIsFilterDropdownOpen(false);
    setContextMenu({ x: e.clientX, y: e.clientY, node });
  }, [closeContextMenu]);

  const handleRename = (node: FileSystemNode, newName: string) => {
    if (newName && newName !== node.name) {
      const nodePath = [...currentPath, node.name];
      renameNode(nodePath, newName);
    }
    setRenamingNodeId(null);
  };
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        closeContextMenu();
        if (isViewDropdownOpen && viewDropdownRef.current && !viewDropdownRef.current.contains(event.target as Node)) setIsViewDropdownOpen(false);
        if (isFilterDropdownOpen && filterDropdownRef.current && !filterDropdownRef.current.contains(event.target as Node)) setIsFilterDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isViewDropdownOpen, isFilterDropdownOpen, contextMenu, closeContextMenu]);
  
  const contextMenuOptions = useMemo(() => {
      if (!contextMenu) return [];
      const { node } = contextMenu;
      let options: { label: string; icon?: React.ReactNode; action: () => void; isSeparator?: boolean }[] = [];
      
      if (node) { 
          const nodePath = [...currentPath, node.name];
          if (isInRecycleBin) {
              options.push({ label: 'Restore', icon: <RestoreIcon />, action: () => { restoreNode(nodePath); closeContextMenu(); } });
              options.push({ label: 'Delete permanently', icon: <DeleteIcon />, action: () => { closeContextMenu(); } });
          } else {
              options.push({ label: 'Open', icon: <FolderIcon className="w-4 h-4"/>, action: () => { handleNodeDoubleClick(node); closeContextMenu(); } });
              options.push({ isSeparator: true, label: 'sep1', action: () => {} });
              options.push({ label: 'Rename', icon: <RenameIcon />, action: () => { setRenamingNodeId(node.id); closeContextMenu(); } });
              options.push({ label: 'Delete', icon: <DeleteIcon />, action: () => { deleteNode(nodePath); closeContextMenu(); } });
          }
      } else {
          options.push({ label: 'New folder', icon: <FolderIcon className="w-4 h-4"/>, action: () => { createFolder(currentPath, 'New folder'); closeContextMenu(); } });
      }
      return options;
  }, [contextMenu, handleNodeDoubleClick, closeContextMenu, currentPath, createFolder, renameNode, deleteNode, restoreNode, isInRecycleBin]);

  const FileItemComponent = useMemo(() => {
    switch(viewMode) {
      case 'icons': return FileItemIcon;
      case 'list': return FileItemList;
      default: return FileItemRow;
    }
  }, [viewMode]);

  const renderSortArrow = (key: SortKey) => {
    if (sortConfig.key !== key) return null;
    return <UpArrowIcon className={`w-3 h-3 ml-1 inline-block transition-transform ${sortConfig.direction === 'desc' ? 'rotate-180' : ''}`} />;
  };

  return (
    <>
      <div className="h-full bg-slate-200/70 dark:bg-gray-800/80 flex flex-col">
        {/* Toolbar superior */}
        <div className="p-2 border-b border-gray-300 dark:border-gray-700 flex-shrink-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1">
              <button className="p-1 rounded hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50" disabled><LeftArrowIcon className="w-5 h-5" /></button>
              <button className="p-1 rounded hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50" disabled><RightArrowIcon className="w-5 h-5" /></button>
              <button onClick={navigateUp} className="p-1 rounded hover:bg-gray-300 dark:hover:bg-gray-600 active:scale-95" disabled={currentPath.length <= 1}><UpArrowIcon className="w-5 h-5" /></button>
            </div>
            <div className="flex-grow mx-2">
              <div className="flex items-center border border-gray-400 dark:border-gray-600 rounded bg-white dark:bg-gray-700 px-2 py-1 text-sm">
                {currentPath.map((segment, index) => (
                    <React.Fragment key={index}>
                    <button onClick={() => handleBreadcrumbClick(index)} className={`px-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 ${index === currentPath.length - 1 ? 'font-semibold' : ''}`}>{segment}</button>
                    {index < currentPath.length - 1 && <span className="text-gray-400 mx-1">&gt;</span>}
                  </React.Fragment>
                ))}
              </div>
            </div>
            <div className="relative flex items-center w-60">
              <SearchIconLg className="absolute left-3 w-5 h-5 text-gray-400" />
              <input type="text" placeholder={`Search ${currentPath[currentPath.length - 1]}`} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-1.5 border border-gray-400 dark:border-gray-600 rounded-full bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
        </div>

        {/* Panou principal: Navigare laterală + Conținut */}
        <div className="flex flex-grow overflow-hidden">
          <div className="w-56 bg-gray-50/80 dark:bg-gray-800/50 border-r border-gray-300 dark:border-gray-700 p-2 overflow-y-auto flex-shrink-0">
             <div className="text-sm space-y-1 text-gray-800 dark:text-gray-200">
                <button onClick={() => navigateTo(['This PC'])} className="font-semibold w-full text-left p-1 rounded hover:bg-blue-200/50 dark:hover:bg-blue-900/50">This PC</button>
                <div className="pl-4 space-y-1">
                    <button onClick={() => navigateTo(['This PC', 'Documents'])} className={`w-full text-left p-1 rounded flex items-center gap-2 ${currentPath.includes('Documents') ? 'font-semibold bg-blue-200/50 dark:bg-blue-900/50' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}><FolderIcon className="w-4 h-4"/>Documents</button>
                    <button onClick={() => navigateTo(['This PC', 'Downloads'])} className={`w-full text-left p-1 rounded flex items-center gap-2 ${currentPath.includes('Downloads') ? 'font-semibold bg-blue-200/50 dark:bg-blue-900/50' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}><FolderIcon className="w-4 h-4"/>Downloads</button>
                    <button onClick={() => navigateTo(['This PC', 'Local Disk (C:)'])} className={`w-full text-left p-1 rounded flex items-center gap-2 ${currentPath.includes('Local Disk (C:)') ? 'font-semibold bg-blue-200/50 dark:bg-blue-900/50' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}><DriveIcon className="w-4 h-4"/>Local Disk (C:)</button>
                    <button onClick={() => navigateTo(['This PC', 'Recycle Bin'])} className={`w-full text-left p-1 rounded flex items-center gap-2 ${isInRecycleBin ? 'font-semibold bg-blue-200/50 dark:bg-blue-900/50' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}><RecycleBinIcon className="w-4 h-4 text-gray-700 dark:text-gray-300"/>Recycle Bin</button>
                </div>
            </div>
          </div>

          <div 
            ref={fileListRef}
            className="flex-grow flex flex-col bg-white/80 dark:bg-gray-900/60 overflow-y-auto"
            onContextMenu={(e) => {
                if (e.target === fileListRef.current || (e.target as HTMLElement).parentElement === fileListRef.current) {
                    handleContextMenu(e);
                }
            }}
          >
            {/* Header-ul listei de fișiere cu număr de itemi și butoane de View/Filter */}
            <div className="px-4 py-2 border-b border-gray-300 dark:border-gray-700 sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-10 flex justify-between items-center">
                <div className="text-sm text-gray-600 dark:text-gray-400">{sortedAndFilteredFiles.length} items</div>
                <div className="flex items-center gap-2">
                    {/* Buton și Dropdown pentru Filtre Avansate */}
                    <div ref={filterDropdownRef} className="relative">
                        <button onClick={() => setIsFilterDropdownOpen(p => !p)} className="flex items-center gap-2 text-sm px-3 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 active:scale-95">
                            <FilterIcon className="w-4 h-4"/><span>Filters</span>
                        </button>
                        {isFilterDropdownOpen && (
                             <div className="absolute top-full right-0 mt-2 w-64 bg-slate-100/90 dark:bg-gray-700/90 backdrop-blur-md border border-gray-300 dark:border-gray-600 rounded-md shadow-lg z-20 p-4 space-y-3 animate-fade-in-fast text-sm">
                                <div>
                                    <label className="block mb-1 font-semibold text-xs">File Type</label>
                                    <select onChange={(e) => setFilters(f => ({...f, type: e.target.value as FileType | undefined}))} value={filters.type || ''} className="w-full p-1 rounded bg-white dark:bg-gray-600 border border-gray-400 dark:border-gray-500">
                                        <option value="">Any</option>
                                        <option value="pdf">PDF</option>
                                        <option value="xlsx">Excel</option>
                                        <option value="txt">Text</option>
                                        <option value="png">PNG</option>
                                        <option value="jpg">JPG</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block mb-1 font-semibold text-xs">Size</label>
                                     <select onChange={(e) => {
                                        const [comparison, value] = e.target.value.split(':');
                                        if (!comparison) setFilters(f => ({...f, size: undefined}));
                                        else setFilters(f => ({...f, size: { comparison: comparison as 'gt'|'lt', value: parseInt(value) }}))
                                     }} className="w-full p-1 rounded bg-white dark:bg-gray-600 border border-gray-400 dark:border-gray-500">
                                        <option value="">Any</option>
                                        <option value="gt:1024">Larger than 1 MB</option>
                                        <option value="lt:1024">Smaller than 1 MB</option>
                                    </select>
                                </div>
                                 <div>
                                    <label className="block mb-1 font-semibold text-xs">Date Modified</label>
                                     <select onChange={(e) => {
                                        const days = parseInt(e.target.value);
                                        if (isNaN(days)) setFilters(f => ({...f, date: undefined}));
                                        else setFilters(f => ({...f, date: { since: daysAgo(days) }}))
                                     }} className="w-full p-1 rounded bg-white dark:bg-gray-600 border border-gray-400 dark:border-gray-500">
                                        <option value="">Any time</option>
                                        <option value="7">Last 7 days</option>
                                        <option value="30">Last month</option>
                                        <option value="365">Last year</option>
                                    </select>
                                </div>
                                 <button onClick={() => setFilters({})} className="w-full text-center text-xs py-1 mt-2 rounded bg-gray-300 dark:bg-gray-500 hover:bg-gray-400">Clear Filters</button>
                            </div>
                        )}
                    </div>
                    {/* Buton și Dropdown pentru Mod Vizualizare */}
                    <div ref={viewDropdownRef} className="relative">
                        <button onClick={() => setIsViewDropdownOpen(prev => !prev)} className="flex items-center gap-2 text-sm px-3 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 active:scale-95">
                            <ViewIcon className="w-4 h-4"/><span>View</span>
                        </button>
                        {isViewDropdownOpen && (
                            <div className="absolute top-full right-0 mt-2 w-48 bg-slate-100/90 dark:bg-gray-700/90 backdrop-blur-md border border-gray-300 dark:border-gray-600 rounded-md shadow-lg z-20 animate-fade-in-fast">
                               <button onClick={() => { setViewMode('details'); setIsViewDropdownOpen(false); }} className="w-full text-left px-3 py-2 text-sm flex items-center gap-3 hover:bg-blue-500/20 reveal-highlight"><DetailsIcon className="w-4 h-4"/> Details</button>
                               <button onClick={() => { setViewMode('icons'); setIsViewDropdownOpen(false); }} className="w-full text-left px-3 py-2 text-sm flex items-center gap-3 hover:bg-blue-500/20 reveal-highlight"><GridIcon className="w-4 h-4"/> Large Icons</button>
                               <button onClick={() => { setViewMode('list'); setIsViewDropdownOpen(false); }} className="w-full text-left px-3 py-2 text-sm flex items-center gap-3 hover:bg-blue-500/20 reveal-highlight"><ListIcon className="w-4 h-4"/> List</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {viewMode === 'details' && (
              <div className="px-4 border-b border-gray-300 dark:border-gray-700 sticky top-[53px] bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-10">
                <div className="grid grid-cols-[auto,1fr,150px,150px,120px] gap-4 text-sm font-semibold text-gray-500 dark:text-gray-400 py-2">
                  <div className="w-6"></div>
                  <div className="cursor-pointer hover:text-blue-500" onClick={() => requestSort('name')}>Name {renderSortArrow('name')}</div>
                  <div className="text-right cursor-pointer hover:text-blue-500" onClick={() => requestSort('modifiedDate')}>Date modified {renderSortArrow('modifiedDate')}</div>
                  <div className="text-right cursor-pointer hover:text-blue-500" onClick={() => requestSort('sizeKB')}>Size {renderSortArrow('sizeKB')}</div>
                  <div className="text-left cursor-pointer hover:text-blue-500" onClick={() => requestSort('type')}>Type {renderSortArrow('type')}</div>
                </div>
              </div>
            )}
            
            <div className={`flex-grow p-2 ${viewMode === 'icons' ? 'flex flex-row flex-wrap gap-2 content-start' : 'flex flex-col'}`}>
              {sortedAndFilteredFiles.length > 0 ? (
                sortedAndFilteredFiles.map(node =>
                    <FileItemComponent 
                        key={node.id} 
                        node={node} 
                        isRenaming={renamingNodeId === node.id}
                        onRename={handleRename}
                        onDoubleClick={handleNodeDoubleClick} 
                        onContextMenu={handleContextMenu} 
                    />
                )
              ) : (
                <div className="text-center py-10 text-gray-500 w-full">This folder is empty.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {contextMenu && <ContextMenu x={contextMenu.x} y={contextMenu.y} options={contextMenuOptions} onClose={closeContextMenu} />}
    </>
  );
};

export default FileExplorer;