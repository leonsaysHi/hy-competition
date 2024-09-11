import type {
  Bracket,
  BracketMatchup,
  BracketRound,
  Competition,
  Phase,
  PhaseGroup
} from '@/types/competitions'
import type { Game } from '@/types/games'
import type { CompetitionTeam, TeamId } from '@/types/teams'
import { compareAsc, isAfter } from 'date-fns'
import type {
  AwardItem,
  TeamStats,
  PlayerRankingStats,
  PlayerStatLine,
  PlayerStatLineKey,
  TeamStatKey,
  GamesHist,
  PlayerCalculatedStats
} from '@/types/stats'
import type { CompetitionPlayer, PlayerId } from '@/types/players'
import { add, getPerc } from '@/utils/maths'
import GameComputedClass, { type ScoresComputed } from './GameComputed'
import type {
  CompetitionGroupComputed,
  CompetitionPhaseComputed,
  CompetitionRanking,
  CompetitionRankingComputed,
  CompetitionStanding,
  CompetitionStandingComputed
} from '@/types/computed'
import useStatsKeys from '@/composable/useStatsKeys'

const { 
  playerStatsKeys,
  getEmptyPlayerStatLine,
  teamStandingKeys, 
  getEmptyTeamStats,
  getPlayerCalculatedStatsFromStats,

} = useStatsKeys()


