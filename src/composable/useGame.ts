import type { CompetitionId, Roster, RosterPlayer, Rosters } from '@/types/competitions'

import type { CompetitionTeam, TeamId } from '@/types/teams'
import type { Game, GameId } from '@/types/games'
import type { CompetitionPlayer, PlayerId } from '@/types/players'

import useLibs from '@/composable/useLibs'
import { computed } from 'vue'
import useCompetition from './useCompetition'

export default function useGame(competitionId: CompetitionId, gameId: GameId) {
  const { isReady: isLibsReady, getPlayer } = useLibs()

  const {
    isReady: isCompetitionReady,
    row: competition,
    teams,
    games,
    config
  } = useCompetition(competitionId)

  const row = computed(() => games.value.find((row: Game) => row.id === gameId))
  const rosters = computed<Rosters | undefined>(() => {
    return row.value?.teams && teams.value
      ? isCompetitionReady.value &&
          row.value?.teams
            .map(
              (teamId: TeamId): CompetitionTeam =>
                teams.value.find((t: CompetitionTeam) => t.id === teamId) as CompetitionTeam
            )
            .reduce((rosters: Rosters, team: CompetitionTeam) => {
              const teamId = team.id
              const { players } = team
              rosters[teamId] = players.reduce((result: Roster, player: CompetitionPlayer) => {
                const playerId: PlayerId = player.id
                result[playerId] = {
                  ...player,
                  ...getPlayer(playerId)
                } as RosterPlayer
                return result
              }, {})
              return rosters
            }, {})
      : undefined
  })

  const isReady = computed(
    () => isLibsReady.value && row.value?.id && competition.value?.id && rosters.value
  )

  return {
    isReady,
    competition,
    row,
    teams,
    rosters,
    config
  }
}
