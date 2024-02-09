import { playersColl } from '@/firebase-firestore'
import { createGlobalState } from '@vueuse/core'
import { useFirestore } from '@vueuse/firebase/useFirestore'

export const usePlayers = createGlobalState(() => useFirestore(playersColl))
