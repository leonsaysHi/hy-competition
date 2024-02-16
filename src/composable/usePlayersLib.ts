import useFirestoreAdmin from '@/composable/useFirestoreAdmin'
import { playersColl } from '@/firebase-firestore.js'
import { createGlobalState } from '@vueuse/core'
import { useFirestore } from '@vueuse/firebase/useFirestore'
import { doc } from 'firebase/firestore'
import { computed } from 'vue'
import type { Player, PlayerId } from '@/types/players'
import type { DocumentData, QueryDocumentSnapshot, SnapshotOptions } from 'firebase/firestore'
import type { Ref } from 'vue'

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
const coll = playersColl.withConverter(converter)

export default function usePlayersLib() {
    const rows: Ref<Player[] | undefined> = createGlobalState(() => useFirestore(coll, undefined))() as Ref<Player[] | undefined>
  const isReady = computed(() => Array.isArray(rows.value))
    const get = (playerId: PlayerId): Player => rows.value?.find(r => r.id === playerId) || {} as Player

  const { writeDocs, deleteDocs } = useFirestoreAdmin()
  const writeRows = (rows: any[]) => writeDocs(rows, coll)
  const deleteRows = async (rows: Player[]) => {
    return deleteDocs(rows.map((row: Player) => doc(coll, row.id)))
  }

  return {
    isReady,
    rows,
    get,
    // admin
    writeRows,
    deleteRows,
  }
}
