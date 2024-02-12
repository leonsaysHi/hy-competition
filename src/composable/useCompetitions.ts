import useFirestoreAdmin from '@/composable/useFirestoreAdmin'
import {
  doc,
  collection,
  QueryDocumentSnapshot,
  type DocumentData,
  type SnapshotOptions
} from 'firebase/firestore'
import { competitionsColl, teamsName, gamesName, playersName } from '@/firebase-firestore.js'
import type { Competition, CompetitionId } from '@/types/competitions'

import { createGlobalState } from '@vueuse/core'
import { useFirestore } from '@vueuse/firebase/useFirestore'
import type { TeamId } from '@/types/teams'

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
const coll = competitionsColl.withConverter(converter)
const teamsColl = (competitionId: CompetitionId) => collection(coll, `/${competitionId}/${teamsName}`).withConverter(converter)
const teamPlayersColl = (competitionId: CompetitionId, teamId: TeamId) => collection(coll, `/${competitionId}/${teamsName}/${teamId}/${playersName}`).withConverter(converter)
const gamesColl = (competitionId: CompetitionId) => collection(coll, `/${competitionId}/${gamesName}`).withConverter(converter)

export default function useCompetitions() {
  const getAdminRows = createGlobalState(() => useFirestore(coll))
  const getRows = createGlobalState(() => useFirestore(coll))

  const getRow = (competitionId: CompetitionId) =>
    useFirestore(doc(coll, competitionId), null)
  const getRowTeams = (competitionId: CompetitionId) => useFirestore(teamsColl(competitionId))
  const getRowTeamPlayers = (competitionId: CompetitionId, teamId: TeamId) => useFirestore(teamPlayersColl(competitionId, teamId))
  const getRowGames = (competitionId: CompetitionId) => useFirestore(gamesColl(competitionId))

  const { writeDocs, deleteDocs } = useFirestoreAdmin()
  const writeRows = (rows: any[]) => writeDocs(rows, coll)
  const deleteRows = async (rows: Competition[]) => {
    return deleteDocs(rows.map((row: Competition) => doc(coll, row.id)))
  }

  return {
    getAdminRows,
    getRows,
    getRow,
    getRowTeams,
    getRowGames,
    getRowTeamPlayers,
    writeRows,
    deleteRows
  }
}
