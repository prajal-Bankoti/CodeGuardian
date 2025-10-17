// Bitbucket API service for authentication and PR fetching
export interface BitbucketUser {
  uuid: string;
  display_name: string;
  username: string;
  account_id: string;
}

export interface BitbucketRepository {
  uuid: string;
  name: string;
  full_name: string;
  description?: string;
  is_private: boolean;
  created_on: string;
  updated_on: string;
}

export interface BitbucketPullRequest {
  id: number;
  title: string;
  description?: string;
  state: 'OPEN' | 'MERGED' | 'DECLINED' | 'SUPERSEDED';
  draft: boolean;
  author: {
    display_name: string;
    nickname?: string;
    uuid: string;
    username?: string;
    account_id: string;
    type: string;
    links: {
      self: { href: string };
      avatar: { href: string };
      html: { href: string };
    };
  };
  source: {
    branch: {
      name: string;
      links?: any;
    };
    repository: {
      name: string;
      full_name: string;
      uuid: string;
      type: string;
      links: {
        self: { href: string };
        html: { href: string };
        avatar: { href: string };
      };
    };
    commit: {
      hash: string;
      type: string;
      links: {
        self: { href: string };
        html: { href: string };
      };
    };
  };
  destination: {
    branch: {
      name: string;
    };
    repository: {
      name: string;
      full_name: string;
      uuid: string;
      type: string;
      links: {
        self: { href: string };
        html: { href: string };
        avatar: { href: string };
      };
    };
    commit: {
      hash: string;
      type: string;
      links: {
        self: { href: string };
        html: { href: string };
      };
    };
  };
  created_on: string;
  updated_on: string;
  comment_count: number;
  task_count: number;
  type: string;
  reason?: string;
  merge_commit?: any;
  close_source_branch: boolean;
  closed_by?: any;
  links: {
    self: { href: string };
    html: { href: string };
    commits: { href: string };
    approve: { href: string };
    'request-changes': { href: string };
    diff: { href: string };
    diffstat: { href: string };
    comments: { href: string };
    activity: { href: string };
    merge: { href: string };
    decline: { href: string };
    statuses: { href: string };
  };
  summary: {
    type: string;
    raw: string;
    markup: string;
    html: string;
  };
}

export interface BitbucketAuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  scopes: string[];
}

class BitbucketService {
  private baseURL = 'https://api.bitbucket.org/2.0';
  private authURL = 'https://bitbucket.org/site/oauth2/authorize';
  private tokenURL = 'https://bitbucket.org/site/oauth2/access_token';
  
  // OAuth configuration - you'll need to set these up in your Bitbucket app
  private clientId = process.env.REACT_APP_BITBUCKET_CLIENT_ID || 'your-client-id';
  private clientSecret = process.env.REACT_APP_BITBUCKET_CLIENT_SECRET || 'your-client-secret';
  private redirectUri = process.env.REACT_APP_BITBUCKET_REDIRECT_URI || 'http://localhost:3000/app/bitbucket-login';

  // Check if OAuth is properly configured
  isOAuthConfigured(): boolean {
    return this.clientId !== 'your-client-id' && this.clientSecret !== 'your-client-secret';
  }

  // Get OAuth authorization URL
  getAuthURL(): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      response_type: 'code',
      redirect_uri: this.redirectUri,
      scope: 'repository pullrequest account',
    });
    
    return `${this.authURL}?${params.toString()}`;
  }

  // Exchange authorization code for access token
  async exchangeCodeForToken(code: string): Promise<BitbucketAuthResponse> {
    const response = await fetch(this.tokenURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${this.clientId}:${this.clientSecret}`)}`,
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: this.redirectUri,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to exchange code for token');
    }

    return response.json();
  }

  // Get current user info
  async getCurrentUser(accessToken: string): Promise<BitbucketUser> {
    const response = await fetch(`${this.baseURL}/user`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get user info');
    }

    return response.json();
  }

  // Get user's repositories
  async getRepositories(accessToken: string): Promise<BitbucketRepository[]> {
    const repositories: BitbucketRepository[] = [];
    let nextURL = `${this.baseURL}/repositories?role=member&pagelen=50`;

    while (nextURL) {
      const response = await fetch(nextURL, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to get repositories');
      }

      const data = await response.json();
      repositories.push(...data.values);
      nextURL = data.next;
    }

    return repositories;
  }

  // Get pull requests for a specific repository
  async getPullRequests(
    accessToken: string, 
    workspace: string, 
    repoSlug: string,
    state: 'OPEN' | 'MERGED' | 'DECLINED' | 'SUPERSEDED' = 'OPEN'
  ): Promise<BitbucketPullRequest[]> {
    const pullRequests: BitbucketPullRequest[] = [];
    let nextURL = `${this.baseURL}/repositories/${workspace}/${repoSlug}/pullrequests?state=${state}&pagelen=50`;

    while (nextURL) {
      const response = await fetch(nextURL, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to get pull requests');
      }

      const data = await response.json();
      pullRequests.push(...data.values);
      nextURL = data.next;
    }

    return pullRequests;
  }

  // Get all pull requests across all repositories
  async getAllPullRequests(accessToken: string): Promise<BitbucketPullRequest[]> {
    const repositories = await this.getRepositories(accessToken);
    const allPullRequests: BitbucketPullRequest[] = [];

    for (const repo of repositories) {
      try {
        const [workspace, repoSlug] = repo.full_name.split('/');
        const pullRequests = await this.getPullRequests(accessToken, workspace, repoSlug);
        allPullRequests.push(...pullRequests);
      } catch (error) {
        console.warn(`Failed to fetch PRs for ${repo.full_name}:`, error);
      }
    }

    return allPullRequests;
  }

  // Store tokens in localStorage
  storeTokens(authResponse: BitbucketAuthResponse): void {
    localStorage.setItem('bitbucket_access_token', authResponse.access_token);
    localStorage.setItem('bitbucket_refresh_token', authResponse.refresh_token);
    localStorage.setItem('bitbucket_token_expires', 
      (Date.now() + authResponse.expires_in * 1000).toString()
    );
  }

  // Get stored access token
  getStoredAccessToken(): string | null {
    const token = localStorage.getItem('bitbucket_access_token');
    const expires = localStorage.getItem('bitbucket_token_expires');
    
    if (!token || !expires) {
      return null;
    }

    // Check if token is expired
    if (Date.now() > parseInt(expires)) {
      this.clearTokens();
      return null;
    }

    return token;
  }

  // Clear stored tokens
  clearTokens(): void {
    localStorage.removeItem('bitbucket_access_token');
    localStorage.removeItem('bitbucket_refresh_token');
    localStorage.removeItem('bitbucket_token_expires');
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.getStoredAccessToken() !== null;
  }
}

export const bitbucketService = new BitbucketService();
