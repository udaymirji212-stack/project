import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workflowApi } from '../services/workflowApi';
import type { ApiSpecification } from '../types/workflow';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { ErDiagramView } from '../components/db_api/ErDiagramView';
import { ApiEndpointTable } from '../components/db_api/ApiEndpointTable';
import {
  Database,
  Code2,
  ArrowRight,
  RefreshCw,
  Plus,
  Copy,
  Check,
  Terminal,
} from 'lucide-react';

export const DatabaseApiPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<'er' | 'sql' | 'endpoints'>('er');
  const [copiedDdl, setCopiedDdl] = useState(false);
  const [addEndpointModalOpen, setAddEndpointModalOpen] = useState(false);

  // New Endpoint Form State
  const [newPath, setNewPath] = useState('');
  const [newMethod, setNewMethod] = useState('GET');
  const [newSummary, setNewSummary] = useState('');
  const [newTag, setNewTag] = useState('General');
  const [newAuthRequired, setNewAuthRequired] = useState(true);

  // Fetch DB Design
  const { data: dbDesign, isLoading: isDbLoading } = useQuery({
    queryKey: ['database-design', projectId],
    queryFn: () => workflowApi.getDatabaseDesign(projectId!),
    enabled: !!projectId,
  });

  // Fetch API Endpoints
  const { data: endpoints = [], isLoading: isApiLoading } = useQuery({
    queryKey: ['api-endpoints', projectId],
    queryFn: () => workflowApi.getApiEndpoints(projectId!),
    enabled: !!projectId,
  });

  // Generate Mutation
  const generateMutation = useMutation({
    mutationFn: () => workflowApi.generateDatabaseDesign(projectId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['database-design', projectId] });
      queryClient.invalidateQueries({ queryKey: ['api-endpoints', projectId] });
    },
  });

  // Add Endpoint Mutation
  const createEndpointMutation = useMutation({
    mutationFn: (data: Partial<ApiSpecification>) =>
      workflowApi.createApiEndpoint(projectId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-endpoints', projectId] });
      setAddEndpointModalOpen(false);
      setNewPath('');
      setNewSummary('');
    },
  });

  const handleCopyDdl = () => {
    if (!dbDesign?.sql_schema_ddl) return;
    navigator.clipboard.writeText(dbDesign.sql_schema_ddl);
    setCopiedDdl(true);
    setTimeout(() => setCopiedDdl(false), 2000);
  };

  const handleProceedToCodeGen = async () => {
    await workflowApi.generateCode(projectId!, { force_regenerate: false });
    navigate(`/projects/${projectId}/code-generation`);
  };

  const handleCreateEndpointSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPath.trim() || !newSummary.trim()) return;

    createEndpointMutation.mutate({
      path: newPath.startsWith('/') ? newPath : `/${newPath}`,
      method: newMethod,
      summary: newSummary,
      tag: newTag,
      auth_required: newAuthRequired,
      required_role: 'authenticated',
      request_body_schema: { title: 'string' },
      response_success_schema: { status: 'success' },
    });
  };

  if (isDbLoading || isApiLoading) {
    return (
      <div className="text-center py-20 font-sans">
        <div className="w-10 h-10 border-4 border-zinc-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
        <p className="font-sans text-sm text-zinc-500">Generating Relational Entities & REST Contracts...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/90 backdrop-blur-md p-6 rounded-2xl border border-zinc-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="lime" size="sm">
              {dbDesign?.database_type || 'PostgreSQL 16'}
            </Badge>
            <span className="text-xs font-sans text-zinc-400">
              {dbDesign?.entities?.length || 0} Entities • {endpoints.length} Endpoints
            </span>
          </div>
          <h2 className="font-serif text-2xl text-zinc-900 mt-1">
            Database Architecture & REST API Design
          </h2>
          <p className="text-xs text-zinc-500 font-sans mt-0.5">
            Relational tables, foreign key constraints, indexes, and validated OpenAPI schema contracts.
          </p>
        </div>

        <div className="flex items-center gap-3">
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
            onClick={handleProceedToCodeGen}
          >
            Approve & Generate Codebase
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 text-xs font-sans">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('er')}
            className={`px-4 py-2 rounded-full border transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'er'
                ? 'bg-zinc-900 text-white border-zinc-900 font-medium shadow-xs'
                : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-indigo-400" />
            <span>Entity Relationship Schema ({dbDesign?.entities?.length || 0})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('endpoints')}
            className={`px-4 py-2 rounded-full border transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'endpoints'
                ? 'bg-zinc-900 text-white border-zinc-900 font-medium shadow-xs'
                : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50'
            }`}
          >
            <Code2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>REST API Endpoints ({endpoints.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('sql')}
            className={`px-4 py-2 rounded-full border transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'sql'
                ? 'bg-zinc-900 text-white border-zinc-900 font-medium shadow-xs'
                : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-indigo-400" />
            <span>SQL Schema DDL</span>
          </button>
        </div>

        {activeTab === 'endpoints' && (
          <Button
            size="sm"
            variant="secondary"
            icon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => setAddEndpointModalOpen(true)}
          >
            Add Endpoint
          </Button>
        )}
      </div>

      {/* TAB 1: ER DIAGRAM */}
      {activeTab === 'er' && dbDesign && (
        <ErDiagramView entities={dbDesign.entities || []} />
      )}

      {/* TAB 2: API ENDPOINTS */}
      {activeTab === 'endpoints' && (
        <ApiEndpointTable endpoints={endpoints} />
      )}

      {/* TAB 3: SQL DDL */}
      {activeTab === 'sql' && dbDesign?.sql_schema_ddl && (
        <Card className="p-6 space-y-4 bg-white/90">
          <div className="flex items-center justify-between">
            <span className="text-xs font-sans text-zinc-500">
              PostgreSQL ANSI SQL-99 Compatible Schema DDL
            </span>
            <Button
              size="sm"
              variant="outline"
              icon={copiedDdl ? <Check className="w-3.5 h-3.5 text-indigo-600" /> : <Copy className="w-3.5 h-3.5" />}
              onClick={handleCopyDdl}
            >
              {copiedDdl ? 'Copied!' : 'Copy SQL DDL'}
            </Button>
          </div>
          <div className="bg-zinc-900 text-emerald-400 p-6 rounded-2xl font-mono text-xs overflow-x-auto shadow-inner">
            <pre className="leading-relaxed">{dbDesign.sql_schema_ddl}</pre>
          </div>
        </Card>
      )}

      {/* Add Endpoint Modal */}
      <Modal
        isOpen={addEndpointModalOpen}
        onClose={() => setAddEndpointModalOpen(false)}
        title="Add Custom REST API Endpoint"
        maxWidth="md"
      >
        <form onSubmit={handleCreateEndpointSubmit} className="space-y-4 pt-2 font-sans">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-zinc-800 mb-1">
                Method
              </label>
              <select
                value={newMethod}
                onChange={(e) => setNewMethod(e.target.value)}
                className="saas-input cursor-pointer font-mono"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
                <option value="PATCH">PATCH</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-zinc-800 mb-1">
                Endpoint Path *
              </label>
              <input
                type="text"
                value={newPath}
                onChange={(e) => setNewPath(e.target.value)}
                placeholder="/api/records"
                className="saas-input font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-800 mb-1">
              Summary / Action *
            </label>
            <input
              type="text"
              value={newSummary}
              onChange={(e) => setNewSummary(e.target.value)}
              placeholder="e.g. Fetch user transactions"
              className="saas-input"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-zinc-800 mb-1">
                Tag / Group
              </label>
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="e.g. Transactions"
                className="saas-input"
              />
            </div>
            <div className="flex items-center pt-5">
              <label className="flex items-center gap-2 text-sm text-zinc-700 cursor-pointer font-sans">
                <input
                  type="checkbox"
                  checked={newAuthRequired}
                  onChange={(e) => setNewAuthRequired(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                Require JWT Auth
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100">
            <Button variant="outline" size="sm" type="button" onClick={() => setAddEndpointModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="accent"
              size="sm"
              type="submit"
              isLoading={createEndpointMutation.isPending}
            >
              Add Endpoint
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
