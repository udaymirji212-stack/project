import { apiClient } from './api';
import type {
  RequirementAnalysis,
  SRSDocument,
  ArchitectureDesign,
  DatabaseDesign,
  ApiSpecification,
  CodeReview,
  TestRun,
  DocumentationItem,
} from '../types/workflow';
import type { GeneratedFile, FileTreeNode } from '../types/workspace';

export const workflowApi = {
  // Requirements
  getRequirements: (projectId: string) =>
    apiClient.request<RequirementAnalysis>(`/projects/${projectId}/requirements`),

  generateRequirements: (projectId: string) =>
    apiClient.request<RequirementAnalysis>(`/projects/${projectId}/requirements/generate`, {
      method: 'POST',
    }),

  updateRequirements: (projectId: string, data: Partial<RequirementAnalysis>) =>
    apiClient.request<RequirementAnalysis>(`/projects/${projectId}/requirements`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // SRS
  getSRS: (projectId: string) =>
    apiClient.request<SRSDocument>(`/projects/${projectId}/srs`),

  generateSRS: (projectId: string) =>
    apiClient.request<SRSDocument>(`/projects/${projectId}/srs/generate`, {
      method: 'POST',
    }),

  updateSRS: (projectId: string, data: Partial<SRSDocument>) =>
    apiClient.request<SRSDocument>(`/projects/${projectId}/srs`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Architecture
  getArchitecture: (projectId: string) =>
    apiClient.request<ArchitectureDesign>(`/projects/${projectId}/architecture`),

  generateArchitecture: (projectId: string) =>
    apiClient.request<ArchitectureDesign>(`/projects/${projectId}/architecture/generate`, {
      method: 'POST',
    }),

  updateArchitecture: (projectId: string, data: Partial<ArchitectureDesign>) =>
    apiClient.request<ArchitectureDesign>(`/projects/${projectId}/architecture`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Database Design
  getDatabaseDesign: (projectId: string) =>
    apiClient.request<DatabaseDesign>(`/projects/${projectId}/database`),

  generateDatabaseDesign: (projectId: string) =>
    apiClient.request<DatabaseDesign>(`/projects/${projectId}/database/generate`, {
      method: 'POST',
    }),

  updateDatabaseDesign: (projectId: string, data: Partial<DatabaseDesign>) =>
    apiClient.request<DatabaseDesign>(`/projects/${projectId}/database`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // API Design
  getApiEndpoints: (projectId: string) =>
    apiClient.request<ApiSpecification[]>(`/projects/${projectId}/api-design`),

  createApiEndpoint: (projectId: string, data: Partial<ApiSpecification>) =>
    apiClient.request<ApiSpecification>(`/projects/${projectId}/api-design`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateApiEndpoint: (projectId: string, endpointId: string, data: Partial<ApiSpecification>) =>
    apiClient.request<ApiSpecification>(`/projects/${projectId}/api-design/${endpointId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteApiEndpoint: (projectId: string, endpointId: string) =>
    apiClient.request<void>(`/projects/${projectId}/api-design/${endpointId}`, {
      method: 'DELETE',
    }),

  // Code Generation
  generateCode: (projectId: string, options?: { force_regenerate?: boolean }) =>
    apiClient.request<GeneratedFile[]>(`/projects/${projectId}/code-generation/generate`, {
      method: 'POST',
      body: JSON.stringify(options || { force_regenerate: false }),
    }),

  // Workspace
  getWorkspaceTree: (projectId: string) =>
    apiClient.request<FileTreeNode[]>(`/projects/${projectId}/workspace/tree`),

  getWorkspaceFiles: (projectId: string) =>
    apiClient.request<GeneratedFile[]>(`/projects/${projectId}/workspace/files`),

  getWorkspaceFile: (projectId: string, fileId: string) =>
    apiClient.request<GeneratedFile>(`/projects/${projectId}/workspace/files/${fileId}`),

  saveWorkspaceFile: (projectId: string, fileId: string, content: string) =>
    apiClient.request<GeneratedFile>(`/projects/${projectId}/workspace/files/${fileId}`, {
      method: 'PUT',
      body: JSON.stringify({ content }),
    }),

  createWorkspaceFile: (projectId: string, data: { path: string; content: string; file_type?: string }) =>
    apiClient.request<GeneratedFile>(`/projects/${projectId}/workspace/files`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  deleteWorkspaceFile: (projectId: string, fileId: string) =>
    apiClient.request<void>(`/projects/${projectId}/workspace/files/${fileId}`, {
      method: 'DELETE',
    }),

  // Reviews & Testing
  getLatestReview: (projectId: string) =>
    apiClient.request<CodeReview | null>(`/projects/${projectId}/reviews`),

  runReview: (projectId: string) =>
    apiClient.request<CodeReview>(`/projects/${projectId}/reviews/run`, {
      method: 'POST',
    }),

  applyReviewFix: (projectId: string, issueId: string) =>
    apiClient.request<CodeReview>(`/projects/${projectId}/reviews/apply-fix`, {
      method: 'POST',
      body: JSON.stringify({ issue_id: issueId }),
    }),

  getLatestTestRun: (projectId: string) =>
    apiClient.request<TestRun | null>(`/projects/${projectId}/reviews/tests`),

  runTests: (projectId: string) =>
    apiClient.request<TestRun>(`/projects/${projectId}/reviews/tests/run`, {
      method: 'POST',
    }),

  // Documentation
  getDocumentation: (projectId: string) =>
    apiClient.request<DocumentationItem[]>(`/projects/${projectId}/docs`),

  generateDocumentation: (projectId: string) =>
    apiClient.request<DocumentationItem[]>(`/projects/${projectId}/docs/generate`, {
      method: 'POST',
    }),

  updateDocumentation: (projectId: string, docId: string, markdown_content: string) =>
    apiClient.request<DocumentationItem>(`/projects/${projectId}/docs/${docId}`, {
      method: 'PUT',
      body: JSON.stringify({ markdown_content }),
    }),

  // Ergonomic aliases matching stage components
  getDatabase: (projectId: string) =>
    workflowApi.getDatabaseDesign(projectId),

  generateDatabase: (projectId: string) =>
    workflowApi.generateDatabaseDesign(projectId),

  updateDatabase: (projectId: string, data: Partial<DatabaseDesign>) =>
    workflowApi.updateDatabaseDesign(projectId, data),

  getApiSpecs: (projectId: string) =>
    workflowApi.getApiEndpoints(projectId),

  listFiles: (projectId: string) =>
    workflowApi.getWorkspaceFiles(projectId),

  getFileTree: (projectId: string) =>
    workflowApi.getWorkspaceTree(projectId),

  updateFile: (projectId: string, fileId: string, content: string) =>
    workflowApi.saveWorkspaceFile(projectId, fileId, content),

  getReview: (projectId: string) =>
    workflowApi.getLatestReview(projectId),

  getTestRun: (projectId: string) =>
    workflowApi.getLatestTestRun(projectId),

  downloadZip: (projectId: string, projectName: string) => {
    const filename = `${projectName.toLowerCase().replace(/\s+/g, '_')}_source.zip`;
    return apiClient.download(`/projects/${projectId}/export/zip`, filename);
  },
};

