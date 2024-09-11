
import type { TeamStatKey, PlayerStatLineKey, TeamStats, PlayerStatLine, PlayerCalculatedStats, PlayerCalculatedStatsKey } from '@/types/stats'
import { add, getPerc } from '@/utils/maths'
export default function useStatsKeys() {

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

  const getPlayerCalculatedStatsFromStats = (rows: PlayerStatLine[] = []):PlayerCalculatedStats => {
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
    const { fta, ftm, fga, fgm, fg3a, fg3m, oreb, dreb, dnp } = acc
    const gp = rows.length - dnp
    const ftprc = getPerc(fta, ftm)
    const fgprc = getPerc(fga, fgm)
    const fg3prc = getPerc(fg3a, fg3m)
    const pts = ftm + 2 * fgm + 3 * fg3m
    const reb = oreb + dreb
    return {
      ...acc,
      gp,
      ftprc,
      fgprc,
      fg3prc,
      pts,
      reb
    } as PlayerCalculatedStats
  }

  const PlayerCalculatedStatsKeys: PlayerCalculatedStatsKey[] = [
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
    ...PlayerCalculatedStatsKeys
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

    // player inputed stats
    playerStatsKeys,
    getEmptyPlayerStatLine,

    // player computed stats (pts, reb, perc)
    PlayerCalculatedStatsKeys,
    getEmptyPlayerCalculatedStats,
    getPlayerCalculatedStatsFromStats,
    
    // teams results
    teamStandingKeys,
    getEmptyTeamStats

  }
}
