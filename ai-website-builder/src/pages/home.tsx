import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';

export default function Home() {
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();

    const features = [
        {
            icon: '🤖',
            title: 'AI Chat',
            description: 'Describe your website and let AI build it for you',
            link: '/chat',
            gradient: 'from-blue-500 to-cyan-500',
        },
        {
            icon: '✏️',
            title: 'Visual Editor',
            description: 'Customize and edit your website visually',
            link: '/editor',
            gradient: 'from-purple-500 to-pink-500',
        },
        {
            icon: '🌐',
            title: 'Generated Websites',
            description: 'View and manage all your generated websites',
            link: '/websites',
            gradient: 'from-green-500 to-teal-500',
        },
        {
            icon: '🚀',
            title: 'Deploy',
            description: 'Configure domain and deploy your website',
            link: '/deploy',
            gradient: 'from-orange-500 to-red-500',
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -left-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/2 w-60 h-60 bg-pink-500/10 rounded-full blur-3xl"></div>
            </div>

            {/* Navigation Bar */}
            <nav className="relative z-10 bg-white/10 backdrop-blur-md border-b border-white/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-lg">
                                AI
                            </div>
                            <span className="text-xl font-bold text-white">BuildAndHost</span>
                        </div>
                        <div className="flex items-center gap-4">
                            {isAuthenticated && user ? (
                                <>
                                    <span className="text-white/80 text-sm">
                                        Welcome, <span className="font-semibold text-white">{user.username}</span>
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
                            ) : (
                                <>
                                    <Link
                                        to="/login"
                                        className="px-4 py-2 text-white font-medium hover:text-white/80 transition-colors"
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        to="/register"
                                        className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                                    >
                                        Get Started
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
                <div className="text-center">
                    <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-tight">
                        Build Websites with
                        <span className="block bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                            Artificial Intelligence
                        </span>
                    </h1>
                    <p className="text-xl sm:text-2xl text-white/80 mb-12 max-w-3xl mx-auto leading-relaxed">
                        Describe your vision, and watch AI create a beautiful, functional website in seconds.
                        No coding required.
                    </p>
                    <Link
                        to="/chat"
                        className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-lg font-bold rounded-xl shadow-2xl hover:shadow-purple-500/50 hover:scale-105 transition-all"
                    >
                        <span>Start Building</span>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                    </Link>
                </div>
            </div>

            {/* Features Grid */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {features.map((feature, index) => (
                        <Link
                            key={index}
                            to={feature.link}
                            className="group relative bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 hover:bg-white/20 hover:scale-105 transition-all duration-300 hover:shadow-2xl"
                        >
                            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-3xl mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-cyan-400 group-hover:to-purple-400 group-hover:bg-clip-text transition-all">
                                {feature.title}
                            </h3>
                            <p className="text-white/70 text-sm leading-relaxed">
                                {feature.description}
                            </p>
                            <div className="absolute bottom-4 right-4 text-white/40 group-hover:text-white/80 group-hover:translate-x-1 transition-all">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* CTA Section */}
            {!isAuthenticated && (
                <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="bg-gradient-to-r from-indigo-600/80 to-purple-600/80 backdrop-blur-xl border border-white/20 rounded-3xl p-8 sm:p-12 text-center shadow-2xl">
                        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                            Ready to Build Your Dream Website?
                        </h2>
                        <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
                            Join thousands of creators who are building stunning websites with AI. Start for free today.
                        </p>
                        <Link
                            to="/register"
                            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-purple-600 text-lg font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                        >
                            Create Free Account
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </Link>
                    </div>
                </div>
            )}

            {/* Footer */}
            <footer className="relative z-10 border-t border-white/10 bg-black/20 backdrop-blur-md mt-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="text-white/60 text-sm">
                            © 2026 BuildAndHost. All rights reserved.
                        </div>
                        <div className="flex items-center gap-6 text-white/60 text-sm">
                            <a href="#" className="hover:text-white transition-colors">Privacy</a>
                            <a href="#" className="hover:text-white transition-colors">Terms</a>
                            <a href="#" className="hover:text-white transition-colors">Support</a>
                        </div>
                    </div>
                </div>
            </footer>

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
