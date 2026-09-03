import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectApi, type CreateProjectPayload } from '../services/projectApi';
import type { Project } from '../types/project';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { NewProjectModal } from '../components/dashboard/NewProjectModal';
import {
  PlusCircle,
  Search,
  ArrowRight,
  Trash2,
  Edit2,
  FolderCode,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [deleteModalProject, setDeleteModalProject] = useState<Project | null>(null);
  const [renameModalProject, setRenameModalProject] = useState<Project | null>(null);
  const [newName, setNewName] = useState('');

  // Fetch Dashboard Stats
  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: projectApi.getStats,
  });

  // Fetch Projects List
  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects', searchTerm, statusFilter],
    queryFn: () =>
      projectApi.list({
        search: searchTerm || undefined,
        status: statusFilter || undefined,
      }),
  });

  // Create Project Handler
  const handleCreateProject = async (payload: CreateProjectPayload) => {
    const created = await projectApi.create(payload);
    queryClient.invalidateQueries({ queryKey: ['projects'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    navigate(`/projects/${created.id}`);
  };

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => projectApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      setDeleteModalProject(null);
    },
  });

  // Rename Mutation
  const renameMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      projectApi.update(id, { name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setRenameModalProject(null);
    },
  });

  const handleStageRouting = (project: Project) => {
    navigate(`/projects/${project.id}`);
  };

  const getStageDisplay = (stage: string) => {
    const map: Record<string, string> = {
      requirements: '1. Requirements',
      srs: '2. IEEE SRS',
      architecture: '3. Architecture',
      database_api: '4. DB & API',
      code_generation: '5. Code Gen',
      workspace: '6. Workspace',
      review_testing: '7. AI Testing',
      documentation: '8. Documentation',
      export: '9. ZIP Export',
      completed: 'Completed',
    };
    return map[stage] || stage;
  };

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-10 space-y-10 font-sans">
      {/* 1. Greeting & Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200/80 pb-6">
        <div>
          <span className="text-xs font-sans uppercase tracking-widest text-indigo-700 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full font-semibold">
            Engineering Dashboard
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif text-zinc-900 mt-2">
            Welcome back, {user?.full_name?.split(' ')[0] || 'Architect'}
          </h1>
          <p className="text-sm text-zinc-500 font-sans mt-1">
            Manage your synthesized software systems, view architecture topologies, and generate codebases.
          </p>
        </div>

        <Button
          size="md"
          variant="accent"
          icon={<PlusCircle className="w-4 h-4" />}
          onClick={() => setIsCreateModalOpen(true)}
        >
          Create New Project
        </Button>
      </div>

      {/* 2. Real Database Statistics Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="p-4 space-y-1 bg-white">
          <span className="text-[11px] font-sans uppercase text-zinc-400 font-medium">Total Projects</span>
          <p className="text-2xl font-serif text-zinc-900">{stats?.total_projects || 0}</p>
        </Card>
        <Card className="p-4 space-y-1 bg-indigo-50/40 border-indigo-100">
          <span className="text-[11px] font-sans uppercase text-indigo-700 font-medium">In Progress</span>
          <p className="text-2xl font-serif text-indigo-900">{stats?.active_projects || 0}</p>
        </Card>
        <Card className="p-4 space-y-1 bg-emerald-50/40 border-emerald-100">
          <span className="text-[11px] font-sans uppercase text-emerald-700 font-medium">Completed</span>
          <p className="text-2xl font-serif text-emerald-900">{stats?.completed_projects || 0}</p>
        </Card>
        <Card className="p-4 space-y-1 bg-white">
          <span className="text-[11px] font-sans uppercase text-zinc-400 font-medium">Files Generated</span>
          <p className="text-2xl font-serif text-zinc-900">{stats?.total_generated_files || 0}</p>
        </Card>
        <Card className="p-4 space-y-1 bg-white">
          <span className="text-[11px] font-sans uppercase text-zinc-400 font-medium">Security Audits</span>
          <p className="text-2xl font-serif text-zinc-900">{stats?.total_reviews_run || 0}</p>
        </Card>
        <Card className="p-4 space-y-1 bg-white">
          <span className="text-[11px] font-sans uppercase text-zinc-400 font-medium">Tests Passed</span>
          <p className="text-2xl font-serif text-emerald-600">{stats?.total_tests_passed || 0}</p>
        </Card>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search projects..."
            className="w-full bg-white text-sm text-zinc-900 pl-10 pr-4 py-2.5 rounded-full border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs"
          />
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto text-xs font-sans">
          <button
            type="button"
            onClick={() => setStatusFilter('')}
            className={`px-3.5 py-1.5 rounded-full border transition-colors cursor-pointer ${
              statusFilter === ''
                ? 'bg-zinc-900 text-white border-zinc-900'
                : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50'
            }`}
          >
            All Status
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('in_progress')}
            className={`px-3.5 py-1.5 rounded-full border transition-colors cursor-pointer ${
              statusFilter === 'in_progress'
                ? 'bg-zinc-900 text-white border-zinc-900'
                : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50'
            }`}
          >
            In Progress
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('completed')}
            className={`px-3.5 py-1.5 rounded-full border transition-colors cursor-pointer ${
              statusFilter === 'completed'
                ? 'bg-zinc-900 text-white border-zinc-900'
                : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50'
            }`}
          >
            Completed
          </button>
        </div>
      </div>

      {/* 4. Projects Grid */}
      {isLoading ? (
        <div className="text-center py-20">
          <div className="w-10 h-10 border-4 border-zinc-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="font-sans text-xs text-zinc-500">Loading projects...</p>
        </div>
      ) : projects.length === 0 ? (
        <Card className="text-center py-16 px-6 space-y-4 max-w-lg mx-auto bg-white">
          <div className="w-14 h-14 rounded-full bg-zinc-50 border border-zinc-200 flex items-center justify-center text-zinc-700 mx-auto shadow-inner">
            <FolderCode className="w-7 h-7 text-indigo-600" />
          </div>
          <h3 className="font-serif text-2xl text-zinc-900">No Projects Found</h3>
          <p className="text-xs text-zinc-500 font-sans leading-relaxed">
            {searchTerm || statusFilter
              ? 'No projects matched your search criteria. Clear filters to see all projects.'
              : 'You have not created any projects yet. Start by turning a business idea or requirement into production code!'}
          </p>
          <Button
            variant="accent"
            size="md"
            icon={<PlusCircle className="w-4 h-4" />}
            onClick={() => setIsCreateModalOpen(true)}
          >
            Create First Project
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((proj) => (
            <Card key={proj.id} hover className="flex flex-col justify-between p-6 space-y-6 bg-white/90">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant={proj.status === 'completed' ? 'success' : 'lime'} size="sm">
                    {getStageDisplay(proj.current_stage)}
                  </Badge>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setRenameModalProject(proj);
                        setNewName(proj.name);
                      }}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
                      title="Rename project"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteModalProject(proj)}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Delete project"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="font-serif text-xl text-zinc-900 line-clamp-1">{proj.name}</h3>
                  <p className="text-xs text-zinc-500 line-clamp-2 mt-1 font-sans leading-relaxed">
                    {proj.business_idea}
                  </p>
                </div>

                <div className="pt-2 flex flex-wrap gap-2 text-[11px] font-sans">
                  <span className="bg-zinc-50 px-2.5 py-1 rounded-full border border-zinc-200 text-zinc-700">
                    {proj.preferred_tech_stack}
                  </span>
                  <span className="bg-zinc-50 px-2.5 py-1 rounded-full border border-zinc-200 text-zinc-700">
                    {proj.file_count || 0} Files
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-100 flex items-center justify-between">
                <span className="text-[11px] font-sans text-zinc-400">
                  {new Date(proj.updated_at).toLocaleDateString()}
                </span>
                <Button
                  size="sm"
                  variant="primary"
                  icon={<ArrowRight className="w-3.5 h-3.5" />}
                  onClick={() => handleStageRouting(proj)}
                >
                  Continue Project
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* New Project Creation Modal */}
      <NewProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateProject}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteModalProject}
        onClose={() => setDeleteModalProject(null)}
        title="Delete Project"
        description="Are you sure you want to permanently delete this project and all its generated files?"
        maxWidth="md"
      >
        <div className="space-y-4 pt-2 font-sans">
          <p className="text-xs text-zinc-700 bg-rose-50 p-3 rounded-xl border border-rose-200">
            Project: <strong>{deleteModalProject?.name}</strong>
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" size="sm" onClick={() => setDeleteModalProject(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              isLoading={deleteMutation.isPending}
              onClick={() => deleteModalProject && deleteMutation.mutate(deleteModalProject.id)}
            >
              Confirm Delete
            </Button>
          </div>
        </div>
      </Modal>

      {/* Rename Modal */}
      <Modal
        isOpen={!!renameModalProject}
        onClose={() => setRenameModalProject(null)}
        title="Rename Project"
        maxWidth="md"
      >
        <div className="space-y-4 pt-2 font-sans">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="saas-input"
            placeholder="Enter new project name..."
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" size="sm" onClick={() => setRenameModalProject(null)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={renameMutation.isPending}
              onClick={() => {
                if (renameModalProject && newName.trim()) {
                  renameMutation.mutate({ id: renameModalProject.id, name: newName.trim() });
                }
              }}
            >
              Save Name
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
