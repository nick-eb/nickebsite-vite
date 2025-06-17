import React, { useState, useEffect } from 'react';
import { Slider } from '../shared/Slider';
import { ProjectCard as SharedProjectCard } from '../shared/Card';
import { Repository, getRepository } from '../../utils/github';
import { PROJECTS } from '../../utils/projects';
import { useSliderDrag } from '../../hooks/useSliderDrag';
import './GitHubProjects.css';

const GitHubProjects: React.FC = () => {
  const [projects, setProjects] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [isStart, setIsStart] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

  // Initialize slider drag functionality
  const {
    sliderRef,
    handleDragStart: sliderDragStart,
    handleDrag: sliderDrag,
    handleDragEnd: sliderDragEnd
  } = useSliderDrag({
    enabled: true,
    smoothScrolling: true,
    scrollMultiplier: 1.2
  });

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

  const handleSlideChange = (isStartSlide: boolean, isEndSlide: boolean, _current: number) => {
    setIsStart(isStartSlide);
    setIsEnd(isEndSlide);
  };

  if (loading) {
    return <div>Loading GitHub projects...</div>;
  }

  return (
    <section className="github-projects">
      <h2 className="section-title">Coding Projects</h2>
      <div
        ref={sliderRef}
        className={`slider-container github-projects-slider ${isStart ? 'at-start' : ''} ${isEnd ? 'at-end' : ''} ${!isStart && !isEnd ? 'in-middle' : ''}`}
      >
        <Slider
          className="projects-slider"
          totalSlides={projects.length}
          onSlideChange={handleSlideChange}
          settings={{ infinite: false }}  // Disable infinite scrolling for GitHub projects
        >
          {projects.map((project) => {
            const customData = PROJECTS.find(p => p.repo === project.name);
            
            return (
              <div key={project.name} className="slider-item">
                <SharedProjectCard
                  href={project.html_url}
                  name={project.name}
                  description={customData?.customDescription || project.description || ''}
                  language={project.language || undefined}
                  languageColor={project.languageColor || undefined}
                  stargazers_count={project.stargazers_count}
                  image={customData?.customImage || project.social_preview_url}
                  homepage={project.homepage || undefined}
                  onDragStart={sliderDragStart}
                  onDrag={sliderDrag}
                  onDragEnd={sliderDragEnd}
                />
              </div>
            );
          })}
        </Slider>
      </div>
    </section>
  );
};

export default React.memo(GitHubProjects);
