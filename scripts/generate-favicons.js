#!/usr/bin/env node

/**
 * Generate favicon files from your logo
 * 
 * Usage:
 *   1. Place your logo file in /public/ (e.g., logo.png, logo.svg)
 *   2. Update LOGO_PATH below to point to your logo
 *   3. Run: node scripts/generate-favicons.js
 * 
 * Requirements:
 *   npm install --save-dev sharp
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Update this path to your logo file
const LOGO_PATH = path.join(__dirname, '../public/icon.svg');
const OUTPUT_DIR = path.join(__dirname, '../public');

async function generateFavicons() {
  try {
    // Check if logo exists
    if (!fs.existsSync(LOGO_PATH)) {
      console.error(`❌ Logo file not found: ${LOGO_PATH}`);
      console.log('💡 Update LOGO_PATH in this script to point to your logo file');
      process.exit(1);
    }

    console.log(`📸 Generating favicons from: ${LOGO_PATH}`);

    // Generate 16x16 PNG
    await sharp(LOGO_PATH)
      .resize(16, 16, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(path.join(OUTPUT_DIR, 'favicon-16x16.png'));
    console.log('✅ Generated favicon-16x16.png');

    // Generate 32x32 PNG
    await sharp(LOGO_PATH)
      .resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(path.join(OUTPUT_DIR, 'favicon-32x32.png'));
    console.log('✅ Generated favicon-32x32.png');

    console.log('\n⚠️  Note: favicon.ico needs to be generated separately');
    console.log('   Use an online tool like https://realfavicongenerator.net/');
    console.log('   Or use ImageMagick: convert favicon-32x32.png -define icon:auto-resize=16,32,48 favicon.ico');
    console.log('\n✨ Favicon PNGs are ready! Place favicon.ico in /public/ to complete the setup.');

  } catch (error) {
    console.error('❌ Error generating favicons:', error.message);
    if (error.message.includes('sharp')) {
      console.log('\n💡 Install sharp: npm install --save-dev sharp');
    }
    process.exit(1);
  }
}

generateFavicons();
