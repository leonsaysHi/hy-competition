import { computed } from 'vue'
import useTeamsLib from '@/composable/useTeamsLib'
import usePlayersLib from '@/composable/usePlayersLib'
import useCompetitionsLib from '@/composable/useCompetitionsLib'

const {
  isReady: isCompetitionsLibReady,
  rows: competitionsRows,
  get: getCompetition
} = useCompetitionsLib()
const {
  isReady: isTeamsLibReady,
  rows: teamsRows,
  get: getTeam,
  getName: getTeamName
} = useTeamsLib()
const {
  isReady: isPlayersLibReady,
  rows: playersRows,
  get: getPlayer,
  getName: getPlayerName
} = usePlayersLib()

export default function useLibs() {
  const isReady = computed(
    () => isCompetitionsLibReady.value && isTeamsLibReady.value && isPlayersLibReady.value
  )
  return {
    isCompetitionsLibReady,
    isTeamsLibReady,
    isPlayersLibReady,
    isReady,

    competitionsRows,
    getCompetition,

    teamsRows,
    getTeam,
    getTeamName,

    playersRows,
    getPlayer,
    getPlayerName
  }
}
