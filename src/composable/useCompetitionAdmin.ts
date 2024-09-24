import { doc, collection, writeBatch, WriteBatch } from 'firebase/firestore'
import {
  db,
  competitionsName,
  teamsName,
  gamesName,
  playersName,
  playerCompetitionsComputedName,
  competitionsColl,
  playersColl,
  teamsColl,
  teamCompetitionsComputedName
} from '@/firebase-firestore.js'
import { dateToTimeStamp } from '@/utils/dates'
import {
  gameConverter,
  competitionTeamConverter,
  competitionPlayerConverter,
  computedRankingConverter,
  computedStandingConverter
} from '@/utils/firestore-converters'

import type { Competition, CompetitionDoc, CompetitionId } from '@/types/competitions'
import type { CompetitionTeam, CompetitionTeamDoc, TeamId } from '@/types/team'
import type { Game, GameId } from '@/types/games'
import type { CompetitionPlayer, PlayerId } from '@/types/player'
import type { CompetitionPlayerComputed, CompetitionPlayerStats, CompetitionStanding, CompetitionStandingComputed } from '@/types/computed'
import useStats from './useStats'
import useCompetition from './useCompetition'

export default function useCompetitionAdmin(competitionId: CompetitionId | undefined) {
  const gamesCollRef = collection(competitionsColl, `/${competitionId}/${gamesName}`).withConverter(
    gameConverter
  )
  const teamsCollRef = collection(competitionsColl, `/${competitionId}/${teamsName}`).withConverter(
    competitionTeamConverter
  )
  const getPlayersColl = (teamId: TeamId) =>
    collection(teamsCollRef, `${teamId}/${playersName}`).withConverter(competitionPlayerConverter)

  // Admin game
  const writeGame = async (payload: Game) => {
    const batch = writeGameBatch(payload)
    updateCompetitionLastUpdate(batch)
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
  const removePlayer = async (teamId: TeamId, payload: CompetitionPlayer) => {
    const batch = removePlayerBatch(teamId, payload)
    await batch.commit()
  }
  const removePlayerBatch = (
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
    deletePlayerCompetitionComputed(id, competitionId, batch)
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
      ...competitionTeamDoc
    }: {
      id: TeamId
      players: CompetitionPlayer[]
      competitionTeamDoc: CompetitionTeamDoc
    } = row
    const teamRef = id ? doc(teamsCollRef, id) : doc(teamsCollRef)
    batch.set(teamRef, competitionTeamDoc)
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
      removePlayerBatch(id, row, batch)
    })
    batch.delete(teamRef)
    return batch
  }

  // Admin Competition Doc
  const updateCompetitionLastUpdate = async (batch: WriteBatch = writeBatch(db)) => {
    const docRef = doc(db, `${competitionsName}/${competitionId}`)
    batch.set(docRef, { lastUpdate: dateToTimeStamp(new Date()) }, { merge: true })
    return batch
  }

  const writeCompetitionDoc = async (payload: Competition) => {
    const batch = writeCompetitionDocBatch(payload)
    updateCompetitionLastUpdate(batch)
    await batch.commit()
  }

  const deleteCompetitionDoc = async (payload: Competition) => {
    // remove computed
    await updateCompetitionComputeds({ 
      ...payload, 
      isActive: false 
    })
    const batch = deleteCompetitionDocBatch(payload)
    await batch.commit()
  }
  const deleteCompetitionDocBatch = (
    row: Competition,
    batch: WriteBatch = writeBatch(db)
  ): WriteBatch => {
    const { 
      id,
      games,
      teams,
      ...competitionDoc
    }: {
      id: CompetitionId,
      games: Game[]
      teams: CompetitionTeam[]
      competitionDoc: CompetitionDoc
    } = row
    // delete teams:
    teams.forEach((team: CompetitionTeam) => {
      deleteTeamBatch(team, batch)
    })
    // delete games
    games.forEach((game: Game) => {
      deleteGameBatch(game, batch)
    })
    // delete competition
    const competitionRef = id ? doc(competitionsColl, id) : doc(competitionsColl)
    batch.delete(competitionRef)
    return batch
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

 

  const updateCompetitionComputeds = async (payload: Competition) => {
    const batch: WriteBatch = writeBatch(db)
    if (payload.isActive) {
      
      const { getPlayersStatsForGames, getStandingsForGames } = useStats()
      const { teams, filterGames } = useCompetition(payload.id)
      const competitionGames = filterGames({
        isFinished: true,
        isLive: false,
      })
      const competitionPlayerStatsToSave: CompetitionPlayerComputed[] = getPlayersStatsForGames(
        teams.value, 
        competitionGames
      )
        .map((row: CompetitionPlayerStats) => ({
          id: payload.id,
          ...row
        }))
      const competitionStandingsToSave: CompetitionStandingComputed[] = getStandingsForGames(
        teams.value, 
        competitionGames
      )
        .map((row: CompetitionStanding) => ({
          id: payload.id,
          ...row
        }))

      writePlayersCompetitionComputed(competitionPlayerStatsToSave, batch)
      writeTeamsCompetitionComputed(competitionStandingsToSave, batch)
    } else {
      const { id: competitionId } = payload
      payload.teams.forEach((team: CompetitionTeam) => {
        team.players.forEach((player: CompetitionPlayer) => {
          deletePlayerCompetitionComputed(player.id, competitionId, batch)
        })
        deleteTeamCompetitionComputed(team.id, competitionId, batch)
      })
    }
    await batch.commit()
    return
  }

  const writePlayersCompetitionComputed = (
    rows: CompetitionPlayerComputed[],
    batch: WriteBatch = writeBatch(db)
  ): WriteBatch => {
    rows.forEach((row: CompetitionPlayerComputed) => {
      const { playerId, id } = row
      const computedCollection = collection(
        doc(playersColl, playerId),
        playerCompetitionsComputedName
      ).withConverter(computedRankingConverter)
      const computedRef = doc(computedCollection, id)
      batch.set(computedRef, row)
    })
    return batch
  }
  const deletePlayerCompetitionComputed = (
    playerId: PlayerId,
    competitionId: CompetitionId,
    batch: WriteBatch = writeBatch(db)
  ) => {
    const computedRef = doc(
      collection(doc(playersColl, playerId), playerCompetitionsComputedName),
      competitionId
    )
    batch.delete(computedRef)
    return batch
  }
  const writeTeamsCompetitionComputed = (
    rows: CompetitionStandingComputed[],
    batch: WriteBatch = writeBatch(db)
  ): WriteBatch => {
    rows.forEach((row: CompetitionStandingComputed) => {
      const { teamId, id } = row
      const computedCollection = collection(
        doc(teamsColl, teamId),
        teamCompetitionsComputedName
      ).withConverter(computedStandingConverter)
      const computedRef = doc(computedCollection, id)
      batch.set(computedRef, row)
    })
    return batch
  }
  const deleteTeamCompetitionComputed = (
    teamId: TeamId,
    competitionId: CompetitionId,
    batch: WriteBatch = writeBatch(db)
  ) => {
    const computedRef = doc(
      collection(doc(teamsColl, teamId), teamCompetitionsComputedName),
      competitionId
    )
    batch.delete(computedRef)
    return batch
  }

  return {
    // Admin competition
    // writeCompetition,
    writeCompetitionDoc,
    deleteCompetitionDoc,
    updateCompetitionLastUpdate,
    updateCompetitionComputeds,

    // Admin game
    writeGame,
    deleteGame,

    // Admin team
    writeTeam,
    writeTeamDoc,
    writePlayer,
    deleteTeam,
    removePlayer
  }
}
