export interface MatchStatsInterface {
  winner: string;

  started: Date;

  stopped: Date;

  users: {
    [userId: string]: {
      rows: number;
      className: string;
    };
  };
}

export interface MatchInterface {
  winner: string;

  started: Date;

  stopped: Date;

  stats: MatchStatsInterface;
}
