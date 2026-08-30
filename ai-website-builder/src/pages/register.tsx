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
  const [username, setUsername] = useState('');
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
    
    const result = await register({
      email,
      username,
      password,
      full_name: fullName,
    });

    if (result.success) {
      navigate('/');
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
    'bg-amber-500',
    'bg-green-500',
    'bg-emerald-500'
  ];
  const strengthStars = [1, 2, 3, 4, 5];

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{
        fontFamily: "'Playfair Display', 'Cormorant Garamond', 'Georgia', serif",
        background: 'radial-gradient(circle at 50% -10%, #31205f 0%, #15142d 28%, #090b18 65%, #05060d 100%)',
      }}
    >
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

        /* Button Styles from Login.tsx */
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

        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>

      {/* Background - From Login.tsx */}
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

      {/* Main Container */}
      <div className={`w-full max-w-md relative z-10 transition-all duration-1000 transform ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
      }`}>
        {/* Logo/Brand */}
        <div className="text-center mb-8 animate-float">
          <div className="inline-flex items-center justify-center gap-3 group">
            <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 p-3 rounded-2xl shadow-2xl shadow-purple-500/20 group-hover:shadow-cyan-400/30 transition-all duration-500 group-hover:scale-110 group-hover:-rotate-6">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <span className="text-4xl font-luxury font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
              BuildAndHost
            </span>
          </div>
          <p className="font-serif-light text-purple-200/50 mt-3 text-sm tracking-wider animate-pulse-soft">
            Join us and start building amazing things
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/10 hover:border-cyan-400/20 transition-all duration-500 hover:shadow-cyan-400/5 relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 rounded-full"></div>
          <div className="absolute -top-3 -right-3 w-12 h-12 bg-cyan-400/20 rounded-full blur-xl"></div>
          <div className="absolute -bottom-3 -left-3 w-12 h-12 bg-purple-400/20 rounded-full blur-xl"></div>

          {/* Error message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3 backdrop-blur-sm animate-slide-down">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5 animate-pulse" />
              <div className="flex-1">
                <p className="text-sm font-serif-light text-red-200">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div className="transform transition-all duration-300 hover:scale-[1.01]">
              <label className="block text-sm font-serif-light text-purple-200/70 mb-2 tracking-wide">
                Full Name
              </label>
              <div className={`relative group transition-all duration-300 ${
                focusedField === 'name' ? 'scale-[1.02]' : ''
              }`}>
                <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-all duration-300 ${
                  focusedField === 'name' ? 'text-cyan-400' : 'text-purple-300/30'
                }`}>
                  <User className="h-5 w-5 transition-all duration-300 group-hover:scale-110" />
                </div>
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  onFocus={() => setFocusedField('name')}
                  onBlur={() => setFocusedField(null)}
                  required
                  placeholder="John Doe"
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/20 transition-all duration-300 outline-none text-white placeholder:text-white/20 font-serif-light tracking-wide hover:border-white/20"
                />
                {fullName && (
                  <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-400 animate-fade-in" />
                )}
              </div>
            </div>

            {/* Username */}
            <div className="transform transition-all duration-300 hover:scale-[1.01]">
              <label className="block text-sm font-serif-light text-amber-200/70 mb-2 tracking-wide">
                Username
              </label>
              <div className={`relative group transition-all duration-300 ${
                focusedField === 'username' ? 'scale-[1.02]' : ''
              }`}>
                <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-all duration-300 ${
                  focusedField === 'username' ? 'text-amber-400' : 'text-amber-300/30'
                }`}>
                  <User className="h-5 w-5 transition-all duration-300 group-hover:scale-110" />
                </div>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onFocus={() => setFocusedField('username')}
                  onBlur={() => setFocusedField(null)}
                  required
                  placeholder="johndoe"
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl focus:border-amber-400 focus:ring-4 focus:ring-amber-400/20 transition-all duration-300 outline-none text-white placeholder:text-white/20 font-serif-light tracking-wide hover:border-white/20"
                />
                {username && (
                  <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-400 animate-fade-in" />
                )}
              </div>
            </div>

            {/* Email */}
            <div className="transform transition-all duration-300 hover:scale-[1.01]">
              <label className="block text-sm font-serif-light text-purple-200/70 mb-2 tracking-wide">
                Email Address
              </label>
              <div className={`relative group transition-all duration-300 ${
                focusedField === 'email' ? 'scale-[1.02]' : ''
              }`}>
                <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-all duration-300 ${
                  focusedField === 'email' ? 'text-cyan-400' : 'text-purple-300/30'
                }`}>
                  <Mail className="h-5 w-5 transition-all duration-300 group-hover:scale-110" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  required
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/20 transition-all duration-300 outline-none text-white placeholder:text-white/20 font-serif-light tracking-wide hover:border-white/20"
                />
                {email && (
                  <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-400 animate-fade-in" />
                )}
              </div>
            </div>

            {/* Password */}
            <div className="transform transition-all duration-300 hover:scale-[1.01]">
              <label className="block text-sm font-serif-light text-purple-200/70 mb-2 tracking-wide">
                Password
              </label>
              <div className={`relative group transition-all duration-300 ${
                focusedField === 'password' ? 'scale-[1.02]' : ''
              }`}>
                <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-all duration-300 ${
                  focusedField === 'password' ? 'text-cyan-400' : 'text-purple-300/30'
                }`}>
                  <Lock className="h-5 w-5 transition-all duration-300 group-hover:scale-110" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  required
                  placeholder="Create a strong password"
                  className="w-full pl-10 pr-12 py-3 bg-white/5 border border-white/10 rounded-2xl focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/20 transition-all duration-300 outline-none text-white placeholder:text-white/20 font-serif-light tracking-wide hover:border-white/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-purple-300/30 hover:text-purple-200 transition-all duration-300 hover:scale-110"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>

              {/* Password strength indicator */}
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
                        passwordStrength >= 1 ? 'text-cyan-400 fill-cyan-400' : 'text-white/20'
                      }`} />
                      <span className="text-xs font-serif-light text-purple-300/50 font-medium">
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
                        className={`text-[10px] font-serif-light transition-all duration-300 flex items-center gap-1 ${
                          item.check ? 'text-emerald-400' : 'text-purple-300/30'
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
              <label className="block text-sm font-serif-light text-purple-200/70 mb-2 tracking-wide">
                Confirm Password
              </label>
              <div className={`relative group transition-all duration-300 ${
                focusedField === 'confirm' ? 'scale-[1.02]' : ''
              }`}>
                <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-all duration-300 ${
                  focusedField === 'confirm' ? 'text-cyan-400' : 'text-purple-300/30'
                }`}>
                  <Lock className="h-5 w-5 transition-all duration-300 group-hover:scale-110" />
                </div>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onFocus={() => setFocusedField('confirm')}
                  onBlur={() => setFocusedField(null)}
                  required
                  placeholder="Confirm your password"
                  className={`w-full pl-10 pr-12 py-3 bg-white/5 border rounded-2xl focus:ring-4 transition-all duration-300 outline-none text-white placeholder:text-white/20 font-serif-light tracking-wide hover:border-white/20 ${
                    confirmPassword && password !== confirmPassword
                      ? 'border-red-500/50 focus:border-red-400 focus:ring-red-500/20'
                      : confirmPassword && password === confirmPassword
                      ? 'border-emerald-500/50 focus:border-emerald-400 focus:ring-emerald-500/20'
                      : 'border-white/10 focus:border-cyan-400 focus:ring-cyan-400/20'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-purple-300/30 hover:text-purple-200 transition-all duration-300 hover:scale-110"
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
                      <CheckCircle className="w-5 h-5 text-emerald-400 animate-bounce" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-400 animate-pulse" />
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Terms */}
            <div className="flex items-start gap-3 pt-2">
              <div className="relative group">
                <input
                  id="termsCheckbox"
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="w-4 h-4 rounded border-white/20 bg-white/5 text-cyan-400 focus:ring-cyan-400 focus:ring-offset-0 mt-1 cursor-pointer transition-all duration-300"
                />
                <div className={`absolute inset-0 rounded border-2 border-cyan-400/0 transition-all duration-300 ${
                  agreeTerms ? 'border-cyan-400/50 scale-110' : ''
                }`}></div>
              </div>
              <label 
                htmlFor="termsCheckbox"
                className="text-sm font-serif-light text-purple-200/40 tracking-wide cursor-pointer hover:text-purple-200/70 transition-colors duration-300"
              >
                I agree to the{' '}
                <a 
                  href="#" 
                  className="text-purple-200 hover:text-white transition-all duration-300 relative group"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span>Terms of Service</span>
                  <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-cyan-400 group-hover:w-full transition-all duration-300"></span>
                </a>
                {' '}and{' '}
                <a 
                  href="#" 
                  className="text-purple-200 hover:text-white transition-all duration-300 relative group"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span>Privacy Policy</span>
                  <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-cyan-400 group-hover:w-full transition-all duration-300"></span>
                </a>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary text-white font-body font-semibold py-3.5 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group relative overflow-hidden tracking-wide"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              
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

          {/* Login link */}
          <div className="mt-8 text-center">
            <p className="font-serif-light text-purple-200/40 tracking-wide">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-purple-200 hover:text-white font-semibold transition-all duration-300 relative group"
              >
                <span className="relative">
                  Sign in
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-cyan-400 group-hover:w-full transition-all duration-300"></span>
                </span>
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-[10px] font-serif-light text-purple-300/20 mt-6 tracking-wider">
          By creating an account, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}