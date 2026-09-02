import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Calendar,
  Layers,
  Trash2,
  CheckCircle2,
  FileCode,
  ShieldCheck,
} from 'lucide-react';
import type { Project } from '../../types/project';
import { WORKFLOW_STAGES } from '../common/Sidebar';

interface ProjectCardProps {
  project: Project;
  onDelete: (id: string) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onDelete }) => {
  const navigate = useNavigate();

  const currentStageObj = WORKFLOW_STAGES.find((s) => s.id === project.current_stage);
  const currentStageIndex = WORKFLOW_STAGES.findIndex((s) => s.id === project.current_stage);
  const progressPercent = Math.min(
    100,
    Math.round(((Math.max(0, currentStageIndex) + 1) / WORKFLOW_STAGES.length) * 100)
  );

  return (
    <div className="group relative flex flex-col justify-between rounded-3xl bg-ivory-50 p-6 border border-forest-900/10 shadow-sm transition-all duration-300 hover:shadow-xl hover:border-forest-900/30 hover:-translate-y-1">
      <div>
        {/* Top badges */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <span className="inline-flex items-center rounded-lg bg-forest-900/5 px-2.5 py-1 text-xs font-semibold text-forest-800 border border-forest-900/10">
            {project.preferred_tech_stack || 'Full-Stack'}
          </span>

          <div className="flex items-center space-x-1.5">
            <span
              className={`inline-flex items-center space-x-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                project.status === 'completed'
                  ? 'bg-emerald-500/15 text-emerald-700'
                  : 'bg-lime-500/20 text-forest-900'
              }`}
            >
              {project.status === 'completed' ? (
                <CheckCircle2 className="h-3 w-3 text-emerald-600" />
              ) : (
                <span className="h-1.5 w-1.5 rounded-full bg-lime-600 animate-pulse" />
              )}
              <span className="capitalize">{currentStageObj?.shortName || project.current_stage}</span>
            </span>

            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm(`Are you sure you want to delete "${project.name}"?`)) {
                  onDelete(project.id);
                }
              }}
              title="Delete project"
              className="p-1 text-forest-700/40 hover:text-red-600 hover:bg-red-500/10 rounded-md transition-colors opacity-0 group-hover:opacity-100"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Title and Idea */}
        <h3 className="font-serif text-xl font-bold text-forest-950 group-hover:text-forest-800 transition-colors line-clamp-1">
          {project.name}
        </h3>
        <p className="mt-2 text-xs text-forest-700/80 line-clamp-3 leading-relaxed">
          {project.business_idea || project.description || 'No description provided.'}
        </p>

        {/* Progress Bar */}
        <div className="mt-5 space-y-1.5">
          <div className="flex justify-between text-[11px] font-medium text-forest-700/70">
            <span>Pipeline Progress</span>
            <span className="font-mono font-bold text-forest-900">{progressPercent}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-forest-900/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-forest-800 to-lime-500 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Meta counters */}
        <div className="mt-5 grid grid-cols-3 gap-2 border-t border-forest-900/10 pt-4 text-center">
          <div className="rounded-xl bg-forest-900/5 py-2">
            <div className="flex items-center justify-center space-x-1 text-forest-900 font-mono text-xs font-bold">
              <FileCode className="h-3 w-3 text-forest-700" />
              <span>{project.file_count || 0}</span>
            </div>
            <span className="text-[10px] text-forest-700/60 uppercase">Files</span>
          </div>

          <div className="rounded-xl bg-forest-900/5 py-2">
            <div className="flex items-center justify-center space-x-1 text-emerald-700 font-mono text-xs font-bold">
              <ShieldCheck className="h-3 w-3 text-emerald-600" />
              <span>{project.test_count || 0}</span>
            </div>
            <span className="text-[10px] text-forest-700/60 uppercase">Tests</span>
          </div>

          <div className="rounded-xl bg-forest-900/5 py-2">
            <div className="flex items-center justify-center space-x-1 text-forest-800 font-mono text-xs font-bold">
              <Layers className="h-3 w-3 text-forest-700" />
              <span>{Math.max(1, currentStageIndex + 1)}/9</span>
            </div>
            <span className="text-[10px] text-forest-700/60 uppercase">Stage</span>
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="mt-6 pt-4 border-t border-forest-900/10 flex items-center justify-between">
        <div className="flex items-center space-x-1 text-[11px] text-forest-700/60">
          <Calendar className="h-3 w-3" />
          <span>{new Date(project.created_at).toLocaleDateString()}</span>
        </div>

        <button
          onClick={() => navigate(`/projects/${project.id}`)}
          className="inline-flex items-center space-x-1.5 rounded-xl bg-forest-900 px-4 py-2 text-xs font-bold text-ivory-100 shadow-sm transition-all hover:bg-forest-800 hover:text-lime-300"
        >
          <span>Open Pipeline</span>
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );
};
