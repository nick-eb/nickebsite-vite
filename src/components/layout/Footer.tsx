import { Link, useLocation } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const location = useLocation();
  const isStreamview = location.pathname.startsWith('/streamview');
  const isZenith = location.pathname.startsWith('/zenith');

  const copyrightName = isStreamview
    ? 'StreamView'
    : isZenith
      ? 'Zenith'
      : 'Nicholas Bonello';

  const socialLinks = [
    { href: 'https://github.com/hadobedo/', icon: 'github', label: 'GitHub Profile' },
    { href: 'https://www.linkedin.com/in/nicholas-bonello-642a73333/', icon: 'linkedin', label: 'LinkedIn Profile' },
    { href: 'https://x.com/_nickeb_', icon: 'twitter', label: 'Twitter Profile' },
    { href: 'https://instagram.com/nick__eb', icon: 'instagram', label: 'Instagram Profile' }
  ];

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <footer className="footer">
      <div className="footer__container">
        <div className="footer__identity">
          <a href="mailto:nicholas.e.bonello@gmail.com" className="footer__link">
            nicholas.e.bonello@gmail.com
          </a>
          <p className="footer__copyright">
            &copy; {new Date().getFullYear()} {copyrightName}. All rights reserved.
          </p>
        </div>

        <div className="footer__actions">
          <ul className="social-list">
            {socialLinks.map(({ href, icon, label }) => (
              <li key={href} className="social-list__item">
                <a className="social-list__link" href={href} aria-label={label} target="_blank" rel="noopener noreferrer">
                  <i className={`fab fa-${icon}`}></i>
                </a>
              </li>
            ))}
          </ul>

          <div className="footer__route-links">
            {isStreamview && <Link to="/zenith">Zenith</Link>}
            {isZenith && (
              <>
                <Link to="/streamview">StreamView</Link>
                <Link to="/zenith/privacy-policy">Privacy</Link>
                <Link to="/zenith/tos">Terms</Link>
              </>
            )}
            {(isStreamview || isZenith) && <Link to="/">Portfolio</Link>}
            <button type="button" className="footer__top-button" onClick={scrollToTop}>
              Back to top ↑
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
