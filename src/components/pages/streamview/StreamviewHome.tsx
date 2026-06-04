import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faApple, faWindows, faLinux, faAndroid } from '@fortawesome/free-brands-svg-icons';
import { faServer, faPlay } from '@fortawesome/free-solid-svg-icons';
import './Streamview.css';

const useScrollReveal = () => {
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px 0px 100px 0px',
      threshold: 0.02,
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    const revealElements = document.querySelectorAll('.reveal');
    revealElements.forEach((el) => observer.observe(el));

    return () => {
      revealElements.forEach((el) => observer.unobserve(el));
    };
  }, []);
};

const getPrimaryPlatform = () => {
  if (typeof navigator === 'undefined') return 'Windows';
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes('mac') && !ua.includes('iphone') && !ua.includes('ipad')) return 'macOS';
  if (ua.includes('win')) return 'Windows';
  if (ua.includes('linux') && !ua.includes('android')) return 'Linux';
  if (ua.includes('iphone') || ua.includes('ipad')) return 'iOS';
  if (ua.includes('android')) return 'Android';
  return 'Windows';
};

const StreamviewHome = () => {
  const [expandedImage, setExpandedImage] = useState<string | null>(null);
  const [showOtherPlatforms, setShowOtherPlatforms] = useState<boolean>(false);

  useScrollReveal();

  const [primaryPlatform, setPrimaryPlatform] = useState<string>('Windows');

  useEffect(() => {
    setPrimaryPlatform(getPrimaryPlatform());
    if (window.location.hash) {
      const id = window.location.hash.substring(1);
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 150);
      }
    }
  }, []);

  const downloadOptions = [
    { id: 'macOS', icon: faApple, label: 'macOS' },
    { id: 'Windows', icon: faWindows, label: 'Windows' },
    { id: 'Linux', icon: faLinux, label: 'Linux' },
    { id: 'iOS', icon: faApple, label: 'iOS' },
    { id: 'Android', icon: faAndroid, label: 'Android' }
  ];

  const primaryOption = downloadOptions.find(o => o.id === primaryPlatform) || { id: 'Windows', icon: faWindows, label: 'Windows' };
  const otherOptions = downloadOptions.filter(o => o.id !== primaryPlatform);

  return (
    <div className="streamview-container">
      {/* Dynamic Background Trace Elements */}
      <div className="streamview-bg-traces">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
          {/* Top section waves */}
          <path d="M 0,10 Q 20,5 50,10 T 100,10" className="trace-path trace-1" />
          <path d="M 0,25 Q 30,35 60,25 T 100,25" className="trace-path trace-2" />
          
          {/* Middle section waves */}
          <path d="M 0,40 Q 25,20 50,40 T 100,40" className="trace-path trace-1" style={{ animationDelay: '2s' }} />
          <path d="M 0,55 Q 35,70 65,55 T 100,55" className="trace-path trace-2" style={{ animationDelay: '1s' }} />
          
          {/* Lower section waves */}
          <path d="M 0,70 Q 25,50 50,70 T 100,70" className="trace-path trace-1" style={{ animationDelay: '3s' }} />
          <path d="M 0,85 Q 40,100 70,85 T 100,85" className="trace-path trace-2" style={{ animationDelay: '5s' }} />
        </svg>
      </div>

      <div className="streamview-wrapper">
        
        {/* Centered Hero Section */}
        <section id="downloads" className="streamview-hero-centered reveal reveal-fade-up">
          <img
            src="/assets/img/streamview_logo_new.png"
            alt="StreamView Telemetry Icon"
            className="streamview-hero-icon"
          />
          <h1 className="streamview-app-name" style={{ marginBottom: '0.25rem' }}>StreamView</h1>
          <a 
            href="https://www.btekenergy.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="streamview-btek-link"
            style={{ 
              display: 'inline-block',
              color: '#38bdf8', 
              fontSize: '1rem', 
              fontWeight: 500, 
              textDecoration: 'none', 
              marginTop: '0.25rem',
              marginBottom: '1.25rem', 
              opacity: 0.9, 
              transition: 'opacity 0.2s' 
            }}
            onMouseOver={(e) => e.currentTarget.style.opacity = '1'}
            onMouseOut={(e) => e.currentTarget.style.opacity = '0.9'}
          >
            BTEK R.E. Products
          </a>
          <h2 className="streamview-app-tagline">
            Skystream 3.7 monitoring, modernized.
          </h2>
          
          <div className="streamview-download-group" style={{ flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
            {/* Primary Button (Scrolls to Purchase) */}
            <div 
              className="streamview-download-btn primary-download" 
              style={{ padding: '1.25rem 2.5rem', cursor: 'pointer' }}
              onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <span className="btn-icon" style={{ fontSize: '2.5rem' }}><FontAwesomeIcon icon={primaryOption.icon} /></span>
              <div className="btn-text">
                <span className="btn-sub">View Purchase Options</span>
                <span className="btn-main" style={{ fontSize: '1.6rem' }}>Download for {primaryOption.label}</span>
              </div>
            </div>
            
            <div className="streamview-download-other-platforms" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              <div 
                className="streamview-download-btn small-btn base-station" 
                style={{ padding: '0.5rem 1rem', border: '1px solid rgba(56, 189, 248, 0.3)', background: 'rgba(2, 132, 199, 0.1)', cursor: 'pointer' }}
                onClick={() => document.getElementById('base-station-section')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <span className="btn-icon" style={{ fontSize: '1.1rem', color: '#38bdf8' }}><FontAwesomeIcon icon={faServer} /></span>
                <div className="btn-text">
                  <span className="btn-sub" style={{ fontSize: '0.65rem', color: '#38bdf8', opacity: 0.8 }}>Coming Soon!</span>
                  <span className="btn-main" style={{ fontSize: '0.9rem', color: '#38bdf8' }}>View Base Station</span>
                </div>
              </div>

              <div 
                className="streamview-download-btn small-btn coming-soon" 
                style={{ padding: '0.5rem 1rem', cursor: 'not-allowed' }}
              >
                <span className="btn-icon" style={{ fontSize: '1.1rem' }}><FontAwesomeIcon icon={faPlay} /></span>
                <div className="btn-text">
                  <span className="btn-sub" style={{ fontSize: '0.65rem' }}>Coming Soon!</span>
                  <span className="btn-main" style={{ fontSize: '0.9rem' }}>Try the Demo</span>
                </div>
              </div>
            </div>
          </div>

          <div className="streamview-marketing-text">
            <h3 className="streamview-title">
              Modern monitoring for Skystream 3.7
            </h3>
            <h3 className="streamview-title-secondary">
              Built from the ground up.
            </h3>
            <p className="streamview-lead">
              Your Skystream 3.7 wind turbines still generate valuable data, but obsolete software made that data nearly impossible to reach... until now.
              <br /><br />
              StreamView reconnects YOU to your turbines.
            </p>
          </div>
        </section>

        {/* Flat Desktop Showcase */}
        <section className="streamview-showcase-section reveal reveal-scale-up" style={{ paddingTop: '1.5rem', paddingBottom: '0rem' }}>
          <div className="showcase-container desktop">
            <div className="showcase-text left">
              <h3 className="showcase-headline">Comprehensive Dashboard</h3>
              <p className="showcase-description">
                Visualizes, monitors and logs data straight from your turbines in real-time. Interactive charts, live metrics, and detailed diagnostics all in a sleek, modern interface.
              </p>
            </div>
              <img 
                src="/assets/img/streamview_dashboard_new.png" 
                alt="StreamView Desktop Dashboard" 
                className="showcase-image-desktop"
                onClick={() => setExpandedImage('/assets/img/streamview_dashboard_new.png')}
              />
          </div>
        </section>

        {/* Flat Mobile Showcase */}
        <section className="streamview-showcase-section reveal reveal-scale-up" style={{ paddingTop: '2.5rem' }}>
          <div className="showcase-container mobile">
            <img 
              src="/assets/img/streamview_mobile_new.png" 
              alt="StreamView Mobile App" 
              className="showcase-image-mobile"
              onClick={() => setExpandedImage('/assets/img/streamview_mobile_new.png')}
            />
            <div className="showcase-text right">
              <h3 className="showcase-headline">Truly Multi-Platform</h3>
              <p className="showcase-description">
                Break free from the legacy Windows software. StreamView works across all modern platforms to bring you your live metrics and deep diagnostics anywhere and everywhere.
              </p>
              <p className="showcase-description" style={{ marginTop: '1rem' }}>
                StreamView will soon be available for iOS, Android, macOS, and Linux.
              </p>
            </div>
          </div>
        </section>

        {/* Premium Overview Section (Main Points) */}
        <section className="streamview-section" style={{ paddingTop: '1.5rem' }}>
          <div className="section-header-wrap reveal reveal-fade-up" style={{ marginBottom: '2.5rem' }}>
            <h2 className="section-headline">Simple. Powerful. <span>Local first.</span></h2>
          </div>

          <div className="overview-grid">
            <div className="overview-card reveal reveal-stagger" style={{ '--delay': '0.1s' } as any}>
              <div className="overview-icon-glass">📊</div>
              <h3 className="overview-card-title">Real-Time Monitoring</h3>
              <p className="overview-card-desc">
                Monitor live metrics like RPM, wattage, and inverter temperature with interactive graphs and responsive tracking.
              </p>
            </div>

            <div className="overview-card reveal reveal-stagger" style={{ '--delay': '0.2s' } as any}>
              <div className="overview-icon-glass">💾</div>
              <h3 className="overview-card-title">Offline-First Logging</h3>
              <p className="overview-card-desc">
                Logs and processes turbine data securely on-device. <span className="base-station-link" onClick={() => document.getElementById('cloud-upgrades')?.scrollIntoView({ behavior: 'smooth' })}>Cloud sync & subscription</span> is 100% optional. Your data, your choice.
              </p>
            </div>

            <div className="overview-card reveal reveal-stagger" style={{ '--delay': '0.3s' } as any}>
              <div className="overview-icon-glass">⚙️</div>
              <h3 className="overview-card-title">Multi-Platform Design</h3>
              <p className="overview-card-desc">
                Enjoy StreamView on all platforms, including Windows, macOS, Linux, iOS, and Android (coming soon!).
              </p>
            </div>

            <div className="overview-card reveal reveal-stagger" style={{ '--delay': '0.4s' } as any}>
              <div className="overview-icon-glass">🌐</div>
              <h3 className="overview-card-title">Remote Turbine Monitoring</h3>
              <p className="overview-card-desc">
                With an <span className="base-station-link" onClick={() => document.getElementById('cloud-upgrades')?.scrollIntoView({ behavior: 'smooth' })}>optional subscription</span>, securely access your turbine data remotely from anywhere in the world. Check in on your Skystream while you're away!
              </p>
            </div>
          </div>
        </section>

        {/* Separated Pricing Section */}
        <section id="pricing" className="streamview-section" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.04)', paddingTop: '2.5rem', paddingBottom: '1.5rem' }}>
          <div className="section-header-wrap reveal reveal-fade-up" style={{ marginBottom: '2.5rem' }}>
            <h2 className="section-headline">One-time purchase.<br /><span>Full local monitoring.</span></h2>
          </div>

          {/* App Pricing (Horizontal Banner) */}
          <div className="pricing-banner glass-panel reveal reveal-fade-up">
            <div className="pricing-banner-content">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <div style={{ 
                  width: '48px', 
                  height: '48px', 
                  borderRadius: '12px', 
                  background: 'linear-gradient(135deg, #38bdf8, #0284c7)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(2, 132, 199, 0.2)'
                }}>
                  <img src="/assets/img/streamview_logo_new.png" alt="App Icon" style={{ width: '32px', height: '32px', objectFit: 'contain', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }} />
                </div>
                <h3 className="pricing-title" style={{ fontSize: '1.6rem', margin: 0 }}>StreamView App</h3>
              </div>
              <p className="pricing-desc" style={{ marginBottom: 0 }}>
                The complete monitoring and logging solution for your Skystream 3.7 wind turbines.
              </p>
              <ul className="pricing-features-list" style={{ margin: 0, gap: '0.5rem' }}>
                <li className="pricing-feature-item">
                  <strong>Buy It Once, Own It Forever:</strong> The StreamView app will always work and function fully locally, regardless of <span className="base-station-link" onClick={() => document.getElementById('cloud-upgrades')?.scrollIntoView({ behavior: 'smooth' })}>subscription status</span>.
                </li>
                <li className="pricing-feature-item">
                  <strong>Cloud Subscription:</strong> With the separate, <span className="base-station-link" onClick={() => document.getElementById('cloud-upgrades')?.scrollIntoView({ behavior: 'smooth' })}>100% optional cloud subscription</span>, you can monitor your turbines remotely with secure cloud data sync.
                </li>
              </ul>
              
              <div className="pricing-banner-footer">
                <div className="pricing-banner-price-block">
                  <span className="pricing-cost" style={{ fontSize: '2.25rem', lineHeight: 1 }}>$9.99</span>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>USD / one-time</span>
                </div>
                
                <button 
                  className="streamview-download-btn coming-soon" 
                  style={{ padding: '0.75rem 1.5rem', width: '100%', maxWidth: '280px', justifyContent: 'center' }} 
                  disabled
                >
                  <span className="btn-icon" style={{ fontSize: '1.5rem' }}><FontAwesomeIcon icon={primaryOption.icon} /></span>
                  <div className="btn-text" style={{ textAlign: 'left' }}>
                    <span className="btn-sub" style={{ fontSize: '0.65rem' }}>Coming Soon!</span>
                    <span className="btn-main" style={{ fontSize: '1.1rem' }}>Purchase for {primaryOption.label}</span>
                  </div>
                </button>
              </div>
              
              <div className="pricing-dropdown-container">
                <button 
                  className="pricing-dropdown-link"
                  onClick={() => setShowOtherPlatforms(!showOtherPlatforms)}
                >
                  <span>Other Platforms</span>
                  <span className={`dropdown-arrow ${showOtherPlatforms ? 'open' : ''}`}>▼</span>
                </button>
                
                {showOtherPlatforms && (
                  <div className="pricing-dropdown-menu fade-in-animation">
                    <div className="pricing-other-platforms-grid">
                      {otherOptions.map(opt => (
                        <button key={opt.id} className="other-platform-purchase-btn coming-soon" disabled>
                          <span className="btn-icon"><FontAwesomeIcon icon={opt.icon} /></span>
                          <div className="btn-text">
                            <span className="btn-sub">Coming Soon!</span>
                            <span className="btn-main">{opt.label}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div id="cloud-upgrades" className="pricing-divider reveal reveal-fade-up">
            <span className="pricing-divider-text">Optional Cloud Upgrades</span>
          </div>

          {/* Subscription Pricing Grid */}
          <div className="pricing-grid">
            {/* Personal Cloud Plan */}
            <div className="pricing-card glass-panel reveal reveal-stagger" style={{ '--delay': '0.1s' } as any}>
              <h3 className="pricing-title">Personal</h3>
              <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>Remote Cloud Sync & History</p>
              
              <div className="pricing-cost-block">
                <span className="pricing-cost">$4.99</span>
                <span className="pricing-period">USD / month</span>
              </div>

              <ul className="pricing-features-list">
                <li className="pricing-feature-item">Secure remote cloud dashboard</li>
                <li className="pricing-feature-item">Support for unlimited wind turbines</li>
                <li className="pricing-feature-item">Cloud history charting & remote access</li>
                <li className="pricing-feature-item">
                  1 GB cloud telemetry storage quota
                  <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.15rem' }}>Optional future storage expansions</span>
                </li>
              </ul>

              <button className="pricing-btn coming-soon" disabled>Coming Soon!</button>
              <div style={{ textAlign: 'center', fontSize: '0.75rem', marginTop: '0.75rem', color: 'var(--text-tertiary)' }}>
                or $49.99/year (Save 16%)
              </div>
            </div>

            {/* Enterprise Plan */}
            <div className="pricing-card glass-panel reveal reveal-stagger" style={{ '--delay': '0.2s' } as any}>
              <h3 className="pricing-title">Enterprise</h3>
              <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>Diagnostics & Dedicated Support</p>
              
              <div className="pricing-cost-block">
                <span className="pricing-cost">$14.99</span>
                <span className="pricing-period">USD / month</span>
              </div>

              <ul className="pricing-features-list">
                <li className="pricing-feature-item">Includes all Personal features</li>
                <li className="pricing-feature-item">1:1 turbine support via BTEK RE Products</li>
                <li className="pricing-feature-item">Basic hardware diagnostics & consultation</li>
                <li className="pricing-feature-item">
                  5 GB cloud telemetry storage quota
                  <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.15rem' }}>Optional future storage expansions</span>
                </li>
              </ul>

              <button className="pricing-btn coming-soon" disabled>Coming Soon!</button>
              <div style={{ textAlign: 'center', fontSize: '0.75rem', marginTop: '0.75rem', color: 'var(--text-tertiary)' }}>
                or $149.99/year (Save 16%)
              </div>
            </div>
          </div>

          {/* Subscription terms / notes */}
          <div className="subscription-notes reveal reveal-fade-up">
            <ul className="subscription-notes-list">
              <li className="pricing-feature-item">
                <strong>Proudly Subscription-Independent:</strong> Both the app and <span className="base-station-link" onClick={() => document.getElementById('base-station-section')?.scrollIntoView({ behavior: 'smooth' })}>Base Station</span> operate locally out-of-the-box, with zero subscription requirements to monitor, log, and view your turbine data. Subscription is 100% optional.
              </li>
              <li className="pricing-feature-item">
                <strong>Transparency:</strong> Subscription is recommended for users who want remote data logging and long-term cloud database storage. No hidden fees or forced commitments, cancel anytime.
              </li>
            </ul>
          </div>
        </section>

        {/* Standalone Base Station Detail */}
        <section id="base-station-section" className="streamview-section" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.04)', paddingTop: '2.5rem' }}>
          <div className="base-station-card reveal reveal-fade-up">
            <div className="base-station-content">
              <span className="base-station-badge">IN DEVELOPMENT, COMING SOON</span>
              <h3 className="base-station-title">
                StreamView Base Station
              </h3>
              <p className="base-station-desc">
                Currently in development, the StreamView Base Station is a dedicated piece of hardware that will continuously monitor your Skystream turbine, without tying up your computer or phone.
              </p>
              <ul className="base-station-details">
                <li className="base-station-detail-item">
                  <strong>Dedicated Storage:</strong> Securely stores your turbine's 24/7 live telemetry and historical logs directly on the Base Station with no external internet requirements.
                </li>
                <li className="base-station-detail-item">
                  <strong>Cross-Device LAN Access:</strong> View real-time charts and metrics from any device on your local network via the StreamView app or a built-in web portal.
                </li>
                <li className="base-station-detail-item">
                  <strong>Optional Remote Sync:</strong> Sync data securely to the cloud to access your dashboard from anywhere (requires an <span className="base-station-link" onClick={() => document.getElementById('cloud-upgrades')?.scrollIntoView({ behavior: 'smooth' })}>optional subscription</span>).
                </li>
              </ul>
            </div>

            <div className="base-station-visual reveal reveal-scale-up" style={{ '--delay': '0.3s' } as any}>
              <img 
                src="/assets/img/raspberry_pi_appliance.png" 
                alt="StreamView Raspberry Pi Appliance" 
                className="base-station-image"
              />
            </div>
          </div>
        </section>




        {/* Lightbox Overlay */}
        {expandedImage && (
          <div 
            className="streamview-lightbox-overlay"
            onClick={() => setExpandedImage(null)}
          >
            <img 
              src={expandedImage} 
              alt="Expanded StreamView Screenshot" 
              className="streamview-lightbox-image"
            />
          </div>
        )}

      </div>
    </div>
  );
};

export default StreamviewHome;
