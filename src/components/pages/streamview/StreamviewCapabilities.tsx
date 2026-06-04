import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Streamview.css';

const StreamviewCapabilities = () => {
  useEffect(() => {
    // Scroll reveal logic
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

    const elements = document.querySelectorAll('.reveal');
    elements.forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="streamview-page">
      <div className="streamview-container">
        
        <section className="streamview-section" style={{ paddingTop: '5rem' }}>
          <div className="section-header-wrap reveal reveal-fade-up">
            <h2 className="section-headline">Deep dive into <span>Capabilities</span>.</h2>
            <p className="section-intro-desc">
              Streamview is built around the realities of real-world energy generation, keeping you connected in rural 
              or low-connectivity environments.
            </p>
          </div>

          <div className="benefits-list">
            
            {/* Live Telemetry */}
            <div className="benefit-block reveal reveal-slide-left">
              <div>
                <h3 className="benefit-headline">See what your turbine is doing right now.</h3>
                <p className="benefit-text">
                  Streamview decodes raw radio frames and displays them inside clean, responsive dials. Confirm generation changes 
                  as wind speeds shift and monitor line conditions.
                </p>
                <ul className="benefit-bullets">
                  <li className="benefit-bullet-item">Spot generation changes as wind shifts</li>
                  <li className="benefit-bullet-item">Confirm wireless signal quality (RSSI) in real time</li>
                  <li className="benefit-bullet-item">Watch power and rotor speeds interact dynamically</li>
                  <li className="benefit-bullet-item">Preserve raw diagnostic values for deeper troubleshooting</li>
                </ul>
              </div>
              <div className="benefit-visual-panel glass-panel glow-border">
                <div className="mockup-value-wrap" style={{ margin: '1rem 0' }}>
                  <span className="mockup-number" style={{ fontSize: '4.5rem', color: '#38bdf8', textShadow: '0 0 20px rgba(56, 189, 248, 0.4)' }}>1.2</span>
                  <span className="mockup-unit" style={{ fontSize: '1.5rem' }}>kW</span>
                </div>
                <div style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Generating at 122.4 Volts AC • Rotor: 340 RPM
                </div>
              </div>
            </div>

            {/* Local Logging */}
            <div className="benefit-block reverse reveal reveal-slide-right">
              <div>
                <h3 className="benefit-headline">Every sample starts local.</h3>
                <p className="benefit-text">
                  Durable database architectures mean telemetry samples are written locally before cloud sync is attempted. 
                  Offline-first design ensures your history is preserved.
                </p>
                <ul className="benefit-bullets">
                  <li className="benefit-bullet-item">Works completely without a cloud account</li>
                  <li className="benefit-bullet-item">Works with zero active internet access</li>
                  <li className="benefit-bullet-item">Avoids dropped telemetry records during network outages</li>
                  <li className="benefit-bullet-item">Keeps local diagnostics available directly in the field</li>
                </ul>
              </div>
              <div className="benefit-visual-panel glass-panel" style={{ fontFamily: 'var(--ff-mono)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>SQLITE LOCAL STORAGE QUEUE</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <span>Samples Stored:</span>
                  <span style={{ color: '#38bdf8' }}>14,240 Rows</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <span>Pending Upload:</span>
                  <span style={{ color: '#eab308' }}>120 Rows</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', padding: '0.5rem 0' }}>
                  <span>DB Status:</span>
                  <span style={{ color: '#f59e0b' }}>WAL Mode Active</span>
                </div>
              </div>
            </div>

            {/* Cloud remote access */}
            <div className="benefit-block reveal reveal-slide-left">
              <div>
                <h3 className="benefit-headline">Away from the turbine. Still connected.</h3>
                <p className="benefit-text">
                  With a <Link to="/streamview#cloud-upgrades" className="base-station-link">subscription</Link>, your turbine telemetry syncs to cloud storage, enabling remote dashboard access. 
                  Monitor one or multiple turbines across all account-connected devices.
                </p>
                <ul className="benefit-bullets">
                  <li className="benefit-bullet-item">Remote monitoring from home, work, or while traveling</li>
                  <li className="benefit-bullet-item">1 GB of cloud telemetry storage included per account</li>
                  <li className="benefit-bullet-item">Full support for multi-turbine site configurations</li>
                  <li className="benefit-bullet-item">Cloud-backed history for long-term generation analytics</li>
                </ul>
              </div>
              <div className="benefit-visual-panel glass-panel cloud-sync-visual">
                <div style={{ textAlign: 'center' }}>
                  <span className="cloud-icon-anim">☁️</span>
                  <span className="arrow-icon-anim">➔</span>
                  <span className="device-icon-anim">📱</span>
                  <div style={{ fontWeight: '800', margin: '1rem 0 0.25rem 0', letterSpacing: '0.05em' }}>SECURE CLOUD SYNC</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Real-time ingestion gateway with client-sample deduplication
                  </div>
                </div>
              </div>
            </div>

            {/* Home Assistant Integration */}
            <div className="benefit-block reverse reveal reveal-slide-right">
              <div>
                <h3 className="benefit-headline">Turbine data where your home already lives.</h3>
                <p className="benefit-text">
                  Streamview integrates turbine telemetry with Home Assistant. View your wind generation beside solar generation, 
                  batteries, and grid usage, and build smart automation alerts.
                </p>
                <ul className="benefit-bullets">
                  <li className="benefit-bullet-item">Use real-time wind data to trigger smart home automations</li>
                  <li className="benefit-bullet-item">Monitor wind production alongside solar panels and power walls</li>
                  <li className="benefit-bullet-item">Build automated alerts for status changes or connection health</li>
                </ul>
              </div>
              <div className="benefit-visual-panel glass-panel">
                <div className="ha-card-preview">
                  <div className="ha-title">
                    <span>🏠</span> HOME ASSISTANT ENTITIES
                  </div>
                  <div className="ha-entity-row">
                    <span className="ha-entity-name">sensor.skystream_generation</span>
                    <span className="ha-entity-val">1,240 W</span>
                  </div>
                  <div className="ha-entity-row">
                    <span className="ha-entity-name">sensor.skystream_rotor_speed</span>
                    <span className="ha-entity-val">340 RPM</span>
                  </div>
                  <div className="ha-entity-row">
                    <span className="ha-entity-name">binary_sensor.skystream_grid_connected</span>
                    <span className="ha-entity-val" style={{ color: '#f59e0b', textShadow: '0 0 8px rgba(245, 158, 11, 0.4)' }}>ON</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

      </div>
    </div>
  );
};

export default StreamviewCapabilities;
