import { teamsColl } from '@/firebase-firestore'
import { createGlobalState } from '@vueuse/core'
import { useFirestore } from '@vueuse/firebase/useFirestore'

export const useTeams = createGlobalState(() => useFirestore(teamsColl))
