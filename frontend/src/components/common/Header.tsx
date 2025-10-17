import React from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../store/store';
import { toggleSidebar } from '../../store/slices/uiSlice';

const Header: React.FC = () => {
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state) => state.auth);

    return (
        <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="container-custom">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => dispatch(toggleSidebar())}
                            className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                        <Link to="/" className="text-xl font-bold text-primary-600">
                            React App
                        </Link>
                    </div>

                    <nav className="hidden md:flex items-center space-x-8">
                        <Link to="/" className="text-gray-700 hover:text-primary-600 transition-colors">
                            Home
                        </Link>
                        <Link to="/about" className="text-gray-700 hover:text-primary-600 transition-colors">
                            About
                        </Link>
                    </nav>

                    <div className="flex items-center space-x-4">
                        {user ? (
                            <div className="flex items-center space-x-3">
                                <span className="text-sm text-gray-700">Welcome, {user.name}</span>
                                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                                    <span className="text-sm font-medium text-primary-600">
                                        {user.name.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-2">
                                <Link
                                    to="/login"
                                    className="text-gray-700 hover:text-primary-600 transition-colors"
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    className="btn-primary"
                                >
                                    Sign Up
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;

