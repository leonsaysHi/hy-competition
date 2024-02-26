import { doc, collection, writeBatch, WriteBatch } from 'firebase/firestore'
import { db, competitionsColl, teamsName, gamesName, playersName } from '@/firebase-firestore.js'
import type { Competition, CompetitionDoc, CompetitionId } from '@/types/competitions'

import { useFirestore } from '@vueuse/firebase/useFirestore'
import type { CompetitionTeam, CompetitionTeamDoc, TeamId } from '@/types/teams'
import type { Game, GameId } from '@/types/games'
import type { CompetitionPlayer, PlayerId } from '@/types/players'

import useLibs from '@/composable/useLibs'
import type { Ref } from 'vue'
import { computed, ref, watch } from 'vue'
import { gameConverter, teamConverter, playerConverter } from '@/utils/firestore-converters'

import CompetitionComputed from '@/models/CompetitionComputed'
import useComputed from './useCompetitionComputed'

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

  // Competition
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

  const isReady = computed(() => Boolean(row.value))

  const allTeams = computed<TeamId[]>(() => {
    const result = Array.isArray(row.value?.teams)
      ? row.value.teams.map((team: CompetitionTeam) => team.id)
      : []
    return result
  })
  const allPlayers = computed<PlayerId[]>(() => {
    const result = allTeams.value.map((teamId: TeamId) => {
      const team = getTeam(teamId)
      return Array.isArray(team?.players)
        ? team.players.map((player: CompetitionPlayer) => player.id)
        : []
    })
    return result.flat()
  })

  const getTeam = (teamId: TeamId): CompetitionTeam | undefined => {
    return row.value?.teams?.find((team: CompetitionTeam) => team.id === teamId)
  }
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

  // Competition Computed
  const { writeComputedCompetitionDoc } = useComputed(competitionId)
  const updateComputed = (row: Ref<Competition | undefined>) => {
    if (!row.value) {
      console.warn("Can't update computed!", row.value)
    }
    const competitionModel = new CompetitionComputed(row.value as Competition)
    writeComputedCompetitionDoc(competitionModel.computed)
  }

  // Admin game
  const writeGame = async (payload: Game) => {
    const batch = writeGameBatch(payload)
    await batch.commit()
  }
  const writeGameBatch = (row: Game, batch: WriteBatch = writeBatch(db)): WriteBatch => {
    const {
      id,
      ...gameDoc
    }: {
      id: GameId
      gameDoc: Game
    } = row
    const gameRef = id ? doc(gamesCollRef, id) : doc(gamesCollRef)
    batch.set(gameRef, gameDoc)
    return batch
  }
  const deleteGame = async (payload: Game) => {
    const batch = deleteGameBatch(payload)
    await batch.commit()
  }
  const deleteGameBatch = (row: Game, batch: WriteBatch = writeBatch(db)): WriteBatch => {
    const {
      id
    }: {
      id: GameId
    } = row
    const gameRef = doc(gamesCollRef, id)
    batch.delete(gameRef)
    return batch
  }

  // Admin competition player
  const writePlayer = async (teamId: TeamId, payload: CompetitionPlayer) => {
    const batch = writePlayerBatch(teamId, payload)
    await batch.commit()
  }
  const writePlayerBatch = (
    teamId: TeamId,
    row: CompetitionPlayer,
    batch: WriteBatch = writeBatch(db)
  ): WriteBatch => {
    const playerCollRef = getPlayersColl(teamId)
    const {
      id,
      ...playerDoc
    }: {
      id: PlayerId
      playerDoc: CompetitionPlayer
    } = row
    const playerRef = id ? doc(playerCollRef, id) : doc(playerCollRef)
    batch.set(playerRef, playerDoc)
    return batch
  }
  const deletePlayer = async (teamId: TeamId, payload: CompetitionPlayer) => {
    const batch = deletePlayerBatch(teamId, payload)
    await batch.commit()
  }
  const deletePlayerBatch = (
    teamId: TeamId,
    row: CompetitionPlayer,
    batch: WriteBatch = writeBatch(db)
  ): WriteBatch => {
    const playerCollRef = getPlayersColl(teamId)
    const {
      id
    }: {
      id: PlayerId
    } = row
    const playerRef = doc(playerCollRef, id)
    batch.delete(playerRef)
    return batch
  }
  // Admin competition team
  const writeTeam = async (payload: CompetitionTeam) => {
    const batch = writeTeamBatch(payload)
    await batch.commit()
  }
  const writeTeamBatch = (row: CompetitionTeam, batch: WriteBatch = writeBatch(db)): WriteBatch => {
    const {
      id,
      players,
      ...teamDoc
    }: {
      id: TeamId
      players: CompetitionPlayer[]
      teamDoc: CompetitionTeamDoc
    } = row
    const teamRef = id ? doc(teamsCollRef, id) : doc(teamsCollRef)
    batch.set(teamRef, teamDoc)
    players.forEach((row: CompetitionPlayer) => {
      writePlayerBatch(id, row, batch)
    })
    return batch
  }
  const writeTeamDoc = async (payload: CompetitionTeam) => {
    const batch = writeTeamDocBatch(payload)
    await batch.commit()
  }
  const writeTeamDocBatch = (
    row: CompetitionTeam,
    batch: WriteBatch = writeBatch(db)
  ): WriteBatch => {
    const {
      id,
      players,
      ...teamDoc
    }: {
      id: TeamId
      players: CompetitionPlayer[]
      teamDoc: CompetitionTeamDoc
    } = row
    const teamRef = id ? doc(teamsCollRef, id) : doc(teamsCollRef)
    batch.set(teamRef, teamDoc)
    return batch
  }
  const deleteTeam = async (payload: CompetitionTeam) => {
    const batch = deleteTeamBatch(payload)
    await batch.commit()
  }
  const deleteTeamBatch = (
    row: CompetitionTeam,
    batch: WriteBatch = writeBatch(db)
  ): WriteBatch => {
    const {
      id,
      players
    }: {
      id: TeamId
      players: CompetitionPlayer[]
    } = row
    const teamRef = doc(teamsCollRef, id)
    players.forEach((row: CompetitionPlayer) => {
      deletePlayerBatch(id, row, batch)
    })
    batch.delete(teamRef)
    return batch
  }

  // Admin Competition Doc
  const writeCompetitionDoc = async (payload: Competition) => {
    const batch = writeCompetitionDocBatch(payload)
    await batch.commit()
  }
  const writeCompetitionDocBatch = (
    row: Competition,
    batch: WriteBatch = writeBatch(db)
  ): WriteBatch => {
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
    } = row
    const competitionRef = id ? doc(competitionsColl, id) : doc(competitionsColl)
    batch.set(competitionRef, competitionDoc)
    return batch
  }
  const writeCompetition = async (payload: Competition) => {
    const batch = writeCompetitionBatch(payload)
    await batch.commit()
  }
  const writeCompetitionBatch = (
    row: Competition,
    batch: WriteBatch = writeBatch(db)
  ): WriteBatch => {
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
    } = row
    const competitionRef = id ? doc(competitionsColl, id) : doc(competitionsColl)
    batch.set(competitionRef, competitionDoc)
    games.forEach((row: Game) => {
      writeGameBatch(row, batch)
    })
    teams.forEach((row: CompetitionTeam) => {
      writeTeamBatch(row, batch)
    })
    return batch
  }

  return {
    isReady,
    row,
    allTeams,
    allPlayers,
    getGame,
    getTeam,
    getPlayer,
    getPlayerNumber,

    // Admin competition
    writeCompetition,
    writeCompetitionDoc,
    updateComputed,

    // Admin game
    writeGame,
    deleteGame,

    // Admin team
    writeTeam,
    writeTeamDoc,
    writePlayer,
    deleteTeam,
    deletePlayer
  }
}
