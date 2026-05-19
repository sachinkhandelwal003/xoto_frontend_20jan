const fs = require('fs');
const path = require('path');

const srcDir = path.resolve('src');

function getAllJsFiles(dir) {
  let results = [];
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, item.name);
    if (item.isDirectory()) results = results.concat(getAllJsFiles(full));
    else if (/\.(jsx|js|tsx|ts)$/.test(item.name)) results.push(full);
  }
  return results;
}

// Build exact real path map: lowercase -> exact real path
function buildMap(dir, map) {
  if (!map) map = {};
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, item.name);
    map[full.toLowerCase()] = full; // real path with correct case
    if (item.isDirectory()) buildMap(full, map);
  }
  return map;
}

const pathMap = buildMap(srcDir);

function findReal(base) {
  const tries = [
    base, base+'.jsx', base+'.js', base+'.tsx', base+'.ts',
    base+'/index.jsx', base+'/index.js', base+'/index.tsx', base+'/index.ts'
  ];
  for (const t of tries) {
    const real = pathMap[t.toLowerCase()];
    if (real) return real;
  }
  return null;
}

const files = getAllJsFiles(srcDir);
let totalFixed = 0;
let totalFiles = 0;

for (const file of files) {
  let content;
  try { content = fs.readFileSync(file, 'utf8'); } catch(e) { continue; }

  let newContent = content;
  const importRe = /from\s+['"](\.[^'"?#\s]+)/g;
  let match;
  const fixes = [];

  while ((match = importRe.exec(content)) !== null) {
    const imp = match[1];
    const base = path.resolve(path.dirname(file), imp);
    const real = findReal(base);
    if (!real) continue;

    // Compute what the correct relative import should be
    const realNoExt = real.replace(/\.(jsx|js|tsx|ts)$/, '');
    let corrected = path.relative(path.dirname(file), realNoExt).replace(/\\/g, '/');
    if (!corrected.startsWith('.')) corrected = './' + corrected;

    // Only fix if case actually differs
    if (corrected.toLowerCase() !== imp.toLowerCase()) continue; // different path entirely
    if (corrected === imp) continue; // already correct

    fixes.push({ from: imp, to: corrected });
  }

  if (fixes.length > 0) {
    totalFiles++;
    for (const fix of fixes) {
      const escaped = fix.from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const re = new RegExp('(from\\s+[\'"])' + escaped + '([\'"])', 'g');
      newContent = newContent.replace(re, '$1' + fix.to + '$2');
      totalFixed++;
      const shortFile = file.replace(srcDir, 'src').replace(/\\/g, '/');
      console.log('FIXED: ' + shortFile);
      console.log('  "' + fix.from + '"  ->  "' + fix.to + '"');
    }
    fs.writeFileSync(file, newContent, 'utf8');
  }
}

console.log('\nDone! Fixed ' + totalFixed + ' imports in ' + totalFiles + ' files.');
