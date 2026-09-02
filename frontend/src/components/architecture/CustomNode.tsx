import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Layers, Database, Globe, Server, Shield, Sparkles, Container } from 'lucide-react';

const categoryIcons: Record<string, any> = {
  Frontend: Globe,
  Backend: Server,
  Database: Database,
  'AI Service': Sparkles,
  Auth: Shield,
  Deployment: Container,
};

const categoryColors: Record<string, string> = {
  Frontend: 'border-emerald-500/40 bg-emerald-50/70',
  Backend: 'border-lime-500/40 bg-lime-50/70',
  Database: 'border-pink-500/40 bg-pink-50/70',
  'AI Service': 'border-sky-500/40 bg-sky-50/70',
  Deployment: 'border-amber-500/40 bg-amber-50/70',
};

export const CustomNode = memo(({ data }: { data: any }) => {
  const category = data.category || 'Backend';
  const Icon = categoryIcons[category] || Layers;
  const colorClass = categoryColors[category] || 'border-[#0D2818]/20 bg-white';

  return (
    <div
      className={`px-5 py-4 rounded-2xl border-2 shadow-lg backdrop-blur-md min-w-[200px] max-w-[260px] transition-all hover:scale-105 ${colorClass}`}
    >
      <Handle type="target" position={Position.Top} className="!bg-[#0D2818]" />
      <Handle type="target" position={Position.Left} className="!bg-[#0D2818]" />

      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 rounded-lg bg-[#0D2818] text-white">
          <Icon className="w-3.5 h-3.5 text-[#84CC16]" />
        </div>
        <span className="text-[10px] font-mono uppercase tracking-widest text-[#0D2818]/70 font-bold">
          {category}
        </span>
      </div>

      <h4 className="font-serif font-bold text-sm text-[#0D2818] leading-tight mb-1">
        {data.label}
      </h4>

      {data.tech && (
        <span className="inline-block text-[11px] font-mono text-[#0D2818]/80 bg-white/80 px-2 py-0.5 rounded-full border border-[#0D2818]/10 mb-1">
          {data.tech}
        </span>
      )}

      {data.description && (
        <p className="text-[11px] text-[#0D2818]/60 line-clamp-2 leading-relaxed mt-1">
          {data.description}
        </p>
      )}

      <Handle type="source" position={Position.Bottom} className="!bg-[#84CC16]" />
      <Handle type="source" position={Position.Right} className="!bg-[#84CC16]" />
    </div>
  );
});
