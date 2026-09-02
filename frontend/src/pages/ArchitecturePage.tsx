import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workflowApi } from '../services/workflowApi';
import type { ArchitectureComponent, DataFlow } from '../types/workflow';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { ArchitectureFlow } from '../components/architecture/ArchitectureFlow';
import { Architecture3DScene } from '../components/3d/Architecture3DScene';
import {
  Layers,
  ArrowRight,
  RefreshCw,
  Box,
} from 'lucide-react';

export const ArchitecturePage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');

  // Fetch Architecture
  const { data: arch, isLoading } = useQuery({
    queryKey: ['architecture', projectId],
    queryFn: () => workflowApi.getArchitecture(projectId!),
    enabled: !!projectId,
  });

  // Generate Mutation
  const generateMutation = useMutation({
    mutationFn: () => workflowApi.generateArchitecture(projectId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['architecture', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
    },
  });

  const handleProceedToDbApi = async () => {
    await workflowApi.generateDatabaseDesign(projectId!);
    navigate(`/projects/${projectId}/database-api`);
  };

  if (isLoading) {
    return (
      <div className="text-center py-20">
        <div className="w-10 h-10 border-4 border-[#0D2818] border-t-[#84CC16] rounded-full animate-spin mx-auto mb-4" />
        <p className="font-mono text-sm text-[#0D2818]/70">Synthesizing System Architecture & Component Topologies...</p>
      </div>
    );
  }

  if (!arch) {
    return (
      <Card className="text-center py-16 px-6 max-w-lg mx-auto space-y-4">
        <Layers className="w-10 h-10 text-[#84CC16] mx-auto" />
        <h3 className="font-serif font-bold text-2xl text-[#0D2818]">No Architecture Generated</h3>
        <p className="text-xs text-[#0D2818]/70 font-sans">
          Formulate interactive React Flow & 3D decoupled architectural models.
        </p>
        <Button
          variant="accent"
          isLoading={generateMutation.isPending}
          onClick={() => generateMutation.mutate()}
          icon={<Layers className="w-4 h-4" />}
        >
          Generate System Architecture
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#0D2818]/10 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="lime" size="sm">
              {arch.pattern}
            </Badge>
            <span className="text-xs font-mono text-[#0D2818]/60">Interactive Topology</span>
          </div>
          <h2 className="font-serif font-bold text-2xl text-[#0D2818] mt-1">
            System Architecture & Data Flows
          </h2>
          <p className="text-xs text-[#0D2818]/70 font-sans mt-0.5">
            {arch.overview || 'Decoupled multi-tier software topology.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-[#FAF7F2] p-1 rounded-full border border-[#0D2818]/15 flex items-center gap-1 text-xs font-mono">
            <button
              onClick={() => setViewMode('2d')}
              className={`px-3 py-1 rounded-full transition-colors ${
                viewMode === '2d' ? 'bg-[#0D2818] text-white font-bold' : 'text-[#0D2818]/70 hover:text-[#0D2818]'
              }`}
            >
              React Flow 2D
            </button>
            <button
              onClick={() => setViewMode('3d')}
              className={`px-3 py-1 rounded-full transition-colors flex items-center gap-1 ${
                viewMode === '3d' ? 'bg-[#0D2818] text-white font-bold' : 'text-[#0D2818]/70 hover:text-[#0D2818]'
              }`}
            >
              <Box className="w-3.5 h-3.5 text-[#84CC16]" /> 3D Spatial
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            icon={<RefreshCw className="w-3.5 h-3.5" />}
            isLoading={generateMutation.isPending}
            onClick={() => generateMutation.mutate()}
          >
            Regenerate
          </Button>

          <Button
            variant="accent"
            size="md"
            icon={<ArrowRight className="w-4 h-4" />}
            onClick={handleProceedToDbApi}
          >
            Approve & Design Database / API
          </Button>
        </div>
      </div>

      {/* Main Diagram Display (React Flow or 3D Spatial Scene) */}
      <div>
        {viewMode === '2d' ? (
          <ArchitectureFlow
            initialNodes={arch.nodes || []}
            initialEdges={arch.edges || []}
          />
        ) : (
          <Architecture3DScene nodes={arch.spatial_3d_nodes} />
        )}
      </div>

      {/* Component Details Breakdown */}
      <div className="space-y-4">
        <h3 className="font-serif font-bold text-2xl text-[#0D2818]">
          Component Specifications & Responsibilities
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {arch.components?.map((comp: ArchitectureComponent) => (
            <Card key={comp.id} className="p-5 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#84CC16] bg-[#0D2818] px-2.5 py-0.5 rounded-full font-bold">
                    {comp.layer} Layer
                  </span>
                  <span className="text-xs font-mono text-[#0D2818]/60">{comp.type}</span>
                </div>
                <h4 className="font-serif font-bold text-lg text-[#0D2818]">{comp.name}</h4>
                <span className="inline-block text-xs font-mono text-[#0D2818]/80 bg-[#FAF7F2] px-2 py-0.5 rounded border border-[#0D2818]/10 mt-1">
                  {comp.tech}
                </span>

                <div className="mt-3 space-y-1">
                  <span className="text-[10px] font-mono font-bold text-[#0D2818]/60 uppercase tracking-wider block">
                    Core Responsibilities:
                  </span>
                  <ul className="text-xs text-[#0D2818]/80 font-sans list-disc list-inside space-y-0.5">
                    {comp.responsibilities?.map((r: string, i: number) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-3 border-t border-[#0D2818]/10 text-[11px] font-mono text-[#0D2818]/70 space-y-1">
                <div>
                  <strong>Input:</strong> {comp.data_flow_in?.join(', ') || 'N/A'}
                </div>
                <div>
                  <strong>Output:</strong> {comp.data_flow_out?.join(', ') || 'N/A'}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Data Flows Table */}
      {arch.data_flows && arch.data_flows.length > 0 && (
        <Card className="p-6 space-y-4">
          <h4 className="font-serif font-bold text-lg text-[#0D2818]">System Data Flows & Protocols</h4>
          <div className="divide-y divide-[#0D2818]/10 text-xs font-mono overflow-x-auto">
            {arch.data_flows.map((df: DataFlow, idx: number) => (
              <div key={idx} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#0D2818]">{df.from_component}</span>
                  <span className="text-[#84CC16] font-bold">→</span>
                  <span className="font-bold text-[#0D2818]">{df.to_component}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="bg-[#FAF7F2] px-2.5 py-1 rounded-full border border-[#0D2818]/10 text-[#0D2818]">
                    {df.protocol}
                  </span>
                  <span className="text-[#0D2818]/70">{df.payload}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
