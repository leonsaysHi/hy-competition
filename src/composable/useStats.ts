
import type { TeamStatKey, PlayerStatLineKey, TeamStats, PlayerStatLine, PlayerCalculatedStats, PlayerCalculatedStatsKey, PlayerGamesStats, PlayerGamesStatsKey } from '@/types/stats'
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

  // Cumulated games stats object: (n game stats)
  const playerGamesStatsKeys: PlayerGamesStatsKey[] = [
    ...ft,
    ...fg,
    ...fg3,
    ...reb,
    ..._morekeys,
    'dnp'
  ]
  const getPlayerGamesStatsFromStatLines = (rows: PlayerStatLine[] = []): PlayerGamesStats => {
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
    const { dnp } = acc
    const gp = rows.length - dnp
    return {
      gp,
      ...acc,
    }
  }

  const getPlayerCalculatedStatsFromStats = (rows: PlayerStatLine[] = []):PlayerCalculatedStats => {
    if (!Array.isArray(rows)) {
      console.warn('not an array of stats')
    }
    const acc: PlayerGamesStats = getPlayerGamesStatsFromStatLines(rows)
    
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

  const getEmptyPlayerCalculatedStats = () => ({
    ...playerCalculatedStatsKeys
      .reduce((result: PlayerCalculatedStats, key: PlayerCalculatedStatsKey) => {
        result[key] = 0
        return result
      }, {} as PlayerCalculatedStats)
  })

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


  return {
    // player single game stats
    playerStatsKeys,
    getEmptyPlayerStatLine,

    // player multiple games stats
    playerGamesStatsKeys,
    getPlayerGamesStatsFromStatLines,

    // player computed stats (pts, reb, perc)
    playerCalculatedStatsKeys,
    getEmptyPlayerCalculatedStats,
    getPlayerCalculatedStatsFromStats,
    
    // teams results
    teamStandingKeys,
    getEmptyTeamStats

  }
}
