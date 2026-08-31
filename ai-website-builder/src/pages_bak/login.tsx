import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import {
  Mail,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  Sparkles,
  Shield,
  CheckCircle
} from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    await new Promise(resolve => setTimeout(resolve, 1500));

    const result = await login(email, password);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.error || 'Invalid email or password');
    }

    setLoading(false);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
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

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }

        @keyframes slide-down {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }

        @keyframes bounce {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }

        @keyframes particle {
          0% {
            transform: translate(0, 0) scale(1);
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translate(100px, -100px) scale(0);
            opacity: 0;
          }
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

        .animate-slide-down {
          animation: slide-down 0.5s ease-out;
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }

        .animate-bounce {
          animation: bounce 1s ease-in-out infinite;
        }

        .animate-particle {
          animation: particle 8s linear infinite;
        }

        .animate-particle-delay-1 {
          animation: particle 10s linear infinite 1s;
        }

        .animate-particle-delay-2 {
          animation: particle 12s linear infinite 2s;
        }

        .animate-particle-delay-3 {
          animation: particle 9s linear infinite 3s;
        }

        .animate-particle-delay-4 {
          animation: particle 11s linear infinite 4s;
        }

        .btn-gold-purple {
          background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 25%, #8b5cf6 50%, #7c3aed 75%, #6d28d9 100%);
          background-size: 200% 200%;
          box-shadow: 0 4px 25px rgba(251, 191, 36, 0.25);
          transition: all 0.4s ease;
          animation: gradient-shift 3s ease-in-out infinite;
        }

        .btn-gold-purple:hover {
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 8px 35px rgba(251, 191, 36, 0.4);
        }

        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>

      {/* Background */}
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
        <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-amber-400/20 rounded-full animate-float-slow" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Main container with entrance animation */}
      <div className={`w-full max-w-md relative z-10 transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
        {/* Logo/Brand with animation */}
        <div className="text-center mb-8 animate-float">
          <div className="inline-flex items-center justify-center gap-3 group">
            <div className="bg-gradient-to-r from-amber-400 via-purple-400 to-amber-300 p-3 rounded-2xl shadow-2xl shadow-purple-500/20 group-hover:shadow-amber-400/30 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <span className="text-4xl font-luxury font-bold bg-gradient-to-r from-white to-amber-200 bg-clip-text text-transparent">
              BuildAndHost
            </span>
          </div>
          <p className="font-serif-light text-amber-200/50 mt-3 text-sm tracking-wider animate-pulse-soft">
            Welcome back! Sign in to continue
          </p>
        </div>

        {/* Card with glassmorphism and hover effect */}
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/10 hover:border-amber-400/20 transition-all duration-500 hover:shadow-amber-400/5 relative">
          {/* Decorative gradient line */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-amber-400 via-purple-400 to-amber-300 rounded-full"></div>
          <div className="absolute -top-3 -right-3 w-12 h-12 bg-amber-400/20 rounded-full blur-xl"></div>
          <div className="absolute -bottom-3 -left-3 w-12 h-12 bg-purple-400/20 rounded-full blur-xl"></div>

          {/* Error message with slide animation */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3 backdrop-blur-sm animate-slide-down">
              <div className="flex-shrink-0 w-5 h-5 bg-red-500/20 rounded-full flex items-center justify-center mt-0.5 animate-pulse">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              </div>
              <div className="flex-1">
                <p className="text-sm font-serif-light text-red-200">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email with focus animation */}
            <div className="transform transition-all duration-300 hover:scale-[1.01]">
              <label className="block text-sm font-serif-light text-amber-200/70 mb-2 tracking-wide">
                Email Address
              </label>
              <div className={`relative group transition-all duration-300 ${emailFocused ? 'scale-[1.02]' : ''
                }`}>
                <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-all duration-300 ${emailFocused ? 'text-amber-400' : 'text-amber-300/30'
                  }`}>
                  <Mail className="h-5 w-5 transition-all duration-300 group-hover:scale-110" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  required
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl focus:border-amber-400 focus:ring-4 focus:ring-amber-400/20 transition-all duration-300 outline-none text-white placeholder:text-white/20 font-serif-light tracking-wide hover:border-white/20"
                />
                {email && (
                  <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-400 animate-fade-in" />
                )}
              </div>
            </div>

            {/* Password with focus animation */}
            <div className="transform transition-all duration-300 hover:scale-[1.01]">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-serif-light text-amber-200/70 tracking-wide">
                  Password
                </label>
                <button
                  type="button"
                  className="text-sm font-serif-light text-amber-300/40 hover:text-amber-200 transition-all duration-300 hover:scale-105 tracking-wide"
                >
                  Forgot password?
                </button>
              </div>
              <div className={`relative group transition-all duration-300 ${passwordFocused ? 'scale-[1.02]' : ''
                }`}>
                <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-all duration-300 ${passwordFocused ? 'text-amber-400' : 'text-amber-300/30'
                  }`}>
                  <Lock className="h-5 w-5 transition-all duration-300 group-hover:scale-110" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  required
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-12 py-3 bg-white/5 border border-white/10 rounded-2xl focus:border-amber-400 focus:ring-4 focus:ring-amber-400/20 transition-all duration-300 outline-none text-white placeholder:text-white/20 font-serif-light tracking-wide hover:border-white/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-amber-300/30 hover:text-amber-200 transition-all duration-300 hover:scale-110"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember me with custom checkbox animation */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm font-serif-light text-amber-200/40 cursor-pointer group tracking-wide">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-white/20 bg-white/5 text-amber-400 focus:ring-amber-400 focus:ring-offset-0 cursor-pointer"
                  />
                  <div className={`absolute inset-0 rounded border-2 border-amber-400/0 transition-all duration-300 ${rememberMe ? 'border-amber-400/50 scale-110' : ''
                    }`}></div>
                </div>
                <span className="group-hover:text-amber-200 transition-all duration-300">Remember me</span>
              </label>
              <Shield className="w-4 h-4 text-amber-300/20 animate-pulse-soft" />
            </div>

            {/* Submit button with hover animation */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-gold-purple text-white font-body font-semibold py-3.5 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group relative overflow-hidden tracking-wide"
            >
              {/* Button background animation */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin relative z-10" />
                  <span className="relative z-10">Signing in...</span>
                </>
              ) : (
                <>
                  <span className="relative z-10">Sign In</span>
                  <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform duration-300" />
                </>
              )}
            </button>
          </form>

          {/* Register link with hover animation */}
          <div className="mt-8 text-center">
            <p className="font-serif-light text-amber-200/40 tracking-wide">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="text-amber-200 hover:text-white font-semibold transition-all duration-300 relative group"
              >
                <span className="relative">
                  Create account
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-amber-400 group-hover:w-full transition-all duration-300"></span>
                </span>
              </Link>
            </p>
          </div>
        </div>

        {/* Footer with fade-in */}
        <p className="text-center text-[10px] font-serif-light text-amber-300/20 mt-6 tracking-wider">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}