import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workflowApi } from '../services/workflowApi';
import type { GeneratedFile } from '../types/workspace';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import {
  Terminal,
  ArrowRight,
  RefreshCw,
  FileCode,
  FolderTree,
  Cpu,
  Server,
  Globe,
  Container,
} from 'lucide-react';

export const CodeGenerationPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch Workspace Files
  const { data: files = [], isLoading } = useQuery({
    queryKey: ['workspace-files', projectId],
    queryFn: () => workflowApi.getWorkspaceFiles(projectId!),
    enabled: !!projectId,
  });

  // Regenerate Codebase Mutation
  const generateMutation = useMutation({
    mutationFn: (force: boolean) =>
      workflowApi.generateCode(projectId!, { force_regenerate: force }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace-files', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
    },
  });

  const handleOpenWorkspace = () => {
    navigate(`/projects/${projectId}/workspace`);
  };

  const fileTypeCounts = {
    backend: files.filter((f) => f.file_type === 'backend').length,
    frontend: files.filter((f) => f.file_type === 'frontend').length,
    docker: files.filter((f) => f.file_type === 'docker').length,
    test: files.filter((f) => f.file_type === 'test').length,
    config: files.filter((f) => f.file_type === 'config').length,
  };

  if (isLoading) {
    return (
      <div className="text-center py-20 font-sans">
        <div className="w-10 h-10 border-4 border-zinc-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
        <p className="font-sans text-sm text-zinc-500">Synthesizing Validated Production Codebase...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/90 backdrop-blur-md p-6 rounded-2xl border border-zinc-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="lime" size="sm">
              CODE GENERATION SUITE
            </Badge>
            <span className="text-xs font-sans text-zinc-400">
              {files.length} Production Files Generated
            </span>
          </div>
          <h2 className="font-serif text-2xl text-zinc-900 mt-1">
            Full-Stack Codebase Synthesis
          </h2>
          <p className="text-xs text-zinc-500 font-sans mt-0.5">
            Micro-modular full-stack software tree ready for inline editing in Monaco Editor.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            icon={<RefreshCw className="w-3.5 h-3.5" />}
            isLoading={generateMutation.isPending}
            onClick={() => generateMutation.mutate(true)}
            title="Force regenerate all files from latest specifications"
          >
            Regenerate Codebase
          </Button>
          <Button
            variant="accent"
            size="md"
            icon={<ArrowRight className="w-4 h-4" />}
            onClick={handleOpenWorkspace}
          >
            Launch Monaco Workspace
          </Button>
        </div>
      </div>

      {/* Generation Overview Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <Card className="p-4 flex items-center gap-3 bg-white/90">
          <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-700">
            <Server className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <span className="text-[11px] font-sans uppercase text-zinc-400 font-medium block">Backend</span>
            <span className="text-xl font-serif text-zinc-900">{fileTypeCounts.backend} Files</span>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3 bg-white/90">
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700">
            <Globe className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <span className="text-[11px] font-sans uppercase text-zinc-400 font-medium block">Frontend</span>
            <span className="text-xl font-serif text-zinc-900">{fileTypeCounts.frontend} Files</span>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3 bg-white/90">
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700">
            <Container className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <span className="text-[11px] font-sans uppercase text-zinc-400 font-medium block">Docker</span>
            <span className="text-xl font-serif text-zinc-900">{fileTypeCounts.docker} Files</span>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3 bg-white/90">
          <div className="p-2.5 rounded-xl bg-sky-50 text-sky-700">
            <Terminal className="w-5 h-5 text-sky-600" />
          </div>
          <div>
            <span className="text-[11px] font-sans uppercase text-zinc-400 font-medium block">Tests</span>
            <span className="text-xl font-serif text-zinc-900">{fileTypeCounts.test} Files</span>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3 bg-white/90">
          <div className="p-2.5 rounded-xl bg-purple-50 text-purple-700">
            <Cpu className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <span className="text-[11px] font-sans uppercase text-zinc-400 font-medium block">Config</span>
            <span className="text-xl font-serif text-zinc-900">{fileTypeCounts.config} Files</span>
          </div>
        </Card>
      </div>

      {/* Generated File Tree Directory Manifest */}
      <Card className="p-6 space-y-4 bg-white/90">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
          <div className="flex items-center gap-2">
            <FolderTree className="w-4 h-4 text-indigo-600" />
            <h3 className="font-serif text-xl text-zinc-900">
              Project Directory Manifest
            </h3>
          </div>
          <span className="text-xs font-mono text-zinc-400">
            Root: <code className="text-zinc-800 font-bold">/workspace_root</code>
          </span>
        </div>

        <div className="divide-y divide-zinc-100 text-xs font-mono">
          {files.map((file: GeneratedFile) => (
            <div
              key={file.id}
              onClick={handleOpenWorkspace}
              className="py-3 px-2 flex items-center justify-between hover:bg-zinc-50 cursor-pointer rounded-xl transition-colors"
            >
              <div className="flex items-center gap-3">
                <FileCode className="w-4 h-4 text-indigo-600 shrink-0" />
                <span className="font-medium text-zinc-900">{file.path}</span>
                {file.is_user_edited && (
                  <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full font-sans">
                    Edited
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 text-zinc-400">
                <span className="uppercase text-[10px] font-medium">{file.language}</span>
                <span>{file.size_bytes} bytes</span>
                <span className="text-indigo-600 font-sans font-medium text-xs">Inspect in IDE →</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
