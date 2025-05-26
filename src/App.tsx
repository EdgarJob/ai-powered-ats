import React from 'react';
import { FC } from 'react';

const App: FC = () => {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <h1 className="text-xl font-bold text-gray-900">
                                🚀 AI-Powered ATS
                            </h1>
                        </div>
                        <nav className="flex space-x-4">
                            <a href="#" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">Dashboard</a>
                            <a href="#" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">Jobs</a>
                            <a href="#" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">Candidates</a>
                            <a href="#" className="bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700">Login</a>
                        </nav>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                {/* Hero Section */}
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">
                        Welcome to AI-Powered ATS
                    </h2>
                    <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                        Streamline your hiring process with intelligent candidate matching,
                        automated screening, and data-driven insights
                    </p>
                    <button className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-blue-700 transition-colors shadow-lg">
                        Get Started Today
                    </button>
                </div>

                {/* Feature Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                    <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                        <div className="text-4xl mb-6">🎯</div>
                        <h3 className="text-xl font-semibold mb-4 text-gray-900">Smart Matching</h3>
                        <p className="text-gray-600 leading-relaxed">
                            AI-powered candidate-job matching based on skills, experience, and cultural fit.
                            Find the perfect candidates faster than ever.
                        </p>
                    </div>

                    <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                        <div className="text-4xl mb-6">📊</div>
                        <h3 className="text-xl font-semibold mb-4 text-gray-900">Analytics Dashboard</h3>
                        <p className="text-gray-600 leading-relaxed">
                            Track hiring metrics, analyze recruitment performance, and optimize
                            your process with comprehensive data insights.
                        </p>
                    </div>

                    <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                        <div className="text-4xl mb-6">🔄</div>
                        <h3 className="text-xl font-semibold mb-4 text-gray-900">Automation</h3>
                        <p className="text-gray-600 leading-relaxed">
                            Automate repetitive tasks like resume screening, interview scheduling,
                            and candidate communication to focus on what matters most.
                        </p>
                    </div>
                </div>

                {/* Stats Section */}
                <div className="bg-blue-600 rounded-2xl p-8 text-white mb-16">
                    <div className="text-center mb-8">
                        <h3 className="text-2xl font-bold mb-2">Trusted by Leading Companies</h3>
                        <p className="text-blue-100">Join thousands of HR professionals who use our platform</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
                        <div>
                            <div className="text-3xl font-bold mb-2">10,000+</div>
                            <div className="text-blue-100">Active Users</div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold mb-2">50,000+</div>
                            <div className="text-blue-100">Candidates Matched</div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold mb-2">95%</div>
                            <div className="text-blue-100">Success Rate</div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold mb-2">24/7</div>
                            <div className="text-blue-100">Support</div>
                        </div>
                    </div>
                </div>

                {/* CTA Section */}
                <div className="text-center bg-gray-100 rounded-2xl p-12">
                    <h3 className="text-3xl font-bold text-gray-900 mb-4">
                        Ready to Transform Your Hiring?
                    </h3>
                    <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                        Start your free trial today and experience the power of AI-driven recruitment
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-blue-700 transition-colors">
                            Start Free Trial
                        </button>
                        <button className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg text-lg font-medium hover:bg-gray-50 transition-colors">
                            Schedule Demo
                        </button>
                    </div>
                </div>
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
    return (
        <div className="max-w-md mx-auto">
            <div className="card">
                <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">Login</h2>
                <form className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            className="input-field"
                            placeholder="Enter your email"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Password
                        </label>
                        <input
                            type="password"
                            className="input-field"
                            placeholder="Enter your password"
                        />
                    </div>
                    <button type="submit" className="btn-primary w-full">
                        Sign In
                    </button>
                </form>
            </div>
        </div>
    );
}

export default App; 