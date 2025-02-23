import { motion } from 'framer-motion';
import { TypeAnimation } from 'react-type-animation';
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
            className="typed-intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <TypeAnimation
              sequence={['Hi, my name is']}
              speed={50}
              cursor={false}  // Remove cursor
              className="intro-greeting"
            />
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}  // Reduced from 1.0
          >
            Nicholas Bonello
          </motion.h1>
          
          <motion.h2
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}  // Reduced from 1.2
          >
            Full Stack Developer
          </motion.h2>
          
          <motion.p
            className="intro-bio"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}  // Reduced from 1.4
          >
            I'm a developer and computer science student passionate about
            computers and using them to make life easier and more accessible 
            for all.
          </motion.p>

          <motion.div 
            className="intro-buttons"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1 }}
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
        
        <motion.div 
          className="intro-logo"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <img src="/assets/img/logo.png" alt="Nick B Logo" />
        </motion.div>
      </div>
    </section>
  );
};

export default Intro;