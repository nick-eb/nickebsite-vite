export interface Repository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  languageColor?: string;
  stargazers_count: number;
  watchers_count: number;
  forks_count: number;
  open_issues_count: number;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  size: number;
  default_branch: string;
  topics: string[];
  visibility: 'public' | 'private';
  archived: boolean;
  disabled: boolean;
  fork: boolean;
  private: boolean;
  has_issues: boolean;
  has_projects: boolean;
  has_wiki: boolean;
  has_pages: boolean;
  has_downloads: boolean;
  license?: {
    key: string;
    name: string;
    spdx_id: string;
    url: string | null;
    node_id: string;
  } | null;
  social_preview_url?: string;
  openGraphImageUrl: string;
}

export interface GitHubApiError extends Error {
  status?: number;
  response?: {
    status: number;
    statusText: string;
    data?: any;
  };
}

export interface ProjectConfig {
  owner: string;
  repo: string;
  customImage?: string;
  customDescription?: string;
  priority?: number;
  featured?: boolean;
}

export interface GitHubRateLimit {
  limit: number;
  remaining: number;
  reset: number;
  used: number;
}

export interface GitHubSearchResponse {
  total_count: number;
  incomplete_results: boolean;
  items: Repository[];
}

export interface RepositoryFilters {
  language?: string;
  topics?: string[];
  minStars?: number;
  maxStars?: number;
  fork?: boolean;
  archived?: boolean;
  sort?: 'stars' | 'forks' | 'updated' | 'created';
  order?: 'asc' | 'desc';
}