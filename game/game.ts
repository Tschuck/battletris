import process from 'process';

export default class Game {
  name: string;

  data = {};

  constructor() {
    // this.name = name;
  }

  init() {
    console.log(process);
    // this.server.log.info(`[GAME] initialized: ${this.name}`);
    process.send('haeeyyteeee')
    process.on('message', message => {
      console.log('message from parent:', message);
    });
  }

  start() {
    // this.server.log.info(`[GAME] started: ${this.name}`);
  }

  stop() {
    // this.server.log.info(`[GAME] stopped: ${this.name}`);
  }

  delete() {
    // this.server.log.info(`[GAME] deleted: ${this.name}`);
  }
};
