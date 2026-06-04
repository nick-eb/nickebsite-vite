import type { CSSProperties } from 'react';
import useScrollReveal from '../../hooks/useScrollReveal';
import './Intro.css';

const Intro = () => {
  useScrollReveal();

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
          <div className="reveal reveal-fade-up">
            <h1 className="intro-name">Nicholas Bonello</h1>
            <h2 className="intro-credential">
              <span className="credential-degree">BSc Specialized Honours in Computer Science</span>
              <span className="credential-label">York University · May 2026 Graduate</span>
            </h2>
          </div>

          <div className="intro-roles reveal reveal-fade-up" style={{ '--delay': '0.1s' } as CSSProperties}>
            <span className="role-pill">Full-Stack Developer</span>
            <span className="role-pill">Hardware Diagnostics & Repair</span>
            <span className="role-pill">Hobbyist Security Researcher</span>
            <span className="role-pill">Digital Privacy Advocate</span>
            <span className="role-pill">Right to Repair Advocate</span>
          </div>

          <p className="intro-bio reveal reveal-fade-up" style={{ '--delay': '0.2s' } as CSSProperties}>
            Passionate about building software and solving technical problems across <span className="highlight">full-stack development</span>, <span className="highlight">reverse engineering</span>, <span className="highlight">hardware diagnostics and repair</span>, <span className="highlight">security research</span>, and <span className="highlight">digital privacy</span> projects.
          </p>

          <div className="intro-buttons reveal reveal-fade-up" style={{ '--delay': '0.3s' } as CSSProperties}>
            <a
              href="/assets/Nicholas Bonello Resume New.pdf"
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
          </div>
        </div>
      </div>
    </section>
  );
};

export default Intro;
