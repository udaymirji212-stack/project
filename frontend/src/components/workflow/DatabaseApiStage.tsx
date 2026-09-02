import React, { useState, useEffect } from 'react';
import { workflowApi } from '../../services/workflowApi';
import type { DatabaseDesign, ApiSpecification, EntityItem } from '../../types/workflow';
import type { Project } from '../../types/project';
import {
  Database,
  Code2,
  CheckCircle2,
  RefreshCw,
  Save,
  ArrowRight,
  Loader2,
  TableProperties,
  Key,
  Lock,
  FileCode,
} from 'lucide-react';

interface DatabaseApiStageProps {
  project: Project;
  onAdvance: () => void;
  onRefreshProject?: () => void;
}

export const DatabaseApiStage: React.FC<DatabaseApiStageProps> = ({
  project,
  onAdvance,
  onRefreshProject,
}) => {
  const [activeTab, setActiveTab] = useState<'db' | 'api' | 'sql'>('db');
  const [dbData, setDbData] = useState<DatabaseDesign | null>(null);
  const [apiSpecs, setApiSpecs] = useState<ApiSpecification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<EntityItem | null>(null);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [dbRes, apiRes] = await Promise.all([
        workflowApi.getDatabase(project.id).catch(() => null),
        workflowApi.getApiSpecs(project.id).catch(() => []),
      ]);

      if (!dbRes) {
        await handleGenerate();
      } else {
        setDbData(dbRes);
        if (dbRes.entities && dbRes.entities.length > 0) {
          setSelectedEntity(dbRes.entities[0]);
        }
        setApiSpecs(apiRes);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [project.id]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const dbRes = await workflowApi.generateDatabase(project.id);
      setDbData(dbRes);
      if (dbRes.entities && dbRes.entities.length > 0) {
        setSelectedEntity(dbRes.entities[0]);
      }
      const apiRes = await workflowApi.getApiSpecs(project.id);
      setApiSpecs(apiRes);
      if (onRefreshProject) onRefreshProject();
    } catch (err) {
      console.error('Failed to generate DB & API design:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async (advance = false) => {
    if (!dbData) return;
    setIsSaving(true);
    try {
      await workflowApi.updateDatabase(project.id, {
        ...dbData,
        is_approved: advance ? true : dbData.is_approved,
      });
      if (advance) {
        onAdvance();
      }
    } finally {
      setIsSaving(false);
    }
  };

  const getMethodBadgeClass = (method: string) => {
    switch (method.toUpperCase()) {
      case 'GET':
        return 'bg-blue-500/15 text-blue-700 border-blue-500/30';
      case 'POST':
        return 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30';
      case 'PUT':
      case 'PATCH':
        return 'bg-amber-500/15 text-amber-700 border-amber-500/30';
      case 'DELETE':
        return 'bg-red-500/15 text-red-700 border-red-500/30';
      default:
        return 'bg-forest-900/10 text-forest-800 border-forest-900/20';
    }
  };

  if (isLoading && !dbData) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-forest-900" />
        <p className="text-sm font-semibold text-forest-800">
          Synthesizing Entity-Relationship Schemas & REST API Contracts...
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
              Stage 04
            </span>
            <h2 className="font-serif text-2xl font-bold text-forest-950">
              Database Modeling & REST API Specification
            </h2>
          </div>
          <p className="mt-1 text-xs text-forest-700/70">
            Relational tables, DDL SQL schemas, foreign keys, index structures, and OpenAPI-compliant endpoint contracts.
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
            <span>Save Draft</span>
          </button>

          <button
            onClick={() => handleSave(true)}
            disabled={isSaving}
            className="inline-flex items-center space-x-2 rounded-xl bg-forest-900 px-5 py-2 text-xs font-bold text-lime-400 shadow-md hover:bg-forest-950 transition-all"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>Approve & Proceed to Code Gen</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-forest-900/10 pb-2">
        <button
          onClick={() => setActiveTab('db')}
          className={`flex items-center space-x-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
            activeTab === 'db'
              ? 'bg-forest-900 text-ivory-100 shadow-sm'
              : 'bg-ivory-50 text-forest-800 hover:bg-ivory-200'
          }`}
        >
          <Database className="h-4 w-4" />
          <span>Database Schema ({dbData?.entities.length || 0} Entities)</span>
        </button>

        <button
          onClick={() => setActiveTab('api')}
          className={`flex items-center space-x-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
            activeTab === 'api'
              ? 'bg-forest-900 text-ivory-100 shadow-sm'
              : 'bg-ivory-50 text-forest-800 hover:bg-ivory-200'
          }`}
        >
          <Code2 className="h-4 w-4" />
          <span>REST API Specifications ({apiSpecs.length} Endpoints)</span>
        </button>

        <button
          onClick={() => setActiveTab('sql')}
          className={`flex items-center space-x-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
            activeTab === 'sql'
              ? 'bg-forest-900 text-ivory-100 shadow-sm'
              : 'bg-ivory-50 text-forest-800 hover:bg-ivory-200'
          }`}
        >
          <FileCode className="h-4 w-4" />
          <span>SQL DDL Schema</span>
        </button>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'db' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Entity List */}
          <div className="rounded-3xl bg-ivory-50 p-4 border border-forest-900/10 shadow-sm space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-forest-700/60 block px-2 mb-2">
              Relational Tables
            </span>
            {dbData?.entities.map((ent, idx) => {
              const isSelected = selectedEntity?.name === ent.name;
              return (
                <button
                  key={ent.name || idx}
                  onClick={() => setSelectedEntity(ent)}
                  className={`w-full p-3 rounded-2xl text-left transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-forest-900 text-ivory-100 shadow-md ring-1 ring-forest-900'
                      : 'hover:bg-forest-900/5 text-forest-900'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <TableProperties
                      className={`h-4 w-4 ${isSelected ? 'text-lime-400' : 'text-forest-700'}`}
                    />
                    <span className="font-mono text-xs font-bold">{ent.name}</span>
                  </div>
                  <span
                    className={`font-mono text-[10px] px-2 py-0.5 rounded ${
                      isSelected ? 'bg-forest-800 text-lime-300' : 'bg-forest-900/5 text-forest-700'
                    }`}
                  >
                    {ent.fields.length} cols
                  </span>
                </button>
              );
            })}
          </div>

          {/* Selected Entity Details */}
          <div className="lg:col-span-3 rounded-3xl bg-ivory-50 p-6 border border-forest-900/10 shadow-sm space-y-6">
            {selectedEntity ? (
              <>
                <div className="flex items-center justify-between border-b border-forest-900/10 pb-4">
                  <div>
                    <div className="flex items-center space-x-3">
                      <h3 className="font-mono text-xl font-bold text-forest-950">
                        {selectedEntity.name}
                      </h3>
                      <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-lime-500/20 text-forest-900 font-bold">
                        {dbData?.database_type || 'PostgreSQL'} Table
                      </span>
                    </div>
                    <p className="text-xs text-forest-700/80 mt-1">
                      {selectedEntity.description}
                    </p>
                  </div>
                </div>

                {/* Fields Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-forest-900/10 text-forest-700/70 font-bold uppercase tracking-wider text-[10px]">
                        <th className="pb-3">Column Name</th>
                        <th className="pb-3">Data Type</th>
                        <th className="pb-3">Constraints</th>
                        <th className="pb-3">Default</th>
                        <th className="pb-3">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-forest-900/5">
                      {selectedEntity.fields.map((f, fIdx) => (
                        <tr key={fIdx} className="hover:bg-forest-900/5 transition-colors">
                          <td className="py-3 font-mono font-bold text-forest-950 flex items-center space-x-1.5">
                            {f.is_primary && (
                              <Key className="h-3 w-3 text-amber-500 shrink-0" />
                            )}
                            <span>{f.name}</span>
                          </td>
                          <td className="py-3 font-mono text-forest-800 font-medium">
                            {f.type}
                          </td>
                          <td className="py-3">
                            <div className="flex flex-wrap gap-1">
                              {f.is_primary && (
                                <span className="font-mono text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-800 font-bold">
                                  PK
                                </span>
                              )}
                              {!f.is_nullable && (
                                <span className="font-mono text-[9px] px-1.5 py-0.2 rounded bg-forest-900/10 text-forest-800">
                                  NOT NULL
                                </span>
                              )}
                              {f.is_unique && (
                                <span className="font-mono text-[9px] px-1.5 py-0.2 rounded bg-blue-500/15 text-blue-800">
                                  UNIQUE
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 font-mono text-forest-700/80 text-[11px]">
                            {f.default || '-'}
                          </td>
                          <td className="py-3 text-forest-700/80 max-w-xs">
                            {f.description || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Relations & Indexes */}
                {selectedEntity.relations && selectedEntity.relations.length > 0 && (
                  <div className="pt-4 border-t border-forest-900/10 space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-forest-800 block">
                      Foreign Key Relations
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {selectedEntity.relations.map((rel, rIdx) => (
                        <div
                          key={rIdx}
                          className="rounded-xl bg-ivory-200/60 px-3 py-1.5 text-xs text-forest-900 flex items-center space-x-2"
                        >
                          <span className="font-mono font-bold">{rel.foreign_key || 'id'}</span>
                          <ArrowRight className="h-3 w-3 text-lime-600" />
                          <span className="font-mono font-bold text-forest-950">
                            {rel.target_entity}
                          </span>
                          <span className="font-mono text-[10px] text-forest-700/60">
                            ({rel.type})
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16 text-xs text-forest-700/60">
                Select an entity from the list to view its schema definition.
              </div>
            )}
          </div>
        </div>
      )}

      {/* REST API Tab */}
      {activeTab === 'api' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            {apiSpecs.map((api, idx) => (
              <div
                key={api.id || idx}
                className="rounded-2xl bg-ivory-50 p-5 border border-forest-900/10 shadow-sm space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center space-x-3">
                    <span
                      className={`font-mono text-xs font-bold px-3 py-1 rounded-lg border ${getMethodBadgeClass(
                        api.method
                      )}`}
                    >
                      {api.method}
                    </span>
                    <span className="font-mono text-sm font-bold text-forest-950">
                      {api.path}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    {api.auth_required && (
                      <span className="inline-flex items-center space-x-1 font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-forest-900 text-lime-400">
                        <Lock className="h-3 w-3" />
                        <span>JWT Auth</span>
                      </span>
                    )}
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-forest-900/5 text-forest-700 uppercase">
                      {api.tag}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-forest-700/90 font-medium">
                  {api.summary || api.description}
                </p>

                {/* Schemas snippet */}
                {(api.request_body_schema || api.response_success_schema) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                    {api.request_body_schema && (
                      <div className="rounded-xl bg-ivory-200/50 p-3">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-forest-700 block mb-1">
                          Request Body
                        </span>
                        <pre className="font-mono text-[10px] text-forest-900 overflow-x-auto">
                          {typeof api.request_body_schema === 'string'
                            ? api.request_body_schema
                            : JSON.stringify(api.request_body_schema, null, 2)}
                        </pre>
                      </div>
                    )}
                    {api.response_success_schema && (
                      <div className="rounded-xl bg-ivory-200/50 p-3">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-forest-700 block mb-1">
                          Success Response (200 OK)
                        </span>
                        <pre className="font-mono text-[10px] text-forest-900 overflow-x-auto">
                          {typeof api.response_success_schema === 'string'
                            ? api.response_success_schema
                            : JSON.stringify(api.response_success_schema, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SQL DDL Tab */}
      {activeTab === 'sql' && (
        <div className="rounded-3xl bg-ivory-50 p-6 border border-forest-900/10 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif font-bold text-forest-950 text-base">
              Generated SQL Schema Definition (DDL)
            </h3>
            <span className="font-mono text-xs px-2.5 py-0.5 rounded bg-forest-900/10 text-forest-800 font-bold">
              {dbData?.database_type || 'PostgreSQL'} DDL
            </span>
          </div>
          <pre className="font-mono text-xs text-forest-950 bg-forest-950 text-lime-300 p-6 rounded-2xl overflow-x-auto leading-relaxed shadow-inner">
            {dbData?.sql_schema_ddl ||
              '-- Auto-generated SQL DDL will appear here upon generation.'}
          </pre>
        </div>
      )}
    </div>
  );
};
