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

const getFileIcon = (node: FileSystemNode, className: string = "w-16 h-16") => {
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

const FileItemIcon: React.FC<FileItemProps> = ({ node, isRenaming, onDoubleClick, onContextMenu, onRename }) => {
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
      className="flex flex-col items-center justify-start p-2 rounded hover:bg-blue-500/10 dark:hover:bg-blue-500/20 cursor-pointer w-32 h-32 reveal-highlight"
      onMouseMove={handleMouseMove}
      onDoubleClick={() => !isRenaming && onDoubleClick(node)}
      onContextMenu={(e) => !isRenaming && onContextMenu(e, node)}
    >
      {getFileIcon(node)}
      <div className="text-center text-xs break-words mt-2 text-gray-800 dark:text-gray-200 w-full">
        {isRenaming ? (
          <input
            ref={inputRef}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={handleRenameSubmit}
            onKeyDown={(e) => e.key === 'Enter' && handleRenameSubmit()}
            onClick={(e) => e.stopPropagation()}
            className="w-full bg-white dark:bg-gray-800 border border-blue-500 rounded px-1 py-0.5 text-xs text-center focus:outline-none"
          />
        ) : (
          <span className="w-full truncate block">{node.name}</span>
        )}
      </div>
    </div>
  );
};

export default FileItemIcon;
