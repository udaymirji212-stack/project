import React, { useCallback, useEffect } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  BackgroundVariant,
  type Connection,
  type Edge,
  type Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { CustomNode } from './CustomNode';

const nodeTypes = {
  customNode: CustomNode,
};

interface ArchitectureFlowProps {
  initialNodes: Node[];
  initialEdges: Edge[];
}

export const ArchitectureFlow: React.FC<ArchitectureFlowProps> = ({
  initialNodes,
  initialEdges,
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Sync state if initialNodes/initialEdges prop updates upon regeneration
  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            animated: true,
            style: { stroke: '#0D2818', strokeWidth: 2 },
          },
          eds
        )
      ),
    [setEdges]
  );

  return (
    <div className="w-full h-[600px] bg-[#FAF7F2] rounded-3xl border border-[#0D2818]/15 overflow-hidden shadow-md relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2, maxZoom: 1.1, minZoom: 0.5 }}
        attributionPosition="bottom-right"
      >
        <Controls className="!bg-white !border-[#0D2818]/15 !shadow-md !rounded-2xl overflow-hidden" />
        <MiniMap
          className="!bg-white !border-[#0D2818]/15 !shadow-md !rounded-2xl overflow-hidden"
          nodeColor={(n) => {
            const cat = n.data?.category;
            if (cat === 'Frontend') return '#10B981';
            if (cat === 'Gateway') return '#6366F1';
            if (cat === 'Backend') return '#84CC16';
            if (cat === 'Database') return '#EC4899';
            if (cat === 'AI Service') return '#38BDF8';
            if (cat === 'Worker') return '#F59E0B';
            if (cat === 'Cache') return '#F43F5E';
            if (cat === 'Storage') return '#A855F7';
            if (cat === 'Security' || cat === 'Auth') return '#14B8A6';
            if (cat === 'Media Service') return '#3B82F6';
            if (cat === 'Deployment') return '#64748B';
            return '#0D2818';
          }}
        />
        <Background variant={BackgroundVariant.Dots} gap={18} size={1.2} color="#0D2818" className="opacity-15" />
      </ReactFlow>
    </div>
  );
};
