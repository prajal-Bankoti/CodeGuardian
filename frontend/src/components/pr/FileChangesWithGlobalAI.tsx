import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/apiService';
import aiService, { CodeReviewResponse, CodeReviewComment } from '../../services/aiService';

interface FileChange {
    path: string;
    type: 'added' | 'removed' | 'modified';
    linesAdded: number;
    linesRemoved: number;
    diff?: string;
}

interface FileChangesWithGlobalAIProps {
    repository: string;
    prId: string;
    accessToken: string;
    onReviewComplete?: (review: CodeReviewResponse) => void;
}

const FileChangesWithGlobalAI: React.FC<FileChangesWithGlobalAIProps> = ({ repository, prId, onReviewComplete }) => {
    const [fileChanges, setFileChanges] = useState<FileChange[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedFiles, setExpandedFiles] = useState<Set<string>>(new Set());
    const [globalReview, setGlobalReview] = useState<CodeReviewResponse | null>(null);
    const [reviewLoading, setReviewLoading] = useState(false);
    const [hasReviewed, setHasReviewed] = useState(false);
    const [postingComments, setPostingComments] = useState(false);
    const [commentsPosted, setCommentsPosted] = useState(false);

    useEffect(() => {
        const fetchFileChanges = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await apiService.getPullRequestDiff(repository, prId);
                if (response.success && response.data) {
                    const parsedChanges = parseDiffData(response.data);
                    setFileChanges(parsedChanges);
                } else {
                    throw new Error('Failed to fetch diff data');
                }
            } catch (err) {
                setError('Failed to fetch file changes');
                console.error('Error fetching file changes:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchFileChanges();
    }, [repository, prId]);

    const parseDiffData = (diffData: string): FileChange[] => {
        const files: FileChange[] = [];
        const diffSections = diffData.split('diff --git');

        diffSections.forEach((section, index) => {
            if (index === 0) return;

            const lines = section.split('\n');
            const filePathMatch = lines[0]?.match(/a\/(.*?) b\/(.*?)$/);
            const filePath = filePathMatch ? filePathMatch[1] : `file-${index}`;

            let linesAdded = 0;
            let linesRemoved = 0;
            const diffLines: string[] = [];

            lines.forEach(line => {
                if (line.startsWith('+') && !line.startsWith('+++')) {
                    linesAdded++;
                } else if (line.startsWith('-') && !line.startsWith('---')) {
                    linesRemoved++;
                }
                diffLines.push(line);
            });

            let type: 'added' | 'removed' | 'modified' = 'modified';
            if (linesAdded > 0 && linesRemoved === 0) type = 'added';
            else if (linesAdded === 0 && linesRemoved > 0) type = 'removed';

            files.push({
                path: filePath,
                type,
                linesAdded,
                linesRemoved,
                diff: diffLines.join('\n')
            });
        });

        console.log('Parsed files from diff:', files.map(f => f.path));
        return files;
    };

    const toggleFileExpansion = (filePath: string) => {
        const newExpanded = new Set(expandedFiles);
        if (newExpanded.has(filePath)) {
            newExpanded.delete(filePath);
        } else {
            newExpanded.add(filePath);
        }
        setExpandedFiles(newExpanded);
    };

    const handleGlobalReview = async () => {
        setReviewLoading(true);
        setHasReviewed(true);
        try {
            const result = await aiService.reviewPullRequest(repository, prId);
            console.log('AI Review Result:', result);
            console.log('AI Comments:', result.comments);
            setGlobalReview(result);
            if (onReviewComplete) {
                onReviewComplete(result);
            }
        } catch (err: any) {
            console.error('Error performing global review:', err);

            // Check for specific error types
            if (err.response?.status === 413 && err.response?.data?.code === 'CONTENT_LIMIT_EXCEEDED') {
                setError('CONTENT_LIMIT_EXCEEDED');
            } else {
                setError('Failed to perform AI review');
            }
        } finally {
            setReviewLoading(false);
        }
    };

    const handlePostCommentsToBitbucket = async () => {
        if (!globalReview || !globalReview.comments) {
            return;
        }

        try {
            setPostingComments(true);

            const requestData = {
                repository,
                prId,
                comments: globalReview.comments
            };

            console.log('Posting comments to Bitbucket:', requestData);

            const response = await fetch('/api/ai/post-comments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                },
                body: JSON.stringify(requestData)
            });

            const result = await response.json();

            if (response.ok) {
                setCommentsPosted(true);

                // Check if there were token errors
                const hasTokenErrors = result.results.errors.some((error: any) =>
                    error.error?.type === 'token_error' ||
                    error.error?.message?.includes('Token is invalid')
                );

                if (hasTokenErrors) {
                    alert(`❌ Token Error: Your Bitbucket token is invalid, expired, or lacks permissions for posting comments.\n\nPlease:\n1. Check your token permissions in Bitbucket\n2. Ensure the token has "Repositories: Write" permission\n3. Generate a new token if needed\n\nPosted: ${result.results.successful}/${globalReview.comments.length} comments`);
                } else if (result.results.successful === 0) {
                    alert(`❌ Failed to post any comments to Bitbucket.\n\nPosted: ${result.results.successful}/${globalReview.comments.length} comments`);
                } else {
                    alert(`✅ Successfully posted ${result.results.successful} out of ${globalReview.comments.length} comments to Bitbucket!`);
                }
            } else {
                alert(`Failed to post comments: ${result.error}`);
            }
        } catch (error) {
            console.error('Error posting comments to Bitbucket:', error);
            alert('Failed to post comments to Bitbucket');
        } finally {
            setPostingComments(false);
        }
    };

    const getFileIcon = (type: string) => {
        switch (type) {
            case 'added':
                return '📄';
            case 'removed':
                return '🗑️';
            case 'modified':
                return '✏️';
            default:
                return '📄';
        }
    };

    const getFileTypeColor = (type: string) => {
        switch (type) {
            case 'added':
                return 'text-green-600 bg-green-50 border-green-200';
            case 'removed':
                return 'text-red-600 bg-red-50 border-red-200';
            case 'modified':
                return 'text-blue-600 bg-blue-50 border-blue-200';
            default:
                return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    const getCommentPriorityColor = (priority: CodeReviewComment['priority']) => {
        switch (priority) {
            case 'HIGH':
                return 'text-red-600';
            case 'MEDIUM':
                return 'text-yellow-600';
            case 'LOW':
                return 'text-green-600';
            default:
                return 'text-gray-600';
        }
    };

    const getCommentPriorityBadgeColor = (priority: CodeReviewComment['priority']) => {
        switch (priority) {
            case 'HIGH':
                return 'bg-red-100 text-red-800';
            case 'MEDIUM':
                return 'bg-yellow-100 text-yellow-800';
            case 'LOW':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'bg-green-50 border-green-200 text-green-800';
        if (score >= 60) return 'bg-yellow-50 border-yellow-200 text-yellow-800';
        return 'bg-red-50 border-red-200 text-red-800';
    };

    const getCommentsForFile = (filePath: string) => {
        if (!globalReview) return [];
        const comments = globalReview.comments.filter(comment => comment.filePath === filePath);
        console.log(`File: ${filePath}, Comments found: ${comments.length}`, comments);
        return comments;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Loading file changes...</span>
            </div>
        );
    }

    if (error && error !== 'CONTENT_LIMIT_EXCEEDED') {
        return (
            <div className="text-center py-8 text-red-600">
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Global Review Section */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-gray-900">AI Code Review</h3>
                    {error !== 'CONTENT_LIMIT_EXCEEDED' && (
                        <button
                            onClick={handleGlobalReview}
                            disabled={reviewLoading}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {reviewLoading ? 'Reviewing...' : 'Review Entire PR'}
                        </button>
                    )}
                </div>

                {error === 'CONTENT_LIMIT_EXCEEDED' && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                        <div className="flex items-start">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-yellow-800">
                                    Content Limit Exceeded
                                </h3>
                                <div className="mt-2 text-sm text-yellow-700">
                                    <p>
                                        This is a large PR. The AI token limit exceeded for large PR. Please update the API connect with team.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}


                {hasReviewed && globalReview && (
                    <div className="space-y-4">
                        {/* Overall Score */}
                        <div className={`border rounded-lg p-4 ${getScoreColor(globalReview.overallScore)}`}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-semibold">Overall Code Quality Score</h4>
                                    <p className="text-sm opacity-75">
                                        {globalReview.framework} • {globalReview.language}
                                    </p>
                                </div>
                                <div className="text-3xl font-bold">
                                    {globalReview.overallScore}/100
                                </div>
                            </div>
                        </div>

                        {/* Severity Breakdown */}
                        {globalReview.severityBreakdown && (
                            <div className="bg-white border rounded-lg p-4">
                                <h4 className="font-semibold mb-3 flex items-center">
                                    🚨 Severity Breakdown
                                </h4>
                                <div className="grid grid-cols-4 gap-4">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-red-600">
                                            {globalReview.severityBreakdown.high}
                                        </div>
                                        <div className="text-xs text-gray-600">High</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-yellow-600">
                                            {globalReview.severityBreakdown.medium}
                                        </div>
                                        <div className="text-xs text-gray-600">Medium</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-green-600">
                                            {globalReview.severityBreakdown.low}
                                        </div>
                                        <div className="text-xs text-gray-600">Low</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-gray-600">
                                            {globalReview.severityBreakdown.total}
                                        </div>
                                        <div className="text-xs text-gray-600">Total</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Post Comments to Bitbucket Button */}
                        {globalReview.comments && globalReview.comments.length > 0 && (
                            <div className="bg-white border rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-semibold mb-2">Post Comments to Bitbucket</h4>
                                        <p className="text-sm text-gray-600 mb-2">
                                            Post all {globalReview.comments.length} AI review comments directly to the Bitbucket PR
                                        </p>
                                        <p className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                                            💡 <strong>Note:</strong> Your Bitbucket token needs "Repositories: Write" permission to post comments
                                        </p>
                                    </div>
                                    <button
                                        onClick={handlePostCommentsToBitbucket}
                                        disabled={postingComments || commentsPosted}
                                        className={`px-6 py-2 rounded-lg font-medium transition-colors ${commentsPosted
                                            ? 'bg-green-100 text-green-800 border border-green-200'
                                            : postingComments
                                                ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                                                : 'bg-blue-600 text-white hover:bg-blue-700'
                                            }`}
                                    >
                                        {commentsPosted ? (
                                            <span className="flex items-center">
                                                ✅ Posted to Bitbucket
                                            </span>
                                        ) : postingComments ? (
                                            <span className="flex items-center">
                                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Posting...
                                            </span>
                                        ) : (
                                            <span className="flex items-center">
                                                📤 Post to Bitbucket
                                            </span>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* PR Overview */}
                        {globalReview.prOverview && (
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                                <h4 className="font-semibold mb-3 flex items-center text-blue-800">
                                    📋 PR Overview
                                </h4>
                                <div className="space-y-3">
                                    <div>
                                        <h5 className="font-medium text-blue-700 mb-1">Title:</h5>
                                        <p className="text-gray-800 text-sm">{globalReview.prOverview.title}</p>
                                    </div>

                                    {globalReview.prOverview.keyChanges?.length > 0 && (
                                        <div>
                                            <h5 className="font-medium text-blue-700 mb-1">Key Changes:</h5>
                                            <ul className="list-disc list-inside ml-2 space-y-1">
                                                {globalReview.prOverview.keyChanges.map((change, index) => (
                                                    <li key={index} className="text-gray-700 text-sm">{change}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <h5 className="font-medium text-blue-700 mb-1">Impact:</h5>
                                            <p className="text-gray-700 text-sm">{globalReview.prOverview.impact}</p>
                                        </div>
                                        <div>
                                            <h5 className="font-medium text-blue-700 mb-1">Risk Level:</h5>
                                            <p className="text-gray-700 text-sm">{globalReview.prOverview.riskLevel}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Summary */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="font-semibold mb-2 flex items-center">
                                📝 Summary
                            </h4>
                            <p className="text-gray-700 text-sm">{globalReview.summary}</p>
                        </div>

                        {/* Global Suggestions */}
                        {globalReview.suggestions && (
                            <div className="bg-blue-50 rounded-lg p-4">
                                <h4 className="font-semibold mb-3 flex items-center">
                                    💡 Global Suggestions
                                </h4>
                                <div className="space-y-4 text-sm">
                                    {globalReview.suggestions.immediateActions?.length > 0 && (
                                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                            <h5 className="font-medium text-red-800 mb-2 flex items-center">
                                                🚨 Immediate Actions Required
                                            </h5>
                                            <ul className="list-disc list-inside ml-2 space-y-1">
                                                {globalReview.suggestions.immediateActions.map((action, index) => (
                                                    <li key={index} className="text-red-700">{action}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {globalReview.suggestions.componentExtractions?.length > 0 && (
                                        <div>
                                            <h5 className="font-medium text-blue-700 mb-2">Component Extractions:</h5>
                                            <ul className="list-disc list-inside ml-2 space-y-1">
                                                {globalReview.suggestions.componentExtractions.map((suggestion, index) => (
                                                    <li key={index} className="text-gray-700">{suggestion}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {globalReview.suggestions.bestPractices?.length > 0 && (
                                        <div>
                                            <h5 className="font-medium text-blue-700 mb-2">Best Practices:</h5>
                                            <ul className="list-disc list-inside ml-2 space-y-1">
                                                {globalReview.suggestions.bestPractices.map((suggestion, index) => (
                                                    <li key={index} className="text-gray-700">{suggestion}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {globalReview.suggestions.fileOrganizations?.length > 0 && (
                                        <div>
                                            <h5 className="font-medium text-blue-700 mb-2">File Organizations:</h5>
                                            <ul className="list-disc list-inside ml-2 space-y-1">
                                                {globalReview.suggestions.fileOrganizations.map((suggestion, index) => (
                                                    <li key={index} className="text-gray-700">{suggestion}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {globalReview.suggestions.testingRecommendations?.length > 0 && (
                                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                            <h5 className="font-medium text-green-800 mb-2 flex items-center">
                                                🧪 Testing Recommendations
                                            </h5>
                                            <ul className="list-disc list-inside ml-2 space-y-1">
                                                {globalReview.suggestions.testingRecommendations.map((recommendation, index) => (
                                                    <li key={index} className="text-green-700">{recommendation}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {!hasReviewed && !reviewLoading && (
                    <div className="text-center py-8 text-gray-500">
                        <div className="text-4xl mb-2">🤖</div>
                        {/* <p className="text-sm">Click "Review Entire PR" to get comprehensive AI analysis</p> */}
                        <p className="text-xs mt-1">Analyzes all files with inline comments like Bitbucket</p>
                    </div>
                )}
            </div>

            {/* File Changes */}
            <div className="space-y-2">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">File Changes</h3>
                    <span className="text-sm text-gray-500">{fileChanges.length} files</span>
                </div>

                {fileChanges.map((file, index) => {
                    const fileComments = getCommentsForFile(file.path);
                    const hasComments = fileComments.length > 0;

                    return (
                        <div key={index} className="border border-gray-200 rounded-lg">
                            {/* File Header */}
                            <button
                                onClick={() => toggleFileExpansion(file.path)}
                                className="w-full p-4 text-left hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <span className="text-lg">{getFileIcon(file.type)}</span>
                                        <div>
                                            <span className="font-medium text-gray-900">{file.path}</span>
                                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getFileTypeColor(file.type)}`}>
                                                    {file.type}
                                                </span>
                                                {file.linesAdded > 0 && (
                                                    <span className="text-green-600">+{file.linesAdded}</span>
                                                )}
                                                {file.linesRemoved > 0 && (
                                                    <span className="text-red-600">-{file.linesRemoved}</span>
                                                )}
                                                {hasComments && (
                                                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                                                        {fileComments.length} AI comment{fileComments.length !== 1 ? 's' : ''}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <svg
                                        className={`w-5 h-5 text-gray-400 transition-transform ${expandedFiles.has(file.path) ? 'rotate-180' : ''}`}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </button>

                            {/* File Content */}
                            {expandedFiles.has(file.path) && file.diff && (
                                <div className="border-t border-gray-200 bg-gray-900">
                                    {/* Diff Content */}
                                    <div className="p-4 overflow-x-auto">
                                        <div className="text-sm font-mono">
                                            {(() => {
                                                // Fixed line number calculation - no more line 1 issues
                                                const lines = file.diff.split('\n');
                                                let currentHunkStart = 0;
                                                let currentLineNumber = 0;

                                                return lines.map((line, lineIndex) => {
                                                    let actualLineNumber = 0;
                                                    let displayLineNumber: number | string = ''; // ALWAYS start with empty string
                                                    let lineClass = 'text-gray-300';
                                                    let bgClass = '';

                                                    // ALWAYS hide line numbers for diff metadata - NO EXCEPTIONS
                                                    if (line.startsWith('diff --git') ||
                                                        line.startsWith('index ') ||
                                                        line.startsWith('+++') ||
                                                        line.startsWith('---') ||
                                                        (line.includes('a/') && line.includes('b/'))) {
                                                        lineClass = 'text-gray-500';
                                                        displayLineNumber = ''; // FORCE empty for all metadata
                                                        return (
                                                            <React.Fragment key={lineIndex}>
                                                                <div className={`flex ${bgClass} hover:bg-gray-800/50`}>
                                                                    <div className="w-12 text-right pr-4 text-gray-500 select-none text-xs leading-5">
                                                                        {displayLineNumber}
                                                                    </div>
                                                                    <div className={`flex-1 ${lineClass} leading-5 whitespace-pre`}>
                                                                        {line}
                                                                    </div>
                                                                </div>
                                                            </React.Fragment>
                                                        );
                                                    }

                                                    // Parse hunk header to get actual line numbers
                                                    if (line.startsWith('@@')) {
                                                        const hunkMatch = line.match(/@@ -(\d+),?\d* \+(\d+),?\d* @@/);
                                                        if (hunkMatch) {
                                                            currentHunkStart = parseInt(hunkMatch[2]); // Use new file start line
                                                            currentLineNumber = currentHunkStart - 1; // Reset counter
                                                        }
                                                        lineClass = 'text-blue-400';
                                                        bgClass = 'bg-blue-900/20';
                                                        displayLineNumber = ''; // Hide line number for hunk headers
                                                    } else if (line.startsWith('+')) {
                                                        currentLineNumber++;
                                                        actualLineNumber = currentLineNumber;
                                                        displayLineNumber = actualLineNumber; // Show real file line number
                                                        lineClass = 'text-green-400';
                                                        bgClass = 'bg-green-900/20';
                                                    } else if (line.startsWith('-')) {
                                                        // For removed lines, don't increment the new file line counter
                                                        lineClass = 'text-red-400';
                                                        bgClass = 'bg-red-900/20';
                                                        displayLineNumber = ''; // Hide line number for removed lines
                                                    } else {
                                                        // Context line - only show line number if we're inside a hunk
                                                        if (currentHunkStart > 0) {
                                                            currentLineNumber++;
                                                            actualLineNumber = currentLineNumber;
                                                            displayLineNumber = actualLineNumber; // Show real file line number
                                                        } else {
                                                            displayLineNumber = ''; // Hide line number for lines before first hunk
                                                        }
                                                    }

                                                    // Find comments for this specific line using actual line number
                                                    const inlineComments = fileComments.filter(
                                                        comment => comment.lineNumber === actualLineNumber
                                                    );


                                                    return (
                                                        <React.Fragment key={lineIndex}>
                                                            <div className={`flex ${bgClass} hover:bg-gray-800/50`}>
                                                                <div className="w-12 text-right pr-4 text-gray-500 select-none text-xs leading-5">
                                                                    {displayLineNumber}
                                                                </div>
                                                                <div className={`flex-1 ${lineClass} leading-5 whitespace-pre`}>
                                                                    {line}
                                                                </div>
                                                            </div>
                                                            {/* Inline AI Comments - Bitbucket Style */}
                                                            {inlineComments && inlineComments.length > 0 && (
                                                                <div className="ml-12 mb-2">
                                                                    {inlineComments.map((comment, commentIndex) => (
                                                                        <div key={commentIndex} className="bg-blue-50 border-l-4 border-blue-400 p-3 mb-2 rounded-r-md">
                                                                            <div className="flex items-start space-x-2">
                                                                                <div className="flex-shrink-0">
                                                                                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                                                                        <span className="text-white text-xs font-bold">AI</span>
                                                                                    </div>
                                                                                </div>
                                                                                <div className="flex-1 min-w-0">
                                                                                    <div className="flex items-center space-x-2 mb-1">
                                                                                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getCommentPriorityBadgeColor(comment.priority)}`}>
                                                                                            {comment.priority} {comment.type}
                                                                                        </span>
                                                                                        <span className="text-xs text-gray-500">•</span>
                                                                                        <span className="text-xs text-gray-500">Line {comment.lineNumber}</span>
                                                                                    </div>
                                                                                    <p className="text-sm text-gray-800 mb-1">{comment.message}</p>
                                                                                    {comment.suggestion && (
                                                                                        <div className="bg-yellow-50 border border-yellow-200 rounded p-2 mt-2">
                                                                                            <p className="text-xs text-yellow-800">
                                                                                                <span className="font-semibold">💡 Suggestion:</span> {comment.suggestion}
                                                                                            </p>
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </React.Fragment>
                                                    );
                                                });
                                            })()}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default FileChangesWithGlobalAI;
