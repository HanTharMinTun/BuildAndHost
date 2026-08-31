// Authentication types and interfaces

export interface User {
  id: string;
  email: string;
  username: string;
  full_name?: string;
  created_at?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  full_name?: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: {
    id: string;
    email: string;
    username: string;
  };
}

export interface RegisterResponse {
  id: string;
  email: string;
  username: string;
  full_name?: string;
  created_at: string;
}

export interface UploadInfo {
  id: string;
  filename: string;
  file_type?: string;
  file_size: number;
  created_at: string;
}

export interface DeploymentInfo {
  id: string;
  subdomain: string;
  domain: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  status: string;
  created_at: string;
  updated_at: string;
  // Enhanced MVP fields
  prompt?: string;  // Latest/creation prompt text
  attachments?: UploadInfo[];  // Files attached to this project
  deployment_url?: string;  // Full deployment URL if deployed
  deployment_status?: string;  // Deployment status
  deployment_info?: DeploymentInfo;  // Full deployment details
}

export interface ProjectCreate {
  name: string;
  description?: string;
}

export interface ProjectUpdate {
  name?: string;
  description?: string;
}

export interface GeneratedWebsite {
  id: string;
  project_id: string;
  prompt_id?: string;
  user_id: string;
  website_json: Record<string, any>;
  version: number;
  created_at: string;
}

export interface WebsiteCreate {
  project_id: string;
  prompt_id?: string;
  website_json: Record<string, any>;
  version: number;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterRequest) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

export interface Deployment {
  id: string;
  website_id: string;
  user_id: string;
  subdomain: string;
  domain: string;
  database_name: string;
  port: number;
  systemd_service: string;
  backend_path: string;
  status: 'DEPLOYING' | 'RUNNING' | 'FAILED';
  error_message?: string;
  created_at: string;
  updated_at: string;
}

export interface DeploymentCreate {
  subdomain: string;
}

export interface DeploymentLog {
  id: string;
  deployment_id: string;
  level: string;
  message: string;
  created_at: string;
}
