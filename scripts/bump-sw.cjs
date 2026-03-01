// Auto-stamp service-worker.js and src/config.js with a content hash.
// Run via: node scripts/bump-sw.cjs
// Called automatically by `npm run build`.

const fs = require('fs');
const crypto = require('crypto');
const { execSync } = require('child_process');

// 1. Hash both bundles from the first build pass
const hash = crypto.createHash('sha256');
['bundle.js', 'bundle.css'].forEach((f) => hash.update(fs.readFileSync(f)));
const shortHash = hash.digest('hex').slice(0, 12);
const version = 'bonds-alpha-' + shortHash;

// 2. Stamp CACHE_VERSION in service-worker.js
const swFile = 'service-worker.js';
const swContent = fs.readFileSync(swFile, 'utf8');
const swMatch = swContent.match(/const CACHE_VERSION = '([^']*)'/);
const swChanged = !swMatch || swMatch[1] !== version;
if (swChanged) {
    const swUpdated = swContent.replace(/const CACHE_VERSION = '[^']*'/, `const CACHE_VERSION = '${version}'`);
    fs.writeFileSync(swFile, swUpdated);
}

// 3. Stamp APP_VERSION in src/config.js (same hash)
const appVersion = 'v1.0.0-alpha-' + shortHash;
const configFile = 'src/config.js';
const configContent = fs.readFileSync(configFile, 'utf8');
const configUpdated = configContent.replace(
    /export const APP_VERSION = '[^']*'/,
    `export const APP_VERSION = '${appVersion}'`
);
const configChanged = configUpdated !== configContent;
if (configChanged) {
    fs.writeFileSync(configFile, configUpdated);
}

// 4. If config changed, rebuild JS so the version is baked into the bundle
if (configChanged) {
    console.log(`⚡ Version stamped: ${appVersion}`);
    execSync('npm run build:js', { stdio: 'inherit' });
} else {
    console.log(`⚡ Version unchanged: ${appVersion}`);
}
