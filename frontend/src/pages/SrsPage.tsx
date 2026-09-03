import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workflowApi } from '../services/workflowApi';
import type { SRSDocument } from '../types/workflow';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import {
  BookOpen,
  ArrowRight,
  Copy,
  Check,
  Save,
  Eye,
  Edit3,
} from 'lucide-react';

export const SrsPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isEditing, setIsEditing] = useState(false);
  const [editedMarkdown, setEditedMarkdown] = useState<string>('');
  const [copied, setCopied] = useState(false);

  // Fetch SRS
  const { data: srs, isLoading } = useQuery({
    queryKey: ['srs', projectId],
    queryFn: () => workflowApi.getSRS(projectId!),
    enabled: !!projectId,
  });

  // Generate / Regenerate Mutation
  const generateMutation = useMutation({
    mutationFn: () => workflowApi.generateSRS(projectId!),
    onSuccess: (data: SRSDocument) => {
      queryClient.invalidateQueries({ queryKey: ['srs', projectId] });
      setEditedMarkdown(data.full_markdown);
    },
  });

  // Update Mutation
  const updateMutation = useMutation({
    mutationFn: (markdown: string) =>
      workflowApi.updateSRS(projectId!, { full_markdown: markdown }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['srs', projectId] });
      setIsEditing(false);
    },
  });

  const handleCopy = () => {
    if (!srs) return;
    navigator.clipboard.writeText(isEditing ? editedMarkdown : srs.full_markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    updateMutation.mutate(editedMarkdown);
  };

  const handleProceedToArchitecture = async () => {
    await workflowApi.generateArchitecture(projectId!);
    navigate(`/projects/${projectId}/architecture`);
  };

  if (isLoading) {
    return (
      <div className="text-center py-20 font-sans">
        <div className="w-10 h-10 border-4 border-zinc-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
        <p className="font-sans text-sm text-zinc-500">Formulating IEEE 830 Specification Document...</p>
      </div>
    );
  }

  if (!srs) {
    return (
      <Card className="text-center py-16 px-6 max-w-lg mx-auto space-y-4 bg-white/90">
        <BookOpen className="w-10 h-10 text-indigo-600 mx-auto" />
        <h3 className="font-serif text-2xl text-zinc-900">No SRS Generated</h3>
        <p className="text-xs text-zinc-500 font-sans">
          Synthesize an IEEE 830 / ISO 29148 compliant specification from your approved requirements.
        </p>
        <Button
          variant="accent"
          isLoading={generateMutation.isPending}
          onClick={() => generateMutation.mutate()}
          icon={<BookOpen className="w-4 h-4" />}
        >
          Generate SRS Specification
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/90 backdrop-blur-md p-6 rounded-2xl border border-zinc-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="lime" size="sm">
              IEEE-830 COMPLIANT
            </Badge>
            <span className="text-xs font-sans text-zinc-400">Version {srs.version}</span>
          </div>
          <h2 className="font-serif text-2xl text-zinc-900 mt-1">
            Software Requirements Specification (SRS)
          </h2>
          <p className="text-xs text-zinc-500 font-sans mt-0.5">
            Formal architectural document covering functional, non-functional, data, and security guarantees.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            icon={copied ? <Check className="w-3.5 h-3.5 text-indigo-600" /> : <Copy className="w-3.5 h-3.5" />}
            onClick={handleCopy}
          >
            {copied ? 'Copied!' : 'Copy Markdown'}
          </Button>

          <Button
            variant="secondary"
            size="sm"
            icon={isEditing ? <Eye className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
            onClick={() => {
              if (!isEditing) setEditedMarkdown(srs.full_markdown);
              setIsEditing(!isEditing);
            }}
          >
            {isEditing ? 'Preview Mode' : 'Edit Markdown'}
          </Button>

          {isEditing && (
            <Button
              variant="primary"
              size="sm"
              icon={<Save className="w-3.5 h-3.5" />}
              isLoading={updateMutation.isPending}
              onClick={handleSave}
            >
              Save Changes
            </Button>
          )}

          <Button
            variant="accent"
            size="md"
            icon={<ArrowRight className="w-4 h-4" />}
            onClick={handleProceedToArchitecture}
          >
            Approve & Generate Architecture
          </Button>
        </div>
      </div>

      {/* Editor or Formatted Markdown Display */}
      {isEditing ? (
        <Card className="p-4 bg-white/90">
          <textarea
            rows={24}
            value={editedMarkdown}
            onChange={(e) => setEditedMarkdown(e.target.value)}
            className="w-full bg-zinc-50 font-mono text-xs text-zinc-800 p-4 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
          />
        </Card>
      ) : (
        <Card className="p-8 sm:p-12 space-y-8 bg-white/90">
          <div className="border-b border-zinc-200/80 pb-6">
            <h1 className="font-serif text-3xl sm:text-4xl text-zinc-900 mb-2">
              {srs.title}
            </h1>
            <div className="flex items-center gap-4 text-xs font-sans text-zinc-400">
              <span>Standard: IEEE 830 / ISO 29148</span>
              <span>•</span>
              <span>Updated: {new Date(srs.updated_at).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="space-y-6 text-sm text-zinc-700 leading-relaxed whitespace-pre-wrap font-sans">
            {srs.full_markdown}
          </div>
        </Card>
      )}
    </div>
  );
};
