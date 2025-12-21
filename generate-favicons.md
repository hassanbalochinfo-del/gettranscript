# Generate Favicons from Your Logo

To replace the default favicon with your logo, you need to generate the following files:

## Required Files

1. `/public/favicon.ico` - Main favicon (multi-resolution ICO file)
2. `/public/favicon-16x16.png` - 16x16 PNG favicon
3. `/public/favicon-32x32.png` - 32x32 PNG favicon
4. `/public/apple-icon.png` - 180x180 PNG for Apple devices (already exists)

## Quick Method: Online Tools

### Option 1: Favicon Generator (Recommended)
1. Go to [https://realfavicongenerator.net/](https://realfavicongenerator.net/)
2. Upload your logo image (PNG, SVG, or JPG)
3. Configure settings:
   - iOS: Use existing `/public/apple-icon.png` or generate new
   - Android: Generate if needed
   - Windows: Generate if needed
4. Download the generated package
5. Extract and copy these files to `/public/`:
   - `favicon.ico`
   - `favicon-16x16.png`
   - `favicon-32x32.png`

### Option 2: Using Your Existing Icon
If you want to use the existing `/public/icon.svg` or `/public/icon-light-32x32.png`:

1. Convert SVG/PNG to ICO:
   - Use [CloudConvert](https://cloudconvert.com/svg-to-ico) or [Convertio](https://convertio.co/png-ico/)
   - Upload your logo
   - Set sizes: 16x16, 32x32, 48x48
   - Download as `favicon.ico`

2. Generate PNG sizes:
   - Use [ImageMagick](https://imagemagick.org/) or online tools
   - Resize your logo to 16x16 → `favicon-16x16.png`
   - Resize your logo to 32x32 → `favicon-32x32.png`

## Using ImageMagick (Command Line)

If you have ImageMagick installed:

```bash
# From your logo file (replace logo.png with your actual logo)
convert logo.png -resize 16x16 public/favicon-16x16.png
convert logo.png -resize 32x32 public/favicon-32x32.png
convert logo.png -define icon:auto-resize=16,32,48 public/favicon.ico
```

## Using Node.js Script

Create a script to generate favicons (requires `sharp` package):

```bash
npm install --save-dev sharp
```

Then create `scripts/generate-favicons.js`:

```javascript
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const logoPath = './public/icon.svg'; // or your logo path
const outputDir = './public';

async function generateFavicons() {
  try {
    // Generate PNG favicons
    await sharp(logoPath)
      .resize(16, 16)
      .png()
      .toFile(path.join(outputDir, 'favicon-16x16.png'));
    
    await sharp(logoPath)
      .resize(32, 32)
      .png()
      .toFile(path.join(outputDir, 'favicon-32x32.png'));
    
    console.log('✅ Favicon PNGs generated successfully!');
    console.log('⚠️  Note: favicon.ico needs to be generated separately using an online tool or ImageMagick');
  } catch (error) {
    console.error('Error generating favicons:', error);
  }
}

generateFavicons();
```

## After Generating

Once you've created the favicon files:
1. Place them in `/public/` directory
2. The Next.js app will automatically use them (already configured in `app/layout.tsx`)
3. Clear browser cache and reload to see the new favicon

## Testing

1. Start your dev server: `npm run dev`
2. Open the site in a browser
3. Check the browser tab - you should see your favicon
4. If you see the old favicon, hard refresh (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)
