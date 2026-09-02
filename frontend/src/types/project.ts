export interface Project {
  id: string;
  owner_id: string;
  name: string;
  description?: string;
  business_idea: string;
  target_users?: string;
  main_problem?: string;
  expected_features?: string;
  preferred_tech_stack: string;
  constraints?: string;
  current_stage: WorkflowStage;
  status: 'in_progress' | 'completed' | 'archived';
  file_count: number;
  test_count: number;
  issue_count: number;
  metadata_info?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export type WorkflowStage =
  | 'requirements'
  | 'srs'
  | 'architecture'
  | 'database_api'
  | 'code_generation'
  | 'workspace'
  | 'review_testing'
  | 'documentation'
  | 'export'
  | 'completed';

export interface DashboardStats {
  total_projects: number;
  active_projects: number;
  completed_projects: number;
  total_generated_files: number;
  total_reviews_run: number;
  total_tests_passed: number;
  current_user_name: string;
}
