import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

const url = 'http://localhost:3000';

const run = async () => {
  const gameName = uuidv4();
  await axios.post(`${url}/game/${gameName}`, {});
  let game = await axios.get(`${url}/game/${gameName}`, {});
  console.log(game.data);
  await axios.post(`${url}/game/${gameName}/keypress/a`, {});
  // await axios.post(`${url}/game/${gameName}/keypress/b`, {});
  // await axios.post(`${url}/game/${gameName}/keypress/c`, {});
  // await axios.post(`${url}/game/${gameName}/keypress/d`, {});
};

run();