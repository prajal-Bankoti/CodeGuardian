import React from 'react';
import Button from '../common/Button';

interface PullRequest {
    id: string;
    title: string;
    author: string;
    repository: string;
    status: 'open' | 'merged' | 'declined';
    createdDate: string;
    updatedDate: string;
    reviewers: string[];
    aiReviewed: boolean;
    aiSuggestions: number;
}

interface PRCardProps {
    pr: PullRequest;
    isSelected: boolean;
    onSelect: (prId: string) => void;
    onViewPR: (prId: string) => void;
    onAIReview: (prId: string) => void;
}

const PRCard: React.FC<PRCardProps> = ({
    pr,
    isSelected,
    onSelect,
    onViewPR,
    onAIReview,
}) => {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'open':
                return 'bg-green-100 text-green-800';
            case 'merged':
                return 'bg-blue-100 text-blue-800';
            case 'declined':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div
            className={`p-6 hover:bg-gray-50 transition-all duration-200 border-b border-gray-100 last:border-b-0 ${isSelected ? 'bg-blue-50 border-l-4 border-blue-500 shadow-sm' : ''
                }`}
        >
            <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                    <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onSelect(pr.id)}
                        className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        aria-label={`Select pull request: ${pr.title}`}
                    />
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-medium text-gray-900 truncate">
                                {pr.title}
                            </h3>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(pr.status)}`}>
                                {pr.status}
                            </span>
                            {pr.aiReviewed && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                                    </svg>
                                    AI Reviewed
                                </span>
                            )}
                        </div>

                        <div className="flex items-center space-x-6 text-sm text-gray-600">
                            <div className="flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                {pr.author}
                            </div>
                            <div className="flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                                {pr.repository}
                            </div>
                            <div className="flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {new Date(pr.createdDate).toLocaleDateString()}
                            </div>
                            {pr.aiSuggestions > 0 && (
                                <div className="flex items-center text-purple-600">
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                    </svg>
                                    {pr.aiSuggestions} suggestions
                                </div>
                            )}
                        </div>

                        <div className="mt-3 flex items-center space-x-4">
                            <div className="flex items-center text-sm text-gray-600">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                Reviewers: {pr.reviewers.join(', ')}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                    <Button variant="secondary" size="sm" onClick={() => onViewPR(pr.id)}>
                        View PR
                    </Button>
                    {!pr.aiReviewed && (
                        <Button variant="primary" size="sm" onClick={() => onAIReview(pr.id)}>
                            AI Review
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PRCard;
