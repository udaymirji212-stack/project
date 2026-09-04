import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import {
  Layers,
  Database,
  Globe,
  Server,
  Shield,
  Sparkles,
  Container,
  Cpu,
  Zap,
  HardDrive,
  Radio,
  Network,
  Lock,
} from 'lucide-react';

const categoryIcons: Record<string, any> = {
  Frontend: Globe,
  Gateway: Network,
  Backend: Server,
  Database: Database,
  'AI Service': Sparkles,
  Worker: Cpu,
  Cache: Zap,
  Storage: HardDrive,
  Security: Shield,
  Auth: Lock,
  'Media Service': Radio,
  Deployment: Container,
};

const categoryColors: Record<string, string> = {
  Frontend: 'border-emerald-500/40 bg-emerald-50/80',
  Gateway: 'border-indigo-500/40 bg-indigo-50/80',
  Backend: 'border-lime-500/40 bg-lime-50/80',
  Database: 'border-pink-500/40 bg-pink-50/80',
  'AI Service': 'border-sky-500/40 bg-sky-50/80',
  Worker: 'border-amber-500/40 bg-amber-50/80',
  Cache: 'border-rose-500/40 bg-rose-50/80',
  Storage: 'border-purple-500/40 bg-purple-50/80',
  Security: 'border-teal-500/40 bg-teal-50/80',
  Auth: 'border-teal-500/40 bg-teal-50/80',
  'Media Service': 'border-blue-500/40 bg-blue-50/80',
  Deployment: 'border-slate-500/40 bg-slate-50/80',
};

const categoryAccentColors: Record<string, string> = {
  Frontend: 'text-emerald-700 bg-emerald-100/80 border-emerald-200',
  Gateway: 'text-indigo-700 bg-indigo-100/80 border-indigo-200',
  Backend: 'text-lime-800 bg-lime-100/80 border-lime-200',
  Database: 'text-pink-700 bg-pink-100/80 border-pink-200',
  'AI Service': 'text-sky-700 bg-sky-100/80 border-sky-200',
  Worker: 'text-amber-800 bg-amber-100/80 border-amber-200',
  Cache: 'text-rose-700 bg-rose-100/80 border-rose-200',
  Storage: 'text-purple-700 bg-purple-100/80 border-purple-200',
  Security: 'text-teal-700 bg-teal-100/80 border-teal-200',
  Auth: 'text-teal-700 bg-teal-100/80 border-teal-200',
  'Media Service': 'text-blue-700 bg-blue-100/80 border-blue-200',
  Deployment: 'text-slate-700 bg-slate-100/80 border-slate-200',
};

export const CustomNode = memo(({ data }: { data: any }) => {
  const category = data.category || 'Backend';
  const Icon = categoryIcons[category] || Layers;
  const colorClass = categoryColors[category] || 'border-[#0D2818]/20 bg-white';
  const badgeClass = categoryAccentColors[category] || 'text-[#0D2818]/70 bg-black/5 border-black/10';

  return (
    <div
      className={`px-4 py-3.5 rounded-2xl border-2 shadow-lg backdrop-blur-md min-w-[210px] max-w-[260px] transition-all hover:scale-105 ${colorClass}`}
    >
      <Handle type="target" position={Position.Top} className="!bg-[#0D2818] !w-2.5 !h-2.5" />
      <Handle type="target" position={Position.Left} className="!bg-[#0D2818] !w-2.5 !h-2.5" />

      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5">
          <div className="p-1 rounded-lg bg-[#0D2818] text-white">
            <Icon className="w-3.5 h-3.5 text-[#84CC16]" />
          </div>
          <span className={`text-[9px] font-mono uppercase tracking-widest font-bold px-2 py-0.5 rounded-md border ${badgeClass}`}>
            {category}
          </span>
        </div>
      </div>

      <h4 className="font-serif font-bold text-sm text-[#0D2818] leading-tight mb-1">
        {data.label}
      </h4>

      {data.tech && (
        <span className="inline-block text-[10px] font-mono text-[#0D2818]/80 bg-white/90 px-2 py-0.5 rounded-full border border-[#0D2818]/10 mb-1">
          {data.tech}
        </span>
      )}

      {data.description && (
        <p className="text-[11px] text-[#0D2818]/70 line-clamp-2 leading-relaxed mt-0.5">
          {data.description}
        </p>
      )}

      <Handle type="source" position={Position.Bottom} className="!bg-[#84CC16] !w-2.5 !h-2.5" />
      <Handle type="source" position={Position.Right} className="!bg-[#84CC16] !w-2.5 !h-2.5" />
    </div>
  );
});
