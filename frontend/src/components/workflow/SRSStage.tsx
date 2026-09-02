import React, { useState, useEffect } from 'react';
import { workflowApi } from '../../services/workflowApi';
import type { SRSDocument } from '../../types/workflow';
import type { Project } from '../../types/project';
import {
  CheckCircle2,
  Copy,
  Download,
  Save,
  ArrowRight,
  Loader2,
  RefreshCw,
  Check,
} from 'lucide-react';

interface SRSStageProps {
  project: Project;
  onAdvance: () => void;
  onRefreshProject?: () => void;
}

export const SRSStage: React.FC<SRSStageProps> = ({
  project,
  onAdvance,
  onRefreshProject,
}) => {
  const [srs, setSrs] = useState<SRSDocument | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [viewMode, setViewMode] = useState<'preview' | 'edit'>('preview');
  const [copied, setCopied] = useState(false);
  const [markdownContent, setMarkdownContent] = useState('');

  const loadSRS = async () => {
    try {
      setIsLoading(true);
      const res = await workflowApi.getSRS(project.id);
      setSrs(res);
      setMarkdownContent(res.full_markdown);
    } catch {
      await handleGenerate();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSRS();
  }, [project.id]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const res = await workflowApi.generateSRS(project.id);
      setSrs(res);
      setMarkdownContent(res.full_markdown);
      if (onRefreshProject) onRefreshProject();
    } catch (err) {
      console.error('Failed to generate SRS:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async (advance = false) => {
    if (!srs) return;
    setIsSaving(true);
    try {
      const res = await workflowApi.updateSRS(project.id, {
        ...srs,
        full_markdown: markdownContent,
      });
      setSrs(res);
      if (advance) {
        onAdvance();
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopy = () => {
    if (!markdownContent) return;
    navigator.clipboard.writeText(markdownContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!markdownContent) return;
    const blob = new Blob([markdownContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name.replace(/[^a-z0-9]/gi, '_')}_SRS_v${srs?.version || '1.0'}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading && !srs) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-forest-900" />
        <p className="text-sm font-semibold text-forest-800">
          Compiling IEEE 830 compliant SRS specification...
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
              Stage 02
            </span>
            <h2 className="font-serif text-2xl font-bold text-forest-950">
              Software Requirements Specification (SRS)
            </h2>
          </div>
          <p className="mt-1 text-xs text-forest-700/70">
            IEEE 830 / ISO 29148 standard software specification ready for engineering handoff and architectural modeling.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleGenerate()}
            disabled={isGenerating}
            className="inline-flex items-center space-x-1.5 rounded-xl bg-ivory-200 px-3.5 py-2 text-xs font-bold text-forest-900 hover:bg-ivory-300 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? 'Regenerating...' : 'Regenerate'}</span>
          </button>

          <button
            onClick={handleCopy}
            className="inline-flex items-center space-x-1.5 rounded-xl bg-ivory-200 px-3.5 py-2 text-xs font-bold text-forest-900 hover:bg-ivory-300 transition-colors"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? 'Copied' : 'Copy MD'}</span>
          </button>

          <button
            onClick={handleDownload}
            className="inline-flex items-center space-x-1.5 rounded-xl bg-ivory-200 px-3.5 py-2 text-xs font-bold text-forest-900 hover:bg-ivory-300 transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export</span>
          </button>

          <button
            onClick={() => handleSave(true)}
            disabled={isSaving}
            className="inline-flex items-center space-x-2 rounded-xl bg-forest-900 px-5 py-2 text-xs font-bold text-lime-400 shadow-md hover:bg-forest-950 transition-all"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>Approve & Proceed to Architecture</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Main Document Container */}
      <div className="rounded-3xl bg-ivory-50 border border-forest-900/10 shadow-sm overflow-hidden flex flex-col">
        {/* Editor / Preview Mode Switcher */}
        <div className="flex items-center justify-between border-b border-forest-900/10 bg-ivory-200/40 px-6 py-3">
          <div className="flex items-center space-x-3">
            <span className="font-serif font-bold text-xs text-forest-950">
              {srs?.title || `${project.name} - Software Requirements Document`}
            </span>
            <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-forest-900/10 text-forest-800 font-bold">
              v{srs?.version || '1.0.0'}
            </span>
          </div>

          <div className="inline-flex rounded-xl bg-ivory-50 p-1 border border-forest-900/10">
            <button
              onClick={() => setViewMode('preview')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                viewMode === 'preview'
                  ? 'bg-forest-900 text-ivory-100 shadow-sm'
                  : 'text-forest-700 hover:text-forest-950'
              }`}
            >
              Document Preview
            </button>
            <button
              onClick={() => setViewMode('edit')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                viewMode === 'edit'
                  ? 'bg-forest-900 text-ivory-100 shadow-sm'
                  : 'text-forest-700 hover:text-forest-950'
              }`}
            >
              Edit Markdown
            </button>
          </div>
        </div>

        {/* View / Edit area */}
        {viewMode === 'preview' ? (
          <div className="p-8 sm:p-12 overflow-y-auto max-h-[650px] bg-ivory-50/80 prose prose-forest max-w-none">
            <pre className="font-mono text-xs text-forest-950 bg-ivory-100/80 p-6 rounded-2xl border border-forest-900/10 overflow-x-auto whitespace-pre-wrap leading-relaxed shadow-inner">
              {markdownContent}
            </pre>
          </div>
        ) : (
          <div className="p-6">
            <textarea
              rows={22}
              value={markdownContent}
              onChange={(e) => setMarkdownContent(e.target.value)}
              className="w-full font-mono text-xs text-forest-950 bg-ivory-100/90 p-4 rounded-2xl border border-forest-900/15 focus:border-forest-900 focus:outline-none focus:ring-2 focus:ring-lime-500/20 leading-relaxed resize-y"
              placeholder="Enter SRS Markdown content..."
            />
            <div className="mt-3 flex justify-end">
              <button
                onClick={() => handleSave(false)}
                disabled={isSaving}
                className="inline-flex items-center space-x-1.5 rounded-xl bg-forest-900 px-4 py-2 text-xs font-bold text-lime-400 hover:bg-forest-950 transition-all shadow-sm"
              >
                <Save className="h-3.5 w-3.5" />
                <span>Save Edits</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
