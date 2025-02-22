import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import Intro from './homepage/Intro';
import Services from './homepage/Services';
import Portfolio from './homepage/Portfolio';
import BlogPreview from './homepage/BlogPreview';
import Contact from './homepage/Contact';
import GitHubProjects from './homepage/GitHubProjects';


const Home = () => {
  const location = useLocation();
  const initialScroll = useRef(false);

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
    <main className="home-container flex flex-col gap-0"> {/* Removed gap completely */}
      <section id="intro">
        <Intro />
      </section>
      <section id="projects">
        <GitHubProjects />
      </section>
      <section id="blog">
        <BlogPreview />
      </section>
      <section id="contact">
        <Contact />
      </section>
    </main>
  );
};

export default Home;
