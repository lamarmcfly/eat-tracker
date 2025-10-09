# How to Add Your Logo

## Quick Steps

1. **Save your logo image** as `eat-logo.png` (PNG format recommended)
2. **Replace the file** at: `public/eat-logo.png`
3. **Push to GitHub** and Vercel will auto-deploy

## Recommended Logo Specifications

- **Format**: PNG with transparent background
- **Size**: 500x500 pixels (will be scaled automatically)
- **File name**: Must be exactly `eat-logo.png`
- **Location**: `public/eat-logo.png`

## Two Ways to Update

### Option 1: Via GitHub (Easiest)
1. Go to: https://github.com/lamarmcfly/eat-tracker
2. Navigate to: `public/eat-logo.png`
3. Click "Edit" or "Upload"
4. Replace with your logo file
5. Commit changes
6. Vercel auto-deploys in ~2 minutes

### Option 2: Via Local Files
1. Open folder: `C:\Users\lmar3\eat-tracker\public\`
2. Replace `eat-logo.png` with your logo
3. Run in terminal:
   ```bash
   cd c:/Users/lmar3/eat-tracker
   git add public/eat-logo.png
   git commit -m "Update logo"
   git push origin main
   ```
4. Vercel auto-deploys

## Current Layout

Your logo will appear:
- **Blue hero banner**: Large centered logo (192x192px) between title and Quick Log box
- Automatically scaled for mobile/desktop
- White semi-transparent background for visibility

## Need Different Placement?

Edit `app/page.tsx` around line 31-39 to change logo size/position.
