import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export interface CodeReviewComment {
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    type: 'BUG' | 'SECURITY' | 'PERFORMANCE' | 'MAINTAINABILITY' | 'STYLE' | 'ARCHITECTURE';
    lineNumber?: number;
    filePath?: string;
    message: string;
    suggestion?: string;
    category: 'UNUSED_VARIABLES' | 'COMPONENT_EXTRACTION' | 'CODE_ORGANIZATION' | 'BEST_PRACTICES' | 'SECURITY_ISSUE' | 'PERFORMANCE_ISSUE' | 'OTHER';
}

export interface CodeReviewSuggestions {
    immediateActions: string[];
    componentExtractions: string[];
    fileOrganizations: string[];
    bestPractices: string[];
    testingRecommendations: string[];
}

export interface SeverityBreakdown {
    high: number;
    medium: number;
    low: number;
    total: number;
}

export interface CodeReviewResponse {
    framework: string;
    language: string;
    overallScore: number;
    prOverview: {
        title: string;
        keyChanges: string[];
        impact: string;
        riskLevel: string;
    };
    severityBreakdown: SeverityBreakdown;
    comments: CodeReviewComment[];
    suggestions: CodeReviewSuggestions;
    summary: string;
}

export interface CodeReviewRequest {
    diff: string;
    filePath: string;
    framework?: string;
    language?: string;
}

class AIService {
    private getAuthHeaders() {
        const token = localStorage.getItem('bitbucket_access_token');
        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
    }

    /**
     * Perform global AI code review on entire PR
     */
    async reviewPullRequest(repository: string, prId: string): Promise<CodeReviewResponse> {
        try {
            const response = await axios.post(
                `${API_BASE_URL}/api/ai/review-pr`,
                { repository, prId },
                {
                    headers: this.getAuthHeaders()
                }
            );

            // Backend returns data directly, not wrapped in success/data structure
            if (response.data && response.data.overallScore !== undefined) {
                return response.data;
            } else if (response.data.success) {
                return response.data.data;
            } else {
                throw new Error(response.data.message || 'Failed to review PR');
            }
        } catch (error) {
            console.error('Error reviewing PR:', error);
            throw error;
        }
    }

    /**
     * Perform AI code review on a diff
     */
    async reviewCode(request: CodeReviewRequest): Promise<CodeReviewResponse> {
        try {
            const response = await axios.post(
                `${API_BASE_URL}/api/ai/review`,
                request,
                {
                    headers: this.getAuthHeaders()
                }
            );

            // Backend returns data directly, not wrapped in success/data structure
            if (response.data && response.data.overallScore !== undefined) {
                return response.data;
            } else if (response.data.success) {
                return response.data.data;
            } else {
                throw new Error(response.data.message || 'AI review failed');
            }
        } catch (error) {
            console.error('AI Review Error:', error);
            throw error;
        }
    }

    /**
     * Check AI service health
     */
    async checkHealth(): Promise<any> {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/ai/health`);
            return response.data;
        } catch (error) {
            console.error('AI Health Check Error:', error);
            throw error;
        }
    }

    /**
     * Get priority color for UI display
     */
    getPriorityColor(priority: 'HIGH' | 'MEDIUM' | 'LOW'): string {
        switch (priority) {
            case 'HIGH':
                return 'text-red-600 bg-red-50 border-red-200';
            case 'MEDIUM':
                return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            case 'LOW':
                return 'text-blue-600 bg-blue-50 border-blue-200';
            default:
                return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    }

    /**
     * Get type icon for UI display
     */
    getTypeIcon(type: string): string {
        switch (type) {
            case 'BUG':
                return '🐛';
            case 'SECURITY':
                return '🔒';
            case 'PERFORMANCE':
                return '⚡';
            case 'MAINTAINABILITY':
                return '🔧';
            case 'STYLE':
                return '🎨';
            case 'ARCHITECTURE':
                return '🏗️';
            default:
                return '💡';
        }
    }

    /**
     * Get category description
     */
    getCategoryDescription(category: string): string {
        switch (category) {
            case 'UNUSED_VARIABLES':
                return 'Remove unused variables, imports, or functions';
            case 'COMPONENT_EXTRACTION':
                return 'Extract reusable components or hooks';
            case 'CODE_ORGANIZATION':
                return 'Improve file structure and organization';
            case 'BEST_PRACTICES':
                return 'Follow framework and language best practices';
            case 'SECURITY_ISSUE':
                return 'Address security vulnerabilities';
            case 'PERFORMANCE_ISSUE':
                return 'Optimize performance bottlenecks';
            default:
                return 'General code improvement';
        }
    }
}

export default new AIService();
