import { useLocation, useNavigate, Link } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const scrollToSection = (sectionId: string) => {
    // If not on homepage, navigate first
    if (location.pathname !== '/') {
      navigate('/', { state: { scrollTo: sectionId } });
      return;
    }
    
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const navItems = [
    { id: 'intro', label: 'Home' },
    { id: 'projects', label: 'Projects' },
    { id: 'blog', label: 'Posts' },  // Shortened from 'Recent Posts'
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
                className="nav-button"
              >
                {label}
              </button>
            </li>
          ))}
          <li className="all-posts-item">
            <Link to="/blog" className="nav-button blog-nav-button">All Posts</Link>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
