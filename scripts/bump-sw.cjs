// Auto-stamp service-worker.js with a content hash of the bundle files.
// Only writes if the hash actually changed, so no spurious git diffs.
// Run via: node scripts/bump-sw.cjs
// Called automatically by `npm run build`.

const fs = require('fs');
const crypto = require('crypto');

const bundles = ['bundle.js', 'bundle.css'];
const hash = crypto.createHash('sha256');
bundles.forEach((f) => hash.update(fs.readFileSync(f)));
const version = 'bonds-' + hash.digest('hex').slice(0, 12);

const file = 'service-worker.js';
const content = fs.readFileSync(file, 'utf8');

// Check if version already matches — skip write to avoid dirty diff
const match = content.match(/const CACHE_VERSION = '([^']*)'/);
if (match && match[1] === version) {
    console.log(`⚡ SW cache version unchanged: ${version}`);
    process.exit(0);
}

const updated = content.replace(/const CACHE_VERSION = '[^']*'/, `const CACHE_VERSION = '${version}'`);
fs.writeFileSync(file, updated);

console.log(`⚡ SW cache version bumped: ${version}`);
