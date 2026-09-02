import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workflowApi } from '../services/workflowApi';
import type { GeneratedFile } from '../types/workspace';
import { FileExplorer } from '../components/workspace/FileExplorer';
import { TabBar } from '../components/workspace/TabBar';
import { MonacoCodeEditor } from '../components/workspace/MonacoCodeEditor';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import {
  ShieldCheck,
  Plus,
} from 'lucide-react';

export const WorkspacePage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [openFiles, setOpenFiles] = useState<GeneratedFile[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newFilePath, setNewFilePath] = useState('');
  const [newFileContent, setNewFileContent] = useState('');

  // Fetch File Tree
  const { data: tree = [] } = useQuery({
    queryKey: ['workspace-tree', projectId],
    queryFn: () => workflowApi.getWorkspaceTree(projectId!),
    enabled: !!projectId,
  });

  // Fetch All Files
  const { data: allFiles = [] } = useQuery({
    queryKey: ['workspace-files', projectId],
    queryFn: () => workflowApi.getWorkspaceFiles(projectId!),
    enabled: !!projectId,
  });

  // Automatically open first file if none open
  useEffect(() => {
    if (allFiles.length > 0 && openFiles.length === 0) {
      const defaultFile =
        allFiles.find((f) => f.path.includes('main.py') || f.path.includes('App.tsx')) ||
        allFiles[0];
      setOpenFiles([defaultFile]);
      setActiveFileId(defaultFile.id);
    }
  }, [allFiles]);

  const activeFile = openFiles.find((f) => f.id === activeFileId) || null;

  // Save File Mutation
  const saveMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!activeFileId) return;
      return workflowApi.saveWorkspaceFile(projectId!, activeFileId, content);
    },
    onSuccess: (updatedFile) => {
      if (!updatedFile) return;
      queryClient.invalidateQueries({ queryKey: ['workspace-files', projectId] });
      queryClient.invalidateQueries({ queryKey: ['workspace-tree', projectId] });
      setOpenFiles((prev) =>
        prev.map((f) => (f.id === updatedFile.id ? updatedFile : f))
      );
      setHasUnsavedChanges(false);
    },
  });

  // Create File Mutation
  const createMutation = useMutation({
    mutationFn: (data: { path: string; content: string }) =>
      workflowApi.createWorkspaceFile(projectId!, data),
    onSuccess: (newFile) => {
      queryClient.invalidateQueries({ queryKey: ['workspace-files', projectId] });
      queryClient.invalidateQueries({ queryKey: ['workspace-tree', projectId] });
      setOpenFiles((prev) => [...prev, newFile]);
      setActiveFileId(newFile.id);
      setCreateModalOpen(false);
      setNewFilePath('');
      setNewFileContent('');
    },
  });

  // Delete File Mutation
  const deleteMutation = useMutation({
    mutationFn: (fileId: string) =>
      workflowApi.deleteWorkspaceFile(projectId!, fileId),
    onSuccess: (_, fileId) => {
      queryClient.invalidateQueries({ queryKey: ['workspace-files', projectId] });
      queryClient.invalidateQueries({ queryKey: ['workspace-tree', projectId] });
      setOpenFiles((prev) => prev.filter((f) => f.id !== fileId));
      if (activeFileId === fileId) {
        const remaining = openFiles.filter((f) => f.id !== fileId);
        setActiveFileId(remaining.length > 0 ? remaining[0].id : null);
      }
    },
  });

  const handleSelectFile = (fileId: string) => {
    const existing = openFiles.find((f) => f.id === fileId);
    if (existing) {
      setActiveFileId(fileId);
    } else {
      const file = allFiles.find((f) => f.id === fileId);
      if (file) {
        setOpenFiles((prev) => [...prev, file]);
        setActiveFileId(file.id);
      }
    }
  };

  const handleCloseTab = (fileId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const filtered = openFiles.filter((f) => f.id !== fileId);
    setOpenFiles(filtered);
    if (activeFileId === fileId) {
      setActiveFileId(filtered.length > 0 ? filtered[filtered.length - 1].id : null);
    }
  };

  const handleDeleteFile = (fileId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Delete this file permanently?')) {
      deleteMutation.mutate(fileId);
    }
  };

  const handleProceedToReview = async () => {
    await workflowApi.runReview(projectId!);
    await workflowApi.runTests(projectId!);
    navigate(`/projects/${projectId}/review-testing`);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-3xl border border-[#0D2818]/10 shadow-sm">
        <div>
          <h2 className="font-serif font-bold text-2xl text-[#0D2818]">
            Monaco Workspace IDE
          </h2>
          <p className="text-xs text-[#0D2818]/70 font-sans mt-0.5">
            Full source code editor with multi-tab browsing, live saving (Cmd+S), and tree management.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="accent"
            size="md"
            icon={<ShieldCheck className="w-4 h-4" />}
            onClick={handleProceedToReview}
          >
            Advance to AI Review & Testing
          </Button>
        </div>
      </div>

      {/* Editor Split Area */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-[680px]">
        {/* Left Column: File Explorer */}
        <div className="md:col-span-1 h-full">
          <FileExplorer
            tree={tree}
            selectedFileId={activeFileId}
            onSelectFile={handleSelectFile}
            onCreateFileClick={() => setCreateModalOpen(true)}
            onDeleteFile={handleDeleteFile}
          />
        </div>

        {/* Right Column: TabBar & Monaco Editor */}
        <div className="md:col-span-3 h-full flex flex-col rounded-2xl overflow-hidden shadow-lg border border-[#0D2818]/20 bg-[#1E1E1E]">
          <TabBar
            openFiles={openFiles}
            activeFileId={activeFileId}
            onSelectTab={setActiveFileId}
            onCloseTab={handleCloseTab}
            hasUnsavedChanges={hasUnsavedChanges}
          />

          <div className="flex-1 overflow-hidden">
            <MonacoCodeEditor
              file={activeFile}
              onSave={async (content) => {
                await saveMutation.mutateAsync(content);
              }}
              isSaving={saveMutation.isPending}
              hasUnsavedChanges={hasUnsavedChanges}
              setHasUnsavedChanges={setHasUnsavedChanges}
            />
          </div>
        </div>
      </div>

      {/* Create Custom File Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create New Custom File"
        maxWidth="md"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!newFilePath.trim()) return;
            createMutation.mutate({ path: newFilePath.trim(), content: newFileContent });
          }}
          className="space-y-4 pt-2"
        >
          <div>
            <label className="block text-xs font-mono font-bold uppercase text-[#0D2818] mb-1">
              Relative File Path *
            </label>
            <input
              type="text"
              value={newFilePath}
              onChange={(e) => setNewFilePath(e.target.value)}
              placeholder="e.g. backend/app/services/custom_service.py"
              className="w-full bg-[#FAF7F2] text-xs font-mono px-3.5 py-2.5 rounded-xl border border-[#0D2818]/15 focus:outline-none focus:ring-1 focus:ring-[#84CC16]"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-bold uppercase text-[#0D2818] mb-1">
              Initial Content
            </label>
            <textarea
              rows={6}
              value={newFileContent}
              onChange={(e) => setNewFileContent(e.target.value)}
              placeholder="# Write initial code here..."
              className="w-full bg-[#FAF7F2] text-xs font-mono p-3 rounded-xl border border-[#0D2818]/15 focus:outline-none focus:ring-1 focus:ring-[#84CC16]"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-[#0D2818]/10">
            <Button variant="outline" size="sm" type="button" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="accent"
              size="sm"
              type="submit"
              isLoading={createMutation.isPending}
              icon={<Plus className="w-3.5 h-3.5" />}
            >
              Create File
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
