import { useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useNav } from './NavContext';
import './Header.css';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { activeSection, setActiveSection } = useNav();
  const isAllPosts = location.pathname === '/blog';

  useEffect(() => {
    if (location.pathname !== '/') return;

    const observerCallback: IntersectionObserverCallback = (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, {
      rootMargin: '-50% 0px -50% 0px' // Only trigger when section is in middle half of viewport
    });

    const sections = document.querySelectorAll('section[id]');
    sections.forEach(section => observer.observe(section));

    return () => {
      sections.forEach(section => observer.unobserve(section));
    };
  }, [location.pathname, setActiveSection]);

  const scrollToSection = (sectionId: string) => {
    if (location.pathname !== '/') {
      navigate('/', { state: { scrollTo: sectionId } });
      return;
    }
    
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(sectionId);
    }
  };

  const handleBlogClick = (e: React.MouseEvent) => {
    if (location.pathname === '/blog') {
      e.preventDefault();
      window.scrollTo(0, 0);
    } else {
      window.scrollTo(0, 0);
    }
  };

  const navItems = [
    { id: 'intro', label: 'Home' },
    { id: 'projects', label: 'Projects' },
    { id: 'blog', label: 'Posts' },
    { id: 'contact', label: 'Contact' }
  ];

  return (
    <header className="site-header">
      <nav className="nav-container">
        <ul className="nav-links">
          {navItems.map(({ id, label }) => (
            <li key={id}>
              <button 
                onClick={() => scrollToSection(id)}
                className={`nav-button ${!isAllPosts && activeSection === id ? 'active' : ''}`}
              >
                {label}
              </button>
            </li>
          ))}
          <li className="all-posts-item">
            <Link 
              to="/blog" 
              className={`nav-button ${isAllPosts ? 'active' : ''}`}
              onClick={handleBlogClick}
            >
              All Posts
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;