import { doc, collection, writeBatch, WriteBatch } from 'firebase/firestore'
import {
  db,
  competitionsColl,
  teamsName,
  gamesName,
  playersName,
  playerCompetitionsComputedName,
  playersColl,
  teamsColl,
  teamCompetitionsComputedName
} from '@/firebase-firestore.js'
import type { Competition, CompetitionDoc, CompetitionId } from '@/types/competitions'
import CompetitionClass from '@/models/CompetitionComputed'
import type { CompetitionTeam, CompetitionTeamDoc, TeamId } from '@/types/teams'
import type { Game, GameId } from '@/types/games'
import type { CompetitionPlayer, PlayerId } from '@/types/players'

import {
  gameConverter,
  competitionTeamConverter,
  competitionPlayerConverter,
  computedRankingConverter,
  computedStandingConverter
} from '@/utils/firestore-converters'
import type {
  CompetitionRankingComputed,
  CompetitionStandingComputed
} from '@/models/CompetitionComputed'

export default function useCompetition(competitionId: CompetitionId | undefined) {
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
  const writeTeamBatch = async (
    row: CompetitionTeam,
    batch: WriteBatch = writeBatch(db)
  ): WriteBatch => {
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
      deletePlayerBatch(id, row, batch)
    })
    batch.delete(teamRef)
    return batch
  }

  // Admin Competition Doc
  const writeCompetitionDoc = async (payload: Competition) => {
    const batch = writeCompetitionDocBatch(payload)
    const computedClass = new CompetitionClass(payload)
    writePlayersCompetitionComputed(computedClass.competitionRankings, batch)
    writeTeamsCompetitionComputed(computedClass.competitionStandings, batch)
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

  /*const writeCompetition = async (payload: Competition) => {
    const batch = writeCompetitionBatch(payload)
    const computedClass = new CompetitionClass(payload)
    console.log('hip')
    writePlayersCompetitionComputed(computedClass.competitionRankings, batch)
    writeTeamsCompetitionComputed(computedClass.competitionStandings, batch)
    await batch.commit()
  }*/
  /*const writeCompetitionBatch = (
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
  }*/

  const writePlayersCompetitionComputed = (
    rows: CompetitionRankingComputed[],
    batch: WriteBatch = writeBatch(db)
  ): WriteBatch => {
    rows.forEach((row: CompetitionRankingComputed) => {
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

  return {
    // Admin competition
    // writeCompetition,
    writeCompetitionDoc,

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
