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

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
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
