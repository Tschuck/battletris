interface VersionInterface {
  bugs: string[];
  classes: string[];
  features: string[];
  title: string;
}

const latestVersion = '1.1.0';
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
      'overall same stones',
    ],
    title: 'Feedback and new features',
  },
};

export {
  latestVersion,
  VersionInterface,
  versions,
};
