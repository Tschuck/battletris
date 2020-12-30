# BATTLETRIS

Battletris is a multiplayer block stacking game for up to 5 players.

- play a block stacking game match alone and test your skills
- play against 4 other players
- select a class and master each ability
- clear more and more rows to damage the opponents armor and stack lines at the bottom
- collect mana with clearing rows to activate abilities
- see your match history

![Game Screenshot](https://raw.githubusercontent.com/Tschuck/battletris/develop/docs/game-screenshot.png)

## Start playing

Do you want to try it? Have a look at [battletris.de](https://battletris.de).

## Support

If you want to support me to keep battletris running, please have a look at [buy me a coffee](https://www.buymeacoffee.com/eo3m4BAyO).

## Developing

Read this section, when you want to dive into the code. I know tests are important, but BATTLETRIS is a private project and tests are currently on a manual basis (... :D).

### Docs

If you want to know get a introduction into the code, feel free to contact me.

### Installation

BATTLETRIS is a monorepo and includes a backend, shared and frontend section. Please install all sections or just use the combined one:

```sh
yarn install
```

### Local development

Start the frontend and the backend server seperatly. To do so, open two terminals and run the following command:

```sh
yarn start
```

### Production runtime

If you want to build battletris for production runtimes, just run the following command in your root folder:

```sh
yarn build && node prepare-deploy.js
```

After this, a `dist` folder is created. This folder can be copied to the desired system and started with:

```sh
yarn install
yarn start
```
