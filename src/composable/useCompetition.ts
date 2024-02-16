import useFirestoreAdmin from '@/composable/useFirestoreAdmin'
import { doc, collection, writeBatch } from 'firebase/firestore'
import { db, competitionsColl, teamsName, gamesName, playersName } from '@/firebase-firestore.js'
import type { Competition, CompetitionDoc, CompetitionId } from '@/types/competitions'

import { useFirestore } from '@vueuse/firebase/useFirestore'
import type { CompetitionTeam, CompetitionTeamDoc, TeamId } from '@/types/teams'
import type { Game, GameId } from '@/types/games'
import type { CompetitionPlayer, CompetitionPlayerDoc, PlayerId } from '@/types/players'

import useCompetitionsLib from '@/composable/useCompetitionsLib'
import type { Ref } from 'vue'
import { computed, ref, watch } from 'vue'

import { competitionConverter } from '@/utils/firestore-converters'

const coll = competitionsColl.withConverter(competitionConverter)

const teamsColl = (competitionId: CompetitionId) =>
  collection(coll, `/${competitionId}/${teamsName}`).withConverter(competitionConverter)
const teamPlayersColl = (competitionId: CompetitionId, teamId: TeamId) =>
  collection(coll, `/${competitionId}/${teamsName}/${teamId}/${playersName}`).withConverter(
    competitionConverter
  )
const gamesColl = (competitionId: CompetitionId) =>
  collection(coll, `/${competitionId}/${gamesName}`).withConverter(competitionConverter)

  const { writeDocs, deleteDocs } = useFirestoreAdmin()

export default function useCompetition(competitionId: CompetitionId) {

  const gamesCollRef = gamesColl(competitionId)
  const teamsCollRef = teamsColl(competitionId)
  
  const games = useFirestore(gamesColl(competitionId), undefined) as Ref<Game[] | undefined>
  const teams = useFirestore(teamsColl(competitionId), undefined) as Ref<CompetitionTeam[] | undefined>


  const playersLists = ref<{ [key: TeamId]: Ref<{ [key: TeamId]: CompetitionPlayer[] }> }>({})
  watch(
    () => teams.value,
    (value) => {
        if (value) {
            value.forEach((team: CompetitionTeam) => {
                const teamId = team.id
                if (!playersLists.value[teamId]) {
                    playersLists.value[teamId] = useFirestore(teamPlayersColl(competitionId, team.id), undefined)
                }
            })
        }
    }
  )

  const { isReady: isLibReady, get: getCompetitionRow } = useCompetitionsLib()

  const row: Ref<Competition | undefined> = computed(() => {
    if (!(
        isLibReady.value &&
        games.value &&
        teams.value && 
        Object.values(playersLists.value).every(t => Array.isArray(t))
    )) {
      return undefined
    }

    const competitionRow = getCompetitionRow(competitionId)
    return {
      ...competitionRow as Competition,
      teams: teams.value?.map((team: CompetitionTeam) => {
        return {
          ...team,
          players: playersLists.value?.[team.id]?.value
        }
      }),
      games: games?.value || []
    } as Competition
  })
  const isReady = computed(() => row.value)

  // Admin game
  const addGame = async (row: Game) => {  
    writeDocs([row], gamesCollRef)
  }
  const deleteGame = async (row: Game) => {
    const { id: gameId } = row
    const docs = []
    docs.push(doc(gamesCollRef, gameId))
    deleteDocs(docs)
  }

  // Admin team
  const addTeam = async (row: CompetitionTeam) => {
    writeDocs([row], teamsCollRef)
  }
  const deleteTeam = async (competitionId: CompetitionId, row: CompetitionTeam) => {
    const { id: teamId } = row
    const teamPlayersCollRef = teamPlayersColl(competitionId, teamId)
    const docs = []
    row.players.forEach((player: CompetitionPlayer) => {
      docs.push(doc(teamPlayersCollRef, player.id))
    })
    docs.push(doc(teamsCollRef, teamId))
    deleteDocs(docs)
  }

  const addTeamPlayer = async (
    competitionId: CompetitionId,
    teamId: TeamId,
    row: CompetitionPlayer
  ) => {
    const teamPlayersCollRef = teamPlayersColl(competitionId, teamId)
    writeDocs([row], teamPlayersCollRef)
  }
  const deleteTeamPlayer = async (
    competitionId: CompetitionId,
    teamId: TeamId,
    row: CompetitionPlayer
  ) => {
    const teamPlayersCollRef = teamPlayersColl(competitionId, teamId)
    deleteDocs([doc(teamPlayersCollRef, row.id)])
  }
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
    console.time('write.commit')
    await batch.commit()
    console.timeEnd('write.commit')
  }

  return {
    isReady,
    row,

    // Admin game
    addGame,
    deleteGame,
    // Admin team
    addTeam,
    addTeamPlayer,
    deleteTeam,
    deleteTeamPlayer,
  }
}
