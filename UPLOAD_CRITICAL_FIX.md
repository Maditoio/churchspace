# 🔧 Complete Image Upload Fix - Action Required

## Summary

I've identified **one critical blocking issue** preventing image uploads: your `BLOB_READ_WRITE_TOKEN` is not configured in your Vercel production environment.

---

## ❌ Critical Issue: Missing BLOB_READ_WRITE_TOKEN

### What's Wrong
Your app uses **Vercel Blob** for cloud image storage. Every time you try to upload an image, the server attempts to call Vercel's API using the `BLOB_READ_WRITE_TOKEN` environment variable. 

**This variable is NOT set** → all uploads fail with a 500 error.

### How I Know
- Your `.env` file doesn't have `BLOB_READ_WRITE_TOKEN` (confirmed in file: missing completely)
- Your code requires it: `src/app/api/blob/upload/route.ts` line 14-18 checks for it
- When the token is missing, the server returns: `"error": "Missing BLOB_READ_WRITE_TOKEN environment variable."`

### Evidence
```typescript
// src/app/api/blob/upload/route.ts
if (!process.env.BLOB_READ_WRITE_TOKEN) {
  return NextResponse.json(
    { error: "Missing BLOB_READ_WRITE_TOKEN environment variable." },
    { status: 500 },
  );
}
```

---

## ✅ The Fix (3 Steps)

### Step 1: Generate a Blob Read/Write Token from Vercel

1. **Go to** https://vercel.com/account/tokens
2. Click **"Create"** button
3. **Token Name**: `Blob Read/Write Token` (or any descriptive name)
4. **Scope**: Select your **peerspace** project
5. **Token Type**: Select **Blob Read/Write Token**
6. Click **"Create"**
7. **Copy the token** (looks like: `vercel_blob_rw_xxxxxxxxxxxxxxxxxxxxx`)

**IMPORTANT**: Store this token securely. You'll need it in the next step.

---

### Step 2: Add Token to Vercel Environment Variables

1. **Open** https://vercel.com/dashboard/projects
2. **Click** your **peerspace** project
3. **Go to** Settings → **Environment Variables**
4. **Click** "Add New"
5. Fill in:
   - **Name**: `BLOB_READ_WRITE_TOKEN`
   - **Value**: *Paste the token from Step 1*
   - **Environments**: Select **Production**, **Preview**, and **Development** (all three)
6. **Click** "Save"

#### Verify All Required Variables Are Set

Your environment variables should now include:

| Variable | Type | Status |
|----------|------|--------|
| `BLOB_READ_WRITE_TOKEN` | ✨ Encrypted | **ADD THIS** |
| `NEXTAUTH_SECRET` | ✨ Encrypted | ✓ Should exist |
| `DATABASE_URL` | ✨ Encrypted | ✓ Should exist (Neon) |
| `NEXTAUTH_URL` | Plain Text | Check → should be `https://churchspace.vercel.app` |
| `NEXT_PUBLIC_APP_URL` | Plain Text | Check → should be `https://churchspace.vercel.app` |
| `RESEND_API_KEY` | ✨ Encrypted | Check → for email |

**Note**: If `NEXTAUTH_URL` in Vercel still says `http://localhost:3000`, update it to your production URL.

---

### Step 3: Redeploy Your Application

Deploy with the new environment variables:

**Option A: Automatic (Git Push)**
```bash
git push origin main
```
This triggers Vercel to redeploy automatically.

**Option B: Manual Redeployment**
1. Go to https://vercel.com/dashboard/projects
2. Click **peerspace**
3. Go to **Deployments** tab
4. Find the latest deployment
5. Click the **three dots** menu → **Redeploy**

**Wait**: Redeployment takes 2-5 minutes. You'll see a green checkmark when complete.

---

## 🧪 Test the Fix

### Step 1: Verify Environment Variables Are Set

After redeploy completes, visit this diagnostic endpoint:

```
https://churchspace.vercel.app/api/diagnostic
```

