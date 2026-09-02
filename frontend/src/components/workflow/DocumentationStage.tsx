import React, { useState, useEffect } from 'react';
import { workflowApi } from '../../services/workflowApi';
import type { DocumentationItem } from '../../types/workflow';
import type { Project } from '../../types/project';
import {
  BookOpen,
  Copy,
  Download,
  Save,
  ArrowRight,
  Loader2,
  RefreshCw,
  FileText,
  Check,
  DownloadCloud,
} from 'lucide-react';

interface DocumentationStageProps {
  project: Project;
  onAdvance: () => void;
  onRefreshProject?: () => void;
}

export const DocumentationStage: React.FC<DocumentationStageProps> = ({
  project,
  onAdvance,
  onRefreshProject,
}) => {
  const [docs, setDocs] = useState<DocumentationItem[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<DocumentationItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [markdownContent, setMarkdownContent] = useState('');

  const loadDocs = async () => {
    try {
      setIsLoading(true);
      const res = await workflowApi.getDocumentation(project.id);
      if (res.length === 0) {
        await handleGenerate();
      } else {
        setDocs(res);
        setSelectedDoc(res[0]);
        setMarkdownContent(res[0].markdown_content);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDocs();
  }, [project.id]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const res = await workflowApi.generateDocumentation(project.id);
      setDocs(res);
      if (res.length > 0) {
        setSelectedDoc(res[0]);
        setMarkdownContent(res[0].markdown_content);
      }
      if (onRefreshProject) onRefreshProject();
    } catch (err) {
      console.error('Failed to generate documentation:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectDoc = (doc: DocumentationItem) => {
    setSelectedDoc(doc);
    setMarkdownContent(doc.markdown_content);
  };

  const handleSaveDoc = async () => {
    if (!selectedDoc) return;
    setIsSaving(true);
    try {
      const updated = await workflowApi.updateDocumentation(
        project.id,
        selectedDoc.id,
        markdownContent
      );
      setSelectedDoc(updated);
      setDocs((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
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
    if (!selectedDoc || !markdownContent) return;
    const blob = new Blob([markdownContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedDoc.title.replace(/[^a-z0-9]/gi, '_')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading && docs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-forest-900" />
        <p className="text-sm font-semibold text-forest-800">
          Compiling comprehensive project documentation manuals...
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
              Stage 08
            </span>
            <h2 className="font-serif text-2xl font-bold text-forest-950">
              Technical Documentation & Architecture Books
            </h2>
          </div>
          <p className="mt-1 text-xs text-forest-700/70">
            Automatically maintained engineering guides, API references, deployment walkthroughs, and user manuals.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="inline-flex items-center space-x-1.5 rounded-xl bg-ivory-200 px-3.5 py-2 text-xs font-bold text-forest-900 hover:bg-ivory-300 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? 'Regenerating...' : 'Regenerate Docs'}</span>
          </button>

          <button
            onClick={handleCopy}
            className="inline-flex items-center space-x-1.5 rounded-xl bg-ivory-200 px-3.5 py-2 text-xs font-bold text-forest-900 hover:bg-ivory-300 transition-colors"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            onClick={handleDownload}
            className="inline-flex items-center space-x-1.5 rounded-xl bg-ivory-200 px-3.5 py-2 text-xs font-bold text-forest-900 hover:bg-ivory-300 transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export MD</span>
          </button>

          <button
            onClick={onAdvance}
            className="inline-flex items-center space-x-2 rounded-xl bg-forest-900 px-5 py-2 text-xs font-bold text-lime-400 shadow-md hover:bg-forest-950 transition-all"
          >
            <DownloadCloud className="h-4 w-4" />
            <span>Proceed to ZIP Download</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Main Documentation Container */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Document Book Navigation */}
        <div className="rounded-3xl bg-ivory-50 p-4 border border-forest-900/10 shadow-sm space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-forest-700/60 block px-2 mb-2">
            Documentation Modules
          </span>
          {docs.map((doc) => {
            const isSelected = selectedDoc?.id === doc.id;
            return (
              <button
                key={doc.id}
                onClick={() => handleSelectDoc(doc)}
                className={`w-full p-3 rounded-2xl text-left transition-all flex items-center space-x-3 ${
                  isSelected
                    ? 'bg-forest-900 text-ivory-100 shadow-md ring-1 ring-forest-900'
                    : 'hover:bg-forest-900/5 text-forest-900'
                }`}
              >
                <FileText
                  className={`h-4 w-4 shrink-0 ${
                    isSelected ? 'text-lime-400' : 'text-forest-700'
                  }`}
                />
                <div className="min-w-0">
                  <div className="font-bold text-xs truncate">{doc.title}</div>
                  <div
                    className={`text-[10px] uppercase font-mono mt-0.5 ${
                      isSelected ? 'text-ivory-300/80' : 'text-forest-700/60'
                    }`}
                  >
                    {doc.doc_type}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Document Content */}
        <div className="lg:col-span-3 rounded-3xl bg-ivory-50 border border-forest-900/10 shadow-sm overflow-hidden flex flex-col">
          <div className="flex items-center justify-between border-b border-forest-900/10 bg-ivory-200/40 px-6 py-3.5">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-4 w-4 text-forest-800" />
              <span className="font-serif font-bold text-sm text-forest-950">
                {selectedDoc?.title || 'Project Documentation'}
              </span>
            </div>

            <button
              onClick={handleSaveDoc}
              disabled={isSaving}
              className="inline-flex items-center space-x-1.5 rounded-xl bg-forest-900 px-3.5 py-1.5 text-xs font-bold text-lime-400 hover:bg-forest-950 transition-all shadow-sm"
            >
              <Save className="h-3.5 w-3.5" />
              <span>{isSaving ? 'Saving...' : 'Save Manual'}</span>
            </button>
          </div>

          <div className="p-6">
            <textarea
              rows={20}
              value={markdownContent}
              onChange={(e) => setMarkdownContent(e.target.value)}
              className="w-full font-mono text-xs text-forest-950 bg-ivory-100/90 p-5 rounded-2xl border border-forest-900/15 focus:border-forest-900 focus:outline-none focus:ring-2 focus:ring-lime-500/20 leading-relaxed resize-y shadow-inner"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
