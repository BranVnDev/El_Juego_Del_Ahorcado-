const fs = require('fs');
const path = require('path');

const bases = [
  'node_modules/expo/node_modules/glob',
  'node_modules/@expo/config/node_modules/glob',
  'node_modules/@expo/config-plugins/node_modules/glob',
  'node_modules/@expo/fingerprint/node_modules/glob',
];

for (const base of bases) {
  const fp = path.join(__dirname, '..', base, 'dist', 'commonjs', 'index.min.js');
  if (fs.existsSync(fp)) {
    let c = fs.readFileSync(fp, 'utf8');
    let orig = c;
    // Fix: }staticX(...) -> }static X(...) where X is a lowercase letter
    c = c.replace(/\}static([a-z])/g, '}static $1');
    // Also fix any remaining }static ( without method name (from previous bad fixes)
    c = c.replace(/\}static \(/g, '}static i(');
    fs.writeFileSync(fp, c, 'utf8');
    const changed = c !== orig;
    console.log(base + ': changed=' + changed);
    if (changed) {
      console.log('  has static i():', c.includes('}static i('));
      console.log('  has static ():', c.includes('}static ('));
    }
  } else {
    console.log(base + ': ' + fp + ' NOT FOUND');
  }
}

// Also fix # private fields in minimatch instances
const minimatchInstances = [
  'node_modules/@expo/config/node_modules/minimatch',
  'node_modules/@expo/config-plugins/node_modules/minimatch',
  'node_modules/@expo/fingerprint/node_modules/minimatch',
  'node_modules/expo/node_modules/minimatch',
];

function patchDir(dir) {
  if (fs.existsSync(dir)) {
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.js'));
    files.forEach(f => {
      const fp = path.join(dir, f);
      let content = fs.readFileSync(fp, 'utf8');
      const original = content;
      content = content.replace(/#(\w+)/g, '$1');
      if (content !== original) {
        fs.writeFileSync(fp, content, 'utf8');
        console.log('  Patched:', path.relative(process.cwd(), fp));
      }
    });
  }
}

for (const base of minimatchInstances) {
  const dir = path.join(__dirname, '..', base);
  if (fs.existsSync(dir)) {
    console.log('Patching minimatch:', base);
    patchDir(path.join(dir, 'dist', 'commonjs'));
    patchDir(path.join(dir, 'dist', 'esm'));
  }
}

console.log('Done');
