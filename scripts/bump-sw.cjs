// Auto-stamp service-worker.js and src/config.js with a content hash.
// Run via: node scripts/bump-sw.cjs
// Called automatically by `npm run build`.
//
// To avoid a circular dependency (hash depends on bundle which contains
// the hash), we first normalize APP_VERSION to a fixed placeholder,
// rebuild, hash the stable output, then stamp the real version.

const fs = require('fs');
const crypto = require('crypto');
const { execSync } = require('child_process');

const PLACEHOLDER = 'VERSION_PLACEHOLDER';
const configFile = 'src/config.js';
const swFile = 'service-worker.js';

// 1. Write placeholder into config.js so the first build is deterministic
const configRaw = fs.readFileSync(configFile, 'utf8');
const configWithPlaceholder = configRaw.replace(
    /export const APP_VERSION = '[^']*'/,
    `export const APP_VERSION = '${PLACEHOLDER}'`
);
if (configWithPlaceholder !== configRaw) {
    fs.writeFileSync(configFile, configWithPlaceholder);
    execSync('npm run build:js', { stdio: 'inherit' });
}

// 2. Hash both bundles (now deterministic — same source always produces same hash)
const hash = crypto.createHash('sha256');
['bundle.js', 'bundle.css'].forEach((f) => hash.update(fs.readFileSync(f)));
const shortHash = hash.digest('hex').slice(0, 12);

// 3. Stamp CACHE_VERSION in service-worker.js
const swVersion = 'bonds-alpha-' + shortHash;
const swContent = fs.readFileSync(swFile, 'utf8');
const swUpdated = swContent.replace(/const CACHE_VERSION = '[^']*'/, `const CACHE_VERSION = '${swVersion}'`);
if (swUpdated !== swContent) {
    fs.writeFileSync(swFile, swUpdated);
}

// 4. Stamp APP_VERSION in src/config.js
const appVersion = 'v1.0.0-alpha-' + shortHash;
const configNow = fs.readFileSync(configFile, 'utf8');
const configStamped = configNow.replace(
    /export const APP_VERSION = '[^']*'/,
    `export const APP_VERSION = '${appVersion}'`
);
fs.writeFileSync(configFile, configStamped);

// 5. Final rebuild with the real version baked in
console.log(`⚡ Version stamped: ${appVersion}`);
execSync('npm run build:js', { stdio: 'inherit' });
