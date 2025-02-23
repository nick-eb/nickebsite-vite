import { useState, useEffect } from 'react';
import { Octokit } from 'octokit';
import './GitHubProjects.css';

// Featured repos configuration
const FEATURED_REPOS = [
  'hadobedo/FunkiniOS',
  'hadobedo/Myrient-Downloader-GUI',
  'bonello-nicholas/uni-library-management-java'
];

// Custom project data
const PROJECT_DATA: Record<string, { customImage: string; customDescription: string }> = {
  'hadobedo/FunkiniOS': {
    customImage: '/nickebsite-vite/assets/img/funkiniOS.png',
    customDescription: 'A port of Friday Night Funkin\' to iOS with various optimizations for wider device compatibility. Built using Haxe and Xcode.'
  },
  'hadobedo/Myrient-Downloader-GUI': {
    customImage: '/nickebsite-vite/assets/img/myrientgui.png',
    customDescription: 'A GUI application built with Python and PyQT for downloading ROMs and ISOs from the Myrient Archive.'
  }
};

// Initialize Octokit without token
const octokit = new Octokit();

// TypeScript interfaces
interface RepositoryResponse {
  repository: {
    name: string;
    description: string;
    url: string;
    stargazerCount: number;
    primaryLanguage: {
      name: string;
      color: string;
    } | null;
    homepageUrl: string | null;
    openGraphImageUrl: string;
  };
}

interface Repository {
  name: string;
  description: string;
  html_url: string;
  stargazers_count: number;
  language: string | null;
  languageColor: string | null;
  homepage: string | null;
  openGraphImageUrl: string;
}

// Add cache configuration
const CACHE_KEY = 'github-projects-cache';
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour in milliseconds

const GitHubProjects = () => {
  const [repos, setRepos] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRepos = async () => {
      try {
        // Check cache first
        const cachedData = localStorage.getItem(CACHE_KEY);
        if (cachedData) {
          const { data, timestamp } = JSON.parse(cachedData);
          
          // Check if cache is still valid
          if (Date.now() - timestamp < CACHE_DURATION) {
            setRepos(data);
            setLoading(false);
            return;
          }
        }

        // If no cache or expired, fetch from GitHub
        const repoPromises = FEATURED_REPOS.map(async (repoPath) => {
          const [owner, repo] = repoPath.split('/');
          const response = await octokit.graphql<RepositoryResponse>(`
            query {
              repository(owner: "${owner}", name: "${repo}") {
                name
                description
                url
                stargazerCount
                primaryLanguage {
                  name
                  color
                }
                homepageUrl
                openGraphImageUrl
              }
            }
          `);

          return {
            name: response.repository.name,
            description: response.repository.description,
            html_url: response.repository.url,
            stargazers_count: response.repository.stargazerCount,
            language: response.repository.primaryLanguage?.name ?? null,
            languageColor: response.repository.primaryLanguage?.color ?? null,
            homepage: response.repository.homepageUrl,
            openGraphImageUrl: response.repository.openGraphImageUrl
          };
        });

        const repoData = await Promise.all(repoPromises);
        
        // Update cache
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          data: repoData,
          timestamp: Date.now()
        }));

        setRepos(repoData);
      } catch (err) {
        // Try to use cached data even if expired when fetch fails
        const cachedData = localStorage.getItem(CACHE_KEY);
        if (cachedData) {
          const { data } = JSON.parse(cachedData);
          setRepos(data);
        } else {
          setError('Failed to load GitHub projects');
          console.error('GitHub API Error:', err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRepos();
  }, []);

  if (loading) return <div className="loading">Loading projects...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <section className="github-projects">
      <h2 className="section-title">My Coding Projects</h2>
      <div className="projects-grid">
        {repos.map((repo) => (
          <a
            key={repo.name}
            href={repo.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="project-card"
          >
            <div className="project-image">
              <img 
                src={PROJECT_DATA[`hadobedo/${repo.name}`]?.customImage || repo.openGraphImageUrl} 
                alt={`${repo.name} preview`}
                onError={(e) => {
                  e.currentTarget.src = '/nickebsite-vite/assets/img/github-placeholder.png';
                }}
              />
            </div>
            <div className="project-content">
              <h3>{repo.name}</h3>
              <p>{PROJECT_DATA[`hadobedo/${repo.name}`]?.customDescription || repo.description}</p>
              <div className="project-meta">
                {repo.language && (
                  <span 
                    className="language" 
                    style={{ '--lang-color': repo.languageColor } as React.CSSProperties}
                  >
                    <span className="lang-dot"></span>
                    {repo.language}
                  </span>
                )}
                <span className="stars">
                  ⭐ {repo.stargazers_count}
                </span>
              </div>
            </div>
            {repo.homepage && (
              <a 
                href={repo.homepage}
                target="_blank"
                rel="noopener noreferrer"
                className="demo-link"
              >
                View Demo →
              </a>
            )}
          </a>
        ))}
      </div>
    </section>
  );
};

export default GitHubProjects;
