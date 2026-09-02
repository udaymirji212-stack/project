import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation } from '@tanstack/react-query';
import { projectApi } from '../services/projectApi';
import { workflowApi } from '../services/workflowApi';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import {
  Sparkles,
  ArrowLeft,
  Cpu,
  CheckCircle2,
} from 'lucide-react';

const projectCreateSchema = z.object({
  name: z.string().min(2, 'Project name must be at least 2 characters'),
  business_idea: z.string().min(10, 'Please provide at least 10 characters describing the business idea'),
  target_users: z.string().optional(),
  main_problem: z.string().optional(),
  expected_features: z.string().optional(),
  preferred_tech_stack: z.string().min(1, 'Please select a tech stack'),
  constraints: z.string().optional(),
});

type ProjectCreateFormValues = z.infer<typeof projectCreateSchema>;

const TECH_STACK_OPTIONS = [
  'React + FastAPI + PostgreSQL',
  'Next.js + Node.js + PostgreSQL',
  'Vue 3 + FastAPI + PostgreSQL',
  'FastAPI + Vanilla TypeScript + SQLite',
  'React + Go + PostgreSQL',
  'Django + React + PostgreSQL',
];

export const NewProjectPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedStack, setSelectedStack] = useState('React + FastAPI + PostgreSQL');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProjectCreateFormValues>({
    resolver: zodResolver(projectCreateSchema),
    defaultValues: {
      name: '',
      business_idea: '',
      target_users: '',
      main_problem: '',
      expected_features: '',
      preferred_tech_stack: 'React + FastAPI + PostgreSQL',
      constraints: '',
    },
  });

  const createMutation = useMutation({
    mutationFn: async (values: ProjectCreateFormValues) => {
      const project = await projectApi.create({
        ...values,
        preferred_tech_stack: selectedStack,
      });
      // Trigger requirement generation automatically
      await workflowApi.generateRequirements(project.id);
      return project;
    },
    onSuccess: (project) => {
      navigate(`/projects/${project.id}`);
    },
    onError: (err: any) => {
      setErrorMessage(err.message || 'Failed to initialize project');
    },
  });

  const onSubmit = (values: ProjectCreateFormValues) => {
    setErrorMessage(null);
    createMutation.mutate(values);
  };

  const handleSelectStack = (stack: string) => {
    setSelectedStack(stack);
    setValue('preferred_tech_stack', stack);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="space-y-2 border-b border-[#0D2818]/10 pb-6">
        <Link
          to="/dashboard"
          className="text-xs font-mono text-[#0D2818]/60 hover:text-[#0D2818] inline-flex items-center gap-1.5 transition-colors mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
        </Link>
        <div className="flex items-center gap-2">
          <Badge variant="lime" size="sm">
            STAGE 0
          </Badge>
          <span className="text-xs font-mono text-[#0D2818]/60">Initialization Wizard</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#0D2818]">
          Initialize New Software Project
        </h1>
        <p className="text-sm text-[#0D2818]/70 font-sans">
          Provide your business concept, core problem, target audience, and architectural preferences.
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-mono">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <Card className="p-6 sm:p-8 space-y-6">
          {/* 1. Project Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#0D2818]">
              Project Name *
            </label>
            <input
              type="text"
              {...register('name')}
              placeholder="e.g. FinTrack Pro, HealthPulse AI, OmniLogistics"
              className="w-full bg-[#FAF7F2] text-sm text-[#0D2818] px-4 py-3 rounded-2xl border border-[#0D2818]/15 focus:outline-none focus:ring-2 focus:ring-[#84CC16]"
            />
            {errors.name && (
              <p className="text-xs text-rose-600 font-mono mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* 2. Business Idea */}
          <div className="space-y-1.5">
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#0D2818]">
              Business Idea & Product Goal *
            </label>
            <textarea
              rows={4}
              {...register('business_idea')}
              placeholder="Describe the overarching business model, user workflow, and value proposition..."
              className="w-full bg-[#FAF7F2] text-sm text-[#0D2818] p-4 rounded-2xl border border-[#0D2818]/15 focus:outline-none focus:ring-2 focus:ring-[#84CC16]"
            />
            {errors.business_idea && (
              <p className="text-xs text-rose-600 font-mono mt-1">{errors.business_idea.message}</p>
            )}
          </div>

          {/* 3. Target Users & Main Problem */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#0D2818]">
                Target Users / Personas
              </label>
              <input
                type="text"
                {...register('target_users')}
                placeholder="e.g. Small business owners, Operations Managers"
                className="w-full bg-[#FAF7F2] text-sm text-[#0D2818] px-4 py-3 rounded-2xl border border-[#0D2818]/15 focus:outline-none focus:ring-2 focus:ring-[#84CC16]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#0D2818]">
                Core Problem Being Solved
              </label>
              <input
                type="text"
                {...register('main_problem')}
                placeholder="e.g. Manual spreadsheet reconciliations cause 40hr/wk delays"
                className="w-full bg-[#FAF7F2] text-sm text-[#0D2818] px-4 py-3 rounded-2xl border border-[#0D2818]/15 focus:outline-none focus:ring-2 focus:ring-[#84CC16]"
              />
            </div>
          </div>

          {/* 4. Expected Features */}
          <div className="space-y-1.5">
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#0D2818]">
              Expected Key Features (comma separated or bullet points)
            </label>
            <textarea
              rows={3}
              {...register('expected_features')}
              placeholder="e.g. CSV transaction import, Real-time cash forecasting, Role-based user permissions, Automated PDF reports"
              className="w-full bg-[#FAF7F2] text-sm text-[#0D2818] p-4 rounded-2xl border border-[#0D2818]/15 focus:outline-none focus:ring-2 focus:ring-[#84CC16]"
            />
          </div>

          {/* 5. Preferred Tech Stack */}
          <div className="space-y-2">
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#0D2818]">
              Preferred Technology Stack
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
              {TECH_STACK_OPTIONS.map((stack) => (
                <button
                  type="button"
                  key={stack}
                  onClick={() => handleSelectStack(stack)}
                  className={`p-3 rounded-2xl border text-xs font-mono text-left transition-all ${
                    selectedStack === stack
                      ? 'bg-[#0D2818] text-white border-[#0D2818] shadow-md ring-2 ring-[#84CC16]/50'
                      : 'bg-[#FAF7F2] text-[#0D2818] border-[#0D2818]/15 hover:bg-[#EBE3D5]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <Cpu className={`w-3.5 h-3.5 ${selectedStack === stack ? 'text-[#84CC16]' : 'text-[#0D2818]/60'}`} />
                    {selectedStack === stack && <CheckCircle2 className="w-3.5 h-3.5 text-[#84CC16]" />}
                  </div>
                  <span className="font-semibold block">{stack}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 6. Constraints */}
          <div className="space-y-1.5">
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#0D2818]">
              Technical or Operational Constraints (Optional)
            </label>
            <input
              type="text"
              {...register('constraints')}
              placeholder="e.g. Strict data isolation, Sub-200ms API response time, Zero external tracking"
              className="w-full bg-[#FAF7F2] text-sm text-[#0D2818] px-4 py-3 rounded-2xl border border-[#0D2818]/15 focus:outline-none focus:ring-2 focus:ring-[#84CC16]"
            />
          </div>
        </Card>

        {/* Form Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-2">
          <Link to="/dashboard">
            <Button variant="outline" size="lg" type="button">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            size="lg"
            variant="accent"
            isLoading={createMutation.isPending}
            icon={<Sparkles className="w-4 h-4" />}
          >
            {createMutation.isPending ? 'Analyzing Requirements...' : 'Analyze Requirements & Start'}
          </Button>
        </div>
      </form>
    </div>
  );
};
