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
      <div className="text-center py-20 font-sans">
        <div className="w-10 h-10 border-4 border-zinc-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
        <p className="font-sans text-sm text-zinc-500">Synthesizing System Architecture & Component Topologies...</p>
      </div>
    );
  }

  if (!arch) {
    return (
      <Card className="text-center py-16 px-6 max-w-lg mx-auto space-y-4 bg-white/90">
        <Layers className="w-10 h-10 text-indigo-600 mx-auto" />
        <h3 className="font-serif text-2xl text-zinc-900">No Architecture Generated</h3>
        <p className="text-xs text-zinc-500 font-sans">
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
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/90 backdrop-blur-md p-6 rounded-2xl border border-zinc-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="lime" size="sm">
              {arch.pattern}
            </Badge>
            <span className="text-xs font-sans text-zinc-400">Interactive Topology</span>
          </div>
          <h2 className="font-serif text-2xl text-zinc-900 mt-1">
            System Architecture & Data Flows
          </h2>
          <p className="text-xs text-zinc-500 font-sans mt-0.5">
            {arch.overview || 'Decoupled multi-tier software topology.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-zinc-100 p-1 rounded-full border border-zinc-200 flex items-center gap-1 text-xs font-sans">
            <button
              type="button"
              onClick={() => setViewMode('2d')}
              className={`px-3.5 py-1 rounded-full transition-colors cursor-pointer ${
                viewMode === '2d' ? 'bg-zinc-900 text-white font-medium shadow-xs' : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              React Flow 2D
            </button>
            <button
              type="button"
              onClick={() => setViewMode('3d')}
              className={`px-3.5 py-1 rounded-full transition-colors flex items-center gap-1 cursor-pointer ${
                viewMode === '3d' ? 'bg-zinc-900 text-white font-medium shadow-xs' : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <Box className="w-3.5 h-3.5 text-indigo-400" /> 3D Spatial
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

      {/* Main Diagram Display */}
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
        <h3 className="font-serif text-2xl text-zinc-900">
          Component Specifications & Responsibilities
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {arch.components?.map((comp: ArchitectureComponent) => (
            <Card key={comp.id} className="p-5 flex flex-col justify-between space-y-4 bg-white/90">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-sans uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-full font-medium">
                    {comp.layer} Layer
                  </span>
                  <span className="text-xs font-sans text-zinc-400">{comp.type}</span>
                </div>
                <h4 className="font-serif text-xl text-zinc-900">{comp.name}</h4>
                <span className="inline-block text-xs font-mono text-zinc-700 bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200 mt-1">
                  {comp.tech}
                </span>

                <div className="mt-3 space-y-1">
                  <span className="text-[11px] font-sans font-medium text-zinc-400 uppercase tracking-wider block">
                    Core Responsibilities:
                  </span>
                  <ul className="text-xs text-zinc-600 font-sans list-disc list-inside space-y-0.5">
                    {comp.responsibilities?.map((r: string, i: number) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-100 text-[11px] font-sans text-zinc-500 space-y-1">
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
        <Card className="p-6 space-y-4 bg-white/90">
          <h4 className="font-serif text-xl text-zinc-900">System Data Flows & Protocols</h4>
          <div className="divide-y divide-zinc-100 text-xs font-sans overflow-x-auto">
            {arch.data_flows.map((df: DataFlow, idx: number) => (
              <div key={idx} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-zinc-900">{df.from_component}</span>
                  <span className="text-indigo-600 font-bold">→</span>
                  <span className="font-medium text-zinc-900">{df.to_component}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="bg-zinc-100 px-2.5 py-1 rounded-full border border-zinc-200 text-zinc-700 font-mono text-[11px]">
                    {df.protocol}
                  </span>
                  <span className="text-zinc-500">{df.payload}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
