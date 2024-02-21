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

import { gameConverter, teamConverter, playerConverter } from '@/utils/firestore-converters'

const coll = competitionsColl

const { writeDocs, deleteDocs } = useFirestoreAdmin()

export default function useCompetition(competitionId: CompetitionId | undefined) {
  const { isReady: isLibsReady, getCompetition } = useLibs()

  const gamesCollRef = collection(competitionsColl, `/${competitionId}/${gamesName}`).withConverter(
    gameConverter
  )
  const teamsCollRef = collection(competitionsColl, `/${competitionId}/${teamsName}`).withConverter(
    teamConverter
  )
  const getPlayersColl = (teamId: TeamId) =>
    collection(teamsCollRef, `${teamId}/${playersName}`).withConverter(playerConverter)
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

  const isReady = computed(() => Boolean(row.value))

  // Admin game
  const writeGame = async (payload: Game) => {
    writeDocs([payload], gamesCollRef)
  }
  const deleteGame = async (payload: Game) => {
    const { id: gameId } = payload
    const docs = []
    docs.push(doc(gamesCollRef, gameId))
    deleteDocs(docs)
  }

  // Admin team
  const writeTeam = async (payload: CompetitionTeam) => {
    const {
      players,
      ...teamDoc
    }: { 
      players: CompetitionPlayer[]; 
      teamDoc: CompetitionTeamDoc 
    } = payload
    console.log('save team doc', teamDoc)
    writeDocs([teamDoc], teamsCollRef)
  }
  const deleteTeam = async (payload: CompetitionTeam) => {
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
    teamId: TeamId,
    row: CompetitionPlayer
  ) => {
    const teamPlayersCollRef = getPlayersColl(teamId)
    writeDocs([row], teamPlayersCollRef)
  }
  const deleteTeamPlayer = async (
    teamId: TeamId,
    row: CompetitionPlayer
  ) => {
    const teamPlayersCollRef = getPlayersColl(teamId)
    deleteDocs([doc(teamPlayersCollRef, row.id)])
  }
  const writeRow = async (payload: CompetitionDoc, teams: CompetitionTeam[]) => {
    const {
      id, 
      ...competitionDoc
    }: {
      id: CompetitionId | undefined,
      competitionDoc: CompetitionDoc
    } = payload
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
        players,
        ...teamDoc
      }: { 
        id: TeamId; 
        players: CompetitionPlayer[]; 
        teamDoc: CompetitionTeamDoc 
      } = team
      const teamRef = teamDoc.id ? doc(teamsCollRef, teamDoc.id) : doc(teamsCollRef)
      batch.set(teamRef, teamDoc)
      // players
      const playersColl = getPlayersColl(teamRef.id)
      players.forEach((player: CompetitionPlayerDoc) => {
        const playerRef = player.id ? doc(playersColl, player.id) : doc(playersColl)
        batch.set(playerRef, player)
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
    writeGame,
    deleteGame,

    // Admin team
    writeTeam,
    addTeamPlayer,
    deleteTeam,
    deleteTeamPlayer
  }
}
