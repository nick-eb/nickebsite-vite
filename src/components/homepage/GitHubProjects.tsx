import React, { useState, useEffect, type CSSProperties } from 'react';
import { Slider } from '../shared/Slider';
import { ProjectCard as SharedProjectCard } from '../shared/Card';
import { Repository, getRepository } from '../../utils/github';
import { PROJECTS } from '../../utils/projects';
import useScrollReveal from '../../hooks/useScrollReveal';
import './GitHubProjects.css';

const GitHubProjects: React.FC = () => {
  useScrollReveal();

  const [validProjects, setValidProjects] = useState<{ config: typeof PROJECTS[number], data: Repository }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      // Get unique repos to fetch
      const uniqueRepos = Array.from(new Set(PROJECTS.map(p => `${p.owner}/${p.repo}`)))
        .map(str => {
          const parts = str.split('/');
          return { owner: parts[0], repo: parts[1] };
        })
        .filter((item): item is { owner: string; repo: string } => !!item.repo);

      const repoResults = await Promise.all(
        uniqueRepos.map(({ owner, repo }) => getRepository(owner, repo))
      );

      // Create a map of repo name to data
      const repoMap = new Map<string, Repository>();
      repoResults.forEach(repo => {
        if (repo) {
          repoMap.set(repo.name.toLowerCase(), repo);
        }
      });

      // Construct the list based on PROJECTS config order
      const orderedProjects = PROJECTS.map(config => {
        const data = repoMap.get(config.repo.toLowerCase());
        return data ? { config, data } : null;
      }).filter((item): item is { config: typeof PROJECTS[number], data: Repository } => item !== null);

      setValidProjects(orderedProjects);
      setLoading(false);
    };

    fetchProjects();
  }, []);

  // Check for loading state
  if (loading) {
    return <div>Loading GitHub projects...</div>;
  }

  return (
    <section className="github-projects">
      <h2 className="section-title reveal reveal-fade-up">Projects</h2>

      <Slider className="projects-slider" label="Projects carousel">
        {validProjects.map(({ config, data }, index) => (
          <div
            key={`${config.repo}-${index}`}
            className="slider-item reveal reveal-stagger"
            style={{ '--delay': `${index * 0.06}s` } as CSSProperties}
          >
            <SharedProjectCard
              href={config.customUrl || data.html_url}
              name={config.customTitle || data.name}
              description={config.customDescription || data.description || ''}
              language={config.customLanguage || data.language || undefined}
              languageColor={config.customLanguageColor || data.languageColor || undefined}
              stargazers_count={data.stargazers_count}
              hideStars={config.hideStars}
              image={config.customImage || data.social_preview_url}
              homepage={data.homepage || undefined}
            />
          </div>
        ))}
      </Slider>
    </section>
  );
};

export default React.memo(GitHubProjects);
