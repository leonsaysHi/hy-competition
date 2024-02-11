import useFirestoreAdmin from '@/composable/useFirestoreAdmin'
import {
  doc,
  collection,
  QueryDocumentSnapshot,
  type DocumentData,
  type SnapshotOptions
} from 'firebase/firestore'
import { teamsName, teamsColl } from '@/firebase-firestore.js'
import type { Team } from '@/types/teams'

import { createGlobalState } from '@vueuse/core'
import { useFirestore } from '@vueuse/firebase/useFirestore'
import type { CompetitionId } from '@/types/competitions'

const converter = {
  toFirestore: (row: Team): DocumentData => {
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
const coll = teamsColl.withConverter(converter)

export default function useTeams() {
  const getRows = createGlobalState(() => useFirestore(coll))
  const { writeDocs, deleteDocs } = useFirestoreAdmin()
  const writeRows = (rows: any[]) => writeDocs(rows, coll)
  const deleteRows = async (rows: Team[]) => {
    return deleteDocs(rows.map((row: Team) => doc(coll, row.id)))
  }

  return {
    getRows,
    writeRows,
    deleteRows
  }
}
