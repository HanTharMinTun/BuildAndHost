import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { api } from '../lib/api';
import type { GeneratedWebsite, Project } from '../lib/types';

interface WebsiteWithProject extends GeneratedWebsite {
    project?: Project;
}

export default function Websites() {
    const navigate = useNavigate();
    const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
    const [websites, setWebsites] = useState<WebsiteWithProject[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            navigate('/login');
        }
    }, [authLoading, isAuthenticated, navigate]);

    useEffect(() => {
        if (isAuthenticated) {
            loadWebsites();
        }
    }, [isAuthenticated]);

    async function loadWebsites() {
        setLoading(true);
        setError(null);
        
        try {
            const response = await api.get<GeneratedWebsite[]>('/api/websites');
            
            if (response.error) {
                setError(response.error);
                return;
            }

            if (response.data) {
                setWebsites(response.data);
            }
        } catch (err) {
            setError('Failed to load websites');
        } finally {
            setLoading(false);
        }
    }

    async function deleteWebsite(id: string) {
        if (!confirm('Are you sure you want to delete this website?')) {
            return;
        }

        const response = await api.delete(`/api/websites/${id}`);
        
        if (response.error) {
            alert('Failed to delete website');
            return;
        }

        setWebsites(websites.filter(w => w.id !== id));
    }

    function openEditor(website: GeneratedWebsite) {
        localStorage.setItem('website', JSON.stringify(website.website_json));
        localStorage.setItem('websiteId', website.id);
        navigate('/editor');
    }

    function getWebsitePreview(websiteJson: any): string {
        try {
            if (websiteJson.props?.title) {
                return websiteJson.props.title;
            }
            if (websiteJson.children?.[0]?.props?.title) {
                return websiteJson.children[0].props.title;
            }
            return 'Untitled Website';
        } catch {
            return 'Untitled Website';
        }
    }

    function getWebsiteType(websiteJson: any): string {
        try {
            const type = websiteJson.type || 'website';
            return type.charAt(0).toUpperCase() + type.slice(1);
        } catch {
            return 'Website';
        }
    }

    return (
        <div 
            className="min-h-screen overflow-hidden text-white p-0 m-0"
            style={{
                fontFamily: "'Playfair Display', 'Cormorant Garamond', 'Georgia', serif",
                background: 'radial-gradient(circle at 50% -10%, #1a0a2e 0%, #0a0615 28%, #05030a 65%, #020105 100%)',
            }}
        >
            {/* =========================================================
                GOOGLE FONTS & ANIMATIONS
            ========================================================= */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,800;1,400;1,600&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400&family=Inter:wght@300;400;500;600&display=swap');

                .font-luxury {
                    font-family: 'Playfair Display', 'Cormorant Garamond', serif;
                }

                .font-serif-light {
                    font-family: 'Cormorant Garamond', 'Playfair Display', serif;
                }

                .font-body {
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                }

                @keyframes float-slow {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    50% { transform: translate(30px, -30px) scale(1.08); }
                }

                @keyframes float-slower {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    50% { transform: translate(-30px, 30px) scale(1.12); }
                }

                @keyframes pulse-soft {
                    0%, 100% { opacity: 0.35; }
                    50% { opacity: 0.65; }
                }

                @keyframes shimmer {
                    0% { background-position: -200% center; }
                    100% { background-position: 200% center; }
                }

                @keyframes slide-up {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .animate-float-slow {
                    animation: float-slow 15s ease-in-out infinite;
                }

                .animate-float-slower {
                    animation: float-slower 20s ease-in-out infinite;
                }

                .animate-pulse-soft {
                    animation: pulse-soft 6s ease-in-out infinite;
                }

                .animate-slide-up {
                    animation: slide-up 0.6s ease-out forwards;
                }

                .text-shimmer {
                    background: linear-gradient(90deg, #fff 0%, #c4b5d4 25%, #a78bfa 50%, #c4b5d4 75%, #fff 100%);
                    background-size: 200% auto;
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    animation: shimmer 4s linear infinite;
                }

                .btn-primary {
                    background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 25%, #8b5cf6 50%, #7c3aed 75%, #6d28d9 100%);
                    background-size: 200% 200%;
                    box-shadow: 0 4px 25px rgba(251, 191, 36, 0.25);
                    transition: all 0.4s ease;
                    animation: gradient-shift 3s ease-in-out infinite;
                }

                .btn-primary:hover {
                    transform: translateY(-2px) scale(1.02);
                    box-shadow: 0 8px 35px rgba(251, 191, 36, 0.4);
                }

                .btn-secondary {
                    background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 50%, #6d28d9 100%);
                    box-shadow: 0 4px 20px rgba(139, 92, 246, 0.3);
                    transition: all 0.3s ease;
                }

                .btn-secondary:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 30px rgba(139, 92, 246, 0.5);
                }

                .btn-deploy {
                    background: linear-gradient(135deg, #34d399 0%, #10b981 50%, #059669 100%);
                    box-shadow: 0 4px 20px rgba(16, 185, 129, 0.3);
                    transition: all 0.3s ease;
                }

                .btn-deploy:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 30px rgba(16, 185, 129, 0.5);
                }

                .btn-delete {
                    background: linear-gradient(135deg, #f87171 0%, #ef4444 50%, #dc2626 100%);
                    box-shadow: 0 4px 20px rgba(239, 68, 68, 0.2);
                    transition: all 0.3s ease;
                }

                .btn-delete:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 30px rgba(239, 68, 68, 0.4);
                }

                .card-hover {
                    transition: all 0.4s ease;
                }

                .card-hover:hover {
                    transform: translateY(-4px);
                    border-color: rgba(251, 191, 36, 0.3);
                    box-shadow: 0 8px 40px rgba(251, 191, 36, 0.1);
                }

                @keyframes gradient-shift {
                    0%, 100% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                }
            `}</style>

            {/* =========================================================
                BACKGROUND - DARK LUXURY
            ========================================================= */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-72 left-1/2 -translate-x-1/2 w-[900px] h-[700px] rounded-full bg-purple-600/[0.12] blur-[160px] animate-pulse-soft" />
                <div className="absolute top-[25%] -left-72 w-[600px] h-[600px] rounded-full bg-amber-500/[0.06] blur-[150px] animate-float-slow" />
                <div className="absolute bottom-[-300px] right-[-200px] w-[700px] h-[700px] rounded-full bg-violet-600/[0.10] blur-[160px] animate-float-slower" />
                <div className="absolute top-[55%] left-[45%] w-[350px] h-[350px] rounded-full bg-amber-400/[0.04] blur-[120px]" />
                <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: 'linear-gradient(rgba(167,139,250,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(167,139,250,0.3) 1px, transparent 1px)', backgroundSize: '80px 80px' }} />
                <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-amber-400/40 rounded-full animate-float-slow"></div>
                <div className="absolute top-1/3 right-1/3 w-1.5 h-1.5 bg-purple-400/40 rounded-full animate-float-slower"></div>
                <div className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-amber-400/30 rounded-full animate-float-slow" style={{ animationDelay: '2s' }}></div>
                <div className="absolute top-2/3 right-1/4 w-1.5 h-1.5 bg-purple-400/30 rounded-full animate-float-slower" style={{ animationDelay: '3s' }}></div>
            </div>

            {/* =========================================================
                NAVIGATION - LUXURY
            ========================================================= */}
            <nav className="relative z-50 border-b border-white/[0.06] bg-[#05030a]/80 backdrop-blur-2xl">
                <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
                    <div className="h-[76px] flex items-center justify-between">
                        <Link to="/" className="flex items-center gap-3 group">
                            <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 via-purple-400 to-amber-300 p-[1px] shadow-lg shadow-purple-500/20 group-hover:scale-105 transition-transform">
                                <div className="w-full h-full rounded-[11px] bg-[#05030a] flex items-center justify-center">
                                    <span className="text-xs font-luxury font-bold tracking-widest bg-gradient-to-r from-amber-300 to-purple-400 bg-clip-text text-transparent">B&H</span>
                                </div>
                            </div>
                            <div>
                                <div className="font-luxury text-lg font-bold tracking-wide text-white">
                                    Build<span className="text-amber-400">And</span>Host
                                </div>
                                <div className="text-[9px] font-serif-light uppercase tracking-[0.3em] text-white/40">AI Website Builder</div>
                            </div>
                        </Link>

                        <div className="flex items-center gap-4">
                            {user && (
                                <>
                                    <span className="font-serif-light text-amber-200/60 text-sm tracking-wide">
                                        <span className="font-semibold text-amber-200">{user.username}</span>
                                    </span>
                                    <button
                                        onClick={() => {
                                            logout();
                                            navigate('/login');
                                        }}
                                        className="px-4 py-2.5 rounded-lg border border-white/[0.10] bg-white/[0.03] hover:bg-white/[0.08] text-sm font-body font-medium text-white/90 transition-all"
                                    >
                                        Logout
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* =========================================================
                MAIN CONTENT
            ========================================================= */}
            <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-12">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 animate-slide-up">
                    <div>
                        <div className="inline-flex items-center gap-3 text-[10px] font-serif-light uppercase tracking-[0.25em] text-amber-300 font-semibold mb-2">
                            <span className="w-8 h-px bg-amber-400/50" />
                            Your Portfolio
                        </div>
                        <h1 className="font-luxury text-4xl sm:text-5xl font-bold tracking-tight text-white">
                            Your Websites
                        </h1>
                        <p className="font-serif-light text-amber-200/40 mt-2 text-sm tracking-wide">
                            Manage and edit your AI-generated websites
                        </p>
                    </div>
                    <Link
                        to="/chat"
                        className="btn-primary inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-body font-semibold tracking-wide"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Create New Website
                    </Link>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="flex justify-center items-center py-20 animate-slide-up">
                        <div className="text-center">
                            <div className="w-16 h-16 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="font-serif-light text-amber-200/40 tracking-wide">Loading your websites...</p>
                        </div>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6 animate-slide-up">
                        <p className="font-serif-light text-red-200 tracking-wide">{error}</p>
                    </div>
                )}

                {/* Empty State */}
                {!loading && websites.length === 0 && !error && (
                    <div className="text-center py-20 animate-slide-up">
                        <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10">
                            <svg className="w-12 h-12 text-amber-300/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                            </svg>
                        </div>
                        <h2 className="font-luxury text-3xl font-bold text-white mb-2">No websites yet</h2>
                        <p className="font-serif-light text-amber-200/40 mb-6 tracking-wide">Start building your first AI-powered website</p>
                        <Link
                            to="/chat"
                            className="btn-primary inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-body font-semibold tracking-wide"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Create Your First Website
                        </Link>
                    </div>
                )}

                {/* Websites Grid */}
                {!loading && websites.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {websites.map((website, index) => (
                            <div
                                key={website.id}
                                className="card-hover bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden animate-slide-up"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                {/* Preview/Thumbnail */}
                                <div className="h-48 bg-gradient-to-br from-amber-500/10 via-purple-500/10 to-amber-400/5 flex items-center justify-center border-b border-white/10 relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-br from-amber-400/5 via-transparent to-purple-500/5"></div>
                                    <svg className="w-16 h-16 text-amber-300/20 group-hover:text-amber-300/40 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                                    </svg>
                                    <div className="absolute top-3 right-3">
                                        <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 text-[10px] font-serif-light rounded-full border border-emerald-500/20 tracking-wider">
                                            Active
                                        </span>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-6">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1">
                                            <h3 className="font-luxury text-lg font-bold text-white mb-1 truncate">
                                                {getWebsitePreview(website.website_json)}
                                            </h3>
                                            <p className="text-sm font-serif-light text-amber-200/40 tracking-wide">
                                                {getWebsiteType(website.website_json)} • v{website.version}
                                            </p>
                                        </div>
                                    </div>

                                    <p className="text-sm font-serif-light text-amber-200/30 mb-4 tracking-wide">
                                        Created {new Date(website.created_at).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}
                                    </p>

                                    {/* Actions */}
                                    <div className="flex flex-col gap-2">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => openEditor(website)}
                                                className="flex-1 btn-secondary px-4 py-2 rounded-lg text-white font-body font-medium flex items-center justify-center gap-2"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => navigate(`/deploy?websiteId=${website.id}`)}
                                                className="flex-1 btn-deploy px-4 py-2 rounded-lg text-white font-body font-medium flex items-center justify-center gap-2"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                                </svg>
                                                Deploy
                                            </button>
                                        </div>
                                        <button
                                            onClick={() => deleteWebsite(website.id)}
                                            className="w-full btn-delete px-4 py-2 rounded-lg text-white font-body font-medium flex items-center justify-center gap-2"
                                            title="Delete website"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}