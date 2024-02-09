import useFirestoreAdmin from '@/composable/useFirestoreAdmin'
import { doc, QueryDocumentSnapshot, type DocumentData, type SnapshotOptions } from 'firebase/firestore'
import { teamsColl } from '@/firebase-firestore.js'
import type { Team } from '@/types/teams'

import { createGlobalState } from '@vueuse/core'
import { useFirestore } from '@vueuse/firebase/useFirestore'

const converter = {
    toFirestore: (row: Team): DocumentData => {
      const payload = {
        ...row,
      }
      return Object.fromEntries(Object.entries(payload).filter(([_, v]) => v != null))
    },
    fromFirestore: (
      snapshot: QueryDocumentSnapshot,
      options: SnapshotOptions
    ) => {
      const data = snapshot.data(options)!
      return {
        id: snapshot.id,
        ...data,
      }
    }
}
const collection = teamsColl.withConverter(converter)

export default function useTeams() {
  const getRows = createGlobalState(() => 
    useFirestore(
      collection
    )
  )
  const { writeDocs, deleteDocs } = useFirestoreAdmin()
  const writeRows = (rows: any[]) => writeDocs(rows, collection)
  const deleteRows = async (rows: Team[]) => {
    return deleteDocs(
        rows.map((row: Team) => doc(collection, row.id))
    )
  }

  return {
    getRows,
    writeRows,
    deleteRows
  }
}
