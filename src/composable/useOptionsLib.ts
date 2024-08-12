import type { CompetitionCategorie, CompetitionSport, PhaseType } from '@/types/competitions'
import type { GenderKey } from '@/types/players'
import type { PlayerStatKey, TeamStatKey, PlayerRankingKey, AwardKey, StatsGroupDef } from '@/types/stats'
import type { Option } from '@/types/comp-fields'
import i18n from '@/i18n'

const t = (path: string): string => i18n.global.t(path)

export default function usePlayersLib() {
  const competitionSports: { value: CompetitionSport; text: string }[] = [
    { text: 'Basketball 5x5', value: 'basketball5x5' }
  ]
  const competitionCategories: { value: CompetitionCategorie; text: string }[] = [
    { text: 'U17', value: 'u17' },
    { text: 'U20', value: 'u21' },
    { text: 'Senior', value: 'senior' },
    { text: '+35', value: '+35' }
  ]
  const getCategory = (value: CompetitionCategorie) =>
    competitionCategories.find((row) => row.value === value)

  const genders: { value: GenderKey; text: string; long: string }[] = ['m', 'f'].map(
    (key: string) => ({
      text: t(`options.genders.text.${key}`),
      long: t(`options.genders.long.${key}`),
      value: key as GenderKey
    })
  )
  const getGender = (value: GenderKey) => genders.find((row) => row.value === value)

  const competitionPhases: { value: PhaseType; text: string }[] = [
    { text: t('options.phases.groups'), value: 'groups' },
    { text: t('options.phases.playoffs'), value: 'playoffs' }
  ]

  const competitionStatsInput: Option[] = [
    { text: t('options.stats.sheet'), value: 'sheet' },
    { text: t('options.stats.playbyplay'), value: 'play-by-play', disabled: true }
  ]

  const competitionStatsGroups: StatsGroupDef[] = [
    { keys: ['ftm','fgm', 'fg3m', 'dreb', 'ast', 'stl', 'blk' ] },
    { text: 'Game played', value: 'gp', keys: ['gp'] },
    { text: 'Field goals atempt', value: 'fga', keys: ['fta', 'fga', 'fg3a'] },
    { text: 'Rebounds def/off', value: 'oreb', keys: ['oreb'] },
    { text: 'Turn overs', value: 'tov', keys: ['tov'] },
    { text: 'Blocks against', value: 'blka', keys: ['blka'] },
    { text: 'Fouls commited/drawn', value: 'f', keys: ['fcm', 'fdr'] }
  ]

  const playerStatsKeys: { value: PlayerStatKey; text: string; long: string }[] = [
    'ftm',
    'fta',
    'fgm',
    'fga',
    'fg3m',
    'fg3a',
    'dreb',
    'oreb',
    'ast',
    'stl',
    'blk',
    'blka',
    'tov',
    'fcm',
    'fdr'
  ].map((key: string) => ({
    text: t(`options.playerStats.text.${key}`),
    long: t(`options.playerStats.long.${key}`),
    value: key as PlayerStatKey
  }))

  const playerStatsSheetKeys: { value: PlayerStatKey; text: string; long: string }[] = [
    ...['dnp'].map((key: string) => ({
      text: t(`options.playerStats.text.${key}`),
      long: t(`options.playerStats.long.${key}`),
      value: key as PlayerStatKey
    })),
    ...playerStatsKeys
  ]

  const playerRankingKeys: Option[] = [
    {
      text: t('options.playerStats.text.gp'),
      long: t('options.playerStats.long.gp'),
      value: 'gp'
    },{
      text: t('options.playerStats.text.pts'),
      long: t('options.playerStats.long.pts'),
      value: 'pts'
    },
    ...playerStatsKeys
  ]

  const awardsKeys: { value: AwardKey; text: string; long: string }[] = ['mvp', 'def'].map(
    (key: string) => ({
      text: t(`options.awards.text.${key}`),
      long: t(`options.awards.long.${key}`),
      value: key as AwardKey
    })
  )
  const getAward = (value: AwardKey) => awardsKeys.find((row) => row.value === value)

  const teamStandingKeys: { value: TeamStatKey; text: string; long: string }[] = [
    {
      text: t('options.standingStats.text.gp'),
      long: t('options.standingStats.long.gp'),
      value: 'gp'
    },
    ...['wins', 'ptsfv', 'ptsag'].map((key: string) => ({
      text: t(`options.standingStats.text.${key}`),
      long: t(`options.standingStats.long.${key}`),
      value: key as TeamStatKey
    }))
  ]

  return {
    competitionSports,
    competitionCategories,
    competitionPhases,
    competitionStatsInput,
    competitionStatsGroups,
    genders,

    getGender,
    getCategory,
    getAward,

    playerStatsKeys,
    playerStatsSheetKeys,
    playerRankingKeys,
    awardsKeys,
    teamStandingKeys
  }
}
