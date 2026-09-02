import React from 'react';
import type { GeneratedFile } from '../../types/workspace';
import { X } from 'lucide-react';

interface TabBarProps {
  openFiles: GeneratedFile[];
  activeFileId: string | null;
  onSelectTab: (fileId: string) => void;
  onCloseTab: (fileId: string, e: React.MouseEvent) => void;
  hasUnsavedChanges: boolean;
}

export const TabBar: React.FC<TabBarProps> = ({
  openFiles,
  activeFileId,
  onSelectTab,
  onCloseTab,
  hasUnsavedChanges,
}) => {
  return (
    <div className="flex items-center bg-[#0D2818] px-2 pt-2 border-b border-white/10 overflow-x-auto gap-1 text-xs font-mono">
      {openFiles.map((file) => {
        const isActive = activeFileId === file.id;

        return (
          <div
            key={file.id}
            onClick={() => onSelectTab(file.id)}
            className={`group flex items-center gap-2 px-3 py-2 rounded-t-xl cursor-pointer select-none border-t border-x transition-colors ${
              isActive
                ? 'bg-[#163E2B] text-white border-white/20 font-medium'
                : 'bg-transparent text-white/60 border-transparent hover:bg-white/5 hover:text-white'
            }`}
          >
            <span className="truncate max-w-[140px]">{file.filename}</span>
            {isActive && hasUnsavedChanges && (
              <span className="w-2 h-2 rounded-full bg-[#84CC16]" title="Unsaved changes" />
            )}
            <button
              onClick={(e) => onCloseTab(file.id, e)}
              className="p-0.5 rounded-full hover:bg-white/20 text-white/50 hover:text-white"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
