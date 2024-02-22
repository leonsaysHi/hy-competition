import type { Competition, CompetitionTeamComputed } from '@/types/competitions'
import useLibs from '@/composable/useLibs'
import type { Game } from '@/types/games'
import type { CompetitionTeam, TeamId } from '@/types/teams'
import { compareAsc } from 'date-fns'

const { getTeam } = useLibs()
const add = (total: number, a: number) => {
  return total + a
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

  get standing(): CompetitionTeamComputed[] {
    const result = this.teams.reduce(
      (standings: CompetitionTeamComputed[], team: CompetitionTeam) => {
        const teamId = team.id
        const games = this.games.filter((game: Game) => game.teams.includes(teamId))
        games.sort((a: Game, b: Game) => compareAsc(a.datetime, b.datetime))
        const gamesPlayed = games.filter(
          (game: Game) =>
            Object.values(game.scores).reduce((tot: number, periods: number[]) => {
              return tot + periods.reduce(add, 0)
            }, 0) > 0
        )
        const gamesPtsDiff = gamesPlayed.map<number>((game: Game) => {
          const oppId: TeamId = Object.keys(game.scores).filter((tId: TeamId) => tId !== teamId)[0]
          const teamScore = game.scores[teamId].reduce(add, 0)
          const oppScore = game.scores[oppId].reduce(add, 0)
          return teamScore - oppScore
        })
        const lastLength = 5
        const lasts: (boolean | undefined)[] = gamesPtsDiff
          .filter((diff: number) => diff !== 0)
          .slice(-lastLength)
          .map((diff: number) => diff > 0)
        while (lasts.length < lastLength) {
          lasts.unshift(undefined)
        }

        const result: CompetitionTeamComputed = {
          ...team,
          team: getTeam(teamId),
          gp: gamesPtsDiff.filter((diff: number) => diff !== 0).length,
          wins: gamesPtsDiff.filter((diff: number) => diff > 0).length,
          diff: gamesPtsDiff.reduce(add, 0),
          pos: 0,
          lasts
        }
        standings.push(result)
        return standings
      },
      []
    )
    result.sort((a: CompetitionTeamComputed, b: CompetitionTeamComputed) => {
      const getPct = (team: CompetitionTeamComputed) => team.gp / team.wins
      const aPct = getPct(a)
      const bPct = getPct(b)
      return aPct !== bPct ? aPct - bPct : a.diff - b.diff
    })
    return result.map((row: CompetitionTeamComputed, idx) =>({
        ...row,
        pos: idx+1
    }))
  }
}
