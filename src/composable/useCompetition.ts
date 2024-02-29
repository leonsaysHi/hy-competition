import { collection } from 'firebase/firestore'
import { competitionsColl, teamsName, gamesName, playersName } from '@/firebase-firestore.js'
import type { Competition, CompetitionId } from '@/types/competitions'

import { useFirestore } from '@vueuse/firebase/useFirestore'
import type { CompetitionTeam, TeamId } from '@/types/teams'
import type { Game, GameId } from '@/types/games'
import type { CompetitionPlayer, PlayerId } from '@/types/players'

import useLibs from '@/composable/useLibs'
import type { Ref } from 'vue'
import { computed, ref, watch } from 'vue'
import {
  gameConverter,
  competitionTeamConverter,
  competitionPlayerConverter
} from '@/utils/firestore-converters'
import CompetitionClass from '@/models/CompetitionComputed'
import type CompetitionComputed from '@/models/CompetitionComputed'

export default function useCompetition(competitionId: CompetitionId | undefined) {
  const { isReady: isLibsReady, getCompetition } = useLibs()

  const gamesCollRef = collection(competitionsColl, `/${competitionId}/${gamesName}`).withConverter(
    gameConverter
  )
  const teamsCollRef = collection(competitionsColl, `/${competitionId}/${teamsName}`).withConverter(
    competitionTeamConverter
  )
  const getPlayersColl = (teamId: TeamId) =>
    collection(teamsCollRef, `${teamId}/${playersName}`).withConverter(competitionPlayerConverter)

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
      const team = getCompetitionTeam(teamId)
      return Array.isArray(team?.players)
        ? team.players.map((player: CompetitionPlayer) => player.id)
        : []
    })
    return result.flat()
  })

  const getCompetitionTeam = (teamId: TeamId): CompetitionTeam => {
    return row.value?.teams?.find((team: CompetitionTeam) => team.id === teamId) as CompetitionTeam
  }
  const getCompetitionPlayer = (playerId: PlayerId): CompetitionPlayer => {
    const team: CompetitionTeam | undefined = row.value?.teams?.find(
      (team: CompetitionTeam) =>
        team.players.findIndex((player: CompetitionPlayer) => player.id === playerId) > -1
    )
    return team?.players.find(
      (player: CompetitionPlayer) => player.id === playerId
    ) as CompetitionPlayer
  }
  const getPlayerCompetitionTeam = (playerId: PlayerId): CompetitionTeam =>
    row.value?.teams?.find(
      (team: CompetitionTeam) =>
        team.players.findIndex((player: CompetitionPlayer) => player.id === playerId) > -1
    ) as CompetitionTeam
  const getPlayerNumber = (playerId: PlayerId): string => getCompetitionPlayer(playerId).number
  const getGame = (gameId: GameId): Game => {
    return row?.value?.games?.find((game: Game) => game.id === gameId) as Game
  }

  // Competition Computed
  const competitionClass = computed<CompetitionClass | undefined>(() => {
    if (!isReady.value || !row.value) {
      return undefined
    }
    return new CompetitionClass(row.value)
  })
  const computedRow = computed<CompetitionComputed | undefined>(
    (): CompetitionComputed | undefined => {
      if (!isReady.value || !row.value) {
        return undefined
      }
      const competitionClass: CompetitionClass = new CompetitionClass(row.value)
      return competitionClass.computed as CompetitionComputed
    }
  )

  return {
    isReady,
    row,
    games,
    teams,
    competitionClass,
    computedRow,
    allTeams,
    allPlayers,
    getGame,
    getCompetitionTeam,
    getCompetitionPlayer,
    getPlayerCompetitionTeam,
    getPlayerNumber
  }
}
