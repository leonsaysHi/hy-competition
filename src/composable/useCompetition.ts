import { collection } from 'firebase/firestore'
import { competitionsColl, teamsName, gamesName, playersName } from '@/firebase-firestore.js'
import type { Competition, CompetitionId } from '@/types/competitions'

import { useFirestore } from '@vueuse/firebase/useFirestore'
import type { CompetitionTeam, TeamId } from '@/types/teams'
import type { Game, GameDocBoxScore, GameId, GameDocScores } from '@/types/games'
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
import type {
  CompetitionPhaseComputed,
  CompetitionStandingComputed,
  CompetitionRankingComputed
} from '@/types/computed'
import useOptionsLib from './useOptionsLib'
import type { PlayerStatKey, PlayerStats } from '@/types/stats'

export default function useCompetition(competitionId: CompetitionId | undefined) {
  const { isReady: isLibsReady, getCompetition } = useLibs()
  const { playerStatsKeys } = useOptionsLib()

  const gamesCollRef = collection(competitionsColl, `/${competitionId}/${gamesName}`).withConverter(
    gameConverter
  )
  const teamsCollRef = collection(competitionsColl, `/${competitionId}/${teamsName}`).withConverter(
    competitionTeamConverter
  )
  const getPlayersColl = (teamId: TeamId) =>
    collection(teamsCollRef, `${teamId}/${playersName}`).withConverter(competitionPlayerConverter)

  // Competition
  const competitionGames = useFirestore(gamesCollRef, undefined) as Ref<Game[] | undefined>
  const competitionTeams = useFirestore(teamsCollRef, undefined) as Ref<
    CompetitionTeam[] | undefined
  >
  const playersLists = ref<{ [key: TeamId]: CompetitionPlayer[] }>({})
  watch(
    () => competitionTeams.value?.length,
    () => {
      if (Array.isArray(competitionTeams.value)) {
        competitionTeams.value.forEach((team: CompetitionTeam) => {
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
      !Array.isArray(competitionTeams.value) ||
      !Array.isArray(competitionGames.value) ||
      !competitionTeams.value.every(
        (team: CompetitionTeam) => team.id in playersLists.value && playersLists.value[team.id]
      )
    ) {
      return undefined
    }
    const competitionRow = getCompetition(competitionId)
    const getDefaultPlayerBoxScore = (): PlayerStats => {
      return {
        ...playerStatsKeys.reduce((playerStats: PlayerStats, opt) => {
          playerStats[opt.value] = 0
          return playerStats
        }, {} as PlayerStats),
        dnp: false
      }
    }
    const teams = competitionTeams.value.map((team: CompetitionTeam) => {
      return {
        ...team,
        players: playersLists.value?.[team.id] as CompetitionPlayer[]
      }
    })
    // Sanitize game datas
    const games = competitionGames.value.map((game: Game) => {
      return {
        ...game,
        scores: Array.isArray(game.teams)
          ? game.teams.reduce(
              (scores: GameDocScores, teamId: TeamId) => ({
                ...scores,
                [teamId]: game.scores[teamId] || [0]
              }),
              {}
            )
          : {},
        boxscore: game.teams.reduce((boxscore: GameDocBoxScore, teamId: TeamId) => {
          const team: CompetitionTeam =
            teams.find((t: CompetitionTeam) => t.id === teamId) || ({} as CompetitionTeam)
          const players: PlayerId[] =
            team.players?.map((player: CompetitionPlayer): PlayerId => player.id) || []
          players.forEach((playerId: PlayerId) => {
            const emptyBoxscore: PlayerStats = getDefaultPlayerBoxScore()
            const playerBoxscore = game.boxscore[playerId]
            boxscore[playerId] = {
              ...emptyBoxscore,
              ...(playerBoxscore
                ? (Object.keys(emptyBoxscore) as PlayerStatKey[]).reduce(
                    (playerStats: PlayerStats, key: PlayerStatKey) => {
                      playerStats[key] = key in playerBoxscore ? playerBoxscore[key] : 0
                      return playerStats
                    },
                    {} as PlayerStats
                  )
                : {}),
              dnp: playerBoxscore?.dnp || false
            }
          })
          return boxscore
        }, {})
      }
    })
    return {
      ...(competitionRow as Competition),
      teams,
      games
    } as Competition
  })

  const isReady = computed<Boolean>(() => Boolean(row.value))

  const games = computed<Game[]>(() => (Array.isArray(row.value?.games) ? row.value?.games : []))
  const teams = computed<CompetitionTeam[]>(() =>
    Array.isArray(row.value?.teams) ? row.value?.teams : []
  )

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

  const getCompetitionTeam = (teamId: TeamId): CompetitionTeam | undefined => {
    return row.value?.teams?.find((team: CompetitionTeam) => team.id === teamId)
  }
  const getCompetitionPlayer = (playerId: PlayerId): CompetitionPlayer | undefined => {
    const team: CompetitionTeam | undefined = row.value?.teams?.find(
      (team: CompetitionTeam) =>
        team.players.findIndex((player: CompetitionPlayer) => player.id === playerId) > -1
    )
    return team?.players.find((player: CompetitionPlayer) => player.id === playerId)
  }
  const getPlayerCompetitionTeam = (playerId: PlayerId): CompetitionTeam | undefined =>
    row.value?.teams?.find(
      (team: CompetitionTeam) =>
        team.players.findIndex((player: CompetitionPlayer) => player.id === playerId) > -1
    )
  const getPlayerNumber = (playerId: PlayerId): string | undefined => {
    const player: CompetitionPlayer = getCompetitionPlayer(playerId)
    return player?.number
  }
  const getGame = (gameId: GameId): Game | undefined => {
    return row?.value?.games?.find((game: Game) => game.id === gameId)
  }

  // Competition Computed
  const computedPhases = computed<CompetitionPhaseComputed[] | undefined>(() => {
    const competitionClass = isReady.value ? new CompetitionClass(row.value) : undefined
    return competitionClass ? competitionClass.computedPhases : undefined
  })
  const competitionRankings = computed<CompetitionRankingComputed[] | undefined>(() => {
    const competitionClass = isReady.value ? new CompetitionClass(row.value) : undefined
    return competitionClass?.competitionRankings
  })
  const competitionStandings = computed<CompetitionStandingComputed[] | undefined>(() => {
    const competitionClass = isReady.value ? new CompetitionClass(row.value) : undefined
    return competitionClass?.competitionStandings
  })

  return {
    isReady,
    row,
    games,
    teams,
    allTeams,
    allPlayers,

    getGame,
    getCompetitionTeam,
    getCompetitionPlayer,
    getPlayerCompetitionTeam,
    getPlayerNumber,

    //computed
    computedPhases,
    competitionRankings,
    competitionStandings
  }
}
