import type { CompetitionCategorie, CompetitionSport, PhaseType } from '@/types/competitions'
import type { GenderKey } from '@/types/players'
import type { PlayerStatKey, TeamStatKey, PlayerRankingKey, AwardKey } from '@/types/stats'
import i18n from '@/i18n'

const t = (path: string):string => i18n.global.t(path)
const tc = (path: string):string => i18n.global.tc(path)

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

  const genders: { value: GenderKey; text: string; long: string }[] = [ 
    'm', 'f' 
  ].map((key: string) => ({ 
    text: t(`options.genders.text.${key}`), 
    long: t(`options.genders.long.${key}`), 
    value: key as GenderKey
  }))
  const getGender = (value: GenderKey) => genders.find((row) => row.value === value)

  const competitionPhases: { value: PhaseType; text: string }[] = [
    { text: t('options.phases.groups'), value: 'groups' },
    { text: t('options.phases.playoffs'), value: 'playoffs' }
  ]
  const statsKeys: { value: PlayerStatKey; text: string; long: string }[] = [
    'pts', 'reb','ast', 'stl', 'blk', 'to', 'pf', 'm3pts'
  ].map((key: string) => ({ 
      text: t(`options.playerStats.text.${key}`), 
      long: t(`options.playerStats.long.${key}`), 
      value: key as PlayerStatKey
    }))

  const awardsKeys: { value: AwardKey; text: string; long: string }[] = [ 
    'mvp', 'def' 
  ].map((key: string) => ({ 
    text: t(`options.awards.text.${key}`), 
    long: t(`options.awards.long.${key}`), 
    value: key as AwardKey
  }))
  const getAward = (value: AwardKey) => awardsKeys.find((row) => row.value === value)

  const playerRankingKeys: { value: PlayerRankingKey; text: string; long: string }[] = [
    { text: t('options.rankingStats.text.gp'), long: t('options.rankingStats.long.gp'), value: 'gp' },
    ...statsKeys
    // awards[]
  ]
  const teamStandingKeys: { value: TeamStatKey; text: string; long: string }[] = [
    { text: t('options.rankingStats.text.gp'), long: t('options.rankingStats.long.gp'), value: 'gp' },
    ...(['wins', 'ptspos', 'ptsneg'].map((key: string) => ({ 
      text: t(`options.standingStats.text.${key}`), 
      long: t(`options.standingStats.long.${key}`), 
      value: key as TeamStatKey
    })))
  ]

  return {
    competitionSports,
    competitionCategories,
    competitionPhases,
    genders,

    getGender,
    getCategory,
    getAward,

    statsKeys,
    awardsKeys,
    playerRankingKeys,
    teamStandingKeys
  }
}
