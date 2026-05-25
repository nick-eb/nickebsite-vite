import { useState } from 'react';
import { Link } from 'react-router-dom';
import Card, { CardContent, CardTitle, CardDescription } from '../../shared/Card';
import './Streamview.css';

// Hex packet bytes definition for interactive protocol explorer
interface HexByte {
  byte: string;
  label: string;
  name: string;
  description: string;
  group: 'xbee-header' | 'mac-addr' | 'sip-marker' | 'telemetry-payload' | 'checksum';
}

const HEX_PACKET: HexByte[] = [
  { byte: '7E', label: 'Start Delimiter', name: 'Start Delimiter', description: 'XBee Start Delimiter (0x7E). Identifies the beginning of an API frame on the FTDI serial line.', group: 'xbee-header' },
  { byte: '00', label: 'Length High', name: 'Frame Length (High)', description: 'XBee Frame Length - MSB. Set to 0x00 for standard short telemetry payloads.', group: 'xbee-header' },
  { byte: '1B', label: 'Length Low', name: 'Frame Length (Low)', description: 'XBee Frame Length - LSB. Indicates 27 bytes (0x1B) of payload follow this byte.', group: 'xbee-header' },
  { byte: '90', label: 'Frame Type', name: 'XBee RX Frame Type', description: 'XBee API Frame Type (0x90). Signifies an incoming RF data packet received by the coordinator.', group: 'xbee-header' },
  { byte: '00', label: 'MAC Offset 1', name: 'MAC Address [0]', description: 'Turbine MAC Address MSB. Start of the 64-bit unique hardware identifier.', group: 'mac-addr' },
  { byte: '13', label: 'MAC Offset 2', name: 'MAC Address [1]', description: 'Turbine MAC Address Byte 2. Part of XBee device serial number.', group: 'mac-addr' },
  { byte: 'A2', label: 'MAC Offset 3', name: 'MAC Address [2]', description: 'Turbine MAC Address Byte 3. Matches manufacturer identifier (Digi International).', group: 'mac-addr' },
  { byte: '00', label: 'MAC Offset 4', name: 'MAC Address [3]', description: 'Turbine MAC Address Byte 4.', group: 'mac-addr' },
  { byte: '40', label: 'MAC Offset 5', name: 'MAC Address [4]', description: 'Turbine MAC Address Byte 5.', group: 'mac-addr' },
  { byte: '52', label: 'MAC Offset 6', name: 'MAC Address [5]', description: 'Turbine MAC Address Byte 6.', group: 'mac-addr' },
  { byte: '2B', label: 'MAC Offset 7', name: 'MAC Address [6]', description: 'Turbine MAC Address Byte 7.', group: 'mac-addr' },
  { byte: 'AA', label: 'MAC Offset 8', name: 'MAC Address [7]', description: 'Turbine MAC Address LSB. Uniquely binds the incoming stream to a registered device config.', group: 'mac-addr' },
  { byte: 'FF', label: 'Network Addr H', name: '16-bit Network Addr (High)', description: 'XBee 16-bit Network Address MSB (0xFF). Fallback placeholder address.', group: 'xbee-header' },
  { byte: 'FE', label: 'Network Addr L', name: '16-bit Network Addr (Low)', description: 'XBee 16-bit Network Address LSB (0xFE). Indicates broadcast/unknown route.', group: 'xbee-header' },
  { byte: 'C2', label: 'Receive Options', name: 'RX Options Bitmask', description: 'XBee Receive Options (0xC2). Flags detailing that the packet was acknowledged on-air.', group: 'xbee-header' },
  { byte: '10', label: 'SIP DLE Start', name: 'SIP Start (DLE)', description: 'SIP Encapsulation Frame Delimiter - DLE (0x10). Part of the legacy 2-byte start sequence.', group: 'sip-marker' },
  { byte: '02', label: 'SIP STX Start', name: 'SIP Start (STX)', description: 'SIP Encapsulation Frame Delimiter - STX (0x02). Confirms the payload start.', group: 'sip-marker' },
  { byte: '05', label: 'SIP Frame Type', name: 'SIP Frame ID', description: 'SIP Packet Type (0x05). Identifies this payload as a live turbine telemetry update.', group: 'telemetry-payload' },
  { byte: '02', label: 'RPM MSB', name: 'RPM (High Byte)', description: 'Turbine RPM MSB. High-order 8 bits of the big-endian raw RPM reading.', group: 'telemetry-payload' },
  { byte: '58', label: 'RPM LSB', name: 'RPM (Low Byte)', description: 'Turbine RPM LSB. 0x0258 decodes to 600 RPM. (Sentinel values are normalized to 0 automatically).', group: 'telemetry-payload' },
  { byte: '00', label: 'Power MSB', name: 'Power Watts (High Byte)', description: 'Turbine Power MSB. High-order 8 bits of generated wattage.', group: 'telemetry-payload' },
  { byte: 'C8', label: 'Power LSB', name: 'Power Watts (Low Byte)', description: 'Turbine Power LSB. 0x00C8 decodes to 200 Watts. Sentinel 65280 is normalized to 0.', group: 'telemetry-payload' },
  { byte: '02', label: 'Voltage MSB', name: 'AC Volts (High Byte)', description: 'Turbine Internal Voltage MSB. High-order 8 bits.', group: 'telemetry-payload' },
  { byte: 'E6', label: 'Voltage LSB', name: 'AC Volts (Low Byte)', description: 'Turbine Internal Voltage LSB. 0x02E6 decodes to 74.2 Volts (coefficient scales by 10).', group: 'telemetry-payload' },
  { byte: '0F', label: 'Signal RSSI', name: 'Signal Strength (RSSI)', description: 'RSSI value (0x0F) in dBm. Used to measure antenna health and distance alignment.', group: 'telemetry-payload' },
  { byte: '10', label: 'SIP DLE End', name: 'SIP End (DLE)', description: 'SIP Encapsulation Termination - DLE (0x10). Tells the parser the stream payload has finished.', group: 'sip-marker' },
  { byte: '03', label: 'SIP ETX End', name: 'SIP End (ETX)', description: 'SIP Encapsulation Termination - ETX (0x03). Marks final telemetry boundary.', group: 'sip-marker' },
  { byte: 'FA', label: 'Frame Checksum', name: 'XBee Frame Checksum', description: 'XBee Checksum (0xFA). Wire integrity validation. 0xFF minus the 8-bit sum of all bytes in the frame.', group: 'checksum' }
];

