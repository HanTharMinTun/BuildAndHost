import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';

interface AppNavbarProps {
    currentPage?: string;
}

export default function AppNavbar({ currentPage }: AppNavbarProps) {
    const navigate = useNavigate();
    const { user, isAuthenticated, logout } = useAuth();

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'AI Chat', path: '/chat' },
        { name: 'Editor', path: '/editor' },
        { name: 'Websites', path: '/websites' },
        { name: 'Deploy', path: '/deploy' },
    ];

    return (
        <nav className="relative z-10 bg-white/10 backdrop-blur-md border-b border-white/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-lg">
                            AI
                        </div>
                        <span className="text-xl font-bold text-white hidden sm:inline">BuildAndHost</span>
                    </Link>

                    {/* Navigation Links - Hidden on mobile, shown on larger screens */}
                    <div className="hidden md:flex items-center gap-6">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`text-sm font-medium transition-colors ${
                                    currentPage === link.path
                                        ? 'text-white'
                                        : 'text-white/70 hover:text-white'
                                }`}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    {/* Auth Section */}
                    <div className="flex items-center gap-4">
                        {isAuthenticated && user ? (
                            <>
                                <span className="text-white/80 text-sm hidden sm:inline">
                                    <span className="font-semibold text-white">{user.username}</span>
                                </span>
                                <button
                                    onClick={() => {
                                        logout();
                                        navigate('/login');
                                    }}
                                    className="px-4 py-2 bg-white/20 backdrop-blur border border-white/30 rounded-lg text-white text-sm font-medium hover:bg-white/30 transition-all"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="px-4 py-2 text-white text-sm font-medium hover:text-white/80 transition-colors"
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                                >
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>
                </div>

                {/* Mobile Navigation Menu */}
                <div className="md:hidden pb-4">
                    <div className="flex flex-wrap gap-3">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                    currentPage === link.path
                                        ? 'bg-white/20 text-white'
                                        : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                                }`}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </nav>
    );
}
