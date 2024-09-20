
import type { ScoresComputed } from '@/models/GameComputed'
import type GameComputedClass from '@/models/GameComputed'
import type { Bracket, BracketMatchup, BracketRound } from '@/types/competitions'
import type { CompetitionTeam } from '@/types/teams'
import { compareAsc } from 'date-fns'

export default function useBracket() {

    const getBracketForGames  = (teams: CompetitionTeam[], games: GameComputedClass[]): Bracket => {
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


  return {
    getBracketForGames
  }
}
