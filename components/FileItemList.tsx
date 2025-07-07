import React, { useState, useEffect, useRef } from 'react';
import { FileSystemNode, FileType } from '../types';
import { FolderIcon, PdfIcon, ExcelIcon, TextIcon, DriveIcon } from './Icons';

interface FileItemProps {
  node: FileSystemNode;
  isRenaming: boolean;
  onDoubleClick: (node: FileSystemNode) => void;
  onContextMenu: (event: React.MouseEvent, node: FileSystemNode) => void;
  onRename: (node: FileSystemNode, newName: string) => void;
}

const getFileIcon = (node: FileSystemNode, className: string = "w-5 h-5") => {
  if (node.type === 'drive') return <DriveIcon className={className} />;
  if (node.type === 'folder') return <FolderIcon className={className} />;
  
  if (node.type === 'file') {
    switch (node.fileType) {
      case FileType.PDF: return <PdfIcon className={className} />;
      case FileType.Excel: return <ExcelIcon className={className} />;
      case FileType.Text: return <TextIcon className={className} />;
      default: return <FolderIcon className={className} />;
    }
  }
  return <FolderIcon className={className} />;
};

const FileItemList: React.FC<FileItemProps> = ({ node, isRenaming, onDoubleClick, onContextMenu, onRename }) => {
  const [name, setName] = useState(node.name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isRenaming) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isRenaming]);

  const handleRenameSubmit = () => onRename(node, name);
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const target = e.currentTarget;
    const rect = target.getBoundingClientRect();
    target.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
    target.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
  };

  return (
    <div
      className="flex items-center gap-3 px-4 py-1 hover:bg-blue-500/10 dark:hover:bg-blue-500/20 rounded cursor-pointer w-full reveal-highlight"
      onMouseMove={handleMouseMove}
      onDoubleClick={() => !isRenaming && onDoubleClick(node)}
      onContextMenu={(e) => !isRenaming && onContextMenu(e, node)}
    >
      <div className="flex-shrink-0">{getFileIcon(node)}</div>
      <div className="truncate text-sm text-gray-800 dark:text-gray-200 flex-grow">
        {isRenaming ? (
          <input
            ref={inputRef}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={handleRenameSubmit}
            onKeyDown={(e) => e.key === 'Enter' && handleRenameSubmit()}
            onClick={(e) => e.stopPropagation()}
            className="w-full bg-white dark:bg-gray-800 border border-blue-500 rounded px-1 py-0.5 -ml-1 text-sm focus:outline-none"
          />
        ) : (
          node.name
        )}
      </div>
    </div>
  );
};

export default FileItemList;
