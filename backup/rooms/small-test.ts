import WebSocket from 'ws';

const wss = new WebSocket.Server({ noServer: true });

process.on('message', (request, socket) => {
  console.log('upgrading')
  console.log(request)

  wss.handleUpgrade(request, socket, [], (ws) => {
    process.send('ugrapde successfull');

    setTimeout(() => {
      ws.send(JSON.stringify({
        type: 'CHAT',
        message: 'yesssaaaa',
      }));
    }, 2000);
  });
});
console.log('started');

setInterval(() => {}, 1000000);
