import React, { useState } from 'react';
import { CodeReviewResponse, CodeReviewComment } from '../../services/aiService';
import aiService from '../../services/aiService';
import Accordion from '../common/Accordion';

interface AICodeReviewProps {
    diff: string;
    filePath: string;
    onReviewComplete?: (review: CodeReviewResponse) => void;
}

const AICodeReview: React.FC<AICodeReviewProps> = ({ diff, filePath, onReviewComplete }) => {
    const [review, setReview] = useState<CodeReviewResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasReviewed, setHasReviewed] = useState(false);

    const handleReview = async () => {
        setLoading(true);
        setError(null);
        setHasReviewed(true);

        try {
            const result = await aiService.reviewCode({
                diff,
                filePath
            });

            setReview(result);
            onReviewComplete?.(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to perform AI review');
        } finally {
            setLoading(false);
        }
    };

    const getScoreColor = (score: number): string => {
        if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
        if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
        return 'text-red-600 bg-red-50 border-red-200';
    };

    const CommentCard: React.FC<{ comment: CodeReviewComment }> = ({ comment }) => (
        <div className={`border rounded-lg p-4 mb-3 ${aiService.getPriorityColor(comment.priority)}`}>
            <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                    <span className="text-lg">{aiService.getTypeIcon(comment.type)}</span>
                    <span className="font-semibold text-sm uppercase tracking-wide">
                        {comment.priority}
                    </span>
                    <span className="text-xs bg-white px-2 py-1 rounded-full border">
                        {comment.type}
                    </span>
                </div>
                {comment.lineNumber && (
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                        Line {comment.lineNumber}
                    </span>
                )}
            </div>

            <div className="mb-2">
                <p className="text-sm font-medium mb-1">
                    {aiService.getCategoryDescription(comment.category)}
                </p>
                <p className="text-sm">{comment.message}</p>
            </div>

            {comment.suggestion && (
                <div className="bg-white bg-opacity-50 rounded p-3 border-l-4 border-blue-400">
                    <p className="text-xs font-medium text-blue-800 mb-1">💡 Suggestion:</p>
                    <p className="text-xs text-blue-700">{comment.suggestion}</p>
                </div>
            )}
        </div>
    );

    const SuggestionsSection: React.FC<{ suggestions: any }> = ({ suggestions }) => (
        <div className="space-y-4">
            {suggestions.componentExtractions.length > 0 && (
                <div>
                    <h4 className="font-semibold text-sm mb-2 flex items-center">
                        🧩 Component Extractions
                    </h4>
                    <ul className="space-y-1">
                        {suggestions.componentExtractions.map((suggestion: string, index: number) => (
                            <li key={index} className="text-sm bg-blue-50 p-2 rounded border-l-4 border-blue-400">
                                {suggestion}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {suggestions.fileOrganizations.length > 0 && (
                <div>
                    <h4 className="font-semibold text-sm mb-2 flex items-center">
                        📁 File Organization
                    </h4>
                    <ul className="space-y-1">
                        {suggestions.fileOrganizations.map((suggestion: string, index: number) => (
                            <li key={index} className="text-sm bg-green-50 p-2 rounded border-l-4 border-green-400">
                                {suggestion}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {suggestions.bestPractices.length > 0 && (
                <div>
                    <h4 className="font-semibold text-sm mb-2 flex items-center">
                        ⭐ Best Practices
                    </h4>
                    <ul className="space-y-1">
                        {suggestions.bestPractices.map((suggestion: string, index: number) => (
                            <li key={index} className="text-sm bg-purple-50 p-2 rounded border-l-4 border-purple-400">
                                {suggestion}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    🤖 AI Code Review
                </h3>
                <button
                    onClick={handleReview}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                    {loading ? (
                        <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>Analyzing...</span>
                        </>
                    ) : (
                        <>
                            <span>🔍</span>
                            <span>Review Code</span>
                        </>
                    )}
                </button>
            </div>

            {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-800 text-sm">❌ {error}</p>
                </div>
            )}

            {hasReviewed && review && (
                <div className="space-y-6">
                    {/* Overall Score */}
                    <div className={`border rounded-lg p-4 ${getScoreColor(review.overallScore)}`}>
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-semibold">Overall Code Quality Score</h4>
                                <p className="text-sm opacity-75">
                                    {filePath} • {review.framework} • {review.language}
                                </p>
                            </div>
                            <div className="text-3xl font-bold">
                                {review.overallScore}/100
                            </div>
                        </div>
                    </div>

                    {/* Summary */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-semibold mb-2 flex items-center">
                            📋 Summary
                        </h4>
                        <p className="text-sm text-gray-700">{review.summary}</p>
                    </div>

                    {/* Comments */}
                    {review.comments.length > 0 && (
                        <div>
                            <h4 className="font-semibold mb-4 flex items-center">
                                💬 Code Review Comments ({review.comments.length})
                            </h4>
                            <div className="space-y-3">
                                {review.comments.map((comment, index) => (
                                    <CommentCard key={index} comment={comment} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Suggestions */}
                    <Accordion title="💡 Improvement Suggestions" defaultOpen={true}>
                        <SuggestionsSection suggestions={review.suggestions} />
                    </Accordion>
                </div>
            )}

            {!hasReviewed && !loading && (
                <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-2">🤖</div>
                    <p className="text-sm">Click "Review Code" to get AI-powered code analysis</p>
                    <p className="text-xs mt-1">Analyzes code quality, security, performance, and best practices</p>
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-xs text-blue-700">
                            <strong>File:</strong> {filePath}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AICodeReview;
