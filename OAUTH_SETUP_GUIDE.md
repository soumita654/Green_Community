# OAuth Setup Guide for Nature Verse Connect

This guide will help you set up Google OAuth authentication for your Nature Verse Connect application.

## Prerequisites

- Supabase project: `wvpaewutdxxkpxtokfkl`
- Application URL: `http://localhost:8082` (development)
- Production URL: (to be configured later)

## 1. Google OAuth Setup

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google+ API or People API

### Step 2: Create OAuth 2.0 Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth 2.0 Client ID**
3. Select **Web application**
4. Configure:
   - **Name**: `Nature Verse Connect`
   - **Authorized JavaScript origins**: 
     - `http://localhost:8082` (development)
     - `https://your-production-domain.com` (production)
   - **Authorized redirect URIs**:
     - `https://wvpaewutdxxkpxtokfkl.supabase.co/auth/v1/callback`
     - `http://localhost:8082/auth/callback` (if needed)

### Step 3: Get Client Credentials

1. Copy the **Client ID** and **Client Secret**
2. You'll need these for Supabase configuration

## 2. Supabase Configuration

### Step 1: Access Supabase Dashboard

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Navigate to your project: `wvpaewutdxxkpxtokfkl`
3. Go to **Authentication** → **Providers**

### Step 2: Configure Google Provider

1. Find **Google** in the providers list
2. Enable it
3. Enter your Google OAuth credentials:
   - **Client ID**: `your-google-client-id`
   - **Client Secret**: `your-google-client-secret`
4. Click **Save**

### Step 3: Configure Redirect URLs

1. Go to **Authentication** → **URL Configuration**
2. Add redirect URLs:
   - **Site URL**: `http://localhost:8082`
   - **Redirect URLs**: `http://localhost:8082/auth/callback`

## 3. Environment Variables (Optional)

Create a `.env.local` file in your project root:

```env
VITE_SUPABASE_URL=https://wvpaewutdxxkpxtokfkl.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind2cGFld3V0ZHh4a3B4dG9rZmtsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1MDU5NjIsImV4cCI6MjA2ODA4MTk2Mn0.4N4YXu63XAnz5x5NyDGjIjkMZY0DE3XQeGNF31DyGEI
```

## 4. Testing OAuth Flow

### For Development:

1. Start your development server: `npm run dev`
2. Navigate to `http://localhost:8082`
3. Try logging in with Google
4. Check for any console errors

### Common Issues:

- **Redirect URI mismatch**: Ensure all URLs match exactly
- **Domain verification**: Some providers require domain verification
- **CORS issues**: Check Supabase CORS settings

## 5. Production Configuration

When deploying to production:

1. Update OAuth app settings with production URLs
2. Update Supabase redirect URLs
3. Test the OAuth flow in production environment

## 6. Current Implementation Status

✅ **Already Implemented in Code:**
- OAuth buttons in the UI
- `handleSocialLogin` function
- Supabase OAuth integration
- Error handling and user feedback

🔧 **Needs Configuration:**
- Google OAuth credentials in Supabase
- Redirect URL configuration

## 7. Security Considerations

- Keep Client Secrets secure
- Use environment variables for production
- Regularly rotate OAuth credentials
- Monitor OAuth usage in provider dashboards

## 8. User Experience Flow

1. User clicks "🌎 Google Garden"
2. Redirected to OAuth provider
3. User authorizes the application
4. Redirected back to your app
5. User profile created automatically
6. User is logged in and redirected to main app

## Next Steps

1. Follow the Google OAuth setup (Section 1)
2. Configure the provider in Supabase (Section 2)
3. Test the OAuth flow
4. Deploy to production and update URLs

The OAuth functionality is already coded and ready to use once you complete the provider configuration!
