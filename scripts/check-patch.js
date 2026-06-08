const fs = require('fs');
const path = require('path');

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  let issues = [];
  lines.forEach((l, i) => {
    // Check for # in what looks like string literals (between quotes)
    const stringMatches = l.match(/'[^']*#[^']*'/g);
    if (stringMatches) {
      stringMatches.forEach(m => {
        if (!m.includes('sourceMappingURL')) {
          issues.push({ line: i+1, match: m });
        }
      });
    }
  });
  return issues;
}

const files = [
  'node_modules/expo/node_modules/glob/dist/commonjs/pattern.js',
  'node_modules/expo/node_modules/glob/dist/commonjs/walker.js',
  'node_modules/expo/node_modules/glob/dist/esm/pattern.js',
  'node_modules/expo/node_modules/glob/dist/esm/walker.js',
];

files.forEach(f => {
  const fp = path.join(__dirname, '..', f);
  if (fs.existsSync(fp)) {
    const issues = checkFile(fp);
    if (issues.length > 0) {
      console.log('Issues in', f);
      issues.forEach(i => console.log('  line', i.line, ':', i.match));
    } else {
      console.log('OK:', f);
    }
  }
});
