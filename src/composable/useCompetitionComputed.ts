import { collection, doc, writeBatch } from 'firebase/firestore'
import {
  db,
  computedCompetitionsColl,
  gamesName,
  competitionsColl,
  teamsName
} from '@/firebase-firestore.js'
import type { CompetitionId } from '@/types/competitions'
import { computed, type Ref } from 'vue'
import { useFirestore } from '@vueuse/firebase/useFirestore'

import useLibs from '@/composable/useLibs'
import type { CompetitionComputed } from '@/types/computed'
import { competitionTeamConverter, gameConverter } from '@/utils/firestore-converters'
import type { Game } from '@/types/games'
import type { CompetitionTeam, TeamId } from '@/types/teams'
import type { CompetitionPlayer, PlayerId } from '@/types/players'

export default function useCompetition(competitionId: CompetitionId | undefined) {
  const { isReady: isLibsReady, getCompetition } = useLibs()

  const gamesCollRef = collection(competitionsColl, `/${competitionId}/${gamesName}`).withConverter(
    gameConverter
  )
  const teamsCollRef = collection(competitionsColl, `/${competitionId}/${teamsName}`).withConverter(
    competitionTeamConverter
  )
  const row = computed(() => (competitionId ? getCompetition(competitionId) : undefined))
  const games = useFirestore(gamesCollRef, undefined) as Ref<Game[] | undefined>
  const teams = useFirestore(teamsCollRef, undefined) as Ref<CompetitionTeam[] | undefined>
  const computedRow = useFirestore(doc(computedCompetitionsColl, competitionId), undefined) as Ref<
    CompetitionComputed | undefined
  >
  const isReady = computed(
    () => isLibsReady && !!computedRow.value && !!games.value && !!teams.value
  )

  const getTeam = (teamId: TeamId): CompetitionTeam | undefined =>
    teams.value?.find((team: CompetitionTeam) => team.id === teamId)
  const getTeamFromPlayerId = (playerId: PlayerId): CompetitionTeam | undefined => {
    return teams.value?.find((team: CompetitionTeam) => {
      return team.players?.find((player: CompetitionPlayer) => player.id === playerId)
    })
  }
  const getPlayer = (playerId: PlayerId): CompetitionPlayer | undefined => {
    const team = getTeamFromPlayerId(playerId)
    return team?.players?.find((player: CompetitionPlayer) => player.id === playerId)
  }
  // Admin
  const writeComputedCompetition = async (payload: CompetitionComputed) => {
    const { id } = payload
    const batch = writeBatch(db)
    const computedCompetitionRef = id
      ? doc(computedCompetitionsColl, id)
      : doc(computedCompetitionsColl)
    batch.set(computedCompetitionRef, payload)
    await batch.commit()
  }

  return {
    isReady,
    getTeam,
    getPlayer,
    getTeamFromPlayerId,

    // Competition
    row,
    games,
    teams,
    computedRow,
    writeComputedCompetition
  }
}
