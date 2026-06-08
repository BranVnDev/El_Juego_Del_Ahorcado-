const fs = require('fs');
const p = require('path');
const filePath = p.join(__dirname, '..', 'node_modules', 'expo', 'node_modules', 'glob', 'dist', 'commonjs', 'index.min.js');
let c = fs.readFileSync(filePath, 'utf8');
const pattern = /\}static[^;{]+/g;
let m;
let count = 0;
while ((m = pattern.exec(c)) && count < 10) {
  console.log(m[0].substring(0, 50));
  count++;
}
console.log('---');
const idx1 = c.indexOf('static i(');
console.log('"static i(" at:', idx1, 'ctx:', idx1 >= 0 ? c.substring(idx1, idx1+30) : 'not found');
const idx2 = c.indexOf('static v(');
console.log('"static v(" at:', idx2, 'ctx:', idx2 >= 0 ? c.substring(idx2, idx2+30) : 'not found');
const idx3 = c.indexOf('static fromGlob(');
console.log('"static fromGlob(" at:', idx3, 'ctx:', idx3 >= 0 ? c.substring(idx3, idx3+30) : 'not found');
// Check for any remaining staticX without space
const wrong = c.match(/\}static[a-z]/g);
if (wrong) console.log('Remaining staticX issues:', wrong);
else console.log('No remaining staticX issues found');
