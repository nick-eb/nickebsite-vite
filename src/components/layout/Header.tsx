import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
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
  const isStreamview = location.pathname.startsWith('/streamview');
  const isProductRoute = isStreamview || isZenith;
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

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
    setIsMobileNavOpen(false);
  };

  const handleNavClick = (sectionId: string) => {
    scrollToSection(sectionId);
    setIsMobileNavOpen(false);
  };

  useEffect(() => {
    setIsMobileNavOpen(false);
  }, [location.pathname]);

  const navItems = [
    { id: 'intro', label: 'Home' },
    { id: 'projects', label: 'Projects' },
    { id: 'blog', label: 'Posts' },
    { id: 'contact', label: 'Contact' }
  ];

  const activeMobileLabel = isAllPosts || isBlogPost
    ? 'All Posts'
    : isStreamview
      ? 'Streamview'
      : isZenith
        ? 'Zenith'
        : navItems.find(item => item.id === activeSection)?.label || 'Home';

  return (
    <header className="site-header">
      <nav className="nav-container">
        {/* Brand Logo in column 1 */}
        <div className="logo">
          <button onClick={() => handleNavClick('intro')}>
            <img src="/logo.png" alt="" className="site-logo-mark" />
            <span>nick-eb.dev</span>
          </button>
        </div>

        {/* Desktop Links in column 2 */}
        <ul className="nav-links">
          {navItems.map(({ id, label }) => (
            <li key={id}>
              <button
                onClick={() => scrollToSection(id)}
                className={`nav-button ${!isAllPosts && !isBlogPost && !isZenith && !isStreamview && activeSection === id ? 'active' : ''
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

        <div className={`mobile-section-select ${isProductRoute ? 'product-route' : ''}`}>
          <button
            className={`mobile-section-trigger ${isMobileNavOpen ? 'open' : ''}`}
            onClick={() => !isProductRoute && setIsMobileNavOpen(!isMobileNavOpen)}
            aria-expanded={!isProductRoute && isMobileNavOpen}
            aria-haspopup={isProductRoute ? undefined : 'menu'}
            type="button"
          >
            <span>{activeMobileLabel}</span>
            {!isProductRoute && <span className="mobile-section-chevron">⌄</span>}
          </button>

          {!isProductRoute && isMobileNavOpen && createPortal(
            <div className="mobile-section-layer">
              <button
                className="mobile-section-backdrop"
                aria-label="Close navigation menu"
                onClick={() => setIsMobileNavOpen(false)}
              />
              <div className="mobile-section-menu" role="menu">
                {navItems.map(({ id, label }) => (
                  <button
                    key={id}
                    onClick={() => handleNavClick(id)}
                    className={`mobile-section-option ${!isAllPosts && !isBlogPost && !isZenith && !isStreamview && activeSection === id ? 'active' : ''}`}
                    role="menuitem"
                  >
                    {label}
                  </button>
                ))}
                <Link
                  to="/blog"
                  className={`mobile-section-option ${isAllPosts || isBlogPost ? 'active' : ''}`}
                  onClick={handleBlogClick}
                  role="menuitem"
                >
                  All Posts
                </Link>
                <a
                  href="https://nick-eb.dev/jfl"
                  className="mobile-section-option mobile-section-option-external"
                  target="_blank"
                  rel="noopener noreferrer"
                  role="menuitem"
                  onClick={() => setIsMobileNavOpen(false)}
                >
                  <span>JFL</span>
                  <span aria-hidden="true">↗</span>
                </a>
              </div>
            </div>,
            document.body
          )}
        </div>

        {/* Desktop actions in column 3 */}
        <div className={`nav-actions-right ${isProductRoute ? 'product-route' : ''}`}>
          {!isStreamview && (
            <Link to="/streamview" className={`streamview-button ${isStreamview ? 'active' : ''}`}>
              <img src="/assets/img/streamview_logo_new.png" alt="" className="streamview-nav-icon" />
              <span>Streamview</span>
            </Link>
          )}
          {!isZenith && (
            <Link to="/zenith" className={`zenith-button ${isZenith ? 'active' : ''}`}>
              <img src="/assets/img/Nereus.png" alt="" className="zenith-nav-icon" />
              <span>Zenith</span>
            </Link>
          )}
        </div>

      </nav>
    </header>
  );
};

export default Header;