# Client-Side React Rendering for Published Websites - Implementation Guide

## Overview

This implementation enables client-side React rendering for published websites accessed via subdomains (e.g., `hantharmintun.onlinegif.shop`). The same React build serves both the website builder application and all published user websites, eliminating the need for separate builds per site.

## Architecture

### Key Design Decisions

1. **Single Build Deployment**: One Vite/React build serves both the editor and published sites
2. **Subdomain Detection**: The app detects the hostname and routes accordingly
3. **Public API Endpoint**: New unauthenticated endpoint serves website JSON by subdomain
4. **Reuse Existing Renderer**: The same React component renderer used in the editor renders published sites
5. **Zero Breaking Changes**: All existing editor, preview, and development workflows remain intact

### How It Works

```
┌─────────────────────────────────────────────────────────────┐
│  User visits: hantharmintun.onlinegif.shop                  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  App.tsx detects subdomain via window.location.hostname     │
│  • localhost/main domain → Normal app routes                │
│  • *.onlinegif.shop → PublishedSite component              │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  PublishedSite component fetches website JSON               │
│  GET /api/public/sites/by-hostname                          │
│  • Backend extracts subdomain from request hostname         │
│  • Looks up Deployment table by subdomain                   │
│  • Returns associated GeneratedWebsite JSON                 │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  Renderer component renders the website JSON                │
│  • Same component used in editor preview                    │
│  • No authentication required                               │
│  • Fast client-side rendering                               │
└─────────────────────────────────────────────────────────────┘
```

## Files Created/Modified

### Backend Changes

#### 1. Created: [`Backend/websiteBuilder_Backend/app/routers/public.py`](Backend/websiteBuilder_Backend/app/routers/public.py:1)
New public API router with unauthenticated endpoints:
- [`/api/public/sites/by-subdomain/{subdomain}`](Backend/websiteBuilder_Backend/app/routers/public.py:23) - Fetch website by subdomain
- [`/api/public/sites/by-hostname`](Backend/websiteBuilder_Backend/app/routers/public.py:60) - Fetch website by detecting hostname from request

Key features:
- No authentication required
- Only serves websites with `status="RUNNING"` from Deployment table
- Returns full website JSON structure
- Proper error handling for 404 cases

#### 2. Modified: [`Backend/websiteBuilder_Backend/app/main.py`](Backend/websiteBuilder_Backend/app/main.py:1)
- Imported and registered [`public`](Backend/websiteBuilder_Backend/app/main.py:9) router
- Added [`allow_origin_regex`](Backend/websiteBuilder_Backend/app/main.py:26) to CORS middleware to allow all `*.onlinegif.shop` subdomains
- Keeps existing `/api/*` routes protected with authentication

### Frontend Changes

#### 3. Created: [`ai-website-builder/src/pages/published.tsx`](ai-website-builder/src/pages/published.tsx:1)
New component for rendering published websites:
- Detects hostname and fetches website JSON from public API
- Uses existing [`Renderer`](ai-website-builder/src/pages/published.tsx:2) component
- Beautiful loading and error states
- No authentication required
- Configurable API URL via environment variables

#### 4. Modified: [`ai-website-builder/src/App.tsx`](ai-website-builder/src/App.tsx:1)
- Added [`isPublishedSiteSubdomain()`](ai-website-builder/src/App.tsx:17) function to detect subdomains
- Conditionally renders:
  - [`PublishedSite`](ai-website-builder/src/App.tsx:46) component for subdomains (e.g., `hantharmintun.onlinegif.shop`)
  - Normal app routes for main domain and localhost
- Detection logic:
  - `localhost` / `127.0.0.1` → Normal app
  - `onlinegif.shop` (no subdomain) → Normal app  
  - `*.onlinegif.shop` → Published site

#### 5. Modified: [`ai-website-builder/.env.development`](ai-website-builder/.env.development:1)
- Set [`VITE_API_BASE_URL=http://localhost:8001`](ai-website-builder/.env.development:3) for development
- Used by [`published.tsx`](ai-website-builder/src/pages/published.tsx:24) to determine backend URL

## Configuration

### Development Environment

1. **Backend**: Should be running on port 8001 (or update `.env.development`)
2. **Frontend**: Vite dev server on port 5173
3. **API URL**: Set in `VITE_API_BASE_URL` environment variable

### Production Environment

1. **Set Production API URL**: Create `.env.production` with:
   ```
   VITE_API_BASE_URL=https://onlinegif.shop
   ```

2. **DNS/Nginx**: Ensure wildcard DNS and reverse proxy configured for `*.onlinegif.shop`

3. **Build**: Run `npm run build` - creates single build serving both app and published sites

## Testing

