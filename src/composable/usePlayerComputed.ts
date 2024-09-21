import { playerCompetitionsComputedName, playersColl } from '@/firebase-firestore.js'
import { useFirestore } from '@vueuse/firebase/useFirestore'
import { collection } from 'firebase/firestore'
import type { PlayerId } from '@/types/players'
import { computed, type Ref } from 'vue'
import { computedRankingConverter } from '@/utils/firestore-converters'
import type { CompetitionPlayerComputed } from '@/types/computed'

export default function usePlayerComputed(playerId: PlayerId) {
  const computedCompetitionsCollection = collection(
    playersColl,
    `/${playerId}/${playerCompetitionsComputedName}`
  ).withConverter(computedRankingConverter)

  const rows = useFirestore(computedCompetitionsCollection, undefined) as Ref<
    CompetitionPlayerComputed[] | undefined
  >

  const isReady = computed(() => Array.isArray(rows.value) && rows.value.every(Boolean))

  return {
    isReady,
    rows
  }
}
