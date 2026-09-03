import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workflowApi } from '../services/workflowApi';
import { exportApi } from '../services/exportApi';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import {
  FileText,
  Download,
  Copy,
  Check,
  RefreshCw,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const DocumentationPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const queryClient = useQueryClient();

  const [activeDocId, setActiveDocId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Fetch Documentation
  const { data: docs = [], isLoading } = useQuery({
    queryKey: ['documentation', projectId],
    queryFn: () => workflowApi.getDocumentation(projectId!),
    enabled: !!projectId,
  });

  // Regenerate Documentation Mutation
  const generateMutation = useMutation({
    mutationFn: () => workflowApi.generateDocumentation(projectId!),
    onSuccess: (newDocs) => {
      queryClient.invalidateQueries({ queryKey: ['documentation', projectId] });
      if (newDocs.length > 0) setActiveDocId(newDocs[0].id);
    },
  });

  // Set default active doc
  const currentDoc = docs.find((d) => d.id === activeDocId) || docs[0] || null;

  const handleCopy = () => {
    if (!currentDoc) return;
    navigator.clipboard.writeText(currentDoc.markdown_content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    try {
      setIsExporting(true);
      await exportApi.downloadZip(projectId!, 'codebase');
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#6366F1', '#4F46E5', '#A5B4FC', '#22C55E'],
      });
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
    } catch (err: any) {
      alert(err.message || 'Failed to download ZIP archive');
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-20 font-sans">
        <div className="w-10 h-10 border-4 border-zinc-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
        <p className="font-sans text-sm text-zinc-500">Formulating Documentation & Deployment Guides...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/90 backdrop-blur-md p-6 rounded-2xl border border-zinc-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="lime" size="sm">
              DOCUMENTATION HUB
            </Badge>
            <span className="text-xs font-sans text-zinc-400">
              {docs.length} Comprehensive Markdown Guides
            </span>
          </div>
          <h2 className="font-serif text-2xl text-zinc-900 mt-1">
            System Documentation & Production Package
          </h2>
          <p className="text-xs text-zinc-500 font-sans mt-0.5">
            Architecture specs, API contracts, local installation manuals, and production checklists.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            icon={<RefreshCw className="w-3.5 h-3.5" />}
            isLoading={generateMutation.isPending}
            onClick={() => generateMutation.mutate()}
          >
            Regenerate Docs
          </Button>

          <Button
            variant="accent"
            size="lg"
            icon={<Download className="w-4 h-4" />}
            isLoading={isExporting}
            onClick={handleDownloadZip}
          >
            Download Project .ZIP
          </Button>
        </div>
      </div>

      {/* Main Layout: Nav Tabs on Left, Content on Right */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Left: Documentation Navigation */}
        <div className="md:col-span-1 space-y-2">
          {docs.map((doc) => (
            <button
              type="button"
              key={doc.id}
              onClick={() => setActiveDocId(doc.id)}
              className={`w-full text-left p-3.5 rounded-xl border text-xs font-sans transition-all flex items-center justify-between cursor-pointer ${
                currentDoc?.id === doc.id
                  ? 'bg-zinc-900 text-white border-zinc-900 font-medium shadow-sm'
                  : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <FileText className={`w-3.5 h-3.5 shrink-0 ${currentDoc?.id === doc.id ? 'text-indigo-400' : 'text-zinc-400'}`} />
                <span className="truncate">{doc.title}</span>
              </div>
              <span className={`text-[10px] uppercase font-semibold ${currentDoc?.id === doc.id ? 'text-indigo-400' : 'text-zinc-400'}`}>
                {doc.doc_type}
              </span>
            </button>
          ))}
        </div>

        {/* Right: Markdown Reader Card */}
        <div className="md:col-span-3">
          {currentDoc && (
            <Card className="p-8 space-y-6 bg-white/90 min-h-[500px]">
              <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
                <h3 className="font-serif text-2xl text-zinc-900">
                  {currentDoc.title}
                </h3>
                <Button
                  size="sm"
                  variant="outline"
                  icon={copied ? <Check className="w-3.5 h-3.5 text-indigo-600" /> : <Copy className="w-3.5 h-3.5" />}
                  onClick={handleCopy}
                >
                  {copied ? 'Copied!' : 'Copy Document'}
                </Button>
              </div>

              <div className="text-xs sm:text-sm font-sans text-zinc-700 whitespace-pre-wrap leading-relaxed">
                {currentDoc.markdown_content}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
