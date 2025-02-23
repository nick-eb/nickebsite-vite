import { Octokit } from 'octokit';

const octokit = new Octokit();

const CACHE_KEY = 'github-repos-cache';
const CACHE_DURATION = 1000 * 60 * 60 * 4; // 4 hours in milliseconds

export interface Repository {
  name: string;
  description: string;
  html_url: string;
  stargazers_count: number;
  language: string | null;
  languageColor: string | null;
  homepage: string | null;
  openGraphImageUrl: string;
  social_preview_url: string;  // Add this field
}

export async function getRepository(owner: string, repo: string): Promise<Repository | null> {
  const cacheKey = `${CACHE_KEY}-${owner}-${repo}`;
  
  // Check cache first
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp < CACHE_DURATION) {
      console.log(`Using cached data for ${owner}/${repo}`);
      return data;
    }
    console.log(`Cache expired for ${owner}/${repo}, fetching fresh data`);
  }

  try {
    const [repoData, languagesData] = await Promise.all([
      octokit.rest.repos.get({ owner, repo }),
      octokit.rest.repos.listLanguages({ owner, repo })
    ]);

    const primaryLanguage = Object.keys(languagesData.data)[0];
    const socialPreviewUrl = `https://opengraph.githubassets.com/${Date.now()}/${owner}/${repo}`;

    const repositoryData: Repository = {
      name: repoData.data.name,
      description: repoData.data.description || '',
      html_url: repoData.data.html_url,
      stargazers_count: repoData.data.stargazers_count,
      language: primaryLanguage || null,
      languageColor: getLanguageColor(primaryLanguage),
      homepage: repoData.data.homepage,
      openGraphImageUrl: socialPreviewUrl,
      social_preview_url: socialPreviewUrl
    };

    // Store in cache with timestamp
    localStorage.setItem(cacheKey, JSON.stringify({
      data: repositoryData,
      timestamp: Date.now()
    }));

    return repositoryData;
  } catch (error) {
    console.error(`Failed to fetch repository ${owner}/${repo}:`, error);
    
    // Try to use expired cache data on error
    const expired = localStorage.getItem(cacheKey);
    if (expired) {
      console.log(`Using expired cache for ${owner}/${repo} due to fetch error`);
      return JSON.parse(expired).data;
    }
    
    return null;
  }
}

// Common programming language colors
const LANGUAGE_COLORS: Record<string, string> = {
  Python: '#3572A5',
  JavaScript: '#f1e05a',
  TypeScript: '#2b7489',
  Java: '#b07219',
  Haxe: '#df7900',
  // Add more as needed
};

function getLanguageColor(language: string | null): string | null {
  return language ? LANGUAGE_COLORS[language] || '#6e7681' : null;
}
