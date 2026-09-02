import React, { useState } from 'react';
import type { ApiSpecification } from '../../types/workflow';
import { Card } from '../common/Card';
import { Lock, Unlock, ChevronDown, ChevronUp, Code } from 'lucide-react';

interface ApiEndpointTableProps {
  endpoints: ApiSpecification[];
}

const methodColors: Record<string, string> = {
  GET: 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold',
  POST: 'bg-sky-100 text-sky-800 border-sky-300 font-bold',
  PUT: 'bg-amber-100 text-amber-800 border-amber-300 font-bold',
  DELETE: 'bg-rose-100 text-rose-800 border-rose-300 font-bold',
  PATCH: 'bg-purple-100 text-purple-800 border-purple-300 font-bold',
};

export const ApiEndpointTable: React.FC<ApiEndpointTableProps> = ({ endpoints }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="space-y-3">
      {endpoints.map((ep) => {
        const isExpanded = expandedId === ep.id;
        const badgeClass = methodColors[ep.method] || 'bg-gray-100 text-gray-800';

        return (
          <Card key={ep.id} className="p-4 transition-all">
            <div
              onClick={() => toggleExpand(ep.id)}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer select-none"
            >
              <div className="flex items-center gap-3">
                <span className={`px-2.5 py-1 text-xs font-mono rounded-lg border ${badgeClass}`}>
                  {ep.method}
                </span>
                <span className="font-mono text-sm font-semibold text-[#0D2818]">{ep.path}</span>
                <span className="text-xs text-[#0D2818]/60 hidden md:inline">— {ep.summary}</span>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-auto">
                <span className="text-xs font-mono text-[#0D2818]/70 bg-[#FAF7F2] px-2.5 py-1 rounded-full border border-[#0D2818]/10">
                  {ep.tag}
                </span>
                {ep.auth_required ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-mono text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    <Lock className="w-3 h-3" /> Auth
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <Unlock className="w-3 h-3" /> Public
                  </span>
                )}
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-[#0D2818]/60" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-[#0D2818]/60" />
                )}
              </div>
            </div>

            {/* Expandable Schema Inspector */}
            {isExpanded && (
              <div className="mt-4 pt-4 border-t border-[#0D2818]/10 space-y-4 animate-fade-in text-xs font-mono">
                {ep.description && (
                  <p className="font-sans text-xs text-[#0D2818]/80 leading-relaxed">
                    {ep.description}
                  </p>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Request Schema */}
                  <div className="bg-[#0D2818] text-white p-3 rounded-xl">
                    <div className="text-[10px] text-[#84CC16] uppercase tracking-wider mb-2 font-bold flex items-center gap-1.5">
                      <Code className="w-3 h-3" /> Request Payload Schema
                    </div>
                    <pre className="overflow-x-auto text-[11px] text-emerald-300">
                      {JSON.stringify(ep.request_body_schema || {}, null, 2)}
                    </pre>
                  </div>

                  {/* Response Success Schema */}
                  <div className="bg-[#0D2818] text-white p-3 rounded-xl">
                    <div className="text-[10px] text-[#84CC16] uppercase tracking-wider mb-2 font-bold flex items-center gap-1.5">
                      <Code className="w-3 h-3" /> 200 OK Response Schema
                    </div>
                    <pre className="overflow-x-auto text-[11px] text-emerald-300">
                      {JSON.stringify(ep.response_success_schema || {}, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
};
