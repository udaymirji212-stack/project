import React from 'react';
import {
  FileText,
  BookOpen,
  Network,
  Database,
  Cpu,
  Code2,
  ShieldAlert,
  FileCheck2,
  DownloadCloud,
  CheckCircle2,
  Circle,
  Sparkles,
} from 'lucide-react';

interface SidebarProps {
  currentStage: string;
  onSelectStage: (stage: string) => void;
  completedStages?: string[];
  totalFiles?: number;
  totalIssues?: number;
}

export interface StageConfig {
  id: string;
  number: number;
  name: string;
  shortName: string;
  description: string;
  icon: React.ElementType;
}

export const WORKFLOW_STAGES: StageConfig[] = [
  {
    id: 'requirements',
    number: 1,
    name: 'Requirements Analysis',
    shortName: 'Requirements',
    description: 'Functional, personas, user stories & risks',
    icon: FileText,
  },
  {
    id: 'srs',
    number: 2,
    name: 'SRS Specification',
    shortName: 'SRS Doc',
    description: 'IEEE 830 compliant software spec',
    icon: BookOpen,
  },
  {
    id: 'architecture',
    number: 3,
    name: 'System Architecture',
    shortName: 'Architecture',
    description: 'Diagram nodes & 3D component view',
    icon: Network,
  },
  {
    id: 'database_api',
    number: 4,
    name: 'DB & API Design',
    shortName: 'DB & APIs',
    description: 'ER Schema DDL & REST endpoints',
    icon: Database,
  },
  {
    id: 'code_generation',
    number: 5,
    name: 'Code Generation',
    shortName: 'Code Generator',
    description: 'Full-stack source tree synthesis',
    icon: Cpu,
  },
  {
    id: 'workspace',
    number: 6,
    name: 'Monaco Workspace',
    shortName: 'IDE Workspace',
    description: 'Multi-tab code editor & file manager',
    icon: Code2,
  },
  {
    id: 'review_testing',
    number: 7,
    name: 'AI Review & Testing',
    shortName: 'Review & Tests',
    description: 'Security scanner & test runner',
    icon: ShieldAlert,
  },
  {
    id: 'documentation',
    number: 8,
    name: 'Documentation',
    shortName: 'Docs & Guides',
    description: 'README, API docs, Architecture books',
    icon: FileCheck2,
  },
  {
    id: 'export',
    number: 9,
    name: 'Download & Deploy',
    shortName: 'Export ZIP',
    description: 'Sanitized package & launch guide',
    icon: DownloadCloud,
  },
];

export const Sidebar: React.FC<SidebarProps> = ({
  currentStage,
  onSelectStage,
  completedStages = [],
  totalFiles = 0,
  totalIssues = 0,
}) => {
  const currentIndex = WORKFLOW_STAGES.findIndex((s) => s.id === currentStage);

  return (
    <aside className="w-full lg:w-72 shrink-0 border-r border-forest-900/10 bg-ivory-50/50 p-4 flex flex-col justify-between overflow-y-auto">
      <div className="space-y-4">
        {/* Pipeline Progress Indicator */}
        <div className="rounded-xl bg-forest-900 p-4 text-ivory-100 shadow-md">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-semibold text-lime-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Pipeline Progress
            </span>
            <span className="font-mono font-bold text-ivory-200">
              {Math.min(100, Math.round(((currentIndex + 1) / WORKFLOW_STAGES.length) * 100))}%
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-forest-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-lime-500 to-emerald-400 transition-all duration-500"
              style={{
                width: `${((currentIndex + 1) / WORKFLOW_STAGES.length) * 100}%`,
              }}
            />
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-ivory-300/80">
            <span>Stage {currentIndex + 1} of {WORKFLOW_STAGES.length}</span>
            {totalFiles > 0 && <span className="font-mono text-lime-300">{totalFiles} Files Ready</span>}
          </div>
        </div>

        {/* Stages Navigation List */}
        <nav className="space-y-1.5">
          <div className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-forest-700/60">
            Transformation Pipeline
          </div>
          {WORKFLOW_STAGES.map((stage, idx) => {
            const isActive = currentStage === stage.id;
            const isDone = completedStages.includes(stage.id) || idx < currentIndex;

            return (
              <button
                key={stage.id}
                onClick={() => onSelectStage(stage.id)}
                className={`w-full group flex items-start space-x-3 rounded-xl p-3 text-left transition-all ${
                  isActive
                    ? 'bg-forest-800 text-ivory-100 shadow-md ring-1 ring-forest-900'
                    : 'text-forest-900 hover:bg-forest-800/5 hover:text-forest-950'
                }`}
              >
                <div
                  className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg font-mono text-xs font-bold transition-colors ${
                    isActive
                      ? 'bg-lime-500 text-forest-950 font-extrabold shadow-sm'
                      : isDone
                      ? 'bg-forest-700/10 text-forest-800 border border-forest-800/20'
                      : 'bg-ivory-200 text-forest-700/70'
                  }`}
                >
                  {isDone ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <span>{stage.number}</span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold truncate ${
                        isActive ? 'text-ivory-100' : 'text-forest-950'
                      }`}
                    >
                      {stage.name}
                    </span>
                    {stage.id === 'workspace' && totalFiles > 0 && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-lime-400/20 text-lime-400 font-mono">
                        {totalFiles}
                      </span>
                    )}
                    {stage.id === 'review_testing' && totalIssues > 0 && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono">
                        {totalIssues}
                      </span>
                    )}
                  </div>
                  <p
                    className={`text-[11px] truncate mt-0.5 ${
                      isActive ? 'text-ivory-300/80' : 'text-forest-700/60'
                    }`}
                  >
                    {stage.description}
                  </p>
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Summary Helper */}
      <div className="mt-4 pt-4 border-t border-forest-900/10 text-[11px] text-forest-700/70 flex items-center justify-between">
        <span className="flex items-center gap-1">
          <Circle className="h-2 w-2 fill-emerald-500 text-emerald-500" />
          Zero-Config SQLite Ready
        </span>
        <span className="font-mono text-[10px] bg-forest-900/5 px-2 py-0.5 rounded">v2.0</span>
      </div>
    </aside>
  );
};
