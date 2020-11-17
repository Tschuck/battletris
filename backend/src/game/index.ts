import { ProcessMessageType } from '@battletris/shared';
import WebSocket from 'ws';

const keepAliveTimeout = setInterval(() => {}, 1 << 30);

process.on('message', (request, socket) => {
  switch (request.type) {
    case ProcessMessageType.JOIN_WS: {
      console.log('upgrading')
      console.log(request)

      const wss = new WebSocket.Server({ noServer: true });
      wss.handleUpgrade(request, socket, [], (ws) => {
        setTimeout(() => {
          ws.send(JSON.stringify({
            type: 'CHAT',
            message: 'yesssaaaa',
          }));
        }, 2000);
      });
      break;
    }
    case ProcessMessageType.STOP: {
      clearInterval(keepAliveTimeout);
      process.exit();
      break;
    }
  }
});

