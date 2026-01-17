import { useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useNav } from '../../utils/NavContext';
import './Header.css';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { activeSection, setActiveSection } = useNav();
  const isBlogPost = location.pathname.startsWith('/blog/');
  const isAllPosts = location.pathname === '/blog';
  const isZenith = location.pathname.startsWith('/zenith');

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
      rootMargin: '-50% 0px -50% 0px'
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

    // Special handling for 'intro' section
    if (sectionId === 'intro') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setActiveSection('intro');
      return;
    }

    const element = document.getElementById(sectionId);
    if (element) {
      const headerOffset = 60;
      const offsetPosition = element.offsetTop - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      setActiveSection(sectionId);
    }
  };

  const handleBlogClick = (e: React.MouseEvent) => {
    if (location.pathname === '/blog') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
                className={`nav-button ${!isAllPosts && !isBlogPost && !isZenith && activeSection === id ? 'active' : ''
                  }`}
              >
                {label}
              </button>
            </li>
          ))}
          <li className="all-posts-item">
            <Link
              to="/blog"
              className={`nav-button ${isAllPosts || isBlogPost ? 'active' : ''}`}
              onClick={handleBlogClick}
            >
              All Posts
            </Link>
          </li>
          <li>
            <a
              href="https://nick-eb.dev/jfl"
              className="nav-button jfl-link"
              target="_blank"
              rel="noopener noreferrer"
              title="Jellyfin Legacy Player"
            >
              JFL
            </a>
          </li>
        </ul>

        <Link to="/zenith" className={`zenith-button ${isZenith ? 'active' : ''}`}>
          <img src="/assets/img/Nereus.png" alt="" className="zenith-nav-icon" />
          <span>Zenith</span>
        </Link>
      </nav>
    </header>
  );
};

export default Header;