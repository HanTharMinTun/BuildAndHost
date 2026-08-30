import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { 
  User, 
  Mail, 
  Lock, 
  ArrowRight, 
  Eye, 
  EyeOff,
  Loader2,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Shield,
  Star
} from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!agreeTerms) {
      setError('Please agree to the Terms of Service');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (!/[A-Z]/.test(password)) {
      setError('Password must contain at least one uppercase letter');
      return;
    }

    if (!/[0-9]/.test(password)) {
      setError('Password must contain at least one number');
      return;
    }

    setLoading(true);

    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const result = await register(email, password, fullName);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error || 'Registration failed');
    }

    setLoading(false);
  };

  const getPasswordStrength = () => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength();
  const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong', 'Excellent'];
  const strengthColors = [
    'bg-red-500',
    'bg-orange-500',
    'bg-yellow-500',
    'bg-green-500',
    'bg-emerald-500'
  ];
  const strengthStars = [1, 2, 3, 4, 5];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0a1a] via-[#1a0a2e] to-[#0a0a1a] p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-10 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl animate-float-slow"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl animate-float-slower"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-3xl animate-pulse-slow"></div>
        
        {/* Floating particles */}
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-1 h-1 bg-purple-400/60 rounded-full animate-particle-delay-${i}`}
            style={{
              top: `${10 + Math.random() * 80}%`,
              left: `${10 + Math.random() * 80}%`,
              animationDuration: `${8 + Math.random() * 4}s`,
              animationDelay: `${Math.random() * 5}s`
            }}
          ></div>
        ))}
      </div>

      {/* Main container with entrance animation */}
      <div className={`w-full max-w-md relative z-10 transition-all duration-1000 transform ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
      }`}>
        {/* Logo/Brand with animation */}
        <div className="text-center mb-8 animate-float">
          <div className="inline-flex items-center justify-center gap-3 group">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-3 rounded-2xl shadow-2xl shadow-purple-500/30 group-hover:shadow-purple-500/50 transition-all duration-500 group-hover:scale-110 group-hover:-rotate-6">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <span className="text-4xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
              BuildAndHost
            </span>
          </div>
          <p className="text-purple-200/60 mt-3 text-sm font-light tracking-wider animate-pulse-subtle">
            Join us and start building amazing things
          </p>
        </div>

        {/* Card with glassmorphism */}
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/10 hover:border-white/20 transition-all duration-500 hover:shadow-purple-500/10 relative">
          {/* Decorative elements */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"></div>
          <div className="absolute -top-3 -right-3 w-12 h-12 bg-purple-500/20 rounded-full blur-xl"></div>
          <div className="absolute -bottom-3 -left-3 w-12 h-12 bg-indigo-500/20 rounded-full blur-xl"></div>

          {/* Error message with slide animation */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3 backdrop-blur-sm animate-slide-down">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5 animate-pulse" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-200">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div className="transform transition-all duration-300 hover:scale-[1.01]">
              <label className="block text-sm font-medium text-purple-200/80 mb-2">
                Full Name
              </label>
              <div className={`relative group transition-all duration-300 ${
                focusedField === 'name' ? 'scale-[1.02]' : ''
              }`}>
                <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-all duration-300 ${
                  focusedField === 'name' ? 'text-purple-400' : 'text-purple-300/50'
                }`}>
                  <User className="h-5 w-5 transition-all duration-300 group-hover:scale-110" />
                </div>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  onFocus={() => setFocusedField('name')}
                  onBlur={() => setFocusedField(null)}
                  required
                  placeholder="John Doe"
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl focus:border-purple-400 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300 outline-none text-white placeholder:text-white/30 hover:border-white/20"
                />
                {fullName && (
                  <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-400 animate-fade-in" />
                )}
              </div>
            </div>

            {/* Email */}
            <div className="transform transition-all duration-300 hover:scale-[1.01]">
              <label className="block text-sm font-medium text-purple-200/80 mb-2">
                Email Address
              </label>
              <div className={`relative group transition-all duration-300 ${
                focusedField === 'email' ? 'scale-[1.02]' : ''
              }`}>
                <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-all duration-300 ${
                  focusedField === 'email' ? 'text-purple-400' : 'text-purple-300/50'
                }`}>
                  <Mail className="h-5 w-5 transition-all duration-300 group-hover:scale-110" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  required
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl focus:border-purple-400 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300 outline-none text-white placeholder:text-white/30 hover:border-white/20"
                />
                {email && (
                  <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-400 animate-fade-in" />
                )}
              </div>
            </div>

            {/* Password */}
            <div className="transform transition-all duration-300 hover:scale-[1.01]">
              <label className="block text-sm font-medium text-purple-200/80 mb-2">
                Password
              </label>
              <div className={`relative group transition-all duration-300 ${
                focusedField === 'password' ? 'scale-[1.02]' : ''
              }`}>
                <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-all duration-300 ${
                  focusedField === 'password' ? 'text-purple-400' : 'text-purple-300/50'
                }`}>
                  <Lock className="h-5 w-5 transition-all duration-300 group-hover:scale-110" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  required
                  placeholder="Create a strong password"
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

              {/* Password strength indicator with animation */}
              {password && (
                <div className="mt-3 space-y-2 animate-slide-down">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1 flex-1">
                      {strengthStars.map((_, i) => (
                        <div
                          key={i}
                          className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                            i < passwordStrength
                              ? strengthColors[passwordStrength - 1]
                              : 'bg-white/10'
                          }`}
                          style={{
                            transitionDelay: `${i * 100}ms`
                          }}
                        />
                      ))}
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className={`w-3 h-3 transition-all duration-300 ${
                        passwordStrength >= 1 ? 'text-yellow-400 fill-yellow-400' : 'text-white/20'
                      }`} />
                      <span className="text-xs text-purple-300/60 font-medium">
                        {strengthLabels[passwordStrength - 1] || 'Weak'}
                      </span>
                    </div>
                  </div>
                  
                  <ul className="grid grid-cols-2 gap-x-4 gap-y-1">
                    {[
                      { text: 'At least 8 characters', check: password.length >= 8 },
                      { text: 'Uppercase & lowercase', check: /[A-Z]/.test(password) && /[a-z]/.test(password) },
                      { text: 'At least one number', check: /[0-9]/.test(password) },
                      { text: 'Special character', check: /[^A-Za-z0-9]/.test(password) }
                    ].map((item, i) => (
                      <li
                        key={i}
                        className={`text-xs transition-all duration-300 flex items-center gap-1 ${
                          item.check ? 'text-green-400' : 'text-purple-300/40'
                        }`}
                        style={{
                          transitionDelay: `${i * 150}ms`
                        }}
                      >
                        {item.check ? (
                          <CheckCircle className="w-3 h-3" />
                        ) : (
                          <div className="w-3 h-3 border border-white/20 rounded-full"></div>
                        )}
                        {item.text}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="transform transition-all duration-300 hover:scale-[1.01]">
              <label className="block text-sm font-medium text-purple-200/80 mb-2">
                Confirm Password
              </label>
              <div className={`relative group transition-all duration-300 ${
                focusedField === 'confirm' ? 'scale-[1.02]' : ''
              }`}>
                <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-all duration-300 ${
                  focusedField === 'confirm' ? 'text-purple-400' : 'text-purple-300/50'
                }`}>
                  <Lock className="h-5 w-5 transition-all duration-300 group-hover:scale-110" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onFocus={() => setFocusedField('confirm')}
                  onBlur={() => setFocusedField(null)}
                  required
                  placeholder="Confirm your password"
                  className={`w-full pl-10 pr-12 py-3 bg-white/5 border rounded-2xl focus:ring-4 transition-all duration-300 outline-none text-white placeholder:text-white/30 hover:border-white/20 ${
                    confirmPassword && password !== confirmPassword
                      ? 'border-red-500/50 focus:border-red-400 focus:ring-red-500/20'
                      : confirmPassword && password === confirmPassword
                      ? 'border-green-500/50 focus:border-green-400 focus:ring-green-500/20'
                      : 'border-white/10 focus:border-purple-400 focus:ring-purple-500/20'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-purple-300/50 hover:text-purple-200 transition-all duration-300 hover:scale-110"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
                {confirmPassword && (
                  <div className="absolute inset-y-0 right-12 flex items-center animate-fade-in">
                    {password === confirmPassword ? (
                      <CheckCircle className="w-5 h-5 text-green-400 animate-bounce" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-400 animate-pulse" />
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Terms with custom checkbox animation */}
            <div className="flex items-start gap-3 pt-2">
              <div className="relative group">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="w-4 h-4 rounded border-white/20 bg-white/5 text-purple-600 focus:ring-purple-500 focus:ring-offset-0 mt-1 cursor-pointer transition-all duration-300"
                />
                <div className={`absolute inset-0 rounded border-2 border-purple-400/0 transition-all duration-300 ${
                  agreeTerms ? 'border-purple-400/50 scale-110' : ''
                }`}></div>
              </div>
              <label className="text-sm text-purple-200/50">
                I agree to the{' '}
                <a href="#" className="text-purple-200 hover:text-white font-medium transition-all duration-300 relative group">
                  <span>Terms of Service</span>
                  <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-purple-400 group-hover:w-full transition-all duration-300"></span>
                </a>
                {' '}and{' '}
                <a href="#" className="text-purple-200 hover:text-white font-medium transition-all duration-300 relative group">
                  <span>Privacy Policy</span>
                  <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-purple-400 group-hover:w-full transition-all duration-300"></span>
                </a>
              </label>
            </div>

            {/* Submit button with animation */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold py-3.5 rounded-2xl shadow-lg hover:shadow-purple-500/30 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin relative z-10" />
                  <span className="relative z-10">Creating account...</span>
                </>
              ) : (
                <>
                  <span className="relative z-10">Create Account</span>
                  <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform duration-300" />
                </>
              )}
            </button>
          </form>

          {/* Login link with animation */}
          <div className="mt-8 text-center">
            <p className="text-purple-200/50">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-purple-200 hover:text-white font-semibold transition-all duration-300 relative group"
              >
                <span className="relative">
                  Sign in
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-400 group-hover:w-full transition-all duration-300"></span>
                </span>
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-purple-300/30 mt-6 animate-fade-in">
          By creating an account, you agree to our Terms of Service and Privacy Policy
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
        
        @keyframes bounce {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
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
        
        .animate-bounce {
          animation: bounce 1s ease-in-out infinite;
        }
        
        .animate-particle-delay-0 {
          animation: float-slow 10s linear infinite 0s;
        }
        .animate-particle-delay-1 {
          animation: float-slow 12s linear infinite 1s;
        }
        .animate-particle-delay-2 {
          animation: float-slow 8s linear infinite 2s;
        }
        .animate-particle-delay-3 {
          animation: float-slow 14s linear infinite 3s;
        }
        .animate-particle-delay-4 {
          animation: float-slow 9s linear infinite 4s;
        }
        .animate-particle-delay-5 {
          animation: float-slow 11s linear infinite 5s;
        }
      `}</style>
    </div>
  );
}