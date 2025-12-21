#!/usr/bin/env node

/**
 * Generate favicon.ico from PNG files
 * Requires: npm install --save-dev to-ico
 */

const toIco = require('to-ico');
const fs = require('fs');
const path = require('path');

async function generateICO() {
  try {
    const publicDir = path.join(__dirname, '../public');
    
    // Read PNG files
    const png16 = fs.readFileSync(path.join(publicDir, 'favicon-16x16.png'));
    const png32 = fs.readFileSync(path.join(publicDir, 'favicon-32x32.png'));
    
    // Create ICO with multiple sizes
    const ico = await toIco([png16, png32]);
    
    // Write ICO file
    fs.writeFileSync(path.join(publicDir, 'favicon.ico'), ico);
    
    console.log('✅ Generated favicon.ico');
  } catch (error) {
    console.error('❌ Error generating ICO:', error.message);
    if (error.message.includes('to-ico')) {
      console.log('💡 Install to-ico: npm install --save-dev to-ico');
    }
    process.exit(1);
  }
}

generateICO();
