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
      navigate('/dashboard');
    } else {
      setError(result.error || 'Invalid email or password');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0a1a] via-[#1a0a2e] to-[#0a0a1a] p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-600/20 rounded-full blur-3xl animate-float-slow"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl animate-float-slower"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-3xl animate-pulse-slow"></div>
        
        {/* Floating particles */}
        <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-purple-400/60 rounded-full animate-particle"></div>
        <div className="absolute top-1/3 right-1/3 w-1.5 h-1.5 bg-indigo-400/60 rounded-full animate-particle-delay-1"></div>
        <div className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-blue-400/60 rounded-full animate-particle-delay-2"></div>
        <div className="absolute top-2/3 right-1/4 w-1.5 h-1.5 bg-purple-400/60 rounded-full animate-particle-delay-3"></div>
        <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-indigo-400/40 rounded-full animate-particle-delay-4"></div>
      </div>

      {/* Main container with entrance animation */}
      <div className={`w-full max-w-md relative z-10 transition-all duration-1000 transform ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
      }`}>
        {/* Logo/Brand with animation */}
        <div className="text-center mb-8 animate-float">
          <div className="inline-flex items-center justify-center gap-3 group">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-3 rounded-2xl shadow-2xl shadow-purple-500/30 group-hover:shadow-purple-500/50 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <span className="text-4xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
              BuildAndHost
            </span>
          </div>
          <p className="text-purple-200/60 mt-3 text-sm font-light tracking-wider animate-pulse-subtle">
            Welcome back! Sign in to continue
          </p>
        </div>

        {/* Card with glassmorphism and hover effect */}
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/10 hover:border-white/20 transition-all duration-500 hover:shadow-purple-500/10">
          {/* Decorative gradient line */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"></div>

          {/* Error message with slide animation */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3 backdrop-blur-sm animate-slide-down">
              <div className="flex-shrink-0 w-5 h-5 bg-red-500/20 rounded-full flex items-center justify-center mt-0.5 animate-pulse">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-red-200">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email with focus animation */}
            <div className="transform transition-all duration-300 hover:scale-[1.02]">
              <label className="block text-sm font-medium text-purple-200/80 mb-2 transition-all duration-300">
                Email Address
              </label>
              <div className={`relative group transition-all duration-300 ${
                emailFocused ? 'scale-[1.02]' : ''
              }`}>
                <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-all duration-300 ${
                  emailFocused ? 'text-purple-400' : 'text-purple-300/50'
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
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl focus:border-purple-400 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300 outline-none text-white placeholder:text-white/30 hover:border-white/20"
                />
                {email && (
                  <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-400 animate-fade-in" />
                )}
              </div>
            </div>

            {/* Password with focus animation */}
            <div className="transform transition-all duration-300 hover:scale-[1.02]">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-purple-200/80 transition-all duration-300">
                  Password
                </label>
                <button
                  type="button"
                  className="text-sm text-purple-300/60 hover:text-purple-200 font-medium hover:underline transition-all duration-300 hover:scale-105"
                >
                  Forgot password?
                </button>
              </div>
              <div className={`relative group transition-all duration-300 ${
                passwordFocused ? 'scale-[1.02]' : ''
              }`}>
                <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-all duration-300 ${
                  passwordFocused ? 'text-purple-400' : 'text-purple-300/50'
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
                  className="w-full pl-10 pr-12 py-3 bg-white/5 border border-white/10 rounded-2xl focus:border-purple-400 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300 outline-none text-white placeholder:text-white/30 hover:border-white/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-purple-300/50 hover:text-purple-200 transition-all duration-300 hover:scale-110"
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
              <label className="flex items-center gap-2 text-sm text-purple-200/60 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-white/20 bg-white/5 text-purple-600 focus:ring-purple-500 focus:ring-offset-0 cursor-pointer"
                  />
                  <div className={`absolute inset-0 rounded border-2 border-purple-400/0 transition-all duration-300 ${
                    rememberMe ? 'border-purple-400/50 scale-110' : ''
                  }`}></div>
                </div>
                <span className="group-hover:text-purple-200 transition-all duration-300">Remember me</span>
              </label>
              <Shield className="w-4 h-4 text-purple-300/30 animate-pulse-subtle" />
            </div>

            {/* Submit button with hover animation */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold py-3.5 rounded-2xl shadow-lg hover:shadow-purple-500/30 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 group relative overflow-hidden"
            >
              {/* Button background animation */}
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              
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
            <p className="text-purple-200/50">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="text-purple-200 hover:text-white font-semibold transition-all duration-300 relative group"
              >
                <span className="relative">
                  Create account
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-400 group-hover:w-full transition-all duration-300"></span>
                </span>
              </Link>
            </p>
          </div>
        </div>

        {/* Footer with fade-in */}
        <p className="text-center text-xs text-purple-300/30 mt-6 animate-fade-in">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>

      {/* Custom CSS animations */}
      <style>{`
        @keyframes float-slow {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(30px, -30px) scale(1.1); }
        }
        
        @keyframes float-slower {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-30px, 30px) scale(1.2); }
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.1); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes pulse-subtle {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
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
        
        .animate-pulse-slow {
          animation: pulse-slow 8s ease-in-out infinite;
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-pulse-subtle {
          animation: pulse-subtle 3s ease-in-out infinite;
        }
        
        .animate-slide-down {
          animation: slide-down 0.5s ease-out;
        }
        
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
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
      `}</style>
    </div>
  );
}