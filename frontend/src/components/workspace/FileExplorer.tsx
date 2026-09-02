import React, { useState } from 'react';
import type { FileTreeNode } from '../../types/workspace';
import {
  Folder,
  FolderOpen,
  FileCode,
  FileText,
  ChevronRight,
  ChevronDown,
  Search,
  Plus,
  Trash2,
} from 'lucide-react';

interface FileExplorerProps {
  tree: FileTreeNode[];
  selectedFileId: string | null;
  onSelectFile: (fileId: string) => void;
  onCreateFileClick: () => void;
  onDeleteFile: (fileId: string, e: React.MouseEvent) => void;
}

const getFileIcon = (filename: string) => {
  if (filename.endsWith('.py')) return <span className="text-yellow-600 font-mono font-bold text-[10px]">PY</span>;
  if (filename.endsWith('.tsx') || filename.endsWith('.ts')) return <span className="text-blue-600 font-mono font-bold text-[10px]">TS</span>;
  if (filename.endsWith('.json')) return <span className="text-amber-600 font-mono font-bold text-[10px]">{}</span>;
  if (filename.endsWith('.md')) return <FileText className="w-3.5 h-3.5 text-sky-600" />;
  if (filename.endsWith('.yml') || filename.endsWith('.yaml')) return <span className="text-rose-600 font-mono font-bold text-[10px]">YML</span>;
  return <FileCode className="w-3.5 h-3.5 text-[#0D2818]/60" />;
};

const TreeNodeItem: React.FC<{
  node: FileTreeNode;
  selectedFileId: string | null;
  onSelectFile: (fileId: string) => void;
  onDeleteFile: (fileId: string, e: React.MouseEvent) => void;
  searchTerm: string;
}> = ({ node, selectedFileId, onSelectFile, onDeleteFile, searchTerm }) => {
  const [isOpen, setIsOpen] = useState(true);

  if (node.type === 'folder') {
    return (
      <div className="select-none">
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-mono text-[#0D2818] hover:bg-[#FAF7F2] cursor-pointer"
        >
          {isOpen ? (
            <ChevronDown className="w-3 h-3 text-[#0D2818]/50" />
          ) : (
            <ChevronRight className="w-3 h-3 text-[#0D2818]/50" />
          )}
          {isOpen ? (
            <FolderOpen className="w-3.5 h-3.5 text-[#84CC16]" />
          ) : (
            <Folder className="w-3.5 h-3.5 text-[#84CC16]" />
          )}
          <span className="font-semibold text-[11px] truncate">{node.name}</span>
        </div>

        {isOpen && node.children && (
          <div className="pl-3 border-l border-[#0D2818]/10 ml-2 space-y-0.5">
            {node.children.map((child) => (
              <TreeNodeItem
                key={child.id}
                node={child}
                selectedFileId={selectedFileId}
                onSelectFile={onSelectFile}
                onDeleteFile={onDeleteFile}
                searchTerm={searchTerm}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // File item
  const isSelected = selectedFileId === node.id;
  const matchesSearch = !searchTerm || node.name.toLowerCase().includes(searchTerm.toLowerCase());

  if (!matchesSearch) return null;

  return (
    <div
      onClick={() => onSelectFile(node.id)}
      className={`group flex items-center justify-between px-2 py-1 rounded-lg text-xs font-mono cursor-pointer transition-colors ${
        isSelected
          ? 'bg-[#0D2818] text-white font-medium'
          : 'text-[#0D2818]/80 hover:bg-[#FAF7F2] hover:text-[#0D2818]'
      }`}
    >
      <div className="flex items-center gap-2 truncate">
        {getFileIcon(node.name)}
        <span className="truncate text-[11px]">{node.name}</span>
        {node.is_user_edited && (
          <span className="w-1.5 h-1.5 rounded-full bg-[#84CC16] shrink-0" title="User edited" />
        )}
      </div>
      <button
        onClick={(e) => onDeleteFile(node.id, e)}
        title="Delete file"
        className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-rose-500 transition-opacity"
      >
        <Trash2 className="w-3 h-3" />
      </button>
    </div>
  );
};

export const FileExplorer: React.FC<FileExplorerProps> = ({
  tree,
  selectedFileId,
  onSelectFile,
  onCreateFileClick,
  onDeleteFile,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="w-full h-full flex flex-col bg-white rounded-2xl border border-[#0D2818]/15 overflow-hidden">
      {/* Header */}
      <div className="p-3 border-b border-[#0D2818]/10 flex items-center justify-between bg-[#FAF7F2]">
        <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#0D2818]">
          File Explorer
        </span>
        <button
          onClick={onCreateFileClick}
          title="Create custom file"
          className="p-1 rounded-md text-[#0D2818] hover:bg-[#0D2818]/10 transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Search Input */}
      <div className="p-2 border-b border-[#0D2818]/10">
        <div className="relative">
          <Search className="w-3 h-3 text-[#0D2818]/40 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search files..."
            className="w-full bg-[#FAF7F2] text-xs font-mono pl-7 pr-2 py-1 rounded-md border border-[#0D2818]/10 focus:outline-none focus:ring-1 focus:ring-[#84CC16]"
          />
        </div>
      </div>

      {/* Tree Content */}
      <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {tree.length === 0 ? (
          <div className="p-4 text-center text-xs text-[#0D2818]/50 font-mono">
            No files generated yet.
          </div>
        ) : (
          tree.map((node) => (
            <TreeNodeItem
              key={node.id}
              node={node}
              selectedFileId={selectedFileId}
              onSelectFile={onSelectFile}
              onDeleteFile={onDeleteFile}
              searchTerm={searchTerm}
            />
          ))
        )}
      </div>
    </div>
  );
};
