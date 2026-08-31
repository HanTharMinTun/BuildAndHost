import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { api } from '../lib/api';
import type { Project, GeneratedWebsite } from '../lib/types';

// Loading phrases constant - moved outside component to avoid re-creation on each render
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
    const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
    const [currentProject, setCurrentProject] = useState<Project | null>(null);

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

    // Game-style loading screen states
    const [showLoadingScreen, setShowLoadingScreen] = useState(false);
    const [progress, setProgress] = useState(0);
    const [loadingText, setLoadingText] = useState("AI is thinking...");

    // Website types for dropdown - More suitable options
    const websiteTypes = [
        { value: "portfolio", label: "🎨 Portfolio", description: "Showcase your work & skills" },
        { value: "business", label: "💼 Business", description: "Professional company site" },
        { value: "blog", label: "📝 Blog", description: "Share stories & ideas" },
        { value: "dashboard", label: "📊 Dashboard", description: "Data & analytics" },
        { value: "ecommerce", label: "🛍️ E-Commerce", description: "Online store" },
        { value: "landing", label: "🚀 Landing Page", description: "Marketing & leads" },
        { value: "resume", label: "📄 Resume", description: "Professional profile" },
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

    // Create or get project on mount
    useEffect(() => {
        if (isAuthenticated && !currentProject) {
            createDefaultProject();
        }
    }, [isAuthenticated, currentProject]);

    async function createDefaultProject() {
        const response = await api.post<Project>('/api/projects', {
            name: 'My Website',
            description: 'Generated with AI Website Builder',
        });

        if (response.data) {
            setCurrentProject(response.data);
        }
    }

    function pushMessage(role: "user" | "assistant", text: string) {
        setMessages((m) => [...m, { role, text }]);
        setTimeout(() => containerRef.current?.scrollTo({ top: containerRef.current.scrollHeight, behavior: "smooth" }), 50);
    }

    // Smooth progress simulation - 0% to 99% with decelerating speed
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
            if (!currentProject) {
                await createDefaultProject();
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

            if (currentProject && result.website) {
                const saveResponse = await api.post<GeneratedWebsite>('/api/websites', {
                    project_id: currentProject.id,
                    website_json: result.website,
                    version: 1,
                });

                if (saveResponse.data) {
                    localStorage.setItem('websiteId', saveResponse.data.id);
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
            // Validate file count
            if (e.target.files.length > MAX_FILES) {
                setFileError(`You can only upload up to ${MAX_FILES} files at once.`);
                e.target.value = ""; // Reset input
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

    return (
        <>
            {/* =========================================================
                NAVIGATION - SAME AS HOME.TSX
            ========================================================= */}
            <nav className="relative z-50 border-b border-white/[0.08] bg-[#080a15]/75 backdrop-blur-2xl">
                <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
                    <div className="h-[76px] flex items-center justify-between">

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

                        <div className="hidden md:flex items-center gap-2">
                            <Link to="/" className="px-4 py-2 rounded-lg bg-white/[0.09] text-white text-sm font-body font-medium border border-white/[0.08]">Home</Link>
                            <Link to="/chat" className="px-4 py-2 rounded-lg text-white text-sm font-body font-medium bg-white/[0.09] border border-white/[0.08]">AI Builder</Link>
                            <Link to="/websites" className="px-4 py-2 rounded-lg text-white/65 hover:text-white hover:bg-white/[0.06] text-sm font-body font-medium transition-all">My Websites</Link>
                        </div>

                        <div className="flex items-center gap-3">
                            {isAuthenticated && user ? (
                                <>
                                    <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.05] border border-white/[0.08]">
                                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-cyan-400 flex items-center justify-center">
                                            <span className="text-[10px] font-luxury font-bold text-white">{user.username?.charAt(0)?.toUpperCase()}</span>
                                        </div>
                                        <span className="text-sm font-body text-white/80">{user.username}</span>
                                    </div>
                                    <button onClick={() => { logout(); navigate('/'); }} className="px-4 py-2.5 rounded-lg border border-white/[0.12] bg-white/[0.05] hover:bg-white/[0.10] text-sm font-body font-medium text-white/90 transition-all">Logout</button>
                                </>
                            ) : (
                                <>
                                    <Link to="/login" className="hidden sm:block px-4 py-2.5 text-sm font-body font-light text-white/75 hover:text-white transition-colors tracking-wide">Login</Link>
                                    <Link to="/register" className="btn-get-started px-5 py-2.5 rounded-lg text-white text-sm font-body font-semibold tracking-wide">Get Started</Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            <div
                className="chat-root min-h-screen flex items-center justify-center p-4 sm:p-6 relative overflow-hidden"
                style={{
                    fontFamily: "'Playfair Display', 'Cormorant Garamond', 'Georgia', serif",
                    background: 'radial-gradient(circle at 50% -10%, #31205f 0%, #15142d 28%, #090b18 65%, #05060d 100%)',
                }}
            >
                {/* =========================================================
                    ANIMATIONS & STYLES
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

                    .btn-primary:disabled {
                        opacity: 0.6;
                        cursor: not-allowed;
                        transform: none !important;
                    }

                    .btn-get-started {
                        background: linear-gradient(135deg, #22d3ee 0%, #06b6d4 25%, #8b5cf6 50%, #7c3aed 75%, #6d28d9 100%);
                        background-size: 200% 200%;
                        box-shadow: 0 4px 25px rgba(6, 182, 212, 0.3);
                        transition: all 0.4s ease;
                        animation: gradient-shift 3s ease-in-out infinite;
                    }

                    .btn-get-started:hover {
                        transform: translateY(-2px) scale(1.03);
                        box-shadow: 0 8px 40px rgba(6, 182, 212, 0.5);
                    }

                    .chat-window {
                        transition: all 0.3s ease;
                    }

                    .chat-window:hover {
                        border-color: rgba(6, 182, 212, 0.3);
                        box-shadow: 0 8px 40px rgba(6, 182, 212, 0.1);
                    }

                    .ai-thinking-avatar {
                        animation: avatar-pulse 1.5s ease-in-out infinite;
                    }

                    @keyframes avatar-pulse {
                        0%, 100% { box-shadow: 0 0 0 0 rgba(6, 182, 212, 0.4); }
                        50% { box-shadow: 0 0 0 20px rgba(6, 182, 212, 0); }
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

                    .dropdown-animate {
                        animation: dropdown-slide 0.25s ease-out forwards;
                        transform-origin: top center;
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
                    <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-cyan-400/40 rounded-full animate-float-slow"></div>
                    <div className="absolute top-1/3 right-1/3 w-1.5 h-1.5 bg-purple-400/40 rounded-full animate-float-slower"></div>
                    <div className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-cyan-400/30 rounded-full animate-float-slow" style={{ animationDelay: '2s' }}></div>
                    <div className="absolute top-2/3 right-1/4 w-1.5 h-1.5 bg-purple-400/30 rounded-full animate-float-slower" style={{ animationDelay: '3s' }}></div>
                </div>

                {/* =========================================================
                    GAME-STYLE LOADING SCREEN
                ========================================================= */}
                {showLoadingScreen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0a0615]/95 backdrop-blur-2xl animate-fade-in">
                        <div className="absolute inset-0 overflow-hidden">
                            {[...Array(20)].map((_, i) => (
                                <div
                                    key={i}
                                    className="absolute w-1 h-1 bg-cyan-400/30 rounded-full"
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

                        <div className="relative max-w-md w-full mx-4 p-8 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl shadow-cyan-500/10">
                            <div className="absolute -top-20 -right-20 w-60 h-60 bg-cyan-500/20 rounded-full blur-3xl"></div>
                            <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-purple-500/20 rounded-full blur-3xl"></div>

                            <div className="relative flex justify-center mb-6">
                                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-cyan-500/30">
                                    <span className="text-4xl animate-bounce-subtle">🧠</span>
                                </div>
                                <div className="absolute inset-0 rounded-2xl border-2 border-cyan-400/30 animate-pulse-ring"></div>
                            </div>

                            <h3 className="relative text-xl font-luxury font-bold text-white text-center mb-2">
                                Building Your Website
                            </h3>

                            <p className="relative text-center font-serif-light text-cyan-300/80 text-sm mb-6 min-h-[24px] transition-all duration-500">
                                {loadingText}
                            </p>

                            <div className="relative space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-serif-light text-white/40 tracking-wider">PROCESSING</span>
                                    <span className="text-2xl font-luxury font-bold text-transparent bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text">
                                        {Math.round(progress)}%
                                    </span>
                                </div>

                                <div className="relative h-3 bg-white/5 rounded-full overflow-hidden border border-white/10">
                                    <div
                                        className="h-full bg-gradient-to-r from-cyan-400 via-purple-400 to-cyan-400 rounded-full transition-all duration-300 ease-out relative"
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
                                    className="h-1 bg-gradient-to-r from-cyan-400/20 via-purple-400/20 to-cyan-400/20 rounded-full blur-sm transition-all duration-300"
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>

                            <div className="relative flex justify-center gap-1 mt-6">
                                {[...Array(5)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="w-1.5 h-1.5 bg-cyan-400/40 rounded-full"
                                        style={{
                                            animation: `loading-dot 1.2s ease-in-out ${i * 0.15}s infinite`,
                                        }}
                                    />
                                ))}
                            </div>

                            <p className="relative text-center text-[10px] font-serif-light text-white/20 mt-4 tracking-wider">
                                {progress < 30 && "Initializing AI engine..."}
                                {progress >= 30 && progress < 60 && "Generating website structure..."}
                                {progress >= 60 && progress < 85 && "Designing layout & styling..."}
                                {progress >= 85 && progress < 100 && "Finalizing your website..."}
                                {progress === 100 && "✨ Complete!"}
                            </p>
                        </div>
                    </div>
                )}

                {/* =========================================================
                    CHAT WINDOW
                ========================================================= */}
                <div className="chat-window w-full max-w-4xl bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden relative border border-white/10 hover:border-cyan-400/20">
                    {/* Header */}
                    <div className="chat-header bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-700 text-white px-6 py-5 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12"></div>
                        <div className="flex items-center justify-between relative">
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <div className={`w-12 h-12 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center font-bold text-xl border border-white/30 shadow-lg ${aiThinking ? 'ai-thinking-avatar' : ''}`}>
                                        {aiThinking ? '🧠' : 'AI'}
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-white animate-pulse"></div>
                                </div>
                                <div>
                                    <div className="font-luxury text-lg font-bold">BuildAndHost Assistant</div>
                                    <div className="text-sm opacity-90 flex items-center gap-2 font-serif-light">
                                        <span className={`inline-block w-2 h-2 rounded-full ${aiThinking ? 'bg-cyan-400 animate-pulse' : 'bg-emerald-400'}`}></span>
                                        {aiThinking ? 'AI is thinking...' : user ? `Welcome, ${user.username}` : 'Online • Ready to build'}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                {/* =========================================================
                                    IMPROVED PORTFOLIO DROPDOWN - ONLY THIS SECTION CHANGED
                                ========================================================= */}
                                <div className="relative" ref={dropdownRef}>
                                    <button
                                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/20 backdrop-blur border border-white/30 text-white font-body font-medium hover:bg-white/30 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                                    >
                                        <span>{getCurrentTypeLabel()}</span>
                                        <svg
                                            className={`w-4 h-4 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`}
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>

                                    {/* Premium Dropdown Menu */}
                                    {isDropdownOpen && (
                                        <div className="absolute right-0 mt-2 w-64 bg-white/10 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-2xl shadow-black/30 overflow-hidden dropdown-animate">
                                            <div className="p-1.5 max-h-[280px] overflow-y-auto custom-scrollbar">
                                                {websiteTypes.map((item) => (
                                                    <button
                                                        key={item.value}
                                                        onClick={() => handleTypeSelect(item.value)}
                                                        className={`w-full text-left px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${type === item.value
                                                                ? 'bg-gradient-to-r from-cyan-500/30 to-purple-500/30 border border-cyan-400/20'
                                                                : 'hover:bg-white/10'
                                                            }`}
                                                    >
                                                        <div className="flex items-center gap-2.5">
                                                            <span className="text-base flex-shrink-0">{item.label.split(' ')[0]}</span>
                                                            <div className="flex-1 min-w-0">
                                                                <div className={`text-xs font-body font-medium transition-colors duration-200 truncate ${type === item.value ? 'text-white' : 'text-white/80 group-hover:text-white'
                                                                    }`}>
                                                                    {item.label}
                                                                </div>
                                                                <div className="text-[9px] font-serif-light text-white/40 group-hover:text-white/60 transition-colors duration-200 truncate">
                                                                    {item.description}
                                                                </div>
                                                            </div>
                                                            {type === item.value && (
                                                                <div className="flex-shrink-0">
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-lg shadow-cyan-400/50 animate-pulse"></div>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-cyan-400 to-purple-400 transition-all duration-300 ${type === item.value ? 'w-full' : 'w-0 group-hover:w-full'
                                                            }`}></div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Chat Body */}
                    <div ref={containerRef} className="chat-body p-6 h-[60vh] overflow-auto bg-gradient-to-b from-[#0a0615]/50 to-[#05030a]/50">
                        <div className="space-y-4">
                            {messages.map((m, i) => (
                                <div key={i} className={`flex ${m.role === "assistant" ? "justify-start" : "justify-end"} animate-slide-in`}>
                                    {m.role === "assistant" && (
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center text-white text-xs font-bold mr-2 mt-1 shadow-md shadow-cyan-400/20 flex-shrink-0">
                                            AI
                                        </div>
                                    )}
                                    <div className={`max-w-[75%] px-5 py-3.5 rounded-2xl shadow-md transition-all hover:shadow-lg ${m.role === "assistant"
                                            ? "bg-white/10 backdrop-blur border border-white/10 text-white/90 rounded-tl-sm font-serif-light"
                                            : "bg-gradient-to-br from-cyan-500 to-purple-600 text-white rounded-tr-sm font-serif-light"
                                        }`}>
                                        <p className="leading-relaxed">{m.text}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* File Error */}
                    {fileError && (
                        <div className="px-6 py-3 bg-red-500/10 border-t border-red-500/20">
                            <div className="flex items-center gap-2 text-red-300 text-sm">
                                <span>⚠️</span>
                                <span>{fileError}</span>
                            </div>
                        </div>
                    )}

                    {/* File Preview */}
                    {selectedFiles.length > 0 && (
                        <div className="px-6 py-2 bg-[#0a0615]/30 border-t border-white/5">
                            <div className="flex flex-wrap gap-2">
                                {selectedFiles.map((fileName, index) => (
                                    <span key={index} className="inline-flex items-center gap-1 px-3 py-1 bg-cyan-500/10 text-cyan-300 rounded-full text-xs font-medium border border-cyan-500/20">
                                        📎 {fileName}
                                        <button
                                            onClick={() => {
                                                const newFiles = Array.from(files || []).filter((_, i) => i !== index);
                                                setFiles(newFiles.length > 0 ? newFiles as unknown as FileList : null);
                                                setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
                                                setFileError(""); // Clear error when removing files
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

                    {/* Input Area */}
                    <div className="chat-input p-4 border-t border-white/5 bg-[#05030a]/30 backdrop-blur">
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
                                className="p-3 rounded-xl border-2 border-dashed border-white/20 hover:border-cyan-400/50 hover:bg-cyan-500/10 transition-all group"
                                title="Attach files"
                            >
                                <svg className="w-5 h-5 text-white/40 group-hover:text-cyan-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                </svg>
                            </button>
                            <div className="flex-1 relative">
                                <input
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                                    placeholder="Describe your dream website..."
                                    className="w-full px-5 py-3.5 rounded-xl border-2 border-white/10 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/20 transition-all bg-white/5 text-white placeholder-white/40 font-serif-light"
                                />
                            </div>
                            <button
                                onClick={handleSend}
                                disabled={loading || !input.trim()}
                                className="px-6 py-3 rounded-xl btn-primary text-white font-body font-semibold flex items-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        Send
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

            {/* Custom scrollbar for dropdown */}
            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 3px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(6, 182, 212, 0.3);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(6, 182, 212, 0.5);
                }
            `}</style>
        </>
    );
}