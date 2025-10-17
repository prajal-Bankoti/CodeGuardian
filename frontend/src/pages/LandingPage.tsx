import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            {/* Navigation */}
            <nav className="bg-white shadow-sm">
                <div className="container-custom">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-sm">CG</span>
                            </div>
                            <span className="text-xl font-bold text-gray-900">CodeGuardian</span>
                        </div>
                        <div className="hidden md:flex items-center space-x-8">
                            <a href="#features" className="text-gray-700 hover:text-blue-600 transition-colors">Features</a>
                            <a href="#how-it-works" className="text-gray-700 hover:text-blue-600 transition-colors">How it Works</a>
                            <a href="#get-started" className="text-gray-700 hover:text-blue-600 transition-colors">Get Started</a>
                            <Link to="/app/bitbucket-login" className="btn-primary">Get Started Free</Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="py-20">
                <div className="container-custom">
                    <div className="text-center max-w-4xl mx-auto">
                        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                            AI-Powered
                            <span className="text-gradient block">Code Reviews</span>
                        </h1>
                        <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                            Transform your Bitbucket pull request workflow with intelligent code analysis.
                            Get instant feedback, catch bugs early, and improve code quality with our advanced AI-powered review system.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link to="/app/bitbucket-login" className="btn-primary text-lg px-8 py-4 inline-block text-center">
                                Get Started Free
                            </Link>
                            <a href="#how-it-works" className="btn-secondary text-lg px-8 py-4 inline-block text-center">
                                View Documentation
                            </a>
                        </div>
                        <p className="text-sm text-gray-500 mt-4">
                            Completely free • No credit card required
                        </p>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-20 bg-white">
                <div className="container-custom">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            Advanced AI Code Analysis
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Our AI analyzes your entire pull request, understands your codebase context, and provides detailed feedback with severity levels, framework detection, and actionable suggestions.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <div className="card hover:shadow-lg transition-shadow">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold mb-3">Global PR Analysis</h3>
                            <p className="text-gray-600">
                                Complete pull request analysis with severity breakdown (High/Medium/Low), framework detection, and comprehensive code quality assessment.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="card hover:shadow-lg transition-shadow">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold mb-3">Inline Comments & Reports</h3>
                            <p className="text-gray-600">
                                Get detailed inline comments with exact line numbers and downloadable HTML reports for comprehensive code review documentation.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="card hover:shadow-lg transition-shadow">
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold mb-3">Smart Framework Detection</h3>
                            <p className="text-gray-600">
                                Automatically detects your tech stack (React, Node.js, etc.) and provides framework-specific suggestions and best practices.
                            </p>
                        </div>

                        {/* Feature 4 */}
                        <div className="card hover:shadow-lg transition-shadow">
                            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold mb-3">Intelligent File Filtering</h3>
                            <p className="text-gray-600">
                                Automatically filters out non-code files (XML, SVG, images) and focuses analysis on relevant source code for accurate reviews.
                            </p>
                        </div>

                        {/* Feature 5 */}
                        <div className="card hover:shadow-lg transition-shadow">
                            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold mb-3">PR Impact Analysis</h3>
                            <p className="text-gray-600">
                                Get comprehensive PR overviews with impact assessment, risk levels, and key changes summary for better decision making.
                            </p>
                        </div>

                        {/* Feature 6 */}
                        <div className="card hover:shadow-lg transition-shadow">
                            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold mb-3">Structured Suggestions</h3>
                            <p className="text-gray-600">
                                Get categorized suggestions including immediate actions, component extractions, best practices, and testing recommendations.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section id="how-it-works" className="py-20 bg-gray-50">
                <div className="container-custom">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            How CodeGuardian Works
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Simple integration with your existing workflow. Get AI-powered insights in minutes.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Step 1 */}
                        <div className="text-center">
                            <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                                1
                            </div>
                            <h3 className="text-xl font-semibold mb-3">Connect Your Bitbucket</h3>
                            <p className="text-gray-600">
                                Authenticate with your Bitbucket account. CodeGuardian integrates seamlessly with your existing Bitbucket workflow.
                            </p>
                        </div>

                        {/* Step 2 */}
                        <div className="text-center">
                            <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                                2
                            </div>
                            <h3 className="text-xl font-semibold mb-3">AI Analyzes Your PR</h3>
                            <p className="text-gray-600">
                                Our advanced AI analyzes your entire pull request, detects frameworks, filters relevant files, and provides comprehensive feedback.
                            </p>
                        </div>

                        {/* Step 3 */}
                        <div className="text-center">
                            <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                                3
                            </div>
                            <h3 className="text-xl font-semibold mb-3">Get Detailed Reports</h3>
                            <p className="text-gray-600">
                                Receive inline comments with exact line numbers, severity breakdowns, and downloadable HTML reports for comprehensive documentation.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Example Suggestions Section */}
            <section className="py-20 bg-white">
                <div className="container-custom">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            Example AI Suggestions
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            See how CodeGuardian helps improve your code with intelligent, contextual suggestions.
                        </p>
                    </div>

                    <div className="max-w-4xl mx-auto">
                        <div className="bg-gray-900 rounded-lg p-6 text-green-400 font-mono text-sm overflow-x-auto">
                            <div className="mb-4">
                                <span className="text-yellow-400">// CodeGuardian AI Analysis Results:</span>
                            </div>
                            <div className="mb-2">
                                <span className="text-blue-400">📊</span> Framework: React • Language: JavaScript • Score: 85/100
                            </div>
                            <div className="mb-2">
                                <span className="text-red-400">🔴 HIGH:</span> Line 45: Missing error handling in API call
                            </div>
                            <div className="mb-2">
                                <span className="text-yellow-400">🟡 MEDIUM:</span> Line 23: Consider extracting to utility function
                            </div>
                            <div className="mb-2">
                                <span className="text-green-400">🟢 LOW:</span> Line 67: Unused import 'lodash' detected
                            </div>
                            <div className="mb-2">
                                <span className="text-purple-400">💡 SUGGESTION:</span> Move constants to separate file for better organization
                            </div>
                            <div className="mb-2">
                                <span className="text-blue-400">📋 IMPACT:</span> Medium risk • 3 files changed • 45 lines added
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Get Started Section */}
            <section id="get-started" className="py-20 bg-gray-50">
                <div className="container-custom">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            Get Started Today
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Join the community of developers using CodeGuardian to write better code.
                        </p>
                    </div>

                    <div className="max-w-4xl mx-auto">
                        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
                            <div className="text-center mb-8">
                                <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                                <h3 className="text-3xl font-bold text-gray-900 mb-4">Completely Free</h3>
                                <p className="text-lg text-gray-600 mb-8">
                                    No hidden costs, no credit card required. Start improving your code quality today.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                <div className="space-y-4">
                                    <h4 className="text-xl font-semibold text-gray-900 mb-4">What You Get:</h4>
                                    <ul className="space-y-3">
                                        <li className="flex items-center">
                                            <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                            Global PR analysis with severity breakdown
                                        </li>
                                        <li className="flex items-center">
                                            <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                            Inline comments with exact line numbers
                                        </li>
                                        <li className="flex items-center">
                                            <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                            Downloadable HTML reports
                                        </li>
                                        <li className="flex items-center">
                                            <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                            Framework detection & smart filtering
                                        </li>
                                    </ul>
                                </div>
                                <div className="space-y-4">
                                    <h4 className="text-xl font-semibold text-gray-900 mb-4">Quick Setup:</h4>
                                    <ul className="space-y-3">
                                        <li className="flex items-center">
                                            <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">1</div>
                                            Connect your Bitbucket account
                                        </li>
                                        <li className="flex items-center">
                                            <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">2</div>
                                            Select your repository and PR
                                        </li>
                                        <li className="flex items-center">
                                            <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">3</div>
                                            Get instant AI-powered code reviews
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            <div className="text-center">
                                <Link to="/app/bitbucket-login" className="btn-primary text-lg px-8 py-4 inline-block">
                                    Get Started Free
                                </Link>
                                <p className="text-sm text-gray-500 mt-4">
                                    Takes less than 2 minutes to set up
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
                <div className="container-custom">
                    <div className="text-center text-white">
                        <h2 className="text-4xl font-bold mb-4">
                            Ready to Transform Your Code Reviews?
                        </h2>
                        <p className="text-xl mb-8 opacity-90">
                            Join the community of developers using CodeGuardian to write better, more secure code.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link to="/app/bitbucket-login" className="bg-white text-blue-600 hover:bg-gray-100 font-medium py-3 px-8 rounded-lg transition-colors duration-200 inline-block text-center">
                                Get Started Free
                            </Link>
                            <a href="#how-it-works" className="border-2 border-white text-white hover:bg-white hover:text-blue-600 font-medium py-3 px-8 rounded-lg transition-colors duration-200 inline-block text-center">
                                View Documentation
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12">
                <div className="container-custom">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div>
                            <div className="flex items-center space-x-2 mb-4">
                                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                                    <span className="text-white font-bold text-sm">CG</span>
                                </div>
                                <span className="text-xl font-bold">CodeGuardian</span>
                            </div>
                            <p className="text-gray-400">
                                Advanced AI-powered code review system for Bitbucket that provides comprehensive analysis, inline comments, and detailed reports.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-4">Product</h3>
                            <ul className="space-y-2 text-gray-400">
                                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                                <li><a href="#get-started" className="hover:text-white transition-colors">Get Started</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-4">Company</h3>
                            <ul className="space-y-2 text-gray-400">
                                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-4">Support</h3>
                            <ul className="space-y-2 text-gray-400">
                                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Community</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
                        <p>&copy; 2024 CodeGuardian. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
