import useFirestoreAdmin from '@/composable/useFirestoreAdmin'
import { doc, collection, writeBatch } from 'firebase/firestore'
import { db, competitionsColl, teamsName, gamesName, playersName } from '@/firebase-firestore.js'
import type { Competition, CompetitionDoc, CompetitionId } from '@/types/competitions'

import { useFirestore } from '@vueuse/firebase/useFirestore'
import type { CompetitionTeam, CompetitionTeamDoc, TeamId } from '@/types/teams'
import type { Game, GameId } from '@/types/games'
import type { CompetitionPlayer, CompetitionPlayerDoc, PlayerId } from '@/types/players'

import useLibs from '@/composable/useLibs'
import type { Ref } from 'vue'
import { computed, ref, watch } from 'vue'

import { competitionConverter } from '@/utils/firestore-converters'

const coll = competitionsColl.withConverter(competitionConverter)

const { writeDocs, deleteDocs } = useFirestoreAdmin()

export default function useCompetition(competitionId: CompetitionId | undefined) {
  const { isReady: isLibsReady, getCompetition } = useLibs()

  const gamesCollRef = collection(competitionsColl, `/${competitionId}/${gamesName}`).withConverter(
    competitionConverter
  )
  const teamsCollRef = collection(competitionsColl, `/${competitionId}/${teamsName}`).withConverter(
    competitionConverter
  )
  const getPlayersColl = (teamId: TeamId) =>
    collection(teamsCollRef, `${teamId}/${playersName}`).withConverter(competitionConverter)
  const games = useFirestore(gamesCollRef, undefined) as Ref<Game[] | undefined>
  const teams = useFirestore(teamsCollRef, undefined) as Ref<CompetitionTeam[] | undefined>
  const playersLists = ref<{ [key: TeamId]: CompetitionPlayer[] }>({})

  watch(
    () => teams.value,
    (value) => {
      if (Array.isArray(value) && !Object.keys(playersLists.value).length) {
        value.forEach((team: CompetitionTeam) => {
          const teamId = team.id
          if (!playersLists.value[teamId]) {
            playersLists.value[teamId] = useFirestore(getPlayersColl(teamId), undefined)
          }
        })
      }
    }
  )

  const row: Ref<Competition | undefined> = computed(() => {
    if (
      !isLibsReady.value ||
      !Array.isArray(teams.value) ||
      !Array.isArray(games.value) ||
      !Object.values(playersLists.value).every(Boolean)
    ) {
      return undefined
    }
    const competitionRow = getCompetition(competitionId)
    return {
      ...(competitionRow as Competition),
      teams: teams.value?.map((team: CompetitionTeam) => {
        return {
          ...team,
          players: playersLists.value?.[team.id] as CompetitionPlayer[]
        }
      }),
      games: games?.value
    } as Competition
  })
  const getPlayer = (playerId: PlayerId): CompetitionPlayer | undefined => {
    const team: CompetitionTeam | undefined = row.value?.teams?.find((team: CompetitionTeam) => {
      team.players.findIndex((player: CompetitionPlayer) => player.id === playerId) > -1
    })
    return team?.players.find((player: CompetitionPlayer) => player.id === playerId)
  }
  const getPlayerNumber = (playerId: PlayerId) => getPlayer(playerId)?.number
  const getGame = (gameId: GameId) => {
    return row?.value?.games?.find((game: Game) => game.id === gameId)
  }

  const isReady = computed(() => row.value)

  // Admin game
  const addGame = async (payload: Game) => {
    writeDocs([payload], gamesCollRef)
  }
  const deleteGame = async (payload: Game) => {
    const { id: gameId } = payload
    const docs = []
    docs.push(doc(gamesCollRef, gameId))
    deleteDocs(docs)
  }

  // Admin team
  const addTeam = async (payload: CompetitionTeam) => {
    writeDocs([payload], teamsCollRef)
  }
  const deleteTeam = async (competitionId: CompetitionId, payload: CompetitionTeam) => {
    const { id: teamId } = payload
    const teamPlayersCollRef = getPlayersColl(teamId)
    const docs = []
    payload.players.forEach((player: CompetitionPlayer) => {
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
    const teamPlayersCollRef = getPlayersColl(teamId)
    writeDocs([row], teamPlayersCollRef)
  }
  const deleteTeamPlayer = async (
    competitionId: CompetitionId,
    teamId: TeamId,
    row: CompetitionPlayer
  ) => {
    const teamPlayersCollRef = getPlayersColl(teamId)
    deleteDocs([doc(teamPlayersCollRef, row.id)])
  }
  const writeRow = async (competition: Competition) => {
    const {
      id = undefined,
      // games,
      teams = [],
      ...competitionDoc
    }: {
      id: CompetitionId
      // games: Game[]
      teams: CompetitionTeam[]
      competitionDoc: CompetitionDoc
    } = competition

    const batch = writeBatch(db)

    // doc
    const compRef = id ? doc(coll, id) : doc(coll)
    batch.set(compRef, competitionDoc)

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
      const teamRef = id ? doc(teamsCollRef, id) : doc(teamsCollRef)
      batch.set(teamRef, teamDoc)
      // players
      const playersColl = getPlayersColl(teamRef.id)
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
    getGame,
    getPlayer,
    getPlayerNumber,

    // Admin competition
    writeRow,

    // Admin game
    addGame,
    deleteGame,

    // Admin team
    addTeam,
    addTeamPlayer,
    deleteTeam,
    deleteTeamPlayer
  }
}
