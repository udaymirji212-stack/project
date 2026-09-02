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
      <div className="text-center py-20">
        <div className="w-10 h-10 border-4 border-[#0D2818] border-t-[#84CC16] rounded-full animate-spin mx-auto mb-4" />
        <p className="font-mono text-sm text-[#0D2818]/70">Formulating IEEE 830 Specification Document...</p>
      </div>
    );
  }

  if (!srs) {
    return (
      <Card className="text-center py-16 px-6 max-w-lg mx-auto space-y-4">
        <BookOpen className="w-10 h-10 text-[#84CC16] mx-auto" />
        <h3 className="font-serif font-bold text-2xl text-[#0D2818]">No SRS Generated</h3>
        <p className="text-xs text-[#0D2818]/70 font-sans">
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
    <div className="space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#0D2818]/10 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="lime" size="sm">
              IEEE-830 COMPLIANT
            </Badge>
            <span className="text-xs font-mono text-[#0D2818]/60">Version {srs.version}</span>
          </div>
          <h2 className="font-serif font-bold text-2xl text-[#0D2818] mt-1">
            Software Requirements Specification (SRS)
          </h2>
          <p className="text-xs text-[#0D2818]/70 font-sans mt-0.5">
            Formal architectural document covering functional, non-functional, data, and security guarantees.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            icon={copied ? <Check className="w-3.5 h-3.5 text-[#84CC16]" /> : <Copy className="w-3.5 h-3.5" />}
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
        <Card className="p-4">
          <textarea
            rows={24}
            value={editedMarkdown}
            onChange={(e) => setEditedMarkdown(e.target.value)}
            className="w-full bg-[#FAF7F2] font-mono text-xs text-[#0D2818] p-4 rounded-2xl border border-[#0D2818]/15 focus:outline-none focus:ring-2 focus:ring-[#84CC16] leading-relaxed"
          />
        </Card>
      ) : (
        <Card className="p-8 sm:p-12 space-y-8 prose prose-emerald max-w-none bg-white">
          <div className="border-b border-[#0D2818]/15 pb-6">
            <h1 className="font-serif font-bold text-3xl sm:text-4xl text-[#0D2818] mb-2">
              {srs.title}
            </h1>
            <div className="flex items-center gap-4 text-xs font-mono text-[#0D2818]/60">
              <span>Standard: IEEE 830 / ISO 29148</span>
              <span>•</span>
              <span>Updated: {new Date(srs.updated_at).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="space-y-6 text-sm font-sans text-[#0D2818]/90 leading-relaxed whitespace-pre-wrap font-sans">
            {srs.full_markdown}
          </div>
        </Card>
      )}
    </div>
  );
};
