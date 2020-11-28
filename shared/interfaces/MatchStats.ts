export interface MatchStatsInterface {
  winner: string;

  started: Date;

  stopped: Date;

  users: {
    [userId: string]: {
      blockCount: number;
      rowCount: number;
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
