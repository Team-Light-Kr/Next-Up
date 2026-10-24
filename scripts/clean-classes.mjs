import fs from "fs";
import path from "path";

function walk(dir) {
  let files = [];
  for (const item of fs.readdirSync(dir)) {
    const full = path.join(dir, item);
    if (fs.statSync(full).isDirectory()) {
      if (item !== "node_modules" && item !== ".next" && item !== ".git") {
        files = files.concat(walk(full));
      }
    } else if (full.endsWith(".tsx") || full.endsWith(".ts")) {
      files.push(full);
    }
  }
  return files;
}

const files = walk("./src");
let changed = 0;
for (const file of files) {
  let content = fs.readFileSync(file, "utf8");
  const updated = content.replace(/(hover:(?:bg|text|border)-[a-zA-Z0-9\-\/]+):(?:bg|text|border)-[a-zA-Z0-9\-\/]+/g, "$1");
  if (updated !== content) {
    fs.writeFileSync(file, updated, "utf8");
    changed++;
    console.log("Cleaned:", file);
  }
}
console.log("Total cleaned:", changed);
