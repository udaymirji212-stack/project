import React, { useState } from 'react';
import { Outlet, useParams, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { projectApi } from '../../services/projectApi';
import { exportApi } from '../../services/exportApi';
import { WorkflowStepper } from './WorkflowStepper';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import {
  Download,
  ArrowLeft,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const ProjectLayout: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const queryClient = useQueryClient();
  const [isExporting, setIsExporting] = useState(false);

  const { data: project, isLoading, error } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => projectApi.getById(projectId!),
    enabled: !!projectId,
  });

  const handleExportZip = async () => {
    if (!project) return;
    try {
      setIsExporting(true);
      await exportApi.downloadZip(project.id, project.name);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#6366F1', '#4F46E5', '#A5B4FC'],
      });
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
    } catch (err: any) {
      alert(err.message || 'Failed to download ZIP');
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-16 text-center">
        <div className="w-10 h-10 border-4 border-zinc-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
        <p className="font-sans text-sm text-zinc-500">Loading Project Workspace...</p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-16 text-center">
        <h2 className="font-serif text-2xl text-rose-800">Project Not Found</h2>
        <p className="text-sm text-zinc-500 mt-2 mb-6">
          The requested project does not exist or you do not have permission to view it.
        </p>
        <Link to="/dashboard">
          <Button variant="primary">Return to Dashboard</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-8 space-y-6 font-sans">
      {/* Top Banner & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200/80 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Link
              to="/dashboard"
              className="text-xs font-sans text-zinc-500 hover:text-zinc-900 inline-flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Dashboard
            </Link>
            <span className="text-xs text-zinc-300">/</span>
            <Badge variant="lime" size="sm">
              {project.preferred_tech_stack}
            </Badge>
            {project.status === 'completed' && (
              <Badge variant="success" size="sm">
                Production Ready
              </Badge>
            )}
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif text-zinc-900">
            {project.name}
          </h1>
          <p className="text-sm text-zinc-500 mt-1 max-w-3xl line-clamp-1">
            {project.business_idea}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button
            variant="accent"
            size="md"
            icon={<Download className="w-4 h-4" />}
            isLoading={isExporting}
            onClick={handleExportZip}
            title="Download complete sanitized project ZIP archive"
          >
            Export ZIP Archive
          </Button>
        </div>
      </div>

      {/* Step Progression Bar */}
      <WorkflowStepper currentStage={project.current_stage} />

      {/* Stage Workspace Content */}
      <div className="pt-2">
        <Outlet context={{ project }} />
      </div>
    </div>
  );
};
