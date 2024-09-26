// Team
export interface TeamStats {
    gp: number
    wins: number
    ptsfv: number
    ptsag: number
  }
  export type TeamStatKey = keyof TeamStats
  
  export type GamesHist = (1 | -1 | 0)[]
  export interface TeamStandingStats extends TeamStats {
    hist: GamesHist
  }
  