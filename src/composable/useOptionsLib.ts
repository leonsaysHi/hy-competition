import type {
  CompetitionCategorie,
  CompetitionSport,
  PhaseType
} from '@/types/competitions'
import type { GenderKey } from '@/types/players'
import type { PlayerStatKey, TeamStatKey, PlayerRankingKey, AwardKey } from '@/types/stats'
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

  const playByPlayStatsKeys: { value: PlayerStatKey; text: string; long: string }[] = [
    ...['time'].map((key: string) => ({
      text: t(`options.playerStats.text.${key}`),
      long: t(`options.playerStats.long.${key}`),
      value: key as PlayerStatKey
    })),
    ...playerStatsKeys
  ]

  const playerRankingKeys: { value: PlayerRankingKey; text: string; long: string }[] = [
    {
      text: t('options.playerStats.text.gp'),
      long: t('options.playerStats.long.gp'),
      value: 'gp'
    },
    ...playerStatsKeys.reduce(
      (result: { value: PlayerRankingKey; text: string; long: string }[], opt: Option) => {
        const key = opt.value as PlayerStatKey
        result.push(opt)
        const inserKey: PlayerRankingKey | undefined =
          key === 'fta' ? 'ftprc' : key === 'fga' ? 'fgprc' : key === 'fg3a' ? 'fg3prc' : undefined
        if (inserKey) {
          result.push({
            text: t(`options.playerStats.text.${inserKey}`),
            long: t(`options.playerStats.long.${inserKey}`),
            value: inserKey
          })
        }
        return result
      },
      []
    )
    // awards[]
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
    genders,

    getGender,
    getCategory,
    getAward,

    playerStatsKeys,
    playerRankingKeys,
    awardsKeys,
    teamStandingKeys
  }
}
