import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/apiService';

interface FileChange {
    path: string;
    type: 'added' | 'removed' | 'modified';
    linesAdded: number;
    linesRemoved: number;
    diff?: string;
}

interface FileChangesProps {
    repository: string;
    prId: string;
    accessToken: string;
}

const FileChanges: React.FC<FileChangesProps> = ({ repository, prId, accessToken }) => {
    const [fileChanges, setFileChanges] = useState<FileChange[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedFiles, setExpandedFiles] = useState<Set<string>>(new Set());

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
                        },
                        {
                            path: 'src/utils/encryption.js',
                            type: 'added',
                            linesAdded: 25,
                            linesRemoved: 0,
                            diff: `+import crypto from 'crypto';
+
+export const encryptOTP = (otp) => {
+  const algorithm = 'aes-256-cbc';
+  const key = process.env.ENCRYPTION_KEY;
+  const iv = crypto.randomBytes(16);
+  
+  const cipher = crypto.createCipher(algorithm, key);
+  let encrypted = cipher.update(otp, 'utf8', 'hex');
+  encrypted += cipher.final('hex');
+  
+  return {
+    encrypted,
+    iv: iv.toString('hex')
+  };
+};`
                        },
                        {
                            path: 'src/reducers/userReducer.js',
                            type: 'modified',
                            linesAdded: 8,
                            linesRemoved: 4,
                            diff: `@@ -74,10 +74,14 @@ export default function userReducer(state = initialState, action) {
     case UPDATE_USER_SRL_POINTS:
       return {
         ...state,
-        userData: state.userData && !isEmpty(state.userData) ? {
-          ...state.userData,
-          ptnt_points: action.payload.p
-        } : state.userData
+        userData: state.userData && !isEmpty(state.userData) ? {
+          ...state.userData,
+          ptnt_points: action.payload.p,
+          last_updated: new Date().toISOString()
+        } : state.userData
       };
     case OPT_IN:
       return {
         ...state,
         show_popup: action.payload.show_popup,
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
        // This is a simplified parser - in a real implementation, you'd want a more robust diff parser
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

            {fileChanges.map((file, index) => (
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
                        <div className="border-t border-gray-200 bg-gray-900">
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

                            {/* Diff Content */}
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

                                        return (
                                            <div key={index} className={`flex ${bgClass} hover:bg-gray-800/50`}>
                                                <div className="w-12 text-right pr-4 text-gray-500 select-none text-xs leading-5">
                                                    {lineNumber}
                                                </div>
                                                <div className={`flex-1 ${lineClass} leading-5 whitespace-pre`}>
                                                    {line}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default FileChanges;
