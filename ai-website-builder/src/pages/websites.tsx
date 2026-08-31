import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { api } from '../lib/api';
import type { Project, GeneratedWebsite } from '../lib/types';

// Extended interface to handle Project data as Website cards
interface WebsiteWithProject extends Project {
    // Additional computed fields for display
    website_json?: any;  // Keep for editor compatibility
    version?: number;
}

// State for expanded prompts
interface ExpandedState {
    [projectId: string]: boolean;
}

export default function Websites() {
    const navigate = useNavigate();
    const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
    const [websites, setWebsites] = useState<WebsiteWithProject[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedPrompts, setExpandedPrompts] = useState<ExpandedState>({});
    const [editingWebsiteId, setEditingWebsiteId] = useState<string | null>(null);

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
            const response = await api.get<Project[]>('/api/projects');

            if (response.error) {
                setError(response.error);
                return;
            }

            if (response.data) {
                // Add minimal website_json for editor compatibility
                const transformedWebsites: WebsiteWithProject[] = response.data.map(project => ({
                    ...project,
                    website_json: {
                        title: project.name,
                        description: project.description || '',
                    },
                    version: 1,
                }));

                setWebsites(transformedWebsites);
            }
        } catch (err) {
            setError('Failed to load websites');
            console.error('Load error:', err);
        } finally {
            setLoading(false);
        }
    }

    async function deleteWebsite(id: string) {
        if (!confirm('Are you sure you want to delete this project?')) {
            return;
        }

        // Change: Use /api/projects instead of /api/websites
        const response = await api.delete(`/api/projects/${id}`);

        if (response.error) {
            alert('Failed to delete project');
            return;
        }

        setWebsites(websites.filter(w => w.id !== id));
    }

    async function openEditor(website: WebsiteWithProject) {
        setEditingWebsiteId(website.id);
        
        try {
            // Fetch the actual generated website JSON from the backend
            const response = await api.get<GeneratedWebsite[]>(`/api/websites/project/${website.id}`);
            
            if (response.error || !response.data || response.data.length === 0) {
                alert('Failed to load website data for editing. This project may not have a generated website yet.');
                setEditingWebsiteId(null);
                return;
            }
            
            // Get the latest version (first in array since backend sorts by version desc)
            const latestWebsite = response.data[0];
            
            // Store the actual website JSON from the database
            localStorage.setItem('website', JSON.stringify(latestWebsite.website_json));
            localStorage.setItem('websiteId', latestWebsite.id);
            localStorage.setItem('projectId', website.id);
            
            // Navigate to editor
            navigate('/editor');
        } catch (err) {
            console.error('Failed to load website for editing:', err);
            alert('Failed to load website data for editing. Please try again.');
            setEditingWebsiteId(null);
        }
    }

    // Enhanced function to get website preview/title
    function getWebsitePreview(websiteJson: any, projectName?: string): string {
        try {
            // If websiteJson is provided, try to extract title
            if (websiteJson) {
                let data = websiteJson;
                if (typeof websiteJson === 'string') {
                    try {
                        data = JSON.parse(websiteJson);
                    } catch {
                        return projectName || 'Untitled Website';
                    }
                }

                // Try multiple locations for title
                const titleCandidates = [
                    data?.title,
                    data?.name,
                    data?.pageTitle,
                    data?.websiteTitle,
                    data?.props?.title,
                    data?.props?.name,
                    data?.props?.pageTitle,
                    data?.config?.title,
                    data?.config?.siteName,
                    data?.metadata?.title,
                    data?.seo?.title,
                    data?.children?.[0]?.props?.title,
                    data?.children?.[0]?.props?.name,
                    data?.children?.find((child: any) =>
                        child?.type === 'h1' ||
                        child?.type === 'h2' ||
                        child?.props?.className?.includes('title')
                    )?.props?.children,
                ];

                const title = titleCandidates.find(t =>
                    t && typeof t === 'string' && t.trim().length > 0
                );

                if (title) {
                    return title.trim();
                }
            }

            // Fallback: Use project name
            if (projectName) {
                return projectName;
            }

            return 'Untitled Website';
        } catch (error) {
            console.error('Error in getWebsitePreview:', error);
            return projectName || 'Untitled Website';
        }
    }

    function getWebsiteType(websiteJson: any): string {
        try {
            let data = websiteJson;
            if (typeof websiteJson === 'string') {
                try {
                    data = JSON.parse(websiteJson);
                } catch {
                    return 'Website';
                }
            }

            const type = data?.type ||
                data?.pageType ||
                data?.config?.type ||
                data?.props?.type ||
                'website';

            const typeMap: Record<string, string> = {
                'blog': 'Blog',
                'landing': 'Landing Page',
                'portfolio': 'Portfolio',
                'ecommerce': 'E-commerce',
                'business': 'Business',
                'personal': 'Personal',
                'website': 'Website'
            };

            return typeMap[type] || type.charAt(0).toUpperCase() + type.slice(1);
        } catch {
            return 'Website';
        }
    }

    function getWebsiteStatus(website: WebsiteWithProject): { label: string; color: string } {
        // Check deployment status first
        if (website.deployment_status === 'RUNNING') {
            return { label: 'Running', color: 'emerald' };
        }
        if (website.deployment_status === 'DEPLOYING') {
            return { label: 'Deploying', color: 'blue' };
        }
        if (website.deployment_status === 'FAILED') {
            return { label: 'Deploy Failed', color: 'red' };
        }
        if (website.deployment_url) {
            return { label: 'Deployed', color: 'emerald' };
        }
        // Check project status
        if (website.status === 'published') {
            return { label: 'Published', color: 'blue' };
        }
        return { label: 'Draft', color: 'amber' };
    }

    function truncateText(text: string, maxLength: number): string {
        if (!text || text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    function formatFileSize(bytes: number): string {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }

    function togglePromptExpansion(projectId: string) {
        setExpandedPrompts(prev => ({
            ...prev,
            [projectId]: !prev[projectId]
        }));
    }

    return (
        <div
            className="min-h-screen overflow-hidden text-white p-0 m-0"
            style={{
                fontFamily: "'Playfair Display', 'Cormorant Garamond', 'Georgia', serif",
                background: 'radial-gradient(circle at 50% -10%, #31205f 0%, #15142d 28%, #090b18 65%, #05060d 100%)',
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

                @keyframes gradient-shift {
                    0%, 100% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
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

                /* Button Styles */
                .btn-primary {
                    background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 25%, #8b5cf6 50%, #7c3aed 75%, #6d28d9 100%);
                    background-size: 200% 200%;
                    box-shadow: 0 4px 25px rgba(6, 182, 212, 0.25);
                    transition: all 0.4s ease;
                    animation: gradient-shift 3s ease-in-out infinite;
                }

                .btn-primary:hover {
                    transform: translateY(-2px) scale(1.02);
                    box-shadow: 0 8px 35px rgba(6, 182, 212, 0.4);
                }

                /* Premium Edit Button - Blue/Purple Sapphire */
                .btn-edit-premium {
                    background: linear-gradient(135deg, #6366f1 0%, #4f46e5 30%, #4338ca 60%, #3730a3 100%);
                    box-shadow: 0 4px 20px rgba(99, 102, 241, 0.25);
                    transition: all 0.3s ease;
                    border: 1px solid rgba(99, 102, 241, 0.2);
                }

                .btn-edit-premium:hover {
                    transform: translateY(-2px) scale(1.02);
                    box-shadow: 0 8px 30px rgba(99, 102, 241, 0.4);
                    border-color: rgba(99, 102, 241, 0.4);
                }

                /* Premium Deploy Button - Emerald/Gold */
                .btn-deploy-premium {
                    background: linear-gradient(135deg, #10b981 0%, #059669 40%, #047857 70%, #065f46 100%);
                    box-shadow: 0 4px 20px rgba(16, 185, 129, 0.25);
                    transition: all 0.3s ease;
                    border: 1px solid rgba(16, 185, 129, 0.2);
                }

                .btn-deploy-premium:hover {
                    transform: translateY(-2px) scale(1.02);
                    box-shadow: 0 8px 30px rgba(16, 185, 129, 0.4);
                    border-color: rgba(16, 185, 129, 0.4);
                }

                /* Premium Delete Button - Rose/Ruby */
                .btn-delete-premium {
                    background: linear-gradient(135deg, #f43f5e 0%, #e11d48 40%, #be123c 70%, #881337 100%);
                    box-shadow: 0 4px 20px rgba(244, 63, 94, 0.2);
                    transition: all 0.3s ease;
                    border: 1px solid rgba(244, 63, 94, 0.2);
                }

                .btn-delete-premium:hover {
                    transform: translateY(-2px) scale(1.02);
                    box-shadow: 0 8px 30px rgba(244, 63, 94, 0.35);
                    border-color: rgba(244, 63, 94, 0.4);
                }

                /* Premium button text glow */
                .btn-premium-text {
                    text-shadow: 0 0 20px rgba(255, 255, 255, 0.1);
                    letter-spacing: 0.02em;
                }

                .card-hover {
                    transition: all 0.4s ease;
                }

                .card-hover:hover {
                    transform: translateY(-4px);
                    border-color: rgba(6, 182, 212, 0.3);
                    box-shadow: 0 8px 40px rgba(6, 182, 212, 0.1);
                }

                .status-badge-emerald {
                    background: rgba(16, 185, 129, 0.2);
                    color: #34d399;
                    border-color: rgba(16, 185, 129, 0.2);
                }

                .status-badge-amber {
                    background: rgba(245, 158, 11, 0.2);
                    color: #fbbf24;
                    border-color: rgba(245, 158, 11, 0.2);
                }

                .status-badge-blue {
                    background: rgba(59, 130, 246, 0.2);
                    color: #60a5fa;
                    border-color: rgba(59, 130, 246, 0.2);
                }

                .status-badge-red {
                    background: rgba(239, 68, 68, 0.2);
                    color: #f87171;
                    border-color: rgba(239, 68, 68, 0.2);
                }
            `}</style>

            {/* =========================================================
                BACKGROUND
            ========================================================= */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-72 left-1/2 -translate-x-1/2 w-[900px] h-[700px] rounded-full bg-purple-600/[0.16] blur-[160px] animate-pulse-soft" />
                <div className="absolute top-[25%] -left-72 w-[600px] h-[600px] rounded-full bg-blue-600/[0.10] blur-[150px] animate-float-slow" />
                <div className="absolute bottom-[-300px] right-[-200px] w-[700px] h-[700px] rounded-full bg-violet-600/[0.12] blur-[160px] animate-float-slower" />
                <div className="absolute top-[55%] left-[45%] w-[350px] h-[350px] rounded-full bg-cyan-500/[0.05] blur-[120px]" />
                <div className="absolute inset-0 opacity-[0.035]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
            </div>

            {/* =========================================================
                NAVIGATION - SAME AS HOME PAGE
            ========================================================= */}
            <nav className="relative z-50 border-b border-white/[0.08] bg-[#080a15]/75 backdrop-blur-2xl">
                <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
                    <div className="h-[76px] flex items-center justify-between">

                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-3 group">
                            <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-400 p-[1px] shadow-lg shadow-purple-500/20 group-hover:scale-105 transition-transform">
                                <div className="w-full h-full rounded-[11px] bg-[#0a0d18] flex items-center justify-center">
                                    <span className="text-xs font-luxury font-bold tracking-widest bg-gradient-to-r from-cyan-300 to-purple-400 bg-clip-text text-transparent">B&H</span>
                                </div>
                            </div>
                            <div>
                                <div className="font-luxury text-lg font-bold tracking-wide text-white">
                                    Build<span className="text-purple-400">And</span>Host
                                </div>
                                <div className="text-[9px] font-serif-light uppercase tracking-[0.3em] text-white/40">AI Website Builder</div>
                            </div>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center gap-2">
                            <Link to="/" className="px-4 py-2 rounded-lg text-white/65 hover:text-white hover:bg-white/[0.06] text-sm font-body font-medium transition-all">Home</Link>
                            <Link to="/chat" className="px-4 py-2 rounded-lg text-white/65 hover:text-white hover:bg-white/[0.06] text-sm font-body font-medium transition-all">AI Builder</Link>
                            <Link to="/websites" className="px-4 py-2 rounded-lg bg-white/[0.09] text-white text-sm font-body font-medium border border-white/[0.08]">My Websites</Link>
                        </div>

                        {/* Authentication */}
                        <div className="flex items-center gap-3">
                            {isAuthenticated && user ? (
                                <>
                                    <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.05] border border-white/[0.08]">
                                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-cyan-400 flex items-center justify-center">
                                            <span className="text-[10px] font-luxury font-bold text-white">{user.username?.charAt(0)?.toUpperCase()}</span>
                                        </div>
                                        <span className="text-sm font-body text-white/80">{user.username}</span>
                                    </div>
                                    <button
                                        onClick={() => {
                                            logout();
                                            navigate('/');
                                        }}
                                        className="px-4 py-2.5 rounded-lg border border-white/[0.12] bg-white/[0.05] hover:bg-white/[0.10] text-sm font-body font-medium text-white/90 transition-all"
                                    >
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link to="/login" className="hidden sm:block px-4 py-2.5 text-sm font-body font-light text-white/75 hover:text-white transition-colors tracking-wide">Login</Link>
                                    <Link to="/register" className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-cyan-400 to-purple-600 text-white text-sm font-body font-semibold tracking-wide hover:scale-105 transition-transform shadow-lg shadow-purple-500/20">
                                        Get Started
                                    </Link>
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
                        <div className="inline-flex items-center gap-3 text-[10px] font-serif-light uppercase tracking-[0.25em] text-cyan-300 font-semibold mb-2">
                            <span className="w-8 h-px bg-cyan-400/50" />
                            Your Portfolio
                        </div>
                        <h1 className="font-luxury text-4xl sm:text-5xl font-bold tracking-tight text-white">
                            Your Websites
                        </h1>
                        <p className="font-serif-light text-purple-200/40 mt-2 text-sm tracking-wide">
                            Manage and edit your AI-generated websites
                        </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <Link
                            to="/chat"
                            className="btn-primary inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-body font-semibold tracking-wide whitespace-nowrap"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Create New Website
                        </Link>
                        {/* Project Count Badge - Now under the button */}
                        {!loading && websites.length > 0 && (
                            <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-400/30 backdrop-blur-sm text-xs">
                                <span className="font-luxury font-bold text-cyan-300">
                                    {websites.length}
                                </span>
                                <span className="ml-1.5 font-serif-light text-purple-200/60 tracking-wider">
                                    {websites.length === 1 ? 'Project' : 'Projects'}
                                </span>
                            </span>
                        )}
                    </div>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="flex justify-center items-center py-20 animate-slide-up">
                        <div className="text-center">
                            <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="font-serif-light text-purple-200/40 tracking-wide">Loading your websites...</p>
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
                            <svg className="w-12 h-12 text-cyan-300/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                            </svg>
                        </div>
                        <h2 className="font-luxury text-3xl font-bold text-white mb-2">No websites yet</h2>
                        <p className="font-serif-light text-purple-200/40 mb-6 tracking-wide">Start building your first AI-powered website</p>
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
                        {websites.map((website, index) => {
                            const status = getWebsiteStatus(website);
                            const previewName = getWebsitePreview(website.website_json, website.name);
                            const websiteType = getWebsiteType(website.website_json);

                            return (
                                <div
                                    key={website.id}
                                    className="card-hover bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden animate-slide-up"
                                    style={{ animationDelay: `${index * 100}ms` }}
                                >
                                    {/* Preview/Thumbnail */}
                                    <div className="h-48 bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-cyan-400/5 flex items-center justify-center border-b border-white/10 relative overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/5 via-transparent to-purple-500/5"></div>

                                        {/* Project number badge */}
                                        <div className="absolute top-3 left-3 px-3 py-1 bg-black/40 backdrop-blur-sm rounded-full border border-white/10">
                                            <span className="text-[10px] font-serif-light text-white/60 tracking-wider">
                                                #{index + 1}
                                            </span>
                                        </div>

                                        {/* Website preview icon/thumbnail */}
                                        <div className="relative z-10 flex flex-col items-center">
                                            <svg className="w-16 h-16 text-cyan-300/20 group-hover:text-cyan-300/40 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                                            </svg>
                                            <span className="text-xs font-serif-light text-purple-200/30 mt-2 tracking-wider">
                                                {websiteType}
                                            </span>
                                        </div>

                                        {/* Status Badge */}
                                        <div className={`absolute top-3 right-3 px-3 py-1 text-[10px] font-serif-light rounded-full border tracking-wider status-badge-${status.color}`}>
                                            {status.label}
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-6">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-luxury text-lg font-bold text-white mb-1 truncate" title={previewName}>
                                                    {previewName}
                                                </h3>
                                                <p className="text-sm font-serif-light text-purple-200/40 tracking-wide">
                                                    {websiteType} • v{website.version || '1.0'}
                                                </p>
                                            </div>
                                        </div>

                                        {website.description && (
                                            <p className="text-sm font-serif-light text-purple-200/30 mb-4 tracking-wide line-clamp-2">
                                                {website.description}
                                            </p>
                                        )}

                                        {/* Prompt Section - Enhanced with expandable view */}
                                        {website.prompt && (
                                            <div className="mb-4 p-3 bg-white/[0.02] border border-white/[0.08] rounded-lg">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <svg className="w-4 h-4 text-purple-300/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                                    </svg>
                                                    <span className="text-xs font-serif-light text-purple-200/60 tracking-wider uppercase">Prompt</span>
                                                </div>
                                                <div className="text-sm font-serif-light text-purple-200/50 tracking-wide">
                                                    {expandedPrompts[website.id] || website.prompt.length <= 150 ? (
                                                        <p className="whitespace-pre-wrap">{website.prompt}</p>
                                                    ) : (
                                                        <p className="line-clamp-2">{website.prompt}</p>
                                                    )}
                                                    {website.prompt.length > 150 && (
                                                        <button
                                                            onClick={() => togglePromptExpansion(website.id)}
                                                            className="mt-2 text-xs font-body text-cyan-300/80 hover:text-cyan-200 transition-colors flex items-center gap-1"
                                                        >
                                                            {expandedPrompts[website.id] ? (
                                                                <>
                                                                    <span>Show less</span>
                                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                                                    </svg>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <span>View more</span>
                                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                                    </svg>
                                                                </>
                                                            )}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Attachments Section */}
                                        {website.attachments && website.attachments.length > 0 && (
                                            <div className="mb-4 p-3 bg-white/[0.02] border border-white/[0.08] rounded-lg">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <svg className="w-4 h-4 text-cyan-300/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                                    </svg>
                                                    <span className="text-xs font-serif-light text-cyan-200/60 tracking-wider uppercase">
                                                        Attachments ({website.attachments.length})
                                                    </span>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {website.attachments.slice(0, 3).map((attachment) => (
                                                        <div
                                                            key={attachment.id}
                                                            className="flex items-center gap-1.5 px-2 py-1 bg-white/[0.04] rounded-md border border-white/[0.06]"
                                                            title={`${attachment.filename} (${formatFileSize(attachment.file_size)})`}
                                                        >
                                                            <svg className="w-3 h-3 text-cyan-300/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                                            </svg>
                                                            <span className="text-xs font-body text-cyan-200/50 truncate max-w-[120px]">
                                                                {attachment.filename}
                                                            </span>
                                                        </div>
                                                    ))}
                                                    {website.attachments.length > 3 && (
                                                        <div className="flex items-center px-2 py-1 text-xs font-body text-purple-200/40">
                                                            +{website.attachments.length - 3} more
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Deployment Section - Enhanced with deployment info */}
                                        {website.deployment_url ? (
                                            <div className="mb-4 p-3 bg-emerald-500/[0.05] border border-emerald-500/20 rounded-lg">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <svg className="w-4 h-4 text-emerald-300/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                                                    </svg>
                                                    <span className="text-xs font-serif-light text-emerald-200/70 tracking-wider uppercase">Live Website</span>
                                                </div>
                                                <a
                                                    href={website.deployment_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-2 text-sm font-body text-emerald-300/90 hover:text-emerald-200 transition-colors group mb-2"
                                                >
                                                    <span className="truncate max-w-[200px]">{website.deployment_url}</span>
                                                    <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                    </svg>
                                                </a>
                                                {/* Deployment Details */}
                                                {website.deployment_info && (
                                                    <div className="mt-2 pt-2 border-t border-emerald-500/10 space-y-1">
                                                        <div className="flex items-center justify-between text-xs">
                                                            <span className="font-serif-light text-emerald-200/50">Subdomain</span>
                                                            <span className="font-body text-emerald-300/70">{website.deployment_info.subdomain}</span>
                                                        </div>
                                                        <div className="flex items-center justify-between text-xs">
                                                            <span className="font-serif-light text-emerald-200/50">Deployed</span>
                                                            <span className="font-body text-emerald-300/70">
                                                                {new Date(website.deployment_info.created_at).toLocaleDateString('en-US', {
                                                                    month: 'short',
                                                                    day: 'numeric',
                                                                    year: 'numeric'
                                                                })}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center justify-between text-xs">
                                                            <span className="font-serif-light text-emerald-200/50">Status</span>
                                                            <span className="font-body text-emerald-300/70 capitalize">{website.deployment_info.status.toLowerCase()}</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            website.deployment_status ? (
                                                <div className="mb-4 p-3 bg-white/[0.02] border border-white/[0.08] rounded-lg">
                                                    <div className="flex items-center gap-2">
                                                        <svg className="w-4 h-4 text-purple-300/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        <p className="text-xs font-serif-light text-purple-200/40 tracking-wide">
                                                            {website.deployment_status === 'DEPLOYING' ? '⏳ Deployment in progress...' :
                                                             website.deployment_status === 'FAILED' ? '❌ Deployment failed' :
                                                             'Not deployed yet'}
                                                        </p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="mb-4 p-3 bg-white/[0.02] border border-white/[0.08] rounded-lg">
                                                    <div className="flex items-center gap-2">
                                                        <svg className="w-4 h-4 text-purple-300/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        <p className="text-xs font-serif-light text-purple-200/40 tracking-wide">Not deployed yet</p>
                                                    </div>
                                                </div>
                                            )
                                        )}

                                        <p className="text-sm font-serif-light text-purple-200/30 mb-4 tracking-wide">
                                            Created {new Date(website.created_at).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}
                                            {website.updated_at && website.updated_at !== website.created_at && (
                                                <span className="block text-purple-200/20 text-xs mt-1">
                                                    Updated {new Date(website.updated_at).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric'
                                                    })}
                                                </span>
                                            )}
                                        </p>

                                        {/* Actions - Updated with Premium Buttons */}
                                        <div className="flex flex-col gap-2">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => openEditor(website)}
                                                    className="flex-1 btn-edit-premium px-4 py-2 rounded-lg text-white font-body font-medium flex items-center justify-center gap-2 text-sm btn-premium-text"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => navigate(`/deploy?websiteId=${website.id}`)}
                                                    className="flex-1 btn-deploy-premium px-4 py-2 rounded-lg text-white font-body font-medium flex items-center justify-center gap-2 text-sm btn-premium-text"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                                    </svg>
                                                    Deploy
                                                </button>
                                            </div>
                                            <button
                                                onClick={() => deleteWebsite(website.id)}
                                                className="w-full btn-delete-premium px-4 py-2 rounded-lg text-white font-body font-medium flex items-center justify-center gap-2 text-sm btn-premium-text"
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
                            );
                        })}
                    </div>
                )}

                {/* Website Count Footer - Removed since we moved it under the button */}
            </div>
        </div>
    );
}