# Google Authentication Setup Guide

## Overview

This guide covers the Google OAuth 2.0 / OpenID Connect (OIDC) authentication implementation added to the BuildAndHost platform. Users can now sign in using their Google account alongside the existing email/password authentication.

## Features Implemented

✅ **Backend Implementation**
- Google OAuth 2.0 token verification using [`google-auth`](Backend/websiteBuilder_Backend/requirements.txt:1) library
- Account linking: existing email/password accounts can be linked to Google accounts
- Automatic user creation for new Google users
- Secure token-based authentication (JWT)

✅ **Frontend Implementation**
- Google Sign In button on [`login.tsx`](ai-website-builder/src/pages/login.tsx:1) page
- Google Sign In button on [`register.tsx`](ai-website-builder/src/pages/register.tsx:1) page
- Dynamic loading of Google Identity Services
- Seamless OAuth flow with error handling

✅ **Database Schema**
- Added [`google_id`](Backend/websiteBuilder_Backend/app/models.py:44) field to users table (unique, indexed)
- Made [`password_hash`](Backend/websiteBuilder_Backend/app/models.py:39) nullable for Google-only accounts
- Migration script: [`002_add_google_auth.sql`](Backend/websiteBuilder_Backend/migrations/002_add_google_auth.sql:1)

## Setup Instructions

### 1. Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth client ID**
5. Configure the OAuth consent screen if you haven't already
6. Select **Web application** as the application type
7. Configure authorized origins and redirect URIs:
   - **Authorized JavaScript origins:**
     - `http://localhost:5173` (development)
     - `https://yourdomain.com` (production)
   - **Authorized redirect URIs:**
     - `http://localhost:5173` (development)
     - `https://yourdomain.com` (production)
8. Click **Create** and copy your:
   - **Client ID** (looks like: `xxx.apps.googleusercontent.com`)
   - **Client Secret** (looks like: `GOCSPX-xxx`)

### 2. Configure Backend Environment

1. Copy [`Backend/.env.example`](Backend/.env.example:1) to `Backend/.env` if you haven't already
2. Add your Google OAuth credentials:

```bash
GOOGLE_CLIENT_ID=your-actual-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-actual-client-secret
```

### 3. Configure Frontend Environment

1. Copy [`ai-website-builder/.env.example`](ai-website-builder/.env.example:1) to `ai-website-builder/.env.local`
2. Add your Google Client ID:

```bash
VITE_GOOGLE_CLIENT_ID=your-actual-client-id.apps.googleusercontent.com
```

**Note:** Only the Client ID is needed in the frontend. The Client Secret stays secure on the backend.

### 4. Run Database Migration

Apply the Google authentication migration to your database:

```bash
cd Backend/websiteBuilder_Backend
psql -U your_username -d your_database -f migrations/002_add_google_auth.sql
```

Or if using the migration system:

```bash
# The migration will automatically run on next application start
python -m app.main
```

**What the migration does:**
- Adds `google_id` column (VARCHAR 255, unique, indexed)
- Makes `password_hash` nullable for Google-only accounts
- Creates index on `google_id` for faster lookups

### 5. Install Backend Dependencies

Install the `google-auth` library:

```bash
cd Backend/websiteBuilder_Backend
pip install -r requirements.txt
```

### 6. Restart Services

Restart both backend and frontend:

```bash
# Backend
cd Backend/websiteBuilder_Backend
python -m app.main

# Frontend
cd ai-website-builder
npm run dev
```

## How It Works

### Authentication Flow

1. **User clicks "Continue with Google"** on [`login.tsx`](ai-website-builder/src/pages/login.tsx:377) or [`register.tsx`](ai-website-builder/src/pages/register.tsx:580)
2. **Google Identity Services popup appears** (loaded via [`useEffect`](ai-website-builder/src/pages/login.tsx:29))
3. **User selects Google account** and grants permissions
4. **Google returns ID token** to the frontend
5. **Frontend sends token** to [`/api/auth/google/login`](Backend/websiteBuilder_Backend/app/routers/auth.py:98) endpoint
6. **Backend verifies token** with Google's servers using [`id_token.verify_oauth2_token()`](Backend/websiteBuilder_Backend/app/routers/auth.py:107)
7. **Backend checks for existing user:**
   - If user exists with this `google_id` → Log them in
   - If email exists but no `google_id` → Link accounts and log in
   - If completely new → Create new user account
8. **Backend returns JWT token** for authenticated sessions
9. **Frontend stores token** and redirects to dashboard

### Account Linking

