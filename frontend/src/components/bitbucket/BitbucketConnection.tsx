import React from 'react';
import Button from '../common/Button';
import { useBitbucket } from '../../contexts/BitbucketContext';
import { bitbucketService } from '../../services/bitbucketService';

const BitbucketConnection: React.FC = () => {
    const { isAuthenticated, user, loading, error, login, logout } = useBitbucket();

    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
                    <span className="text-gray-600">Connecting to Bitbucket...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                <div className="flex items-center">
                    <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-red-800 font-medium">Connection Error</span>
                </div>
                <p className="text-red-700 mt-2">{error}</p>
                <Button
                    variant="secondary"
                    onClick={login}
                    className="mt-4"
                >
                    Try Again
                </Button>
            </div>
        );
    }

    if (isAuthenticated && user) {
        return (
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-lg">
                                {user.display_name.charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                                Connected to Bitbucket
                            </h3>
                            <p className="text-gray-600">
                                Logged in as <span className="font-medium">{user.display_name}</span>
                            </p>
                            <p className="text-sm text-gray-500">
                                @{user.username}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <div className="flex items-center text-green-600">
                            <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                            <span className="text-sm font-medium">Connected</span>
                        </div>
                        <Button
                            variant="secondary"
                            onClick={logout}
                            size="sm"
                        >
                            Disconnect
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // Check if OAuth is configured
    if (!bitbucketService.isOAuthConfigured()) {
        return (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                <div className="text-center">
                    <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-yellow-800 mb-2">
                        OAuth Setup Required
                    </h3>
                    <p className="text-yellow-700 mb-6">
                        To connect with Bitbucket, you need to set up OAuth credentials first.
                    </p>
                    <div className="bg-white rounded-lg p-4 mb-6 text-left">
                        <h4 className="font-semibold text-gray-900 mb-3">Setup Instructions:</h4>
                        <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                            <li>Go to <a href="https://bitbucket.org/account/settings/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Bitbucket Settings</a></li>
                            <li>Navigate to "OAuth consumers" in the left sidebar</li>
                            <li>Click "Add consumer"</li>
                            <li>Fill in the details:
                                <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                                    <li><strong>Name:</strong> CodeGuardian</li>
                                    <li><strong>Callback URL:</strong> <code className="bg-gray-100 px-1 rounded">http://localhost:3000/app/bitbucket-login</code></li>
                                    <li><strong>Scopes:</strong> Repositories (read), Pull requests (read), Account (read)</li>
                                </ul>
                            </li>
                            <li>Create a <code className="bg-gray-100 px-1 rounded">.env.local</code> file in the frontend directory</li>
                            <li>Add your credentials:
                                <pre className="bg-gray-100 p-2 rounded mt-2 text-xs overflow-x-auto">
                                    {`REACT_APP_BITBUCKET_CLIENT_ID=your-key-here
REACT_APP_BITBUCKET_CLIENT_SECRET=your-secret-here
REACT_APP_BITBUCKET_REDIRECT_URI=http://localhost:3000/app/bitbucket-login`}
                                </pre>
                            </li>
                            <li>Restart the development server</li>
                        </ol>
                    </div>
                    <p className="text-xs text-yellow-600">
                        See <code className="bg-yellow-100 px-1 rounded">BITBUCKET_SETUP.md</code> for detailed instructions.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <div className="text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M.778 1.213a.768.768 0 00-.768.892l3.263 19.81c.084.5.515.868 1.022.873H19.95a.772.772 0 00.77-.646l3.27-20.03a.768.768 0 00-.768-.891L.778 1.213zM14.52 15.53H9.522L8.17 8.466h7.561l-1.211 7.064zm-9.768-9.54l.98-5.68h.98l-.98 5.68h-.98zm2.38 0l.98-5.68h.98l-.98 5.68h-.98zm2.38 0l.98-5.68h.98l-.98 5.68h-.98zm2.38 0l.98-5.68h.98l-.98 5.68h-.98z" />
                    </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Connect to Bitbucket
                </h3>
                <p className="text-gray-600 mb-6">
                    Connect your Bitbucket account to fetch and review your pull requests with AI assistance.
                </p>
                <Button
                    variant="primary"
                    onClick={login}
                    className="w-full sm:w-auto"
                >
                    <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M.778 1.213a.768.768 0 00-.768.892l3.263 19.81c.084.5.515.868 1.022.873H19.95a.772.772 0 00.77-.646l3.27-20.03a.768.768 0 00-.768-.891L.778 1.213zM14.52 15.53H9.522L8.17 8.466h7.561l-1.211 7.064zm-9.768-9.54l.98-5.68h.98l-.98 5.68h-.98zm2.38 0l.98-5.68h.98l-.98 5.68h-.98zm2.38 0l.98-5.68h.98l-.98 5.68h-.98zm2.38 0l.98-5.68h.98l-.98 5.68h-.98z" />
                    </svg>
                    <span>Connect with Bitbucket</span>
                </Button>
                <p className="text-xs text-gray-500 mt-4">
                    We'll only access your repositories and pull requests for review purposes.
                </p>
            </div>
        </div>
    );
};

export default BitbucketConnection;
