import { useState, useEffect } from 'react';
import Slider from "react-slick";
import { Repository, getRepository } from '../../utils/github';
import { PROJECTS } from '../../utils/projects';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './GitHubProjects.css';

const GitHubProjects = () => {
  const [projects, setProjects] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [isStart, setIsStart] = useState(true);
  const [isEnd, setIsEnd] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const sliderSettings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    swipeToSlide: true,  // Enable smooth touch sliding
    touchThreshold: 10,  // Make touch more responsive
    useCSS: true,       // Enable CSS transitions
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2.2,  // Show partial third card
          slidesToScroll: 1
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,    // Show two full cards on tablet
          slidesToScroll: 1
        }
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1.2,  // Show partial second card on mobile
          slidesToScroll: 1,
          arrows: true,
          dots: true
        }
      }
    ],
    beforeChange: (current: number, next: number) => {
      setCurrentSlide(next);
      setIsStart(next === 0);
    },
    afterChange: (current: number) => {
      const totalSlides = projects.length;
      const slidesToShow = window.innerWidth <= 640 ? 1.2 : window.innerWidth <= 1024 ? 2.2 : 3;
      setIsEnd(current >= totalSlides - slidesToShow);
      setCurrentSlide(current);
    }
  };

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
      <h2 className="section-title">Coding Projects</h2>
      <div className={`slider-container ${isStart ? 'at-start' : ''} ${isEnd ? 'at-end' : ''} ${!isStart && !isEnd ? 'in-middle' : ''}`}>
        <Slider {...sliderSettings} className="projects-slider">
          {projects.map((project) => (
            <div key={project.name} className="slider-item">
              <ProjectCard project={project} />
            </div>
          ))}
        </Slider>
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
              img.src = '/assets/img/github-placeholder.png';  // Update path
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
