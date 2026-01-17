import { Link } from 'react-router-dom';
import Card, { CardContent, CardTitle, CardDescription } from '../../shared/Card';
import './Zenith.css';

const ZenithHome = () => {
    return (
        <div className="home-container">
            <div className="content-wrapper">
                {/* Hero Section */}
                <section className="zenith-hero">
                    <img
                        src="/assets/img/Nereus.png"
                        alt="Zenith App Icon"
                        className="zenith-icon"
                    />

                    <h1 className="zenith-title">
                        Zenith
                    </h1>
                    <p className="zenith-subtitle">
                        Your Media. Everywhere.
                    </p>
                    <p className="zenith-description">
                        Stream from your Jellyfin server. Play files from Google Drive. Import your local library.
                    </p>

                    <button className="zenith-cta">
                        Coming Soon to App Store
                    </button>
                </section>

                {/* Features Grid */}
                <section className="section-container" style={{ display: 'block', paddingLeft: '2rem', paddingRight: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
                    <h2 className="section-title">Features</h2>
                    <div className="zenith-features-grid">
                        <Card variant="div">
                            <CardContent>
                                <span className="zenith-feature-icon">🎬</span>
                                <CardTitle>Play Anything</CardTitle>
                                <p className="text-secondary font-medium mb-2 text-sm" style={{ color: '#a855f7' }}>4K. Lossless. Free.</p>
                                <CardDescription>
                                    MKV, FLAC, HEVC—Zenith plays your files exactly as they are. No quality limits. No subscriptions.
                                </CardDescription>
                            </CardContent>
                        </Card>

                        <Card variant="div">
                            <CardContent>
                                <span className="zenith-feature-icon">📥</span>
                                <CardTitle>Take It Offline</CardTitle>
                                <CardDescription>
                                    Download for the road. Access your downloads directly from the Files app. Your media, your way.
                                </CardDescription>
                            </CardContent>
                        </Card>

                        <Card variant="div">
                            <CardContent>
                                <span className="zenith-feature-icon">🔖</span>
                                <CardTitle>Never Lose Place</CardTitle>
                                <CardDescription>
                                    Zenith remembers where you left off—across all your devices.
                                </CardDescription>
                            </CardContent>
                        </Card>

                        <Card variant="div">
                            <CardContent>
                                <span className="zenith-feature-icon">✏️</span>
                                <CardTitle>Make It Yours</CardTitle>
                                <CardDescription>
                                    Edit titles, posters, and descriptions for your local files. Your library, your rules.
                                </CardDescription>
                            </CardContent>
                        </Card>

                        <Card variant="div">
                            <CardContent>
                                <span className="zenith-feature-icon">📺</span>
                                <CardTitle>Jellyfin Integration</CardTitle>
                                <CardDescription>
                                    Connect to your personal Jellyfin server and stream your entire library on the go.
                                </CardDescription>
                            </CardContent>
                        </Card>

                        <Card variant="div">
                            <CardContent>
                                <span className="zenith-feature-icon">☁️</span>
                                <CardTitle>Google Drive</CardTitle>
                                <CardDescription>
                                    Access and play media directly from your Google Drive folders with secure OAuth.
                                </CardDescription>
                            </CardContent>
                        </Card>
                    </div>
                </section>

                {/* Zenith Pro Section */}
                <section className="section-container" style={{ display: 'block', paddingLeft: '2rem', paddingRight: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
                    <h2 className="section-title">Zenith <span style={{ color: '#a855f7' }}>Pro</span></h2>
                    <div className="zenith-pro-table-wrapper">
                        <table className="w-full">
                            <thead>
                                <tr>
                                    <th>Feature</th>
                                    <th className="text-center">Free</th>
                                    <th className="text-center" style={{ color: '#a855f7' }}>Pro</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Remote Sources</td>
                                    <td className="text-center">
                                        1 Source
                                        <div className="text-xs text-secondary font-normal mt-1">(Plus Local Files)</div>
                                    </td>
                                    <td className="text-center font-bold">All Sources</td>
                                </tr>
                                <tr>
                                    <td>Unified view</td>
                                    <td className="text-center">—</td>
                                    <td className="text-center font-bold">✓ "All Media" tab</td>
                                </tr>
                                <tr>
                                    <td>Metadata matching</td>
                                    <td className="text-center">Manual</td>
                                    <td className="text-center font-bold">✓ Smart matching</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <p className="text-center font-medium mt-6" style={{ color: '#a855f7' }}>
                        One-time purchase. No subscriptions.
                    </p>
                </section>

                {/* Footer */}
                <footer className="zenith-footer">
                    <div className="flex items-center gap-2">
                        <span>Zenith Media Player</span>
                    </div>
                    <div className="zenith-footer-links">
                        <Link to="/zenith/privacy-policy">Privacy Policy</Link>
                        <Link to="/zenith/tos">Terms of Service</Link>
                    </div>
                    <p>&copy; {new Date().getFullYear()} Zenith</p>
                </footer>
            </div>
        </div>
    );
};

export default ZenithHome;
