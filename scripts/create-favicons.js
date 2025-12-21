#!/usr/bin/env node

/**
 * Generate favicon files from SVG logo
 * Creates: favicon.ico, favicon-16x16.png, favicon-32x32.png
 */

const fs = require('fs');
const path = require('path');

// SVG templates for different sizes
const createFaviconSVG = (size, isDark = false) => {
  const bgColor = isDark ? '#1a1a1a' : '#ef4444';
  const textColor = isDark ? '#ef4444' : '#ffffff';
  const scale = size / 32;
  
  return `<svg width="${size}" height="${size}" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect fill="${bgColor}" width="32" height="32" rx="${6 * scale}" />
  <path fill="${textColor}" d="M ${10 * scale} ${8 * scale} L ${10 * scale} ${24 * scale} L ${22 * scale} ${16 * scale} Z" />
  <rect fill="${textColor}" x="${6 * scale}" y="${26 * scale}" width="${20 * scale}" height="${1.5 * scale}" rx="${0.75 * scale}" opacity="0.9" />
  <rect fill="${textColor}" x="${6 * scale}" y="${28.5 * scale}" width="${14 * scale}" height="${1.5 * scale}" rx="${0.75 * scale}" opacity="0.7" />
</svg>`;
};

// For ICO, we'll create a simple approach
// Note: This creates SVG files that can be converted to ICO/PNG using online tools
// For actual binary generation, we'd need sharp or canvas

const publicDir = path.join(__dirname, '../public');

// Create 16x16 PNG SVG (will be converted)
const svg16 = createFaviconSVG(16, false);
fs.writeFileSync(path.join(publicDir, 'favicon-16x16-temp.svg'), svg16);

// Create 32x32 PNG SVG (will be converted)
const svg32 = createFaviconSVG(32, false);
fs.writeFileSync(path.join(publicDir, 'favicon-32x32-temp.svg'), svg32);

console.log('✅ Created SVG templates for favicon generation');
console.log('📝 Next steps:');
console.log('   1. Install sharp: npm install --save-dev sharp');
console.log('   2. Run the conversion script, OR');
console.log('   3. Use an online tool like https://realfavicongenerator.net/');
console.log('      Upload favicon.svg and download the generated files');
