import React from 'react';
import {
  FolderKanban,
  FileCode2,
  ShieldCheck,
  Zap,
  PlusCircle,
  Sparkles,
} from 'lucide-react';
import type { DashboardStats } from '../../types/project';

interface DashboardHeaderProps {
  stats: DashboardStats | null;
  onOpenNewProject: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  stats,
  onOpenNewProject,
}) => {
  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-forest-950 via-forest-900 to-forest-800 p-8 text-ivory-100 shadow-xl ring-1 ring-forest-900/50">
        <div className="absolute right-0 top-0 -mt-8 -mr-8 h-64 w-64 rounded-full bg-lime-500/10 blur-3xl" />
        <div className="absolute left-1/3 bottom-0 -mb-8 h-48 w-48 rounded-full bg-emerald-500/10 blur-2xl" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 rounded-full bg-lime-400/15 px-3 py-1 text-xs font-semibold text-lime-400 border border-lime-400/30">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Next-Gen Autonomous Software Engineering</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-extrabold tracking-tight text-ivory-50">
              Transform Ideas into Production Code
            </h1>
            <p className="text-sm text-ivory-300/80 leading-relaxed">
              Feed raw requirements, user stories, or problem statements into an end-to-end transformation pipeline. Generate SRS specs, reactive system architectures, database schemas, full-stack source code, automated unit tests, and downloadable ZIP packages.
            </p>
          </div>

          <div className="flex shrink-0">
            <button
              onClick={onOpenNewProject}
              className="group inline-flex items-center space-x-2 rounded-2xl bg-lime-500 px-6 py-3.5 text-sm font-bold text-forest-950 shadow-lg shadow-lime-500/25 transition-all hover:bg-lime-400 hover:scale-105 active:scale-95"
            >
              <PlusCircle className="h-5 w-5 transition-transform group-hover:rotate-90" />
              <span>Generate New Project</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-ivory-50 p-5 border border-forest-900/10 shadow-sm hover:border-forest-900/20 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-forest-700/70 uppercase tracking-wider">
              Total Projects
            </span>
            <div className="rounded-xl bg-forest-800/10 p-2 text-forest-900">
              <FolderKanban className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="font-serif text-3xl font-bold text-forest-950">
              {stats?.total_projects ?? 0}
            </span>
            <span className="text-xs font-medium text-emerald-600">
              {stats?.active_projects ?? 0} active
            </span>
          </div>
        </div>

        <div className="rounded-2xl bg-ivory-50 p-5 border border-forest-900/10 shadow-sm hover:border-forest-900/20 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-forest-700/70 uppercase tracking-wider">
              Generated Files
            </span>
            <div className="rounded-xl bg-lime-500/15 p-2 text-forest-900">
              <FileCode2 className="h-4 w-4 text-forest-900" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="font-serif text-3xl font-bold text-forest-950">
              {stats?.total_generated_files ?? 0}
            </span>
            <span className="text-xs font-medium text-forest-700/60">files built</span>
          </div>
        </div>

        <div className="rounded-2xl bg-ivory-50 p-5 border border-forest-900/10 shadow-sm hover:border-forest-900/20 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-forest-700/70 uppercase tracking-wider">
              Code Quality Reviews
            </span>
            <div className="rounded-xl bg-forest-800/10 p-2 text-forest-900">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="font-serif text-3xl font-bold text-forest-950">
              {stats?.total_reviews_run ?? 0}
            </span>
            <span className="text-xs font-medium text-emerald-600">scans passed</span>
          </div>
        </div>

        <div className="rounded-2xl bg-ivory-50 p-5 border border-forest-900/10 shadow-sm hover:border-forest-900/20 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-forest-700/70 uppercase tracking-wider">
              Tests Executed
            </span>
            <div className="rounded-xl bg-lime-500/15 p-2 text-forest-900">
              <Zap className="h-4 w-4 text-forest-900" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="font-serif text-3xl font-bold text-forest-950">
              {stats?.total_tests_passed ?? 0}
            </span>
            <span className="text-xs font-medium text-emerald-600">100% simulated pass</span>
          </div>
        </div>
      </div>
    </div>
  );
};
