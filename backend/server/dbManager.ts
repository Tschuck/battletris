import fse from 'fs-extra';

import config from './config';

const dbs = {
  games: {},
  users: {},
};
const dbKeys = Object.keys(dbs);

const dbPath = (key: string) => `${config.dbPath}/${key}.json`;
const loadDbs = async () => {
  await Promise.all(dbKeys.map(async (key) => {
    if (await fse.pathExists(dbPath(key))) {
      dbs[key] = await fse.readJson(dbPath(key));
    }
  }));
};

const saveDb = async (key: string) => {
  await fse.ensureDir(config.dbPath);
  await fse.writeJSON(dbPath(key), dbs[key]);
};

export {
  dbs,
  loadDbs,
  saveDb,
};
