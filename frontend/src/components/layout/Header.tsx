import React from 'react';
import { Link } from 'react-router-dom';
import { useBitbucket } from '../../contexts/BitbucketContext';

const Header: React.FC = () => {
    const { user, isAuthenticated, logout } = useBitbucket();
    return (
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
            <div className="container-custom">
                <div className="flex items-center justify-between h-16">
                    {/* Logo and App Name */}
                    <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-sm">
                            <span className="text-white font-bold text-sm">CG</span>
                        </div>
                        <span className="text-xl font-bold text-gray-900 hidden sm:block">CodeGuardian</span>
                        <span className="text-lg font-bold text-gray-900 sm:hidden">CG</span>
                    </Link>

                    {/* User Actions */}
                    <div className="flex items-center space-x-2 sm:space-x-4">
                        {isAuthenticated && user ? (
                            <>
                                <div className="flex items-center space-x-2 sm:space-x-3">
                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center shadow-sm">
                                        <span className="text-blue-600 font-medium text-sm">
                                            {user.display_name?.charAt(0) || user.username?.charAt(0) || 'U'}
                                        </span>
                                    </div>
                                    <div className="text-sm hidden sm:block">
                                        <div className="font-medium text-gray-900 truncate max-w-32">
                                            {user.display_name || user.username}
                                        </div>
                                        <div className="text-gray-500 text-xs">Bitbucket</div>
                                    </div>
                                </div>
                                <button
                                    onClick={logout}
                                    className="text-gray-500 hover:text-red-600 transition-colors p-2 rounded-lg hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                                    title="Logout"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                </button>
                            </>
                        ) : (
                            <div className="text-sm text-gray-500 px-2">
                                <span className="hidden sm:inline">Not connected</span>
                                <span className="sm:hidden">Offline</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
