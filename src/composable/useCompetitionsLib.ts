/* eslint-disable @typescript-eslint/no-unused-vars */
import { computed } from 'vue'
import type { Ref } from 'vue'
import { competitionsColl } from '@/firebase-firestore.js'
import type { Competition, CompetitionDoc, CompetitionId } from '@/types/competitions'
import { useFirestore } from '@vueuse/firebase/useFirestore'
import { competitionConverter } from '@/utils/firestore-converters'
import { db } from '@/firebase-firestore.js'
import { doc, writeBatch } from 'firebase/firestore'

const coll = competitionsColl.withConverter(competitionConverter)

export default function useCompetitionsLib() {
  const rows: Ref<Competition[] | undefined> = useFirestore(coll, undefined) as Ref<
    Competition[] | undefined
  >

  const isReady = computed(() => Array.isArray(rows.value))
  const get = (competitionId: CompetitionId) =>
    rows.value?.find((row: Competition) => row.id === competitionId)

  const add = async (payload: CompetitionDoc) => {
    const batch = writeBatch(db)

    // doc
    const compRef = doc(coll)
    batch.set(compRef, payload)

    // commit all
    console.time('write.commit')
    await batch.commit()
    console.timeEnd('write.commit')
  }

  return {
    rows,
    isReady,
    get,
    add
  }
}
