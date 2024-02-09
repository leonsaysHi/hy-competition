import useFirestoreAdmin from '@/composable/useFirestoreAdmin'
import {
  doc,
  QueryDocumentSnapshot,
  type DocumentData,
  type SnapshotOptions
} from 'firebase/firestore'
import { playersColl } from '@/firebase-firestore.js'
import type { Player } from '@/types/players'

import { createGlobalState } from '@vueuse/core'
import { useFirestore } from '@vueuse/firebase/useFirestore'

const converter = {
  toFirestore: (row: Player): DocumentData => {
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
const collection = playersColl.withConverter(converter)

export default function usePlayers() {
  const getRows = createGlobalState(() => useFirestore(collection))
  const { writeDocs, deleteDocs } = useFirestoreAdmin()
  const writeRows = (rows: any[]) => writeDocs(rows, collection)
  const deleteRows = async (rows: Player[]) => {
    return deleteDocs(rows.map((row: Player) => doc(collection, row.id)))
  }

  return {
    getRows,
    writeRows,
    deleteRows
  }
}
