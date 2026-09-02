import React from 'react';
import type { EntityItem } from '../../types/workflow';
import { Database, Key, Link as LinkIcon, Hash } from 'lucide-react';
import { Card } from '../common/Card';

interface ErDiagramViewProps {
  entities: EntityItem[];
}

export const ErDiagramView: React.FC<ErDiagramViewProps> = ({ entities }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {entities.map((entity) => (
        <Card key={entity.name} className="p-0 overflow-hidden flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="bg-[#0D2818] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-[#84CC16]" />
                <h4 className="font-serif font-bold text-base">{entity.name}</h4>
              </div>
              <span className="text-[10px] font-mono text-[#84CC16] bg-white/10 px-2 py-0.5 rounded-full">
                {entity.fields.length} Fields
              </span>
            </div>

            {/* Description */}
            <div className="p-3 bg-[#FAF7F2] border-b border-[#0D2818]/10 text-xs text-[#0D2818]/70 italic">
              {entity.description}
            </div>

            {/* Fields List */}
            <div className="divide-y divide-[#0D2818]/10 text-xs">
              {entity.fields.map((field) => (
                <div key={field.name} className="px-4 py-2.5 flex items-center justify-between hover:bg-[#FAF7F2]/50">
                  <div className="flex items-center gap-2">
                    {field.is_primary ? (
                      <span title="Primary Key">
                        <Key className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      </span>
                    ) : (
                      <Hash className="w-3.5 h-3.5 text-[#0D2818]/40 shrink-0" />
                    )}
                    <span className={`font-mono font-medium ${field.is_primary ? 'text-[#0D2818] font-bold' : 'text-[#0D2818]/90'}`}>
                      {field.name}
                    </span>
                    {field.is_unique && !field.is_primary && (
                      <span className="text-[9px] font-mono px-1 py-0.2 bg-purple-100 text-purple-700 rounded">
                        UNIQUE
                      </span>
                    )}
                  </div>
                  <span className="font-mono text-[11px] text-[#0D2818]/60 bg-white px-2 py-0.5 rounded border border-[#0D2818]/10">
                    {field.type}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Relations Footer */}
          {entity.relations && entity.relations.length > 0 && (
            <div className="p-3 bg-[#FAF7F2] border-t border-[#0D2818]/10 text-[11px] font-mono space-y-1">
              <span className="text-[#0D2818]/50 uppercase text-[9px] font-bold tracking-wider block">Relations</span>
              {entity.relations.map((rel, idx) => (
                <div key={idx} className="flex items-center gap-1.5 text-[#0D2818]">
                  <LinkIcon className="w-3 h-3 text-[#84CC16]" />
                  <span>
                    {rel.type} → <strong>{rel.target_entity}</strong> ({rel.foreign_key})
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      ))}
    </div>
  );
};
