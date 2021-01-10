const fs = require('fs');
const fse = require('fs-extra');
const path = require('path');

const deployFolder = path.resolve('./.deploy');
const backendFolder = path.resolve('./backend');
const frontendFolder = path.resolve('./frontend');
const package = {
  ...require(`${backendFolder}/package.json`),
  version: `1.0.${Date.now()}`,
  devDependencies: {},
  scripts: {
    start: `BATTLETRIS_DEV_MODE=false node dist/src/index.js`
  },
};

fse.emptyDirSync(deployFolder);
fse.ensureDirSync(deployFolder);

// setup base files
fs.writeFileSync(`${deployFolder}/package.json`, JSON.stringify(package, null, 2), 'utf8');

// copy backend files first
[
  'dist',
  'yarn.lock',
].forEach((dirName) => fse.copySync(`${backendFolder}/${dirName}`, `${deployFolder}/${dirName}`));
// copy built frontend files
fse.copySync(`${frontendFolder}/dist`, `${deployFolder}/dist/public`);
