# Favicon Setup - Quick Guide

Your Next.js app is now configured to use custom favicons. Follow these steps to add your logo:

## ✅ What's Already Done

- ✅ Next.js metadata updated to reference favicon files
- ✅ Favicon configuration added to `app/layout.tsx`
- ✅ Script created to generate PNG favicons (`scripts/generate-favicons.js`)

## 🚀 Quick Setup (3 Steps)

### Step 1: Prepare Your Logo

Place your logo file in `/public/` directory. Supported formats:
- PNG (recommended)
- SVG
- JPG

**Example:** `/public/logo.png` or `/public/my-logo.svg`

### Step 2: Generate Favicon Files

**Option A: Online Tool (Easiest - Recommended)**
1. Go to [https://realfavicongenerator.net/](https://realfavicongenerator.net/)
2. Upload your logo
3. Download the generated package
4. Extract these files to `/public/`:
   - `favicon.ico`
   - `favicon-16x16.png`
   - `favicon-32x32.png`

**Option B: Using the Script**
1. Update `scripts/generate-favicons.js` - set `LOGO_PATH` to your logo file
2. Install sharp: `npm install --save-dev sharp`
3. Run: `node scripts/generate-favicons.js`
4. This generates PNG files. For `.ico`, use an online converter or ImageMagick

**Option C: Manual (If you have ImageMagick)**
```bash
# From your logo file
convert logo.png -resize 16x16 public/favicon-16x16.png
convert logo.png -resize 32x32 public/favicon-32x32.png
convert logo.png -define icon:auto-resize=16,32,48 public/favicon.ico
```

### Step 3: Verify

1. Place all three files in `/public/`:
   - ✅ `favicon.ico`
   - ✅ `favicon-16x16.png`
   - ✅ `favicon-32x32.png`

2. Start dev server: `npm run dev`

3. Open your site in a browser

4. Check the browser tab - you should see your logo!

5. If you see the old favicon:
   - Hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)
   - Clear browser cache

## 📁 File Structure

After setup, your `/public/` directory should have:
```
public/
  ├── favicon.ico          ← Main favicon
  ├── favicon-16x16.png   ← 16x16 PNG
  ├── favicon-32x32.png   ← 32x32 PNG
  └── apple-icon.png      ← Already exists (180x180)
```

## 🎨 Using Your Existing Icons

If you want to use the existing `/public/icon.svg` or `/public/icon-light-32x32.png`:

1. Use them as your logo source
2. Follow Step 2 above to generate favicons from them

## ✅ Done!

Once the favicon files are in place, Next.js will automatically use them. No code changes needed!
