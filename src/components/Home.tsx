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

  // Only set initial section to intro when first mounting AND we're at the top of the page
  useEffect(() => {
    if (window.scrollY === 0) {
      setActiveSection('intro');
    }
  }, []); // Run only once on mount

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['intro', 'projects', 'blog', 'contact'];
      const scrollPosition = window.scrollY + (window.innerHeight / 4);
      
      // Check if we're at the bottom of the page
      const isAtBottom = window.innerHeight + window.pageYOffset >= document.documentElement.scrollHeight - 100;

      if (isAtBottom) {
        setActiveSection('contact');
        return;
      }

      // Find the last section that has been scrolled past
      let currentSection = 'intro';
      
      sections.forEach(id => {
        const element = document.getElementById(id);
        if (element && scrollPosition >= element.offsetTop) {
          currentSection = id;
        }
      });

      setActiveSection(currentSection);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial scroll position

    return () => window.removeEventListener('scroll', handleScroll);
  }, [setActiveSection]);

  useEffect(() => {
    if (location.state?.scrollTo && !initialScroll.current) {
      const timeoutId = setTimeout(() => {
        const element = document.getElementById(location.state.scrollTo);
        if (element) {
          const headerOffset = 60;
          const offsetPosition = element.offsetTop - headerOffset;
          
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
          setActiveSection(location.state.scrollTo);
        }
        initialScroll.current = true;
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [location, setActiveSection]);

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
