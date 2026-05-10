const fs = require("fs");
const path = require("path");

const resourcesDir = path.join(__dirname, "..", "Resources");
const outputFile = path.join(resourcesDir, "resources.json");

function titleCase(str) {
  return str
    .replace(/-/g, " ")
    .replace(/\.pdf$/i, "")
    .replace(/\b\w/g, c => c.toUpperCase());
}

function scanResources(dir) {
  const resources = [];

  function walk(currentPath, relativePath = "") {
    const entries = fs.readdirSync(currentPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);
      const relPath = path.join(relativePath, entry.name);

      if (entry.isDirectory()) {
        walk(fullPath, relPath);
      }

      else if (entry.isFile() && entry.name.toLowerCase().endsWith(".pdf")) {

        const parts = relPath.split(path.sep);

        const stage = parts[0]
          ? titleCase(parts[0])
          : "General";

        const topic = parts[1]
          ? titleCase(parts[1])
          : "General";

        const title = titleCase(entry.name);

        resources.push({
          stage,
          topic,
          title,
          url: `./Resources/${relPath.replace(/\\/g, "/")}`
        });
      }
    }
  }

  walk(dir);

  return resources.sort((a, b) => {
    if (a.stage !== b.stage) {
      return a.stage.localeCompare(b.stage);
    }

    if (a.topic !== b.topic) {
      return a.topic.localeCompare(b.topic);
    }

    return a.title.localeCompare(b.title);
  });
}

const resources = scanResources(resourcesDir);

fs.writeFileSync(
  outputFile,
  JSON.stringify(resources, null, 2)
);

console.log(`Generated ${resources.length} resources.`);
