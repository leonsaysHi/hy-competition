import useFirestoreAdmin from '@/composable/useFirestoreAdmin'
import { playersColl } from '@/firebase-firestore.js'
import { useFirestore } from '@vueuse/firebase/useFirestore'
import { doc } from 'firebase/firestore'
import { computed } from 'vue'
import type { Player, PlayerId } from '@/types/player'
import type { Ref } from 'vue'
import { playerConverter } from '@/utils/firestore-converters'

const coll = playersColl.withConverter(playerConverter)

export default function usePlayersLib() {
  const rows: Ref<Player[] | undefined> = useFirestore(coll, undefined) as Ref<Player[] | undefined>
  const isReady = computed(() => Array.isArray(rows.value))
  const get = (playerId: PlayerId): Player =>
    rows.value?.find((r) => r.id === playerId) || ({} as Player)
  const getName = (playerId: PlayerId): string => {
    const player: Player = get(playerId)
    return [player.fname, player.lname].filter(Boolean).join(' ')
  }
  const { writeDocs, deleteDocs } = useFirestoreAdmin()
  const writeRows = (rows: any[]) => writeDocs(rows, coll)
  const deleteRows = async (rows: Player[]) => {
    return deleteDocs(rows.map((row: Player) => doc(coll, row.id)))
  }

  return {
    isReady,
    rows,
    get,
    getName,

    // admin
    writeRows,
    deleteRows
  }
}
