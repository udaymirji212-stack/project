import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { workflowApi } from '../../services/workflowApi';
import type { GeneratedFile, FileTreeNode } from '../../types/workspace';
import type { Project } from '../../types/project';
import {
  Folder,
  FolderOpen,
  FileCode,
  Search,
  Save,
  RotateCcw,
  Copy,
  Check,
  ArrowRight,
  ShieldCheck,
  Loader2,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';

interface WorkspaceStageProps {
  project: Project;
  onAdvance: () => void;
  onRefreshProject?: () => void;
}

export const WorkspaceStage: React.FC<WorkspaceStageProps> = ({
  project,
  onAdvance,
  onRefreshProject,
}) => {
  const [files, setFiles] = useState<GeneratedFile[]>([]);
  const [fileTree, setFileTree] = useState<FileTreeNode[]>([]);
  const [activeFile, setActiveFile] = useState<GeneratedFile | null>(null);
  const [openTabs, setOpenTabs] = useState<GeneratedFile[]>([]);
  const [editorContent, setEditorContent] = useState<string>('');
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [collapsedFolders, setCollapsedFolders] = useState<Record<string, boolean>>({});

  const loadWorkspace = async () => {
    try {
      setIsLoading(true);
      const [filesRes, treeRes] = await Promise.all([
        workflowApi.listFiles(project.id),
        workflowApi.getFileTree(project.id).catch(() => [] as FileTreeNode[]),
      ]);

      setFiles(filesRes);
      setFileTree(Array.isArray(treeRes) ? treeRes : ((treeRes as any)?.tree || []));

      if (filesRes.length > 0) {
        const initial = filesRes[0];
        setActiveFile(initial);
        setEditorContent(initial.content);
        setOpenTabs([initial]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadWorkspace();
  }, [project.id]);

  const handleSelectFile = (file: GeneratedFile) => {
    setActiveFile(file);
    setEditorContent(file.content);
    setIsDirty(false);

    if (!openTabs.some((t) => t.id === file.id)) {
      setOpenTabs((prev) => [...prev, file]);
    }
  };

  const handleCloseTab = (tabId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const remaining = openTabs.filter((t) => t.id !== tabId);
    setOpenTabs(remaining);

    if (activeFile?.id === tabId) {
      if (remaining.length > 0) {
        const next = remaining[remaining.length - 1];
        setActiveFile(next);
        setEditorContent(next.content);
        setIsDirty(false);
      } else {
        setActiveFile(null);
        setEditorContent('');
        setIsDirty(false);
      }
    }
  };

  const handleEditorChange = (value: string | undefined) => {
    const val = value ?? '';
    setEditorContent(val);
    if (activeFile && val !== activeFile.content) {
      setIsDirty(true);
    } else {
      setIsDirty(false);
    }
  };

  const handleSaveFile = async () => {
    if (!activeFile) return;
    setIsSaving(true);
    try {
      const updated = await workflowApi.updateFile(project.id, activeFile.id, editorContent);
      setActiveFile(updated);
      setFiles((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));
      setOpenTabs((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));
      setIsDirty(false);
      if (onRefreshProject) onRefreshProject();
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetFile = () => {
    if (!activeFile) return;
    setEditorContent(activeFile.content);
    setIsDirty(false);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(editorContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleFolder = (folderPath: string) => {
    setCollapsedFolders((prev) => ({
      ...prev,
      [folderPath]: !prev[folderPath],
    }));
  };

  const getMonacoLanguage = (lang: string, filename: string) => {
    if (lang === 'python' || filename.endsWith('.py')) return 'python';
    if (lang === 'typescript' || filename.endsWith('.ts') || filename.endsWith('.tsx')) return 'typescript';
    if (lang === 'javascript' || filename.endsWith('.js') || filename.endsWith('.jsx')) return 'javascript';
    if (lang === 'json' || filename.endsWith('.json')) return 'json';
    if (lang === 'markdown' || filename.endsWith('.md')) return 'markdown';
    if (lang === 'sql' || filename.endsWith('.sql')) return 'sql';
    if (lang === 'html' || filename.endsWith('.html')) return 'html';
    if (lang === 'css' || filename.endsWith('.css')) return 'css';
    if (filename.endsWith('.yml') || filename.endsWith('.yaml')) return 'yaml';
    if (filename.includes('Dockerfile')) return 'dockerfile';
    return 'plaintext';
  };

  const filteredFiles = files.filter(
    (f) =>
      f.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.filename.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Recursive Tree Node Renderer
  const renderTreeNode = (node: FileTreeNode, depth = 0) => {
    if (node.type === 'folder') {
      const isCollapsed = !!collapsedFolders[node.path];
      return (
        <div key={node.path} className="select-none">
          <div
            onClick={() => toggleFolder(node.path)}
            className="flex items-center space-x-1.5 py-1 px-2 rounded-lg hover:bg-forest-900/5 cursor-pointer text-xs font-medium text-forest-800"
            style={{ paddingLeft: `${depth * 12 + 8}px` }}
          >
            {isCollapsed ? (
              <ChevronRight className="h-3 w-3 text-forest-700/60 shrink-0" />
            ) : (
              <ChevronDown className="h-3 w-3 text-forest-700/60 shrink-0" />
            )}
            {isCollapsed ? (
              <Folder className="h-3.5 w-3.5 text-amber-600 shrink-0" />
            ) : (
              <FolderOpen className="h-3.5 w-3.5 text-amber-600 shrink-0" />
            )}
            <span className="font-mono text-[11px] truncate font-semibold">{node.name}</span>
          </div>

          {!isCollapsed && node.children && (
            <div>{node.children.map((child) => renderTreeNode(child, depth + 1))}</div>
          )}
        </div>
      );
    } else {
      const matchedFile = files.find((f) => f.path === node.path || f.id === node.id);
      const isSelected = activeFile?.path === node.path;
      return (
        <div
          key={node.path}
          onClick={() => matchedFile && handleSelectFile(matchedFile)}
          className={`flex items-center space-x-1.5 py-1 px-2 rounded-lg cursor-pointer text-xs transition-colors ${
            isSelected
              ? 'bg-forest-900 text-ivory-100 font-bold'
              : 'hover:bg-forest-900/5 text-forest-900'
          }`}
          style={{ paddingLeft: `${depth * 12 + 18}px` }}
        >
          <FileCode
            className={`h-3.5 w-3.5 shrink-0 ${isSelected ? 'text-lime-400' : 'text-forest-700/70'}`}
          />
          <span className="font-mono text-[11px] truncate">{node.name}</span>
          {matchedFile?.is_user_edited && (
            <span className="h-1.5 w-1.5 rounded-full bg-lime-400 shrink-0" title="Modified by user" />
          )}
        </div>
      );
    }
  };

  if (isLoading && files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-forest-900" />
        <p className="text-sm font-semibold text-forest-800">
          Loading Monaco Workspace and project files...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-3xl bg-ivory-50 p-6 border border-forest-900/10 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <span className="rounded-lg bg-forest-900/10 p-1.5 text-forest-900 font-mono text-xs font-bold">
              Stage 06
            </span>
            <h2 className="font-serif text-2xl font-bold text-forest-950">
              Monaco Code Workspace & File Explorer
            </h2>
          </div>
          <p className="mt-1 text-xs text-forest-700/70">
            Full-featured IDE with syntax highlighting, live editing, multi-file tabs, and change persistence.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onAdvance}
            className="inline-flex items-center space-x-2 rounded-xl bg-forest-900 px-5 py-2.5 text-xs font-bold text-lime-400 shadow-md hover:bg-forest-950 transition-all"
          >
            <ShieldCheck className="h-4 w-4" />
            <span>Proceed to AI Review & Tests</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Main IDE Window */}
      <div className="grid grid-cols-1 lg:grid-cols-4 rounded-3xl bg-ivory-50 border border-forest-900/15 shadow-xl overflow-hidden min-h-[620px]">
        {/* Left Sidebar: File Explorer */}
        <div className="border-r border-forest-900/10 bg-ivory-100/50 flex flex-col justify-between">
          <div className="p-3 border-b border-forest-900/10 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-forest-900 uppercase tracking-wider px-1">
              <span>Project Explorer</span>
              <span className="font-mono text-[10px] text-forest-700/70">
                {files.length} files
              </span>
            </div>

            {/* File Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-forest-700/50" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search files..."
                className="w-full rounded-xl bg-ivory-50 pl-8 pr-3 py-1.5 text-xs text-forest-950 border border-forest-900/15 focus:border-forest-900 focus:outline-none focus:ring-1 focus:ring-lime-500 font-mono"
              />
            </div>
          </div>

          {/* Explorer Tree or Flat list */}
          <div className="flex-1 overflow-y-auto p-2 space-y-0.5 max-h-[500px]">
            {searchQuery ? (
              <div className="space-y-1">
                {filteredFiles.map((file) => (
                  <div
                    key={file.id}
                    onClick={() => handleSelectFile(file)}
                    className={`flex items-center space-x-2 py-1.5 px-2 rounded-lg cursor-pointer text-xs ${
                      activeFile?.id === file.id
                        ? 'bg-forest-900 text-ivory-100 font-bold'
                        : 'hover:bg-forest-900/5 text-forest-900'
                    }`}
                  >
                    <FileCode className="h-3.5 w-3.5 shrink-0" />
                    <span className="font-mono text-[11px] truncate">{file.path}</span>
                  </div>
                ))}
              </div>
            ) : fileTree.length > 0 ? (
              fileTree.map((node) => renderTreeNode(node))
            ) : (
              <div className="space-y-0.5">
                {files.map((file) => (
                  <div
                    key={file.id}
                    onClick={() => handleSelectFile(file)}
                    className={`flex items-center space-x-2 py-1.5 px-2 rounded-lg cursor-pointer text-xs ${
                      activeFile?.id === file.id
                        ? 'bg-forest-900 text-ivory-100 font-bold'
                        : 'hover:bg-forest-900/5 text-forest-900'
                    }`}
                  >
                    <FileCode className="h-3.5 w-3.5 shrink-0 text-forest-700" />
                    <span className="font-mono text-[11px] truncate">{file.path}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-3 border-t border-forest-900/10 bg-ivory-200/40 text-[11px] font-mono text-forest-700/70 flex items-center justify-between">
            <span>Stack: {project.preferred_tech_stack.split('+')[0]}</span>
            <span className="text-lime-700 font-bold">● Synchronized</span>
          </div>
        </div>

        {/* Right Area: Monaco Editor + Multi-Tab Bar */}
        <div className="lg:col-span-3 flex flex-col bg-[#1E1E1E]">
          {/* Multi-Tab Bar & Actions */}
          <div className="flex items-center justify-between bg-[#252526] border-b border-[#333333] px-2 overflow-x-auto">
            {/* Open Tabs */}
            <div className="flex items-center space-x-1 py-1">
              {openTabs.map((tab) => {
                const isActive = activeFile?.id === tab.id;
                return (
                  <div
                    key={tab.id}
                    onClick={() => handleSelectFile(tab)}
                    className={`group flex items-center space-x-2 px-3 py-1.5 rounded-t-lg text-xs font-mono cursor-pointer transition-all ${
                      isActive
                        ? 'bg-[#1E1E1E] text-ivory-100 border-t-2 border-lime-400'
                        : 'bg-[#2D2D2D] text-ivory-300/70 hover:bg-[#333333]'
                    }`}
                  >
                    <FileCode className="h-3.5 w-3.5 text-lime-400 shrink-0" />
                    <span className="truncate max-w-[140px]">{tab.filename}</span>
                    {isActive && isDirty && (
                      <span className="h-2 w-2 rounded-full bg-lime-400 shrink-0" title="Unsaved changes" />
                    )}
                    <button
                      onClick={(e) => handleCloseTab(tab.id, e)}
                      className="opacity-60 hover:opacity-100 hover:text-red-400 ml-1 text-xs"
                    >
                      ×
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Action Bar */}
            <div className="flex items-center space-x-2 py-1">
              {isDirty && (
                <button
                  onClick={handleResetFile}
                  title="Discard changes and reset to original"
                  className="flex items-center space-x-1 px-2.5 py-1 text-xs font-mono text-ivory-300 hover:text-ivory-100 bg-[#333333] hover:bg-[#3E3E3E] rounded-md transition-colors"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Reset</span>
                </button>
              )}

              <button
                onClick={handleCopyCode}
                title="Copy code to clipboard"
                className="flex items-center space-x-1 px-2.5 py-1 text-xs font-mono text-ivory-300 hover:text-ivory-100 bg-[#333333] hover:bg-[#3E3E3E] rounded-md transition-colors"
              >
                {copied ? <Check className="h-3 w-3 text-lime-400" /> : <Copy className="h-3 w-3" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>

              <button
                onClick={handleSaveFile}
                disabled={!isDirty || isSaving}
                className={`flex items-center space-x-1.5 px-3 py-1 text-xs font-mono font-bold rounded-md transition-all ${
                  isDirty
                    ? 'bg-lime-500 text-forest-950 hover:bg-lime-400 shadow-sm'
                    : 'bg-[#333333] text-ivory-400 opacity-60 cursor-not-allowed'
                }`}
              >
                <Save className="h-3 w-3" />
                <span>{isSaving ? 'Saving...' : 'Save File'}</span>
              </button>
            </div>
          </div>

          {/* File Path Banner */}
          {activeFile && (
            <div className="bg-[#1E1E1E] px-4 py-1 text-[11px] font-mono text-ivory-400 border-b border-[#2D2D2D] flex items-center justify-between">
              <span className="truncate">{activeFile.path}</span>
              <span className="text-[10px] text-ivory-500">
                {getMonacoLanguage(activeFile.language, activeFile.filename)} • {activeFile.size_bytes} B
              </span>
            </div>
          )}

          {/* Monaco Editor Component */}
          <div className="flex-1 min-h-[500px]">
            {activeFile ? (
              <Editor
                height="500px"
                theme="vs-dark"
                path={activeFile.path}
                defaultLanguage={getMonacoLanguage(activeFile.language, activeFile.filename)}
                language={getMonacoLanguage(activeFile.language, activeFile.filename)}
                value={editorContent}
                onChange={handleEditorChange}
                options={{
                  fontSize: 13,
                  fontFamily: '"JetBrains Mono", Menlo, monospace',
                  minimap: { enabled: true },
                  scrollBeyondLastLine: false,
                  smoothScrolling: true,
                  automaticLayout: true,
                  tabSize: 2,
                  wordWrap: 'on',
                }}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-ivory-400 text-xs font-mono">
                Select a file from the explorer to begin editing.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