const getTeamPhaseStanding = (teamId: TeamId, games: GameComputedClass[]): TeamStats => {
  const result: TeamStats = games
    .filter((game: GameComputedClass) => game.isFinished)
    .reduce(
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
      getEmptyTeamStats()
    )
  return result
}
const updatePlayerCalculatedStatsCalculations = (
  boxscore: PlayerStatLine | PlayerCalculatedStats | CompetitionRanking
): PlayerCalculatedStats | CompetitionRanking => {
  const { fta = 0, ftm = 0, fga = 0, fgm = 0, fg3a = 0, fg3m = 0, oreb = 0, dreb = 0 } =
    boxscore
  const ftprc = getPerc(fta, ftm)
  const fgprc = getPerc(fga, fgm)
  const fg3prc = getPerc(fg3a, fg3m)
  const pts = ftm + 2 * fgm + 3 * fg3m
  const reb = oreb + dreb
  return {
    ...boxscore,
    ftprc,
    fgprc,
    fg3prc,
    pts,
    reb
  }
}
export const getPlayerStatsFromGames = (
  playerId: PlayerId,
  games: GameComputedClass[]
): PlayerStatLine => {
  return games
    .filter(
      (game: GameComputedClass) =>
        game.isFinished && game.boxScore[playerId] && game.boxScore[playerId].dnp === 0
    )
    .reduce((result: PlayerStatLine, game: GameComputedClass) => {
      playerStatsKeys
        .forEach((key: PlayerStatLineKey) => {
          result[key] = add(result[key], game.boxScore[playerId][key])
        })
      return result
    }, getEmptyPlayerStatLine() as PlayerStatLine)
}
const getPlayerRankingFromGames = (
  playerId: PlayerId,
  games: GameComputedClass[]
): PlayerRankingStats => {
  const playedgames = games
    .filter(
      (game: GameComputedClass) =>
        game.isFinished && game.row.boxscore[playerId] && game.row.boxscore[playerId].dnp === 0
    )
  const rows: PlayerStatLine[] = playedgames
    .reduce((acc: PlayerStatLine[], game: GameComputedClass) => {
      acc.push(game.row.boxscore[playerId])
      return acc
    }, [])
  const boxscore: PlayerCalculatedStats = getPlayerCalculatedStatsFromStats(rows) 
  const awards = playedgames
    .reduce((awards: AwardItem[], game: GameComputedClass) => {
      return [
        ...awards,
        ...game.row.awards
          .filter((row: AwardItem) => row.id === playerId)
          .map((row: AwardItem) => ({ ...row, gameId: game.id }))
      ]
    }, [] as AwardItem[])
  const ranking: PlayerRankingStats = {
    gp: playedgames.length,
    ...boxscore,
    awards,
  } as PlayerRankingStats
  return ranking
}
const getGroupBracket = (teams: TeamId[], games: GameComputedClass[]): Bracket => {
  let roundTeamsLength = teams.length
  let matchupId = 0
  const rounds: Bracket = []
  while (roundTeamsLength > 1) {
    roundTeamsLength *= 0.5
    const roundMatchups: BracketRound = new Array(roundTeamsLength)
      .fill({})
      .map((matchup: any, roundGameIdx: number): BracketMatchup => {
        const isFinal = roundTeamsLength === 1
        const roundIdx = rounds.length // 0, 1, 2, 3
        return {
          game: undefined,
          isFinal,
          matchupId: matchupId + roundGameIdx,
          roundIdx,
          roundGameIdx,
          winnersFrom: rounds.length
            ? [roundGameIdx * 2, roundGameIdx * 2 + 1].map((idx: number) => {
                return rounds[roundIdx - 1][idx]
              })
            : undefined
        } as BracketMatchup
      })
    matchupId += roundTeamsLength
    rounds.push(roundMatchups)
  }
  // fill with games
  games.sort((a: GameComputedClass, b: GameComputedClass) =>
    compareAsc(a.row.datetime, b.row.datetime)
  )
  rounds.forEach((roundMatchups: BracketRound) => {
    const roundGames: GameComputedClass[] = games.splice(0, roundMatchups.length)
    roundGames.forEach((game: GameComputedClass) => {
      const teamsId = game.scores.map((score: ScoresComputed) => score.id)
      const idx: number = roundMatchups.findIndex((matchup: BracketMatchup) => {
        return (
          !matchup.game &&
          matchup.winnersFrom?.some((mu: BracketMatchup) => {
            return mu.game?.scores.find((score: ScoresComputed) => teamsId.includes(score.id))
          })
        )
      })
      const availableIdx = roundMatchups.findIndex((matchup: BracketMatchup) => !matchup.game)
      roundMatchups[idx > -1 ? idx : availableIdx].game = game
    })
  })
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
          const { type, title } = phase
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
            compareAsc(b.row.datetime, a.row.datetime)
          )
          // each group:
          const groups = phase.groups.map((group: PhaseGroup, idx: Number): CompetitionGroupComputed => {
            // games
            const groupGames = phaseGames.filter((game: GameComputedClass) =>
              game.row.teams.every((teamId: TeamId) => group.teams.includes(teamId))
            )

            // standing:
            const standing: CompetitionStanding[] = group.teams.reduce(
              (standing: CompetitionStanding[], teamId: TeamId) => {
                const teamGames: GameComputedClass[] = groupGames
                  .filter(
                    (game: GameComputedClass) => game.row.teams.includes(teamId) && game.isFinished
                  )
                teamGames.sort((a:GameComputedClass, b:GameComputedClass) =>  {
                  return compareAsc(b.row.datetime, a.row.datetime)
                })
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
                standing[idx].playoff = group.teams.length / (row.wins + 1)
              }
            })

            // ranking:
            const ranking: CompetitionRanking[] = group.teams.reduce(
              (ranking: CompetitionRanking[], teamId: TeamId) => {
                const team = this.teams.find(
                  (team: CompetitionTeam) => team.id === teamId
                ) as CompetitionTeam
                const teamRanking: CompetitionRanking[] = team.players
                  .map((player: CompetitionPlayer) => {
                      const playerId: PlayerId = player.id
                      const playerRanking = getPlayerRankingFromGames(playerId, groupGames)
                      return {
                        teamId: team.id,
                        playerId: player.id,
                        number: player.number,
                        ...playerRanking,
                        awards: [
                          ...playerRanking.awards,
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
              type === 'playoffs' ? getGroupBracket(group.teams, groupGames.slice()) : undefined

            // returns CompetitionGroupComputed
            return {
              title: group.title,
              standing,
              ranking,
              games: groupGames,
              bracket
            }
          })

          return {
            title,
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
              playerStatsKeys.forEach((key: PlayerStatKey) => {
                if (isNaN(rank[key]) || rank[key] === undefined) {
                  console.warn('rank with undefined value for', key, rank)
                }
                const val = rank[key] || 0
                rankingList[idx][key] = typeof rankingList[idx][key] === 'number'
                  ? rankingList[idx][key] + val
                  : val
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
          ...updatePlayerCalculatedStatsCalculations(playerRank)
        }
      })
  }

  // each teams overall stats
  get competitionStandings(): CompetitionStandingComputed[] {
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
                    ...getEmptyTeamStats(),
                    hist: []
                  } as CompetitionStandingComputed)
            teamStandingKeys.forEach((key: TeamStatKey) => {
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
