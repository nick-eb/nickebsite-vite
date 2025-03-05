import { useState, useEffect } from 'react';
import Slider from "react-slick";
import { Repository, getRepository } from '../../utils/github';
import { PROJECTS } from '../../utils/projects';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './GitHubProjects.css';
import '../../styles/CardStyles.css';

const GitHubProjects = () => {
  const [projects, setProjects] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [isStart, setIsStart] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

  const sliderSettings = {
    dots: true,
    infinite: false,
    speed: 300,               // Faster transition
    slidesToShow: 3,
    slidesToScroll: 1,        // Always scroll one at a time
    swipe: true,
    swipeToSlide: false,      // Disable free-form swiping
    draggable: true,     // Enable mouse dragging
    accessibility: true, // Enable accessibility
    touchThreshold: 5,        // Make touch less sensitive
    touchMove: true,     // Enable touch movement
    useTransform: true,  // Use CSS3 transforms
    waitForAnimate: true,     // Wait for animation to finish
    useCSS: true,       // Enable CSS transitions
    centerMode: true,    // Enable center mode
    centerPadding: '0',  // No padding in center mode
    cssEase: 'cubic-bezier(0.4, 0, 0.2, 1)',  // Custom easing for snappier feel
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          centerMode: false
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1.5,
          slidesToScroll: 1,
          centerMode: false,
          centerPadding: '0'
        }
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          centerMode: false,
          centerPadding: '0'
        }
      }
    ],
    beforeChange: (_current: number, next: number) => {
      setIsStart(next === 0);
    },
    afterChange: (current: number) => {
      const totalSlides = projects.length;
      const slidesToShow = window.innerWidth <= 640 ? 1 : window.innerWidth <= 1024 ? 2 : 3;
      setIsEnd(current >= totalSlides - slidesToShow);
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
      className="card"
      draggable="false"  // Add this attribute
    >
      <div className="card-image">
        <img 
          src={customData?.customImage || project.social_preview_url}
          alt={`${project.name} preview`}
          loading="lazy"
          draggable="false"  // Add this attribute
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
      <div className="card-content">
        <h3 className="card-title">{project.name}</h3>
        <p className="card-description">{customData?.customDescription || project.description}</p>
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
