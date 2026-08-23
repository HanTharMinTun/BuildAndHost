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
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2">Your Websites</h1>
                        <p className="text-white/70">Manage and edit your AI-generated websites</p>
                    </div>
                    <Link
                        to="/chat"
                        className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Create New Website
                    </Link>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="flex justify-center items-center py-20">
                        <div className="text-center">
                            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-white/70">Loading your websites...</p>
                        </div>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 mb-6">
                        <p className="text-red-200">{error}</p>
                    </div>
                )}

                {/* Empty State */}
                {!loading && websites.length === 0 && !error && (
                    <div className="text-center py-20">
                        <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-12 h-12 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">No websites yet</h2>
                        <p className="text-white/70 mb-6">Start building your first AI-powered website</p>
                        <Link
                            to="/chat"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all"
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
                        {websites.map((website) => (
                            <div
                                key={website.id}
                                className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl overflow-hidden hover:bg-white/15 transition-all group"
                            >
                                {/* Preview/Thumbnail */}
                                <div className="h-48 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center border-b border-white/10">
                                    <svg className="w-16 h-16 text-white/30 group-hover:text-white/50 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                                    </svg>
                                </div>

                                {/* Content */}
                                <div className="p-6">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1">
                                            <h3 className="text-lg font-bold text-white mb-1 truncate">
                                                {getWebsitePreview(website.website_json)}
                                            </h3>
                                            <p className="text-sm text-white/60">
                                                {getWebsiteType(website.website_json)} • v{website.version}
                                            </p>
                                        </div>
                                        <span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs font-medium rounded-full">
                                            Active
                                        </span>
                                    </div>

                                    <p className="text-sm text-white/60 mb-4">
                                        Created {new Date(website.created_at).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}
                                    </p>

                                    {/* Actions */}
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => openEditor(website)}
                                            className="flex-1 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg hover:shadow-lg hover:scale-105 transition-all flex items-center justify-center gap-2"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => deleteWebsite(website.id)}
                                            className="px-4 py-2 bg-red-500/20 text-red-300 font-medium rounded-lg hover:bg-red-500/30 transition-all"
                                            title="Delete website"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
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
