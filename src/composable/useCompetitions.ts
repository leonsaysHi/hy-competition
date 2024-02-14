import useFirestoreAdmin from '@/composable/useFirestoreAdmin'
import { doc, collection, writeBatch } from 'firebase/firestore'
import type { QueryDocumentSnapshot, DocumentData, SnapshotOptions } from 'firebase/firestore'
import { db, competitionsColl, teamsName, gamesName, playersName } from '@/firebase-firestore.js'
import type { Competition, CompetitionDoc, CompetitionId } from '@/types/competitions'

import { createGlobalState } from '@vueuse/core'
import { useFirestore } from '@vueuse/firebase/useFirestore'
import type { CompetitionTeam, CompetitionTeamDoc, TeamId } from '@/types/teams'
import type { Game, GameId } from '@/types/games'
import type { CompetitionPlayer, CompetitionPlayerDoc, PlayerId } from '@/types/players'

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
const teamsColl = (competitionId: CompetitionId) =>
  collection(coll, `/${competitionId}/${teamsName}`).withConverter(converter)
const teamPlayersColl = (competitionId: CompetitionId, teamId: TeamId) =>
  collection(coll, `/${competitionId}/${teamsName}/${teamId}/${playersName}`).withConverter(
    converter
  )
const gamesColl = (competitionId: CompetitionId) =>
  collection(coll, `/${competitionId}/${gamesName}`).withConverter(converter)

export default function useCompetitions() {
  const getAdminRows = createGlobalState(() => useFirestore(coll, []))
  const getRows = createGlobalState(() => useFirestore(coll, []))

  const getRow = (competitionId: CompetitionId) => useFirestore(doc(coll, competitionId), null)
  const getRowTeams = (competitionId: CompetitionId) =>
    useFirestore(teamsColl(competitionId), undefined)
  const getRowTeamPlayers = (competitionId: CompetitionId, teamId: TeamId) =>
    useFirestore(teamPlayersColl(competitionId, teamId), undefined)
  const getRowGames = (competitionId: CompetitionId) =>
    useFirestore(gamesColl(competitionId), undefined)

  const { deleteDocs } = useFirestoreAdmin()

  const writeRow = async (competition: Competition) => {
    const {
      id,
      games,
      teams,
      ...competitionDoc
    }: {
      id: CompetitionId
      games: Game[]
      teams: CompetitionTeam[]
      competitionDoc: CompetitionDoc
    } = competition

    const batch = writeBatch(db)

    // doc
    const CompRef = id ? doc(coll, id) : doc(coll)
    batch.set(CompRef, competitionDoc)

    /*
      // games
      games.forEach((game: Game) => {
        const { id, ...gameDoc}: { id: GameId, gameDoc: GameDoc } = game
        const gameRef = id ? doc(gamesColl(CompRef.id), id) : doc(gamesColl(CompRef.id))
        batch.set(gameRef, gameDoc)
      })
      */
    // teams
    teams.forEach((team: CompetitionTeam) => {
      const {
        id,
        players,
        ...teamDoc
      }: { id: GameId; players: CompetitionPlayer[]; teamDoc: CompetitionTeamDoc } = team
      const teamRef = id ? doc(teamsColl(CompRef.id), id) : doc(teamsColl(CompRef.id))
      batch.set(teamRef, teamDoc)
      // players
      const playersColl = teamPlayersColl(CompRef.id, teamRef.id)
      players.forEach((player: CompetitionPlayer) => {
        const { id, ...playerDoc }: { id: PlayerId; playerDoc: CompetitionPlayerDoc } = player
        const playerRef = id ? doc(playersColl, id) : doc(playersColl)
        batch.set(playerRef, playerDoc)
      })
    })

    // commit all
    console.log('CompetitionDoc', CompRef.id, competitionDoc)
    console.time('write.commit')
    await batch.commit()
    console.timeEnd('write.commit')
  }

  return {
    getAdminRows,
    getRows,
    getRow,
    getRowTeams,
    getRowGames,
    getRowTeamPlayers,
    writeRow,
    deleteDocs
  }
}
