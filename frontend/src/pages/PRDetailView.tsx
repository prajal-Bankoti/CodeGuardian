import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { apiService } from '../services/apiService';
import { BitbucketPullRequest } from '../services/bitbucketService';
import Button from '../components/common/Button';
import Accordion from '../components/common/Accordion';
import FileChanges from '../components/pr/FileChanges';

const PRDetailView: React.FC = () => {
    const { repository, prId } = useParams<{ repository: string; prId: string }>();
    const navigate = useNavigate();
    const [prDetails, setPrDetails] = useState<BitbucketPullRequest | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPRDetails = async () => {
            if (!repository || !prId) {
                setError('Invalid PR parameters');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);
                const response = await apiService.getPullRequestDetails(repository, prId);

                if (response.success && response.data) {
                    setPrDetails(response.data);
                } else {
                    setError(response.message || 'Failed to fetch PR details');
                }
            } catch (err) {
                setError('Failed to fetch PR details');
                console.error('Error fetching PR details:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchPRDetails();
    }, [repository, prId]);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString();
    };

    const getStatusColor = (state: string) => {
        switch (state.toLowerCase()) {
            case 'open':
                return 'bg-green-100 text-green-800';
            case 'merged':
                return 'bg-purple-100 text-purple-800';
            case 'declined':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="container-custom py-8">
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !prDetails) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="container-custom py-8">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Error Loading PR</h2>
                        <p className="text-gray-600 mb-6">{error}</p>
                        <Button variant="primary" onClick={() => navigate('/app/dashboard')}>
                            Back to Dashboard
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="container-custom py-8">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <Link to="/app/dashboard" className="text-blue-600 hover:underline">
                                ← Back to Dashboard
                            </Link>
                        </div>
                        <div className="flex items-center space-x-4">
                            <a
                                href={prDetails.links.html.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                            >
                                View on Bitbucket
                            </a>
                        </div>
                    </div>
                </div>

                {/* PR Header */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-200">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(prDetails.state)}`}>
                                    {prDetails.state}
                                </span>
                                {prDetails.draft && (
                                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                                        Draft
                                    </span>
                                )}
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">{prDetails.title}</h1>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                                <span>#{prDetails.id}</span>
                                <span>•</span>
                                <span>Created by {prDetails.author.display_name}</span>
                                <span>•</span>
                                <span>{formatDate(prDetails.created_on)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Branch Information */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <h3 className="text-sm font-medium text-gray-700 mb-2">Source Branch</h3>
                                <div className="flex items-center space-x-2">
                                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded">
                                        {prDetails.source.branch.name}
                                    </span>
                                    <span className="text-sm text-gray-600">
                                        {prDetails.source.repository.name}
                                    </span>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-700 mb-2">Target Branch</h3>
                                <div className="flex items-center space-x-2">
                                    <span className="px-2 py-1 bg-green-100 text-green-800 text-sm rounded">
                                        {prDetails.destination.branch.name}
                                    </span>
                                    <span className="text-sm text-gray-600">
                                        {prDetails.destination.repository.name}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Description - Now as Accordion */}
                        {prDetails.description && (
                            <Accordion
                                title="Description"
                                defaultOpen={false}
                                className="shadow-lg"
                            >
                                <div className="prose max-w-none">
                                    <div
                                        className="text-gray-700 whitespace-pre-wrap"
                                        dangerouslySetInnerHTML={{ __html: prDetails.summary.html }}
                                    />
                                </div>
                            </Accordion>
                        )}

                        {/* File Changes */}
                        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">File Changes</h2>
                            <FileChanges
                                repository={repository || ''}
                                prId={prId || ''}
                                accessToken=""
                            />
                        </div>

                        {/* Commits */}
                        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Commits</h2>
                            <div className="space-y-3">
                                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                        <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-sm font-medium text-gray-900">
                                            {prDetails.source.commit.hash.substring(0, 12)}
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            Latest commit from source branch
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Author */}
                        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Author</h3>
                            <div className="flex items-center space-x-3">
                                <img
                                    src={prDetails.author.links.avatar.href}
                                    alt={prDetails.author.display_name}
                                    className="w-12 h-12 rounded-full"
                                />
                                <div>
                                    <div className="font-medium text-gray-900">{prDetails.author.display_name}</div>
                                    <div className="text-sm text-gray-600">{prDetails.author.nickname}</div>
                                </div>
                            </div>
                        </div>

                        {/* PR Stats */}
                        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Pull Request Stats</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Comments</span>
                                    <span className="font-medium">{prDetails.comment_count}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Tasks</span>
                                    <span className="font-medium">{prDetails.task_count}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Created</span>
                                    <span className="font-medium">{formatDate(prDetails.created_on)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Updated</span>
                                    <span className="font-medium">{formatDate(prDetails.updated_on)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
                            <div className="space-y-3">
                                <a
                                    href={prDetails.links.diff.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block w-full text-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    View Diff
                                </a>
                                <a
                                    href={prDetails.links.commits.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block w-full text-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                                >
                                    View Commits
                                </a>
                                <a
                                    href={prDetails.links.comments.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block w-full text-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                >
                                    View Comments
                                </a>
                            </div>
                        </div>

                        {/* Repository Info */}
                        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Repository</h3>
                            <div className="space-y-2">
                                <div className="text-sm">
                                    <span className="text-gray-600">Name:</span>
                                    <span className="ml-2 font-medium">{prDetails.source.repository.name}</span>
                                </div>
                                <div className="text-sm">
                                    <span className="text-gray-600">Full Name:</span>
                                    <span className="ml-2 font-medium">{prDetails.source.repository.full_name}</span>
                                </div>
                                <a
                                    href={prDetails.source.repository.links.html.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block text-blue-600 hover:underline text-sm"
                                >
                                    View Repository
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PRDetailView;
