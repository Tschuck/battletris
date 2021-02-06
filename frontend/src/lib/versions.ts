interface VersionInterface {
  bugs: string[];
  classes: string[];
  features: string[];
  title: string;
}

const latestVersion = '1.2.1';
const versions: Record<string, VersionInterface> = {
  '1.0.0': {
    bugs: [],
    classes: [],
    features: [
      'full overhaul backend',
      'full overhaul new ui',
      'ui <=> backend sync and direct rendering',
    ],
    title: 'Full battletris rework',
  },
  '1.0.1': {
    bugs: [],
    classes: [],
    features: [
      'add feedback',
      'fix latency',
      'fix game end logic with room keep alive',
    ],
    title: 'Initial fixes',
  },
  '1.1.0': {
    bugs: [
      'does not update game registration card inputs on leave / join',
      'ms to seconds in ui',
      'game duration always 0ms',
      'user can interact when dead',
      'user can be targeted when dead',
      'slot 1 always wins',
    ],
    classes: [
      'mage mana reduced to 150',
      'increased mage Q abilities mana usage to 35',
      'warrior abilities swapped E and R',
      'increased mana usage of unknown Q',
    ],
    features: [
      'docs for how to add a class (checkout <a class="text-blue-600" href="https://github.com/Tschuck/battletris/tree/develop#create-a-class" target="_blank">readme</a>)',
      'overall same stones',
      'explicit target index selection with keys: 1, 2, 3, 4, 5',
      'spin stone to the left / right with A and D',
      'stack same effects and not run them twice',
      'added cooldowns for abilities',
    ],
    title: 'Feedback and new features',
  },
  '1.2.0': {
    bugs: [],
    classes: [],
    features: [
      'level support + mana, armor scaling',
      'better tutorial description',
    ],
    title: 'Level Support',
  },
  '1.2.1': {
    bugs: [],
    classes: [],
    features: [
      'class balancing',
      'max 2 times the same stone',
    ],
    title: 'Optimization',
  },
  '1.3.0': {
    bugs: [
      'enable full randomness of stones (more than 2 times the same stone is possible)',
      'fix quirky stones and left "kick"',
    ],
    classes: [],
    features: [
    ],
    title: 'Feedback',
  },
};

export {
  latestVersion,
  VersionInterface,
  versions,
};
