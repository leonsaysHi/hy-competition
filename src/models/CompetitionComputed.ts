import type { Competition, Phase } from '@/types/competitions'
import type { Game } from '@/types/games'
import type { CompetitionTeam, TeamId } from '@/types/teams'
import type { Option } from '@/types/comp-fields'
import { compareAsc, isAfter } from 'date-fns'
import type {
  AwardItem,
  TeamStats,
  PlayerRankingStats,
  PlayerStats,
  PlayerStatKey,
  TeamStatKey,
  GamesHist,
  TeamStandingStats,
  PlayerBoxScore
} from '@/types/stats'
import type { CompetitionPlayer, PlayerId } from '@/types/players'
import { getPerc } from '@/utils/maths'
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

export const getTeamStatsFromGames = (
  teamId: TeamId,
  games: GameComputedClass[] = []
): TeamStats => {
  const getEmptyStanding = () => ({
    ...teamStandingKeys.reduce((result: TeamStats, opt: Option) => {
      return {
        ...result,
        [opt.value]: 0
      }
    }, {} as TeamStats)
  })
  games.sort((a: GameComputedClass, b: GameComputedClass) =>
    compareAsc(a.row.datetime, b.row.datetime)
  )
  const { gp, wins, ptsfv, ptsag }: TeamStats = games.reduce(
    (result: TeamStats, game: GameComputedClass): TeamStats => {
      const teamScore = game.getTeamScore(teamId)?.finalScore || 0
      const oppScore = game.getOppScore(teamId)?.finalScore || 0
      const diff = teamScore - oppScore
      return {
        gp: result.gp + 1,
        wins: result.wins + (diff > 0 ? 1 : 0),
        ptsfv: result.ptsfv + teamScore,
        ptsag: result.ptsag + oppScore
      }
    },
    getEmptyStanding()
  )
  return {
    gp,
    wins,
    ptsfv,
    ptsag
  }
}
const getTeamPhaseStanding = (teamId: TeamId, games: GameComputedClass[]): TeamStats => {
  const { gp, wins, ptsfv, ptsag }: TeamStats = getTeamStatsFromGames(
    teamId,
    games.filter((game: GameComputedClass) => game.isFinished)
  )
  const result: TeamStats = {
    gp,
    wins,
    ptsfv,
    ptsag
  }
  return result
}
const updatePlayerBoxScoreCalculations = (
  boxscore: PlayerBoxScore | CompetitionRanking
): PlayerBoxScore | CompetitionRanking => {
  const { fta, ftm, fga, fgm, fg3a, fg3m, oreb, dreb, ast, stl, blk, blka, fdr, fcm, tov } =
    boxscore
  const ftprc = getPerc(fta, ftm)
  const fgprc = getPerc(fga, fgm)
  const fg3prc = getPerc(fg3a, fg3m)
  const pts = ftm + 2 * fgm + 3 * fg3m
  const reb = oreb + dreb
  const pir =
    pts + reb + ast + stl + blk + fdr - (fga - fgm + (fg3a - fg3m) + (fta - ftm) + tov + blka + fcm)
  return {
    ...boxscore,
    ftprc,
    fgprc,
    fg3prc,
    pts,
    reb,
    pir
  }
}
export const getPlayerStatsFromGames = (
  playerId: PlayerId,
  games: GameComputedClass[]
): PlayerStats => {
  return games.reduce((ranking: PlayerStats, game: GameComputedClass) => {
    playerStatsKeys
      .map((opt: Option) => opt.value as PlayerStatKey)
      .forEach((key: PlayerStatKey) => {
        const statValue = game.boxScore[playerId][key]
        ranking[key] = ranking[key] ? ranking[key] + statValue : statValue
      })
    return ranking
  }, {} as PlayerStats)
}
const getPlayerRankingFromGames = (
  playerId: PlayerId,
  games: GameComputedClass[]
): PlayerRankingStats => {
  const playedgames = games.filter(
    (game: GameComputedClass) =>
      game.isFinished && game.boxScore[playerId] && !game.boxScore[playerId].dnp
  )
  const result = {
    gp: playedgames.length,
    ...getPlayerStatsFromGames(playerId, playedgames)
  } as PlayerRankingStats
  result.awards = playedgames.reduce((awards: AwardItem[], game: GameComputedClass) => {
    return [
      ...awards,
      ...game.row.awards
        .filter((row: AwardItem) => row.id === playerId)
        .map((row: AwardItem) => ({ ...row, gameId: game.id }))
    ]
  }, [])
  return {
    ...result,
    ...updatePlayerBoxScoreCalculations(result)
  }
}
const getGroupBracket = (teams: TeamId[], games: GameComputedClass[]): Bracket => {
  let teamsLength = teams.length
  let matchupId = 0
  const rounds: Bracket = []
  while (teamsLength > 1) {
    teamsLength *= 0.5
    const roundGames: GameComputedClass[] = games.splice(0, teamsLength)
    while (roundGames.length < teamsLength) {
      roundGames.push({} as GameComputedClass)
    }
    const round: BracketRound = roundGames.map(
      (game: GameComputedClass, roundGameIdx: number): BracketMatchup => {
        matchupId++
        const isFinal = teamsLength <= 1
        // roundGameIdx // 0, 1, 2, 3
        const roundIdx = rounds.length // 0, 1, 2, 3
        return {
          game,
          matchupId,
          roundIdx,
          roundGameIdx,
          isFinal,
          winnersFrom:
            !game.id && roundIdx > 0
              ? [roundGameIdx * 2, roundGameIdx * 2 + 1].map((idx: number) => {
                  return rounds[roundIdx - 1][idx]
                })
              : undefined
        }
      }
    )
    rounds.push(round)
  }
  return rounds
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
    const phases = Array.isArray(this.row.phases)
      ? this.row.phases.map((phase: Phase, idx: number): CompetitionPhaseComputed => {
          const { type } = phase
          const dateStart = phase.datetime
          const dateEnd = this.row.phases[idx + 1] ? this.row.phases[idx + 1].datetime : undefined
          const phaseGames = this.games
            .filter((game: Game) => {
              const isPhaseGame =
                isAfter(game.datetime, dateStart) && (!dateEnd || isAfter(dateEnd, game.datetime))
              return isPhaseGame
            })
            .map((game: Game): GameComputedClass => new GameComputedClass(this.row.id, game))
          phaseGames.sort((a: GameComputedClass, b: GameComputedClass) =>
            compareAsc(a.row.datetime, b.row.datetime)
          )
          // each group:
          const groups = phase.groups.map((groupTeams: TeamId[]): CompetitionGroupComputed => {
            // games
            const groupGames = phaseGames.filter((game: GameComputedClass) =>
              game.row.teams.every((teamId: TeamId) => groupTeams.includes(teamId))
            )

            // standing:
            const standing: CompetitionStanding[] = groupTeams.reduce(
              (standing: CompetitionStanding[], teamId: TeamId) => {
                const teamGames: GameComputedClass[] = groupGames.filter(
                  (game: GameComputedClass) => game.row.teams.includes(teamId) && game.isFinished
                )
                const hist: GamesHist = new Array(5).fill(0).map((n: number, idx: number) => {
                  const game = teamGames[idx]
                  if (!game?.isFinished) return 0
                  return game.scores.findIndex(
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
              const getDiff = (st: CompetitionStanding) => st.ptsfv - st.ptsag
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
                    const ranking = getPlayerRankingFromGames(playerId, groupGames)
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

            // bracket:
            const bracket =
              type === 'playoffs' ? getGroupBracket(groupTeams, groupGames.slice()) : undefined

            // returns CompetitionGroupComputed
            return {
              standing,
              ranking,
              games: groupGames,
              bracket
            }
          })

          return {
            type,
            groups
          }
        })
      : []
    return phases
  }

  // each players overall stats:
  get competitionRankings(): CompetitionRankingComputed[] {
    return this.computedPhases
      .reduce((rankingList: CompetitionRankingComputed[], phase: CompetitionPhaseComputed) => {
        phase.groups.forEach((group: CompetitionGroupComputed) => {
          group.ranking.forEach((rank: CompetitionRanking) => {
            const idx = rankingList.findIndex(
              (r: CompetitionRankingComputed) => r.playerId === rank.playerId
            )
            if (idx > -1) {
              playerStatsKeys.forEach((opt: Option) => {
                const key = opt.value as PlayerStatKey
                rankingList[idx][key] += rank[key] || 0
              })
              rankingList[idx].gp += rank.gp
              rankingList[idx].awards.push(
                ...((Array.isArray(rank.awards) ? rank.awards : []) as AwardItem[])
              )
            } else {
              rankingList.push({
                ...rank,
                id: this.row.id
              })
            }
          })
        })
        return rankingList
      }, [])
      .map((playerRank: CompetitionRankingComputed) => {
        return {
          ...playerRank,
          ...updatePlayerBoxScoreCalculations(playerRank)
        }
      })
  }

  // each teams overall stats
  get competitionStandings(): CompetitionStandingComputed[] {
    const getEmptyStandingStats = (): TeamStandingStats => ({
      ...teamStandingKeys.reduce((stats: TeamStats, opt: Option) => {
        return {
          ...stats,
          [opt.value]: 0
        }
      }, {} as TeamStats),
      hist: []
    })
    return this.computedPhases.reduce(
      (standingList: CompetitionStandingComputed[], phase: CompetitionPhaseComputed) => {
        phase.groups.forEach((group: CompetitionGroupComputed) => {
          group.standing.forEach((stand: CompetitionStanding) => {
            const idx = standingList.findIndex(
              (r: CompetitionStandingComputed) => r.teamId === stand.teamId
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
            newStand.hist.push(...stand.hist.filter(Boolean))
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
