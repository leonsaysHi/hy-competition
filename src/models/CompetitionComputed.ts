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
import type {
  TeamStats,
  PlayerStatLine,
  GamesHist,
  PlayerGamesStats
} from '@/types/stats'
import type { CompetitionPlayer } from '@/types/players'
import GameComputedClass, { type ScoresComputed } from './GameComputed'
import type {
  CompetitionGroupComputed,
  CompetitionPhaseComputed,
  CompetitionPlayerStats,
  CompetitionStanding,
} from '@/types/computed'
import useStats from '@/composable/useStats'
import GamesClass from './Games'


const { 
  getStandingsForGames,
  getPlayersStatsForGames,
} = useStats()



const getBracketForGames = (teams: TeamId[], games: GameComputedClass[]): Bracket => {
  let roundTeamsLength = teams.length
  let matchupId = 0
  const rounds: Bracket = []
  while (roundTeamsLength > 1) {
    roundTeamsLength *= 0.5
    const roundMatchups: BracketRound = new Array(roundTeamsLength)
      .fill({})
      .map((matchup: any, roundGameIdx: number): BracketMatchup => {
        const isFinal = roundTeamsLength === 1
        const roundIdx = rounds.length // 0, 1, 2, 3
        return {
          game: undefined,
          isFinal,
          matchupId: matchupId + roundGameIdx,
          roundIdx,
          roundGameIdx,
          winnersFrom: rounds.length
            ? [roundGameIdx * 2, roundGameIdx * 2 + 1].map((idx: number) => {
                return rounds[roundIdx - 1][idx]
              })
            : undefined
        } as BracketMatchup
      })
    matchupId += roundTeamsLength
    rounds.push(roundMatchups)
  }
  // fill with games
  games.sort((a: GameComputedClass, b: GameComputedClass) =>
    compareAsc(a.row.datetime, b.row.datetime)
  )
  rounds.forEach((roundMatchups: BracketRound) => {
    const roundGames: GameComputedClass[] = games.splice(0, roundMatchups.length)
    roundGames.forEach((game: GameComputedClass) => {
      const teamsId = game.scores.map((score: ScoresComputed) => score.id)
      const idx: number = roundMatchups.findIndex((matchup: BracketMatchup) => {
        return (
          !matchup.game &&
          matchup.winnersFrom?.some((mu: BracketMatchup) => {
            return mu.game?.scores.find((score: ScoresComputed) => teamsId.includes(score.id))
          })
        )
      })
      const availableIdx = roundMatchups.findIndex((matchup: BracketMatchup) => !matchup.game)
      roundMatchups[idx > -1 ? idx : availableIdx].game = game
    })
  })
  return rounds
}

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

  // Players overall stats
  get competitionRankings(): CompetitionPlayerStats[] {
    const competitionGames = new GamesClass(this.row, this.games)
      .finished(true)
      .live(false)
      .getComputed()
    return getPlayersStatsForGames(this.teams, competitionGames)
  }

  // Teams overall results
  get competitionStandings(): CompetitionStanding[] {
    const competitionGames = new GamesClass(this.row, this.games)
      .finished(true)
      .live(false)
      .getComputed()
    return getStandingsForGames(this.teams, competitionGames)
  }
}
