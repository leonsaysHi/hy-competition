import { collection } from 'firebase/firestore'
import { competitionsColl, teamsName, gamesName, playersName } from '@/firebase-firestore.js'
import type { Competition, CompetitionConfig, CompetitionId, Phase } from '@/types/competitions'

import { useFirestore } from '@vueuse/firebase/useFirestore'
import type { CompetitionTeam, TeamId } from '@/types/team'
import type { Game, GameDocBoxScore, GameDocScores } from '@/types/games'
import type { CompetitionPlayer, PlayerId } from '@/types/player'

import useLibs from '@/composable/useLibs'
import type { Ref } from 'vue'
import { computed, ref, watch } from 'vue'
import {
  gameConverter,
  competitionTeamConverter,
  competitionPlayerConverter
} from '@/utils/firestore-converters'
import type { Option } from '@/types/comp-fields'
import type { PlayerStatLineKey, PlayerStatLine, PlayerCalculatedStatsKey, StatKeyDef } from '@/types/player-stats'
import { compareAsc, isAfter } from 'date-fns'
import i18n from '@/i18n'
import GameComputedClass from '@/models/GameComputed'
import { statKeysDefs, playerStatsTableKeys, playerStatsKeys } from '@/utils/stats/basketball'
const t = (path: string): string => i18n.global.t(path)

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
    const getDefaultPlayerCalculatedStats = (): PlayerStatLine => {
      return {
        ...playerStatsKeys.reduce((result: PlayerStatLine, key:PlayerStatLineKey) => {
          result[key] = 0
          return result
        }, {} as PlayerStatLine)
      }
    }
    const teams = competitionTeams.value.map((team: CompetitionTeam) => {
      return {
        ...team,
        players: (Array.isArray(playersLists.value?.[team.id])
          ? playersLists.value?.[team.id]
          : []) as CompetitionPlayer[]
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
            const emptyBoxscore: PlayerStatLine = getDefaultPlayerCalculatedStats()
            const playerBoxscore = game.boxscore[playerId]
            boxscore[playerId] = {
              ...emptyBoxscore,
              ...(playerBoxscore
                ? (Object.keys(emptyBoxscore) as PlayerStatLineKey[]).reduce(
                    (playerStats: PlayerStatLine, key: PlayerStatLineKey) => {
                      playerStats[key] = key in playerBoxscore ? playerBoxscore[key] : 0
                      return playerStats
                    },
                    {} as PlayerStatLine
                  )
                : {}),
              dnp: playerBoxscore?.dnp === 1 ? 1 : 0
            }
          })
          return boxscore
        }, {})
      }
    })
    games.sort((a:Game, b:Game) =>  {
      return compareAsc(a.datetime, b.datetime)
    })
    return {
      ...(competitionRow as Competition),
      teams,
      games
    } as Competition
  })

  const isReady = computed<Boolean>(() => Boolean(row.value))
  const showAvgUi = computed<boolean>(() => Boolean(row.value?.trackedStats.includes('dnp')))
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

  const config = computed<CompetitionConfig | undefined>(() =>
    row.value?.sport === 'basketball5x5'
      ? {
          gameLength: 1000 * 60 * 10 * 4,
          nbPeriods: 4,
          otLength: 1000 * 60 * 5,
          lineupLength: 5
        }
      : undefined
  )

  const getCompetitionTeam = (teamId: TeamId): CompetitionTeam | undefined => {
    return Array.isArray(row.value?.teams) 
      ? row.value.teams.find((team: CompetitionTeam) => team.id === teamId)
      : undefined
  }
  const getCompetitionPlayer = (playerId: PlayerId): CompetitionPlayer | undefined => {
    const team: CompetitionTeam | undefined = Array.isArray(row.value?.teams) 
      ? row.value.teams.find((team: CompetitionTeam) =>
        team.players.findIndex((player: CompetitionPlayer) => player.id === playerId) > -1
      )
      : undefined
    return team?.players.find((player: CompetitionPlayer) => player.id === playerId)
  }
  const getPlayerCompetitionTeam = (playerId: PlayerId): CompetitionTeam | undefined =>
    row.value?.teams?.find(
      (team: CompetitionTeam) =>
        team.players.findIndex((player: CompetitionPlayer) => player.id === playerId) > -1
    )

  const filterGames = (
    {
      isFinished = undefined,
      isLive = undefined,
      phaseIdx = undefined,
      groupIdx = undefined,
      teamId = undefined,
      playerId = undefined,
    }: {
    isFinished?: boolean
    isLive?: boolean
    phaseIdx?: number
    groupIdx?: number
    teamId?: TeamId
    playerId?: PlayerId
  }): GameComputedClass[] => {
    const phase = Array.isArray(row.value?.phases) && phaseIdx !== undefined 
      ? row.value?.phases[phaseIdx] 
      : undefined
    const group = phase !== undefined && groupIdx !== undefined
      ? phase.groups?.[groupIdx]
      : undefined
    teamId = playerId && Array.isArray(row.value?.teams) 
      ? row.value?.teams.find((team: CompetitionTeam) => {
          return team.players.findIndex((player: CompetitionPlayer) => player.id === playerId) > -1
        })?.id
      : teamId
    // filter
    const result = Array.isArray(row.value?.games)
      ? row.value.games
        .filter((game: Game) => {
          // isFinished | isLive
          const matchIsFinished = isFinished === undefined || (!isFinished && !game.isFinished) || game.isFinished === isFinished
          const matchIsLive = isLive === undefined || (!isLive && !game.isLive) || game.isLive === isLive
          // Phase
          const nextPhaseIdx = Number(phaseIdx) + 1 
          const nextPhase = phaseIdx !== undefined && Array.isArray(row.value?.phases)
            ? row.value?.phases?.[nextPhaseIdx] 
            : undefined
          const dateStart = phase?.datetime
          const dateEnd = nextPhase?.datetime
          const matchPhaseDates = !dateStart || isAfter(game.datetime, dateStart) && 
            ( !dateEnd || isAfter(dateEnd, game.datetime))
          const matchPhase = !phase || matchPhaseDates
          // Group
          const matchGroup = !phase || !group || game.teams.every((teamId: TeamId) => group.teams.includes(teamId))
          // Team
          const matchTeam = !teamId || game.teams.includes(teamId)
          //
          return matchIsFinished && 
            matchIsLive && 
            matchPhase && 
            matchGroup && 
            matchTeam
        })
        .sort((a: Game, b: Game) => compareAsc(b.datetime, a.datetime))
      : []
    return result
      .map((game: Game) => new GameComputedClass(row.value?.id as CompetitionId, game))
  }

  // Competition Computed
  const computedPhases = computed<Phase[] | undefined>(() => {
    return isReady.value && Array.isArray(row.value?.phases) ? row.value.phases : undefined
  })

  // stats sheet input:
  const trackedPlayerStatsKey = computed<Option[]>(() => {
    return playerStatsKeys
      .filter((key: PlayerStatLineKey) => row.value?.trackedStats.includes(key))
      .map((key: PlayerStatLineKey) => ({
        text: t(`options.playerStats.text.${key}`),
        long: t(`options.playerStats.long.${key}`),
        value: key
      }))
  })

  // stats sheet output:
  const competitionPlayerStatsTableKeys = computed<Option[]>(() => {
    const result = playerStatsTableKeys
      .filter((key: PlayerCalculatedStatsKey) => {
        const def = statKeysDefs.find((def: StatKeyDef) => def.key === key) as StatKeyDef
        if (!def || (!def.group && !def.calculated) || !row.value?.trackedStats) {
          return true
        } else {
          if (def.group) {
            return row.value?.trackedStats.includes(key)
          } else if (def.calculated) {
            return def.calculated.every((_key) => row.value?.trackedStats.includes(_key))
          }
        }
      })
    if (!result.includes('oreb')) {
      const drebIdx = result.findIndex((key: PlayerCalculatedStatsKey) => key === 'dreb')
      result.splice(drebIdx, 1)
    }
    return result
      .map((key: PlayerCalculatedStatsKey) => ({
        text: t(`options.playerStats.text.${key}`),
        long: t(`options.playerStats.long.${key}`),
        value: key
      }))
  })

    
  return {
    isReady,
    row,
    games,
    teams,
    config,
    allTeams,
    allPlayers,
    showAvgUi,

    // stats
    trackedPlayerStatsKey,
    competitionPlayerStatsTableKeys,

    filterGames,
    getCompetitionTeam,
    getCompetitionPlayer,
    getPlayerCompetitionTeam,

    //computed
    computedPhases,
  }
}
