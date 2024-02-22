import type {
  CompetitionCategorie,
  CompetitionGender,
  CompetitionSport,
  PhaseType
} from '@/types/competitions'
import type { StatKey } from '@/types/stats'

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
  const competitionGenders: { value: CompetitionGender; text: string }[] = [
    { text: 'M', value: 'm' },
    { text: 'F', value: 'f' }
  ]
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

  return {
    competitionSports,
    competitionCategories,
    competitionGenders,
    competitionPhases,
    statsKeys
  }
}
