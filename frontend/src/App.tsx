import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { signIn } from './lib/auth-service';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import SignupPage from './components/SignupPage';

function App() {
    console.log(import.meta.env);
    return (
        <AuthProvider>
            <Router>
                <AppContent />
            </Router>
        </AuthProvider>
    );
}

function AppContent() {
    const { currentUser, isAdmin, loading, signOut } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <Link to="/" className="text-xl font-bold text-gray-900">
                                🚀 AI-Powered ATS
                            </Link>
                        </div>
                        <nav className="flex space-x-4 items-center">
                            {currentUser ? (
                                // Logged in navigation
                                <>
                                    <Link to="/dashboard" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                                        Dashboard
                                    </Link>
                                    {isAdmin && (
                                        <>
                                            <Link to="/jobs" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                                                Jobs
                                            </Link>
                                            <Link to="/candidates" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                                                Candidates
                                            </Link>
                                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                                                Admin
                                            </span>
                                        </>
                                    )}
                                    <span className="text-gray-600 text-sm">
                                        {currentUser.email}
                                    </span>
                                    <button
                                        onClick={signOut}
                                        className="bg-red-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-red-700"
                                    >
                                        Sign Out
                                    </button>
                                </>
                            ) : (
                                // Not logged in navigation
                                <Link to="/login" className="bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
                                    Login
                                </Link>
                            )}
                        </nav>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/jobs" element={<JobsPage />} />
                    <Route path="/candidates" element={<CandidatesPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<SignupPage />} />
                </Routes>
            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-200 mt-16">
                <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <p className="text-sm text-gray-500 mb-2">
                            © 2024 AI-Powered ATS. Built with React, Firebase & OpenAI.
                        </p>
                        <p className="text-xs text-gray-400">
                            Revolutionizing recruitment through artificial intelligence
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

// Placeholder components
function HomePage() {
    return (
        <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Welcome to AI-Powered ATS
            </h2>
            <p className="text-lg text-gray-600 mb-8">
                Streamline your hiring process with intelligent candidate matching
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card">
                    <h3 className="text-lg font-semibold mb-2">🎯 Smart Matching</h3>
                    <p className="text-gray-600">AI-powered candidate-job matching based on skills and requirements</p>
                </div>
                <div className="card">
                    <h3 className="text-lg font-semibold mb-2">📊 Analytics</h3>
                    <p className="text-gray-600">Track hiring metrics and optimize your recruitment process</p>
                </div>
                <div className="card">
                    <h3 className="text-lg font-semibold mb-2">🔄 Automation</h3>
                    <p className="text-gray-600">Automate repetitive tasks and focus on what matters most</p>
                </div>
            </div>
        </div>
    );
}

function DashboardPage() {
    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h2>
            <div className="card">
                <p className="text-gray-600">Dashboard content coming soon...</p>
            </div>
        </div>
    );
}

function JobsPage() {
    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Job Openings</h2>
            <div className="card">
                <p className="text-gray-600">Job management features coming soon...</p>
            </div>
        </div>
    );
}

function CandidatesPage() {
    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Candidates</h2>
            <div className="card">
                <p className="text-gray-600">Candidate management features coming soon...</p>
            </div>
        </div>
    );
}

function LoginPage() {
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [error, setError] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const userCredential = await signIn(email, password);
            console.log('Logged in successfully:', userCredential.user);

            // 🎉 Navigate to dashboard after successful login
            navigate('/dashboard');
        } catch (error) {
            console.error('Login error:', error);
            setError('Failed to login. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto">
            <div className="bg-white p-8 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">Login</h2>
                {error && (
                    <div className="bg-red-50 text-red-500 p-3 rounded-md mb-4">
                        {error}
                    </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter your email"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter your password"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                        disabled={loading}
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <div className="mt-4 text-center">
                    <p className="text-sm text-gray-600">
                        Don't have an account?{' '}
                        <Link to="/signup" className="text-blue-600 hover:text-blue-500">
                            Create one
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default App; 