# Bitbucket Integration Setup

To connect CodeGuardian with your Bitbucket account, you need to set up OAuth credentials.

## Step 1: Create Bitbucket OAuth App

1. Go to [Bitbucket Settings](https://bitbucket.org/account/settings/)
2. Navigate to "OAuth consumers" in the left sidebar
3. Click "Add consumer"
4. Fill in the details:
   - **Name**: CodeGuardian
   - **Callback URL**: `http://localhost:3000/auth/bitbucket/callback`
   - **Scopes**: 
     - ✅ Repositories (read)
     - ✅ Pull requests (read)
     - ✅ Account (read)

## Step 2: Get Your Credentials

After creating the OAuth app, you'll get:
- **Key** (Client ID)
- **Secret** (Client Secret)

## Step 3: Configure Environment Variables

Create a `.env` file in the `frontend` directory with:

```env
REACT_APP_BITBUCKET_CLIENT_ID=your-key-here
REACT_APP_BITBUCKET_CLIENT_SECRET=your-secret-here
REACT_APP_BITBUCKET_REDIRECT_URI=http://localhost:3000/auth/bitbucket/callback
```

## Step 4: Restart the Application

After setting up the environment variables, restart your development server:

```bash
yarn dev
```

## Features

Once connected, CodeGuardian will:
- ✅ Fetch all your Bitbucket repositories
- ✅ Display all pull requests from your repositories
- ✅ Allow filtering by repository and status
- ✅ Show real-time data from Bitbucket
- ✅ Enable AI review of your pull requests

## Security

- OAuth tokens are stored securely in localStorage
- Only read permissions are requested
- You can disconnect at any time
- No data is stored on our servers

## Troubleshooting

### "Failed to authenticate with Bitbucket"
- Check your OAuth app configuration
- Verify the callback URL matches exactly
- Ensure your environment variables are set correctly

### "No pull requests found"
- Make sure you have pull requests in your repositories
- Check if the repositories are accessible to your account
- Try refreshing the data

### "Failed to fetch repositories"
- Verify your OAuth app has repository read permissions
- Check your internet connection
- Ensure your Bitbucket account is active

