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
        colors: ['#84CC16', '#0D2818', '#A3E635', '#22C55E'],
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
      <div className="text-center py-20">
        <div className="w-10 h-10 border-4 border-[#0D2818] border-t-[#84CC16] rounded-full animate-spin mx-auto mb-4" />
        <p className="font-mono text-sm text-[#0D2818]/70">Formulating Documentation & Deployment Guides...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#0D2818]/10 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="lime" size="sm">
              DOCUMENTATION HUB
            </Badge>
            <span className="text-xs font-mono text-[#0D2818]/60">
              {docs.length} Comprehensive Markdown Guides
            </span>
          </div>
          <h2 className="font-serif font-bold text-2xl text-[#0D2818] mt-1">
            System Documentation & Production Package
          </h2>
          <p className="text-xs text-[#0D2818]/70 font-sans mt-0.5">
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
              key={doc.id}
              onClick={() => setActiveDocId(doc.id)}
              className={`w-full text-left p-3.5 rounded-2xl border text-xs font-mono transition-all flex items-center justify-between ${
                currentDoc?.id === doc.id
                  ? 'bg-[#0D2818] text-white border-[#0D2818] font-bold shadow-md'
                  : 'bg-white text-[#0D2818]/80 border-[#0D2818]/10 hover:bg-[#FAF7F2]'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <FileText className="w-3.5 h-3.5 shrink-0 text-[#84CC16]" />
                <span className="truncate">{doc.title}</span>
              </div>
              <span className="text-[10px] uppercase font-semibold text-[#84CC16]">
                {doc.doc_type}
              </span>
            </button>
          ))}
        </div>

        {/* Right: Markdown Reader Card */}
        <div className="md:col-span-3">
          {currentDoc && (
            <Card className="p-8 space-y-6 bg-white min-h-[500px]">
              <div className="flex items-center justify-between pb-4 border-b border-[#0D2818]/10">
                <h3 className="font-serif font-bold text-2xl text-[#0D2818]">
                  {currentDoc.title}
                </h3>
                <Button
                  size="sm"
                  variant="outline"
                  icon={copied ? <Check className="w-3.5 h-3.5 text-[#84CC16]" /> : <Copy className="w-3.5 h-3.5" />}
                  onClick={handleCopy}
                >
                  {copied ? 'Copied!' : 'Copy Document'}
                </Button>
              </div>

              <div className="text-xs sm:text-sm font-sans text-[#0D2818]/90 whitespace-pre-wrap leading-relaxed">
                {currentDoc.markdown_content}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
