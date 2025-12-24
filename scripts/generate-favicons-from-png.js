#!/usr/bin/env node

/**
 * Generate favicon files from logo-gt.png
 * 
 * Requirements: npm install --save-dev sharp to-ico
 * Run: node scripts/generate-favicons-from-png.js
 */

const sharp = require('sharp');
const toIco = require('to-ico');
const fs = require('fs');
const path = require('path');

const LOGO_PATH = path.join(__dirname, '../public/logo-gt.png');
const OUTPUT_DIR = path.join(__dirname, '../public');

async function generateFavicons() {
  try {
    if (!fs.existsSync(LOGO_PATH)) {
      console.error(`❌ Logo file not found: ${LOGO_PATH}`);
      process.exit(1);
    }

    console.log('🎨 Generating favicons from logo-gt.png...\n');

    // Generate 16x16 PNG
    await sharp(LOGO_PATH)
      .resize(16, 16, { 
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toFile(path.join(OUTPUT_DIR, 'favicon-16x16.png'));
    console.log('✅ Generated favicon-16x16.png');

    // Generate 32x32 PNG
    await sharp(LOGO_PATH)
      .resize(32, 32, { 
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toFile(path.join(OUTPUT_DIR, 'favicon-32x32.png'));
    console.log('✅ Generated favicon-32x32.png');

    // Generate 180x180 for apple-icon
    await sharp(LOGO_PATH)
      .resize(180, 180, { 
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toFile(path.join(OUTPUT_DIR, 'apple-icon.png'));
    console.log('✅ Generated apple-icon.png');

    // Generate ICO file (multi-resolution)
    const icoSizes = [16, 32];
    const icoBuffers = [];
    
    for (const size of icoSizes) {
      const buffer = await sharp(LOGO_PATH)
        .resize(size, size, { 
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .png()
        .toBuffer();
      icoBuffers.push(buffer);
    }

    const icoBuffer = await toIco(icoBuffers);
    fs.writeFileSync(path.join(OUTPUT_DIR, 'favicon.ico'), icoBuffer);
    console.log('✅ Generated favicon.ico');

    console.log('\n✨ All favicons generated successfully!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.message.includes('sharp')) {
      console.log('\n💡 Install sharp: npm install --save-dev sharp');
    }
    if (error.message.includes('to-ico')) {
      console.log('\n💡 Install to-ico: npm install --save-dev to-ico');
    }
    process.exit(1);
  }
}

generateFavicons();
