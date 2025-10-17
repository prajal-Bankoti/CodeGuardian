import React from 'react';

const AboutPage: React.FC = () => {
    return (
        <div className="container-custom">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold text-gradient mb-8">About This Project</h1>

                <div className="card mb-8">
                    <h2 className="text-2xl font-semibold mb-4">Project Structure</h2>
                    <p className="text-gray-600 mb-4">
                        This React application follows modern best practices with a well-organized folder structure:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-gray-600">
                        <li><strong>components/</strong> - Reusable UI components organized by type</li>
                        <li><strong>pages/</strong> - Page-level components for routing</li>
                        <li><strong>layouts/</strong> - Layout components for consistent page structure</li>
                        <li><strong>hooks/</strong> - Custom React hooks for reusable logic</li>
                        <li><strong>services/</strong> - API service functions</li>
                        <li><strong>store/</strong> - Redux Toolkit store configuration and slices</li>
                        <li><strong>utils/</strong> - Utility functions and helpers</li>
                        <li><strong>types/</strong> - TypeScript type definitions</li>
                        <li><strong>constants/</strong> - Application constants</li>
                    </ul>
                </div>

                <div className="card">
                    <h2 className="text-2xl font-semibold mb-4">Technologies Used</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="bg-primary-50 p-4 rounded-lg">
                            <h3 className="font-semibold text-primary-800">React 18</h3>
                            <p className="text-sm text-primary-600">Latest React with hooks</p>
                        </div>
                        <div className="bg-primary-50 p-4 rounded-lg">
                            <h3 className="font-semibold text-primary-800">TypeScript</h3>
                            <p className="text-sm text-primary-600">Type-safe development</p>
                        </div>
                        <div className="bg-primary-50 p-4 rounded-lg">
                            <h3 className="font-semibold text-primary-800">Redux Toolkit</h3>
                            <p className="text-sm text-primary-600">State management</p>
                        </div>
                        <div className="bg-primary-50 p-4 rounded-lg">
                            <h3 className="font-semibold text-primary-800">Tailwind CSS</h3>
                            <p className="text-sm text-primary-600">Utility-first CSS</p>
                        </div>
                        <div className="bg-primary-50 p-4 rounded-lg">
                            <h3 className="font-semibold text-primary-800">React Router</h3>
                            <p className="text-sm text-primary-600">Client-side routing</p>
                        </div>
                        <div className="bg-primary-50 p-4 rounded-lg">
                            <h3 className="font-semibold text-primary-800">Axios</h3>
                            <p className="text-sm text-primary-600">HTTP client</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AboutPage;
