# [BATTLETRIS](https://battletris.de)

Battletris is a multiplayer block stacking game for up to 5 players.

- play a block stacking game match alone and test your skills
- play against 4 other players
- select a class and master each ability
- clear more and more rows to damage the opponents armor and stack lines at the bottom
- collect mana with clearing rows to activate abilities
- see your match history

## Start playing

Do you want to try it? Have a look at [battletris.de](https://battletris.de).

<img src="https://raw.githubusercontent.com/Tschuck/battletris/develop/docs/game-screenshot.png" alt="drawing" width="400"/>

## Next Features

- [ ] key hold
- [ ] custom keybinds
- [ ] german translations
- [ ] page transitions
- [ ] small screen
- [ ] statistics page
- [ ] dynamic tutorial
- [ ] custom room handling
- [ ] tetris bot

## Testing

If you miss a test script, it's correct. Had not enough time and do it currently on a manual basis. When more people will start developing at the project, i will start adding some :)

## Docs

BATTLETRIS has grown fast and the code has mostly a good incline doc. If you want to know get a introduction into the code and the basics, feel free to contact me.

## Installation

BATTLETRIS is a monorepo and includes a backend, shared and frontend section. It's will written in node js, typescript  and vue. So just install node and run the following command in the BATTLETRIS repo.

Please install frontend / backend separated or just use the combined one:

```sh
yarn install
```

## Local development

Start the frontend and the backend server separately. To do so, open two terminals and run the following command:

```sh
yarn start
```

## Production runtime

If you want to build battletris for production runtimes, just run the following command in your root folder:

```sh
yarn build && node prepare-deploy.js
```

After this, a `dist` folder is created. This folder can be copied to the desired system and started with:

```sh
yarn install
yarn start
```

## Create a class

A more common use case would be, to add your own class to battletris. Follow these steps to add your own class.

### Generate a class

1. Setup BATTLETRIS on you local machine
2. Open two terminals / command lines / consoles / ...
   1. navigate to `./backend` and run `yarn start`
   2. navigate to `./frontend` and run `yarn start`
3. navigate to `./shared/functions/classes`
4. Duplicate the `unknown.ts` and give it your own name. This file contains the basic logic of your class. For now, just use the unknown configuration. How to program the class it self, have a look at [Adjust class logic](#adjust-class-logic)
5. Add your class to the ClassRegistry. Open the `./shared/functions/classes/index.ts`, import your new class file and add it to the ClassesIndex, classes, and classList. Please ensure, that the battletris class is index zero. (should not be a problem, but who knows)
6. Thats it! Just open now your local development server and go to `/settings`. Your class will be now available, without any icon and translation. Follow the [Configuring UI](#configuring-ui) to setup the missing parts.

### Configuring UI

Lets start with being creative. Every class represents a hardened warrior on the battlefield, so it need some strong class and ability descriptions.

1. At first, add your translations. Open the `./frontend/i18n/en.json` and copy the `classes.unknown` section and add it to the `classes` object. Here you can setup all texts for the class and its abilities.
2. Choose your logos: Open the `./frontend/icons/ClassLogo.vue` file. Add a new if clause for your className there and add your desired logo component. To do so, just duplicate again the `unknown.vue`, search for your logo on [Game Icons](https://game-icons.net), download it and replace your svg with the svg of your new logo component (just the svg path).
3. Open the `./frontend/icons/AbilityLogo.vue`, copy the section of the `unknown` and again, search for the desired logos on [Game Icons](https://game-icons.net) and replace everything.
4. Your done setting up the UI :)

### Adjust class logic

The main part of the class starts here. When you go back to your class file in the shared folder, have a look at all the properties.

- Here you can configure the maxAmor and maxMana your class should have. Keep in mind, when your class have a lot of mana, it generates percentage mana by resolving rows. The same is for armor, so please choose realistic values.

- The abilities are the `heart` of the class. Have a look at the class interface, for all ability properties:
  - `tickTimeout`: The tick function will be runned every `tickTimeout` milliseconds.
  - `ticks`: The ability will be execute this amount of times, paused by the configured `tickTimeout`. By configuring this value, the ability will be a `debuff` / `buff` and shown as a effect during the game.
  - `mana`: Required mana to activate the ability.
  - `cooldown`: Ability will be locked for X ms.
  - `tick`: Function that is executed after each `tickTimeout`. This function receives the user, for the ability was activated for and the effect array.
  - `onActivate`: Function that is called, when the ability was executed. This function will also get the activator + the target user instance.
  - `onStateChange`: Executed on each user interaction. (use it for reversing controls or something...)

- A effect that is passed to the tick, onActivate or onStateChange function, will look like the following:

```
const effect = [
  classIndex, // class index
  abilityIndex, // ability index
  Date.now(), // activation time
  this.gameUserIndex, // from index
  0, // execution time
  1, // effect stack
];
```

- Checkup the other classes, to get some ideas :)
