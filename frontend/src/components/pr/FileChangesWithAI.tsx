import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/apiService';
import aiService, { CodeReviewResponse } from '../../services/aiService';

interface FileChange {
    path: string;
    type: 'added' | 'removed' | 'modified';
    linesAdded: number;
    linesRemoved: number;
    diff?: string;
    aiReview?: CodeReviewResponse;
}

interface FileChangesWithAIProps {
    repository: string;
    prId: string;
    accessToken: string;
}

const FileChangesWithAI: React.FC<FileChangesWithAIProps> = ({ repository, prId, accessToken }) => {
    const [fileChanges, setFileChanges] = useState<FileChange[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedFiles, setExpandedFiles] = useState<Set<string>>(new Set());
    const [aiReviews, setAiReviews] = useState<Map<string, CodeReviewResponse>>(new Map());
    const [loadingAI, setLoadingAI] = useState<Set<string>>(new Set());

    useEffect(() => {
        const fetchFileChanges = async () => {
            try {
                setLoading(true);
                setError(null);

                // Try to fetch real diff data from Bitbucket API
                try {
                    const response = await apiService.getPullRequestDiff(repository, prId);
                    if (response.success && response.data) {
                        // Parse the diff data and convert to our format
                        const parsedChanges = parseDiffData(response.data);
                        setFileChanges(parsedChanges);
                    } else {
                        throw new Error('Failed to fetch diff data');
                    }
                } catch (apiError) {
                    console.warn('Failed to fetch real diff data, using mock data:', apiError);

                    // Fallback to mock data if API fails
                    const mockFileChanges: FileChange[] = [
                        {
                            path: 'src/action/loader.action.js',
                            type: 'modified',
                            linesAdded: 19,
                            linesRemoved: 14,
                            diff: `@@ -1,19 +1,24 @@
-import {
-  LOADER_START,
-  LOADER_STOP
-} from "../action-types/action.types";
+import { LOADER_START, LOADER_STOP, UNIVERSAL_LOADER_START, UNIVERSAL_LOADER_STOP } from '../action-types/action.types';
 
-return {
-  type: LOADER_START
-}
-}
+export const loaderStart = () => {
+  return {
+    type: LOADER_START,
+  };
+};
 
-return {
-  type: LOADER_STOP
-}
-}`
                        },
                        {
                            path: 'src/components/LabDetails.js',
                            type: 'modified',
                            linesAdded: 15,
                            linesRemoved: 8,
                            diff: `@@ -1,5 +1,6 @@
 import React from 'react';
 import { useState } from 'react';
+import PartnerPage from './PartnerPage';
 
 const LabDetails = () => {
   const [labData, setLabData] = useState(null);`
                        },
                        {
                            path: 'src/pages/CareerPage.js',
                            type: 'modified',
                            linesAdded: 12,
                            linesRemoved: 5,
                            diff: `@@ -10,7 +10,8 @@ const CareerPage = () => {
   const handleSubmit = (formData) => {
-    // Basic validation
+    // Enhanced validation with special character check
+    if (!/^[a-zA-Z0-9\\s]*$/.test(formData.name)) {
+      setError('Special characters not allowed');
+      return;
+    }
     submitForm(formData);
   };`
                        }
                    ];
                    setFileChanges(mockFileChanges);
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

    // Helper function to parse diff data from Bitbucket API
    const parseDiffData = (diffData: string): FileChange[] => {
        const files: FileChange[] = [];
        const diffSections = diffData.split('diff --git');

        diffSections.forEach((section, index) => {
            if (index === 0) return; // Skip the first empty section

            const lines = section.split('\n');
            const filePath = lines[0]?.split(' ')[1] || `file-${index}`;

            // Count added and removed lines
            let linesAdded = 0;
            let linesRemoved = 0;
            const diffLines: string[] = [];

            lines.forEach(line => {
                if (line.startsWith('+') && !line.startsWith('+++')) {
                    linesAdded++;
                    diffLines.push(line);
                } else if (line.startsWith('-') && !line.startsWith('---')) {
                    linesRemoved++;
                    diffLines.push(line);
                } else if (line.startsWith('@@')) {
                    diffLines.push(line);
                }
            });

            // Determine file type
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

    const handleAIRefresh = async (filePath: string, diff: string) => {
        try {
            setLoadingAI(prev => new Set(prev).add(filePath));

            const result = await aiService.reviewCode({
                diff,
                filePath
            });

            setAiReviews(prev => new Map(prev).set(filePath, result));
        } catch (error) {
            console.error('AI review failed:', error);
        } finally {
            setLoadingAI(prev => {
                const newSet = new Set(prev);
                newSet.delete(filePath);
                return newSet;
            });
        }
    };

    const getFileIcon = (type: string) => {
        switch (type) {
            case 'added':
                return (
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                );
            case 'removed':
                return (
                    <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                );
            case 'modified':
                return (
                    <svg className="w-4 h-4 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
                    </svg>
                );
            default:
                return null;
        }
    };

    const getFileTypeColor = (type: string) => {
        switch (type) {
            case 'added':
                return 'bg-green-100 text-green-800';
            case 'removed':
                return 'bg-red-100 text-red-800';
            case 'modified':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getScoreColor = (score: number): string => {
        if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
        if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
        return 'text-red-600 bg-red-50 border-red-200';
    };

    const getPriorityColor = (priority: string): string => {
        switch (priority) {
            case 'HIGH':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'MEDIUM':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'LOW':
                return 'bg-green-100 text-green-800 border-green-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-8">
                <div className="text-red-600 mb-2">{error}</div>
                <button
                    onClick={() => window.location.reload()}
                    className="text-blue-600 hover:underline"
                >
                    Try again
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                    File Changes ({fileChanges.length})
                </h3>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                        <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
                        <span>Added</span>
                    </div>
                    <div className="flex items-center space-x-1">
                        <div className="w-3 h-3 bg-yellow-100 border border-yellow-300 rounded"></div>
                        <span>Modified</span>
                    </div>
                    <div className="flex items-center space-x-1">
                        <div className="w-3 h-3 bg-red-100 border border-red-300 rounded"></div>
                        <span>Removed</span>
                    </div>
                </div>
            </div>

            {fileChanges.map((file, index) => {
                const aiReview = aiReviews.get(file.path);
                const isLoadingAI = loadingAI.has(file.path);

                return (
                    <div key={index} className="border border-gray-200 rounded-lg">
                        <button
                            onClick={() => toggleFileExpansion(file.path)}
                            className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    {getFileIcon(file.type)}
                                    <span className="font-medium text-gray-900">{file.path}</span>
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getFileTypeColor(file.type)}`}>
                                        {file.type}
                                    </span>
                                    {aiReview && (
                                        <div className={`px-2 py-1 text-xs font-medium rounded-full border ${getScoreColor(aiReview.overallScore)}`}>
                                            AI Score: {aiReview.overallScore}/100
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center space-x-4">
                                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                                        {file.linesAdded > 0 && (
                                            <span className="text-green-600">+{file.linesAdded}</span>
                                        )}
                                        {file.linesRemoved > 0 && (
                                            <span className="text-red-600">-{file.linesRemoved}</span>
                                        )}
                                    </div>
                                    <svg
                                        className={`w-4 h-4 text-gray-400 transform transition-transform duration-200 ${expandedFiles.has(file.path) ? 'rotate-180' : ''
                                            }`}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M19 9l-7 7-7-7"
                                        />
                                    </svg>
                                </div>
                            </div>
                        </button>

                        {expandedFiles.has(file.path) && file.diff && (
                            <div className="border-t border-gray-200">
                                {/* AI Review Section */}
                                <div className="bg-blue-50 border-b border-blue-200 p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="text-sm font-semibold text-blue-900 flex items-center">
                                            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            AI Code Review for {file.path}
                                        </h4>
                                        <button
                                            onClick={() => handleAIRefresh(file.path, file.diff || '')}
                                            disabled={isLoadingAI}
                                            className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isLoadingAI ? 'Reviewing...' : 'Review Code'}
                                        </button>
                                    </div>

                                    {aiReview && (
                                        <div className="space-y-3">
                                            {/* Overall Score */}
                                            <div className={`border rounded-lg p-3 ${getScoreColor(aiReview.overallScore)}`}>
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <h5 className="font-semibold">Overall Code Quality Score</h5>
                                                        <p className="text-sm opacity-75">
                                                            {file.path} • {aiReview.framework} • {aiReview.language}
                                                        </p>
                                                    </div>
                                                    <div className="text-2xl font-bold">
                                                        {aiReview.overallScore}/100
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Comments */}
                                            {aiReview.comments.length > 0 && (
                                                <div className="space-y-2">
                                                    <h6 className="text-sm font-semibold text-blue-900">Comments:</h6>
                                                    {aiReview.comments.map((comment, commentIndex) => (
                                                        <div key={commentIndex} className={`border rounded-lg p-3 ${getPriorityColor(comment.priority)}`}>
                                                            <div className="flex items-center justify-between mb-2">
                                                                <span className="text-xs font-semibold">
                                                                    {comment.priority} {comment.type}
                                                                </span>
                                                                {comment.lineNumber && (
                                                                    <span className="text-xs">Line {comment.lineNumber}</span>
                                                                )}
                                                            </div>
                                                            <p className="text-sm mb-2">{comment.message}</p>
                                                            {comment.suggestion && (
                                                                <p className="text-sm font-medium">
                                                                    💡 {comment.suggestion}
                                                                </p>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Diff Content */}
                                <div className="bg-gray-900">
                                    {/* File Header */}
                                    <div className="px-4 py-2 bg-gray-800 border-b border-gray-700 flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <span className="text-sm font-medium text-gray-300">{file.path}</span>
                                            <span className="text-xs text-gray-500">
                                                {file.linesAdded > 0 && <span className="text-green-400">+{file.linesAdded}</span>}
                                                {file.linesAdded > 0 && file.linesRemoved > 0 && <span className="text-gray-500 mx-1">,</span>}
                                                {file.linesRemoved > 0 && <span className="text-red-400">-{file.linesRemoved}</span>}
                                            </span>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <div className="text-xs text-gray-500">
                                                {file.type === 'added' && 'New file'}
                                                {file.type === 'modified' && 'Modified'}
                                                {file.type === 'removed' && 'Deleted'}
                                            </div>
                                            <button
                                                onClick={() => navigator.clipboard.writeText(file.diff || '')}
                                                className="text-gray-400 hover:text-gray-200 transition-colors"
                                                title="Copy diff to clipboard"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Diff Content with Inline Comments */}
                                    <div className="p-4 overflow-x-auto">
                                        <div className="text-sm font-mono">
                                            {file.diff.split('\n').map((line, index) => {
                                                const lineNumber = index + 1;
                                                let lineClass = 'text-gray-300';
                                                let bgClass = '';

                                                if (line.startsWith('+')) {
                                                    lineClass = 'text-green-400';
                                                    bgClass = 'bg-green-900/20';
                                                } else if (line.startsWith('-')) {
                                                    lineClass = 'text-red-400';
                                                    bgClass = 'bg-red-900/20';
                                                } else if (line.startsWith('@@')) {
                                                    lineClass = 'text-blue-400';
                                                    bgClass = 'bg-blue-900/20';
                                                } else if (line.startsWith('diff --git') || line.startsWith('index ') || line.startsWith('+++') || line.startsWith('---')) {
                                                    lineClass = 'text-gray-500';
                                                }

                                                // Check if there are AI comments for this line
                                                const lineComments = aiReview?.comments.filter(comment => comment.lineNumber === lineNumber) || [];

                                                return (
                                                    <div key={index} className={`flex ${bgClass} hover:bg-gray-800/50`}>
                                                        <div className="w-12 text-right pr-4 text-gray-500 select-none text-xs leading-5">
                                                            {lineNumber}
                                                        </div>
                                                        <div className={`flex-1 ${lineClass} leading-5 whitespace-pre`}>
                                                            {line}
                                                        </div>
                                                        {/* Inline AI Comments */}
                                                        {lineComments.length > 0 && (
                                                            <div className="ml-4 w-80">
                                                                {lineComments.map((comment, commentIndex) => (
                                                                    <div key={commentIndex} className={`mb-2 p-2 rounded border-l-4 ${getPriorityColor(comment.priority)}`}>
                                                                        <div className="flex items-center justify-between mb-1">
                                                                            <span className="text-xs font-semibold">
                                                                                {comment.priority} {comment.type}
                                                                            </span>
                                                                        </div>
                                                                        <p className="text-xs mb-1">{comment.message}</p>
                                                                        {comment.suggestion && (
                                                                            <p className="text-xs font-medium">
                                                                                💡 {comment.suggestion}
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default FileChangesWithAI;
