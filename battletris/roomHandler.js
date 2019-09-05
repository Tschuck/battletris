const { api, } = require('actionhero');
const Battle = require('./battle');

/**
 * Inititalize a new empty room
 */
const generateRoom = () => {
  return {
    // key = connection id
    // value => { name, class }
    users: { },
  };
}

/**
 * Takes a chat say message and tries to parse for battletris format
 *
 * @param      {any}      connection  actionhero websocket connection
 * @param      {string}   room        name of the chat room
 * @param      {any}      message     payload
 */
async function roomHandler(connectionId, room, type, payload) {
  try {
    // messages that should be sent
    let updates = {
      battle: false,
      users: false,
    };

    const roomDetail = api.battletris.rooms[room];
    const battle = api.battletris.battles[room];

    switch (type) {
      case 'room-join': {
        // apply the users to the api
        roomDetail.users[connectionId] = {
          className: payload.className,
          name: payload.name,
        };

        updates.users = true;
        break;
      }
      case 'room-leave': {
        delete roomDetail.users[connectionId];
        updates.users = true;

        break
      }
    }

    // only check, if battle is available (e.g. disabled for tavern)
    if (battle) {
      switch (type) {
        case 'room-leave': {
          battle.leave(connectionId);
          break;
        }
        case 'battle-join': {
          battle.join(connectionId);
          break
        }
        case 'battle-accept': {
          if (battle.users[connectionId]) {
            battle.users[connectionId].status = 'accepted';
            // force a map reset
            battle.join(connectionId, battle.users[connectionId]);
          } else {
            battle.leave(connectionId);
          }
          break;
        }
        case 'battle-leave': {
          battle.leave(connectionId);
          break;
        }
        case 'battle-stop': {
          battle.stop();
          break;
        }
      }

      // if it's a battle action, just set battle update
      if (type.startsWith('battle-') || type === 'room-leave') {
        updates.battle = true;
      }

      // check if everyone has accepted the battle, then start it!
      if (battle.status === 'open' && type !== 'battle-stop') {
        const battleUserCount = Object.keys(battle.users).length;
        const accepted = Object.keys(battle.users)
          .filter(userKey => battle.users[userKey].status === 'accepted');
        if (battleUserCount > 0 &&  accepted.length === battleUserCount) {
          battle.start();
        }
      }
    }

    // if users were updated, send the data into the network
    if (updates.users) {
      // send only data, that is required by the tavern
      const tavernData = { };
      Object.keys(api.battletris.rooms).forEach(room => {
        tavernData[room] = {
          users: api.battletris.rooms[room].users
        };
      });

      // broadcast the users into the tavern, so everything will be up to date
      await api.chatRoom.broadcast({}, 'tavern', {
        type: 'rooms',
        rooms: tavernData,
      });

      // broadcast the users everywhere
      await api.chatRoom.broadcast({}, room, {
        type: 'room',
        room: api.battletris.rooms[room],
      });
    }

    // send full battle data only for join / leave / accept process, game step events will be
    // handled by the battletris/Battle
    if (updates.battle) {
      // broadcast the users everywhere
      await api.chatRoom.broadcast({}, room, {
        type: 'battle',
        battle: api.battletris.battles[room].getJSON(),
      });
    }
  } catch (ex) {
    console.error(ex);
  }
}

module.exports = {
  generateRoom,
  roomHandler,
}