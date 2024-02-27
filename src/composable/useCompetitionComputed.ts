import { collection, doc, writeBatch } from 'firebase/firestore'
import { db, computedCompetitionsColl, gamesName, competitionsColl } from '@/firebase-firestore.js'
import type { CompetitionId } from '@/types/competitions'
import { computed, type Ref } from 'vue'
import { useFirestore } from '@vueuse/firebase/useFirestore'

import useLibs from '@/composable/useLibs'
import type { CompetitionComputed } from '@/types/computed'
import { gameConverter } from '@/utils/firestore-converters'
import type { Game } from '@/types/games'

export default function useCompetition(competitionId: CompetitionId | undefined) {
  const { isReady: isLibsReady, getCompetition } = useLibs()

  const gamesCollRef = collection(competitionsColl, `/${competitionId}/${gamesName}`).withConverter(
    gameConverter
  )
  const row = computed(() => (competitionId ? getCompetition(competitionId) : undefined))
  const games = useFirestore(gamesCollRef, undefined) as Ref<Game[] | undefined>
  const computedRow = useFirestore(doc(computedCompetitionsColl, competitionId), undefined)
  const isReady = computed(() => isLibsReady && !!computedRow.value && !!games.value)

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

    // Competition
    row,
    games,
    computedRow,
    writeComputedCompetition
  }
}