If a user already has an email/password account and signs in with Google using the same email:
- Their existing account is **automatically linked** to their Google account
- The [`google_id`](Backend/websiteBuilder_Backend/app/models.py:44) field is populated
- They can now sign in using either method (email/password OR Google)

### Security Features

- ✅ Token verification happens server-side using Google's official library
- ✅ Client Secret never exposed to frontend
- ✅ JWT tokens for session management
- ✅ Unique constraints prevent duplicate Google accounts
- ✅ Email validation from Google's verified email

## Testing

### Test New Google User Registration

1. Open your app in browser
2. Go to Register page
3. Click "Continue with Google"
4. Sign in with a Google account that hasn't been used before
5. Verify you're redirected to dashboard
6. Check database: new user should have `google_id` but no `password_hash`

### Test Account Linking

1. Create an account using email/password
2. Log out
3. Go to Login page
4. Click "Continue with Google"
5. Use the same email address
6. Verify you're logged in successfully
7. Check database: your user should now have both `password_hash` AND `google_id`
8. Verify you can log in using either method

### Test Existing Google User Login

1. Use a Google account that's already registered
2. Click "Continue with Google" on login page
3. Verify immediate login without registration prompts

## Files Modified

### Backend Files
- [`migrations/002_add_google_auth.sql`](Backend/websiteBuilder_Backend/migrations/002_add_google_auth.sql:1) - Database schema migration
- [`app/models.py`](Backend/websiteBuilder_Backend/app/models.py:39) - Added `google_id` field to User model
- [`app/schemas.py`](Backend/websiteBuilder_Backend/app/schemas.py:171) - Added `GoogleLoginRequest` schema
- [`app/routers/auth.py`](Backend/websiteBuilder_Backend/app/routers/auth.py:98) - Implemented Google OAuth endpoint
- [`requirements.txt`](Backend/websiteBuilder_Backend/requirements.txt:1) - Added `google-auth` dependency
- [`Backend/.env.example`](Backend/.env.example:30) - Added Google OAuth configuration

### Frontend Files
- [`src/pages/login.tsx`](ai-website-builder/src/pages/login.tsx:29) - Added Google Sign In button and OAuth flow
- [`src/pages/register.tsx`](ai-website-builder/src/pages/register.tsx:35) - Added Google Sign In button and OAuth flow
- [`ai-website-builder/.env.example`](ai-website-builder/.env.example:1) - Created with Google configuration

## API Endpoints

### POST `/api/auth/google/login`

Authenticates a user with Google OAuth token.

**Request Body:**
```json
{
  "credential": "google-id-token-string"
}
```

**Success Response (200):**
```json
{
  "access_token": "jwt-token-string",
  "token_type": "bearer",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "username",
    "full_name": "Full Name",
    "google_id": "google-user-id"
  }
}
```

**Error Responses:**
- `400` - Invalid token or missing credential
- `500` - Server error during authentication

## Troubleshooting

### "Google sign-in failed" Error

**Possible causes:**
1. `GOOGLE_CLIENT_ID` not set in backend environment
2. `VITE_GOOGLE_CLIENT_ID` not set in frontend environment
3. Token verification failed (invalid token)
4. Google API not enabled in Cloud Console

**Solutions:**
- Check environment variables are correctly set
- Restart backend and frontend after changing .env files
- Verify Google Cloud Console settings
- Check backend logs for detailed error messages

### Google button doesn't appear

**Possible causes:**
1. Google Identity Services script failed to load
2. `VITE_GOOGLE_CLIENT_ID` not set in frontend

**Solutions:**
- Check browser console for errors
- Verify `.env.local` file exists with `VITE_GOOGLE_CLIENT_ID`
- Check network tab to ensure script loads from `accounts.google.com/gsi/client`

### "Email already exists" Error

This shouldn't happen with the current implementation as it automatically links accounts. If you see this:
- Check the [`google_login`](Backend/websiteBuilder_Backend/app/routers/auth.py:98) function logic
- Verify account linking code is working correctly

## Next Steps

- **Production Deployment**: Update authorized origins in Google Cloud Console
- **Email Verification**: Consider adding email verification for Google accounts
- **Profile Pictures**: Use Google profile picture URL from OAuth response
- **Scopes**: Add additional Google API scopes if needed (Drive, Calendar, etc.)
- **Analytics**: Track Google vs email/password registration rates

## Support

For issues or questions:
1. Check backend logs for detailed error messages
2. Verify all environment variables are set correctly
3. Test with Google OAuth Playground to verify token format
4. Review Google Cloud Console audit logs

---

**Implementation Date:** 2026-08-31  
**Authentication Method:** Google OAuth 2.0 / OpenID Connect  
**Libraries Used:** `google-auth>=2.23.0`, Google Identity Services
