import { useState, useEffect } from 'react';
import { Repository, getRepository } from '../../utils/github';
import { PROJECTS } from '../../utils/projects';
import './GitHubProjects.css';

const GitHubProjects = () => {
  const [projects, setProjects] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      const repoData = await Promise.all(
        PROJECTS.map(({ owner, repo }) => getRepository(owner, repo))
      );
      setProjects(repoData.filter((repo): repo is Repository => repo !== null));
      setLoading(false);
    };

    fetchProjects();
  }, []);

  if (loading) {
    return <div>Loading GitHub projects...</div>;
  }

  return (
    <section className="github-projects">
      <h2 className="section-title">My Coding Projects</h2>
      <div className="projects-grid">
        {projects.map((project) => (
          <ProjectCard key={project.name} project={project} />
        ))}
      </div>
    </section>
  );
};

const ProjectCard = ({ project }: { project: Repository }) => {
  const customData = PROJECTS.find(p => p.repo === project.name);
  
  return (
    <a
      href={project.html_url}
      target="_blank"
      rel="noopener noreferrer"
      className="project-card"
    >
      <div className="project-image">
        <img 
          src={customData?.customImage || project.social_preview_url}
          alt={`${project.name} preview`}
          loading="lazy"
          onError={(e) => {
            const img = e.currentTarget;
            if (img.src !== project.openGraphImageUrl) {
              img.src = project.openGraphImageUrl;
            } else {
              img.src = '/nickebsite-vite/assets/img/github-placeholder.png';
            }
          }}
        />
      </div>
      <div className="project-content">
        <h3>{project.name}</h3>
        <p>{customData?.customDescription || project.description}</p>
        <div className="project-meta">
          {project.language && (
            <span 
              className="language" 
              style={{ '--lang-color': project.languageColor } as React.CSSProperties}
            >
              <span className="lang-dot"></span>
              {project.language}
            </span>
          )}
          <span className="stars">⭐ {project.stargazers_count}</span>
        </div>
      </div>
      {project.homepage && (
        <a 
          href={project.homepage}
          target="_blank"
          rel="noopener noreferrer"
          className="demo-link"
        >
          View Demo →
        </a>
      )}
    </a>
  );
};

export default GitHubProjects;
