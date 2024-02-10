import useFirestoreAdmin from '@/composable/useFirestoreAdmin'
import {
  doc,
  QueryDocumentSnapshot,
  type DocumentData,
  type SnapshotOptions
} from 'firebase/firestore'
import { competitionsColl } from '@/firebase-firestore.js'
import type { Competition, CompetitionId } from '@/types/competitions'

import { createGlobalState } from '@vueuse/core'
import { useFirestore } from '@vueuse/firebase/useFirestore'
import type { Ref } from 'vue'

const converter = {
  toFirestore: (row: Competition): DocumentData => {
    const payload = {
      ...row
    }
    return Object.fromEntries(Object.entries(payload).filter(([_, v]) => v != null))
  },
  fromFirestore: (snapshot: QueryDocumentSnapshot, options: SnapshotOptions) => {
    const data = snapshot.data(options)!
    return {
      id: snapshot.id,
      ...data
    }
  }
}
const collection = competitionsColl.withConverter(converter)

export default function useCompetitions() {
  const getAdminRows = createGlobalState(() => useFirestore(collection))
  const getRows = createGlobalState(() => useFirestore(collection))
  const getRow = (competitionId: CompetitionId) =>
    useFirestore(doc(collection, competitionId), null)
  const { writeDocs, deleteDocs } = useFirestoreAdmin()
  const writeRows = (rows: any[]) => writeDocs(rows, collection)
  const deleteRows = async (rows: Competition[]) => {
    return deleteDocs(rows.map((row: Competition) => doc(collection, row.id)))
  }

  return {
    getAdminRows,
    getRows,
    getRow,
    writeRows,
    deleteRows
  }
}
