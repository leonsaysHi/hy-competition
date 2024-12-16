import type { PlayerCalculatedStats, PlayerCalculatedStatsKey, PlayerGamesStats, PlayerStatLine, PlayerStatLineKey, StatKeyDef, StatsGroupDef } from '@/types/player-stats'
import { add, getPerc } from '../maths'
import type { GamesHist, TeamStatKey, TeamStats } from '@/types/team-stats'
import type { CompetitionTeam } from '@/types/team'
import type { CompetitionPlayerStats, CompetitionStanding } from '@/types/computed'
import type { CompetitionPlayer } from '@/types/player'
import type GameComputedClass from '@/models/GameComputed'
import type { ScoresComputed } from '@/models/GameComputed'
import i18n from '@/i18n'
const t = (path: string): string => i18n.global.t(path)

export const statKeysDefs: StatKeyDef[]  = [
  { key: 'pts', calculated: ['ftm', 'fgm', 'fg3m'] },
  { key: 'ftm' },
  { key: 'fta', group: 'fga' },
  { key: 'ftprc', calculated: ['ftm','fta'] },
  { key: 'fgm'},
  { key: 'fga', group: 'fga' },
  { key: 'fgprc', calculated: ['fgm','fga'] },
  { key: 'fg3m'},
  { key: 'fg3a', group: 'fga' },
  { key: 'fg3prc', calculated: ['fg3m','fg3a'] },
  { key: 'dreb' },
  { key: 'oreb', group: 'oreb' },
  { key: 'reb', calculated: ['dreb'] },
  { key: 'ast' },
  { key: 'stl' },
  { key: 'tov', group: 'tov' },
  { key: 'blk' },
  { key: 'blka', group: 'blka' },
  { key: 'fcm', group: 'f' },
  { key: 'fdr', group: 'f' },
  { key: 'dnp', group: 'dnp', hiddenFromCalculated: true }
]

// default stats
export const defaultStatsKeys = statKeysDefs
.filter((keyDef: StatKeyDef) => !keyDef.group && !keyDef.calculated)
.reduce((acc, keyDef: StatKeyDef) => {
  acc.push(keyDef.key) 
  return acc
}, [])

// extras stats by group
export const extraStatsGroups: StatsGroupDef[] = statKeysDefs
  .filter((keyDef: StatKeyDef) => keyDef.group && !keyDef.calculated)
  .reduce((acc: StatsGroupDef[], keyDef: StatKeyDef) => {
    let idx = acc.findIndex((def: StatsGroupDef) => def.value === keyDef.group)
    if (idx === -1) {
      acc.push({
        text: t(`options.stats.groups.${keyDef.group}`),
        value: keyDef.group,
        keys: []
      })
      idx = acc.length - 1
    }
    acc[idx].keys.push(keyDef.key)
    return acc
  }, [])

// player non calculated stats
export const playerStatsKeys: PlayerStatLineKey[] = statKeysDefs
  .filter((keyDef: StatKeyDef) => !keyDef.calculated)
  .reduce((acc, keyDef: StatKeyDef) => {
    acc.push(keyDef.key) 
    return acc
  }, [])

// player calculated stats
export const playerCalculatedStatsKeys: PlayerCalculatedStatsKey[] = statKeysDefs
  .filter((keyDef: StatKeyDef) => !keyDef.hiddenFromCalculated)
  .reduce((acc, keyDef: StatKeyDef) => {
    acc.push(keyDef.key) 
    return acc
  }, [])

// keys for player stats table
export const playerStatsTableKeys: PlayerCalculatedStatsKey[] = [
  'gp',  
  ...playerCalculatedStatsKeys
]

// key for teams results table
export const teamStandingKeys: TeamStatKey[] = [
  'gp', 
  'wins', 
  'ptsfv', 
  'ptsag'
]

// only in admin for init and reset:
export function getEmptyPlayerStatLine ():PlayerStatLine {
  return {
    ...playerStatsKeys
      .reduce((result: PlayerStatLine, key: PlayerStatLineKey) => {
        result[key] = 0
        return result
      }, {} as PlayerStatLine)
  }
}

// usefull methods for stats: 

export function mergeStatLines (rows: PlayerStatLine[] = []): PlayerGamesStats {
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

export function getPlayerCalculatedStatsFromPlayerGamesStats (rows: PlayerGamesStats[] = []):PlayerCalculatedStats {
  if (!Array.isArray(rows)) {
    console.warn('not an array of stats')
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

// ranking, player's details, computed: player's competition
export function getCompetitionPlayersStats (teams: CompetitionTeam[], games: GameComputedClass[]): CompetitionPlayerStats[] {
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

export function getCompetitionStanding (teams: CompetitionTeam[], games: GameComputedClass[]):CompetitionStanding[] {
  const getEmptyTeamStats = () => {
    return {
      ...teamStandingKeys
        .reduce((result: TeamStats, key: TeamStatKey) => {
          result[key] = 0
          return result
        }, {} as TeamStats)
    }
  }
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
    const sortLogic = (a: CompetitionStanding, b: CompetitionStanding) => {
      const getPct = (st: CompetitionStanding) => st.gp / st.wins
      const getDiff = (st: CompetitionStanding) => st.ptsfv - st.ptsag
      const aPct = getPct(a)
      const bPct = getPct(b)
      const bestWinningPerc = aPct - bPct
      const mostPlayedGames = b.gp - a.gp
      const bestDiff = getDiff(b) - getDiff(a)
      return bestWinningPerc || mostPlayedGames || bestDiff
    }
    result.sort(sortLogic)
    // cityhoops sort:
    interface GroupByPct {
      pct: number
      teams: CompetitionStanding[]
    }
    const groupsByPct: GroupByPct[] = result.reduce((res, team:CompetitionStanding) => {
      const getPct = (st: CompetitionStanding) => st.gp / st.wins
      const pct = getPct(team)
      const group = res.find(item => item.pct === pct)
      if (!group) {
        res.push({ pct, teams: [team] })
      } else {
        group.teams.push(team)
      }
      return res
    }, [] as GroupByPct[])
    const newResults: CompetitionStanding[] = groupsByPct.reduce((res, group: GroupByPct) => {
      const teamsIds = group.teams.map((team:CompetitionStanding) => team.teamId)
      const sortByGame = group.teams.length === 2 
        ? games
        .find((game: GameComputedClass) => {
          return game.row.teams.every((teamId) => teamsIds.includes(teamId))
        })
        : undefined
      // if 1 or more than 2 teams:
      if (sortByGame) {
        const { id: winnerId } = sortByGame.scores.find((score:ScoresComputed) => score.winner)
        res.push(...group.teams.sort(a => a.teamId === winnerId ? -1 : 1))
      } else {
        res.push(...group.teams.sort(sortLogic))
      } 
      return res
    }, [] as CompetitionStanding[])
    result.splice(0, result.length, ...newResults)
    //
  return result
}