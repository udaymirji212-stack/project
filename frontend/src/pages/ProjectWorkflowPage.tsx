import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectApi } from '../services/projectApi';
import type { Project } from '../types/project';
import { Navbar } from '../components/common/Navbar';
import { Sidebar, WORKFLOW_STAGES, type StageConfig } from '../components/common/Sidebar';
import { RequirementsStage } from '../components/workflow/RequirementsStage';
import { SRSStage } from '../components/workflow/SRSStage';
import { ArchitectureStage } from '../components/workflow/ArchitectureStage';
import { DatabaseApiStage } from '../components/workflow/DatabaseApiStage';
import { CodeGenerationStage } from '../components/workflow/CodeGenerationStage';
import { WorkspaceStage } from '../components/workflow/WorkspaceStage';
import { ReviewTestingStage } from '../components/workflow/ReviewTestingStage';
import { DocumentationStage } from '../components/workflow/DocumentationStage';
import { ExportStage } from '../components/workflow/ExportStage';
import { Loader2, AlertCircle } from 'lucide-react';

export const ProjectWorkflowPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [currentStage, setCurrentStage] = useState<string>('requirements');
  const [completedStages, setCompletedStages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadProject = useCallback(async () => {
    if (!projectId) return;
    try {
      setIsLoading(true);
      const res = await projectApi.getProject(projectId);
      setProject(res);
      if (res.current_stage && res.current_stage !== 'completed') {
        setCurrentStage(res.current_stage);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load project');
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadProject();
  }, [loadProject]);

  const handleStageSelect = (stageId: string) => {
    setCurrentStage(stageId);
  };

  const handleAdvanceStage = async () => {
    if (!project) return;
    const currentIndex = WORKFLOW_STAGES.findIndex((s: StageConfig) => s.id === currentStage);
    if (currentIndex < WORKFLOW_STAGES.length - 1) {
      const nextStage = WORKFLOW_STAGES[currentIndex + 1].id;
      setCompletedStages((prev) => Array.from(new Set([...prev, currentStage])));
      setCurrentStage(nextStage);

      // Persist stage in backend
      try {
        await projectApi.updateProject(project.id, {
          current_stage: nextStage as any,
        });
      } catch {
        // ignore
      }
    }
  };

  if (isLoading && !project) {
    return (
      <div className="min-h-screen bg-ivory-100 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-forest-900" />
        <p className="text-sm font-semibold text-forest-800">
          Loading software engineering pipeline...
        </p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-ivory-100 flex flex-col items-center justify-center space-y-4 p-4 text-center">
        <AlertCircle className="h-12 w-12 text-red-600" />
        <h2 className="font-serif text-xl font-bold text-forest-950">Project Not Found</h2>
        <p className="text-xs text-forest-700 max-w-sm">{error || 'Unable to locate the specified project.'}</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="rounded-xl bg-forest-900 px-5 py-2.5 text-xs font-bold text-lime-400 hover:bg-forest-950 transition-colors"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivory-100 flex flex-col font-sans">
      <Navbar currentProject={project} />

      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl w-full mx-auto">
        <Sidebar
          currentStage={currentStage}
          onSelectStage={handleStageSelect}
          completedStages={completedStages}
          totalFiles={project.file_count}
          totalIssues={project.issue_count}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto min-w-0">
          {currentStage === 'requirements' && (
            <RequirementsStage
              project={project}
              onAdvance={handleAdvanceStage}
              onRefreshProject={loadProject}
            />
          )}

          {currentStage === 'srs' && (
            <SRSStage
              project={project}
              onAdvance={handleAdvanceStage}
              onRefreshProject={loadProject}
            />
          )}

          {currentStage === 'architecture' && (
            <ArchitectureStage
              project={project}
              onAdvance={handleAdvanceStage}
              onRefreshProject={loadProject}
            />
          )}

          {currentStage === 'database_api' && (
            <DatabaseApiStage
              project={project}
              onAdvance={handleAdvanceStage}
              onRefreshProject={loadProject}
            />
          )}

          {currentStage === 'code_generation' && (
            <CodeGenerationStage
              project={project}
              onAdvance={handleAdvanceStage}
              onRefreshProject={loadProject}
            />
          )}

          {currentStage === 'workspace' && (
            <WorkspaceStage
              project={project}
              onAdvance={handleAdvanceStage}
              onRefreshProject={loadProject}
            />
          )}

          {currentStage === 'review_testing' && (
            <ReviewTestingStage
              project={project}
              onAdvance={handleAdvanceStage}
              onRefreshProject={loadProject}
            />
          )}

          {currentStage === 'documentation' && (
            <DocumentationStage
              project={project}
              onAdvance={handleAdvanceStage}
              onRefreshProject={loadProject}
            />
          )}

          {currentStage === 'export' && (
            <ExportStage project={project} />
          )}
        </main>
      </div>
    </div>
  );
};
