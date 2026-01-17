import { Link } from 'react-router-dom';
import Card, { CardContent, CardTitle, CardDescription } from '../../shared/Card';
import './Zenith.css';

const ZenithToS = () => {
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
                            <h1 className="text-4xl font-bold">Terms of Service</h1>
                            <p className="text-secondary text-sm">Last Updated: January 2026</p>
                        </div>
                    </div>

                    <div className="mb-8 text-center">
                        <p className="text-xl text-secondary">
                            By using Zenith, you agree to these terms.
                        </p>
                    </div>

                    <div className="zenith-features-grid" style={{ margin: '2rem 0' }}>

                        <Card variant="div">
                            <CardContent>
                                <CardTitle>Your Content</CardTitle>
                                <CardDescription>
                                    Zenith is a player—not a host. You are solely responsible for the media you access, stream, or download. We don't verify, monitor, or endorse any content.
                                </CardDescription>
                            </CardContent>
                        </Card>

                        <Card variant="div">
                            <CardContent>
                                <CardTitle>Third-Party Services</CardTitle>
                                <CardDescription>
                                    When connecting to services like Jellyfin or Google Drive, you must comply with their terms. We aren't responsible for outages, content, or account suspensions.
                                </CardDescription>
                            </CardContent>
                        </Card>

                        <Card variant="div">
                            <CardContent>
                                <CardTitle>Zenith Pro</CardTitle>
                                <CardDescription>
                                    In-app purchases are subject to App Store terms. Purchases are non-refundable except as required by law.
                                </CardDescription>
                            </CardContent>
                        </Card>

                        <Card variant="div">
                            <CardContent>
                                <CardTitle>No Warranty</CardTitle>
                                <CardDescription>
                                    Zenith is provided "as is." We don't guarantee compatibility, uninterrupted service, or feature permanence.
                                </CardDescription>
                            </CardContent>
                        </Card>

                        <Card variant="div">
                            <CardContent>
                                <CardTitle>Limitation of Liability</CardTitle>
                                <CardDescription>
                                    We are not liable for lost/corrupted media, data loss, or inability to access services.
                                </CardDescription>
                            </CardContent>
                        </Card>
                    </div>
                </section>

                <footer className="zenith-footer">
                    <p>Questions? Reach us at <a href="mailto:contact@nick-eb.dev" style={{ color: 'var(--accent)' }}>contact@nick-eb.dev</a></p>
                </footer>
            </div>
        </div>
    );
};

export default ZenithToS;
