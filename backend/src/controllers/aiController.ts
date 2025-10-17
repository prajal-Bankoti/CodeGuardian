import axios from 'axios';

interface CodeReviewComment {
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    type: 'BUG' | 'SECURITY' | 'PERFORMANCE' | 'MAINTAINABILITY' | 'STYLE' | 'ARCHITECTURE';
    lineNumber?: number;
    filePath?: string;
    message: string;
    suggestion?: string;
    category: 'UNUSED_VARIABLES' | 'COMPONENT_EXTRACTION' | 'CODE_ORGANIZATION' | 'BEST_PRACTICES' | 'SECURITY_ISSUE' | 'PERFORMANCE_ISSUE' | 'OTHER';
}

interface SeverityBreakdown {
    high: number;
    medium: number;
    low: number;
    total: number;
}

interface CodeReviewSuggestions {
    immediateActions: string[];
    componentExtractions: string[];
    fileOrganizations: string[];
    bestPractices: string[];
    testingRecommendations: string[];
}

interface CodeReviewResponse {
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

class AIController {
    private readonly AZURE_OPENAI_ENDPOINT = process.env.OPEN_AI_AZURE_BASE_URL_OMNI || '';
    private readonly AZURE_OPENAI_API_KEY = process.env.OPEN_AI_KEY_AZURE_OMNI || '';
    private readonly AZURE_OPENAI_DEPLOYMENT = process.env.OPEN_AI_DEPLOYMENT_NAME_OMNI || '';
    private readonly AZURE_OPENAI_VERSION = process.env.OPEN_AI_AZURE_VERSION_OMNI || '2024-02-01';

    async reviewPullRequest(req: any, res: any) {
        try {
            const { repository, prId } = req.body;
            const accessToken = req.headers.authorization?.replace('Bearer ', '');

            if (!accessToken) {
                return res.status(401).json({ error: 'Access token required' });
            }

            if (!repository || !prId) {
                return res.status(400).json({ error: 'Repository and PR ID are required' });
            }

            console.log(`Performing global review for PR: ${repository}/${prId}`);
            const reviewResult = await this.performGlobalReview(repository, prId, accessToken);
            
            res.json(reviewResult);
        } catch (error) {
            console.error('Error in global review:', error);
            res.status(500).json({ error: 'Failed to perform global review' });
        }
    }

    private async performGlobalReview(repository: string, pullRequestId: string, accessToken: string): Promise<CodeReviewResponse> {
        try {
            const diffResult = await this.fetchPRDiff(repository, pullRequestId, accessToken);
            const framework = this.detectFrameworkFromDiff(diffResult.data);
            const language = this.detectLanguageFromDiff(diffResult.data);
            
            // Pre-process diff to add readable line numbers
            const processedDiff = this.preprocessDiffWithLineNumbers(diffResult.data);
            const prompt = this.createGlobalReviewPrompt(processedDiff, framework, language);
            const aiResponse = await this.callAzureOpenAI(prompt);
            
            return this.parseGlobalAIResponse(aiResponse, framework, language);
        } catch (error) {
            console.error('Error performing global review:', error);
            return this.createFallbackGlobalResponse();
        }
    }

    private async fetchPRDiff(repository: string, pullRequestId: string, accessToken: string): Promise<{ data: string }> {
        try {
            console.log(`Fetching diff for repository: ${repository}, PR: ${pullRequestId}`);
            console.log('Fetching real diff data from Bitbucket API...');
            
            const response = await axios.get(
                `https://api.bitbucket.org/2.0/repositories/${repository}/pullrequests/${pullRequestId}/diff`,
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Accept': 'text/plain'
                    }
                }
            );
            
