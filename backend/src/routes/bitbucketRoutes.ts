import { Router, Request, Response } from 'express';
import axios from 'axios';

const router: Router = Router();

// Bitbucket API base URL
const BITBUCKET_API_BASE = 'https://api.bitbucket.org/2.0';

// Helper function to add delay between API calls
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Get user info from Bitbucket
router.get('/user', async (req: Request, res: Response) => {
    try {
        const authHeader = req.headers.authorization;
        const access_token = authHeader?.replace('Bearer ', '');
        
        if (!access_token) {
            return res.status(401).json({
                success: false,
                message: 'Access token required'
            });
        }

        const response = await axios.get(`${BITBUCKET_API_BASE}/user`, {
            headers: {
                'Authorization': `Bearer ${access_token}`
            }
        });

        return res.json({
            success: true,
            data: response.data
        });
    } catch (error) {
        console.error('Error fetching user info:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch user info',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

// Get repositories from Bitbucket
router.get('/repositories', async (req: Request, res: Response) => {
    try {
        const authHeader = req.headers.authorization;
        const access_token = authHeader?.replace('Bearer ', '');
        const { page = 1, pagelen = 20 } = req.query;
        
        if (!access_token) {
            return res.status(401).json({
                success: false,
                message: 'Access token required'
            });
        }

        const response = await axios.get(`${BITBUCKET_API_BASE}/repositories`, {
            headers: {
                'Authorization': `Bearer ${access_token}`
            },
            params: {
                role: 'member',
                pagelen: parseInt(pagelen as string),
                page: parseInt(page as string)
            }
        });

        return res.json({
            success: true,
            data: response.data.values || [],
            pagination: {
                page: parseInt(page as string),
                pagelen: parseInt(pagelen as string),
                size: response.data.size || 0,
                next: response.data.next || null,
                previous: response.data.previous || null
            }
        });
    } catch (error) {
        console.error('Error fetching repositories:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch repositories',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

// Get pull requests from Bitbucket
router.get('/pullrequests', async (req: Request, res: Response) => {
    try {
        const authHeader = req.headers.authorization;
        const access_token = authHeader?.replace('Bearer ', '');
        const { repository, page = 1, pagelen = 20 } = req.query;
        
        if (!access_token) {
            return res.status(401).json({
                success: false,
                message: 'Access token required'
            });
        }

        // If repository is specified, get PRs for that repo
        if (repository && repository !== 'all') {
            const response = await axios.get(`${BITBUCKET_API_BASE}/repositories/${repository}/pullrequests`, {
                headers: {
                    'Authorization': `Bearer ${access_token}`
                },
                params: {
                    state: 'OPEN',
                    pagelen: parseInt(pagelen as string),
                    page: parseInt(page as string)
                }
            });

            return res.json({
                success: true,
                data: response.data.values || [],
                pagination: {
                    page: parseInt(page as string),
                    pagelen: parseInt(pagelen as string),
                    size: response.data.size || 0,
                    next: response.data.next || null,
                    previous: response.data.previous || null
                }
            });
        }

        // Otherwise, get PRs from all repositories
        // First get repositories, then get PRs from each
        const reposResponse = await axios.get(`${BITBUCKET_API_BASE}/repositories`, {
            headers: {
                'Authorization': `Bearer ${access_token}`
            },
            params: {
                role: 'member',
                pagelen: 50
            }
        });

        const repositories = reposResponse.data.values || [];
        const allPullRequests = [];
        const pageSize = parseInt(pagelen as string);
        const currentPage = parseInt(page as string);
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;

        // Get PRs from each repository
        for (const repo of repositories) {
            try {
                const prsResponse = await axios.get(`${BITBUCKET_API_BASE}/repositories/${repo.full_name}/pullrequests`, {
                    headers: {
                        'Authorization': `Bearer ${access_token}`
                    },
                    params: {
                        state: 'OPEN',
                        pagelen: 20
                    }
                });

                const prs = prsResponse.data.values || [];
                allPullRequests.push(...prs);

                // Add delay to prevent rate limiting
                await delay(100);
            } catch (repoError) {
                console.warn(`Failed to fetch PRs from ${repo.full_name}:`, repoError);
                // Continue with other repositories
            }
        }

        // Apply pagination to the combined results
        const paginatedPRs = allPullRequests.slice(startIndex, endIndex);
        const totalSize = allPullRequests.length;

        return res.json({
            success: true,
            data: paginatedPRs,
            pagination: {
                page: currentPage,
                pagelen: pageSize,
                size: totalSize,
                next: endIndex < totalSize ? currentPage + 1 : null,
                previous: currentPage > 1 ? currentPage - 1 : null
            }
        });
    } catch (error: any) {
        console.error('Error fetching pull requests:', error);
        
        // Handle rate limiting specifically
        if (error.response?.status === 429) {
            return res.status(429).json({
                success: false,
                message: 'Rate limit exceeded. Please try again later.',
                error: 'Too many requests to Bitbucket API',
            });
        }
        
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch pull requests',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

// Get specific pull request details
router.get('/pullrequests/:repository/:prId', async (req: Request, res: Response) => {
    try {
        const authHeader = req.headers.authorization;
        const access_token = authHeader?.replace('Bearer ', '');
        const { repository, prId } = req.params;
        
        if (!access_token) {
            return res.status(401).json({
                success: false,
                message: 'Access token required'
            });
        }

        console.log(`Fetching PR details for: ${repository}/${prId}`);
        
        const response = await axios.get(`${BITBUCKET_API_BASE}/repositories/${repository}/pullrequests/${prId}`, {
            headers: {
                'Authorization': `Bearer ${access_token}`
            }
        });

        return res.json({
            success: true,
            data: response.data
        });
    } catch (error: any) {
        console.error('Error fetching PR details:', error.response?.data || error.message);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch PR details',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

// Get PR diff data
router.get('/pullrequests/:repository/:prId/diff', async (req: Request, res: Response) => {
    try {
        const authHeader = req.headers.authorization;
        const access_token = authHeader?.replace('Bearer ', '');
        const { repository, prId } = req.params;
        
        if (!access_token) {
            return res.status(401).json({
                success: false,
                message: 'Access token required'
            });
        }

        console.log(`Fetching PR diff for: ${repository}/${prId}`);
        
        const response = await axios.get(`${BITBUCKET_API_BASE}/repositories/${repository}/pullrequests/${prId}/diff`, {
            headers: {
                'Authorization': `Bearer ${access_token}`
            }
        });

        return res.json({
            success: true,
            data: response.data
        });
    } catch (error: any) {
        console.error('Error fetching PR diff:', error.response?.data || error.message);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch PR diff',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

export default router;