const StreamviewHome = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'reviewers'>('reviewers');
  const [selectedByteIndex, setSelectedByteIndex] = useState<number>(17); // RPM MSB default

  const selectedByte = HEX_PACKET[selectedByteIndex];

  return (
    <div className="streamview-container">
      <div className="streamview-wrapper">
        
        {/* Hero Banner */}
        <section className="streamview-hero">
          <img
            src="/assets/img/streamview_icon.png"
            alt="Streamview Glowing Telemetry Turbine Icon"
            className="streamview-hero-icon"
          />
          <div className="streamview-badge">IoT Project Case Study</div>
          <h1 className="streamview-title">Streamview</h1>
          <p className="streamview-subtitle">Modern Turbine Telemetry, Rebuilt From the Wire Up</p>
          <p className="streamview-lead">
            A comprehensive, digital transformation that modernized a legacy 32-bit proprietary Windows desktop app 
            into a cloud-native, multi-platform telemetry pipeline for Skystream wind turbines. Built on FastAPI, 
            PostgreSQL, Flutter, and a customized Raspberry Pi appliance image.
          </p>
          <div className="streamview-cta-group">
            <a href="#architecture" className="streamview-cta-primary">
              Explore Architecture
            </a>
            <a href="#hex-inspector" className="streamview-cta-secondary">
              Inspect Protocol
            </a>
          </div>
        </section>

        {/* Dynamic Audience Split Sections */}
        <section className="audience-section">
          <div className="audience-tabs-container">
            <div className="audience-tabs">
              <button
                className={`audience-tab ${activeTab === 'reviewers' ? 'active' : ''}`}
                onClick={() => setActiveTab('reviewers')}
              >
                🛠️ Technical Deep-Dive
              </button>
              <button
                className={`audience-tab ${activeTab === 'users' ? 'active' : ''}`}
                onClick={() => setActiveTab('users')}
              >
                🏠 Outcomes & Features
              </button>
            </div>
          </div>

          <div className="audience-content">
            {activeTab === 'reviewers' ? (
              <div className="streamview-grid">
                
                <Card variant="div" className="streamview-card streamview-card-accent-green">
                  <CardContent>
                    <span className="streamview-feature-icon">🔌</span>
                    <CardTitle>Hardware Archaeology</CardTitle>
                    <p className="text-secondary font-medium mb-2 text-sm" style={{ color: '#34d399' }}>Protocol Reverse-Engineering</p>
                    <CardDescription>
                      Mapped undocumented serial protocols over FTDI hardware interfaces. Reconstructed XBee API frames, 
                      escaped DLE bytes, dynamic SIP packet framing, and hidden metadata keys, reviving legacy physical telemetry paths.
                    </CardDescription>
                  </CardContent>
                </Card>

                <Card variant="div" className="streamview-card streamview-card-accent-blue">
                  <CardContent>
                    <span className="streamview-feature-icon">🔁</span>
                    <CardTitle>Dual-Parser Parity</CardTitle>
                    <p className="text-secondary font-medium mb-2 text-sm" style={{ color: '#06b6d4' }}>Golden Protocol Fixtures</p>
                    <CardDescription>
                      Engineered independent parser layers in both Python (for local/appliance daemon) and Dart (for Flutter mobile client). 
                      Maintains strict parsing behavior and correctness through a shared suite of JSON protocol test fixtures.
                    </CardDescription>
                  </CardContent>
                </Card>

                <Card variant="div" className="streamview-card streamview-card-accent-green">
                  <CardContent>
                    <span className="streamview-feature-icon">📈</span>
                    <CardTitle>Time-Series Hypertables</CardTitle>
                    <p className="text-secondary font-medium mb-2 text-sm" style={{ color: '#34d399' }}>TimescaleDB & PostgreSQL</p>
                    <CardDescription>
                      Modeled high-frequency incoming data streams using TimescaleDB hypertables, custom aggregate rollups 
                      (1s to 1d intervals), and proactive chunk-compression rules, optimizing JSON queries and dashboard speed.
                    </CardDescription>
                  </CardContent>
                </Card>

                <Card variant="div" className="streamview-card streamview-card-accent-blue">
                  <CardContent>
                    <span className="streamview-feature-icon">📦</span>
                    <CardTitle>Arm64 Linux Appliance</CardTitle>
                    <p className="text-secondary font-medium mb-2 text-sm" style={{ color: '#06b6d4' }}>Raspberry Pi Base Station</p>
                    <CardDescription>
                      Created a production-ready Raspberry Pi 4 operating image. Runs a customized systemd service stack, serves the 
                      local control API, handles automatic Wi-Fi setup AP provisioning, and locks down active serial drivers.
                    </CardDescription>
                  </CardContent>
                </Card>

                <Card variant="div" className="streamview-card streamview-card-accent-green">
                  <CardContent>
                    <span className="streamview-feature-icon">🔒</span>
                    <CardTitle>OTA Cryptographic Updates</CardTitle>
                    <p className="text-secondary font-medium mb-2 text-sm" style={{ color: '#34d399' }}>Ed25519 Signed Packages</p>
                    <CardDescription>
                      Designed a robust, resilient Over-The-Air deployment flow. Packages are verified on-device via Ed25519 signatures, 
                      validated with SHA-256 hashes, tested against live endpoints, and support auto-rollback if diagnostics fail.
                    </CardDescription>
                  </CardContent>
                </Card>

                <Card variant="div" className="streamview-card streamview-card-accent-blue">
                  <CardContent>
                    <span className="streamview-feature-icon">☁️</span>
                    <CardTitle>Ingest Idempotency</CardTitle>
                    <p className="text-secondary font-medium mb-2 text-sm" style={{ color: '#06b6d4' }}>FastAPI Telemetry Hub</p>
                    <CardDescription>
                      Built high-throughput, secure REST gateways with JWT token authentication, client-generated sample de-duplication, 
                      durable SQLite client queues, and transactional Postgres sync for reliable data capture.
                    </CardDescription>
                  </CardContent>
                </Card>

              </div>
            ) : (
              <div className="streamview-grid">
                
                <Card variant="div" className="streamview-card">
                  <CardContent>
                    <span className="streamview-feature-icon">📊</span>
                    <CardTitle>Real-Time Dials</CardTitle>
                    <CardDescription>
                      Monitor instantaneous wind speeds, turbine rotations (RPM), power generation (Watts), AC grid voltages, 
                      current draw, line frequency, and receiver signal strength (RSSI) inside a modern dashboard.
                    </CardDescription>
                  </CardContent>
                </Card>

                <Card variant="div" className="streamview-card">
                  <CardContent>
                    <span className="streamview-feature-icon">📶</span>
                    <CardTitle>Offline-First Access</CardTitle>
                    <CardDescription>
                      Keep logging data even in isolated locations. Telemetry is saved locally in a robust guest database. 
                      Your monitoring stays 100% active without needing active internet access near the wind turbine.
                    </CardDescription>
                  </CardContent>
                </Card>

                <Card variant="div" className="streamview-card">
                  <CardContent>
                    <span className="streamview-feature-icon">📱</span>
                    <CardTitle>Seamless Sync</CardTitle>
                    <CardDescription>
                      Create an account and sign in to sync stored telemetry queue automatically. Access comprehensive, 
                      long-term dashboards, remote diagnostic logs, and energy charts from any phone or computer worldwide.
                    </CardDescription>
                  </CardContent>
                </Card>

                <Card variant="div" className="streamview-card">
                  <CardContent>
                    <span className="streamview-feature-icon">🔌</span>
                    <CardTitle>Direct USB Connection</CardTitle>
                    <CardDescription>
                      Plug the turbine's XBee receiver module directly into your Android phone, tablet, or PC to establish an 
                      instant serial diagnostics session, polling telemetry data without complex gateways.
                    </CardDescription>
                  </CardContent>
                </Card>

                <Card variant="div" className="streamview-card">
                  <CardContent>
                    <span className="streamview-feature-icon">🖥️</span>
                    <CardTitle>HDMI Local Kiosk</CardTitle>
                    <CardDescription>
                      Connect your Raspberry Pi base station to a physical monitor to launch a sleek, full-screen kiosk dashboard, 
                      delivering a high-performance local turbine monitoring terminal over your home LAN.
                    </CardDescription>
                  </CardContent>
                </Card>

                <Card variant="div" className="streamview-card">
                  <CardContent>
                    <span className="streamview-feature-icon">⚡</span>
                    <CardTitle>Active Sentinel Care</CardTitle>
                    <CardDescription>
                      Displays accurate readings and statuses. The protocol layer filters out standard hardware idle/out-of-range 
                      sentinel flags (e.g. 256 RPM or 65280W limits), normalizing output values for seamless reading.
                    </CardDescription>
                  </CardContent>
                </Card>

              </div>
            )}
          </div>
        </section>

        {/* CSS-Based Architecture Pipeline */}
        <section id="architecture" className="pipeline-section">
          <h2 className="section-title-gradient">
            <span>⚙️</span> The Telemetry Pipeline
          </h2>
          <div className="pipeline-flow">
            <div className="pipeline-connector pipeline-connector-1"></div>
            <div className="pipeline-connector pipeline-connector-2"></div>
            <div className="pipeline-connector pipeline-connector-3"></div>

            <div className="pipeline-node">
              <span className="pipeline-node-number">1</span>
              <span className="pipeline-node-icon">🌀</span>
              <h3 className="pipeline-node-title">Skystream Turbine</h3>
              <p className="pipeline-node-desc">Transmits binary packets over RF using an integrated XBee transceiver.</p>
            </div>

            <div className="pipeline-node">
              <span className="pipeline-node-number">2</span>
              <span className="pipeline-node-icon">🎛️</span>
              <h3 className="pipeline-node-title">Base Station / App</h3>
              <p className="pipeline-node-desc">Receives frames through serial FTDI, decodes API packets, and logs locally to SQLite WAL.</p>
            </div>

            <div className="pipeline-node">
              <span className="pipeline-node-number">3</span>
              <span className="pipeline-node-icon">☁️</span>
              <h3 className="pipeline-node-title">FastAPI Backend</h3>
              <p className="pipeline-node-desc">Receives queued telemetry batches via JWT authenticated endpoints with deduplication checks.</p>
            </div>

            <div className="pipeline-node">
              <span className="pipeline-node-number">4</span>
              <span className="pipeline-node-icon">📊</span>
              <h3 className="pipeline-node-title">Timescale DB</h3>
              <p className="pipeline-node-desc">Stores hypertables, runs continuous rollup views, and compresses historical data blocks.</p>
            </div>
          </div>
        </section>

        {/* Hex-Byte Protocol Explorer Section */}
        <section id="hex-inspector" className="rev-eng-section">
          <h2 className="section-title-gradient">
            <span>🔍</span> Reverse-Engineered Binary Stream
          </h2>
          <div className="rev-eng-container">
            <div className="rev-eng-grid">
              
              <div className="rev-eng-text">
                <h3 className="rev-eng-highlight-title">Decoded Live From The Wire</h3>
                <p className="rev-eng-desc">
                  Wind turbine telemetry doesn't come in convenient JSON payloads. The system extracts data directly from XBee API frames 
                  (beginning with the <code>0x7E</code> start marker) and decodes wrapped <strong>SIP telemetry streams</strong>. 
                  Idle sentinel values are carefully filtered and metadata frames are cached dynamically.
                </p>
                <p className="rev-eng-desc" style={{ fontSize: '0.95rem', opacity: 0.8 }}>
                  💡 <strong>Try it:</strong> Click on any byte in the real binary frame to inspect the parser's logic and understand how 
                  undocumented telemetry values were mapped.
                </p>
              </div>

              <div>
                <div className="byte-inspector-card">
                  <div className="inspector-meta">Interactive Hex Frame</div>
                  <div className="byte-row">
                    {HEX_PACKET.map((item, index) => (
                      <span
                        key={index}
                        className={`byte-cell ${index === selectedByteIndex ? 'selected' : ''} ${item.group === 'sip-marker' || item.group === 'telemetry-payload' ? 'header-byte' : ''}`}
                        onClick={() => setSelectedByteIndex(index)}
                        title={item.label}
                      >
                        {item.byte}
                      </span>
                    ))}
                  </div>

                  <div className="inspector-output">
                    <div className="inspector-meta">Hex Field Inspector</div>
                    {selectedByte && (
                      <div className="inspector-value">
                        Byte Offset <strong>{selectedByteIndex}</strong>: <span className={selectedByte.group === 'sip-marker' || selectedByte.group === 'telemetry-payload' ? 'highlight' : 'header-highlight'}>{selectedByte.name}</span>
                        <p style={{ marginTop: '0.5rem', color: '#94a3b8', fontSize: '0.9rem', fontFamily: 'var(--ff-primary)', lineHeight: 1.4 }}>
                          {selectedByte.description}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Technical Daemon / Service Specs */}
        <section className="specs-section">
          <h2 className="section-title-gradient">
            <span>🛰️</span> Daemon Services & API Spec
          </h2>
          <div className="streamview-grid" style={{ marginBottom: '2.5rem' }}>
            
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Base Station Systemd Daemons</th>
                    <th>Role</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><span className="spec-tag">skyview-network.service</span></td>
                    <td>Ethernet & fallback Wi-Fi SSID management</td>
                  </tr>
                  <tr>
                    <td><span className="spec-tag">skyview-ftdi-bind.service</span></td>
                    <td>Binds serial interface dynamically to udev rule</td>
                  </tr>
                  <tr>
                    <td><span className="spec-tag">skyview-telemetry.service</span></td>
                    <td>Exclusive serial listener & SQLite collector daemon</td>
                  </tr>
                  <tr>
                    <td><span className="spec-tag">skyview-web.service</span></td>
                    <td>Serves local control APIs and dashboard assets</td>
                  </tr>
                  <tr>
                    <td><span className="spec-tag">skyview-kiosk.service</span></td>
                    <td>Chromium kiosk shell powered by Cage window manager</td>
                  </tr>
                  <tr>
                    <td><span className="spec-tag">skyview-updater.service</span></td>
                    <td>Monitors and executes signed OTA system updates</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Remote FastAPI Endpoints</th>
                    <th>Method & Path</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Account registration</td>
                    <td><span className="spec-tag method-post">POST /auth/signup</span></td>
                  </tr>
                  <tr>
                    <td>Token retrieval</td>
                    <td><span className="spec-tag method-post">POST /auth/login</span></td>
                  </tr>
                  <tr>
                    <td>List user devices</td>
                    <td><span className="spec-tag method-get">GET /devices</span></td>
                  </tr>
                  <tr>
                    <td>Telemetry batch ingest</td>
                    <td><span className="spec-tag method-post">POST /telemetry/batch</span></td>
                  </tr>
                  <tr>
                    <td>Retrieve device latest status</td>
                    <td><span className="spec-tag method-get">GET /devices/{"{id}"}/latest</span></td>
                  </tr>
                  <tr>
                    <td>OTA Check manifest</td>
                    <td><span className="spec-tag method-post">POST /pi/api/ota/check</span></td>
                  </tr>
                </tbody>
              </table>
            </div>

          </div>
        </section>

        {/* Resume Ready bullets and Tech stacks */}
        <section className="rev-eng-section" style={{ marginTop: 0 }}>
          <div className="rev-eng-container" style={{ background: 'rgba(30, 41, 59, 0.2)' }}>
            <h2 className="streamview-card-title" style={{ fontSize: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
              Resume-Ready Engineering Metrics
            </h2>
            <ul className="resume-bullets-list">
              <li className="resume-bullet-item">
                <strong>Reverse-Engineered Binary Protocols</strong>: Reconstructed legacy turbine data streams by mapping frame delimiters, MAC headers, 
                escaping rules, and internal metrics from hardware streams under a strict two-week sprint.
              </li>
              <li className="resume-bullet-item">
                <strong>Tested Dual-Language Parsers</strong>: Wrote fully compliant XBee parsers in Python (server) and Dart (client), validating 
                decoding logic under cross-language golden test fixtures.
              </li>
              <li className="resume-bullet-item">
                <strong>Durable SQLite Sync Queues</strong>: Designed transaction-based local logging featuring WAL-mode SQLite queries and an idempotent 
                FastAPI network ingest pipeline to protect telemetry collection during drops.
              </li>
              <li className="resume-bullet-item">
                <strong>TimescaleDB Hypertables & Continuous Aggregates</strong>: Enabled high-performance time-series modeling with proactive PostgreSQL rollup 
                views (1-second to 1-day chunks) and compression rules for long-term historical charts.
              </li>
              <li className="resume-bullet-item">
                <strong>Embedded Arm64 Linux Base Stations</strong>: Configured customizable Raspberry Pi 4 operating images with systemd services for networks, 
                FTDI serial mappings, kiosk rendering, thermal regulation, and Ed25519-signed OTA updates.
              </li>
            </ul>

            <h3 className="streamview-card-title" style={{ fontSize: '1.1rem', marginTop: '2rem' }}>Comprehensive Technology Stack</h3>
            <div className="tech-chips">
              <span className="tech-chip">🐍 Python</span>
              <span className="tech-chip">⚡ FastAPI</span>
              <span className="tech-chip">🐦 Flutter</span>
              <span className="tech-chip">🎯 Dart</span>
              <span className="tech-chip">🐘 PostgreSQL</span>
              <span className="tech-chip">📈 TimescaleDB</span>
              <span className="tech-chip">🗃️ SQLite</span>
              <span className="tech-chip">🐳 Docker</span>
              <span className="tech-chip">🍓 Raspberry Pi 4</span>
              <span className="tech-chip">⚙️ systemd</span>
              <span className="tech-chip">🔑 Ed25519 Signed OTA</span>
              <span className="tech-chip">📊 fl_chart</span>
            </div>
          </div>
        </section>

        {/* Built Carefully / Caveats Section */}
        <section className="caveats-section">
          <div className="caveats-container">
            <h3 className="caveats-title">🛡️ Engineering Trust & Ongoing Research</h3>
            <div className="caveats-grid">
              <div>
                <div className="caveat-item-title">Under Active Development</div>
                <div className="caveat-item-desc">Streamview is in a coming-soon state. Android serial connectivity represents the primary tested hardware path.</div>
              </div>
              <div>
                <div className="caveat-item-title">Conservative History Decoding</div>
                <div className="caveat-item-desc">Daily energy values are verified via 0x27 packet deltas. Advanced metrics (historical power charts) are locked to read-only until validated.</div>
              </div>
              <div>
                <div className="caveat-item-title">Cross-Platform Scope</div>
                <div className="caveat-item-desc">Android USB integration works seamlessly. Desktop builds (Windows/Linux) and Raspberry Pi kiosks are operational, with future iOS support in progress.</div>
              </div>
            </div>
          </div>
        </section>

        {/* Symmetrical Mini-Footer */}
        <footer className="streamview-footer">
          <div className="streamview-footer-content">
            <div className="streamview-footer-logo">
              <img src="/assets/img/streamview_icon.png" alt="" />
              <span>Streamview</span>
            </div>
            <div className="streamview-footer-links">
              <Link to="/">Back to Portfolio</Link>
              <Link to="/zenith">Visit Zenith Player</Link>
            </div>
            <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem', margin: 0 }}>
              &copy; {new Date().getFullYear()} Streamview Case Study. All Rights Reserved.
            </p>
          </div>
        </footer>

      </div>
    </div>
  );
};

export default StreamviewHome;
