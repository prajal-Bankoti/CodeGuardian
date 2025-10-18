# Bitbucket Token Setup Guide

## Issue: "Token is invalid, expired, or not supported for this endpoint"

This error occurs when your Bitbucket token doesn't have the correct permissions to post comments to pull requests.

## Solution: Update Your Bitbucket Token

### Step 1: Go to Bitbucket Settings
1. Log into your Bitbucket account
2. Click on your profile picture (top right)
3. Select "Personal settings"
4. Go to "App passwords" in the left sidebar

### Step 2: Create a New App Password
1. Click "Create app password"
2. Give it a name like "CodeGuardian Comments"
3. **IMPORTANT**: Select these permissions:
   - ✅ **Repositories: Write** (Required for posting comments)
   - ✅ **Pull requests: Write** (Required for posting comments)
   - ✅ **Repositories: Read** (Required for reading PR data)

### Step 3: Copy the Token
1. Copy the generated token (it will only be shown once!)
2. Update your token in CodeGuardian

### Step 4: Test the Token
1. Try posting comments again
2. The system should now work properly

## Alternative: Check Existing Token
If you already have a token, make sure it has:
- **Repositories: Write** permission
- **Pull requests: Write** permission
- Is not expired

## Common Issues:
- ❌ Token only has "Read" permissions
- ❌ Token is expired
- ❌ Token was created for a different workspace
- ❌ Token doesn't have repository access

## Need Help?
If you continue having issues:
1. Check the Bitbucket API documentation
2. Verify your repository permissions
3. Try creating a fresh token with all required permissions
