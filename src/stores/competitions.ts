import { query, doc, where } from 'firebase/firestore'
import { competitionsColl } from '@/firebase-firestore'
import { createGlobalState } from '@vueuse/core'
import { useFirestore } from '@vueuse/firebase/useFirestore'

export const useCompetitions = createGlobalState(() => useFirestore(competitionsColl))
export const useActiveCompetitions = createGlobalState(() =>
  useFirestore(query(competitionsColl, where('isActive', '==', true)))
)
export const useCompetitionDetails = (competitionId: string) =>
  useFirestore(doc(competitionsColl, competitionId))