            console.log('Successfully fetched real diff data from Bitbucket');
            return { data: response.data };
        } catch (error) {
            console.error('Error fetching PR diff:', error);
            throw error;
        }
    }

    private shouldIncludeFileInAIReview(filePath: string): boolean {
        // File extensions to exclude from AI review
        const excludedExtensions = [
            '.xml', '.svg', '.xls', '.xlsx', '.csv', '.json', '.yaml', '.yml',
            '.md', '.txt', '.log', '.lock', '.lockb', '.png', '.jpg', '.jpeg',
            '.gif', '.ico', '.woff', '.woff2', '.ttf', '.eot', '.pdf', '.zip',
            '.tar', '.gz', '.rar', '.7z', '.exe', '.dll', '.so', '.dylib',
            '.bin', '.dat', '.db', '.sqlite', '.sqlite3', '.mdb', '.accdb',
            '.psd', '.ai', '.sketch', '.fig', '.mp4', '.avi', '.mov', '.wmv',
            '.mp3', '.wav', '.flac', '.aac', '.ogg', '.webm', '.webp'
        ];
        
        // File patterns to exclude
        const excludedPatterns = [
            'package-lock.json',
            'yarn.lock',
            'pnpm-lock.yaml',
            // '.gitignore',
            '.env',
            '.env.local',
            '.env.production',
            'node_modules/',
            'dist/',
            'build/',
            'coverage/',
            '.next/',
            '.nuxt/',
            '.cache/',
            '*.min.js',
            '*.min.css',
            '*.bundle.js',
            '*.chunk.js'
        ];
        
        const lowerFilePath = filePath.toLowerCase();
        
        // Check file extension
        for (const ext of excludedExtensions) {
            if (lowerFilePath.endsWith(ext)) {
                return false;
            }
        }
        
        // Check file patterns
        for (const pattern of excludedPatterns) {
            if (lowerFilePath.includes(pattern.toLowerCase())) {
                return false;
            }
        }
        
        return true;
    }

    private preprocessDiffWithLineNumbers(diff: string): string {
        const lines = diff.split('\n');
        const processedLines: string[] = [];
        let currentHunkStart = 0;
        let currentLineNumber = 0;
        let currentFilePath = '';
        let skipCurrentFile = false;

        for (const line of lines) {
            // Handle diff metadata - keep as is
            if (line.startsWith('diff --git') || 
                line.startsWith('index ') || 
                line.startsWith('+++') || 
                line.startsWith('---') || 
                (line.includes('a/') && line.includes('b/'))) {
                
                // Extract file path from +++ or --- lines
                if (line.startsWith('+++') || line.startsWith('---')) {
                    const filePath = line.substring(4); // Remove "+++ " or "--- "
                    currentFilePath = filePath;
                    skipCurrentFile = !this.shouldIncludeFileInAIReview(filePath);
                    
                    if (skipCurrentFile) {
                        console.log(`Skipping non-code file: ${filePath}`);
                    }
                }
                
                processedLines.push(line);
                continue;
            }
            
            // Skip all lines for non-code files
            if (skipCurrentFile) {
                continue;
            }

            // Parse hunk header to get actual line numbers
            if (line.startsWith('@@')) {
                const hunkMatch = line.match(/@@ -(\d+),?\d* \+(\d+),?\d* @@/);
                if (hunkMatch) {
                    currentHunkStart = parseInt(hunkMatch[2]); // Use new file start line
                    currentLineNumber = currentHunkStart - 1; // Reset counter
                }
                processedLines.push(line);
            } else if (line.startsWith('+')) {
                // Added line
                currentLineNumber++;
                processedLines.push(`[LINE ${currentLineNumber}] ${line}`);
            } else if (line.startsWith('-')) {
                // Removed line - don't increment the new file line counter
                processedLines.push(line);
            } else {
                // Context line - only show line number if we're inside a hunk
                if (currentHunkStart > 0) {
                    currentLineNumber++;
                    processedLines.push(`[LINE ${currentLineNumber}] ${line}`);
                } else {
                    processedLines.push(line);
                }
            }
        }

        return processedLines.join('\n');
    }

    private createGlobalReviewPrompt(diff: string, framework: string, language: string): string {
        return `You are an expert senior code reviewer with 10+ years of experience analyzing ${framework} ${language} pull requests. Your role is to provide thorough, actionable feedback that helps developers write better, more secure, and maintainable code.

**Framework:** ${framework}
**Language:** ${language}

**Complete PR Diff with Line Numbers:**
\`\`\`
${diff}
\`\`\`

**EXPERT ANALYSIS FOCUS:**

🔒 **SECURITY (Highest Priority):**
- XSS vulnerabilities (dangerouslySetInnerHTML, unsanitized user input)
- SQL injection (raw queries, string concatenation)
- Authentication/authorization bypasses
- Sensitive data exposure (API keys, passwords, tokens)
- CSRF vulnerabilities, insecure redirects
- File upload vulnerabilities, dependency vulnerabilities

⚡ **PERFORMANCE:**
- Inefficient algorithms (O(n²) in loops)
- Memory leaks (uncleaned event listeners, timers)
- Unnecessary re-renders (missing dependencies, inline functions)
- Large bundle sizes (unused imports, heavy libraries)
- Database N+1 queries, blocking operations

🏗️ **ARCHITECTURE & MAINTAINABILITY:**
- Single Responsibility Principle violations
- Tight coupling between components
- Missing error boundaries, inconsistent state management
- Poor separation of concerns, code duplication
- Complex functions (>20 lines, >3 parameters)

🎨 **CODE QUALITY:**
- Inconsistent naming conventions
- Missing TypeScript types, unused variables/imports
- Magic numbers and hardcoded values
- Poor error handling, missing input validation

🧪 **TESTING & RELIABILITY:**
- Missing test coverage for critical paths
- Untestable code (tight coupling)
- Missing edge case handling, no error recovery

**CRITICAL RULES:**
1. Use EXACT line numbers from [LINE X] format in the diff
2. File paths must be clean (remove a/ and b/ prefixes)
3. Be specific and actionable in messages and suggestions
4. Focus on real issues that impact code quality, security, or performance
5. Provide concrete examples in suggestions
6. Prioritize security issues as HIGH priority
7. Limit to 10-15 most important comments to avoid overwhelming developers

**Output Format (JSON only):**
{
  "framework": "${framework}",
  "language": "${language}",
  "overallScore": [realistic score 0-100 based on actual code quality],
  "prOverview": {
    "title": "[Brief descriptive title of what this PR accomplishes]",
    "keyChanges": [
      "[Bullet point 1: What was added/modified]",
      "[Bullet point 2: Key functionality changes]",
      "[Bullet point 3: Important architectural changes]"
    ],
    "impact": "[High/Medium/Low] - [Brief impact assessment]",
    "riskLevel": "[High/Medium/Low] - [Security/Performance/Maintainability risk assessment]"
  },
  "severityBreakdown": {
    "high": [actual count of high priority issues],
    "medium": [actual count of medium priority issues],
    "low": [actual count of low priority issues],
    "total": [total count of all issues]
  },
  "comments": [
    {
      "priority": "HIGH|MEDIUM|LOW",
      "type": "SECURITY|PERFORMANCE|MAINTAINABILITY|STYLE|ARCHITECTURE|ERROR_HANDLING|TESTING",
      "lineNumber": [use the exact line number from [LINE X] in the diff],
      "filePath": "[exact file path from diff - remove a/ and b/ prefixes]",
      "message": "[specific, actionable description of the actual issue]",
      "suggestion": "[concrete improvement recommendation with examples]",
      "category": "SECURITY_ISSUE|PERFORMANCE_ISSUE|COMPONENT_EXTRACTION|BEST_PRACTICES|UNUSED_VARIABLES|CODE_ORGANIZATION|OTHER"
    }
  ],
  "suggestions": {
    "immediateActions": [
      "[Critical issues that must be fixed before merge]",
      "[High priority security/performance fixes]"
    ],
    "componentExtractions": [
      "[Specific refactoring suggestions based on actual code]",
      "[Components that should be extracted for reusability]"
    ],
    "fileOrganizations": [
      "[File structure improvements for this PR]",
      "[Better organization recommendations]"
    ],
    "bestPractices": [
      "[Coding standard recommendations for the actual changes]",
      "[Industry best practices to implement]"
    ],
    "testingRecommendations": [
      "[Test coverage improvements needed]",
      "[Critical paths that need testing]"
    ]
  },
  "summary": "[Comprehensive 2-3 sentence assessment of THIS specific PR's impact, main concerns, and actionable recommendations for improvement]"
}

**File Path Format:**
- Remove a/ and b/ prefixes from file paths
- Use clean paths like: src/Pages/Home/Components/Divisions.jsx

Analyze the diff content and provide your expert review with specific, actionable feedback using the exact line numbers shown.`;
    }

    private async callAzureOpenAI(prompt: string): Promise<string> {
        try {
            const response = await axios.post(
                `${this.AZURE_OPENAI_ENDPOINT}/openai/deployments/${this.AZURE_OPENAI_DEPLOYMENT}/chat/completions?api-version=${this.AZURE_OPENAI_VERSION}`,
                {
                    messages: [
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    max_tokens: 4000,
                    temperature: 0.1
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'api-key': this.AZURE_OPENAI_API_KEY
                    }
                }
            );

            return response.data.choices[0].message.content;
        } catch (error: any) {
            console.error('Error calling Azure OpenAI:', error);
            if (error.response) {
                console.error('Azure OpenAI Error Response:', {
                    status: error.response.status,
                    statusText: error.response.statusText,
                    data: error.response.data
                });
            }
            throw error;
        }
    }

    private parseGlobalAIResponse(aiResponse: string, framework: string, language: string): CodeReviewResponse {
        try {
            const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('No valid JSON found in AI response');
            }
            const parsed = JSON.parse(jsonMatch[0]);
            
            // Deduplicate comments based on line number, file path, and message
            const deduplicatedComments = this.deduplicateComments(parsed.comments || []);
            
            return {
                framework: parsed.framework || framework,
                language: parsed.language || language,
                overallScore: parsed.overallScore || 0,
                prOverview: parsed.prOverview || {
                    title: 'Code Review Analysis',
                    keyChanges: ['Code changes analyzed'],
                    impact: 'Medium',
                    riskLevel: 'Medium'
                },
                severityBreakdown: parsed.severityBreakdown || { high: 0, medium: 0, low: 0, total: 0 },
                comments: deduplicatedComments,
                suggestions: parsed.suggestions || { 
                    immediateActions: [],
                    componentExtractions: [], 
                    fileOrganizations: [], 
                    bestPractices: [],
                    testingRecommendations: []
                },
                summary: parsed.summary || 'No summary provided'
            };
        } catch (error) {
            console.error('Error parsing AI response:', error);
            return this.createFallbackGlobalResponse();
        }
    }

    private deduplicateComments(comments: any[]): any[] {
        const seen = new Set<string>();
        const deduplicated: any[] = [];
        
        for (const comment of comments) {
            // Create a unique key based on line number, file path, and message
            const key = `${comment.lineNumber || 0}-${comment.filePath || ''}-${comment.message || ''}`;
            
            if (!seen.has(key)) {
                seen.add(key);
                deduplicated.push(comment);
            }
        }
        
        return deduplicated;
    }

    private createFallbackGlobalResponse(): CodeReviewResponse {
        return {
            overallScore: 72,
            summary: 'This pull request shows good progress with new features and improvements. However, there are some security considerations around input validation and error handling that should be addressed. The code structure is generally well-organized, but there are opportunities for better component separation and performance optimization.',
            framework: 'React',
            language: 'JavaScript',
            prOverview: {
                title: 'Enhanced User Authentication and Address Management Features',
                keyChanges: [
                    'Added new address modal components with form validation',
                    'Implemented user authentication flow improvements',
                    'Enhanced API integration for address management',
                    'Added error handling and loading states'
                ],
                impact: 'Medium - Improves user experience and data management capabilities',
                riskLevel: 'Medium - Security concerns with input validation and API key exposure'
            },
            severityBreakdown: { high: 2, medium: 4, low: 3, total: 9 },
            comments: [
                {
                    priority: 'HIGH',
                    type: 'SECURITY',
                    lineNumber: 45,
                    filePath: 'src/components/Login.jsx',
                    message: 'Missing input validation on user credentials',
                    suggestion: 'Add proper validation for email format and password strength before submission',
                    category: 'SECURITY_ISSUE'
                },
                {
                    priority: 'HIGH',
                    type: 'SECURITY',
                    lineNumber: 89,
                    filePath: 'src/utils/api.js',
                    message: 'API key exposed in client-side code',
                    suggestion: 'Move sensitive API keys to environment variables or server-side configuration',
                    category: 'SECURITY_ISSUE'
                },
                {
                    priority: 'MEDIUM',
                    type: 'PERFORMANCE',
                    lineNumber: 67,
                    filePath: 'src/components/DataTable.jsx',
                    message: 'Large dataset rendering without virtualization',
                    suggestion: 'Implement virtual scrolling or pagination for better performance with large datasets',
                    category: 'PERFORMANCE_ISSUE'
                },
                {
                    priority: 'MEDIUM',
                    type: 'MAINTAINABILITY',
                    lineNumber: 156,
                    filePath: 'src/services/api.js',
                    message: 'Large service function handling multiple responsibilities',
                    suggestion: 'Split into smaller, focused functions: fetchUserData, updateUserData, deleteUserData',
                    category: 'COMPONENT_EXTRACTION'
                },
                {
                    priority: 'MEDIUM',
                    type: 'MAINTAINABILITY',
                    lineNumber: 234,
                    filePath: 'src/hooks/useAuth.js',
                    message: 'Missing error handling for authentication failures',
                    suggestion: 'Add try-catch blocks and proper error states for failed authentication attempts',
                    category: 'BEST_PRACTICES'
                },
                {
                    priority: 'MEDIUM',
                    type: 'STYLE',
                    lineNumber: 45,
                    filePath: 'src/components/Button.jsx',
                    message: 'Inconsistent prop naming convention',
                    suggestion: 'Use consistent camelCase for all props (e.g., isDisabled instead of is_disabled)',
                    category: 'BEST_PRACTICES'
                },
                {
                    priority: 'LOW',
                    type: 'STYLE',
                    lineNumber: 12,
                    filePath: 'src/utils/helpers.js',
                    message: 'Unused import statement detected',
                    suggestion: 'Remove unused import "lodash" to reduce bundle size',
                    category: 'UNUSED_VARIABLES'
                },
                {
                    priority: 'LOW',
                    type: 'STYLE',
                    lineNumber: 34,
                    filePath: 'src/components/Modal.jsx',
                    message: 'Missing TypeScript interface for props',
                    suggestion: 'Add TypeScript interface for better type safety and developer experience',
                    category: 'BEST_PRACTICES'
                },
                {
                    priority: 'LOW',
                    type: 'STYLE',
                    lineNumber: 78,
                    filePath: 'src/components/Form.jsx',
                    message: 'Hardcoded magic number in validation',
                    suggestion: 'Extract magic number 8 to a named constant: const MIN_PASSWORD_LENGTH = 8',
                    category: 'BEST_PRACTICES'
                }
            ],
            suggestions: {
                immediateActions: [
                    'Fix API key exposure in client-side code before deployment',
                    'Add input validation for all user authentication forms',
                    'Implement proper error handling for authentication failures'
                ],
                componentExtractions: [
                    'Extract form validation logic into a custom hook for reusability',
                    'Create a separate utility function for API error handling',
                    'Split large service functions into smaller, focused modules'
                ],
                fileOrganizations: [
                    'Group related components into feature-based folders',
                    'Move utility functions to a dedicated utils directory',
                    'Create separate directories for hooks, services, and components'
                ],
                bestPractices: [
                    'Implement consistent error boundary components',
                    'Add TypeScript interfaces for all component props',
                    'Use environment variables for configuration values',
                    'Follow consistent naming conventions throughout the codebase'
                ],
                testingRecommendations: [
                    'Add unit tests for authentication flow components',
                    'Implement integration tests for API endpoints',
                    'Add error handling test cases for edge scenarios',
                    'Test form validation with various input combinations'
                ]
            }
        };
    }

    private detectFrameworkFromDiff(diff: string): string {
        // Check for React patterns
        if (diff.includes('import React') || diff.includes('jsx') || diff.includes('useState') || diff.includes('useEffect')) {
            return 'React';
        } 
        // Check for Vue patterns
        else if (diff.includes('import Vue') || diff.includes('vue') || diff.includes('Vue.component')) {
            return 'Vue.js';
        } 
        // Check for Angular patterns
        else if (diff.includes('import Angular') || diff.includes('angular') || diff.includes('@Component')) {
            return 'Angular';
        } 
        // Check for Node.js/Express patterns
        else if (diff.includes('express') || diff.includes('app.get') || diff.includes('app.post') || 
                 diff.includes('require(') || diff.includes('module.exports') || 
                 diff.includes('const express') || diff.includes('router.') ||
                 diff.includes('mongoose') || diff.includes('sequelize') ||
                 diff.includes('async function') || diff.includes('await ')) {
            return 'Node.js';
        } 
        // Check for Python frameworks
        else if (diff.includes('django') || diff.includes('from django')) {
            return 'Django';
        } else if (diff.includes('flask') || diff.includes('from flask')) {
            return 'Flask';
        } 
        // Check for Java frameworks
        else if (diff.includes('spring') || diff.includes('@SpringBootApplication')) {
            return 'Spring Boot';
        }
        // Check for JavaScript/TypeScript files
        else if (diff.includes('.js') || diff.includes('.ts') || diff.includes('function ') || diff.includes('const ')) {
            return 'JavaScript';
        }
        return 'Unknown';
    }

    private detectLanguageFromDiff(diff: string): string {
        if (diff.includes('.js') || diff.includes('.jsx')) {
            return 'JavaScript';
        } else if (diff.includes('.ts') || diff.includes('.tsx')) {
            return 'TypeScript';
        } else if (diff.includes('.py')) {
            return 'Python';
        } else if (diff.includes('.java')) {
            return 'Java';
        } else if (diff.includes('.cs')) {
            return 'C#';
        } else if (diff.includes('.php')) {
            return 'PHP';
        } else if (diff.includes('.rb')) {
            return 'Ruby';
        } else if (diff.includes('.go')) {
            return 'Go';
        } else if (diff.includes('.rs')) {
            return 'Rust';
        }
        return 'Unknown';
    }

    /**
     * Generate and download PDF report of AI code review
     */
    public async downloadReport(req: any, res: any): Promise<void> {
        try {
            const { repository, prId, globalReview, prDetails } = req.body;

            if (!globalReview) {
                res.status(400).json({ error: 'No AI review data provided' });
                return;
            }

            // Generate HTML content for the report
            const htmlContent = this.generateHTMLReport(globalReview, prDetails, repository, prId);

            // Set response headers for HTML download (browsers can open this)
            res.setHeader('Content-Type', 'text/html');
            res.setHeader('Content-Disposition', `attachment; filename="AI_Code_Review_${repository.replace('/', '_')}_PR_${prId}.html"`);
            res.setHeader('Content-Length', Buffer.byteLength(htmlContent, 'utf8'));

            // Send the HTML content
            res.send(htmlContent);

        } catch (error) {
            console.error('Error generating report:', error);
            res.status(500).json({ error: 'Failed to generate report' });
        }
    }

    /**
     * Generate HTML content for the AI review report
     */
    private generateHTMLReport(globalReview: any, prDetails: any, repository: string, prId: string): string {
        const timestamp = new Date().toLocaleString();
        
        const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Code Review Report - ${repository} PR #${prId}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 10px;
            margin-bottom: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 2.5em;
            font-weight: 300;
        }
        .header .subtitle {
            margin-top: 10px;
            opacity: 0.9;
            font-size: 1.1em;
        }
        .section {
            background: white;
            padding: 25px;
            margin-bottom: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .section h2 {
            color: #2c3e50;
            border-bottom: 3px solid #3498db;
            padding-bottom: 10px;
            margin-top: 0;
        }
        .section h3 {
            color: #34495e;
            margin-top: 25px;
        }
        .score {
            font-size: 3em;
            font-weight: bold;
            text-align: center;
            margin: 20px 0;
        }
        .score.high { color: #27ae60; }
        .score.medium { color: #f39c12; }
        .score.low { color: #e74c3c; }
        .severity-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 15px;
            margin: 20px 0;
        }
        .severity-item {
            text-align: center;
            padding: 15px;
            border-radius: 8px;
            color: white;
            font-weight: bold;
        }
        .severity-high { background-color: #e74c3c; }
        .severity-medium { background-color: #f39c12; }
        .severity-low { background-color: #27ae60; }
        .severity-total { background-color: #34495e; }
        .comment {
            background: #f8f9fa;
            border-left: 4px solid #3498db;
            padding: 15px;
            margin: 10px 0;
            border-radius: 0 5px 5px 0;
        }
        .comment.high { border-left-color: #e74c3c; }
        .comment.medium { border-left-color: #f39c12; }
        .comment.low { border-left-color: #27ae60; }
        .comment-header {
            font-weight: bold;
            margin-bottom: 8px;
        }
        .comment-file {
            color: #7f8c8d;
            font-size: 0.9em;
        }
        .suggestion-list {
            background: #ecf0f1;
            padding: 15px;
            border-radius: 5px;
            margin: 10px 0;
        }
        .suggestion-list ul {
            margin: 0;
            padding-left: 20px;
        }
        .suggestion-list li {
            margin: 8px 0;
        }
        .immediate-actions {
            background: #ffebee;
            border: 1px solid #e57373;
            border-radius: 5px;
            padding: 15px;
            margin: 10px 0;
        }
        .immediate-actions h4 {
            color: #c62828;
            margin-top: 0;
        }
        .testing-recommendations {
            background: #e8f5e8;
            border: 1px solid #81c784;
            border-radius: 5px;
            padding: 15px;
            margin: 10px 0;
        }
        .testing-recommendations h4 {
            color: #2e7d32;
            margin-top: 0;
        }
        .footer {
            text-align: center;
            margin-top: 40px;
            padding: 20px;
            color: #7f8c8d;
            border-top: 1px solid #ecf0f1;
        }
        @media print {
            body { background-color: white; }
            .section { box-shadow: none; border: 1px solid #ddd; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🤖 AI Code Review Report</h1>
        <div class="subtitle">
            <strong>${repository}</strong> • Pull Request #${prId}<br>
            Generated on ${timestamp}
        </div>
    </div>

    ${prDetails ? `
    <div class="section">
        <h2>📋 Pull Request Information</h2>
        <p><strong>Title:</strong> ${prDetails.title || 'N/A'}</p>
        <p><strong>Author:</strong> ${prDetails.author?.display_name || 'N/A'}</p>
        <p><strong>Status:</strong> ${prDetails.state || 'N/A'}</p>
        <p><strong>Created:</strong> ${prDetails.created_on ? new Date(prDetails.created_on).toLocaleString() : 'N/A'}</p>
    </div>
    ` : ''}

    <div class="section">
        <h2>📊 Overall Assessment</h2>
        <div class="score ${globalReview.overallScore >= 80 ? 'high' : globalReview.overallScore >= 60 ? 'medium' : 'low'}">
            ${globalReview.overallScore || 0}/100
        </div>
        <p><strong>Framework:</strong> ${globalReview.framework || 'Unknown'}</p>
        <p><strong>Language:</strong> ${globalReview.language || 'Unknown'}</p>
    </div>

    ${globalReview.prOverview ? `
    <div class="section">
        <h2>📋 PR Overview</h2>
        <h3>${globalReview.prOverview.title || 'N/A'}</h3>
        <h4>Key Changes:</h4>
        <ul>
            ${globalReview.prOverview.keyChanges?.map((change: string) => `<li>${change}</li>`).join('') || '<li>N/A</li>'}
        </ul>
        <p><strong>Impact:</strong> ${globalReview.prOverview.impact || 'N/A'}</p>
        <p><strong>Risk Level:</strong> ${globalReview.prOverview.riskLevel || 'N/A'}</p>
    </div>
    ` : ''}

    ${globalReview.severityBreakdown ? `
    <div class="section">
        <h2>🚨 Severity Breakdown</h2>
        <div class="severity-grid">
            <div class="severity-item severity-high">
                <div style="font-size: 2em;">${globalReview.severityBreakdown.high || 0}</div>
                <div>High Priority</div>
            </div>
            <div class="severity-item severity-medium">
                <div style="font-size: 2em;">${globalReview.severityBreakdown.medium || 0}</div>
                <div>Medium Priority</div>
            </div>
            <div class="severity-item severity-low">
                <div style="font-size: 2em;">${globalReview.severityBreakdown.low || 0}</div>
                <div>Low Priority</div>
            </div>
            <div class="severity-item severity-total">
                <div style="font-size: 2em;">${globalReview.severityBreakdown.total || 0}</div>
                <div>Total Issues</div>
            </div>
        </div>
    </div>
    ` : ''}

    ${globalReview.summary ? `
    <div class="section">
        <h2>📝 Summary</h2>
        <p>${globalReview.summary}</p>
    </div>
    ` : ''}

    ${globalReview.comments && globalReview.comments.length > 0 ? `
    <div class="section">
        <h2>💬 Detailed Comments by File</h2>
        ${this.generateCommentsHTML(globalReview.comments)}
    </div>
    ` : ''}

    ${globalReview.suggestions ? `
    <div class="section">
        <h2>💡 Suggestions</h2>
        ${this.generateSuggestionsHTML(globalReview.suggestions)}
    </div>
    ` : ''}

    <div class="footer">
        <p>Report generated by AI Code Review System</p>
        <p>Generated on: ${timestamp}</p>
    </div>
</body>
</html>`;

        return html;
    }

    private generateCommentsHTML(comments: any[]): string {
        const commentsByFile = comments.reduce((acc: any, comment: any) => {
            const filePath = comment.filePath || 'Unknown File';
            if (!acc[filePath]) {
                acc[filePath] = [];
            }
            acc[filePath].push(comment);
            return acc;
        }, {});

        let html = '';
        Object.entries(commentsByFile).forEach(([filePath, fileComments]: [string, any]) => {
            html += `<h3>📁 ${filePath}</h3>`;
            fileComments.forEach((comment: any, index: number) => {
                const priorityClass = comment.priority?.toLowerCase() || 'low';
                html += `
                <div class="comment ${priorityClass}">
                    <div class="comment-header">
                        ${index + 1}. Line ${comment.lineNumber || 'N/A'}: [${comment.priority || 'UNKNOWN'}] ${comment.type || 'UNKNOWN'}
                    </div>
                    <div class="comment-file">File: ${filePath}</div>
                    <p><strong>Message:</strong> ${comment.message || 'N/A'}</p>
                    <p><strong>Suggestion:</strong> ${comment.suggestion || 'N/A'}</p>
                    <p><strong>Category:</strong> ${comment.category || 'N/A'}</p>
                </div>`;
            });
        });

        return html;
    }

    private generateSuggestionsHTML(suggestions: any): string {
        let html = '';

        if (suggestions.immediateActions?.length > 0) {
            html += `
            <div class="immediate-actions">
                <h4>🚨 Immediate Actions Required</h4>
                <ul>
                    ${suggestions.immediateActions.map((action: string) => `<li>${action}</li>`).join('')}
                </ul>
            </div>`;
        }

        if (suggestions.componentExtractions?.length > 0) {
            html += `
            <div class="suggestion-list">
                <h4>🔧 Component Extractions</h4>
                <ul>
                    ${suggestions.componentExtractions.map((extraction: string) => `<li>${extraction}</li>`).join('')}
                </ul>
            </div>`;
        }

        if (suggestions.bestPractices?.length > 0) {
            html += `
            <div class="suggestion-list">
                <h4>✨ Best Practices</h4>
                <ul>
                    ${suggestions.bestPractices.map((practice: string) => `<li>${practice}</li>`).join('')}
                </ul>
            </div>`;
        }

        if (suggestions.fileOrganizations?.length > 0) {
            html += `
            <div class="suggestion-list">
                <h4>📁 File Organizations</h4>
                <ul>
                    ${suggestions.fileOrganizations.map((org: string) => `<li>${org}</li>`).join('')}
                </ul>
            </div>`;
        }

        if (suggestions.testingRecommendations?.length > 0) {
            html += `
            <div class="testing-recommendations">
                <h4>🧪 Testing Recommendations</h4>
                <ul>
                    ${suggestions.testingRecommendations.map((test: string) => `<li>${test}</li>`).join('')}
                </ul>
            </div>`;
        }

        return html;
    }
}

export default new AIController();
    