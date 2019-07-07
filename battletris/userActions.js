/**
 * Handles a user action
 *
 * @param      {<type>}   connectionId  The connection identifier
 * @param      {<type>}   key           The key
 * @return     {Promise}  { description_of_the_return_value }
 */
async function userAction(battle, connectionId, key) {
  if (battle.users[connectionId].blockIndex === -1) {
    battle.setNextBlock(connectionId);
  }

  const battleUser = battle.users[connectionId];
  let originBlock = battleUser.activeBlock;
  let activeBlock = JSON.parse(JSON.stringify(originBlock));

  // setup update increment 
  const users = {};
  const increment = { };
  users[connectionId] = increment;

  switch (key) {
    // left
    case 37: {
      activeBlock.x--;
      increment.activeBlock = activeBlock;
      break;
    }
    // up
    case 38: {
      // if it's not a block, turn it
      if (activeBlock.type !== 3) {
        activeBlock.rotation = activeBlock.rotation === 3 ? 0 : activeBlock.rotation + 1;
        activeBlock.map = blocks[activeBlock.type][activeBlock.rotation];
        increment.activeBlock = activeBlock;
      }
      break;
    }
    // right
    case 39: {
      activeBlock.x++;
      increment.activeBlock = activeBlock;
      break;
    }
    // down
    case 40: {
      activeBlock.y++;
      increment.activeBlock = activeBlock;
      break;
    }
    // press space
    case 32: {
      // move the original block to the next dock position
      originBlock = mapHandler.getDockPreview(battleUser.map, activeBlock);
      // assign the new original block to the current battleUser active block position, so the
      // collision logic will render this block as docked
      activeBlock = JSON.parse(JSON.stringify(originBlock));
      // after this, increase the y position by one, so a collision will be generated
      activeBlock.y++;
      break;
    }
  }

  // check if the action can be performed
  const collision = mapHandler.checkForCollision(battleUser.map, activeBlock, battleUser.activeBlock);
  switch (collision) {
    // if the stone movement was invalid, stop it!
    case 'invalid': {
      return;
    }
    // dock the activeBlock to the map and generate a new activeBlock
    case 'docked': {
      // IMPORTANT: use the battleUser.activeBlock, before the navigation was performed
      for (let y = 0; y < originBlock.map.length; y++) {
        for (let x = 0; x < originBlock.map[y].length; x++) {
          if (originBlock.map[y][x]) {
            if (originBlock.y + y === 0) {
              battleUser.status = increment.status = 'lost';
              break;
            } else {
              battleUser.map[originBlock.y + y][originBlock.x + x] = {
                type: originBlock.type,
              };
            }
          }
        }

        // just break the for loop and check for a winner
        if (battleUser.status === 'lost') {
          const wonUsers = Object
            .keys(battle.users)
            .filter((userKey) => battle.users[userKey].status !== 'lost');

          // if one player has played alone or one player has left, he won  
          if (wonUsers.length < 2) {
            battle.status = 'open';

            // set the won user
            if (wonUsers.length === 1) {
              battle.users[wonUsers[0]].status = 'won'; 
            }

            // one user has won and game has been stopped stop the game
            return battle.stop();
          }

          break;
        }
      }

      // check for solved rows
      const clearedRows = mapHandler.clearFullRows(battleUser.map);
      if (clearedRows) {
        battleUser.rows = increment.rows = battleUser.rows + clearedRows;
        battleUser.mana = increment.mana = battleUser.mana + (clearedRows * 5);

        // add rows to the bottom of all oponents, when more than one line was removed
        const userKeys = Object.keys(battle.users).filter(userKey => userKey !== connectionId);
        for (let i = 0; i < (clearedRows - 1); i++) {
          // create a filled row that should be added to the others
          const emptyRow = [ ];
          for (let i = 0; i < 10; i++) {
            emptyRow.push({ type: -2 });
          }
          // clear one column
          emptyRow[Math.ceil(Math.random() * 10)] = null;
          userKeys.forEach(userKey => {
            // add the new row and remove the first row
            battle.users[userKey].map.push(emptyRow);
            battle.users[userKey].map.splice(0, 1);
          });
        }
      }

      // update the map[]
      increment.map = battleUser.map;

      // set the next block to display for the current user
      battle.setNextBlock(connectionId);
      increment.activeBlock = battleUser.activeBlock;

      break;
    }
  }

  // until now, we worked on a activeBlock copy, at this point everything is fine, apply latest
  // activeBlock to the user
  if (increment.activeBlock) {
    battleUser.activeBlock = increment.activeBlock;
  }
}

export {
  userAction,
}