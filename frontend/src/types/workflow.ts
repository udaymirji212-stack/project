export interface FunctionalRequirement {
  id: string;
  title: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
  category: string;
}

export interface NonFunctionalRequirement {
  id: string;
  title: string;
  description: string;
  category: string;
}

export interface UserRole {
  id: string;
  role_name: string;
  description: string;
  permissions: string[];
}

export interface UserStory {
  id: string;
  as_a: string;
  i_want: string;
  so_that: string;
  acceptance_criteria: string[];
}

export interface RisksAssumptions {
  risks: string[];
  assumptions: string[];
  missing_info: string[];
}

export interface RequirementAnalysis {
  id: string;
  project_id: string;
  functional_requirements: FunctionalRequirement[];
  non_functional_requirements: NonFunctionalRequirement[];
  user_roles: UserRole[];
  user_stories: UserStory[];
  risks_assumptions: RisksAssumptions;
  is_approved: boolean;
  approved_at?: string;
  version: string;
  created_at: string;
  updated_at: string;
}

export interface SRSDocument {
  id: string;
  project_id: string;
  title: string;
  version: string;
  version_number: number;
  introduction?: string;
  purpose?: string;
  scope?: string;
  user_classes?: string;
  functional_requirements_text?: string;
  non_functional_requirements_text?: string;
  external_interfaces?: string;
  data_requirements?: string;
  security_requirements?: string;
  constraints?: string;
  acceptance_criteria?: string;
  full_markdown: string;
  changelog?: string;
  created_at: string;
  updated_at: string;
}

export interface ArchitectureComponent {
  id: string;
  name: string;
  type: string;
  layer: string;
  tech: string;
  responsibilities: string[];
  data_flow_in: string[];
  data_flow_out: string[];
}

export interface DataFlowItem {
  from_component: string;
  to_component: string;
  protocol: string;
  payload: string;
  description: string;
}

export type DataFlow = DataFlowItem;

export interface Spatial3DNode {
  id: string;
  label: string;
  category: string;
  position: [number, number, number];
  color: string;
}

export interface ArchitectureDesign {
  id: string;
  project_id: string;
  overview?: string;
  pattern: string;
  nodes: any[];
  edges: any[];
  components: ArchitectureComponent[];
  data_flows: DataFlowItem[];
  spatial_3d_nodes: Spatial3DNode[];
  is_approved: boolean;
  created_at: string;
  updated_at: string;
}

export interface EntityField {
  name: string;
  type: string;
  is_primary: boolean;
  is_nullable: boolean;
  is_unique: boolean;
  default?: string | null;
  description?: string;
}

export interface EntityRelation {
  target_entity: string;
  type: string;
  foreign_key?: string;
  on_delete: string;
}

export interface EntityItem {
  name: string;
  description: string;
  fields: EntityField[];
  indexes: string[];
  relations: EntityRelation[];
}

export interface DatabaseDesign {
  id: string;
  project_id: string;
  database_type: string;
  entities: EntityItem[];
  relationships: any[];
  indexes_and_constraints: any[];
  sql_schema_ddl?: string;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
}

export interface ApiSpecification {
  id: string;
  project_id: string;
  tag: string;
  method: string;
  path: string;
  summary: string;
  description?: string;
  auth_required: boolean;
  required_role: string;
  request_headers: any[];
  query_params: any[];
  path_params: any[];
  request_body_schema: any;
  response_success_schema: any;
  response_error_schemas: any[];
  is_approved: boolean;
  created_at: string;
  updated_at: string;
}

export interface ReviewIssue {
  id: string;
  category: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  file_path: string;
  line_number?: number;
  title: string;
  description: string;
  recommendation: string;
  suggested_code_replacement?: string;
  is_applied: boolean;
}

export interface CodeReview {
  id: string;
  project_id: string;
  summary: string;
  score: number;
  issues: ReviewIssue[];
  total_issues: number;
  critical_count: number;
  high_count: number;
  medium_count: number;
  low_count: number;
  created_at: string;
}

export interface TestCaseItem {
  name: string;
  suite: string;
  status: 'PASSED' | 'FAILED' | 'SKIPPED';
  duration_ms: number;
  error_message?: string;
  stdout?: string;
}

export interface TestRun {
  id: string;
  project_id: string;
  test_type: string;
  passed_count: number;
  failed_count: number;
  total_count: number;
  execution_time_ms: number;
  test_cases: TestCaseItem[];
  raw_output?: string;
  created_at: string;
}

export interface DocumentationItem {
  id: string;
  project_id: string;
  doc_type: string;
  title: string;
  order: number;
  markdown_content: string;
  created_at: string;
  updated_at: string;
}
