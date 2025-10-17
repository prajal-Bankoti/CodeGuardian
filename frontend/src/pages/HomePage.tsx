import React from 'react';

const HomePage: React.FC = () => {
    return (
        <div className="container-custom">
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-gradient mb-4">
                    Welcome to React App
                </h1>
                <p className="text-lg text-gray-600">
                    A modern React application with TypeScript, Redux Toolkit, and Tailwind CSS.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="card">
                    <h3 className="text-xl font-semibold mb-3">🚀 Modern Stack</h3>
                    <p className="text-gray-600">
                        Built with React 18, TypeScript, Redux Toolkit, and Tailwind CSS for a modern development experience.
                    </p>
                </div>

                <div className="card">
                    <h3 className="text-xl font-semibold mb-3">📱 Responsive Design</h3>
                    <p className="text-gray-600">
                        Fully responsive design that works perfectly on desktop, tablet, and mobile devices.
                    </p>
                </div>

                <div className="card">
                    <h3 className="text-xl font-semibold mb-3">⚡ Performance</h3>
                    <p className="text-gray-600">
                        Optimized for performance with code splitting, lazy loading, and efficient state management.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default HomePage;
