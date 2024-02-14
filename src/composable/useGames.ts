import useFirestoreAdmin from '@/composable/useFirestoreAdmin'
import { doc, query, where } from 'firebase/firestore'
import type { QueryDocumentSnapshot, DocumentData, SnapshotOptions } from 'firebase/firestore'
import { gamesColl } from '@/firebase-firestore.js'
import type { Game } from '@/types/games'

import { useFirestore } from '@vueuse/firebase/useFirestore'
import type { CompetitionId } from '@/types/competitions'
import type { Ref } from 'vue'

const converter = {
  toFirestore: (row: Game): DocumentData => {
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
const coll = gamesColl.withConverter(converter)
export default function useCompetitions() {
  const { writeDocs, deleteDocs } = useFirestoreAdmin()
  const writeRows = (rows: any[]) => writeDocs(rows, coll)
  const deleteRows = async (rows: Game[]) => {
    return deleteDocs(rows.map((row: Game) => doc(coll, row.id)))
  }

  return {
    writeRows,
    deleteRows
  }
}
