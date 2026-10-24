import fs from 'fs';
import path from 'path';

function walkDir(dir, callback) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== '.next' && entry.name !== '.git') {
        walkDir(fullPath, callback);
      }
    } else if (entry.isFile() && (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts') || entry.name.endsWith('.css'))) {
      callback(fullPath);
    }
  }
}

let modifiedCount = 0;

walkDir(path.resolve('src'), (filePath) => {
  let content = fs.readFileSync(filePath, 'utf-8');
  // Remove all 'dark:[^ \"\'`]+'
  const cleaned = content.replace(/\s*dark:[a-zA-Z0-9_\-\/\[\]#.%]+/g, '');
  if (cleaned !== content) {
    fs.writeFileSync(filePath, cleaned, 'utf-8');
    modifiedCount++;
    console.log(`Cleaned: ${path.relative(process.cwd(), filePath)}`);
  }
});

console.log(`✓ Enforced Light Mode across ${modifiedCount} files!`);
