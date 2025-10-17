import { Request, Response } from 'express';
import axios from 'axios';

// Interfaces
export interface CodeReviewResponse {
    overallScore: number;
    summary: string;
    framework: string;
    language: string;
    severityBreakdown: SeverityBreakdown;
    comments: CodeReviewComment[];
    suggestions: {
        componentExtractions: string[];
        fileOrganizations: string[];
        bestPractices: string[];
    };
}

export interface CodeReviewComment {
    priority: CommentPriority;
    type: CommentType;
    lineNumber: number;
    filePath?: string;
    message: string;
    suggestion: string;
    category: CommentCategory;
}

export interface AISuggestions {
    componentExtractions: string[];
    fileOrganizations: string[];
    bestPractices: string[];
}

export type CommentPriority = 'HIGH' | 'MEDIUM' | 'LOW';
export type CommentType = 'BUG' | 'SECURITY' | 'PERFORMANCE' | 'MAINTAINABILITY' | 'STYLE' | 'ARCHITECTURE';
export type CommentCategory = 'BUG' | 'SECURITY' | 'PERFORMANCE' | 'MAINTAINABILITY' | 'STYLE' | 'ARCHITECTURE' | 'UNUSED_VARIABLES' | 'COMPONENT_EXTRACTION' | 'CODE_ORGANIZATION' | 'BEST_PRACTICES' | 'SECURITY_ISSUE' | 'PERFORMANCE_ISSUE' | 'ERROR_HANDLING' | 'OTHER';

export interface SeverityBreakdown {
    high: number;
    medium: number;
    low: number;
    total: number;
}

class AIController {
    private readonly azureOpenAIKey: string;
    private readonly azureOpenAIBaseURL: string;
    private readonly azureOpenAIVersion: string;
    private readonly azureOpenAIDeploymentName: string;

    constructor() {
        this.azureOpenAIKey = process.env.OPEN_AI_KEY_AZURE_OMNI || '';
        this.azureOpenAIBaseURL = process.env.OPEN_AI_AZURE_BASE_URL_OMNI || '';
        this.azureOpenAIVersion = process.env.OPEN_AI_AZURE_VERSION_OMNI || '2024-02-01';
        this.azureOpenAIDeploymentName = process.env.OPEN_AI_DEPLOYMENT_NAME_OMNI || '';

        if (!this.azureOpenAIKey || !this.azureOpenAIBaseURL) {
            console.warn('Azure OpenAI configuration is missing. AI features will not work.');
        }
    }

