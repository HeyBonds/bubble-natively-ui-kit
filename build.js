#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(__dirname, 'src');
const OUTPUT_FILE = path.join(__dirname, 'bundle.js');

async function build() {
  console.log('🔨 Building bundle.js...');
  
  // Check if src directory exists
  if (!fs.existsSync(SRC_DIR)) {
    console.error('❌ Error: src/ directory not found');
    process.exit(1);
  }
  
  // Read all files from src/ directory
  const files = fs.readdirSync(SRC_DIR)
    .filter(file => file.endsWith('.js'))
    .sort(); // Alphabetical sort = numeric prefix order
  
  if (files.length === 0) {
    console.error('❌ Error: No .js files found in src/');
    process.exit(1);
  }
  
  console.log(`📦 Found ${files.length} source files:`);
  files.forEach(file => console.log(`   - ${file}`));
  
  // Concatenate all files
  let bundleContent = '';
  
  files.forEach(file => {
    const filePath = path.join(SRC_DIR, file);
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Add source marker comment for debugging (only if not minifying later, or keep it?)
    // If minifying, these comments will disappear anyway.
    bundleContent += `\n/* ========================================= */\n`;
    bundleContent += `/* SOURCE: ${file} */\n`;
    bundleContent += `/* ========================================= */\n`;
    bundleContent += content;
    bundleContent += '\n';
  });

  // Check for minify flag
  if (process.argv.includes('--minify')) {
    console.log('⚡ Minifying bundle...');
    try {
      const { minify } = require('terser');
      const result = await minify(bundleContent, {
        sourceMap: false, // Add true if we want source maps later
        compress: true,
        mangle: true
      });
      if (result.code) {
        bundleContent = result.code;
      }
    } catch (err) {
      console.error('❌ Minification failed:', err);
      process.exit(1);
    }
  }
  
  // Write to bundle.js
  fs.writeFileSync(OUTPUT_FILE, bundleContent, 'utf8');
  
  const sizeKB = (fs.statSync(OUTPUT_FILE).size / 1024).toFixed(2);
  console.log(`✅ Built bundle.js (${sizeKB} KB)`);
}

// Watch mode
if (process.argv.includes('--watch')) {
  console.log('👀 Watch mode enabled. Press Ctrl+C to exit.\n');
  
  build();
  
  fs.watch(SRC_DIR, { recursive: true }, (eventType, filename) => {
    if (filename && filename.endsWith('.js')) {
      console.log(`\n🔄 Change detected: ${filename}`);
      build();
    }
  });
} else {
  build();
}
