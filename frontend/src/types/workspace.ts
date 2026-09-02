export interface GeneratedFile {
  id: string;
  project_id: string;
  path: string;
  filename: string;
  extension: string;
  language: string;
  file_type: 'frontend' | 'backend' | 'database' | 'config' | 'test' | 'docker' | 'docs' | string;
  content: string;
  size_bytes: number;
  is_user_edited: boolean;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface FileTreeNode {
  id: string;
  name: string;
  path: string;
  type: 'file' | 'folder';
  extension?: string;
  language?: string;
  file_type?: string;
  is_user_edited?: boolean;
  size_bytes?: number;
  children?: FileTreeNode[];
}
