import type { Competition, Phase } from '@/types/competitions'
import type { Game } from '@/types/games'
import type { CompetitionTeam, TeamId } from '@/types/teams'
import { compareAsc, isAfter, isBefore } from 'date-fns'
import type {
  CompetitionPhaseComputed,
  CompetitionGroupStanding,
  CompetitionGroupComputed,
  CompetitionRanking,
  PlayerRankTotals,
  CompetitionComputed
} from '@/types/computed'
import type { AwardItem, TeamStats } from '@/types/stats'
import type { CompetitionPlayer, PlayerId } from '@/types/players'

const add = (total: number, a: number) => {
  return total + a
}
const getTeamPhaseStanding = (teamId: TeamId, games: Game[]): CompetitionGroupStanding => {
  games.sort((a: Game, b: Game) => compareAsc(a.datetime, b.datetime))
  const { gp, wins, ptspos, ptsneg, hist }: TeamStats = games.reduce(
    (result: TeamStats, game: Game): TeamStats => {
      const oppId: TeamId = Object.keys(game.scores).filter((tId: TeamId) => tId !== teamId)[0]
      const teamScore = game.scores[teamId].reduce(add, 0)
      const oppScore = game.scores[oppId].reduce(add, 0)
      const diff = teamScore - oppScore
      return {
        gp: result.gp + (diff !== 0 ? 1 : 0),
        wins: result.wins + (diff > 0 ? 1 : 0),
        ptspos: result.ptspos + teamScore,
        ptsneg: result.ptsneg + oppScore,
        hist: diff !== 0 ? [...result.hist, diff > 0 ? 1 : -1] : result.hist
      }
    },
    { gp: 0, wins: 0, ptspos: 0, ptsneg: 0, hist: [] }
  )
  const result: CompetitionGroupStanding = {
    id: teamId,
    pos: 0,
    gp,
    wins,
    ptspos,
    ptsneg,
    hist
  }
  return result
}
const getPlayerPhaseRanking = (playerId: PlayerId, games: Game[]): PlayerRankTotals => {
  const { gp, awards, pts, reb, ast, stl, blk, to, pf, m3pts }: PlayerRankTotals = games.reduce(
    (ranking: PlayerRankTotals, game: Game) => {
      const boxscore = game.boxscore[playerId]
      return {
        gp: ranking.gp + 1,
        awards: [
          ...ranking.awards,
          ...(game.awards?.filter((award: AwardItem) => award.id === playerId) || [])
        ],
        pts: ranking.pts + boxscore.pts,
        reb: ranking.reb + boxscore.reb,
        ast: ranking.ast + boxscore.ast,
        stl: ranking.stl + boxscore.stl,
        blk: ranking.blk + boxscore.blk,
        to: ranking.pts + boxscore.pts,
        pf: ranking.pf + boxscore.pf,
        m3pts: ranking.m3pts + boxscore.m3pts
      }
    },
    { gp: 0, awards: [], pts: 0, reb: 0, ast: 0, stl: 0, blk: 0, to: 0, pf: 0, m3pts: 0 }
  )
  return {
    // PlayerRankTotals
    gp,
    awards,
    pts,
    reb,
    ast,
    stl,
    blk,
    to,
    pf,
    m3pts
  }
}

export default class CompetitionClass {
  row: Competition
  games: Game[]
  teams: CompetitionTeam[]

  constructor(row: Competition) {
    this.row = row
    this.games = row.games as Game[]
    this.teams = row.teams as CompetitionTeam[]
  }

  get computed(): CompetitionComputed {
    return {
      id: this.row.id,
      phases: this.computedPhases
    }
  }

  get computedPhases(): CompetitionPhaseComputed[] {
    const phases = this.row.phases.map((phase: Phase, idx: number): CompetitionPhaseComputed => {
      const { type } = phase
      const dateStart = phase.datetime
      const dateEnd = this.row.phases[idx + 1] ? this.row.phases[idx + 1].datetime : undefined
      const phaseGames = this.games.filter((game: Game) => {
        return isAfter(game.datetime, dateStart) && (!dateEnd || isBefore(dateEnd, game.datetime))
      })
      // each group:
      const groups = phase.groups.map((groupTeams: TeamId[]): CompetitionGroupComputed => {
        // standing:
        const standing: CompetitionGroupStanding[] = groupTeams.reduce(
          (standing: CompetitionGroupStanding[], teamId: TeamId) => {
            const teamGames = phaseGames.filter((game: Game) => game.teams.includes(teamId))
            return [...standing, getTeamPhaseStanding(teamId, teamGames)]
          },
          []
        )
        standing.sort((a: CompetitionGroupStanding, b: CompetitionGroupStanding) => {
          const getPct = (st: CompetitionGroupStanding) => st.gp / st.wins
          const getDiff = (st: CompetitionGroupStanding) => st.ptspos - st.ptsneg
          const aPct = getPct(a)
          const bPct = getPct(b)
          const bestWinningPerc = aPct - bPct
          const mostPlayedGames = b.gp - a.gp
          const bestDiff = getDiff(a) - getDiff(b)
          return bestWinningPerc || mostPlayedGames || bestDiff
        })
        standing.forEach((row: CompetitionGroupStanding, idx) => {
          row.pos = idx + 1
        })
        // ranking:
        const ranking: CompetitionRanking[] = groupTeams.reduce(
          (ranking: CompetitionRanking[], teamId: TeamId) => {
            const team = this.teams.find(
              (team: CompetitionTeam) => team.id === teamId
            ) as CompetitionTeam
            const teamRanking: CompetitionRanking[] = team.players.map(
              (player: CompetitionPlayer) => {
                const playerId: PlayerId = player.id
                const playerGames = phaseGames.filter((game: Game) => {
                  return (
                    game.teams.includes(teamId) &&
                    game.boxscore[playerId] &&
                    !game.boxscore[playerId].dnp
                  )
                })
                return {
                  teamId: team.id,
                  ...player,
                  ...getPlayerPhaseRanking(playerId, playerGames)
                }
              }
            )
            return [...ranking, ...teamRanking]
          },
          []
        )
        // returns CompetitionGroupComputed
        return { standing, ranking }
      })

      return {
        type,
        groups
      }
    })
    return phases
  }
}
