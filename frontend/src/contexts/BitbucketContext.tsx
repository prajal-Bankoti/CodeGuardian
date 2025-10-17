import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { bitbucketService, BitbucketUser, BitbucketRepository, BitbucketPullRequest } from '../services/bitbucketService';
import { apiService } from '../services/apiService';

// Cache keys for localStorage
const CACHE_KEYS = {
    USER_DATA: 'bitbucket_user_data',
    USER_DATA_TIMESTAMP: 'bitbucket_user_data_timestamp',
    REPOSITORIES: 'bitbucket_repositories',
    REPOSITORIES_TIMESTAMP: 'bitbucket_repositories_timestamp',
    TOKEN_EXPIRY: 'bitbucket_token_expiry'
};

// Cache duration in milliseconds (24 hours)
const CACHE_DURATION = 24 * 60 * 60 * 1000;

// Cache utility functions
const cacheUtils = {
    // Check if cached data is still valid
    isCacheValid: (timestampKey: string): boolean => {
        const timestamp = localStorage.getItem(timestampKey);
        if (!timestamp) return false;

        const cacheTime = parseInt(timestamp, 10);
        const now = Date.now();
        return (now - cacheTime) < CACHE_DURATION;
    },

    // Get cached data
    getCachedData: (dataKey: string): any => {
        try {
            const data = localStorage.getItem(dataKey);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error parsing cached data:', error);
            return null;
        }
    },

    // Set cached data with timestamp
    setCachedData: (dataKey: string, timestampKey: string, data: any): void => {
        try {
            localStorage.setItem(dataKey, JSON.stringify(data));
            localStorage.setItem(timestampKey, Date.now().toString());
        } catch (error) {
            console.error('Error caching data:', error);
        }
    },

    // Clear all cached data
    clearCache: (): void => {
        Object.values(CACHE_KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
        // Also clear existing token storage
        localStorage.removeItem('bitbucket_token_expires');
    },

    // Check if token is expired
    isTokenExpired: (): boolean => {
        const tokenExpiry = localStorage.getItem('bitbucket_token_expires');
        if (!tokenExpiry) return true;

        const expiryTime = parseInt(tokenExpiry, 10);
        return Date.now() >= expiryTime;
    },

    // Set token expiry time (this is handled by bitbucketService.storeTokens)
    setTokenExpiry: (expiresIn: number): void => {
        // This is handled by bitbucketService.storeTokens, so we don't need to do anything here
        console.log('Token expiry will be set by bitbucketService.storeTokens');
    }
};

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
    fetchPullRequests: (repository: string, page?: number, pagelen?: number) => Promise<void>;
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

                // Check if token is expired
                if (cacheUtils.isTokenExpired()) {
                    console.log('🔄 Token expired, clearing cache and requiring re-authentication');
                    cacheUtils.clearCache();
                    bitbucketService.clearTokens();
                    setIsAuthenticated(false);
                    return;
                }

                // Try to load cached data first
                await loadCachedUserData();
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
                    bitbucketService.storeTokens(authResponse); // This already stores token expiry

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

    const loadCachedUserData = async () => {
        try {
            // Try to load user data from cache first
            if (cacheUtils.isCacheValid(CACHE_KEYS.USER_DATA_TIMESTAMP)) {
                const cachedUser = cacheUtils.getCachedData(CACHE_KEYS.USER_DATA) as BitbucketUser;
                if (cachedUser) {
                    console.log('💾 Loading user data from cache');
                    setUser(cachedUser);
                }
            }

            // Try to load repositories from cache first
            if (cacheUtils.isCacheValid(CACHE_KEYS.REPOSITORIES_TIMESTAMP)) {
                const cachedRepos = cacheUtils.getCachedData(CACHE_KEYS.REPOSITORIES) as BitbucketRepository[];
                if (cachedRepos) {
                    console.log('💾 Loading repositories from cache');
                    setRepositories(cachedRepos);
                }
            }

            // If no valid cache, load from API
            if (!cacheUtils.isCacheValid(CACHE_KEYS.USER_DATA_TIMESTAMP) ||
                !cacheUtils.isCacheValid(CACHE_KEYS.REPOSITORIES_TIMESTAMP)) {
                console.log('🌐 Cache expired or missing, loading fresh data from API');
                await loadUserData();
            }
        } catch (err) {
            console.error('Error loading cached user data:', err);
            // Fallback to API if cache fails
            await loadUserData();
        }
    };

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
                const userData = userResponse.data as BitbucketUser;
                setUser(userData);
                // Cache user data
                cacheUtils.setCachedData(CACHE_KEYS.USER_DATA, CACHE_KEYS.USER_DATA_TIMESTAMP, userData);
                console.log('💾 User data cached for 24 hours');
            } else {
                throw new Error(userResponse.message || 'Failed to load user data');
            }

            if (reposResponse.success && reposResponse.data) {
                const reposData = reposResponse.data as BitbucketRepository[];
                setRepositories(reposData);
                // Cache repositories data
                cacheUtils.setCachedData(CACHE_KEYS.REPOSITORIES, CACHE_KEYS.REPOSITORIES_TIMESTAMP, reposData);
                console.log('💾 Repositories data cached for 24 hours');
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
        cacheUtils.clearCache(); // Clear all cached data
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
                const reposData = response.data as BitbucketRepository[];
                setRepositories(reposData);
                setRepositoriesPagination((response as any).pagination || null);

                // Cache repositories data (only for first page to avoid cache pollution)
                if (page === 1) {
                    cacheUtils.setCachedData(CACHE_KEYS.REPOSITORIES, CACHE_KEYS.REPOSITORIES_TIMESTAMP, reposData);
                }
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

    const fetchPullRequests = useCallback(async (repository: string, page = 1, pagelen = 20) => {
        if (!isAuthenticated || !repository) return;

        try {
            setLoading(true);
            setError(null);

            console.log(`🔍 Fetching PRs for repository: ${repository}`);
            const response = await apiService.getPullRequests(repository, page, pagelen);
            if (response.success && response.data) {
                setPullRequests(response.data as BitbucketPullRequest[]);
                setPullRequestsPagination((response as any).pagination || null);
                console.log(`✅ Loaded ${response.data.length} PRs for ${repository}`);
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
        await fetchRepositories();
        // Don't automatically fetch PRs - let the user select a repository first
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
