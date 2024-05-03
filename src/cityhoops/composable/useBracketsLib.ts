import useFirestoreAdmin from '@/composable/useFirestoreAdmin'
import { bracketsColl } from '@/firebase-firestore.js'
import type { Bracket, CompetitionId } from '@/types/competitions'
import type { TeamId } from '@/types/teams'
import { dateToTimeStamp } from '@/utils/dates'
import { useFirestore } from '@vueuse/firebase/useFirestore'
import { doc } from 'firebase/firestore'
import type {
  DocumentData,
  QueryDocumentSnapshot,
  SnapshotOptions,
  Timestamp
} from 'firebase/firestore'
import { computed } from 'vue'
import type { Ref } from 'vue'

interface BracketDoc {
  id?: string
  competitionId: CompetitionId
  title: string
  winners: string
  final: string
  dateCreated: any
}
export interface BracketItem {
  id: string
  competitionId: CompetitionId
  title: string
  winners: (TeamId | undefined)[][]
  final: { [key: TeamId]: number }
  dateCreated: Date
}
const dateFromFirestore = (ts: Timestamp): Date => {
  return ts.toDate()
}

const dateToFireStore = (date: Date): Timestamp => {
  return dateToTimeStamp(date)
}

const bracketsConverter = {
  toFirestore: (row: any): DocumentData => {
    const payload: BracketDoc = {
      ...row,
      winners: row.winners ? JSON.stringify(row.winners) : undefined,
      final: row.final ? JSON.stringify(row.final) : undefined,
      dateCreated: dateToFireStore(new Date())
    }
    return Object.fromEntries(Object.entries(payload).filter(([_, v]) => v != null))
  },
  fromFirestore: (snapshot: QueryDocumentSnapshot, options: SnapshotOptions) => {
    const data = snapshot.data(options) as BracketDoc
    const result: BracketItem = {
      id: snapshot.id,
      ...data,
      winners: data.winners ? JSON.parse(data.winners) : null,
      final: data.final ? JSON.parse(data.final) : null,
      dateCreated: data.dateCreated ? dateFromFirestore(data.dateCreated) : new Date()
    }
    return result
  }
}

const coll = bracketsColl.withConverter(bracketsConverter)

export default function useBracketsLib() {
  const _rows: Ref<BracketItem[] | undefined> = useFirestore(coll, undefined) as Ref<
    BracketItem[] | undefined
  >
  const rows = computed(() => _rows.value?.filter((row: BracketItem) => row.id !== 'admin') || [])
  const admin = computed(() => _rows.value?.find((row: BracketItem) => row.id === 'admin'))
  const isReady = computed(() => Array.isArray(rows.value))

  const { writeDocs, deleteDocs } = useFirestoreAdmin()
  const writeRows = (rows: any[]) => writeDocs(rows, coll)
  const deleteRows = async (rows: BracketItem[]) => {
    return deleteDocs(rows.map((row: BracketItem) => doc(coll, row.id)))
  }

  return {
    isReady,
    rows,
    admin,

    // admin
    writeRows,
    deleteRows
  }
}
