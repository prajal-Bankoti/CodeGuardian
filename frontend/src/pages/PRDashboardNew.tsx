import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PRFilters from '../components/pr/PRFilters';
import PRCard from '../components/pr/PRCard';
import Button from '../components/common/Button';
import Pagination from '../components/common/Pagination';
import { useBitbucket } from '../contexts/BitbucketContext';
import { BitbucketPullRequest } from '../services/bitbucketService';

interface PullRequest {
    id: string;
    title: string;
    author: string;
    repository: string;
    fullRepositoryName: string;
    status: 'open' | 'merged' | 'declined';
    createdDate: string;
    updatedDate: string;
    reviewers: string[];
    aiReviewed: boolean;
    aiSuggestions: number;
}

const PRDashboardNew: React.FC = () => {
    const navigate = useNavigate();
    const {
        isAuthenticated,
        user,
        repositories,
        pullRequests,
        loading,
        error,
        pullRequestsPagination,
        fetchPullRequests,
        refreshData
    } = useBitbucket();

    const [selectedRepo, setSelectedRepo] = useState<string>('');
    const [selectedStatus, setSelectedStatus] = useState<string>('OPEN');
    const [selectedPRs, setSelectedPRs] = useState<string[]>([]);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [itemsPerPage, setItemsPerPage] = useState<number>(10);

    // Convert Bitbucket PRs to our format
    const convertBitbucketPRs = (bitbucketPRs: BitbucketPullRequest[]): PullRequest[] => {
        if (!bitbucketPRs || !Array.isArray(bitbucketPRs)) {
            return [];
        }

        return bitbucketPRs
            .filter(pr => {
                // Filter by repository - compare with full_name since selectedRepo now contains full_name
                if (selectedRepo) {
                    const repoFullName = pr.source.repository.full_name;
                    if (repoFullName !== selectedRepo) return false;
                }

                // Filter by status
                if (selectedStatus && pr.state !== selectedStatus) return false;

                return true;
            })
            .map(pr => ({
                id: pr.id.toString(),
                title: pr.title || 'Untitled PR',
                author: pr.author.display_name || pr.author.nickname || 'Unknown Author',
                repository: pr.source.repository.name || 'Unknown Repository',
                fullRepositoryName: pr.source.repository.full_name || pr.source.repository.name || 'Unknown Repository',
                status: (pr.state?.toLowerCase() || 'open') as 'open' | 'merged' | 'declined',
                createdDate: pr.created_on || new Date().toISOString(),
                updatedDate: pr.updated_on || new Date().toISOString(),
                reviewers: [], // Bitbucket API doesn't include reviewers in the basic PR response
                aiReviewed: false, // This will be updated when AI review is implemented
                aiSuggestions: 0,
            }));
    };

    // Get filtered PRs
    const filteredPRs = convertBitbucketPRs(pullRequests || []);

    // Get repository names for filter (no "all" option)
    const repositoryNames = (repositories || []).map(repo => repo.full_name);

    // Helper function to get display name from full name
    const getRepositoryDisplayName = (fullName: string) => {
        return fullName.split('/').pop() || fullName;
    };

    // Set default repository when repositories are loaded
    useEffect(() => {
        if (repositories && repositories.length > 0 && !selectedRepo) {
            setSelectedRepo(repositories[0].full_name);
        }
    }, [repositories, selectedRepo]);

    // Load PRs when authenticated, repository changes, or page changes
    useEffect(() => {
        if (isAuthenticated && selectedRepo) {
            fetchPullRequests(selectedRepo, currentPage, itemsPerPage);
        }
    }, [isAuthenticated, selectedRepo, currentPage, itemsPerPage, fetchPullRequests]);

    const handlePRSelect = (prId: string) => {
        setSelectedPRs(prev =>
            prev.includes(prId)
                ? prev.filter(id => id !== prId)
                : [...prev, prId]
        );
    };

    const handleSelectAll = () => {
        if (selectedPRs.length === filteredPRs.length) {
            setSelectedPRs([]);
        } else {
            setSelectedPRs(filteredPRs.map(pr => pr.id));
        }
    };

    const handleAIReview = async () => {
        if (selectedPRs.length === 0) {
            alert('Please select at least one PR to review');
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/api/prs/ai-review', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prIds: selectedPRs }),
            });

            const data = await response.json();

            if (data.success) {
                alert(`AI review completed for ${data.data.length} PR(s)!`);
                refreshData();
                setSelectedPRs([]);
            } else {
                alert(`Error: ${data.message}`);
            }
        } catch (err) {
            alert('Failed to perform AI review');
        }
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        setSelectedPRs([]); // Clear selection when changing pages
    };

    const handleItemsPerPageChange = (newItemsPerPage: number) => {
        setItemsPerPage(newItemsPerPage);
        setCurrentPage(1); // Reset to first page
        setSelectedPRs([]); // Clear selection
    };

    const handleViewPR = (prId: string) => {
        // Find the PR to get the repository name
        const pr = filteredPRs.find(p => p.id === prId);
        if (pr) {
            navigate(`/app/pr/${encodeURIComponent(pr.fullRepositoryName)}/${encodeURIComponent(prId)}`);
        }
    };

    const handleSingleAIReview = (prId: string) => {
        setSelectedPRs([prId]);
        handleAIReview();
    };

    const renderContent = () => {
        if (loading) {
            return (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Loading pull requests from {getRepositoryDisplayName(selectedRepo)}...
                    </h3>
                    <p className="text-gray-600">Please wait while we fetch your data.</p>
                </div>
            );
        }

        if (error) {
            return (
                <div className="text-center py-12">
                    <svg className="w-12 h-12 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading data</h3>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <Button onClick={refreshData}>
                        Try Again
                    </Button>
                </div>
            );
        }

        if (filteredPRs.length === 0) {
            return (
                <div className="text-center py-12">
                    <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No pull requests found</h3>
                    <p className="text-gray-600">
                        {pullRequests.length === 0
                            ? `No pull requests found in ${getRepositoryDisplayName(selectedRepo)}. Try selecting a different repository or refreshing.`
                            : "Try adjusting your filters to see more pull requests."
                        }
                    </p>
                    {pullRequests.length === 0 && (
                        <Button
                            variant="primary"
                            onClick={refreshData}
                            className="mt-4"
                        >
                            Refresh Data
                        </Button>
                    )}
                </div>
            );
        }

        return (
            <div className="divide-y divide-gray-200">
                {filteredPRs.map((pr) => (
                    <PRCard
                        key={pr.id}
                        pr={pr}
                        isSelected={selectedPRs.includes(pr.id)}
                        onSelect={handlePRSelect}
                        onViewPR={handleViewPR}
                        onAIReview={handleSingleAIReview}
                    />
                ))}
            </div>
        );
    };

    // Show connection prompt if not authenticated
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="container-custom py-8">
                    <div className="mb-8">
                        <div className="text-center">
                            <h1 className="text-4xl font-bold text-gray-900 mb-2">PR Dashboard</h1>
                            <p className="text-lg text-gray-600">Connect to Bitbucket to manage and review your pull requests with AI assistance</p>
                        </div>
                    </div>

                    <div className="max-w-2xl mx-auto">
                        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200 text-center">
                            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M.778 1.213a.768.768 0 00-.768.892l3.263 19.81c.084.5.515.868 1.022.873H19.95a.772.772 0 00.77-.646l3.27-20.03a.768.768 0 00-.768-.891L.778 1.213zM14.52 15.53H9.522L8.17 8.466h7.561l-1.211 7.064zm-9.768-9.54l.98-5.68h.98l-.98 5.68h-.98zm2.38 0l.98-5.68h.98l-.98 5.68h-.98zm2.38 0l.98-5.68h.98l-.98 5.68h-.98zm2.38 0l.98-5.68h.98l-.98 5.68h-.98z" />
                                </svg>
                            </div>

                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                                Connect to Bitbucket
                            </h2>

                            <p className="text-gray-600 mb-8">
                                To start reviewing your pull requests with AI assistance, you need to connect your Bitbucket account.
                            </p>

                            <Link to="/app/bitbucket-login">
                                <Button variant="primary" className="w-full sm:w-auto">
                                    <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M.778 1.213a.768.768 0 00-.768.892l3.263 19.81c.084.5.515.868 1.022.873H19.95a.772.772 0 00.77-.646l3.27-20.03a.768.768 0 00-.768-.891L.778 1.213zM14.52 15.53H9.522L8.17 8.466h7.561l-1.211 7.064zm-9.768-9.54l.98-5.68h.98l-.98 5.68h-.98zm2.38 0l.98-5.68h.98l-.98 5.68h-.98zm2.38 0l.98-5.68h.98l-.98 5.68h-.98zm2.38 0l.98-5.68h.98l-.98 5.68h-.98z" />
                                    </svg>
                                    <span>Connect with Bitbucket</span>
                                </Button>
                            </Link>

                            <p className="text-xs text-gray-500 mt-4">
                                We'll only access your repositories and pull requests for review purposes.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="container-custom py-8">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900 mb-2">PR Dashboard</h1>
                            <p className="text-lg text-gray-600">
                                Manage and review pull requests with AI assistance
                                {user && (
                                    <span className="block text-sm text-gray-500 mt-1">
                                        Connected as {user.display_name}
                                    </span>
                                )}
                            </p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="text-right">
                                <div className="text-sm text-gray-500">Total PRs</div>
                                <div className="text-2xl font-bold text-blue-600">{filteredPRs.length}</div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm text-gray-500">Selected</div>
                                <div className="text-2xl font-bold text-green-600">{selectedPRs.length}</div>
                            </div>
                            <Button
                                variant="secondary"
                                onClick={refreshData}
                                disabled={loading}
                                size="sm"
                            >
                                {loading ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                                ) : (
                                    'Refresh'
                                )}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Filters Section */}
                <div className="mb-6">
                    <PRFilters
                        selectedRepo={selectedRepo}
                        selectedStatus={selectedStatus}
                        repositories={repositoryNames}
                        selectedCount={selectedPRs.length}
                        totalCount={filteredPRs.length}
                        onRepoChange={setSelectedRepo}
                        onStatusChange={setSelectedStatus}
                        onSelectAll={handleSelectAll}
                        onAIReview={handleAIReview}
                    />
                </div>

                {/* PR List Section */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                    <div className="px-6 py-5 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-gray-900">
                                Pull Requests ({filteredPRs.length})
                                <span className="text-sm font-normal text-gray-600 ml-2">
                                    from {getRepositoryDisplayName(selectedRepo)}
                                </span>
                            </h2>
                            <div className="flex items-center space-x-2">
                                {loading ? (
                                    <>
                                        <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                                        <span className="text-sm text-gray-600">Loading...</span>
                                    </>
                                ) : (
                                    <>
                                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                        <span className="text-sm text-gray-600">Live from Bitbucket</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="bg-white">
                        {renderContent()}
                    </div>

                    {/* Pagination */}
                    {pullRequestsPagination && (
                        <Pagination
                            currentPage={currentPage}
                            totalPages={Math.ceil(pullRequestsPagination.size / itemsPerPage)}
                            onPageChange={handlePageChange}
                            totalItems={pullRequestsPagination.size}
                            itemsPerPage={itemsPerPage}
                            loading={loading}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default PRDashboardNew;
