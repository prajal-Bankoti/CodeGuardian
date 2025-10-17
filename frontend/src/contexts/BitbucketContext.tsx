import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { bitbucketService, BitbucketUser, BitbucketRepository, BitbucketPullRequest } from '../services/bitbucketService';
import { apiService } from '../services/apiService';

interface BitbucketContextType {
    isAuthenticated: boolean;
    user: BitbucketUser | null;
    repositories: BitbucketRepository[];
    pullRequests: BitbucketPullRequest[];
    loading: boolean;
    error: string | null;
    repositoriesPagination: any;
    pullRequestsPagination: any;
    login: () => void;
    logout: () => void;
    fetchRepositories: (page?: number, pagelen?: number) => Promise<void>;
    fetchPullRequests: (page?: number, pagelen?: number) => Promise<void>;
    refreshData: () => Promise<void>;
}

const BitbucketContext = createContext<BitbucketContextType | undefined>(undefined);

interface BitbucketProviderProps {
    children: ReactNode;
}

export const BitbucketProvider: React.FC<BitbucketProviderProps> = ({ children }) => {
    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [user, setUser] = useState<BitbucketUser | null>(null);
    const [repositories, setRepositories] = useState<BitbucketRepository[]>([]);
    const [pullRequests, setPullRequests] = useState<BitbucketPullRequest[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [repositoriesPagination, setRepositoriesPagination] = useState<any>(null);
    const [pullRequestsPagination, setPullRequestsPagination] = useState<any>(null);

    // Check authentication status on mount
    useEffect(() => {
        const checkAuth = async () => {
            if (bitbucketService.isAuthenticated()) {
                setIsAuthenticated(true);
                await loadUserData();
            }
        };

        checkAuth();
    }, []); // Empty dependency array - only run once

    // Handle OAuth callback
    useEffect(() => {
        const handleOAuthCallback = async () => {
            const urlParams = new URLSearchParams(window.location.search);
            const code = urlParams.get('code');
            const error = urlParams.get('error');

            if (error) {
                setError(`OAuth error: ${error}`);
                return;
            }

            if (code) {
                try {
                    setLoading(true);
                    setError(null);

                    const authResponse = await bitbucketService.exchangeCodeForToken(code);
                    bitbucketService.storeTokens(authResponse);

                    setIsAuthenticated(true);
                    await loadUserData();

                    // Redirect to dashboard after successful authentication
                    navigate('/app/dashboard');

                    // Clean up URL
                    window.history.replaceState({}, document.title, window.location.pathname);
                } catch (err) {
                    setError('Failed to authenticate with Bitbucket');
                    console.error('OAuth error:', err);
                } finally {
                    setLoading(false);
                }
            }
        };

        handleOAuthCallback();
    }, [navigate]);

    const loadUserData = async () => {
        try {
            setLoading(true);
            setError(null);

            const accessToken = bitbucketService.getStoredAccessToken();
            if (!accessToken) {
                throw new Error('No access token available');
            }

            // Use backend API instead of calling Bitbucket directly
            const [userResponse, reposResponse] = await Promise.all([
                apiService.getUserInfo(),
                apiService.getRepositories()
            ]);

            if (userResponse.success && userResponse.data) {
                setUser(userResponse.data as BitbucketUser);
            } else {
                throw new Error(userResponse.message || 'Failed to load user data');
            }

            if (reposResponse.success && reposResponse.data) {
                setRepositories(reposResponse.data as BitbucketRepository[]);
            } else {
                console.warn('Failed to load repositories:', reposResponse.message);
                setRepositories([]);
            }
        } catch (err) {
            setError('Failed to load user data');
            console.error('Error loading user data:', err);
        } finally {
            setLoading(false);
        }
    };

    const login = () => {
        const authURL = bitbucketService.getAuthURL();
        window.location.href = authURL;
    };

    const logout = () => {
        bitbucketService.clearTokens();
        setIsAuthenticated(false);
        setUser(null);
        setRepositories([]);
        setPullRequests([]);
        setError(null);
    };

    const fetchRepositories = async (page = 1, pagelen = 20) => {
        if (!isAuthenticated) return;

        try {
            setLoading(true);
            setError(null);

            const response = await apiService.getRepositories(page, pagelen);
            if (response.success && response.data) {
                setRepositories(response.data as BitbucketRepository[]);
                setRepositoriesPagination((response as any).pagination || null);
            } else {
                throw new Error(response.message || 'Failed to fetch repositories');
            }
        } catch (err) {
            setError('Failed to fetch repositories');
            console.error('Error fetching repositories:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchPullRequests = useCallback(async (page = 1, pagelen = 20) => {
        if (!isAuthenticated) return;

        try {
            setLoading(true);
            setError(null);

            const response = await apiService.getPullRequests(undefined, page, pagelen);
            if (response.success && response.data) {
                setPullRequests(response.data as BitbucketPullRequest[]);
                setPullRequestsPagination((response as any).pagination || null);
            } else {
                throw new Error(response.message || 'Failed to fetch pull requests');
            }
        } catch (err: any) {
            // Handle rate limiting specifically
            if (err.message?.includes('Rate limit exceeded')) {
                setError('Rate limit exceeded. Please wait a moment and try again.');
            } else {
                setError('Failed to fetch pull requests');
            }
            console.error('Error fetching pull requests:', err);
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated]);

    const refreshData = async () => {
        await Promise.all([fetchRepositories(), fetchPullRequests()]);
    };

    const value: BitbucketContextType = {
        isAuthenticated,
        user,
        repositories,
        pullRequests,
        loading,
        error,
        repositoriesPagination,
        pullRequestsPagination,
        login,
        logout,
        fetchRepositories,
        fetchPullRequests,
        refreshData,
    };

    return (
        <BitbucketContext.Provider value={value}>
            {children}
        </BitbucketContext.Provider>
    );
};

export const useBitbucket = (): BitbucketContextType => {
    const context = useContext(BitbucketContext);
    if (context === undefined) {
        throw new Error('useBitbucket must be used within a BitbucketProvider');
    }
    return context;
};
