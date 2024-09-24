
import type { ScoresComputed } from '@/models/GameComputed'
import type GameComputedClass from '@/models/GameComputed'
import type { CompetitionPlayerStats, CompetitionStanding } from '@/types/computed'
import type { CompetitionPlayer } from '@/types/player'
import type { PlayerStatLineKey, PlayerStatLine, PlayerCalculatedStats, PlayerCalculatedStatsKey, PlayerGamesStats, PlayerGamesStatsKey, GamesHist } from '@/types/player-stats'
import type { TeamStatKey, TeamStats } from '@/types/team-stats'
import type { CompetitionTeam } from '@/types/team'
import { add, getPerc } from '@/utils/maths'
export default function useStats() {

  // Stats object keys: (1 game stats)
  const ft: PlayerStatLineKey[] = ['ftm', 'fta']
  const fg: PlayerStatLineKey[] = ['fgm', 'fga']
  const fg3: PlayerStatLineKey[] = ['fg3m', 'fg3a']
  const reb: PlayerStatLineKey[] = ['dreb', 'oreb']
  const _morekeys: PlayerStatLineKey[] = ['ast', 'stl', 'blk', 'blka', 'tov', 'fcm', 'fdr']

  const playerStatsKeys: PlayerStatLineKey[] = [
    ...ft,
    ...fg,
    ...fg3,
    ...reb,
    ..._morekeys,
    'dnp'
  ]

  const getEmptyPlayerStatLine = ():PlayerStatLine => ({
    ...playerStatsKeys
      .reduce((result: PlayerStatLine, key: PlayerStatLineKey) => {
        result[key] = 0
        return result
      }, {} as PlayerStatLine)
  })

  const mergeStatLines = (rows: PlayerStatLine[] = []): PlayerGamesStats => {
    if (!Array.isArray(rows)) {
      console.warn('not an array of stats')
    }
    const acc = rows
      .reduce((acc: PlayerStatLine, row: PlayerStatLine) => {
          playerStatsKeys.forEach((key: PlayerStatLineKey) => {
            acc[key] = add(acc[key], row[key])
          })
          return acc
        }, 
        getEmptyPlayerStatLine()
      )
    // calculs
    const dnps = rows.reduce((tot: number, row: PlayerStatLine) => {
        tot += row.dnp
        return tot
      }, 0)
    const gp = rows.length - dnps
    return {
      gp,
      ...acc,
    }
  }
  const mergePlayerGamesStats = (rows: PlayerGamesStats[] = []): PlayerGamesStats => {
    if (!Array.isArray(rows)) {
      console.warn('not an array of stats')
    }
    const acc = rows
      .reduce((acc: PlayerGamesStats, row: PlayerGamesStats) => {
          playerStatsKeys.forEach((key: PlayerStatLineKey) => {
            acc[key] = add(acc[key], row[key])
          })
          return acc
        }, 
        getEmptyPlayerStatLine() as PlayerGamesStats
      )
    // gp
    const gp = rows
      .reduce((tot: number, row: PlayerGamesStats) => {
        return add(tot, Number(row.gp))
      }, 0)
    return {
      ...acc,
      gp
    }
  }

  const getPlayerCalculatedStatsFromPlayerGamesStats = (rows: PlayerGamesStats[] = []):PlayerCalculatedStats => {
    if (!Array.isArray(rows)) {
      console.warn('not an array of stats')
    }
    const acc: PlayerGamesStats = mergePlayerGamesStats(rows)
    // calculs
    const { fta, ftm, fga, fgm, fg3a, fg3m, oreb, dreb } = acc
    const ftprc = getPerc(fta, ftm)
    const fgprc = getPerc(fga, fgm)
    const fg3prc = getPerc(fg3a, fg3m)
    const pts = ftm + 2 * fgm + 3 * fg3m
    const reb = oreb + dreb
    return {
      ...acc,
      ftprc,
      fgprc,
      fg3prc,
      pts,
      reb
    } as PlayerCalculatedStats
  }

  const playerCalculatedStatsKeys: PlayerCalculatedStatsKey[] = [
    'pts',
    ...ft,
    'ftprc',
    ...fg,
    'fgprc',
    ...fg3,
    'fg3prc',
    ...reb,
    'reb',
    ..._morekeys,
    'dnp'
  ]

  const teamStandingKeys: TeamStatKey[] = [
    'gp', 
    'wins', 
    'ptsfv', 
    'ptsag'
  ]

  const getEmptyTeamStats = () => ({
    ...teamStandingKeys
      .reduce((result: TeamStats, key: TeamStatKey) => {
        result[key] = 0
        return result
      }, {} as TeamStats)
  })

  const getPlayersStatsForGames = (teams: CompetitionTeam[], games: GameComputedClass[]): CompetitionPlayerStats[] => {
    const playersStats = teams
      .reduce((result: CompetitionPlayerStats[], team: CompetitionTeam): CompetitionPlayerStats[] => {
        const statslines = team.players
          .map((player: CompetitionPlayer) => {
            const statlines: PlayerStatLine[] = games
              .filter(
                (game: GameComputedClass) => game.row.boxscore[player.id] && game.row.boxscore[player.id].dnp === 0
              )
              .reduce((acc: PlayerStatLine[], game: GameComputedClass) => {
                acc.push(game.row.boxscore[player.id])
                return acc
              }, [])
            const gamesStats: PlayerGamesStats = mergeStatLines(statlines)
            return {
              teamId: team.id,
              playerId: player.id,
              number: player.number,
              ...gamesStats,
            }
          })
        result.push(...statslines)
        return result
      }, [])
    return playersStats               
  }

  const getStandingsForGames = (teams: CompetitionTeam[], games: GameComputedClass[]):CompetitionStanding[] => {
    const result: CompetitionStanding[] = teams
      .reduce((standing: CompetitionStanding[], team: CompetitionTeam) => {
          const teamId = team.id
          const teamGames = games
            .filter((game: GameComputedClass) => game.row.teams.includes(teamId))
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
            ...teamGames
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
              ),
            hist
          })
          return standing
        },
        []
      )
      result.sort((a: CompetitionStanding, b: CompetitionStanding) => {
        const getPct = (st: CompetitionStanding) => st.gp / st.wins
        const getDiff = (st: CompetitionStanding) => st.ptsfv - st.ptsag
        const aPct = getPct(a)
        const bPct = getPct(b)
        const bestWinningPerc = aPct - bPct
        const mostPlayedGames = b.gp - a.gp
        const bestDiff = getDiff(b) - getDiff(a)
        return bestWinningPerc || mostPlayedGames || bestDiff
      })
    return result
  }


  return {
    // player single game stats
    playerStatsKeys,
    mergeStatLines,
    getEmptyPlayerStatLine,

    // player computed stats (pts, reb, perc)
    playerCalculatedStatsKeys,
    getPlayerCalculatedStatsFromPlayerGamesStats,
    
    // teams results
    teamStandingKeys,

    // methods
    getPlayersStatsForGames,
    getStandingsForGames,

  }
}
