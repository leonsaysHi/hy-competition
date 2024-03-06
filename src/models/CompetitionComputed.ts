import type { Competition, Phase } from '@/types/competitions'
import type { Game } from '@/types/games'
import type { CompetitionTeam, TeamId } from '@/types/teams'
import type { Option } from '@/types/comp-fields'
import { compareAsc, isAfter, isBefore } from 'date-fns'
import type {
  AwardItem,
  TeamStats,
  PlayerRankingStats,
  PlayerStats,
  PlayerStatKey,
  TeamStatKey,
  GamesHist
} from '@/types/stats'
import type { CompetitionPlayer, PlayerId } from '@/types/players'
import { add } from '@/utils/maths'
import useOptionsLib from '@/composable/useOptionsLib'
import GameComputedClass, { type ScoresComputed } from './GameComputed'
import type {
  CompetitionGroupComputed,
  CompetitionPhaseComputed,
  CompetitionRanking,
  CompetitionRankingComputed,
  CompetitionStanding,
  CompetitionStandingComputed
} from '@/types/computed'

const { playerStatsKeys, teamStandingKeys } = useOptionsLib() // !gp !awards

export const getTeamStatsFromGames = (teamId: TeamId, games: Game[] = []): TeamStats => {
  const getEmptyStanding = () => ({
    ...teamStandingKeys.reduce((result: TeamStats, opt: Option) => {
      return {
        ...result,
        [opt.value]: 0
      }
    }, {} as TeamStats)
  })
  games.sort((a: Game, b: Game) => compareAsc(a.datetime, b.datetime))
  const { gp, wins, ptspos, ptsneg }: TeamStats = games.reduce(
    (result: TeamStats, game: Game): TeamStats => {
      const oppId: TeamId = Object.keys(game.scores).filter((tId: TeamId) => tId !== teamId)[0]
      const teamScore = game.scores[teamId].reduce(add, 0)
      const oppScore = game.scores[oppId].reduce(add, 0)
      const diff = teamScore - oppScore
      return {
        gp: result.gp + 1,
        wins: result.wins + (diff > 0 ? 1 : 0),
        ptspos: result.ptspos + teamScore,
        ptsneg: result.ptsneg + oppScore
      }
    },
    getEmptyStanding()
  )
  return {
    gp,
    wins,
    ptspos,
    ptsneg
  }
}
const getTeamPhaseStanding = (teamId: TeamId, games: Game[]): TeamStats => {
  const { gp, wins, ptspos, ptsneg }: TeamStats = getTeamStatsFromGames(
    teamId,
    games.filter((game: Game) => game.isFinished)
  )
  const result: TeamStats = {
    gp,
    wins,
    ptspos,
    ptsneg
  }
  return result
}
export const getPlayerStatsFromGames = (playerId: PlayerId, games: Game[]): PlayerStats => {
  const getEmptyStats = (): PlayerStats =>
    playerStatsKeys.reduce((stats: PlayerStats, opt: Option) => {
      return {
        ...stats,
        [opt.value]: 0
      }
    }, {} as PlayerStats)
  return games
    .filter(
      (game: Game) => game.isFinished && game.boxscore[playerId] && !game.boxscore[playerId].dnp
    )
    .reduce((ranking: PlayerStats, game: Game) => {
      const { dnp, ...stats } = game.boxscore[playerId]
      playerStatsKeys
        .map((opt: Option) => opt.value as PlayerStatKey)
        .forEach((key: PlayerStatKey) => {
          ranking[key] += stats[key] || 0
        })
      return ranking
    }, getEmptyStats())
}
const getPlayerPhaseRankingStats = (playerId: PlayerId, games: Game[]): PlayerRankingStats => {
  const playedgames = games.filter(
    (game: Game) => game.isFinished && game.boxscore[playerId] && ~game.boxscore[playerId].dnp
  )
  const playerStats: PlayerStats = getPlayerStatsFromGames(playerId, playedgames)
  const playerAwards: AwardItem[] = playedgames.reduce((awards: AwardItem[], game: Game) => {
    return [
      ...awards,
      ...game.awards
        .filter((row: AwardItem) => row.id === playerId)
        .map((row: AwardItem) => ({ ...row, gameId: game.id }))
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

  get computedPhases(): CompetitionPhaseComputed[] {
    const phases = this.row.phases.map((phase: Phase, idx: number): CompetitionPhaseComputed => {
      const { type } = phase
      const dateStart = phase.datetime
      const dateEnd = this.row.phases[idx + 1] ? this.row.phases[idx + 1].datetime : undefined
      const phaseGames = this.games.filter((game: Game) => {
        return isAfter(game.datetime, dateStart) && (!dateEnd || isBefore(dateEnd, game.datetime))
      })
      phaseGames.sort((a: Game, b: Game) => compareAsc(a.datetime, b.datetime))
      // each group:
      const groups = phase.groups.map((groupTeams: TeamId[]): CompetitionGroupComputed => {
        // games
        const groupGames = groupTeams.reduce((groupGames: Game[], teamId: TeamId) => {
          return [
            ...groupGames,
            ...phaseGames.filter(
              (game: Game) =>
                game.teams.includes(teamId) &&
                groupGames.findIndex((g: Game) => g.id === game.id) === -1
            )
          ]
        }, [])

        // standing:
        const standing: CompetitionStanding[] = groupTeams.reduce(
          (standing: CompetitionStanding[], teamId: TeamId) => {
            const teamGames: Game[] = phaseGames.filter(
              (game: Game) => game.teams.includes(teamId) && game.isFinished
            )
            const hist: GamesHist = new Array(5).fill(0).map((n: number, idx: number) => {
              const game = teamGames[idx]
              if (!game?.isFinished) return 0
              const gameComputed = new GameComputedClass(this.row.id, game)
              return gameComputed.scores.findIndex(
                (score: ScoresComputed) => score.id === teamId && score.winner
              ) > -1
                ? 1
                : -1
            })
            hist.reverse()
            standing.push({
              teamId,
              ...getTeamPhaseStanding(teamId, teamGames),
              hist
            })
            return standing
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
          const bestDiff = getDiff(b) - getDiff(a)
          return bestWinningPerc || mostPlayedGames || bestDiff
        })
        standing.forEach((row: CompetitionStanding, idx: number) => {
          if (type === 'groups') {
            standing[idx].pos = standing[idx].gp ? idx + 1 : standing.length + 1
          } else {
            standing[idx].playoff = groupTeams.length / (row.wins + 1)
          }
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
                const ranking = getPlayerPhaseRankingStats(playerId, playerGames)
                return {
                  teamId: team.id,
                  playerId: player.id,
                  number: player.number,
                  ...ranking,
                  awards: [
                    ...ranking.awards,
                    ...this.row.awards
                      .filter((row: AwardItem) => row.id === player.id)
                      .map((row: AwardItem) => ({ ...row, competitionId: this.row.id }))
                  ]
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

  // each players overall stats:
  get competitionRankings(): CompetitionRankingComputed[] {
    const getEmptyRankingStats = (): PlayerRankingStats => ({
      gp: 0,
      awards: [],
      ...statsKeys.reduce((stats: PlayerStats, opt: Option) => {
        return {
          ...stats,
          [opt.value]: 0
        }
      }, {} as PlayerStats)
    })
    return this.computedPhases.reduce(
      (rankingList: CompetitionRankingComputed[], phase: CompetitionPhaseComputed) => {
        phase.groups.forEach((group: CompetitionGroupComputed) => {
          group.ranking.forEach((rank: CompetitionRanking) => {
            const idx = rankingList.findIndex(
              (r: CompetitionRankingComputed) => r.playerId === rank.playerId
            )
            const newRank =
              idx > -1
                ? rankingList[idx]
                : {
                    ...rank,
                    id: this.row.id,
                    ...getEmptyRankingStats()
                  }
            statsKeys.forEach((opt: Option) => {
              const key = opt.value as PlayerStatKey
              newRank[key] += rank[key] || 0
            })
            newRank.gp += rank.gp || 0
            newRank.awards = [
              ...newRank.awards,
              ...((Array.isArray(rank.awards) ? rank.awards : []) as AwardItem[])
            ]
            if (idx === -1) {
              rankingList.push(newRank)
            }
          })
        })
        return rankingList
      },
      []
    )
  }

  // each teams overall stats
  get competitionStandings(): CompetitionStandingComputed[] {
    const getEmptyStandingStats = (): PlayerRankingStats => ({
      gp: 0,
      awards: [],
      ...teamStandingKeys.reduce((stats: PlayerStats, opt: Option) => {
        return {
          ...stats,
          [opt.value]: 0
        }
      }, {} as PlayerStats)
    })
    return this.computedPhases.reduce(
      (standingList: CompetitionStandingComputed[], phase: CompetitionPhaseComputed) => {
        phase.groups.forEach((group: CompetitionGroupComputed) => {
          group.standing.forEach((stand: CompetitionStanding) => {
            const idx = standingList.findIndex(
              (r: CompetitionStandingComputed) => r.id === stand.teamId
            )
            const newStand =
              idx > -1
                ? standingList[idx]
                : ({
                    ...stand,
                    id: this.row.id,
                    ...getEmptyStandingStats()
                  } as CompetitionStandingComputed)
            teamStandingKeys.forEach((opt: Option) => {
              const key = opt.value as TeamStatKey
              newStand[key] += stand[key] || 0
            })
            newStand.hist.push(...stand.hist)
            newStand.hist = newStand.hist.slice(newStand.hist.length - 5, newStand.hist.length)
            if (idx === -1) {
              standingList.push(newStand)
            }
          })
        })
        return [...standingList]
      },
      []
    )
  }
}
