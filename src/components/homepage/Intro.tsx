import { motion } from 'framer-motion';
import './Intro.css';

const Intro = () => {
  const scrollToContact = () => {
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="intro">
      <div className="intro-content">
        <div className="intro-text">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="intro-name">Nicholas Bonello</h1>
            <h2 className="intro-degree">
              Specialized Honours Computer Science <br />
              @ York University '26
            </h2>
          </motion.div>

          <motion.div
            className="intro-roles"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <span className="role-pill">Full-Stack Developer</span>
            <span className="role-pill">Hardware Diagnostics & Repair</span>
            <span className="role-pill">Hobbyist Security Researcher</span>
            <span className="role-pill">Digital Privacy Advocate</span>
            <span className="role-pill">Right to Repair Advocate</span>
          </motion.div>

          <motion.p
            className="intro-bio"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <span className="bio-status">I'm a YorkU Computer Science student graduating with Specialized Honours in 2026.</span>
            <br />
            I am driven by curiosity and a passion for technology across all fields and applications. My work spans <span className="highlight">software development</span>, <span className="highlight">reverse engineering</span>, <span className="highlight">hardware repair</span>, <span className="highlight">security research</span>, and <span className="highlight">more!</span>
          </motion.p>

          <motion.div
            className="intro-buttons"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <a
              href="/assets/Nicholas Bonello Resume.pdf"
              className="intro-button"
              download
            >
              Download CV
            </a>
            <button
              onClick={scrollToContact}
              className="intro-button contact"
            >
              Contact Me
            </button>
          </motion.div>
        </div>

        {/* 
        <motion.div
          className="intro-logo"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="logo-circle">
            <img src="/assets/img/logo.png" alt="Nick B Logo" className="logo-image" />
          </div>
        </motion.div>
        */}
      </div>
    </section>
  );
};

export default Intro;