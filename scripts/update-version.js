#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';

// Get version from package.json
const packageJson = JSON.parse(await fs.readFile('package.json', 'utf8'));
const version = packageJson.version;

// Files to update
const filesToUpdate = [
  {
    path: 'README.md',
    pattern: /!\[Version\]\(https:\/\/img\.shields\.io\/badge\/version-[\d\.]+/g,
    replace: `![Version](https://img.shields.io/badge/version-${version}`,
  },
  {
    path: 'src/server.ts',
    pattern: /version: '[\d\.]+'/g,
    replace: `version: '${version}'`,
  },
];

// Update version in each file
for (const file of filesToUpdate) {
  try {
    const content = await fs.readFile(file.path, 'utf8');
    const updatedContent = content.replace(file.pattern, file.replace);
    await fs.writeFile(file.path, updatedContent, 'utf8');
    console.log(`✅ Updated version in ${file.path}`);
  } catch (error) {
    console.error(`❌ Failed to update ${file.path}:`, error);
  }
}

console.log(`\n🎉 Version ${version} updated in all files`);
