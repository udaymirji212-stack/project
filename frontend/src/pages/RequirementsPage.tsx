import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workflowApi } from '../services/workflowApi';
import type { RequirementAnalysis, FunctionalRequirement, NonFunctionalRequirement, UserRole, UserStory } from '../types/workflow';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import {
  Sparkles,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  Plus,
  Trash2,
  Shield,
  Zap,
  Users,
  AlertTriangle,
  HelpCircle,
} from 'lucide-react';

export const RequirementsPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<'functional' | 'nonfunctional' | 'stories' | 'roles' | 'risks'>('functional');
  const [newFrTitle, setNewFrTitle] = useState('');
  const [newFrDesc, setNewFrDesc] = useState('');
  const [newFrPriority, setNewFrPriority] = useState<'High' | 'Medium' | 'Low'>('High');

  // Fetch Requirements
  const { data: reqs, isLoading } = useQuery({
    queryKey: ['requirements', projectId],
    queryFn: () => workflowApi.getRequirements(projectId!),
    enabled: !!projectId,
  });

  // Generate / Regenerate
  const generateMutation = useMutation({
    mutationFn: () => workflowApi.generateRequirements(projectId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requirements', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
    },
  });

  // Update / Approve
  const updateMutation = useMutation({
    mutationFn: (data: Partial<RequirementAnalysis>) =>
      workflowApi.updateRequirements(projectId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requirements', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
    },
  });

  const handleApproveAndProceed = async () => {
    await updateMutation.mutateAsync({ is_approved: true });
    // Advance to SRS
    await workflowApi.generateSRS(projectId!);
    navigate(`/projects/${projectId}/srs`);
  };

  const handleAddFunctionalReq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqs || !newFrTitle.trim()) return;

    const newItem: FunctionalRequirement = {
      id: `FR-0${reqs.functional_requirements.length + 1}`,
      title: newFrTitle.trim(),
      description: newFrDesc.trim() || 'Custom domain requirement',
      priority: newFrPriority,
      category: 'Custom Feature',
    };

    const updated = [...reqs.functional_requirements, newItem];
    updateMutation.mutate({ functional_requirements: updated });
    setNewFrTitle('');
    setNewFrDesc('');
  };

  const handleDeleteFunctionalReq = (id: string) => {
    if (!reqs) return;
    const updated = reqs.functional_requirements.filter((f: FunctionalRequirement) => f.id !== id);
    updateMutation.mutate({ functional_requirements: updated });
  };

  if (isLoading) {
    return (
      <div className="text-center py-20">
        <div className="w-10 h-10 border-4 border-[#0D2818] border-t-[#84CC16] rounded-full animate-spin mx-auto mb-4" />
        <p className="font-mono text-sm text-[#0D2818]/70">Analyzing Requirements with AI Architecture Engine...</p>
      </div>
    );
  }

  if (!reqs) {
    return (
      <Card className="text-center py-16 px-6 max-w-lg mx-auto space-y-4">
        <Sparkles className="w-10 h-10 text-[#84CC16] mx-auto" />
        <h3 className="font-serif font-bold text-2xl text-[#0D2818]">No Requirements Generated</h3>
        <p className="text-xs text-[#0D2818]/70 font-sans">
          Trigger the AI analysis engine to formulate structured functional & non-functional requirements.
        </p>
        <Button
          variant="accent"
          isLoading={generateMutation.isPending}
          onClick={() => generateMutation.mutate()}
          icon={<Sparkles className="w-4 h-4" />}
        >
          Generate Requirements
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#0D2818]/10 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant={reqs.is_approved ? 'success' : 'lime'} size="sm">
              {reqs.is_approved ? 'Approved & Locked' : 'Draft Requirements'}
            </Badge>
            <span className="text-xs font-mono text-[#0D2818]/60">v{reqs.version}</span>
          </div>
          <h2 className="font-serif font-bold text-2xl text-[#0D2818] mt-1">
            Requirement Analysis & User Specifications
          </h2>
          <p className="text-xs text-[#0D2818]/70 font-sans mt-0.5">
            Review, edit, or add custom requirements before advancing to SRS generation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            icon={<RefreshCw className="w-3.5 h-3.5" />}
            isLoading={generateMutation.isPending}
            onClick={() => generateMutation.mutate()}
            title="Re-run AI analysis"
          >
            Regenerate
          </Button>
          <Button
            variant="accent"
            size="md"
            icon={<ArrowRight className="w-4 h-4" />}
            isLoading={updateMutation.isPending}
            onClick={handleApproveAndProceed}
          >
            Approve & Generate SRS
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-mono">
        {[
          { id: 'functional', label: `Functional Requirements (${reqs.functional_requirements.length})`, icon: Zap },
          { id: 'nonfunctional', label: `Non-Functional (${reqs.non_functional_requirements.length})`, icon: Shield },
          { id: 'stories', label: `User Stories (${reqs.user_stories.length})`, icon: Users },
          { id: 'roles', label: `User Roles (${reqs.user_roles.length})`, icon: Users },
          { id: 'risks', label: 'Risks & Assumptions', icon: AlertTriangle },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-full border transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-[#0D2818] text-white border-[#0D2818] font-bold shadow-xs'
                : 'bg-white text-[#0D2818]/70 border-[#0D2818]/15 hover:bg-[#FAF7F2]'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* TAB 1: FUNCTIONAL REQUIREMENTS */}
      {activeTab === 'functional' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reqs.functional_requirements.map((item: FunctionalRequirement) => (
              <Card key={item.id} className="p-5 flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-[#84CC16] bg-[#0D2818] px-2.5 py-0.5 rounded-full">
                      {item.id}
                    </span>
                    <div className="flex items-center gap-2">
                      <Badge variant={item.priority === 'High' ? 'high' : item.priority === 'Medium' ? 'medium' : 'low'}>
                        {item.priority}
                      </Badge>
                      <button
                        onClick={() => handleDeleteFunctionalReq(item.id)}
                        className="p-1 text-[#0D2818]/40 hover:text-rose-600 transition-colors"
                        title="Delete requirement"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <h4 className="font-serif font-bold text-base text-[#0D2818]">{item.title}</h4>
                  <p className="text-xs text-[#0D2818]/80 leading-relaxed font-sans">{item.description}</p>
                </div>
                <div className="pt-2 border-t border-[#0D2818]/10 text-[11px] font-mono text-[#0D2818]/60">
                  Category: {item.category}
                </div>
              </Card>
            ))}
          </div>

          {/* Add Requirement Form */}
          <Card className="p-6 bg-[#FAF7F2]/60">
            <h4 className="font-serif font-bold text-base text-[#0D2818] mb-3">Add Custom Functional Requirement</h4>
            <form onSubmit={handleAddFunctionalReq} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <input
                    type="text"
                    value={newFrTitle}
                    onChange={(e) => setNewFrTitle(e.target.value)}
                    placeholder="Requirement title..."
                    className="w-full bg-white text-xs font-sans px-3.5 py-2.5 rounded-xl border border-[#0D2818]/15 focus:outline-none focus:ring-1 focus:ring-[#84CC16]"
                  />
                </div>
                <div>
                  <select
                    value={newFrPriority}
                    onChange={(e) => setNewFrPriority(e.target.value as any)}
                    className="w-full bg-white text-xs font-mono px-3.5 py-2.5 rounded-xl border border-[#0D2818]/15 focus:outline-none focus:ring-1 focus:ring-[#84CC16]"
                  >
                    <option value="High">High Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="Low">Low Priority</option>
                  </select>
                </div>
              </div>
              <textarea
                rows={2}
                value={newFrDesc}
                onChange={(e) => setNewFrDesc(e.target.value)}
                placeholder="Requirement description and behavior..."
                className="w-full bg-white text-xs font-sans p-3 rounded-xl border border-[#0D2818]/15 focus:outline-none focus:ring-1 focus:ring-[#84CC16]"
              />
              <Button type="submit" size="sm" variant="primary" icon={<Plus className="w-3.5 h-3.5" />}>
                Add Requirement
              </Button>
            </form>
          </Card>
        </div>
      )}

      {/* TAB 2: NON-FUNCTIONAL REQUIREMENTS */}
      {activeTab === 'nonfunctional' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reqs.non_functional_requirements.map((item: NonFunctionalRequirement) => (
            <Card key={item.id} className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-[#0D2818] bg-[#FAF7F2] px-2.5 py-0.5 rounded-full border border-[#0D2818]/15">
                  {item.id}
                </span>
                <Badge variant="lime" size="sm">
                  {item.category}
                </Badge>
              </div>
              <h4 className="font-serif font-bold text-base text-[#0D2818]">{item.title}</h4>
              <p className="text-xs text-[#0D2818]/80 leading-relaxed font-sans">{item.description}</p>
            </Card>
          ))}
        </div>
      )}

      {/* TAB 3: USER STORIES */}
      {activeTab === 'stories' && (
        <div className="space-y-4">
          {reqs.user_stories.map((story: UserStory) => (
            <Card key={story.id} className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-[#84CC16] bg-[#0D2818] px-2.5 py-0.5 rounded-full">
                  {story.id}
                </span>
                <span className="text-xs font-mono text-[#0D2818]/60">Persona: {story.as_a}</span>
              </div>
              <div className="text-sm font-sans space-y-1 text-[#0D2818]">
                <p>
                  <strong>As a</strong> <span className="underline decoration-[#84CC16]">{story.as_a}</span>
                </p>
                <p>
                  <strong>I want</strong> <span>{story.i_want}</span>
                </p>
                <p>
                  <strong>So that</strong> <span>{story.so_that}</span>
                </p>
              </div>

              {story.acceptance_criteria && story.acceptance_criteria.length > 0 && (
                <div className="pt-3 border-t border-[#0D2818]/10 space-y-2">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#0D2818]/60 block">
                    Acceptance Criteria:
                  </span>
                  <ul className="space-y-1 text-xs text-[#0D2818]/80 font-sans list-disc list-inside">
                    {story.acceptance_criteria.map((crit: string, idx: number) => (
                      <li key={idx}>{crit}</li>
                    ))}
                  </ul>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* TAB 4: USER ROLES */}
      {activeTab === 'roles' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reqs.user_roles.map((role: UserRole) => (
            <Card key={role.id} className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-[#0D2818] bg-[#FAF7F2] px-2.5 py-0.5 rounded-full border border-[#0D2818]/15">
                  {role.id}
                </span>
                <Badge variant="forest" size="sm">
                  Role Definition
                </Badge>
              </div>
              <h4 className="font-serif font-bold text-lg text-[#0D2818]">{role.role_name}</h4>
              <p className="text-xs text-[#0D2818]/80 leading-relaxed font-sans">{role.description}</p>
              <div className="pt-2 flex flex-wrap gap-1.5">
                {role.permissions?.map((perm: string, idx: number) => (
                  <span
                    key={idx}
                    className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#FAF7F2] text-[#0D2818]/90 border border-[#0D2818]/10"
                  >
                    {perm}
                  </span>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* TAB 5: RISKS & ASSUMPTIONS */}
      {activeTab === 'risks' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 space-y-3 bg-amber-50/40 border-amber-300/60">
            <div className="flex items-center gap-2 text-amber-900 font-bold font-serif">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <span>Identified Risks</span>
            </div>
            <ul className="space-y-2 text-xs text-[#0D2818]/80 list-disc list-inside font-sans">
              {reqs.risks_assumptions?.risks?.map((r: string, i: number) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </Card>

          <Card className="p-6 space-y-3 bg-sky-50/40 border-sky-300/60">
            <div className="flex items-center gap-2 text-sky-900 font-bold font-serif">
              <CheckCircle2 className="w-5 h-5 text-sky-600" />
              <span>Assumptions</span>
            </div>
            <ul className="space-y-2 text-xs text-[#0D2818]/80 list-disc list-inside font-sans">
              {reqs.risks_assumptions?.assumptions?.map((a: string, i: number) => (
                <li key={i}>{a}</li>
              ))}
            </ul>
          </Card>

          <Card className="p-6 space-y-3 bg-purple-50/40 border-purple-300/60">
            <div className="flex items-center gap-2 text-purple-900 font-bold font-serif">
              <HelpCircle className="w-5 h-5 text-purple-600" />
              <span>Missing Information</span>
            </div>
            <ul className="space-y-2 text-xs text-[#0D2818]/80 list-disc list-inside font-sans">
              {reqs.risks_assumptions?.missing_info?.map((m: string, i: number) => (
                <li key={i}>{m}</li>
              ))}
            </ul>
          </Card>
        </div>
      )}
    </div>
  );
};
