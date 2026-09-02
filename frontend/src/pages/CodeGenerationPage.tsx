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
      <div className="text-center py-20">
        <div className="w-10 h-10 border-4 border-[#0D2818] border-t-[#84CC16] rounded-full animate-spin mx-auto mb-4" />
        <p className="font-mono text-sm text-[#0D2818]/70">Synthesizing Validated Production Codebase...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#0D2818]/10 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="lime" size="sm">
              CODE GENERATION SUITE
            </Badge>
            <span className="text-xs font-mono text-[#0D2818]/60">
              {files.length} Production Files Generated
            </span>
          </div>
          <h2 className="font-serif font-bold text-2xl text-[#0D2818] mt-1">
            Full-Stack Codebase Synthesis
          </h2>
          <p className="text-xs text-[#0D2818]/70 font-sans mt-0.5">
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
        <Card className="p-4 flex items-center gap-3">
          <div className="p-2 rounded-xl bg-lime-100 text-lime-900">
            <Server className="w-5 h-5 text-[#0D2818]" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase text-[#0D2818]/60 font-bold block">Backend</span>
            <span className="text-xl font-serif font-bold text-[#0D2818]">{fileTypeCounts.backend} Files</span>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-100 text-emerald-900">
            <Globe className="w-5 h-5 text-emerald-800" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase text-[#0D2818]/60 font-bold block">Frontend</span>
            <span className="text-xl font-serif font-bold text-[#0D2818]">{fileTypeCounts.frontend} Files</span>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-100 text-amber-900">
            <Container className="w-5 h-5 text-amber-800" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase text-[#0D2818]/60 font-bold block">Docker</span>
            <span className="text-xl font-serif font-bold text-[#0D2818]">{fileTypeCounts.docker} Files</span>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="p-2 rounded-xl bg-sky-100 text-sky-900">
            <Terminal className="w-5 h-5 text-sky-800" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase text-[#0D2818]/60 font-bold block">Tests</span>
            <span className="text-xl font-serif font-bold text-[#0D2818]">{fileTypeCounts.test} Files</span>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="p-2 rounded-xl bg-purple-100 text-purple-900">
            <Cpu className="w-5 h-5 text-purple-800" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase text-[#0D2818]/60 font-bold block">Config</span>
            <span className="text-xl font-serif font-bold text-[#0D2818]">{fileTypeCounts.config} Files</span>
          </div>
        </Card>
      </div>

      {/* Generated File Tree Directory Manifest */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#0D2818]/10">
          <div className="flex items-center gap-2">
            <FolderTree className="w-4 h-4 text-[#84CC16]" />
            <h3 className="font-serif font-bold text-lg text-[#0D2818]">
              Project Directory Manifest
            </h3>
          </div>
          <span className="text-xs font-mono text-[#0D2818]/60">
            Root: <code className="text-[#0D2818] font-bold">/workspace_root</code>
          </span>
        </div>

        <div className="divide-y divide-[#0D2818]/10 text-xs font-mono">
          {files.map((file: GeneratedFile) => (
            <div
              key={file.id}
              onClick={handleOpenWorkspace}
              className="py-3 px-2 flex items-center justify-between hover:bg-[#FAF7F2] cursor-pointer rounded-xl transition-colors"
            >
              <div className="flex items-center gap-3">
                <FileCode className="w-4 h-4 text-[#84CC16] shrink-0" />
                <span className="font-bold text-[#0D2818]">{file.path}</span>
                {file.is_user_edited && (
                  <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.2 rounded-full">
                    Edited
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 text-[#0D2818]/60">
                <span className="uppercase text-[10px] font-semibold">{file.language}</span>
                <span>{file.size_bytes} bytes</span>
                <span className="text-[#84CC16] font-bold">Inspect in IDE →</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
