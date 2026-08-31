import { useState, useRef, useEffect } from "react";
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { api } from '../lib/api';
import type { Project, GeneratedWebsite } from '../lib/types';

// Loading phrases constant
const LOADING_PHRASES = [
    "AI is thinking...",
    "Analyzing your request...",
    "Processing your ideas...",
    "Generating creative solutions...",
    "Building your website...",
    "Almost there...",
    "Finalizing the design...",
    "Preparing your result..."
];

export default function Home() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
    const [currentProject, setCurrentProject] = useState<Project | null>(null);
    const [showSidebar, setShowSidebar] = useState(false);

    const [messages, setMessages] = useState<{ role: "user" | "assistant"; text: string }[]>([
        { role: "assistant", text: "Hello! Describe the website you want — I can build a portfolio, business site, blog, or dashboard. Attach up to 5 files (logos, images, PDFs, DOCX)." },
    ]);
    const [input, setInput] = useState("");
    const [files, setFiles] = useState<FileList | null>(null);
    const [type, setType] = useState("portfolio");
    const [loading, setLoading] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
    const [fileError, setFileError] = useState<string>("");

    // Constants
    const MAX_FILES = 5;
    const [aiThinking, setAiThinking] = useState(false);

    // Dropdown state
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Loading screen states
    const [showLoadingScreen, setShowLoadingScreen] = useState(false);
    const [progress, setProgress] = useState(0);
    const [loadingText, setLoadingText] = useState("AI is thinking...");

    // Website types
    const websiteTypes = [
        { value: "portfolio", label: "🎨 Portfolio", description: "Showcase your work & skills" },
        { value: "business", label: "💼 Business", description: "Professional company site" },
        { value: "blog", label: "📝 Blog", description: "Share stories & ideas" },
        { value: "dashboard", label: "📊 Dashboard", description: "Data & analytics" },
        // { value: "ecommerce", label: "🛍️ E-Commerce", description: "Online store" },
        // { value: "landing", label: "🚀 Landing Page", description: "Marketing & leads" },
        // { value: "resume", label: "📄 Resume", description: "Professional profile" },
        { value: "agency", label: "🏢 Agency", description: "Creative studio" },
    ];

    const containerRef = useRef<HTMLDivElement | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Loading text rotation
    useEffect(() => {
        let textInterval: NodeJS.Timeout;

        if (showLoadingScreen) {
            let textIndex = 0;
            textInterval = setInterval(() => {
                textIndex = (textIndex + 1) % LOADING_PHRASES.length;
                setLoadingText(LOADING_PHRASES[textIndex]);
            }, 1800);
        }

        return () => {
            if (textInterval) clearInterval(textInterval);
        };
    }, [showLoadingScreen]);

    // Auth check
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            navigate('/login');
        }
    }, [authLoading, isAuthenticated, navigate]);

    // Note: We removed the auto-create on mount - projects are now created per prompt

    async function createNewProject(): Promise<Project | null> {
        try {
            const response = await api.post<Project>('/api/projects', {
                name: 'My Website',
                description: 'Generated with AI Website Builder',
            });

            if (response.data) {
                console.log('✅ Created new project:', response.data.id);
                return response.data;
            }

            return null;
        } catch (error) {
            console.error('❌ Error creating project:', error);
            return null;
        }
    }

    function pushMessage(role: "user" | "assistant", text: string) {
        setMessages((m) => [...m, { role, text }]);
        setTimeout(() => containerRef.current?.scrollTo({ top: containerRef.current.scrollHeight, behavior: "smooth" }), 50);
    }

    function simulateProgress() {
        let currentProgress = 0;
        let speed = 1.5;

        const interval = setInterval(() => {
            if (currentProgress < 50) {
                speed = 1.5 + Math.random() * 0.5;
            } else if (currentProgress < 75) {
                speed = 0.8 + Math.random() * 0.4;
            } else if (currentProgress < 90) {
                speed = 0.4 + Math.random() * 0.3;
            } else {
                speed = 0.15 + Math.random() * 0.15;
            }

            currentProgress = Math.min(currentProgress + speed, 99);
            setProgress(currentProgress);

            if (currentProgress < 20) {
                setLoadingText("Analyzing your request...");
            } else if (currentProgress < 40) {
                setLoadingText("Generating creative ideas...");
            } else if (currentProgress < 60) {
                setLoadingText("Building your website structure...");
            } else if (currentProgress < 80) {
                setLoadingText("Designing your layout...");
            } else {
                setLoadingText("Almost there...");
            }

            if (currentProgress >= 99) {
                clearInterval(interval);
            }
        }, 200);

        return interval;
    }

    async function handleSend() {
        const text = input.trim();
        if (!text) return;

        pushMessage("user", text);
        setInput("");
        setLoading(true);
        setAiThinking(true);

        setShowLoadingScreen(true);
        setProgress(0);
        setLoadingText("Initializing AI engine...");

        const progressInterval = simulateProgress();

        try {
            // Always create a new project for each prompt
            console.log('🆕 Creating new project for this generation...');
            const project = await createNewProject();
            if (!project) {
                throw new Error('Failed to create project');
            }

            const form = new FormData();
            form.append("prompt", text);
            form.append("type", type);
            if (files) {
                Array.from(files).forEach(file => form.append("files", file));
            }

            setLoadingText("Processing with AI...");

            const resp = await fetch("/api/ai/post_prompt", { method: "POST", body: form });
            const result = await resp.json();
            if (!resp.ok) throw new Error(result.detail || "Generation failed");

            setLoadingText("Finalizing your website...");

            if (project && result.website) {
                try {
                    const saveResponse = await api.post<GeneratedWebsite>('/api/websites', {
                        project_id: project.id,
                        website_json: result.website,
                        theme_json: result.theme,
                        version: 1,
                    });

                    if (saveResponse.data) {
                        console.log('✅ Website saved successfully with ID:', saveResponse.data.id);
                        localStorage.setItem('websiteId', saveResponse.data.id);

                        // Update project status to completed
                        try {
                            await api.patch(`/api/projects/${project.id}`, { status: 'completed' });
                            console.log('✅ Project status updated to completed');
                        } catch (statusError) {
                            console.warn('⚠️ Failed to update project status:', statusError);
                        }
                    } else if (saveResponse.error) {
                        console.error('❌ Failed to save website:', saveResponse.error);
                        throw new Error(`Failed to save website: ${saveResponse.error}`);
                    }
                } catch (saveError) {
                    console.error('❌ Error saving website to database:', saveError);
                    pushMessage("assistant", "⚠️ Website generated but failed to save to database. You can still use the editor, but deployment may not work.");
                }
            }

            clearInterval(progressInterval);

            let finalProgress = 99;
            const finalInterval = setInterval(() => {
                finalProgress += 0.5;
                setProgress(Math.min(finalProgress, 100));

                if (finalProgress >= 100) {
                    clearInterval(finalInterval);
                    setLoadingText("Complete! 🎉");
                }
            }, 50);

            await new Promise(resolve => setTimeout(resolve, 600));

            setAiThinking(false);
            setShowLoadingScreen(false);

            pushMessage("assistant", "Got it — your website is ready. Opening the editor...");
            localStorage.setItem("website", JSON.stringify(result.website));
            localStorage.setItem("websiteTheme", JSON.stringify(result.theme));
            if (result.uploads) localStorage.setItem("uploadedFiles", JSON.stringify(result.uploads));
            window.location.href = "/editor";
        } catch (err: any) {
            clearInterval(progressInterval);
            setAiThinking(false);
            setShowLoadingScreen(false);
            pushMessage("assistant", `Sorry, failed to generate: ${err?.message ?? String(err)}`);
        } finally {
            setLoading(false);
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFileError("");

        if (e.target.files && e.target.files.length > 0) {
            if (e.target.files.length > MAX_FILES) {
                setFileError(`You can only upload up to ${MAX_FILES} files at once.`);
                e.target.value = "";
                return;
            }

            setFiles(e.target.files);
            setSelectedFiles(Array.from(e.target.files).map(f => f.name));
        }
    };

    const handleTypeSelect = (value: string) => {
        setType(value);
        setIsDropdownOpen(false);
    };

    const getCurrentTypeLabel = () => {
        const found = websiteTypes.find(t => t.value === type);
        return found ? found.label : "🎨 Portfolio";
    };

    const isActive = (path: string) => {
        return location.pathname === path;
    };

    return (
        <>
            {/* =========================================================
                NAVIGATION - SAME AS HOME PAGE
            ========================================================= */}
            <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.08] bg-[#080a15]/75 backdrop-blur-2xl">
                <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
                    <div className="h-[76px] flex items-center justify-between">

                        {/* Logo - Show user profile circle instead of B&H when logged in */}
                        <div className="flex items-center gap-3 group">
                            {isAuthenticated && user ? (
                                // User Profile Circle - replaces B&H logo
                                <div
                                    className="relative w-11 h-11 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-400 p-[1px] shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition-all duration-300 cursor-pointer hover:scale-105"
                                    onClick={() => setShowSidebar(!showSidebar)}
                                >
                                    <div className="w-full h-full rounded-full bg-[#0a0d18] flex items-center justify-center">
                                        <span className="text-base font-luxury font-bold bg-gradient-to-r from-cyan-300 to-purple-400 bg-clip-text text-transparent">
                                            {user.username?.charAt(0)?.toUpperCase() || 'U'}
                                        </span>
                                    </div>
                                    {/* Status indicator */}
                                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#0a0d18]"></div>
                                </div>
                            ) : (
                                // Show B&H logo when not logged in
                                <Link to="/" className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-400 p-[1px] shadow-lg shadow-purple-500/20 group-hover:scale-105 transition-transform">
                                    <div className="w-full h-full rounded-[11px] bg-[#0a0d18] flex items-center justify-center">
                                        <span className="text-xs font-luxury font-bold tracking-widest bg-gradient-to-r from-cyan-300 to-purple-400 bg-clip-text text-transparent">B&H</span>
                                    </div>
                                </Link>
                            )}
                            <div>
                                <div className="font-luxury text-lg font-bold tracking-wide text-white">
                                    Build<span className="text-purple-400">And</span>Host
                                </div>
                                <div className="text-[9px] font-serif-light uppercase tracking-[0.3em] text-white/40">AI Website Builder</div>
                            </div>
                        </div>

                        {/* Desktop Navigation - Only show when authenticated */}
                        {isAuthenticated && (
                            <div className="hidden md:flex items-center gap-2">
                                <Link to="/" className="px-4 py-2 rounded-lg text-white/65 hover:text-white hover:bg-white/[0.06] text-sm font-body font-medium transition-all">Home</Link>
                                <Link to="/chat" className={`px-4 py-2 rounded-lg text-sm font-body font-medium transition-all ${isActive('/chat')
                                    ? 'bg-white/[0.09] text-white border border-white/[0.08]'
                                    : 'text-white/65 hover:text-white hover:bg-white/[0.06]'
                                    }`}>AI Builder</Link>
                                <Link to="/websites" className="px-4 py-2 rounded-lg text-white/65 hover:text-white hover:bg-white/[0.06] text-sm font-body font-medium transition-all">My Websites</Link>
                            </div>
                        )}

                        {/* Authentication - Only show Login/Get Started when not authenticated */}
                        <div className="flex items-center gap-3">
                            {!isAuthenticated ? (
                                <>
                                    <Link to="/login" className="hidden sm:block px-4 py-2.5 text-sm font-body font-light text-white/75 hover:text-white transition-colors tracking-wide">Login</Link>
                                    <Link to="/register" className="btn-get-started px-5 py-2.5 rounded-lg text-white text-sm font-body font-semibold tracking-wide">Get Started</Link>
                                </>
                            ) : null}
                        </div>
                    </div>
                </div>
            </nav>

            {/* =========================================================
                PREMIUM TOGGLE SIDEBAR - SAME AS HOME PAGE
            ========================================================= */}
            {isAuthenticated && showSidebar && (
                <>
                    {/* Backdrop with blur */}
                    <div
                        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-md"
                        onClick={() => setShowSidebar(false)}
                    />

                    {/* Premium Sidebar - Fixed height layout with hidden scrollbar */}
                    <div className="fixed right-0 top-0 z-50 h-full w-80 bg-gradient-to-b from-[#0a0d18] via-[#0d1120] to-[#0a0d18] backdrop-blur-2xl border-l border-white/[0.08] shadow-2xl shadow-black/80 sidebar-slide-in">
                        <div className="flex flex-col h-full">
                            {/* Premium Sidebar Header - Fixed */}
                            <div className="relative p-6 border-b border-white/[0.06] bg-gradient-to-br from-purple-500/5 to-cyan-500/5 flex-shrink-0">
                                {/* Decorative glow */}
                                <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-purple-500/10 blur-[80px]" />
                                <div className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full bg-cyan-500/10 blur-[80px]" />

                                <div className="relative flex items-center gap-4">
                                    <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-400 p-[2px] shadow-xl shadow-purple-500/30">
                                        <div className="w-full h-full rounded-full bg-[#0a0d18] flex items-center justify-center">
                                            <span className="text-xl font-luxury font-bold bg-gradient-to-r from-cyan-300 to-purple-400 bg-clip-text text-transparent">
                                                {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-body text-base font-semibold text-white tracking-wide">{user?.username}</div>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                                            <div className="text-[10px] font-serif-light text-white/40 tracking-wider">Online</div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShowSidebar(false)}
                                        className="text-white/30 hover:text-white/60 transition-colors"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            {/* Sidebar Navigation - Scrollable with hidden scrollbar */}
                            <div className="flex-1 overflow-y-auto sidebar-scroll p-4 space-y-1.5">
                                <div className="px-3 py-2 text-[10px] font-serif-light text-white/20 tracking-[0.15em] uppercase">Navigation</div>

                                <Link
                                    to="/"
                                    className="flex items-center gap-3 px-4 py-3.5 rounded-xl hover:bg-white/[0.06] transition-all duration-300 text-white/70 hover:text-white group"
                                    onClick={() => setShowSidebar(false)}
                                >
                                    <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center">
                                        <svg className="w-5 h-5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                        </svg>
                                    </div>
                                    <span className="font-body text-sm font-medium flex-1">Home</span>
                                    <span className="text-white/20 group-hover:text-white/40 transition-colors">→</span>
                                </Link>

                                <Link
                                    to="/chat"
                                    className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group ${isActive('/chat')
                                        ? 'bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-400/30 text-white'
                                        : 'hover:bg-white/[0.06] text-white/70 hover:text-white'
                                        }`}
                                    onClick={() => setShowSidebar(false)}
                                >
                                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${isActive('/chat')
                                        ? 'bg-gradient-to-br from-purple-500/30 to-cyan-500/30'
                                        : 'bg-white/5'
                                        }`}>
                                        <svg className={`w-5 h-5 ${isActive('/chat') ? 'text-purple-300' : 'text-white/40'
                                            }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                        </svg>
                                    </div>
                                    <span className={`font-body text-sm font-medium flex-1 ${isActive('/chat') ? 'text-white' : ''
                                        }`}>AI Builder</span>
                                    <span className={`transition-colors ${isActive('/chat') ? 'text-white/40' : 'text-white/20 group-hover:text-white/40'
                                        }`}>→</span>
                                </Link>

                                <Link
                                    to="/websites"
                                    className="flex items-center gap-3 px-4 py-3.5 rounded-xl hover:bg-white/[0.06] transition-all duration-300 text-white/70 hover:text-white group"
                                    onClick={() => setShowSidebar(false)}
                                >
                                    <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center">
                                        <svg className="w-5 h-5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                                        </svg>
                                    </div>
                                    <span className="font-body text-sm font-medium flex-1">My Websites</span>
                                    <span className="text-white/20 group-hover:text-white/40 transition-colors">→</span>
                                </Link>
                            </div>

                            {/* Premium Sidebar Footer - Fixed with logout button */}
                            <div className="p-4 border-t border-white/[0.06] bg-gradient-to-t from-purple-500/5 to-transparent flex-shrink-0">
                                <button
                                    onClick={() => {
                                        logout();
                                        navigate('/');
                                        setShowSidebar(false);
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl bg-gradient-to-r from-red-500/10 to-rose-500/10 hover:from-red-500/20 hover:to-rose-500/20 transition-all duration-300 text-red-400 hover:text-red-300 border border-red-500/10 hover:border-red-500/30"
                                >
                                    <div className="w-9 h-9 rounded-lg bg-red-500/10 flex items-center justify-center">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                    </div>
                                    <span className="font-body text-sm font-medium flex-1">Logout</span>
                                    <span className="text-red-400/20">↗</span>
                                </button>

                                {/* Version info */}
                                <div className="mt-4 text-center text-[9px] font-serif-light text-white/15 tracking-wider">
                                    BuildAndHost v2.0 • AI Powered
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* =========================================================
                CHAT CONTENT - UNCHANGED
            ========================================================= */}
            <div
                className="chat-root min-h-screen flex items-center justify-center p-4 sm:p-6 relative overflow-hidden pt-[76px]"
                style={{
                    fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
                    background: 'linear-gradient(135deg, #000000 0%, #0a0a0f 25%, #1a0a2e 50%, #0a0a0f 75%, #000000 100%)',
                }}
            >
                {/* =========================================================
                    CYBERPUNK ANIMATIONS & STYLES
                ========================================================= */}
                <style>{`
                    @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700&family=Fira+Code:wght@300;400;500;600&display=swap');

                    .font-luxury {
                        font-family: 'JetBrains Mono', 'Fira Code', monospace;
                    }

                    .font-serif-light {
                        font-family: 'Fira Code', 'JetBrains Mono', monospace;
                    }

                    .font-body {
                        font-family: 'JetBrains Mono', 'Fira Code', monospace;
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

                    @keyframes slide-in {
                        from { opacity: 0; transform: translateY(10px); }
                        to { opacity: 1; transform: translateY(0); }
                    }

                    @keyframes pulse {
                        0%, 100% { opacity: 1; }
                        50% { opacity: 0.5; }
                    }

                    @keyframes shimmer {
                        0% { background-position: -200% center; }
                        100% { background-position: 200% center; }
                    }

                    @keyframes gradient-shift {
                        0%, 100% { background-position: 0% 50%; }
                        50% { background-position: 100% 50%; }
                    }

                    @keyframes neon-glow {
                        0%, 100% { box-shadow: 0 0 10px rgba(0, 255, 255, 0.5), 0 0 20px rgba(0, 255, 255, 0.3), 0 0 30px rgba(0, 255, 255, 0.1); }
                        50% { box-shadow: 0 0 20px rgba(0, 255, 255, 0.8), 0 0 40px rgba(0, 255, 255, 0.5), 0 0 60px rgba(0, 255, 255, 0.3); }
                    }

                    @keyframes scan-line {
                        0% { transform: translateY(-100%); }
                        100% { transform: translateY(100%); }
                    }

                    @keyframes grid-move {
                        0% { background-position: 0 0; }
                        100% { background-position: 50px 50px; }
                    }

                    .animate-slide-in {
                        animation: slide-in 0.3s ease-out;
                    }

                    .animate-pulse {
                        animation: pulse 2s ease-in-out infinite;
                    }

                    .delay-1000 {
                        animation-delay: 1s;
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

                    .animate-neon-glow {
                        animation: neon-glow 2s ease-in-out infinite;
                    }

                    .btn-primary {
                        background: linear-gradient(135deg, #00ffff 0%, #0088ff 25%, #8800ff 50%, #6600cc 75%, #440099 100%);
                        background-size: 200% 200%;
                        box-shadow: 0 0 20px rgba(0, 255, 255, 0.4);
                        transition: all 0.4s ease;
                        animation: gradient-shift 3s ease-in-out infinite;
                    }

                    .btn-primary:hover {
                        transform: translateY(-2px) scale(1.02);
                        box-shadow: 0 0 40px rgba(0, 255, 255, 0.6);
                    }

                    .btn-primary:disabled {
                        opacity: 0.6;
                        cursor: not-allowed;
                        transform: none !important;
                    }

                    .btn-get-started {
                        background: linear-gradient(135deg, #00ffff 0%, #0088ff 25%, #8800ff 50%, #6600cc 75%, #440099 100%);
                        background-size: 200% 200%;
                        box-shadow: 0 0 20px rgba(0, 255, 255, 0.4);
                        transition: all 0.4s ease;
                        animation: gradient-shift 3s ease-in-out infinite;
                    }

                    .btn-get-started:hover {
                        transform: translateY(-2px) scale(1.03);
                        box-shadow: 0 0 50px rgba(0, 255, 255, 0.7);
                    }

                    .chat-window {
                        transition: all 0.3s ease;
                        position: relative;
                    }

                    .chat-window::before {
                        content: '';
                        position: absolute;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background: repeating-linear-gradient(
                            0deg,
                            transparent,
                            transparent 2px,
                            rgba(0, 255, 255, 0.03) 2px,
                            rgba(0, 255, 255, 0.03) 4px
                        );
                        pointer-events: none;
                        z-index: 1;
                    }

                    .chat-window:hover {
                        border-color: rgba(0, 255, 255, 0.5);
                        box-shadow: 0 0 50px rgba(0, 255, 255, 0.3);
                    }

                    .ai-thinking-avatar {
                        animation: avatar-pulse 1.5s ease-in-out infinite;
                    }

                    @keyframes avatar-pulse {
                        0%, 100% { box-shadow: 0 0 0 0 rgba(0, 255, 255, 0.4); }
                        50% { box-shadow: 0 0 0 20px rgba(0, 255, 255, 0); }
                    }

                    @keyframes fade-in {
                        from { opacity: 0; transform: scale(0.95); }
                        to { opacity: 1; transform: scale(1); }
                    }

                    @keyframes pulse-ring {
                        0% { transform: scale(1); opacity: 0.5; }
                        100% { transform: scale(1.5); opacity: 0; }
                    }

                    @keyframes bounce-subtle {
                        0%, 100% { transform: translateY(0); }
                        50% { transform: translateY(-8px); }
                    }

                    @keyframes loading-shimmer {
                        0% { background-position: -200% 0; }
                        100% { background-position: 200% 0; }
                    }

                    @keyframes shimmer-slide {
                        0% { transform: translateX(-100%); }
                        100% { transform: translateX(100%); }
                    }

                    @keyframes loading-dot {
                        0%, 100% { transform: scale(0.5); opacity: 0.2; }
                        50% { transform: scale(1.2); opacity: 1; }
                    }

                    @keyframes float-particle {
                        0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.2; }
                        50% { transform: translate(50px, -50px) scale(1.5); opacity: 0.6; }
                    }

                    @keyframes dropdown-slide {
                        from {
                            opacity: 0;
                            transform: translateY(-10px) scale(0.95);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0) scale(1);
                        }
                    }

                    @keyframes glitch {
                        0%, 100% { transform: translate(0); }
                        20% { transform: translate(-2px, 2px); }
                        40% { transform: translate(-2px, -2px); }
                        60% { transform: translate(2px, 2px); }
                        80% { transform: translate(2px, -2px); }
                    }

                    .animate-fade-in {
                        animation: fade-in 0.5s ease-out;
                    }

                    .animate-bounce-subtle {
                        animation: bounce-subtle 2s ease-in-out infinite;
                    }

                    .animate-pulse-ring {
                        animation: pulse-ring 1.5s ease-in-out infinite;
                    }

                    .animate-shimmer-slide {
                        animation: shimmer-slide 1.5s ease-in-out infinite;
                    }

                    .animate-glitch {
                        animation: glitch 0.3s ease-in-out infinite;
                    }

                    .dropdown-animate {
                        animation: dropdown-slide 0.25s ease-out forwards;
                        transform-origin: top center;
                    }

                    .sidebar-scroll::-webkit-scrollbar {
                        display: none;
                    }

                    .sidebar-scroll {
                        -ms-overflow-style: none;
                        scrollbar-width: none;
                    }

                    .sidebar-slide-in {
                        animation: slide-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                    }

                    .cyber-grid {
                        background-image: 
                            linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px);
                        background-size: 50px 50px;
                        animation: grid-move 3s linear infinite;
                    }
                `}</style>

                {/* =========================================================
                    CYBERPUNK BACKGROUND
                ========================================================= */}
                <div className="fixed inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute inset-0 cyber-grid opacity-20"></div>
                    <div className="absolute -top-72 left-1/2 -translate-x-1/2 w-[900px] h-[700px] rounded-full bg-cyan-500/10 blur-[160px] animate-pulse-soft" />
                    <div className="absolute top-[25%] -left-72 w-[600px] h-[600px] rounded-full bg-purple-600/10 blur-[150px] animate-float-slow" />
                    <div className="absolute bottom-[-300px] right-[-200px] w-[700px] h-[700px] rounded-full bg-blue-600/10 blur-[160px] animate-float-slower" />
                    <div className="absolute top-[55%] left-[45%] w-[350px] h-[350px] rounded-full bg-pink-500/5 blur-[120px]" />

                    {/* Floating particles */}
                    <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-cyan-400/60 rounded-full animate-float-slow"></div>
                    <div className="absolute top-1/3 right-1/3 w-1.5 h-1.5 bg-purple-400/60 rounded-full animate-float-slower"></div>
                    <div className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-cyan-400/40 rounded-full animate-float-slow" style={{ animationDelay: '2s' }}></div>
                    <div className="absolute top-2/3 right-1/4 w-1.5 h-1.5 bg-purple-400/40 rounded-full animate-float-slower" style={{ animationDelay: '3s' }}></div>
                </div>

                {/* =========================================================
                    CYBERPUNK LOADING SCREEN
                ========================================================= */}
                {showLoadingScreen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-2xl animate-fade-in">
                        <div className="absolute inset-0 overflow-hidden">
                            {[...Array(30)].map((_, i) => (
                                <div
                                    key={i}
                                    className="absolute w-1 h-1 bg-cyan-400/40 rounded-full"
                                    style={{
                                        top: `${Math.random() * 100}%`,
                                        left: `${Math.random() * 100}%`,
                                        animation: `float-particle ${3 + Math.random() * 4}s ease-in-out ${Math.random() * 3}s infinite`,
                                        width: `${2 + Math.random() * 4}px`,
                                        height: `${2 + Math.random() * 4}px`,
                                    }}
                                />
                            ))}
                        </div>

                        <div className="relative max-w-md w-full mx-4 p-8 bg-black border border-cyan-500/30 rounded-lg shadow-[0_0_50px_rgba(0,255,255,0.3)]">
                            <div className="absolute -top-20 -right-20 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl"></div>
                            <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-purple-500/10 rounded-full blur-3xl"></div>

                            {/* Terminal header */}
                            <div className="relative flex items-center gap-2 mb-6 pb-3 border-b border-cyan-500/20">
                                <div className="w-3 h-3 rounded-full bg-red-500/70"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-500/70"></div>
                                <div className="w-3 h-3 rounded-full bg-green-500/70"></div>
                                <span className="ml-2 text-xs font-mono text-cyan-500/60">neural-network-build</span>
                            </div>

                            <div className="relative flex justify-center mb-6">
                                <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-cyan-500/50 animate-neon-glow">
                                    <span className="text-4xl animate-bounce-subtle">🤖</span>
                                </div>
                                <div className="absolute inset-0 rounded-lg border-2 border-cyan-400/30 animate-pulse-ring"></div>
                            </div>

                            <h3 className="relative text-xl font-mono font-bold text-white text-center mb-2">
                                <span className="text-cyan-400">&gt;</span> Building_Your_Website
                            </h3>

                            <p className="relative text-center font-mono text-cyan-300/80 text-sm mb-6 min-h-[24px] transition-all duration-500">
                                {loadingText}
                            </p>

                            <div className="relative space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-mono text-cyan-500/60 tracking-wider">PROCESSING</span>
                                    <span className="text-2xl font-mono font-bold text-transparent bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text">
                                        {Math.round(progress)}%
                                    </span>
                                </div>

                                <div className="relative h-3 bg-black rounded overflow-hidden border border-cyan-500/30">
                                    <div
                                        className="h-full bg-gradient-to-r from-cyan-400 via-purple-400 to-cyan-400 rounded transition-all duration-300 ease-out relative"
                                        style={{
                                            width: `${progress}%`,
                                            backgroundSize: '200% 100%',
                                            animation: 'loading-shimmer 1.5s linear infinite',
                                        }}
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer-slide"></div>
                                    </div>
                                </div>

                                <div
                                    className="h-1 bg-gradient-to-r from-cyan-400/20 via-purple-400/20 to-cyan-400/20 rounded blur-sm transition-all duration-300"
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>

                            <div className="relative flex justify-center gap-1 mt-6">
                                {[...Array(5)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="w-1.5 h-1.5 bg-cyan-400/60 rounded"
                                        style={{
                                            animation: `loading-dot 1.2s ease-in-out ${i * 0.15}s infinite`,
                                        }}
                                    />
                                ))}
                            </div>

                            <p className="relative text-center text-[10px] font-mono text-cyan-500/40 mt-4 tracking-wider">
                                {progress < 30 && "$ initializing_ai_engine.sh"}
                                {progress >= 30 && progress < 60 && "$ generating_website_structure.py"}
                                {progress >= 60 && progress < 85 && "$ designing_layout_styling.js"}
                                {progress >= 85 && progress < 100 && "$ finalizing_website_build.sh"}
                                {progress === 100 && "✨ Build Complete!"}
                            </p>
                        </div>
                    </div>
                )}

                {/* =========================================================
                    CYBERPUNK CHAT WINDOW - UNCHANGED
                ========================================================= */}
                <div className="chat-window w-full max-w-4xl bg-black rounded-lg shadow-[0_0_50px_rgba(0,255,255,0.3)] overflow-hidden relative border border-cyan-500/30">
                    {/* Header */}
                    <div className="chat-header bg-black text-white px-6 py-5 relative border-b-2 border-cyan-500/50">
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-transparent to-purple-500/20"></div>
                        <div className="flex items-center justify-between relative">
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center font-bold text-xl shadow-lg shadow-cyan-500/50 ${aiThinking ? 'ai-thinking-avatar' : ''}`}>
                                        {aiThinking ? '🤖' : '>_'}
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded border-2 border-black animate-pulse"></div>
                                </div>
                                <div>
                                    <div className="font-mono text-lg font-bold tracking-tight">
                                        <span className="text-cyan-400">Build</span>
                                        <span className="text-purple-400">And</span>
                                        <span className="text-cyan-400">Host</span>
                                        <span className="text-white/60 ml-2 animate-glitch inline-block">AI</span>
                                    </div>
                                    <div className="text-xs text-white/60 flex items-center gap-2 font-mono">
                                        <span className={`inline-block w-2 h-2 rounded ${aiThinking ? 'bg-cyan-400 animate-pulse' : 'bg-green-400'}`}></span>
                                        <span className="text-cyan-400/70">{aiThinking ? '> processing...' : user ? `> user: ${user.username}` : '> system: online'}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                {/* =========================================================
                                    CYBERPUNK TERMINAL DROPDOWN - UNCHANGED
                                ========================================================= */}
                                <div className="relative" ref={dropdownRef}>
                                    <button
                                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                        className="flex items-center gap-2 px-4 py-2 rounded bg-black border border-cyan-500/40 text-cyan-300 font-mono text-sm font-medium hover:border-cyan-400 hover:text-cyan-200 transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,255,255,0.3)] group"
                                    >
                                        <span className="text-purple-400">&gt;</span>
                                        <span>{getCurrentTypeLabel().replace(/^[^\s]+\s/, '')}</span>
                                        <svg
                                            className={`w-4 h-4 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180 text-cyan-400' : 'text-purple-400'}`}
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>

                                    {/* Cyberpunk Terminal Dropdown Menu */}
                                    {isDropdownOpen && (
                                        <div className="absolute right-0 mt-2 w-72 bg-black rounded border border-cyan-500/40 shadow-[0_0_30px_rgba(0,255,255,0.4)] overflow-hidden dropdown-animate" style={{ zIndex: 9999 }}>
                                            {/* Terminal header */}
                                            <div className="px-3 py-2 bg-black border-b border-cyan-500/30 flex items-center gap-2">
                                                <div className="w-2 h-2 rounded bg-red-500/70"></div>
                                                <div className="w-2 h-2 rounded bg-yellow-500/70"></div>
                                                <div className="w-2 h-2 rounded bg-green-500/70"></div>
                                                <span className="ml-2 text-[10px] font-mono text-cyan-500/60">select_website_type.sh</span>
                                            </div>

                                            <div className="p-1.5 max-h-[300px] overflow-y-auto custom-scrollbar">
                                                {websiteTypes.map((item) => (
                                                    <button
                                                        key={item.value}
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            console.log('Selecting type:', item.value);
                                                            handleTypeSelect(item.value);
                                                        }}
                                                        className={`w-full text-left px-3 py-2.5 rounded transition-all duration-200 group relative border-l-2 ${type === item.value
                                                            ? 'border-cyan-400 bg-cyan-500/20'
                                                            : 'border-transparent hover:border-cyan-400/50 hover:bg-cyan-500/5'
                                                            }`}
                                                        style={{ pointerEvents: 'auto', cursor: 'pointer', position: 'relative', zIndex: 10000 }}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-lg flex-shrink-0">{item.label.split(' ')[0]}</span>
                                                            <div className="flex-1 min-w-0">
                                                                <div className={`text-xs font-mono font-medium transition-colors duration-200 truncate ${type === item.value ? 'text-cyan-300' : 'text-cyan-200/80 group-hover:text-cyan-100'
                                                                    }`}>
                                                                    <span className="text-purple-400/60 mr-1">$</span>
                                                                    {item.label}
                                                                </div>
                                                                <div className="text-[9px] font-mono text-cyan-500/40 group-hover:text-cyan-400/60 transition-colors duration-200 truncate ml-3">
                                                                    # {item.description}
                                                                </div>
                                                            </div>
                                                            {type === item.value && (
                                                                <div className="flex-shrink-0 flex items-center gap-1">
                                                                    <span className="text-[8px] font-mono text-cyan-400">[OK]</span>
                                                                    <div className="w-1.5 h-1.5 rounded bg-cyan-400 shadow-lg shadow-cyan-400/50 animate-pulse"></div>
                                                                </div>
                                                            )}
                                                        </div>
                                                        {type === item.value && (
                                                            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-cyan-500/20 to-purple-500/20 pointer-events-none"></div>
                                                        )}
                                                    </button>
                                                ))}
                                            </div>

                                            {/* Terminal footer */}
                                            <div className="px-3 py-2 bg-black border-t border-cyan-500/30">
                                                <div className="text-[9px] font-mono text-cyan-500/50">
                                                    <span className="text-green-400">✓</span> {websiteTypes.length} types available
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Chat Body - Unchanged */}
                    <div ref={containerRef} className="chat-body p-6 h-[60vh] overflow-auto bg-black relative z-[1]">
                        <div className="space-y-4 max-w-full">
                            {messages.map((m, i) => (
                                <div key={i} className={`flex ${m.role === "assistant" ? "justify-start" : "justify-end"} animate-slide-in w-full`}>
                                    {m.role === "assistant" && (
                                        <div className="w-8 h-8 rounded bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold mr-2 mt-1 shadow-md shadow-cyan-500/30 flex-shrink-0">
                                            &gt;_
                                        </div>
                                    )}
                                    <div className={`px-4 py-3 rounded shadow-md transition-all hover:shadow-lg ${m.role === "assistant"
                                        ? "bg-cyan-500/10 border border-cyan-500/30 text-cyan-100/90 rounded-tl-none font-mono"
                                        : "bg-gradient-to-br from-cyan-500 to-purple-600 text-white rounded-tr-none font-mono"
                                        }`} style={{ maxWidth: '55%', wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                                        <p className="leading-relaxed text-sm">{m.text}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* File Error - Unchanged */}
                    {fileError && (
                        <div className="px-6 py-3 bg-red-500/10 border-t border-red-500/30">
                            <div className="flex items-center gap-2 text-red-400 text-sm font-mono">
                                <span>⚠️</span>
                                <span>{fileError}</span>
                            </div>
                        </div>
                    )}

                    {/* File Preview - Unchanged */}
                    {selectedFiles.length > 0 && (
                        <div className="px-6 py-2 bg-black border-t border-cyan-500/20">
                            <div className="flex flex-wrap gap-2">
                                {selectedFiles.map((fileName, index) => (
                                    <span key={index} className="inline-flex items-center gap-1 px-3 py-1 bg-cyan-500/10 text-cyan-300 rounded text-xs font-mono border border-cyan-500/30">
                                        📎 {fileName}
                                        <button
                                            onClick={() => {
                                                const newFiles = Array.from(files || []).filter((_, i) => i !== index);
                                                setFiles(newFiles.length > 0 ? newFiles as unknown as FileList : null);
                                                setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
                                                setFileError("");
                                            }}
                                            className="ml-1 hover:text-red-400 transition-colors"
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Input Area - Unchanged */}
                    <div className="chat-input p-4 border-t border-cyan-500/20 bg-black">
                        <div className="flex items-center gap-3">
                            <input
                                type="file"
                                ref={fileInputRef}
                                multiple
                                onChange={handleFileChange}
                                className="hidden"
                            />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="p-3 rounded border-2 border-dashed border-cyan-500/30 hover:border-cyan-400/60 hover:bg-cyan-500/10 transition-all group"
                                title="Attach files"
                            >
                                <svg className="w-5 h-5 text-cyan-400/60 group-hover:text-cyan-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                </svg>
                            </button>
                            <div className="flex-1 relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400/60 font-mono text-sm">$</span>
                                <input
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                                    placeholder="Describe your dream website..."
                                    className="w-full pl-10 pr-5 py-3.5 rounded border-2 border-cyan-500/30 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/20 transition-all bg-black text-white placeholder-cyan-500/40 font-mono"
                                />
                            </div>
                            <button
                                onClick={handleSend}
                                disabled={loading || !input.trim()}
                                className="px-6 py-3 rounded btn-primary text-white font-mono font-semibold flex items-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Building...
                                    </>
                                ) : (
                                    <>
                                        Execute
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                        </svg>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Custom scrollbar for cyberpunk dropdown */}
            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: black;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(0, 255, 255, 0.3);
                    border-radius: 2px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(0, 255, 255, 0.5);
                }
            `}</style>
        </>
    );
}