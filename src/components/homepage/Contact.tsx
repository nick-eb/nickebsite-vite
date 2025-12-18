import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { faGithub, faInstagram, faTwitter, faLinkedin } from '@fortawesome/free-brands-svg-icons';
import './Contact.css';

const Contact = () => {
  const socialLinks = [
    {
      href: 'https://github.com/hadobedo/',
      icon: faGithub,
      label: 'GitHub'
    },
    {
      href: 'https://www.linkedin.com/in/nicholas-bonello-642a73333/',
      icon: faLinkedin,
      label: 'LinkedIn'
    },
    {
      href: 'https://x.com/_nickeb_',
      icon: faTwitter,
      label: 'Twitter/X'
    },
    {
      href: 'https://instagram.com/nick__eb',
      icon: faInstagram,
      label: 'Instagram'
    }
  ];

  return (
    <section id="contact" className="contact-section">
      <div className="content-container">
        <motion.div
          className="contact-content"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="section-title">Contact Me</h2>

          <div className="contact-card">
            <div className="contact-info">
              <FontAwesomeIcon icon={faEnvelope} className="email-icon" />
              <a
                href="mailto:nicholas.e.bonello@gmail.com"
                className="email-link"
              >
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
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Contact;
