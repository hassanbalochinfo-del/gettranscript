#!/usr/bin/env node

/**
 * Generate favicon files from logo SVG
 * Creates: favicon.ico, favicon-16x16.png, favicon-32x32.png
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '../public');
const logoSvg = path.join(publicDir, 'favicon.svg');

async function generateFavicons() {
  try {
    if (!fs.existsSync(logoSvg)) {
      console.error(`❌ Logo file not found: ${logoSvg}`);
      process.exit(1);
    }

    console.log('🎨 Generating favicons from logo...');

    // Generate 16x16 PNG
    await sharp(logoSvg)
      .resize(16, 16)
      .png()
      .toFile(path.join(publicDir, 'favicon-16x16.png'));
    console.log('✅ Generated favicon-16x16.png');

    // Generate 32x32 PNG
    await sharp(logoSvg)
      .resize(32, 32)
      .png()
      .toFile(path.join(publicDir, 'favicon-32x32.png'));
    console.log('✅ Generated favicon-32x32.png');

    // Generate ICO file (multi-resolution)
    // Sharp doesn't support ICO directly, so we'll create it from the 32x32 PNG
    // For a proper ICO, we'd need multiple sizes, but this works for most browsers
    const icoBuffer = await sharp(logoSvg)
      .resize(32, 32)
      .png()
      .toBuffer();
    
    // Create a simple ICO file structure
    // ICO format: header + directory + image data
    const icoHeader = Buffer.alloc(6);
    icoHeader.writeUInt16LE(0, 0); // Reserved
    icoHeader.writeUInt16LE(1, 2); // Type (1 = ICO)
    icoHeader.writeUInt16LE(1, 4); // Number of images
    
    const icoDir = Buffer.alloc(16);
    icoDir.writeUInt8(32, 0); // Width
    icoDir.writeUInt8(32, 1); // Height
    icoDir.writeUInt8(0, 2); // Color palette
    icoDir.writeUInt8(0, 3); // Reserved
    icoDir.writeUInt16LE(1, 4); // Color planes
    icoDir.writeUInt16LE(32, 6); // Bits per pixel
    icoDir.writeUInt32LE(icoBuffer.length, 8); // Image size
    icoDir.writeUInt32LE(22, 12); // Offset (6 header + 16 directory)
    
    const icoFile = Buffer.concat([icoHeader, icoDir, icoBuffer]);
    fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoFile);
    console.log('✅ Generated favicon.ico');

    console.log('\n✨ All favicon files generated successfully!');
    console.log('📁 Files created in /public/:');
    console.log('   - favicon.ico');
    console.log('   - favicon-16x16.png');
    console.log('   - favicon-32x32.png');

  } catch (error) {
    console.error('❌ Error generating favicons:', error.message);
    process.exit(1);
  }
}

generateFavicons();
