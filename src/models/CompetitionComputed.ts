import type {
  Bracket,
  BracketMatchup,
  BracketRound,
  Competition,
  Phase,
  PhaseGroup
} from '@/types/competitions'
import type { Game } from '@/types/games'
import type { CompetitionTeam, TeamId } from '@/types/teams'
import { compareAsc } from 'date-fns'
import GameComputedClass, { type ScoresComputed } from './GameComputed'
import type {
  CompetitionGroupComputed,
  CompetitionPhaseComputed,
  CompetitionPlayerComputed,
  CompetitionPlayerStats,
  CompetitionStanding,
  CompetitionStandingComputed,
} from '@/types/computed'
import useStats from '@/composable/useStats'
import GamesClass from './Games'
import useBracket from '@/composable/useBracket'

const { 
  getStandingsForGames,
  getPlayersStatsForGames,
} = useStats()
const { getBracketForGames } = useBracket()


export default class CompetitionClass {
  row: Competition
  games: Game[]
  teams: CompetitionTeam[]

  constructor(row: Competition) {
    this.row = row
    this.games = row.games as Game[]
    this.teams = row.teams as CompetitionTeam[]
  }

  // Standing & ranking by phases/groups
  // for competition views
  get computedPhases(): CompetitionPhaseComputed[] {
    const phases = Array.isArray(this.row.phases)
      ? this.row.phases
        .map((phase: Phase, phaseIdx: number): CompetitionPhaseComputed => {
            const { title, type } = phase
            // each group:
            const groups = phase.groups
              .map((group: PhaseGroup, groupIdx: number): CompetitionGroupComputed => {
                // games
                const groupGames = new GamesClass(this.row, this.games)
                  .phase(phaseIdx)
                  .group(groupIdx)
                  .finished(true)
                  .live(false)
                  .getComputed()
                // teams
                const teams = group.teams
                  .map((teamId: TeamId) => this.teams
                    .find((team: CompetitionTeam) => team.id === teamId) as CompetitionTeam
                  )

                // standing:
                const standing = getStandingsForGames(teams, groupGames)

                // stats:
                const stats = getPlayersStatsForGames(teams, groupGames)

                // bracket:
                const bracket = type === 'playoffs' 
                  ? getBracketForGames(group.teams, groupGames.slice()) 
                  : undefined

                // returns CompetitionGroupComputed
                return {
                  title: group.title,
                  standing,
                  stats,
                  games: groupGames,
                  bracket
                }
              })

            return {
              title,
              type,
              groups
            }
          })
        : []
    return phases
  }

  // Players competition computed payload 
  get competitionPlayerStatsToSave(): CompetitionPlayerComputed[] {
    const competitionGames = new GamesClass(this.row, this.games)
      .finished(true)
      .live(false)
      .getComputed()
    return getPlayersStatsForGames(this.teams, competitionGames)
      .map((row: CompetitionPlayerStats) => ({
        id: this.row.id,
        ...row
      }))
  }

  // Teams competition computed payload
  get competitionStandingsToSave(): CompetitionStandingComputed[] {
    const competitionGames = new GamesClass(this.row, this.games)
      .finished(true)
      .live(false)
      .getComputed()
    return getStandingsForGames(this.teams, competitionGames)
      .map((row: CompetitionStanding) => ({
        id: this.row.id,
        ...row
      }))
  }
}
