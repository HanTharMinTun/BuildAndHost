import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';

interface DeployConfig {
    subdomain: string;
    customDomain: string;
    ssl: boolean;
}

export default function Deploy() {
    const navigate = useNavigate();
    const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
    const [config, setConfig] = useState<DeployConfig>({
        subdomain: '',
        customDomain: '',
        ssl: true,
    });
    const [deploying, setDeploying] = useState(false);
    const [deployed, setDeployed] = useState(false);
    const [deployUrl, setDeployUrl] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            navigate('/login');
        }
    }, [authLoading, isAuthenticated, navigate]);

    const validateSubdomain = (value: string): boolean => {
        const regex = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/;
        return regex.test(value) && value.length >= 3 && value.length <= 63;
    };

    const validateDomain = (value: string): boolean => {
        if (!value) return true;
        const regex = /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/;
        return regex.test(value);
    };

    const handleDeploy = async () => {
        setError('');

        if (!config.subdomain) {
            setError('Subdomain is required');
            return;
        }

        if (!validateSubdomain(config.subdomain)) {
            setError('Invalid subdomain format. Use lowercase letters, numbers, and hyphens only.');
            return;
        }

        if (config.customDomain && !validateDomain(config.customDomain)) {
            setError('Invalid custom domain format');
            return;
        }

        setDeploying(true);

        try {
            // Simulate deployment
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const url = config.customDomain || `${config.subdomain}.buildandhost.app`;
            setDeployUrl(`https://${url}`);
            setDeployed(true);
        } catch (err) {
            setError('Deployment failed. Please try again.');
        } finally {
            setDeploying(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            {/* Animated background */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -left-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>

            {/* Navigation Bar */}
            <nav className="relative z-10 bg-white/10 backdrop-blur-md border-b border-white/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link to="/" className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-lg">
                                AI
                            </div>
                            <span className="text-xl font-bold text-white">BuildAndHost</span>
                        </Link>
                        <div className="flex items-center gap-4">
                            {user && (
                                <>
                                    <span className="text-white/80 text-sm">
                                        <span className="font-semibold text-white">{user.username}</span>
                                    </span>
                                    <button
                                        onClick={() => {
                                            logout();
                                            navigate('/login');
                                        }}
                                        className="px-4 py-2 bg-white/20 backdrop-blur border border-white/30 rounded-lg text-white font-medium hover:bg-white/30 transition-all"
                                    >
                                        Logout
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">Deploy Configuration</h1>
                    <p className="text-white/70">Configure your domain and deploy your website</p>
                </div>

                {!deployed ? (
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8">
                        {/* Subdomain Configuration */}
                        <div className="mb-6">
                            <label className="block text-white font-semibold mb-2">
                                Subdomain <span className="text-red-400">*</span>
                            </label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={config.subdomain}
                                    onChange={(e) => setConfig({ ...config, subdomain: e.target.value.toLowerCase() })}
                                    placeholder="mysite"
                                    className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 transition-all"
                                />
                                <span className="text-white/70 font-mono">.buildandhost.app</span>
                            </div>
                            <p className="text-white/50 text-sm mt-2">
                                Choose a unique subdomain for your website (3-63 characters, lowercase letters, numbers, hyphens)
                            </p>
                        </div>

                        {/* Custom Domain */}
                        <div className="mb-6">
                            <label className="block text-white font-semibold mb-2">
                                Custom Domain <span className="text-white/50 text-sm font-normal">(Optional)</span>
                            </label>
                            <input
                                type="text"
                                value={config.customDomain}
                                onChange={(e) => setConfig({ ...config, customDomain: e.target.value.toLowerCase() })}
                                placeholder="hanthar.mydomain.com"
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 transition-all"
                            />
                            <p className="text-white/50 text-sm mt-2">
                                Use your own domain name (you'll need to configure DNS settings)
                            </p>
                        </div>

                        {/* SSL Toggle */}
                        <div className="mb-8">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={config.ssl}
                                    onChange={(e) => setConfig({ ...config, ssl: e.target.checked })}
                                    className="w-5 h-5 rounded bg-white/10 border-white/20 text-indigo-600 focus:ring-2 focus:ring-indigo-500/50"
                                />
                                <div>
                                    <span className="text-white font-semibold group-hover:text-indigo-300 transition-colors">
                                        Enable SSL Certificate
                                    </span>
                                    <p className="text-white/50 text-sm">
                                        Automatically provision and renew SSL certificates (Recommended)
                                    </p>
                                </div>
                            </label>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="mb-6 bg-red-500/20 border border-red-500/50 rounded-xl p-4">
                                <p className="text-red-200">{error}</p>
                            </div>
                        )}

                        {/* Deploy Button */}
                        <button
                            onClick={handleDeploy}
                            disabled={deploying || !config.subdomain}
                            className="w-full px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-lg font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-3"
                        >
                            {deploying ? (
                                <>
                                    <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Deploying...
                                </>
                            ) : (
                                <>
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>
                                    Deploy Website
                                </>
                            )}
                        </button>

                        {/* Info Box */}
                        <div className="mt-6 bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                            <div className="flex gap-3">
                                <svg className="w-5 h-5 text-blue-300 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div className="text-blue-200 text-sm">
                                    <p className="font-semibold mb-1">Deployment Information</p>
                                    <ul className="list-disc list-inside space-y-1 text-blue-200/80">
                                        <li>Deployment typically takes 30-60 seconds</li>
                                        <li>SSL certificates are provisioned automatically</li>
                                        <li>Your website will be globally distributed via CDN</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 text-center">
                        {/* Success State */}
                        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>

                        <h2 className="text-3xl font-bold text-white mb-2">🎉 Deployment Successful!</h2>
                        <p className="text-white/70 mb-8">Your website is now live and accessible worldwide</p>

                        <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-8">
                            <p className="text-white/60 text-sm mb-2">Your website is available at:</p>
                            <a
                                href={deployUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-2xl font-bold text-indigo-300 hover:text-indigo-200 transition-colors break-all"
                            >
                                {deployUrl}
                            </a>
                        </div>

                        <div className="flex gap-4 justify-center">
                            <a
                                href={deployUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                                Visit Website
                            </a>
                            <button
                                onClick={() => setDeployed(false)}
                                className="px-6 py-3 bg-white/10 border border-white/20 text-white font-semibold rounded-xl hover:bg-white/20 transition-all"
                            >
                                Deploy Another
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
                
                .animate-pulse {
                    animation: pulse 2s ease-in-out infinite;
                }
                
                .delay-1000 {
                    animation-delay: 1s;
                }
            `}</style>
        </div>
    );
}
