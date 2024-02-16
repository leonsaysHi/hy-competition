import { computed } from 'vue'
import type { Ref } from 'vue'
import { competitionsColl } from '@/firebase-firestore.js'
import type { Competition, CompetitionId } from '@/types/competitions'
import { createGlobalState } from '@vueuse/core'
import { useFirestore } from '@vueuse/firebase/useFirestore'
import { competitionConverter } from '@/utils/firestore-converters'

const coll = competitionsColl.withConverter(competitionConverter)

export default function useCompetitionsLib() {
  const rows: Ref<Competition[] | undefined> = createGlobalState(() => useFirestore(coll, undefined)) () as Ref<Competition[] | undefined>
  const isReady = computed(()=> Array.isArray(rows.value))
  const get = (competitionId: CompetitionId) => {
    console.log('get', competitionId, rows.value)
    return rows.value?.find((row: Competition) => row.id === competitionId)
  }

  return {
    rows,
    isReady,
    get
  }
}
