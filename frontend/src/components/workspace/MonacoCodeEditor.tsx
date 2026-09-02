import React, { useEffect, useState } from 'react';
import Editor from '@monaco-editor/react';
import type { GeneratedFile } from '../../types/workspace';
import { Button } from '../common/Button';
import { Save, Copy, Check, RotateCcw, Code } from 'lucide-react';

interface MonacoCodeEditorProps {
  file: GeneratedFile | null;
  onSave: (content: string) => Promise<void>;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  setHasUnsavedChanges: (val: boolean) => void;
}

const getMonacoLanguage = (extension: string): string => {
  const map: Record<string, string> = {
    py: 'python',
    ts: 'typescript',
    tsx: 'typescript',
    js: 'javascript',
    jsx: 'javascript',
    json: 'json',
    html: 'html',
    css: 'css',
    md: 'markdown',
    yml: 'yaml',
    yaml: 'yaml',
    sql: 'sql',
    dockerfile: 'dockerfile',
    txt: 'plaintext',
    example: 'plaintext',
  };
  return map[extension.toLowerCase()] || 'plaintext';
};

export const MonacoCodeEditor: React.FC<MonacoCodeEditorProps> = ({
  file,
  onSave,
  isSaving,
  hasUnsavedChanges,
  setHasUnsavedChanges,
}) => {
  const [content, setContent] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (file) {
      setContent(file.content);
      setHasUnsavedChanges(false);
    }
  }, [file?.id]);

  const handleChange = (val: string | undefined) => {
    const newVal = val || '';
    setContent(newVal);
    if (file && newVal !== file.content) {
      setHasUnsavedChanges(true);
    } else {
      setHasUnsavedChanges(false);
    }
  };

  const handleSaveClick = async () => {
    if (!file) return;
    await onSave(content);
  };

  const handleReset = () => {
    if (file) {
      setContent(file.content);
      setHasUnsavedChanges(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Keyboard shortcut Cmd+S / Ctrl+S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSaveClick();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [content, file]);

  if (!file) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 bg-[#0D2818] text-white/50 rounded-2xl font-mono text-xs">
        <Code className="w-8 h-8 text-[#84CC16]/40 mb-3" />
        <span>Select a file from the explorer to view or edit code</span>
      </div>
    );
  }

  const language = getMonacoLanguage(file.extension);

  return (
    <div className="h-full flex flex-col bg-[#1E1E1E] rounded-2xl overflow-hidden border border-[#0D2818]/20 shadow-xl">
      {/* Editor Toolbar */}
      <div className="bg-[#181818] px-4 py-2 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-white">{file.path}</span>
          {hasUnsavedChanges && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#84CC16]/20 text-[#84CC16] border border-[#84CC16]/40">
              Unsaved Changes
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="px-2.5 py-1 text-xs font-mono text-white/70 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors flex items-center gap-1.5"
            title="Copy code to clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#84CC16]" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>

          {hasUnsavedChanges && (
            <button
              onClick={handleReset}
              className="px-2.5 py-1 text-xs font-mono text-white/70 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors flex items-center gap-1.5"
              title="Reset changes to saved version"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}

          <Button
            size="sm"
            variant="accent"
            icon={<Save className="w-3.5 h-3.5" />}
            isLoading={isSaving}
            onClick={handleSaveClick}
            disabled={!hasUnsavedChanges}
          >
            Save File
          </Button>
        </div>
      </div>

      {/* Embedded Monaco Editor */}
      <div className="flex-1 min-h-[480px]">
        <Editor
          height="100%"
          language={language}
          value={content}
          theme="vs-dark"
          onChange={handleChange}
          options={{
            minimap: { enabled: false },
            fontSize: 13,
            fontFamily: "'JetBrains Mono', Menlo, monospace",
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: 'on',
          }}
        />
      </div>

      {/* Editor Footer Status Bar */}
      <div className="bg-[#121212] px-4 py-1.5 border-t border-white/5 text-[11px] font-mono text-white/50 flex items-center justify-between">
        <span>Language: {language} • UTF-8</span>
        <span>Version: {file.version} • {file.size_bytes} bytes</span>
      </div>
    </div>
  );
};
