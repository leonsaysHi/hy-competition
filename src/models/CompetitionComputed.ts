import type { Competition, Phase } from '@/types/competitions'
import type { Game, GameId } from '@/types/games'
import type { CompetitionTeam, TeamId } from '@/types/teams'
import type { Option } from '@/types/comp-fields'
import { compareAsc, isAfter, isBefore } from 'date-fns'
import type {
  CompetitionPhaseComputed,
  CompetitionStanding,
  CompetitionGroupComputed,
  CompetitionRanking,
  CompetitionComputed,
  PlayerCompetitionComputed
} from '@/types/computed'
import type { AwardItem, TeamStats, PlayerRankingStats, Stats, StatKey } from '@/types/stats'
import type { CompetitionPlayer, PlayerId } from '@/types/players'
import { add } from '@/utils/maths'
import useOptionsLib from '@/composable/useOptionsLib'

const { statsKeys } = useOptionsLib() // !gp !awards

export const getTeamStatsFromGames = (teamId: TeamId, games: Game[] = []): TeamStats => {
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
  return {
    gp,
    wins,
    ptspos,
    ptsneg,
    hist
  }
}
const getTeamPhaseStanding = (teamId: TeamId, games: Game[]): CompetitionStanding => {
  const { gp, wins, ptspos, ptsneg, hist }: TeamStats = getTeamStatsFromGames(
    teamId,
    games.filter((game: Game) => game.isFinished)
  )
  const result: CompetitionStanding = {
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
export const getPlayerStatsFromGames = (playerId: PlayerId, games: Game[]): Stats => {
  return games
    .filter((game: Game) => game.isFinished && game.boxscore[playerId] && ~game.boxscore[playerId].dnp)
    .reduce((ranking: Stats, game: Game) => {
        const { dnp, ...stats } = game.boxscore[playerId]
        statsKeys
          .map((opt: Option) => opt.value as StatKey)
          .forEach((key: StatKey) => {
            ranking[key] = (ranking[key] || 0) + (stats[key] || 0)
          })
        return ranking
      },
      {} as Stats
    )
}
const getPlayerPhaseRankingStats = (playerId: PlayerId, games: Game[]): PlayerRankingStats => {
  const playedgames = games
    .filter((game: Game) => game.isFinished && game.boxscore[playerId] && ~game.boxscore[playerId].dnp)
  const playerStats: Stats = getPlayerStatsFromGames(playerId, playedgames)
  const playerAwards: AwardItem[] = playedgames.reduce((awards: AwardItem[], game: Game, ) => {
    return [ ...awards,
      ...game.awards.filter((row: AwardItem) => row.id === playerId)
    ]
  }, [])
  return {
    // PlayerRankingStats
    gp: playedgames.length,
    awards: playerAwards,
    ...playerStats
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
        // games
        const groupGames = groupTeams.reduce((groupGames: GameId[], teamId: TeamId) => {
          groupGames.push(
            ...phaseGames
              .filter((game: Game) => !groupGames.includes(game.id) && game.teams.includes(teamId))
              .map((game: Game) => game.id)
          )
          return groupGames
        }, [])
        // standing:
        const standing: CompetitionStanding[] = groupTeams.reduce(
          (standing: CompetitionStanding[], teamId: TeamId) => {
            const teamGames = phaseGames.filter((game: Game) => game.teams.includes(teamId))
            return [...standing, getTeamPhaseStanding(teamId, teamGames)]
          },
          []
        )
        standing.sort((a: CompetitionStanding, b: CompetitionStanding) => {
          const getPct = (st: CompetitionStanding) => st.gp / st.wins
          const getDiff = (st: CompetitionStanding) => st.ptspos - st.ptsneg
          const aPct = getPct(a)
          const bPct = getPct(b)
          const bestWinningPerc = aPct - bPct
          const mostPlayedGames = b.gp - a.gp
          const bestDiff = getDiff(a) - getDiff(b)
          return bestWinningPerc || mostPlayedGames || bestDiff
        })
        standing.forEach((row: CompetitionStanding, idx) => {
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
                  ...getPlayerPhaseRankingStats(playerId, playerGames)
                }
              }
            )
            return [...ranking, ...teamRanking]
          },
          []
        )
        // returns CompetitionGroupComputed
        return {
          standing,
          ranking,
          games: groupGames
        }
      })

      return {
        type,
        groups
      }
    })
    return phases
  }
  get competitionRankings(): PlayerCompetitionComputed[]  {
    const trackedPlayerRankingKeys: StatKey[] = statsKeys
      .filter((opt: Option) => this.row.trackedStats.includes(opt.value as StatKey))
      .map((opt: Option) => opt.value as StatKey)
    return this.computedPhases.reduce((rankingList:PlayerCompetitionComputed[], phase:CompetitionPhaseComputed) => {
      phase.groups.forEach((group: CompetitionGroupComputed) => {
        group.ranking.forEach((rank:CompetitionRanking) => {
          const idx = rankingList.findIndex((row:PlayerCompetitionComputed) => row.id === rank.id)
          if (idx === -1) {
            rankingList.push({ ...rank })
          } else {
            trackedPlayerRankingKeys.forEach((key: StatKey) => {
              rankingList[idx][key] = (rankingList[idx][key] || 0) + (rank[key] || 0)
            })
            rankingList[idx].gp = (rankingList[idx].gp || 0) + (rank.gp || 0)
            rankingList[idx].awards = [
              ...(Array.isArray(rankingList[idx].awards) ? rankingList[idx].awards : []) as AwardItem[],
              ...(Array.isArray(rank.awards) ? rank.awards : []) as AwardItem[]
            ]
          }
        })
      })
      return rankingList
    }, [])
  }
}
