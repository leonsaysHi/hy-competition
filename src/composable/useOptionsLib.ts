import type { CompetitionCategorie, CompetitionSport, PhaseType } from '@/types/competitions'
import type { GenderKey } from '@/types/player'
import type { AwardKey } from '@/types/player-stats'
import type { Option } from '@/types/comp-fields'
import i18n from '@/i18n'
import type { TeamStatKey } from '@/types/team-stats'

const t = (path: string): string => i18n.global.t(path)

export default function usePlayersLib() {
  const competitionSports: { value: CompetitionSport; text: string }[] = [
    { text: 'Basketball 5x5', value: 'basketball5x5' }
  ]
  const competitionCategories: { value: CompetitionCategorie; text: string }[] = [
    { text: 'U16', value: 'u16' },
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

    awardsKeys,
    teamStandingKeys
  }
}
