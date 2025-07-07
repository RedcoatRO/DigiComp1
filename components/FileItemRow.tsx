import React, { useState, useEffect, useRef } from 'react';
import { FileSystemNode, FileType, VirtualFileNode } from '../types';
import { FolderIcon, PdfIcon, ExcelIcon, TextIcon, DriveIcon } from './Icons';

interface FileItemProps {
  node: FileSystemNode;
  isRenaming: boolean;
  onDoubleClick: (node: FileSystemNode) => void;
  onContextMenu: (event: React.MouseEvent, node: FileSystemNode) => void;
  onRename: (node: FileSystemNode, newName: string) => void;
}

const getFileIcon = (node: FileSystemNode, className: string = "w-6 h-6") => {
  if (node.type === 'drive') return <DriveIcon className={className} />;
  if (node.type === 'folder') return <FolderIcon className={className} />;

  if (node.type === 'file') {
    switch (node.fileType) {
      case FileType.PDF: return <PdfIcon className={className} />;
      case FileType.Excel: return <ExcelIcon className={className} />;
      case FileType.Text: return <TextIcon className={className} />;
      default: return <FolderIcon className={className} />; // Fallback
    }
  }
  return <FolderIcon className={className} />;
};

const formatSize = (sizeKB?: number) => {
  if (typeof sizeKB !== 'number') return '';
  if (sizeKB >= 1024) return `${(sizeKB / 1024).toFixed(1)} MB`;
  return `${sizeKB} KB`;
};

const formatDate = (date?: Date) => {
  if (!date) return '';
  return date.toLocaleString('ro-RO', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
};

const getFileTypeDescription = (node: FileSystemNode): string => {
  if (node.type === 'folder') return 'File folder';
  if (node.type === 'drive') return 'Local Disk';
  if (node.type === 'file') {
    switch(node.fileType) {
      case FileType.PDF: return 'PDF Document';
      case FileType.Excel: return 'Microsoft Excel Worksheet';
      case FileType.Text: return 'Text Document';
      default: return 'File';
    }
  }
  return '';
}


const FileItemRow: React.FC<FileItemProps> = ({ node, isRenaming, onDoubleClick, onContextMenu, onRename }) => {
  const isFile = node.type === 'file';
  const fileNode = isFile ? (node as VirtualFileNode) : null;
  const [name, setName] = useState(node.name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isRenaming) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isRenaming]);

  const handleRenameSubmit = () => {
    onRename(node, name);
  };
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const target = e.currentTarget;
    const rect = target.getBoundingClientRect();
    target.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
    target.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
  };

  return (
    <div
      className="grid grid-cols-[auto,1fr,150px,150px,120px] items-center gap-4 px-4 py-1.5 hover:bg-blue-500/10 dark:hover:bg-blue-500/20 rounded cursor-pointer reveal-highlight"
      onMouseMove={handleMouseMove}
      onDoubleClick={() => !isRenaming && onDoubleClick(node)}
      onContextMenu={(e) => !isRenaming && onContextMenu(e, node)}
    >
      <div className="flex-shrink-0">{getFileIcon(node)}</div>
      <div className="truncate text-gray-800 dark:text-gray-200">
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
      <div className="text-sm text-gray-600 dark:text-gray-400 text-right">{formatDate(fileNode?.modifiedDate)}</div>
      <div className="text-sm text-gray-600 dark:text-gray-400 text-right">{formatSize(fileNode?.sizeKB)}</div>
      <div className="text-sm text-gray-600 dark:text-gray-400 truncate">{getFileTypeDescription(node)}</div>
    </div>
  );
};

export default FileItemRow;
