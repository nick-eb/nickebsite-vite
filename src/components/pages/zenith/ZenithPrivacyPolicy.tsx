import { Link } from 'react-router-dom';
import Card, { CardContent, CardTitle, CardDescription } from '../../shared/Card';
import './Zenith.css';

const ZenithPrivacyPolicy = () => {
    return (
        <div className="home-container">
            <div className="content-wrapper">
                <section className="section-container" style={{ display: 'block', paddingTop: '4rem', paddingLeft: '2rem', paddingRight: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
                    <Link to="/zenith" className="zenith-back-link">
                        &larr; Back to Zenith
                    </Link>

                    <div className="zenith-doc-header">
                        <img src="/assets/img/Nereus.png" alt="Zenith" className="zenith-doc-icon" />
                        <div>
                            <h1 className="text-4xl font-bold">Privacy Policy</h1>
                            <p className="text-secondary text-sm">Last Updated: January 2026</p>
                        </div>
                    </div>

                    <div className="zenith-short-version">
                        <h2 className="text-xl font-bold mb-2">The Short Version</h2>
                        <p className="text-2xl font-bold text-white mb-2">Your data stays yours.</p>
                        <p className="text-secondary">Zenith connects directly to your own services. We only collect information you explicitly opt in to share.</p>
                    </div>

                    <div className="zenith-policy-sections">
                        {/* What We Collect (Opt-In Only) */}
                        <div className="zenith-policy-section">
                            <h2 className="section-title text-left">What We Collect (Opt-In Only)</h2>
                            <p className="text-secondary mb-6">All data collection is <strong>opt-in</strong>. You choose what to share.</p>
                            <div className="zenith-policy-grid">
                                <Card variant="div">
                                    <CardContent>
                                        <CardTitle level={4}>Crash & Bug Reports</CardTitle>
                                        <CardDescription>
                                            If enabled, Zenith may send anonymized crash reports to help us fix bugs. These contain no personal data, media information, or credentials.
                                        </CardDescription>
                                    </CardContent>
                                </Card>

                                <Card variant="div">
                                    <CardContent>
                                        <CardTitle level={4}>Diagnostic Logging</CardTitle>
                                        <CardDescription>
                                            You can opt in to send depersonalized logs to help us diagnose issues. All identifying information is stripped before transmission.
                                        </CardDescription>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>

                        {/* iCloud Sync */}
                        <div className="zenith-policy-section">
                            <h2 className="section-title text-left">iCloud Sync</h2>
                            <div className="zenith-policy-grid">
                                <Card variant="div">
                                    <CardContent>
                                        <p className="text-secondary mb-4">
                                            Zenith uses <strong>your iCloud account</strong> to sync the following data across your devices:
                                        </p>
                                        <ul className="zenith-policy-list">
                                            <li><strong>Playback progress</strong> for local files and Google Drive media.</li>
                                            <li><strong>Custom metadata</strong> (titles, descriptions, artwork) you add to local/Drive content.</li>
                                        </ul>
                                        <p className="text-secondary mt-4">
                                            This data is stored in your private iCloud container and is never accessible to us. Jellyfin handles its own sync—Zenith does not duplicate this.
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>

                        {/* Your Connections */}
                        <div className="zenith-policy-section">
                            <h2 className="section-title text-left">Your Connections</h2>
                            <div className="zenith-policy-grid">
                                <Card variant="div">
                                    <CardContent>
                                        <CardTitle level={4}>Jellyfin Servers</CardTitle>
                                        <CardDescription>
                                            Your credentials are stored locally in your device's secure Keychain. Zenith connects directly to your server—we have no visibility into these connections.
                                        </CardDescription>
                                    </CardContent>
                                </Card>

                                <Card variant="div">
                                    <CardContent>
                                        <CardTitle level={4}>Google Drive</CardTitle>
                                        <CardDescription>
                                            Zenith uses Google's OAuth to access your Drive. We request only <code>drive.readonly</code> and <code>drive.appdata</code>. Credentials are managed by Google.
                                        </CardDescription>
                                    </CardContent>
                                </Card>

                                <Card variant="div">
                                    <CardContent>
                                        <CardTitle level={4}>Local Files</CardTitle>
                                        <CardDescription>
                                            Files you import stay on your device. We don't upload or sync them anywhere (metadata syncs via iCloud as described above).
                                        </CardDescription>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>

                        {/* Downloads */}
                        <div className="zenith-policy-section">
                            <h2 className="section-title text-left">Downloads</h2>
                            <div className="zenith-policy-grid">
                                <Card variant="div">
                                    <CardContent>
                                        <p className="text-secondary">
                                            Downloaded media is stored in your device's Documents folder, accessible via the Files app. This data never leaves your device unless you choose to share it.
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                </section>

                <footer className="zenith-footer">
                    <p>Questions? Reach us at <a href="mailto:contact@nick-eb.dev" style={{ color: 'var(--accent)' }}>contact@nick-eb.dev</a></p>
                </footer>
            </div>
        </div>
    );
};

export default ZenithPrivacyPolicy;
