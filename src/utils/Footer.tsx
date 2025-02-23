import './Footer.css';

const Footer = () => {
  const socialLinks = [
    { href: 'https://github.com/hadobedo/', icon: 'github', label: 'GitHub Profile' },
    { href: 'https://www.linkedin.com/in/nicholas-bonello-642a73333/', icon: 'linkedin', label: 'LinkedIn Profile' },
    { href: 'https://twitter.com/NicksWorkslol/', icon: 'twitter', label: 'Twitter Profile' },
    { href: 'https://instagram.com/nick__eb', icon: 'instagram', label: 'Instagram Profile' }
  ];

  return (
    <footer className="footer">
      <div className="footer__container">
        <a href="mailto:nicholas.e.bonello@gmail.com" className="footer__link">
          nicholas.e.bonello@gmail.com
        </a>
        <ul className="social-list">
          {socialLinks.map(({href, icon, label}) => (
            <li key={href} className="social-list__item">
              <a className="social-list__link" href={href} aria-label={label}>
                <i className={`fab fa-${icon}`}></i>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
};

export default Footer;