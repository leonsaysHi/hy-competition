import useFirestoreAdmin from '@/composable/useFirestoreAdmin'
import {
  doc,
  QueryDocumentSnapshot,
  type DocumentData,
  type SnapshotOptions
} from 'firebase/firestore'
import { teamsColl } from '@/firebase-firestore.js'
import type { Team, TeamId } from '@/types/teams'
import { useFirestore } from '@vueuse/firebase/useFirestore'
import { computed } from 'vue'
import type { Ref } from 'vue'

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
  const rows: Ref<Team[] | undefined> = useFirestore(coll, undefined) as Ref<Team[] | undefined>
  const isReady = computed(() => Array.isArray(rows.value))
  const get = (teamId: TeamId): Team => rows.value?.find((r) => r.id === teamId) || ({} as Team)

  const { writeDocs, deleteDocs } = useFirestoreAdmin()
  const writeRows = (rows: any[]) => writeDocs(rows, coll)
  const deleteRows = async (rows: Team[]) => {
    return deleteDocs(rows.map((row: Team) => doc(coll, row.id)))
  }

  return {
    rows,
    isReady,
    get,

    //admin
    writeRows,
    deleteRows
  }
}
