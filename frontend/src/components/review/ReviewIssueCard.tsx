import React from 'react';
import type { ReviewIssue } from '../../types/workflow';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { CheckCircle2, Wrench } from 'lucide-react';

interface ReviewIssueCardProps {
  issue: ReviewIssue;
  onApplyFix: (issueId: string) => Promise<void>;
  isApplying: boolean;
}

export const ReviewIssueCard: React.FC<ReviewIssueCardProps> = ({
  issue,
  onApplyFix,
  isApplying,
}) => {
  const severityVariant = {
    Critical: 'danger',
    High: 'high',
    Medium: 'medium',
    Low: 'low',
  }[issue.severity] as any;

  return (
    <Card className="p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Badge variant={severityVariant} size="sm">
            {issue.severity.toUpperCase()}
          </Badge>
          <span className="text-xs font-mono text-[#0D2818]/70 bg-[#FAF7F2] px-2.5 py-0.5 rounded-full border border-[#0D2818]/10">
            {issue.category}
          </span>
          <span className="font-mono text-xs text-[#0D2818]/60 truncate">
            {issue.file_path}:{issue.line_number || 1}
          </span>
        </div>

        {issue.is_applied ? (
          <span className="inline-flex items-center gap-1 text-xs font-mono font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> Fix Applied
          </span>
        ) : (
          <Button
            size="sm"
            variant="outline"
            icon={<Wrench className="w-3.5 h-3.5" />}
            isLoading={isApplying}
            onClick={() => onApplyFix(issue.id)}
          >
            Apply Fix
          </Button>
        )}
      </div>

      <div>
        <h4 className="font-serif font-bold text-base text-[#0D2818]">{issue.title}</h4>
        <p className="text-xs text-[#0D2818]/80 mt-1 leading-relaxed font-sans">
          {issue.description}
        </p>
      </div>

      <div className="bg-[#FAF7F2] p-3 rounded-xl border border-[#0D2818]/10 text-xs font-sans">
        <span className="font-bold text-[#0D2818] block mb-0.5">Recommended Remediation:</span>
        <p className="text-[#0D2818]/80">{issue.recommendation}</p>
      </div>

      {issue.suggested_code_replacement && (
        <div className="bg-[#0D2818] text-emerald-300 p-3 rounded-xl font-mono text-xs overflow-x-auto">
          <div className="text-[10px] text-[#84CC16] font-bold uppercase tracking-wider mb-1">
            Suggested Code Patch
          </div>
          <code>{issue.suggested_code_replacement}</code>
        </div>
      )}
    </Card>
  );
};