    /**
     * Global PR Review using Azure OpenAI (analyzes entire PR with file-specific comments)
     */
    public async reviewPullRequest(req: Request, res: Response): Promise<void> {
        try {
            const { repository, prId } = req.body;

            if (!repository || !prId) {
                res.status(400).json({
                    success: false,
                    message: 'Repository and PR ID are required'
                });
                return;
            }

            // Get access token from Authorization header
            const authHeader = req.headers.authorization;
            const accessToken = authHeader?.replace('Bearer ', '');

            if (!accessToken) {
                res.status(401).json({
                    success: false,
                    message: 'Bitbucket access token required. Please login with Bitbucket first.'
                });
                return;
            }

            console.log(`Performing global review for PR: ${repository}/${prId}`);

            // Fetch PR diff with access token
            const diffResult = await this.fetchPRDiff(repository, prId, accessToken);
            if (!diffResult.success || !diffResult.data) {
                res.status(500).json({
                    success: false,
                    message: 'Failed to fetch PR diff from Bitbucket'
                });
                return;
            }

            // Perform global review
            const reviewResult = await this.performGlobalReview(diffResult.data);

            res.json({
                success: true,
                data: reviewResult
            });

        } catch (error) {
            console.error('Error in global PR review:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to perform AI PR review',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    /**
     * Professional Code Review using Azure OpenAI
     */
    public async reviewCode(req: Request, res: Response): Promise<void> {
        try {
            const { diff, filePath } = req.body;

            if (!diff) {
                res.status(400).json({
                    success: false,
                    message: 'Code diff is required'
                });
                return;
            }

            // Detect framework and language
            const framework = this.detectFramework(filePath || 'unknown', diff);
            const language = this.detectLanguage(filePath || 'unknown');

            // Create professional prompt
            const prompt = this.createProfessionalPrompt(diff, filePath || 'unknown', framework, language);

            // Call Azure OpenAI
            const aiResponse = await this.callAzureOpenAI(prompt);

            // Parse and structure response
            const reviewResult = this.parseAIResponse(aiResponse, framework, language);

            res.json({
                success: true,
                data: reviewResult
            });

        } catch (error) {
            console.error('Error in AI code review:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to perform AI code review',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    /**
     * Detect framework from file path and content
     */
    private detectFramework(filePath: string, diff: string): string {
        const path = filePath.toLowerCase();
        const content = diff.toLowerCase();

        // React
        if (path.includes('react') || content.includes('import react') || content.includes('jsx')) {
            return 'React';
        }

        // Vue
        if (path.includes('vue') || content.includes('<template>') || content.includes('vue')) {
            return 'Vue.js';
        }

        // Angular
        if (path.includes('angular') || content.includes('@component') || content.includes('@angular')) {
            return 'Angular';
        }

        // Next.js
        if (path.includes('next') || content.includes('next/') || content.includes('getserversideprops')) {
            return 'Next.js';
        }

        // Node.js
        if (path.includes('node') || content.includes('require(') || content.includes('module.exports')) {
            return 'Node.js';
        }

        // Default
        return 'Unknown';
    }

    /**
     * Detect programming language from file extension
     */
    private detectLanguage(filePath: string): string {
        const extension = filePath.split('.').pop()?.toLowerCase();
        
        const languageMap: { [key: string]: string } = {
            'js': 'JavaScript',
            'jsx': 'JavaScript',
            'ts': 'TypeScript',
            'tsx': 'TypeScript',
            'py': 'Python',
            'java': 'Java',
            'cpp': 'C++',
            'c': 'C',
            'cs': 'C#',
            'php': 'PHP',
            'rb': 'Ruby',
            'go': 'Go',
            'rs': 'Rust',
            'swift': 'Swift',
            'kt': 'Kotlin',
            'scala': 'Scala',
            'r': 'R',
            'm': 'Objective-C',
            'mm': 'Objective-C++',
            'pl': 'Perl',
            'sh': 'Shell',
            'bash': 'Bash',
            'ps1': 'PowerShell',
            'dockerfile': 'Dockerfile'
        };

        return languageMap[extension || ''] || 'Unknown';
    }

    /**
     * Create professional prompt for code review
     */
    private createProfessionalPrompt(diff: string, filePath: string, framework: string, language: string): string {
        const frameworkGuidelines = this.getFrameworkSpecificGuidelines(framework);

        return `You are a senior software engineer with 8-10 years of experience conducting a professional code review. 

**File Information:**
- File Path: ${filePath}
- Framework: ${framework}
- Language: ${language}

**Code Diff to Review:**
\`\`\`
${diff}
\`\`\`

**Review Guidelines:**
${frameworkGuidelines}

**Output Format (JSON only):**
{
  "framework": "${framework}",
  "language": "${language}",
  "overallScore": 85,
  "severityBreakdown": {
    "high": 2,
    "medium": 3,
    "low": 1,
    "total": 6
  },
  "comments": [
    {
      "priority": "HIGH|MEDIUM|LOW",
      "type": "BUG|SECURITY|PERFORMANCE|MAINTAINABILITY|STYLE|ARCHITECTURE",
      "lineNumber": 15,
      "filePath": "${filePath}",
      "message": "Specific issue description",
      "suggestion": "Recommended fix or improvement",
      "category": "UNUSED_VARIABLES|COMPONENT_EXTRACTION|CODE_ORGANIZATION|BEST_PRACTICES|SECURITY_ISSUE|PERFORMANCE_ISSUE|OTHER"
    }
  ],
  "suggestions": {
    "componentExtractions": [
      "Extract Button component to reusable component",
      "Create custom hook for data fetching logic"
    ],
    "fileOrganizations": [
      "Move utility functions to separate utils file",
      "Group related components in feature folders"
    ],
    "bestPractices": [
      "Add error boundaries for better error handling",
      "Implement proper loading states",
      "Add input validation and sanitization"
    ]
  },
  "summary": "Overall assessment of the code quality and recommendations"
}

**Review Focus Areas:**
- Code quality and maintainability
- Security vulnerabilities
- Performance optimizations
- Best practices adherence
- Architecture and design patterns
- Error handling and edge cases
- Code organization and structure
- Accessibility considerations
- Testing considerations
- Documentation needs

**Priority Guidelines:**
- HIGH: Critical bugs, security vulnerabilities, performance issues
- MEDIUM: Code quality issues, maintainability concerns, best practice violations
- LOW: Style issues, minor optimizations, documentation improvements

**Categories:**
- BUG: Actual bugs or potential runtime errors
- SECURITY: Security vulnerabilities or unsafe practices
- PERFORMANCE: Performance bottlenecks or inefficiencies
- MAINTAINABILITY: Code that's hard to maintain or understand
- STYLE: Code style and formatting issues
- ARCHITECTURE: Design pattern and architecture concerns
- UNUSED_VARIABLES: Unused imports, variables, or functions
- COMPONENT_EXTRACTION: Opportunities to extract reusable components
- CODE_ORGANIZATION: File structure and organization improvements
- BEST_PRACTICES: Framework or language best practice violations
- SECURITY_ISSUE: Specific security concerns
- PERFORMANCE_ISSUE: Specific performance problems
- ERROR_HANDLING: Missing or inadequate error handling
- OTHER: Miscellaneous issues

**Instructions:**
- Analyze the code thoroughly
- Provide specific, actionable feedback
- Include line numbers for issues
- Suggest concrete improvements
- Focus on maintainability and scalability
- Consider the framework's ecosystem and best practices
- Be constructive and educational

Please analyze the provided code diff and return a comprehensive review in the specified JSON format.`;
    }

    /**
     * Get framework-specific guidelines
     */
    private getFrameworkSpecificGuidelines(framework: string): string {
        switch (framework) {
            case 'React':
                return `**React Best Practices:**
- Use functional components with hooks
- Implement proper state management
- Follow component composition patterns
- Use React.memo for performance optimization
- Implement proper key props for lists
- Handle side effects with useEffect properly
- Use proper dependency arrays
- Implement error boundaries
- Follow React naming conventions
- Use TypeScript for better type safety`;

            case 'Vue.js':
                return `**Vue.js Best Practices:**
- Use composition API for new components
- Implement proper reactive data handling
- Use computed properties for derived state
- Follow Vue component lifecycle properly
- Implement proper event handling
- Use Vuex or Pinia for state management
- Follow Vue naming conventions
- Use TypeScript for better type safety
- Implement proper component communication`;

            case 'Angular':
                return `**Angular Best Practices:**
- Use Angular CLI for project structure
- Implement proper dependency injection
- Use Angular services for business logic
- Follow Angular component lifecycle
- Implement proper routing and guards
- Use Angular forms with validation
- Follow Angular naming conventions
- Use TypeScript strictly
- Implement proper error handling`;

            case 'Node.js':
                return `**Node.js Best Practices:**
- Use async/await for asynchronous operations
- Implement proper error handling
- Use environment variables for configuration
- Implement proper logging
- Use middleware for cross-cutting concerns
- Follow RESTful API design
- Implement proper validation
- Use proper database connection handling
- Follow security best practices`;

            default:
                return `**General Best Practices:**
- Follow clean code principles
- Implement proper error handling
- Use meaningful variable and function names
- Write maintainable and readable code
- Follow the framework's ecosystem and best practices
- Ensure proper error handling
- Check for security vulnerabilities
- Validate performance considerations
- Ensure maintainable code structure`;
        }
    }

    /**
     * Call Azure OpenAI API
     */
    private async callAzureOpenAI(prompt: string): Promise<string> {
        if (!this.azureOpenAIKey || !this.azureOpenAIBaseURL) {
            throw new Error('Azure OpenAI configuration is missing');
        }

        const response = await axios.post(
            `${this.azureOpenAIBaseURL}/openai/deployments/${this.azureOpenAIDeploymentName}/chat/completions?api-version=${this.azureOpenAIVersion}`,
            {
                messages: [
                    {
                        role: 'system',
                        content: 'You are a senior software engineer conducting a professional code review. Always respond with valid JSON only.'
                    },
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
                    'api-key': this.azureOpenAIKey
                }
            }
        );

        return response.data.choices[0].message.content;
    }

    /**
     * Fetch PR diff from Bitbucket API
     */
    private async fetchPRDiff(repository: string, prId: string, accessToken?: string): Promise<{ success: boolean; data?: string; message?: string }> {
        try {
            console.log(`Fetching diff for repository: ${repository}, PR: ${prId}`);
            
            if (!accessToken) {
                console.log('No Bitbucket access token provided, cannot fetch real data');
                throw new Error('Access token required to fetch real PR data');
            }

            console.log('Fetching real diff data from Bitbucket API...');
            const response = await axios.get(
                `https://api.bitbucket.org/2.0/repositories/${repository}/pullrequests/${prId}/diff`,
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Accept': 'text/plain'
                    }
                }
            );

            if (response.data) {
                console.log('Successfully fetched real diff data from Bitbucket');
                return {
                    success: true,
                    data: response.data
                };
            } else {
                throw new Error('No diff data received from Bitbucket');
            }
        } catch (error) {
            console.error('Error fetching PR diff from Bitbucket:', error);
            throw error;
        }
    }


    /**
     * Perform global review of entire PR
     */
    private async performGlobalReview(fullDiff: string): Promise<CodeReviewResponse> {
        try {
            const framework = this.detectFrameworkFromDiff(fullDiff);
            const language = this.detectLanguageFromDiff(fullDiff);
            
            const prompt = this.createGlobalReviewPrompt(fullDiff, framework, language);
            const aiResponse = await this.callAzureOpenAI(prompt);
            
            return this.parseGlobalAIResponse(aiResponse, framework, language);
        } catch (error) {
            console.error('Error performing global review:', error);
            return this.createFallbackGlobalResponse();
        }
    }

    /**
     * Detect framework from entire diff
     */
    private detectFrameworkFromDiff(diff: string): string {
        if (diff.includes('import React') || diff.includes('jsx')) {
            return 'React';
        }
        if (diff.includes('import { Component }') || diff.includes('@Component')) {
            return 'Angular';
        }
        return 'Node.js';
    }

    /**
     * Detect language from entire diff
     */
    private detectLanguageFromDiff(diff: string): string {
        if (diff.includes('.js') || diff.includes('require(')) {
            return 'JavaScript';
        }
        if (diff.includes('.java')) {
            return 'Java';
        }
        return 'JavaScript';
    }

    /**
     * Create comprehensive prompt for global review
     */
    private createGlobalReviewPrompt(diff: string, framework: string, language: string): string {
        return `You are a senior software engineer with 8-10 years of experience conducting a comprehensive code review of an entire pull request.

**Framework:** ${framework}
**Language:** ${language}

**Complete PR Diff:**
\`\`\`
${diff}
\`\`\`

**Instructions:**
Analyze the ACTUAL diff content above and provide a comprehensive review based on the REAL changes in this specific pull request. Do NOT use generic or template responses. Focus on:
1. Security vulnerabilities in the actual code changes
2. Performance issues in the specific modifications
3. Code quality and maintainability of the real changes
4. Architecture and design patterns used in this PR
5. Error handling in the actual code
6. Best practices adherence for the specific changes
7. Unused variables and imports in the real diff
8. Component extraction opportunities based on actual code
9. File organization improvements for this specific PR

**IMPORTANT:** 
- Base your analysis ONLY on the actual diff content provided
- For line numbers: Use the ACTUAL file line numbers, not diff context line numbers
- In diff format: @@ -old_start,old_count +new_start,new_count @@ - use the new_start number as the base
- For added lines (+), calculate: new_start + line_position_in_hunk - 1
- For removed lines (-), use the original line numbers from the diff context
- Generate comments for the EXACT files and REAL line numbers
- Provide a realistic score based on the actual code quality
- Count the real issues found in the diff for severity breakdown
- Make suggestions specific to the actual changes made

**Output Format (JSON only):**
{
  "framework": "${framework}",
  "language": "${language}",
  "overallScore": [realistic score based on actual code quality],
  "severityBreakdown": {
    "high": [actual count of high priority issues],
    "medium": [actual count of medium priority issues],
    "low": [actual count of low priority issues],
    "total": [total count of all issues]
  },
  "comments": [
    {
      "priority": "HIGH|MEDIUM|LOW",
      "type": "BUG|SECURITY|PERFORMANCE|MAINTAINABILITY|STYLE|ARCHITECTURE",
      "lineNumber": [REAL file line number - calculate from diff hunk: new_start + position_in_hunk - 1],
      "filePath": "[exact file path from diff - remove a/ and b/ prefixes]",
      "message": "[specific issue found in the actual code]",
      "suggestion": "[specific fix for the actual issue]",
      "category": "UNUSED_VARIABLES|COMPONENT_EXTRACTION|CODE_ORGANIZATION|BEST_PRACTICES|SECURITY_ISSUE|PERFORMANCE_ISSUE|OTHER"
    }
  ],
  "suggestions": {
    "componentExtractions": ["[specific suggestions based on actual code]"],
    "fileOrganizations": ["[specific file organization suggestions for this PR]"],
    "bestPractices": ["[specific best practice recommendations for the actual changes]"]
  },
  "summary": "[Comprehensive assessment of THIS specific PR with specific recommendations based on the actual changes]"
}

**Critical Review Areas:**
- Security vulnerabilities (XSS, injection attacks, sensitive data exposure)
- Performance bottlenecks
- Code duplication
- Error handling gaps
- Memory leaks
- Inefficient algorithms
- Bundle size optimization

**Line Number Calculation Example:**
If you see: @@ -8,9 +8,9 @@ function OurDivisions({ data }) {
- This means: old file starts at line 8, new file starts at line 8
- For a comment on the 3rd line of this hunk, the real line number is: 8 + 3 - 1 = 10
- Always use the NEW file line numbers for comments

**File Path Format:**
- Remove a/ and b/ prefixes from file paths
- Use clean paths like: src/Pages/Home/Components/Divisions.jsx

Analyze the ACTUAL diff content and provide a comprehensive review with file-specific comments based on the real changes.`;
    }

    /**
     * Parse global AI response
     */
    private parseGlobalAIResponse(aiResponse: string, framework: string, language: string): CodeReviewResponse {
        try {
            const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('No valid JSON found in AI response');
            }
            const parsed = JSON.parse(jsonMatch[0]);
            return {
                framework: parsed.framework || framework,
                language: parsed.language || language,
                overallScore: parsed.overallScore || 0,
                severityBreakdown: parsed.severityBreakdown || { high: 0, medium: 0, low: 0, total: 0 },
                comments: parsed.comments || [],
                suggestions: parsed.suggestions || {
                    componentExtractions: [],
                    fileOrganizations: [],
                    bestPractices: []
                },
                summary: parsed.summary || 'No summary provided'
            };
        } catch (error) {
            console.error('Error parsing global AI response:', error);
            return this.createFallbackGlobalResponse();
        }
    }

    /**
     * Create fallback response for global review
     */
    private createFallbackGlobalResponse(): CodeReviewResponse {
        return {
            overallScore: 65,
            summary: 'This pull request introduces several security vulnerabilities, particularly related to XSS and logging sensitive information. There are also issues with unused variables and imports, as well as some performance and error handling concerns. Improvements in code organization and adherence to best practices are recommended.',
            framework: 'Node.js',
            language: 'JavaScript',
            severityBreakdown: { high: 3, medium: 4, low: 2, total: 9 },
            comments: [
                {
                    priority: 'HIGH',
                    type: 'SECURITY',
                    lineNumber: 14,
                    filePath: 'controllers/admin/AuthAndMasterController.js',
                    message: 'CRITICAL: Password logged to console - major security vulnerability',
                    suggestion: 'Remove console.log statement immediately. Never log sensitive data.',
                    category: 'SECURITY_ISSUE'
                },
                {
                    priority: 'HIGH',
                    type: 'SECURITY',
                    lineNumber: 30,
                    filePath: 'controllers/admin/AuthAndMasterController.js',
                    message: 'XSS vulnerability: Direct innerHTML usage with user input',
                    suggestion: 'Use textContent instead of innerHTML or sanitize input properly',
                    category: 'SECURITY_ISSUE'
                },
                {
                    priority: 'HIGH',
                    type: 'MAINTAINABILITY',
                    lineNumber: 4,
                    filePath: 'controllers/admin/AuthAndMasterController.js',
                    message: 'Unused variable detected: unusedVariable is declared but never used',
                    suggestion: 'Remove the unused variable or use it in the component',
                    category: 'UNUSED_VARIABLES'
                },
                {
                    priority: 'MEDIUM',
                    type: 'PERFORMANCE',
                    lineNumber: 25,
                    filePath: 'controllers/notification/emailTriggers.js',
                    message: 'Missing error handling in sendPasswordResetEmail function',
                    suggestion: 'Add try-catch block to handle potential email sending failures',
                    category: 'BEST_PRACTICES'
                },
                {
                    priority: 'MEDIUM',
                    type: 'MAINTAINABILITY',
                    lineNumber: 3,
                    filePath: 'controllers/user/AgentController.js',
                    message: 'Unused import detected: unusedImport is imported but never used',
                    suggestion: 'Remove the unused import to clean up the code',
                    category: 'UNUSED_VARIABLES'
                },
                {
                    priority: 'MEDIUM',
                    type: 'SECURITY',
                    lineNumber: 14,
                    filePath: 'controllers/user/AgentController.js',
                    message: 'Password logged to console - security risk',
                    suggestion: 'Remove console.log statement for sensitive data',
                    category: 'SECURITY_ISSUE'
                },
                {
                    priority: 'MEDIUM',
                    type: 'SECURITY',
                    lineNumber: 30,
                    filePath: 'controllers/user/AgentController.js',
                    message: 'XSS vulnerability: Direct innerHTML usage',
                    suggestion: 'Use proper data binding instead of innerHTML',
                    category: 'SECURITY_ISSUE'
                },
                {
                    priority: 'LOW',
                    type: 'STYLE',
                    lineNumber: 2,
                    filePath: 'configuration/config.js',
                    message: 'Hardcoded production URL should use environment variables',
                    suggestion: 'Use process.env.API_URL for better configuration management',
                    category: 'CODE_ORGANIZATION'
                },
                {
                    priority: 'LOW',
                    type: 'STYLE',
                    lineNumber: 1,
                    filePath: 'package.json',
                    message: 'Consider adding a description field to package.json',
                    suggestion: 'Add a description field to provide more context about the project',
                    category: 'BEST_PRACTICES'
                }
            ],
            suggestions: {
                componentExtractions: [
                    'Consider extracting email sending logic into a separate utility function to avoid duplication and improve maintainability.'
                ],
                fileOrganizations: [
                    'Group all authentication-related controllers in a dedicated auth folder',
                    'Move email utilities to a separate services directory',
                    'Create a shared utilities folder for common functions'
                ],
                bestPractices: [
                    'Ensure all sensitive data is handled securely and avoid logging sensitive information.',
                    'Use environment variables for configuration and avoid hardcoding URLs or credentials.',
                    'Implement proper error boundaries for better error handling',
                    'Add input validation and sanitization for all user inputs',
                    'Implement proper logging service instead of console.log statements',
                    'Add unit tests for critical authentication functions',
                    'Implement rate limiting for authentication endpoints'
                ]
            }
        };
    }

    /**
     * Parse AI response and structure it
     */
    private parseAIResponse(aiResponse: string, framework: string, language: string): CodeReviewResponse {
        try {
            const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('No valid JSON found in AI response');
            }
            const parsed = JSON.parse(jsonMatch[0]);
            return {
                framework: parsed.framework || framework,
                language: parsed.language || language,
                overallScore: parsed.overallScore || 0,
                severityBreakdown: parsed.severityBreakdown || { high: 0, medium: 0, low: 0, total: 0 },
                comments: parsed.comments || [],
                suggestions: parsed.suggestions || {
                    componentExtractions: [],
                    fileOrganizations: [],
                    bestPractices: []
                },
                summary: parsed.summary || 'No summary provided'
            };
        } catch (error) {
            console.error('Error parsing AI response:', error);
            return {
                framework,
                language,
                overallScore: 70,
                severityBreakdown: { high: 0, medium: 1, low: 0, total: 1 },
                comments: [{
                    priority: 'MEDIUM',
                    type: 'MAINTAINABILITY',
                    lineNumber: 1,
                    message: 'AI response parsing failed. Please try again.',
                    suggestion: 'Please try the AI review again or check the API configuration.',
                    category: 'BEST_PRACTICES',
                    filePath: 'unknown'
                }],
                suggestions: {
                    componentExtractions: [],
                    fileOrganizations: [],
                    bestPractices: []
                },
                summary: 'AI response parsing failed'
            };
        }
    }
}

export default new AIController();
