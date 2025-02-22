import { useLocation, useNavigate } from 'react-router-dom';
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

  const goToBlog = () => {
    navigate('/blog');
  };

  const navItems = [
    { id: 'intro', label: 'Home' },
    { id: 'projects', label: 'Projects' },
    { id: 'blog', label: 'Blog' },
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
          <li>
            <button 
              onClick={() => navigate('/blog')}
              className="nav-button blog-nav-button"
            >
              All Blog Posts
            </button>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
