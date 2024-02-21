import useFirestoreAdmin from '@/composable/useFirestoreAdmin'
import { doc } from 'firebase/firestore'
import { teamsColl } from '@/firebase-firestore.js'
import type { Team, TeamId } from '@/types/teams'
import { useFirestore } from '@vueuse/firebase/useFirestore'
import { computed } from 'vue'
import type { Ref } from 'vue'
import { teamConverter } from '@/utils/firestore-converters'

const coll = teamsColl.withConverter(teamConverter)

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
