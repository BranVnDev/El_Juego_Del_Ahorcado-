const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

function patchFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const original = content;
    content = content.replace(/#(\w+)/g, '$1');
    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('  Patched #:', path.relative(ROOT, filePath));
    }
  } catch (e) {
    console.error('Error patching', filePath, e.message);
  }
}

function patchDir(dir) {
  if (fs.existsSync(dir)) {
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.js'));
    files.forEach(f => patchFile(path.join(dir, f)));
  }
}

function patchIndexMinJs(globBase) {
  const fp = path.join(globBase, 'dist', 'commonjs', 'index.min.js');
  if (fs.existsSync(fp)) {
    let content = fs.readFileSync(fp, 'utf8');
    const original = content;
    // Fix: }staticX(...) -> }static X(...) (missing space after static keyword)
    content = content.replace(/\}static([a-z])/g, '}static $1');
    if (content !== original) {
      fs.writeFileSync(fp, content, 'utf8');
      console.log('  Fixed static:', path.relative(ROOT, fp));
    }
  }
}

const GLOB_INSTANCES = [
  'expo/node_modules/glob',
  '@expo/config/node_modules/glob',
  '@expo/config-plugins/node_modules/glob',
  '@expo/fingerprint/node_modules/glob',
];

const MINIMATCH_INSTANCES = [
  'expo/node_modules/minimatch',
  'expo/node_modules/glob/node_modules/minimatch',
  '@expo/config/node_modules/minimatch',
  '@expo/config-plugins/node_modules/minimatch',
  '@expo/fingerprint/node_modules/minimatch',
];

console.log('=== Fixing glob index.min.js files ===');
for (const g of GLOB_INSTANCES) {
  const base = path.join(ROOT, 'node_modules', g);
  if (fs.existsSync(base + '.') || fs.existsSync(base)) {
    patchIndexMinJs(base);
  }
}

console.log('=== Patching minimatch dist files ===');
for (const m of MINIMATCH_INSTANCES) {
  const base = path.join(ROOT, 'node_modules', m);
  if (fs.existsSync(base)) {
    console.log('Minimatch:', m);
    patchDir(path.join(base, 'dist', 'commonjs'));
    patchDir(path.join(base, 'dist', 'esm'));
  }
}

console.log('=== Patching glob dist files ===');
for (const g of GLOB_INSTANCES) {
  const base = path.join(ROOT, 'node_modules', g);
  if (fs.existsSync(base)) {
    console.log('Glob:', g);
    patchDir(path.join(base, 'dist', 'commonjs'));
    patchDir(path.join(base, 'dist', 'esm'));
  }
}

console.log('Done');