### Local Testing

Since subdomain detection relies on hostname, local testing requires some workarounds:

#### Option 1: Test with Browser DevTools
```javascript
// In browser console, temporarily override hostname detection
window.location = { hostname: 'testsite.onlinegif.shop' }
```

#### Option 2: Modify `/etc/hosts`
```bash
# Add to /etc/hosts
127.0.0.1 testsite.localhost
```
Then update [`App.tsx`](ai-website-builder/src/App.tsx:17) detection to include `.localhost`:
```typescript
if (hostname.endsWith(".localhost")) {
  return true;
}
```

#### Option 3: Test Backend API Directly
```bash
# Test the public API endpoint
curl http://localhost:8001/api/public/sites/by-subdomain/hantharmintun

# Expected response:
{
  "id": "uuid",
  "website_json": { "type": "Page", "props": {}, "children": [...] },
  "subdomain": "hantharmintun",
  "domain": "https://hantharmintun.onlinegif.shop",
  "version": 1
}
```

### Production Testing

1. **Deploy a Website**: Use the existing deployment flow to deploy a website to a subdomain
2. **Verify Deployment Status**: Ensure deployment status is `"RUNNING"` in database
3. **Access Subdomain**: Visit `https://{subdomain}.onlinegif.shop`
4. **Expected Behavior**:
   - Loading state appears briefly
   - Website JSON is fetched from backend
   - Website renders using React components
   - No authentication required
   - All routes (`/api/*`) still work for authenticated app

## How to Deploy a Website (User Flow)

1. User creates/edits website in [`/editor`](ai-website-builder/src/pages/editor.tsx:1)
2. User saves website (stored as JSON in `generated_websites` table)
3. User deploys website via existing deployment endpoint:
   ```
   POST /api/deployments/websites/{website_id}
   {
     "subdomain": "hantharmintun"
   }
   ```
4. Backend creates deployment with status `"RUNNING"`
5. User's website now accessible at `https://hantharmintun.onlinegif.shop`
6. Published site automatically renders using the new client-side rendering system

## API Endpoints Reference

### Public Endpoints (No Auth Required)

| Endpoint | Method | Description |
|----------|--------|-------------|
| [`/api/public/sites/by-subdomain/{subdomain}`](Backend/websiteBuilder_Backend/app/routers/public.py:23) | GET | Fetch website JSON by subdomain name |
| [`/api/public/sites/by-hostname`](Backend/websiteBuilder_Backend/app/routers/public.py:60) | GET | Fetch website JSON by detecting request hostname |

### Response Format
```json
{
  "id": "uuid",
  "website_json": {
    "type": "Page",
    "props": {},
    "children": [...]
  },
  "subdomain": "hantharmintun",
  "domain": "https://hantharmintun.onlinegif.shop",
  "version": 1
}
```

## Key Features

✅ **Zero Separate Builds**: One React build serves everything  
✅ **Existing Renderer**: Reuses proven component renderer  
✅ **No Breaking Changes**: Editor and preview workflows unchanged  
✅ **Fast Client-Side**: React renders on client, no SSR needed  
✅ **Scalable**: Supports unlimited published sites with one deployment  
✅ **Secure**: Published sites can't access authenticated routes  
✅ **SEO Ready**: Can add meta tags or implement SSR later if needed  

## Troubleshooting

### Issue: "Website Not Found" Error
- **Check**: Is deployment status `"RUNNING"` in database?
- **Check**: Does subdomain match exactly (case-sensitive)?
- **Check**: Is backend accessible from frontend?

### Issue: CORS Error on Subdomain
- **Check**: Is `allow_origin_regex` configured in [`main.py`](Backend/websiteBuilder_Backend/app/main.py:26)?
- **Check**: Does subdomain match pattern `https://.*\.onlinegif\.shop`?

### Issue: Published Site Shows App Routes
- **Check**: Is subdomain detection logic working? (check console)
- **Check**: Does hostname include `.onlinegif.shop`?

### Issue: API Not Found (404)
- **Check**: Is [`public`](Backend/websiteBuilder_Backend/app/routers/public.py:1) router included in [`main.py`](Backend/websiteBuilder_Backend/app/main.py:36)?
- **Check**: Is backend running and accessible?

## Future Enhancements

- **SEO Optimization**: Add server-side rendering or static generation
- **Custom Domains**: Support user-provided custom domains
- **Analytics**: Track page views for published sites
- **Caching**: Add CDN or edge caching for website JSON
- **Preview Mode**: Allow previewing before publishing

## Conclusion

This implementation successfully enables client-side React rendering for published websites while maintaining the existing editor workflow. The solution is scalable, performant, and requires no separate builds per user website.
