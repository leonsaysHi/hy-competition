import { doc, collection } from 'firebase/firestore'
import { gamesName, gamesCollGroup, competitionsColl } from '@/firebase-firestore'
import { createGlobalState } from '@vueuse/core'
import { useFirestore } from '@vueuse/firebase/useFirestore'

export const useGames = createGlobalState(() => useFirestore(gamesCollGroup))
export const useCompetitionGames = (competitionId: string) =>
  useFirestore(collection(competitionsColl, `${competitionId}/${gamesName}`))
export const useGameDetails = (competitionId: string, gameId: string) =>
  useFirestore(doc(competitionsColl, `${competitionId}/${gamesName}/${gameId}`))
