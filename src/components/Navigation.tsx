import { Link } from 'react-router-dom';
// ...existing imports...

const Navigation = () => {
  return (
    <nav>
      <Link to="/">Home</Link>
      <Link to="/blog">Blog</Link>
      {/* Links will automatically prepend /nickebsite-vite thanks to basename */}
      {/* ...other navigation items... */}
    </nav>
  );
};

export default Navigation;
