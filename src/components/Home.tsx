import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useNav } from '../utils/NavContext';
import Intro from './homepage/Intro';
import BlogPreview from './homepage/BlogPreview';
import Contact from './homepage/Contact';
import GitHubProjects from './homepage/GitHubProjects';

const Home = () => {
  const { setActiveSection } = useNav();
  const initialScroll = useRef(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['intro', 'projects', 'blog', 'contact'];
      const scrollPosition = window.scrollY + (window.innerHeight / 4);

      // Find the last section that has been scrolled past
      let currentSection = sections[0];
      
      sections.forEach(id => {
        const element = document.getElementById(id);
        if (element && scrollPosition >= element.offsetTop) {
          currentSection = id;
        }
      });

      setActiveSection(currentSection);
    };

    // Attach scroll listener
    window.addEventListener('scroll', handleScroll);
    
    // Initial check
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [setActiveSection]);

  useEffect(() => {
    // Check if we have a section to scroll to
    if (location.state?.scrollTo && !initialScroll.current) {
      const element = document.getElementById(location.state.scrollTo);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        initialScroll.current = true;
      }
    }
  }, [location]);

  return (
    <main className="home-container">
      <div className="content-wrapper">
        <section id="intro" className="section-container">
          <Intro />
        </section>
        <section id="projects" className="section-container">
          <GitHubProjects />
        </section>
        <section id="blog" className="section-container">
          <BlogPreview />
        </section>
        <section id="contact" className="section-container">
          <Contact />
        </section>
      </div>
    </main>
  );
};

export default Home;
