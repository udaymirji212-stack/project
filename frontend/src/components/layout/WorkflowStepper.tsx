import React from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import type { WorkflowStage } from '../../types/project';
import {
  FileText,
  BookOpen,
  Layers,
  Database,
  Code2,
  Terminal,
  ShieldCheck,
  FileCode2,
  Check,
} from 'lucide-react';

interface Step {
  id: WorkflowStage;
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
}

const STEPS: Step[] = [
  { id: 'requirements', label: '1. Requirements', path: 'requirements', icon: FileText },
  { id: 'srs', label: '2. SRS Spec', path: 'srs', icon: BookOpen },
  { id: 'architecture', label: '3. Architecture', path: 'architecture', icon: Layers },
  { id: 'database_api', label: '4. DB & API', path: 'database-api', icon: Database },
  { id: 'code_generation', label: '5. Code Gen', path: 'code-generation', icon: Code2 },
  { id: 'workspace', label: '6. Workspace', path: 'workspace', icon: Terminal },
  { id: 'review_testing', label: '7. Review & Test', path: 'review-testing', icon: ShieldCheck },
  { id: 'documentation', label: '8. Documentation', path: 'documentation', icon: FileCode2 },
];

const STAGE_ORDER: WorkflowStage[] = [
  'requirements',
  'srs',
  'architecture',
  'database_api',
  'code_generation',
  'workspace',
  'review_testing',
  'documentation',
  'completed',
];

interface WorkflowStepperProps {
  currentStage: WorkflowStage;
}

export const WorkflowStepper: React.FC<WorkflowStepperProps> = ({ currentStage }) => {
  const { projectId } = useParams<{ projectId: string }>();
  const location = useLocation();

  const currentStageIndex = STAGE_ORDER.indexOf(currentStage);

  return (
    <div className="w-full bg-white rounded-3xl border border-[#0D2818]/10 p-3 sm:p-4 shadow-sm overflow-x-auto">
      <div className="flex items-center min-w-max gap-1 sm:gap-2">
        {STEPS.map((step, idx) => {
          const stepIndex = STAGE_ORDER.indexOf(step.id);
          const isCompleted = currentStageIndex > stepIndex;
          const isCurrent = location.pathname.includes(`/${step.path}`);
          const IconComponent = step.icon;

          return (
            <React.Fragment key={step.id}>
              <Link
                to={`/projects/${projectId}/${step.path}`}
                className={`group flex items-center gap-2 px-3 py-2 rounded-full transition-all duration-200 text-xs font-mono font-medium ${
                  isCurrent
                    ? 'bg-[#0D2818] text-white shadow-sm ring-2 ring-[#84CC16]/50'
                    : isCompleted
                    ? 'bg-[#FAF7F2] text-[#0D2818] hover:bg-[#EBE3D5] border border-[#0D2818]/15'
                    : 'text-[#0D2818]/60 hover:text-[#0D2818] hover:bg-[#FAF7F2]'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10px] ${
                    isCurrent
                      ? 'bg-[#84CC16] text-[#0D2818] font-bold'
                      : isCompleted
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-[#0D2818]/10 text-[#0D2818]'
                  }`}
                >
                  {isCompleted ? <Check className="w-3 h-3 stroke-[3]" /> : <IconComponent className="w-3 h-3" />}
                </div>
                <span className="whitespace-nowrap">{step.label}</span>
              </Link>
              {idx < STEPS.length - 1 && (
                <div
                  className={`w-3 sm:w-6 h-px shrink-0 ${
                    isCompleted ? 'bg-emerald-500' : 'bg-[#0D2818]/15'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
