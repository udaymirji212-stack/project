import React, { useState, useEffect } from 'react';
import { workflowApi } from '../../services/workflowApi';
import type {
  RequirementAnalysis,
} from '../../types/workflow';
import type { Project } from '../../types/project';
import {
  CheckCircle2,
  AlertTriangle,
  Users,
  ShieldAlert,
  ListTodo,
  FileText,
  Check,
  Save,
  ArrowRight,
  Loader2,
  RefreshCw,
} from 'lucide-react';

interface RequirementsStageProps {
  project: Project;
  onAdvance: () => void;
  onRefreshProject?: () => void;
}

export const RequirementsStage: React.FC<RequirementsStageProps> = ({
  project,
  onAdvance,
  onRefreshProject,
}) => {
  const [data, setData] = useState<RequirementAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'functional' | 'nonfunctional' | 'personas' | 'stories' | 'risks'>('functional');

  const loadRequirements = async () => {
    try {
      setIsLoading(true);
      const res = await workflowApi.getRequirements(project.id);
      setData(res);
    } catch {
      await handleGenerate();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRequirements();
  }, [project.id]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const res = await workflowApi.generateRequirements(project.id);
      setData(res);
      if (onRefreshProject) onRefreshProject();
    } catch (err) {
      console.error('Failed to generate requirements:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async (approved = false) => {
    if (!data) return;
    setIsSaving(true);
    try {
      const res = await workflowApi.updateRequirements(project.id, {
        ...data,
        is_approved: approved ? true : data.is_approved,
        approved_at: approved ? new Date().toISOString() : data.approved_at,
      });
      setData(res);
      if (approved) {
        onAdvance();
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading && !data) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-forest-900" />
        <p className="text-sm font-semibold text-forest-800">
          Synthesizing software requirements with AI domain analyzer...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-3xl bg-ivory-50 p-6 border border-forest-900/10 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <span className="rounded-lg bg-forest-900/10 p-1.5 text-forest-900 font-mono text-xs font-bold">
              Stage 01
            </span>
            <h2 className="font-serif text-2xl font-bold text-forest-950">
              Requirements Engineering & Analysis
            </h2>
          </div>
          <p className="mt-1 text-xs text-forest-700/70">
            Deconstruct business concept into verified functional specs, non-functional criteria, user stories, and risk matrices.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleGenerate()}
            disabled={isGenerating}
            className="inline-flex items-center space-x-1.5 rounded-xl bg-ivory-200 px-3.5 py-2 text-xs font-bold text-forest-900 hover:bg-ivory-300 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? 'Analyzing...' : 'Re-Analyze'}</span>
          </button>

          <button
            onClick={() => handleSave(false)}
            disabled={isSaving}
            className="inline-flex items-center space-x-1.5 rounded-xl bg-ivory-200 px-3.5 py-2 text-xs font-bold text-forest-900 hover:bg-ivory-300 transition-colors"
          >
            <Save className="h-3.5 w-3.5" />
            <span>Save Draft</span>
          </button>

          <button
            onClick={() => handleSave(true)}
            disabled={isSaving}
            className="inline-flex items-center space-x-2 rounded-xl bg-forest-900 px-5 py-2 text-xs font-bold text-lime-400 shadow-md hover:bg-forest-950 transition-all"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>Approve & Proceed to SRS</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-forest-900/10 pb-2">
        <button
          onClick={() => setActiveTab('functional')}
          className={`flex items-center space-x-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
            activeTab === 'functional'
              ? 'bg-forest-900 text-ivory-100 shadow-sm'
              : 'bg-ivory-50 text-forest-800 hover:bg-ivory-200'
          }`}
        >
          <ListTodo className="h-4 w-4" />
          <span>Functional Requirements ({data?.functional_requirements.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('nonfunctional')}
          className={`flex items-center space-x-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
            activeTab === 'nonfunctional'
              ? 'bg-forest-900 text-ivory-100 shadow-sm'
              : 'bg-ivory-50 text-forest-800 hover:bg-ivory-200'
          }`}
        >
          <ShieldAlert className="h-4 w-4" />
          <span>Non-Functional ({data?.non_functional_requirements.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('personas')}
          className={`flex items-center space-x-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
            activeTab === 'personas'
              ? 'bg-forest-900 text-ivory-100 shadow-sm'
              : 'bg-ivory-50 text-forest-800 hover:bg-ivory-200'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>User Roles & Personas ({data?.user_roles.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('stories')}
          className={`flex items-center space-x-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
            activeTab === 'stories'
              ? 'bg-forest-900 text-ivory-100 shadow-sm'
              : 'bg-ivory-50 text-forest-800 hover:bg-ivory-200'
          }`}
        >
          <FileText className="h-4 w-4" />
          <span>User Stories ({data?.user_stories.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('risks')}
          className={`flex items-center space-x-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
            activeTab === 'risks'
              ? 'bg-forest-900 text-ivory-100 shadow-sm'
              : 'bg-ivory-50 text-forest-800 hover:bg-ivory-200'
          }`}
        >
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <span>Risks & Assumptions</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="space-y-4">
        {/* Functional Requirements */}
        {activeTab === 'functional' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data?.functional_requirements.map((req, idx) => (
              <div
                key={req.id || idx}
                className="rounded-2xl bg-ivory-50 p-5 border border-forest-900/10 shadow-sm hover:shadow-md transition-all space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-forest-900/10 text-forest-900">
                      {req.id}
                    </span>
                    <span className="text-xs font-semibold text-forest-700/60 uppercase">
                      {req.category}
                    </span>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                      req.priority === 'High'
                        ? 'bg-red-500/15 text-red-700'
                        : req.priority === 'Medium'
                        ? 'bg-amber-500/15 text-amber-700'
                        : 'bg-emerald-500/15 text-emerald-700'
                    }`}
                  >
                    {req.priority} Priority
                  </span>
                </div>
                <h4 className="font-bold text-sm text-forest-950">{req.title}</h4>
                <p className="text-xs text-forest-700/80 leading-relaxed">
                  {req.description}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Non-Functional Requirements */}
        {activeTab === 'nonfunctional' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data?.non_functional_requirements.map((req, idx) => (
              <div
                key={req.id || idx}
                className="rounded-2xl bg-ivory-50 p-5 border border-forest-900/10 shadow-sm hover:shadow-md transition-all space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-forest-900/10 text-forest-900">
                    {req.id}
                  </span>
                  <span className="rounded-full bg-forest-800/10 px-2.5 py-0.5 text-[10px] font-bold text-forest-800">
                    {req.category}
                  </span>
                </div>
                <h4 className="font-bold text-sm text-forest-950">{req.title}</h4>
                <p className="text-xs text-forest-700/80 leading-relaxed">
                  {req.description}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* User Roles & Personas */}
        {activeTab === 'personas' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data?.user_roles.map((role, idx) => (
              <div
                key={role.id || idx}
                className="rounded-2xl bg-ivory-50 p-5 border border-forest-900/10 shadow-sm space-y-3"
              >
                <div className="flex items-center space-x-2">
                  <div className="rounded-xl bg-forest-900 p-2 text-lime-400">
                    <Users className="h-4 w-4" />
                  </div>
                  <h4 className="font-bold text-sm text-forest-950">{role.role_name}</h4>
                </div>
                <p className="text-xs text-forest-700/80 leading-relaxed">
                  {role.description}
                </p>
                <div className="pt-2 border-t border-forest-900/10">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-forest-700/60 block mb-1.5">
                    Granted Permissions
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {role.permissions.map((perm, pIdx) => (
                      <span
                        key={pIdx}
                        className="rounded-md bg-forest-900/5 px-2 py-0.5 text-[10px] font-mono text-forest-800"
                      >
                        {perm}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* User Stories */}
        {activeTab === 'stories' && (
          <div className="grid grid-cols-1 gap-4">
            {data?.user_stories.map((story, idx) => (
              <div
                key={story.id || idx}
                className="rounded-2xl bg-ivory-50 p-6 border border-forest-900/10 shadow-sm space-y-3"
              >
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded bg-forest-900 text-lime-400">
                    {story.id}
                  </span>
                  <span className="text-xs font-bold text-forest-900">
                    As a <span className="text-lime-600 underline underline-offset-2">{story.as_a}</span>
                  </span>
                </div>

                <p className="text-sm font-semibold text-forest-950">
                  "I want <span className="font-bold">{story.i_want}</span>, so that <span className="text-forest-700">{story.so_that}</span>"
                </p>

                <div className="mt-3 rounded-xl bg-ivory-200/50 p-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-forest-800 block mb-1">
                    Acceptance Criteria:
                  </span>
                  <ul className="space-y-1 text-xs text-forest-700">
                    {story.acceptance_criteria.map((crit, cIdx) => (
                      <li key={cIdx} className="flex items-start space-x-2">
                        <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{crit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Risks & Assumptions */}
        {activeTab === 'risks' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-2xl bg-amber-500/5 p-5 border border-amber-500/20 space-y-3">
              <div className="flex items-center space-x-2 text-amber-700">
                <AlertTriangle className="h-5 w-5" />
                <h4 className="font-bold text-sm">Potential Risks</h4>
              </div>
              <ul className="space-y-2 text-xs text-forest-900">
                {data?.risks_assumptions.risks.map((risk, idx) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <span className="font-bold text-amber-600">•</span>
                    <span>{risk}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl bg-forest-900/5 p-5 border border-forest-900/15 space-y-3">
              <div className="flex items-center space-x-2 text-forest-900">
                <ShieldAlert className="h-5 w-5 text-lime-600" />
                <h4 className="font-bold text-sm">System Assumptions</h4>
              </div>
              <ul className="space-y-2 text-xs text-forest-900">
                {data?.risks_assumptions.assumptions.map((asmp, idx) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <span className="font-bold text-forest-700">•</span>
                    <span>{asmp}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl bg-ivory-200/60 p-5 border border-forest-900/10 space-y-3">
              <div className="flex items-center space-x-2 text-forest-800">
                <FileText className="h-5 w-5" />
                <h4 className="font-bold text-sm">Clarification Items</h4>
              </div>
              <ul className="space-y-2 text-xs text-forest-900">
                {data?.risks_assumptions.missing_info.map((item, idx) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <span className="font-bold text-forest-600">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
