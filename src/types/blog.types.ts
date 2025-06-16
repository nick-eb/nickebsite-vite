import React from 'react';

export interface BaseBlogPost {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  thumbnail?: string;
}

export interface MDXPost extends BaseBlogPost {
  content: React.ComponentType;
  type: 'mdx';
}

export interface MarkdownPost extends BaseBlogPost {
  content: string;
  type: 'md';
}

export type BlogPost = MDXPost | MarkdownPost;

export interface BlogPostMetadata {
  title?: string;
  date?: string;
  excerpt?: string;
  thumbnail?: string;
}

export interface BlogLoadError extends Error {
  slug?: string;
  path?: string;
  type: 'parse' | 'load' | 'compile';
  cause?: unknown;
}

export interface BlogPostSearchResult {
  post: BlogPost;
  matchScore: number;
  matchedFields: string[];
}

export interface BlogPostFilters {
  dateFrom?: string;
  dateTo?: string;
  searchTerm?: string;
  type?: 'mdx' | 'md' | 'all';
}

export interface BlogPostSortOptions {
  field: 'date' | 'title' | 'slug';
  direction: 'asc' | 'desc';
}