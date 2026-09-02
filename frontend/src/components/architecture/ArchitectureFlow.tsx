import React, { useCallback } from 'react';
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
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#0D2818', strokeWidth: 2 } }, eds)),
    [setEdges]
  );

  return (
    <div className="w-full h-[520px] bg-[#FAF7F2] rounded-3xl border border-[#0D2818]/15 overflow-hidden shadow-md relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-right"
      >
        <Controls className="!bg-white !border-[#0D2818]/15 !shadow-md !rounded-2xl overflow-hidden" />
        <MiniMap
          className="!bg-white !border-[#0D2818]/15 !shadow-md !rounded-2xl overflow-hidden"
          nodeColor={(n) => {
            if (n.data?.category === 'Frontend') return '#10B981';
            if (n.data?.category === 'Backend') return '#84CC16';
            if (n.data?.category === 'Database') return '#EC4899';
            if (n.data?.category === 'AI Service') return '#38BDF8';
            return '#0D2818';
          }}
        />
        <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#0D2818" className="opacity-15" />
      </ReactFlow>
    </div>
  );
};
