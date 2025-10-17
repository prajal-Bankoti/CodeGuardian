import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../store/store';
import { setSidebarOpen } from '../../store/slices/uiSlice';

const Sidebar: React.FC = () => {
    const dispatch = useAppDispatch();
    const location = useLocation();
    const { sidebarOpen } = useAppSelector((state) => state.ui);

    const navigation = [
        { name: 'Dashboard', href: '/', icon: '🏠' },
        { name: 'About', href: '/about', icon: 'ℹ️' },
    ];

    const isActive = (path: string) => location.pathname === path;

    return (
        <>
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 md:hidden"
                    onClick={() => dispatch(setSidebarOpen(false))}
                />
            )}

            {/* Sidebar */}
            <div
                className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:inset-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-800">Navigation</h2>
                        <button
                            onClick={() => dispatch(setSidebarOpen(false))}
                            className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                        >
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <nav className="flex-1 px-4 py-4 space-y-2">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${isActive(item.href)
                                        ? 'bg-primary-100 text-primary-700'
                                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                                    }`}
                                onClick={() => dispatch(setSidebarOpen(false))}
                            >
                                <span className="mr-3 text-lg">{item.icon}</span>
                                {item.name}
                            </Link>
                        ))}
                    </nav>

                    <div className="p-4 border-t border-gray-200">
                        <div className="text-xs text-gray-500">
                            React App v1.0.0
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Sidebar;

