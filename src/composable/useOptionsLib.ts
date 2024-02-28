import type { CompetitionCategorie, CompetitionSport, PhaseType } from '@/types/competitions'
import type { Gender } from '@/types/players'
import type { StatKey, TeamStatKey } from '@/types/stats'

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
  const genders: { value: Gender; text: string; long: string }[] = [
    { text: 'M', long: 'Male', value: 'm' },
    { text: 'F', long: 'Female', value: 'f' }
  ]
  const getGender = (value: Gender) => genders.find((row) => row.value === value)

  const competitionPhases: { value: PhaseType; text: string }[] = [
    { text: 'Groups', value: 'groups' },
    { text: 'Playoffs', value: 'playoffs' }
  ]
  const statsKeys: { value: StatKey; text: string; long: string }[] = [
    { text: 'Pts', long: 'Points', value: 'pts' },
    { text: 'Reb', long: 'Rebounds', value: 'reb' },
    { text: 'Ast', long: 'Assists', value: 'ast' },
    { text: 'Stl', long: 'Steals', value: 'stl' },
    { text: 'Blk', long: 'Blocks', value: 'blk' },
    { text: 'TO', long: 'Turn overs', value: 'to' },
    { text: 'PF', long: 'Personal Fouls', value: 'pf' },
    { text: '3pts', long: '3 points', value: 'm3pts' }
  ]

  const teamStatsKeys: { value: TeamStatKey; text: string; long: string }[] = [
    { text: 'GP', long: 'Game played', value: 'gp' },
    { text: 'W', long: 'Wins', value: 'wins' },
    { text: 'Pts+', long: 'Points in favor', value: 'ptspos' },
    { text: 'Pts-', long: 'Points against', value: 'ptsneg' },
    { text: 'L5', long: 'Lasts 5 games', value: 'hist' }
  ]

  return {
    competitionSports,
    competitionCategories,
    competitionPhases,

    genders,
    getGender,

    statsKeys,
    teamStatsKeys
  }
}
