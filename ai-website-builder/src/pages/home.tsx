import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';

export default function Home() {
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();

    const features = [
        {
            icon: '✦',
            title: 'AI Website Builder',
            description:
                'Describe your idea in natural language and let AI transform your vision into a professional website.',
            link: '/chat',
            accent: 'from-cyan-400 to-blue-500',
        },
        {
            icon: '⌁',
            title: 'Visual Editor',
            description:
                'Fine-tune your generated website with an intuitive visual editor without complicated coding.',
            link: '/editor',
            accent: 'from-violet-400 to-purple-600',
        },
        {
            icon: '◈',
            title: 'Website Management',
            description:
                'Manage, preview and organize all of your generated websites from one simple workspace.',
            link: '/websites',
            accent: 'from-emerald-400 to-teal-500',
        }
        // {
        //     icon: '↗',
        //     title: 'Publish & Deploy',
        //     description:
        //         'Take your website from development to the web and make your digital presence accessible online.',
        //     link: '/deploy',
        //     accent: 'from-orange-400 to-pink-500',
        // },
    ];

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

                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-8px); }
                }

                @keyframes shimmer {
                    0% { background-position: -200% center; }
                    100% { background-position: 200% center; }
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

                .animate-float {
                    animation: float 6s ease-in-out infinite;
                }

                .text-shimmer {
                    background: linear-gradient(90deg, #fff 0%, #c4b5d4 25%, #a78bfa 50%, #c4b5d4 75%, #fff 100%);
                    background-size: 200% auto;
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    animation: shimmer 4s linear infinite;
                }

                .luxury-border {
                    border-image: linear-gradient(135deg, rgba(167, 139, 250, 0.3), rgba(139, 92, 246, 0.1), rgba(167, 139, 250, 0.3)) 1;
                }

                /* Button Styles from First File */
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

                .btn-secondary {
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    transition: all 0.3s ease;
                }

                .btn-secondary:hover {
                    background: rgba(255, 255, 255, 0.1);
                    border-color: rgba(6, 182, 212, 0.3);
                    transform: translateY(-2px);
                    box-shadow: 0 4px 20px rgba(6, 182, 212, 0.1);
                }

                .btn-gradient-cyan {
                    background: linear-gradient(135deg, #22d3ee 0%, #06b6d4 40%, #0891b2 70%, #0e7490 100%);
                    box-shadow: 0 4px 25px rgba(6, 182, 212, 0.3);
                    transition: all 0.3s ease;
                }

                .btn-gradient-cyan:hover {
                    transform: translateY(-2px) scale(1.02);
                    box-shadow: 0 8px 35px rgba(6, 182, 212, 0.5);
                }

                .btn-purple {
                    background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 50%, #6d28d9 100%);
                    box-shadow: 0 4px 20px rgba(139, 92, 246, 0.3);
                    transition: all 0.3s ease;
                }

                .btn-purple:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 30px rgba(139, 92, 246, 0.5);
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

                @keyframes gradient-shift {
                    0%, 100% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                }
            `}</style>

            {/* =========================================================
                BACKGROUND - FROM FIRST FILE
            ========================================================= */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                {/* Main purple glow */}
                <div className="absolute -top-72 left-1/2 -translate-x-1/2 w-[900px] h-[700px] rounded-full bg-purple-600/[0.16] blur-[160px] animate-pulse-soft" />
                
                {/* Blue glow */}
                <div className="absolute top-[25%] -left-72 w-[600px] h-[600px] rounded-full bg-blue-600/[0.10] blur-[150px] animate-float-slow" />
                
                {/* Violet glow */}
                <div className="absolute bottom-[-300px] right-[-200px] w-[700px] h-[700px] rounded-full bg-violet-600/[0.12] blur-[160px] animate-float-slower" />
                
                {/* Cyan glow */}
                <div className="absolute top-[55%] left-[45%] w-[350px] h-[350px] rounded-full bg-cyan-500/[0.05] blur-[120px]" />
                
                {/* Subtle grid */}
                <div className="absolute inset-0 opacity-[0.035]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
            </div>

            {/* =========================================================
                NAVIGATION
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
                            <Link to="/" className="px-4 py-2 rounded-lg bg-white/[0.09] text-white text-sm font-body font-medium border border-white/[0.08]">Home</Link>
                            <Link to="/chat" className="px-4 py-2 rounded-lg text-white/65 hover:text-white hover:bg-white/[0.06] text-sm font-body font-medium transition-all">AI Builder</Link>
                            <Link to="/websites" className="px-4 py-2 rounded-lg text-white/65 hover:text-white hover:bg-white/[0.06] text-sm font-body font-medium transition-all">My Websites</Link>
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

            {/* =========================================================
                MAIN CONTENT
            ========================================================= */}
            <main className="relative z-10">

                {/* HERO SECTION */}
                <section className="relative max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 pt-24 sm:pt-32 lg:pt-36 pb-24">
                    <div className="max-w-4xl mx-auto text-center">

                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-400/25 bg-purple-500/[0.09] shadow-lg shadow-purple-500/[0.05] mb-8">
                            <span className="relative flex w-2 h-2">
                                <span className="absolute inline-flex w-full h-full rounded-full bg-cyan-400 animate-ping opacity-60" />
                                <span className="relative inline-flex w-2 h-2 rounded-full bg-cyan-400" />
                            </span>
                            <span className="text-[10px] font-serif-light font-semibold tracking-[0.16em] uppercase text-purple-100/80">AI-powered website creation</span>
                        </div>

                        {/* Heading */}
                        <h1 className="font-luxury text-5xl sm:text-6xl lg:text-[82px] font-bold tracking-[-0.055em] leading-[0.95] text-white">
                            Turn your ideas<br />
                            <span className="bg-gradient-to-r from-cyan-300 via-blue-400 to-purple-400 bg-clip-text text-transparent">into websites.</span>
                        </h1>

                        {/* Description */}
                        <p className="font-serif-light max-w-2xl mx-auto mt-8 text-lg sm:text-xl leading-8 text-white/65 font-light tracking-wide">
                            Describe what you want to build, and let AI create a professional website for you.
                            Customize it visually, manage your projects, and publish when you're ready.
                        </p>

                        {/* CTA Buttons */}
                        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link to="/chat" className="group w-full sm:w-auto inline-flex items-center justify-center gap-3 px-7 py-4 rounded-xl btn-primary text-white font-body font-semibold tracking-wide">
                                <span>Start Building</span>
                                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M5 12h14" />
                                    <path d="m13 6 6 6-6 6" />
                                </svg>
                            </Link>

                            <Link to="/websites" className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-4 rounded-xl btn-secondary text-white/85 font-body font-medium tracking-wide">
                                View My Websites
                            </Link>
                        </div>
                    </div>

                    {/* Product Preview */}
                    <div className="relative mt-24 max-w-6xl mx-auto">
                        <div className="absolute inset-x-20 -bottom-10 h-40 bg-purple-600/20 blur-[100px]" />
                        <div className="relative rounded-2xl border border-white/[0.12] bg-[#0b0e19]/95 p-2 shadow-2xl shadow-black/60 luxury-border">
                            <div className="h-11 flex items-center gap-2 px-4 border-b border-white/[0.08]">
                                <div className="w-2.5 h-2.5 rounded-full bg-red-400/60" />
                                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/60" />
                                <div className="w-2.5 h-2.5 rounded-full bg-green-400/60" />
                                <div className="flex-1 flex justify-center">
                                    <div className="w-full max-w-lg h-7 rounded-md border border-white/[0.07] bg-white/[0.035] flex items-center justify-center">
                                        <span className="text-[10px] font-serif-light text-white/35 tracking-wider">yourwebsite.buildandhost.app</span>
                                    </div>
                                </div>
                            </div>

                            <div className="relative overflow-hidden rounded-b-xl min-h-[390px] sm:min-h-[500px] bg-[#0d1120]">
                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.13] via-transparent to-purple-500/[0.10]" />
                                <div className="relative grid lg:grid-cols-2 gap-10 items-center min-h-[390px] sm:min-h-[500px] p-8 sm:p-14 lg:p-20">
                                    <div>
                                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-400/20 bg-cyan-400/[0.05] mb-6">
                                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                                            <span className="text-[10px] font-serif-light text-cyan-200/75 tracking-wider">AVAILABLE FOR WORK</span>
                                        </div>
                                        <div className="text-sm font-serif-light text-white/50 tracking-wide mb-3">Hello, I'm Alex</div>
                                        <h2 className="font-luxury text-4xl sm:text-5xl font-bold tracking-tight mb-5 text-white">
                                            Creative
                                            <span className="block bg-gradient-to-r from-white to-purple-300 bg-clip-text text-transparent">Developer.</span>
                                        </h2>
                                        <p className="text-sm font-serif-light leading-6 text-white/50 max-w-md mb-7 tracking-wide">
                                            I design and build modern digital experiences using technology, creativity and thoughtful design.
                                        </p>
                                        <div className="flex gap-3">
                                            <div className="px-5 py-2.5 rounded-lg btn-gradient-cyan text-white text-xs font-body font-semibold tracking-wide">View My Work</div>
                                            <div className="px-5 py-2.5 rounded-lg border border-white/10 bg-white/[0.04] text-white/70 text-xs font-body hover:bg-white/[0.06] transition-all">Contact Me</div>
                                        </div>
                                    </div>
                                    <div className="hidden lg:flex justify-center">
                                        <div className="relative w-[290px]">
                                            <div className="absolute -top-8 -right-10 w-28 h-24 rounded-xl border border-white/10 bg-white/[0.06] backdrop-blur-xl p-4 shadow-xl rotate-6">
                                                <div className="text-[9px] font-serif-light text-white/40 tracking-wider mb-3">PROJECTS</div>
                                                <div className="text-xl font-luxury font-bold text-white">24</div>
                                                <div className="w-full h-1 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 mt-3" />
                                            </div>
                                            <div className="rounded-2xl border border-white/[0.1] bg-white/[0.05] backdrop-blur-xl p-5 shadow-2xl">
                                                <div className="h-40 rounded-xl bg-gradient-to-br from-indigo-500/40 via-purple-500/20 to-cyan-400/10 mb-5 relative overflow-hidden">
                                                    <div className="absolute w-32 h-32 rounded-full bg-purple-400/20 blur-3xl top-4 left-8" />
                                                </div>
                                                <div className="flex items-center justify-between mb-4">
                                                    <div>
                                                        <div className="h-3 w-24 rounded-full bg-white/25 mb-2" />
                                                        <div className="h-2 w-16 rounded-full bg-white/15" />
                                                    </div>
                                                    <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-400/20 flex items-center justify-center text-purple-300">↗</div>
                                                </div>
                                                <div className="grid grid-cols-3 gap-2">
                                                    <div className="h-9 rounded-lg bg-white/[0.07]" />
                                                    <div className="h-9 rounded-lg bg-white/[0.07]" />
                                                    <div className="h-9 rounded-lg bg-white/[0.07]" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Trust Stats */}
                    <div className="max-w-3xl mx-auto mt-14 grid grid-cols-3 divide-x divide-white/[0.10]">
                        <div className="text-center px-4">
                            <div className="font-luxury text-2xl font-bold text-white">AI</div>
                            <div className="text-[10px] font-serif-light text-white/45 mt-1 tracking-wider">Powered Creation</div>
                        </div>
                        <div className="text-center px-4">
                            <div className="font-luxury text-2xl font-bold text-white">01</div>
                            <div className="text-[10px] font-serif-light text-white/45 mt-1 tracking-wider">Simple Workflow</div>
                        </div>
                        <div className="text-center px-4">
                            <div className="font-luxury text-2xl font-bold text-white">∞</div>
                            <div className="text-[10px] font-serif-light text-white/45 mt-1 tracking-wider">Creative Possibilities</div>
                        </div>
                    </div>
                </section>

                {/* FEATURES SECTION */}
                <section className="relative border-y border-white/[0.08] bg-white/[0.018]">
                    <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-24">
                        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-14">
                            <div>
                                <div className="inline-flex items-center gap-2 text-[10px] font-serif-light uppercase tracking-[0.2em] text-purple-300 font-semibold mb-4">
                                    <span className="w-6 h-px bg-purple-400" />
                                    Powerful workflow
                                </div>
                                <h2 className="font-luxury text-3xl sm:text-5xl font-bold tracking-tight text-white">
                                    Everything you need to
                                    <span className="block bg-gradient-to-r from-white to-white/50 bg-clip-text text-transparent">build your website.</span>
                                </h2>
                            </div>
                            <p className="max-w-md text-sm font-serif-light leading-7 text-white/55 tracking-wide">
                                From your first idea to a published website, BuildAndHost brings the entire creation process into one flexible platform.
                            </p>
                        </div>

                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {features.map((feature, index) => (
                                <Link key={feature.title} to={feature.link} className="group relative overflow-hidden min-h-[300px] rounded-2xl border border-white/[0.09] bg-[#0b0e18] p-7 hover:border-white/[0.18] hover:-translate-y-1 transition-all duration-300">
                                    <div className={`absolute -top-24 -right-24 w-48 h-48 rounded-full bg-gradient-to-br ${feature.accent} opacity-0 blur-[70px] group-hover:opacity-20 transition-opacity duration-500`} />
                                    <div className="relative">
                                        <div className="flex items-center justify-between mb-12">
                                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.accent} p-[1px] shadow-lg`}>
                                                <div className="w-full h-full rounded-[11px] bg-[#0b0e18] flex items-center justify-center">
                                                    <span className="text-lg text-white">{feature.icon}</span>
                                                </div>
                                            </div>
                                            <span className="text-[10px] font-serif-light text-white/30 tracking-wider">0{index + 1}</span>
                                        </div>
                                        <h3 className="font-luxury text-lg font-bold mb-3 text-white group-hover:text-purple-300 transition-colors tracking-wide">{feature.title}</h3>
                                        <p className="text-sm font-serif-light leading-6 text-white/50 tracking-wide">{feature.description}</p>
                                        <div className="absolute mt-8 text-white/35 group-hover:text-white group-hover:translate-x-1 transition-all">→</div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>

                {/* HOW IT WORKS */}
                <section className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-24">
                    <div className="text-center mb-16">
                        <div className="text-[10px] font-serif-light uppercase tracking-[0.2em] text-cyan-300 font-semibold mb-4">How it works</div>
                        <h2 className="font-luxury text-3xl sm:text-5xl font-bold tracking-tight text-white">
                            From idea to website<br />
                            in a few simple steps.
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-5">
                        {[
                            { step: '01', title: 'Describe', text: 'Tell the AI what kind of website you want to create.' },
                            { step: '02', title: 'Customize', text: 'Review your generated website and personalize the content and design.' },
                            { step: '03', title: 'Publish', text: 'Deploy your finished website and share your work with the world.' },
                        ].map((item) => (
                            <div key={item.step} className="relative rounded-2xl border border-white/[0.09] bg-white/[0.025] p-8 hover:bg-white/[0.045] hover:border-white/[0.14] transition-all">
                                <span className="text-sm font-luxury font-bold text-purple-300">{item.step}</span>
                                <h3 className="font-luxury text-2xl font-bold text-white mt-8 mb-3">{item.title}</h3>
                                <p className="text-sm font-serif-light leading-6 text-white/50 tracking-wide">{item.text}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* CTA SECTION */}
                {!isAuthenticated && (
                    <section className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 pb-28">
                        <div className="relative overflow-hidden rounded-3xl border border-purple-400/20 bg-gradient-to-br from-indigo-600/20 via-purple-600/[0.12] to-cyan-500/[0.08] p-10 sm:p-16">
                            <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[500px] h-[350px] rounded-full bg-purple-500/20 blur-[120px]" />
                            <div className="relative text-center">
                                <div className="inline-flex px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.05] text-[10px] font-serif-light uppercase tracking-[0.18em] text-white/55 mb-6">Start building today</div>
                                <h2 className="font-luxury text-3xl sm:text-5xl font-bold tracking-tight text-white">
                                    Your idea is the<br />
                                    <span className="bg-gradient-to-r from-cyan-300 to-purple-400 bg-clip-text text-transparent">starting point.</span>
                                </h2>
                                <p className="max-w-xl mx-auto mt-6 text-white/55 font-serif-light leading-7 tracking-wide">
                                    Create a professional website without starting from a blank screen or writing everything from scratch.
                                </p>
                                <Link to="/register" className="btn-get-started inline-flex items-center gap-3 mt-9 px-7 py-4 rounded-xl text-white font-body font-semibold shadow-2xl tracking-wide">
                                    Create Your Website
                                    <span className="text-lg">→</span>
                                </Link>
                            </div>
                        </div>
                    </section>
                )}
            </main>

            {/* FOOTER */}
            <footer className="relative z-10 border-t border-white/[0.08] bg-[#05060b]">
                <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-10">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <Link to="/" className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                                <span className="text-[10px] font-luxury font-bold text-white">B&H</span>
                            </div>
                            <div>
                                <div className="font-luxury text-sm font-bold text-white tracking-wide">BuildAndHost</div>
                                <div className="text-[10px] font-serif-light text-white/35 tracking-wider">AI Website Builder</div>
                            </div>
                        </Link>
                        <div className="text-[10px] font-serif-light text-white/35 tracking-wider">© 2026 BuildAndHost. All rights reserved.</div>
                        <div className="flex items-center gap-6 text-[10px] font-serif-light text-white/40 tracking-wider">
                            <a href="#" className="hover:text-white transition-colors">Privacy</a>
                            <a href="#" className="hover:text-white transition-colors">Terms</a>
                            <a href="#" className="hover:text-white transition-colors">Support</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}