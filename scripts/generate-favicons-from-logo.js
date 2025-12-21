#!/usr/bin/env node

/**
 * Generate favicon files from logo.svg
 * 
 * Requirements: npm install --save-dev sharp
 * Run: node scripts/generate-favicons-from-logo.js
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const LOGO_PATH = path.join(__dirname, '../public/logo.svg');
const OUTPUT_DIR = path.join(__dirname, '../public');

// Green background for favicon (better visibility)
const GREEN_BG = { r: 16, g: 185, b: 129, alpha: 1 }; // #10b981

async function generateFavicons() {
  try {
    if (!fs.existsSync(LOGO_PATH)) {
      console.error(`❌ Logo file not found: ${LOGO_PATH}`);
      process.exit(1);
    }

    console.log('🎨 Generating favicons from logo.svg...\n');

    // Generate 16x16 PNG with green background
    await sharp(LOGO_PATH)
      .resize(16, 16, { 
        fit: 'contain',
        background: GREEN_BG
      })
      .png()
      .toFile(path.join(OUTPUT_DIR, 'favicon-16x16.png'));
    console.log('✅ Generated favicon-16x16.png');

    // Generate 32x32 PNG with green background
    await sharp(LOGO_PATH)
      .resize(32, 32, { 
        fit: 'contain',
        background: GREEN_BG
      })
      .png()
      .toFile(path.join(OUTPUT_DIR, 'favicon-32x32.png'));
    console.log('✅ Generated favicon-32x32.png');

    // Generate 180x180 for apple-icon (if needed)
    await sharp(LOGO_PATH)
      .resize(180, 180, { 
        fit: 'contain',
        background: GREEN_BG
      })
      .png()
      .toFile(path.join(OUTPUT_DIR, 'apple-icon.png'));
    console.log('✅ Generated apple-icon.png');

    // Generate ICO file (multi-resolution)
    // Note: sharp doesn't support ICO directly, so we'll create it from PNGs
    const icoSizes = [16, 32, 48];
    const icoImages = [];
    
    for (const size of icoSizes) {
      const buffer = await sharp(LOGO_PATH)
        .resize(size, size, { 
          fit: 'contain',
          background: GREEN_BG
        })
        .png()
        .toBuffer();
      icoImages.push({ size, buffer });
    }

    // For ICO, we need a different approach - use online tool or ImageMagick
    console.log('\n⚠️  favicon.ico needs to be generated separately');
    console.log('   Option 1: Use https://realfavicongenerator.net/');
    console.log('   Option 2: Use ImageMagick:');
    console.log('     convert favicon-32x32.png -define icon:auto-resize=16,32,48 favicon.ico');
    console.log('\n✨ PNG favicons are ready!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.message.includes('sharp')) {
      console.log('\n💡 Install sharp: npm install --save-dev sharp');
    }
    process.exit(1);
  }
}

generateFavicons();
