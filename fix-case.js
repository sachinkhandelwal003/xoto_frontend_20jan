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

// Build lowercase -> real path map
function buildMap(dir, map) {
  if (!map) map = {};
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, item.name);
    map[full.toLowerCase()] = full;
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
  const importRe = /from\s+['"](\.[^'"?]+)/g;
  let match;
  const fixes = [];

  while ((match = importRe.exec(content)) !== null) {
    const imp = match[1];
    const base = path.resolve(path.dirname(file), imp);

    // Check if exact path works
    const exactTries = [base, base+'.jsx', base+'.js', base+'.tsx', base+'.ts',
                        base+'/index.jsx', base+'/index.js'];
    const exactOk = exactTries.some(t => fs.existsSync(t));
    if (exactOk) continue;

    // Try case-insensitive
    const real = findReal(base);
    if (!real) continue;

    // Build corrected relative import path
    const realNoExt = real.replace(/\.(jsx|js|tsx|ts)$/, '');
    const dir = path.dirname(file);
    let corrected = path.relative(dir, realNoExt).replace(/\\/g, '/');
    if (!corrected.startsWith('.')) corrected = './' + corrected;

    if (corrected !== imp) {
      fixes.push({ from: imp, to: corrected });
    }
  }

  if (fixes.length > 0) {
    totalFiles++;
    for (const fix of fixes) {
      // Replace only in import/from statements
      const escaped = fix.from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const re = new RegExp("(from\\s+['\"])" + escaped + "(['\"])", 'g');
      newContent = newContent.replace(re, '$1' + fix.to + '$2');
      totalFixed++;
      const shortFile = file.replace(srcDir, 'src').replace(/\\/g, '/');
      console.log('FIXED: ' + shortFile);
      console.log('  ' + fix.from + '  ->  ' + fix.to);
    }
    fs.writeFileSync(file, newContent, 'utf8');
  }
}

console.log('\nDone! Fixed ' + totalFixed + ' imports in ' + totalFiles + ' files.');
