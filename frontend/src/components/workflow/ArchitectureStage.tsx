import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  type NodeProps,
  type Node,
  type Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { workflowApi } from '../../services/workflowApi';
import type { ArchitectureDesign, ArchitectureComponent } from '../../types/workflow';
import type { Project } from '../../types/project';
import {
  Network,
  CheckCircle2,
  RefreshCw,
  Save,
  ArrowRight,
  Loader2,
  Cpu,
  Layers,
  Box,
  Eye,
  Database,
  Globe,
  Lock,
  Server,
  Cloud,
} from 'lucide-react';

interface ArchitectureStageProps {
  project: Project;
  onAdvance: () => void;
  onRefreshProject?: () => void;
}

// Custom React Flow Node Component with premium styling
const ArchitectureNodeComponent: React.FC<NodeProps> = ({ data, selected }) => {
  const nodeData = data as Record<string, any>;
  const getIcon = (type: string) => {
    switch ((type || '').toLowerCase()) {
      case 'frontend':
      case 'client':
        return Globe;
      case 'database':
      case 'storage':
        return Database;
      case 'security':
      case 'auth':
        return Lock;
      case 'cache':
      case 'queue':
        return Cpu;
      case 'cloud':
      case 'deploy':
        return Cloud;
      default:
        return Server;
    }
  };

  const Icon = getIcon(nodeData.type || nodeData.category || '');

  return (
    <div
      className={`min-w-[190px] rounded-2xl p-4 transition-all shadow-md ${
        selected
          ? 'bg-forest-900 text-ivory-100 ring-2 ring-lime-400 shadow-xl'
          : 'bg-ivory-50 text-forest-950 border border-forest-900/15 hover:border-forest-900/40'
      }`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-lime-500 !w-3 !h-3 !border-2 !border-forest-900"
      />

      <div className="flex items-center space-x-2.5 mb-2">
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-xl ${
            selected ? 'bg-forest-800 text-lime-400' : 'bg-forest-900/10 text-forest-900'
          }`}
        >
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <div className="font-bold text-xs truncate">{nodeData.label || nodeData.name || 'Component'}</div>
          <div className="text-[10px] font-mono opacity-70 truncate">{nodeData.tech || 'Service'}</div>
        </div>
      </div>

      <div className="text-[10px] opacity-80 line-clamp-2 mt-1">
        {nodeData.description || (Array.isArray(nodeData.responsibilities) ? nodeData.responsibilities[0] : 'System component')}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-lime-500 !w-3 !h-3 !border-2 !border-forest-900"
      />
    </div>
  );
};

// 3D Visualizer Canvas (HTML5 Canvas simulation with interactive spatial nodes)
const Spatial3DCanvas: React.FC<{ components: ArchitectureComponent[] }> = ({ components }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let angle = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = Math.min(centerX, centerY) * 0.65;

      // Draw glowing orbit rings
      ctx.strokeStyle = 'rgba(132, 204, 22, 0.15)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(13, 40, 24, 0.1)';
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 0.5, 0, Math.PI * 2);
      ctx.stroke();

      // Draw center core
      ctx.fillStyle = '#0D2818';
      ctx.beginPath();
      ctx.arc(centerX, centerY, 32, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#84CC16';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('CORE AI', centerX, centerY);

      // Draw orbiting component nodes
      components.forEach((comp, idx) => {
        const count = Math.max(1, components.length);
        const theta = angle + (idx * 2 * Math.PI) / count;
        const x = centerX + radius * Math.cos(theta);
        const y = centerY + radius * Math.sin(theta) * 0.7; // slight isometric tilt

        // Draw connection beam
        ctx.strokeStyle = 'rgba(13, 40, 24, 0.2)';
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.setLineDash([]);

        // Draw node circle
        ctx.fillStyle = '#163E2B';
        ctx.beginPath();
        ctx.arc(x, y, 22, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#84CC16';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Node label
        ctx.fillStyle = '#FAF7F2';
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(comp.name.substring(0, 10), x, y + 32);
      });

      angle += 0.005;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [components]);

  return (
    <div className="relative w-full h-[520px] rounded-2xl bg-gradient-to-br from-forest-950 to-forest-900 flex items-center justify-center overflow-hidden border border-forest-800">
      <div className="absolute top-4 left-4 z-10 rounded-xl bg-forest-900/80 px-3 py-1.5 text-xs font-semibold text-lime-400 backdrop-blur-md border border-lime-400/20">
        3D Spatial Topology Visualizer
      </div>
      <canvas
        ref={canvasRef}
        width={700}
        height={500}
        className="w-full h-full object-contain"
      />
    </div>
  );
};

export const ArchitectureStage: React.FC<ArchitectureStageProps> = ({
  project,
  onAdvance,
  onRefreshProject,
}) => {
  const [arch, setArch] = useState<ArchitectureDesign | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState<ArchitectureComponent | null>(null);
  const [viewMode, setViewMode] = useState<'diagram' | 'spatial' | 'dataflow'>('diagram');

  const nodeTypes = useMemo(() => ({ archNode: ArchitectureNodeComponent }), []);

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  const loadArch = async () => {
    try {
      setIsLoading(true);
      const res = await workflowApi.getArchitecture(project.id);
      setArch(res);
      initDiagram(res);
    } catch {
      await handleGenerate();
    } finally {
      setIsLoading(false);
    }
  };

  const initDiagram = (data: ArchitectureDesign) => {
    if (data.nodes && data.nodes.length > 0) {
      setNodes(
        data.nodes.map((n: any) => ({
          ...n,
          type: 'archNode',
        }))
      );
      setEdges(
        data.edges.map((e: any) => ({
          ...e,
          animated: true,
          style: { stroke: '#0D2818', strokeWidth: 2 },
        }))
      );
    } else {
      // Fallback dynamic layout from components
      const dynamicNodes = (data.components || []).map((comp, idx) => ({
        id: comp.id || `node-${idx}`,
        type: 'archNode',
        position: { x: 100 + (idx % 3) * 240, y: 80 + Math.floor(idx / 3) * 160 },
        data: {
          label: comp.name,
          tech: comp.tech,
          type: comp.type,
          responsibilities: comp.responsibilities,
        },
      }));
      setNodes(dynamicNodes);
    }
    if (data.components && data.components.length > 0) {
      setSelectedComponent(data.components[0]);
    }
  };

  useEffect(() => {
    loadArch();
  }, [project.id]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const res = await workflowApi.generateArchitecture(project.id);
      setArch(res);
      initDiagram(res);
      if (onRefreshProject) onRefreshProject();
    } catch (err) {
      console.error('Failed to generate architecture:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async (advance = false) => {
    if (!arch) return;
    setIsSaving(true);
    try {
      const res = await workflowApi.updateArchitecture(project.id, {
        ...arch,
        nodes: nodes,
        edges: edges,
        is_approved: advance ? true : arch.is_approved,
      });
      setArch(res);
      if (advance) {
        onAdvance();
      }
    } finally {
      setIsSaving(false);
    }
  };

  const onNodeClick = (_: any, node: Node) => {
    const matched = arch?.components.find((c) => c.id === node.id || c.name === node.data.label);
    if (matched) {
      setSelectedComponent(matched);
    }
  };

  if (isLoading && !arch) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-forest-900" />
        <p className="text-sm font-semibold text-forest-800">
          Constructing system topology & architecture graph...
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
              Stage 03
            </span>
            <h2 className="font-serif text-2xl font-bold text-forest-950">
              System Architecture & Component Topology
            </h2>
          </div>
          <p className="mt-1 text-xs text-forest-700/70">
            Interactive system architecture with component nodes, data flows, and spatial 3D inspection.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleGenerate()}
            disabled={isGenerating}
            className="inline-flex items-center space-x-1.5 rounded-xl bg-ivory-200 px-3.5 py-2 text-xs font-bold text-forest-900 hover:bg-ivory-300 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? 'Synthesizing...' : 'Regenerate'}</span>
          </button>

          <button
            onClick={() => handleSave(false)}
            disabled={isSaving}
            className="inline-flex items-center space-x-1.5 rounded-xl bg-ivory-200 px-3.5 py-2 text-xs font-bold text-forest-900 hover:bg-ivory-300 transition-colors"
          >
            <Save className="h-3.5 w-3.5" />
            <span>Save Layout</span>
          </button>

          <button
            onClick={() => handleSave(true)}
            disabled={isSaving}
            className="inline-flex items-center space-x-2 rounded-xl bg-forest-900 px-5 py-2 text-xs font-bold text-lime-400 shadow-md hover:bg-forest-950 transition-all"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>Approve & Proceed to DB/API</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Mode Selectors */}
      <div className="flex items-center justify-between">
        <div className="inline-flex rounded-2xl bg-ivory-50 p-1 border border-forest-900/10 shadow-sm">
          <button
            onClick={() => setViewMode('diagram')}
            className={`flex items-center space-x-1.5 px-4 py-1.5 text-xs font-bold rounded-xl transition-all ${
              viewMode === 'diagram'
                ? 'bg-forest-900 text-ivory-100 shadow-sm'
                : 'text-forest-800 hover:text-forest-950'
            }`}
          >
            <Network className="h-3.5 w-3.5" />
            <span>Interactive Graph</span>
          </button>
          <button
            onClick={() => setViewMode('spatial')}
            className={`flex items-center space-x-1.5 px-4 py-1.5 text-xs font-bold rounded-xl transition-all ${
              viewMode === 'spatial'
                ? 'bg-forest-900 text-ivory-100 shadow-sm'
                : 'text-forest-800 hover:text-forest-950'
            }`}
          >
            <Box className="h-3.5 w-3.5" />
            <span>3D Spatial View</span>
          </button>
          <button
            onClick={() => setViewMode('dataflow')}
            className={`flex items-center space-x-1.5 px-4 py-1.5 text-xs font-bold rounded-xl transition-all ${
              viewMode === 'dataflow'
                ? 'bg-forest-900 text-ivory-100 shadow-sm'
                : 'text-forest-800 hover:text-forest-950'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Data Flow Protocols ({arch?.data_flows.length || 0})</span>
          </button>
        </div>

        <div className="text-xs font-semibold text-forest-700/70">
          Pattern: <span className="text-forest-950 font-bold">{arch?.pattern || 'Microservices'}</span>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 rounded-3xl bg-ivory-50 border border-forest-900/10 shadow-sm overflow-hidden min-h-[520px]">
          {viewMode === 'diagram' ? (
            <div className="w-full h-[520px]">
              <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onNodeClick={onNodeClick}
                fitView
              >
                <Background color="#0D2818" gap={16} size={1} />
                <Controls />
                <MiniMap
                  nodeStrokeColor="#0D2818"
                  nodeColor="#DEECE4"
                  nodeBorderRadius={8}
                />
              </ReactFlow>
            </div>
          ) : viewMode === 'spatial' ? (
            <Spatial3DCanvas components={arch?.components || []} />
          ) : (
            <div className="p-6 overflow-y-auto max-h-[520px] space-y-3">
              <h3 className="font-serif text-lg font-bold text-forest-950 mb-3">
                Inter-Service Communication & Data Flow
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {arch?.data_flows.map((flow, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-ivory-100/70 border border-forest-900/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-xs text-forest-950">
                          {flow.from_component}
                        </span>
                        <ArrowRight className="h-3.5 w-3.5 text-lime-600" />
                        <span className="font-bold text-xs text-forest-950">
                          {flow.to_component}
                        </span>
                      </div>
                      <p className="text-xs text-forest-700/80">{flow.description}</p>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-forest-900 text-lime-400 font-bold">
                        {flow.protocol}
                      </span>
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-forest-900/5 text-forest-800">
                        {flow.payload}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Component Inspector Sidebar */}
        <div className="rounded-3xl bg-ivory-50 p-6 border border-forest-900/10 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-forest-700/70 text-xs font-bold uppercase tracking-wider mb-4">
              <Eye className="h-4 w-4" />
              <span>Component Inspector</span>
            </div>

            {selectedComponent ? (
              <div className="space-y-4">
                <div>
                  <h4 className="font-serif text-lg font-bold text-forest-950">
                    {selectedComponent.name}
                  </h4>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-lime-500/20 text-forest-900">
                      {selectedComponent.tech}
                    </span>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-forest-900/5 text-forest-700">
                      {selectedComponent.layer}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-forest-800 uppercase tracking-wider block mb-1.5">
                    Core Responsibilities
                  </span>
                  <ul className="space-y-1.5 text-xs text-forest-700">
                    {selectedComponent.responsibilities?.map((resp, idx) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <span className="font-bold text-lime-600">•</span>
                        <span>{resp}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {selectedComponent.data_flow_in && selectedComponent.data_flow_in.length > 0 && (
                  <div>
                    <span className="text-[11px] font-bold text-forest-800 uppercase tracking-wider block mb-1">
                      Inbound Traffic
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {selectedComponent.data_flow_in.map((item, idx) => (
                        <span
                          key={idx}
                          className="font-mono text-[10px] px-2 py-0.5 rounded bg-forest-900/5 text-forest-800"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-xs text-forest-700/70 py-12 text-center">
                Click any component in the graph above to inspect responsibilities & tech stack.
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-forest-900/10">
            <span className="text-[11px] text-forest-700/60 block">
              Total Nodes: {arch?.components?.length || 0}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
