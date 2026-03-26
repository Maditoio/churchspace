# Image Upload Troubleshooting Guide

## Critical Issues Found

### 1. **MISSING BLOB_READ_WRITE_TOKEN** ⚠️ CRITICAL
**Status**: ❌ NOT CONFIGURED  
**Location**: Missing from `/Users/sera4/Documents/applications/peerspace/.env` and likely missing from Vercel production environment

**Why this breaks uploads:**
- Your app uses Vercel Blob for storing images
- The server endpoint `/api/blob/upload/route.ts` requires `BLOB_READ_WRITE_TOKEN` to authenticate with Vercel's service
- Without this token, ALL image uploads will fail with a 500 error

**Evidence from code:**
```typescript
// src/app/api/blob/upload/route.ts line 14-18
if (!process.env.BLOB_READ_WRITE_TOKEN) {
  return NextResponse.json(
    { error: "Missing BLOB_READ_WRITE_TOKEN environment variable." },
    { status: 500 },
  );
}
```

---

### 2. **Environment Variables Not Set for Production**
**Status**: ⚠️ MISCONFIGURED

Your `.env` file contains:
```
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

But in **Vercel production**, these need to be:
```
NEXTAUTH_URL=https://churchspaces.vercel.app (or your actual domain)
NEXT_PUBLIC_APP_URL=https://churchspaces.vercel.app
```

---

### 3. **No Diagnostic Endpoint**
**Status**: ✅ CREATED (File: `/api/diagnostic/route.ts`)

This will help you verify environment variables at runtime.

---

## Step-by-Step Fix

### Step 1: Get Your Vercel Blob Token

1. Visit https://vercel.com/dashboard
2. Go to **Settings** → **Tokens**
3. Create a new **Blob Read/Write Token**
4. Copy the token (looks like: `vercel_blob_rw_xxxxxxxxxxxx`)

### Step 2: Set Environment Variables in Vercel

1. Go to your Vercel project: https://vercel.com/dashboard/projects
2. Click on your **peerspace** project
3. Go to **Settings** → **Environment Variables**
4. Add/Update these variables:

| Variable | Type | Value |
|----------|------|-------|
| `BLOB_READ_WRITE_TOKEN` | Encrypted | `vercel_blob_rw_...` (from Step 1) |
| `NEXTAUTH_URL` | Plain | `https://churchspaces.vercel.app` (or your domain) |
| `NEXTAUTH_SECRET` | Encrypted | (Should already exist) |
| `DATABASE_URL` | Encrypted | (Should already exist - Neon connection) |

⚠️ Make sure all variables are available in all environments (Production, Preview, Development)

### Step 3: Redeploy Your Application

```bash
git push origin main
```

Or manually trigger a redeploy in Vercel dashboard →  **Deployments** → **Redeploy**

### Step 4: Test the Diagnostic Endpoint

After redeploy, visit:
```
https://churchspaces.vercel.app/api/diagnostic
```

You should see:
```json
{
  "environment": {
    "nodeEnv": "production",
    "blobTokenExists": true,
    "blobTokenLength": 52,
    "nextAuthUrlExists": true,
    "nextAuthUrl": "https://churchspaces.vercel.app"
  },
  "auth": {
    "userId": "user-id-here"
  }
}
```

If `blobTokenExists` is `false`, the token isn't set.

### Step 5: Test Image Upload

1. Go to https://churchspaces.vercel.app/dashboard/listings/new
2. Fill out listing info
3. On Step 6 (Photos), select some files
4. Click Submit

---

## Debugging Steps If Uploads Still Fail

### A. Check Browser Console for Errors

1. Open DevTools (F12 in Chrome)
2. Go to **Console** tab
3. Attempt to upload an image
4. Look for errors starting with `[UPLOAD]` prefix
5. Click on the error and **copy the full message**

### B. Check Server Logs in Vercel

1. Go to https://vercel.com/dashboard/projects
2. Click **peerspace** project
3. Go to **Deployments**
4. Click the latest deployment
5. Go to **Logs** tab
6. Look for logs starting with `[BLOB]` prefix
7. **Copy the full log output**

### C. Common Error Messages & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| `Missing BLOB_READ_WRITE_TOKEN environment variable` | Token not set in Vercel | Add token to Vercel env vars (Step 2) |
| `Unauthorized: session expired or invalid` | Not logged in or session expired | Sign out and sign back in |
| `Invalid upload path` | Code bug (shouldn't happen) | Contact support |
| `Upload timed out after 120s` | Network too slow or Blob service issue | Retry, or try smaller images |
| `Token generation failed: HTTP 500` | Server error | Check Vercel logs |
| `Blob API request failed (network/CORS)` | Network connectivity issue | Check browser network tab |

---

## Verification Checklist

Before testing, verify:

- [ ] BLOB_READ_WRITE_TOKEN is set in Vercel env vars (not in local .env)
- [ ] NEXTAUTH_URL is set to https:// production URL in Vercel
- [ ] Latest code is deployed (check commit hash in Vercel)
- [ ] You're logged in (check browser Storage for auth token)
- [ ] Images are under 8MB each
- [ ] Browser allows images (no content policies blocking)

---

## File Locations for Reference

| File | Purpose |
|------|---------|
| `/src/app/api/blob/upload/route.ts` | Server endpoint for token generation |
| `/src/components/forms/listing/NewListingWizard.tsx` | Form that calls upload endpoint |
| `/src/components/forms/listing/Step6Photos.tsx` | Photo selection UI |
| `/src/app/api/diagnostic/route.ts` | NEW - Diagnostic endpoint to verify env vars |

---

## Next Steps

1. **Action**: Add BLOB_READ_WRITE_TOKEN to Vercel environment variables
2. **Action**: Redeploy the application
3. **Test**: Visit `/api/diagnostic` to verify configuration
4. **Report**: If still failing, share the error message from Step 5

---