You should see (assuming you're logged in):
```json
{
  "timestamp": "2026-03-18T10:30:45.123Z",
  "environment": {
    "nodeEnv": "production",
    "blobTokenExists": true,
    "blobTokenLength": 52,
    "nextAuthUrlExists": true,
    "nextAuthUrl": "https://churchspace.vercel.app"
  },
  "auth": {
    "userId": "your-user-id-here"
  }
}
```

**If `blobTokenExists` is `false`**: The token isn't set yet. Go back to Step 2 and verify it was saved.

---

### Step 2: Test Image Upload

1. **Go to** https://churchspace.vercel.app/dashboard/listings/new
2. **Fill out** listing details (need title ≥10 chars, description ≥100 chars)
3. Click **Next Step** until you reach **Step 6 (Photos)**
4. **Click** "Choose Photos"
5. **Select** 1-2 test images (any size under 8MB)
6. **Click** "Next Step" → **Step 7**
7. **Click** "Submit for Review"
8. **Wait** 5-30 seconds for upload to complete

---

## 📊 Expected Behavior After Fix

### Success Case
- ✅ Toast message: "Listing submitted for review."
- ✅ Listing appears in your dashboard with uploaded images
- ✅ No error messages in browser console

### Partial Success
- ✅ Listing created successfully
- ⚠️ Some images failed to upload
- ⚠️ Toast message: "Listing submitted for review, but some images failed to upload."
- ✅ Shows which specific files failed and why

### Failure Case
- ❌ Toast message shows specific error reason
- ❌ Browser console has logs starting with `[UPLOAD]` prefix
- ❌ Vercel logs show error details (see debugging section below)

---

## 🧼 Cleaning Up Local Development

Your local `.env` file is for development only. **Do NOT add the production token to your local `.env`**. Instead, for local testing:

**Option 1: Use a Separate Local Token** (if you have Vercel local setup)
```bash
vercel env pull  # This downloads env vars from Vercel
```

**Option 2: Skip Local Upload Testing**
Just test on production (Vercel) after deployment.

---

## 🐛 Debugging If Upload Still Fails

### Check Browser Console
1. Open DevTools: **F12** (Chrome) or **Cmd+Option+J** (Mac Safari)
2. Go to **Console** tab
3. Look for logs starting with `[UPLOAD]` prefix
4. **Copy the full error message**
5. **Share it** with me for diagnosis

### Check Vercel Server Logs
1. Go to https://vercel.com/dashboard/projects
2. Click **peerspace**
3. Go to **Deployments** tab
4. Click the **latest deployment**
5. Go to **Logs** tab
6. Look for logs starting with `[BLOB]` prefix
7. **Copy any error logs**

### Common Failed Upload Reasons

| Error Message | Cause | Solution |
|---|---|---|
| `Missing BLOB_READ_WRITE_TOKEN environment variable` | Token not set | Do Steps 1-3 above |
| `Unauthorized: session expired or invalid` | Session expired | Sign out, clear cookies, sign back in |
| `Upload timed out after 120s` | Network too slow | Retry, or split into multiple uploads |
| `Token generation failed: HTTP 500` | Server error | Check Vercel logs for details |
| `Blob API request failed (network/CORS)` | Network issue | Check browser Network tab for blocked requests |

---

## 📝 Files Changed Today

| File | What Changed | Why |
|------|---|---|
| `src/app/api/diagnostic/route.ts` | ✨ NEW | Endpoint to verify env vars are set |
| `src/components/forms/listing/NewListingWizard.tsx` | Enhanced error logging | Better error messages when upload fails |
| `UPLOAD_FIX_GUIDE.md` | ✨ NEW | Detailed troubleshooting guide |

---

## ✨ What's Next After This Works?

Once uploads are working:
1. Test with multiple images (5-10 files)
2. Test with different image sizes
3. Monitor Vercel Analytics for upload success rate
4. *(Optional)* Add upload progress bar for better UX
5. *(Optional)* Add client-side image re-encoding to compress before upload

---

## 🆘 Still Stuck?

**If uploads still fail after following all steps:**

1. **Verify the token was set**: Visit `/api/diagnostic` and check `blobTokenExists`
2. **Check server logs**: Look in Vercel Deployments → Logs for `[BLOB]` prefix
3. **Share error details**: Copy the full error message from browser console or server logs
4. **Confirm redeploy**: Make sure you waited for green checkmark on Vercel

---

## 🎯 Summary of Your Image Upload Flow (Post-Fix)

```
User selects images (Step 6)
    ↓
User submits form (Step 7)
    ↓
Server creates listing (/api/listings POST)
    ↓
For each image:
    ├─ 1. Request upload token from /api/blob/upload ← Uses BLOB_READ_WRITE_TOKEN
    ├─ 2. Upload image to Vercel Blob ← Uses token from step 1
    └─ 3. Attach image URL to listing (/api/listings/{id}/images POST)
    ↓
Show success toast (or partial-success if some images failed)
    ↓
Redirect to listings dashboard
```

**All steps work once BLOB_READ_WRITE_TOKEN is set. Without it, step 1 fails and subsequent steps never execute.**

---

**Commit**: `75d6c5a` - Added diagnostic endpoint and improved error logging  
**Status**: Ready for deployment ✅
