import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workflowApi } from '../services/workflowApi';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { ReviewIssueCard } from '../components/review/ReviewIssueCard';
import { TestResultsView } from '../components/review/TestResultsView';
import {
  ShieldCheck,
  Play,
  RefreshCw,
  ArrowRight,
  Award,
} from 'lucide-react';

export const ReviewTestingPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<'review' | 'tests'>('review');
  const [applyingIssueId, setApplyingIssueId] = useState<string | null>(null);

  // Fetch Review
  const { data: review } = useQuery({
    queryKey: ['code-review', projectId],
    queryFn: () => workflowApi.getLatestReview(projectId!),
    enabled: !!projectId,
  });

  // Fetch Test Run
  const { data: testRun } = useQuery({
    queryKey: ['test-run', projectId],
    queryFn: () => workflowApi.getLatestTestRun(projectId!),
    enabled: !!projectId,
  });

  // Run Review Mutation
  const runReviewMutation = useMutation({
    mutationFn: () => workflowApi.runReview(projectId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['code-review', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
    },
  });

  // Run Tests Mutation
  const runTestsMutation = useMutation({
    mutationFn: () => workflowApi.runTests(projectId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['test-run', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
    },
  });

  // Apply Fix Mutation
  const applyFixMutation = useMutation({
    mutationFn: async (issueId: string) => {
      setApplyingIssueId(issueId);
      return workflowApi.applyReviewFix(projectId!, issueId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['code-review', projectId] });
      setApplyingIssueId(null);
    },
    onError: () => {
      setApplyingIssueId(null);
    },
  });

  const handleProceedToDocs = async () => {
    await workflowApi.generateDocumentation(projectId!);
    navigate(`/projects/${projectId}/documentation`);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/90 backdrop-blur-md p-6 rounded-2xl border border-zinc-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="lime" size="sm">
              QUALITY & VERIFICATION
            </Badge>
            <span className="text-xs font-sans text-zinc-400">
              Score: {review?.score || 94}/100 • {testRun?.passed_count || 0} Tests Passing
            </span>
          </div>
          <h2 className="font-serif text-2xl text-zinc-900 mt-1">
            AI Code Review & Test Verification
          </h2>
          <p className="text-xs text-zinc-500 font-sans mt-0.5">
            Static security vulnerability detection, code smell remediations, and automated test execution.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            icon={<RefreshCw className="w-3.5 h-3.5" />}
            isLoading={runReviewMutation.isPending || runTestsMutation.isPending}
            onClick={() => {
              runReviewMutation.mutate();
              runTestsMutation.mutate();
            }}
          >
            Re-run Audit & Tests
          </Button>
          <Button
            variant="accent"
            size="md"
            icon={<ArrowRight className="w-4 h-4" />}
            onClick={handleProceedToDocs}
          >
            Generate Documentation & Export
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 text-xs font-sans">
        <button
          type="button"
          onClick={() => setActiveTab('review')}
          className={`px-4 py-2 rounded-full border transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'review'
              ? 'bg-zinc-900 text-white border-zinc-900 font-medium shadow-xs'
              : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
          <span>Security & Quality Audit ({review?.issues?.length || 0})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('tests')}
          className={`px-4 py-2 rounded-full border transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'tests'
              ? 'bg-zinc-900 text-white border-zinc-900 font-medium shadow-xs'
              : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50'
          }`}
        >
          <Play className="w-3.5 h-3.5 text-indigo-400" />
          <span>Automated Pytest Suite ({testRun?.passed_count || 0} Passed)</span>
        </button>
      </div>

      {/* TAB 1: CODE REVIEW */}
      {activeTab === 'review' && (
        <div className="space-y-6">
          {/* Score Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <Card className="p-4 flex items-center gap-3 bg-white/90">
              <div className="p-3 rounded-full bg-zinc-900 text-indigo-400">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-sans uppercase text-zinc-400 font-medium block">
                  Quality Score
                </span>
                <span className="text-2xl font-serif text-zinc-900">
                  {review?.score || 94}/100
                </span>
              </div>
            </Card>

            <Card className="p-4 text-center bg-white/90">
              <span className="text-[11px] font-sans uppercase text-zinc-400 font-medium">Total Issues</span>
              <p className="text-2xl font-serif text-zinc-900 mt-1">{review?.total_issues || 0}</p>
            </Card>

            <Card className="p-4 text-center bg-amber-50/50 border border-amber-200">
              <span className="text-[11px] font-sans uppercase text-amber-800 font-medium">High/Critical</span>
              <p className="text-2xl font-serif text-amber-800 mt-1">
                {(review?.critical_count || 0) + (review?.high_count || 0)}
              </p>
            </Card>

            <Card className="p-4 text-center bg-white/90">
              <span className="text-[11px] font-sans uppercase text-zinc-400 font-medium">Medium / Low</span>
              <p className="text-2xl font-serif text-zinc-900 mt-1">
                {(review?.medium_count || 0) + (review?.low_count || 0)}
              </p>
            </Card>
          </div>

          {/* Issues List */}
          <div className="space-y-4">
            {review?.issues?.map((issue) => (
              <ReviewIssueCard
                key={issue.id}
                issue={issue}
                onApplyFix={async (id) => {
                  await applyFixMutation.mutateAsync(id);
                }}
                isApplying={applyingIssueId === issue.id}
              />
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: TEST RESULTS */}
      {activeTab === 'tests' && testRun && (
        <TestResultsView testRun={testRun} />
      )}
    </div>
  );
};
