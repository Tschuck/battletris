const { api, } = require('actionhero');
const Battle = require('./battle');

/**
 * Inititalize a new empty room
 */
const generateRoom = () => {
  return {
    // room configuration
    config: {
      maxUsers: 6,
      speed: 1, // ???
    },
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

        if (battle) {
          delete battle.users[connectionId];
          delete battle.accepted[connectionId];
        }

        updates.users = true;

        break
      }
    }

    // only check, if battle is available (e.g. disabled for tavern)
    if (battle) {
      switch (type) {
        case 'battle-join': {
          battle.users[connectionId] = Battle.generateBattleUser(connectionId);
          updates.battle = true;

          break
        }
        case 'battle-accept': {
          battle.users[connectionId] = battle.users[connectionId] ||
            Battle.generateBattleUser(connectionId);
          battle.accepted[connectionId] = true;
          updates.battle = true;

          break
        }
        case 'battle-leave': {
          delete battle.users[connectionId];
          delete battle.accepted[connectionId];
          updates.battle = true;

          break
        }
        case 'battle-stop': {
          if (api.battletris.battleInstances[room]) {
            api.battletris.battleInstances[room].stop();
          }
          updates.battle = true;

          break
        }
      }

      // check if everyone has accepted the battle, then start it!
      if (battle.status === 'open') {
        const battleUserCount = Object.keys(battle.users).length;
        if (battleUserCount > 0 && Object.keys(battle.accepted).length === battleUserCount) {
          api.battletris.battleInstances[room] = new Battle(room);
          api.battletris.battleInstances[room].start();
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
        battle: api.battletris.battles[room],
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