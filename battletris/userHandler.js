const { api, } = require('actionhero');

module.exports = async function(connection, room, message) {
  let payload = message;
  let userUpdate = false;

  // parse the incoming message
  try {
    payload = JSON.parse(message);
  } catch (ex) { }

  if (payload && payload.type) {
    switch (payload.type) {
      case 'room-join': {
        // apply the users to the api
        api.battletris.rooms[room][connection.id] = {
          className: payload.className,
          connection: connection.id,
          name: payload.name,
        };

        userUpdate = true;
        break;
      }
      case 'room-leave': {
        delete api.battletris.rooms[room][connection.id];
        userUpdate = true;

        break
      }
    }

    if (userUpdate) {
      // broadcast the users into the tavern, so everything will be up to date
      await api.chatRoom.broadcast({}, 'tavern', {
        type: 'rooms',
        rooms: api.battletris.rooms,
      });

      // broadcast the users everywhere
      await api.chatRoom.broadcast({}, room, {
        type: 'users',
        users: api.battletris.rooms[room],
      });
    }
  }
}