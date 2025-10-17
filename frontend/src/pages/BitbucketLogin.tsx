import React from 'react';
import { Link } from 'react-router-dom';
import BitbucketConnection from '../components/bitbucket/BitbucketConnection';

const BitbucketLogin: React.FC = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="container-custom py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <Link to="/" className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-sm">CG</span>
                            </div>
                            <span className="text-xl font-bold text-gray-900">CodeGuardian</span>
                        </Link>
                        <Link
                            to="/app/dashboard"
                            className="text-gray-600 hover:text-blue-600 transition-colors"
                        >
                            ← Back to Dashboard
                        </Link>
                    </div>
                </div>

                {/* Main Content */}
                <div className="max-w-2xl mx-auto">
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">
                            Connect to Bitbucket
                        </h1>
                        <p className="text-xl text-gray-600 mb-2">
                            Link your Bitbucket account to start reviewing pull requests with AI
                        </p>
                        <p className="text-gray-500">
                            We'll help you analyze your code, suggest improvements, and catch potential issues
                        </p>
                    </div>

                    {/* Connection Card */}
                    <div className="mb-8">
                        <BitbucketConnection />
                    </div>

                    {/* Features */}
                    <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
                            What you'll get with CodeGuardian
                        </h2>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="flex items-start space-x-4">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-2">AI-Powered Reviews</h3>
                                    <p className="text-gray-600 text-sm">
                                        Get intelligent suggestions for code improvements, security issues, and best practices.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-4">
                                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-2">Fast Analysis</h3>
                                    <p className="text-gray-600 text-sm">
                                        Review multiple pull requests simultaneously with instant AI feedback.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-4">
                                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-2">Quality Assurance</h3>
                                    <p className="text-gray-600 text-sm">
                                        Catch bugs, security vulnerabilities, and code quality issues before they reach production.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-4">
                                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-2">Customizable Rules</h3>
                                    <p className="text-gray-600 text-sm">
                                        Configure AI to focus on specific coding standards and team preferences.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Security Note */}
                    <div className="mt-8 text-center">
                        <div className="inline-flex items-center space-x-2 text-sm text-gray-500">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            <span>Your data is secure and we only access what's necessary for code review</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BitbucketLogin;
