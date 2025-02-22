import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { faGithub, faInstagram, faTwitter } from '@fortawesome/free-brands-svg-icons';
import './Contact.css';

const Contact = () => {
  const socialLinks = [
    { href: 'https://github.com/hadobedo/', icon: faGithub, label: 'GitHub' },
    { href: 'https://twitter.com/NicksWorkslol/', icon: faTwitter, label: 'Twitter' },
    { href: 'https://instagram.com/nick__eb', icon: faInstagram, label: 'Instagram' }
  ];

  return (
    <section className="contact-section">
      <div className="content-container">
        <motion.h2 
          className="section-title"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Contact Me
        </motion.h2>

        <motion.div 
          className="contact-grid"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="contact-email">
            <FontAwesomeIcon icon={faEnvelope} />
            <a href="mailto:nicholas.e.bonello@gmail.com">
              nicholas.e.bonello@gmail.com
            </a>
          </div>

          <div className="social-links">
            {socialLinks.map(({ href, icon, label }) => (
              <a
                key={href}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
              >
                <FontAwesomeIcon icon={icon} />
                <span>{label}</span>
              </a>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Contact;
