import { collection, doc } from 'firebase/firestore'
import { playByPlayColl } from '@/firebase-firestore'
import type { CompetitionId } from '@/types/competitions'

import { useFirestore } from '@vueuse/firebase/useFirestore'
import type { Game, GameId } from '@/types/games'
import type { Ref } from 'vue'
import { computed } from 'vue'
import { playByPlayStackConverter } from '@/utils/firestore-converters'
import type {
  PlayByPlay,
  PlayByPlayDoc,
  PlayStack,
  PlayStackDoc,
  Roster,
  RosterPlayer,
  Rosters
} from '@/play-by-play/GameInput.vue'
import useCompetition from './useCompetition'
import useFirestoreAdmin from './useFirestoreAdmin'
import PlayByPlayModel from '@/models/PlayByPlay'
import type { CompetitionTeam, TeamId } from '@/types/teams'
import type { CompetitionPlayer, PlayerId } from '@/types/players'
import useLibs from './useLibs'

const { writeDocs, deleteDocs } = useFirestoreAdmin()
const { getPlayer } = useLibs()
export default function usePlayByPlay(competitionId: CompetitionId, gameId: GameId) {
  const {
    isReady: isCompetitionReady,
    row: competition,
    games,
    teams,
    config
  } = useCompetition(competitionId)

  const playByPlayCollection = playByPlayColl.withConverter(playByPlayStackConverter)
  const playByPlayDoc = doc(playByPlayCollection, gameId)
  /*
  const playByPlayStackCollection = collection(
    playByPlayCollection,
    `${gameId}/stacks`
  ).withConverter(playByPlayStackConverter)
  */

  const playByPlay = useFirestore(playByPlayDoc, undefined) as Ref<
    PlayByPlay | undefined
  >

  const game = computed(() => games.value.find((game: Game) => game.id === gameId))
  const isReady = computed<Boolean>(
    () => isCompetitionReady.value && playByPlay.value !== undefined
  )

  const row: Ref<PlayByPlay | undefined> = computed(() => {
    const result = isReady.value ? playByPlay.value || [] : undefined
    return result
  })

  const rosters = computed<Rosters | undefined>(() => {
    return game.value?.teams && teams.value
      ? game.value?.teams
          .map(
            (teamId: TeamId): CompetitionTeam =>
              teams.value.find((t: CompetitionTeam) => t.id === teamId) as CompetitionTeam
          )
          .reduce((rosters: Rosters, team: CompetitionTeam) => {
            const teamId = team.id
            const { players } = teams.value.find(
              (t: CompetitionTeam) => teamId === t.id
            ) as CompetitionTeam
            rosters[teamId] = players.reduce((result: Roster, player: CompetitionPlayer) => {
              const playerId: PlayerId = player.id
              result[playerId] = {
                ...player,
                ...getPlayer(playerId)
              } as RosterPlayer
              return result
            }, {})
            return rosters
          }, {})
      : undefined
  })

  const model: Ref<PlayByPlayModel | undefined> = computed(() => {
    return isReady.value && Array.isArray(playByPlay.value) && game.value?.id
      ? new PlayByPlayModel(game.value?.id, config.value, row.value, rosters.value)
      : undefined
  })
  // Admin
  const writePlayStacks = (playByPlay: PlayByPlay) => {
    const doc: PlayByPlayDoc = { id: gameId, playStacks: playByPlay }
    writeDocs([doc], playByPlayCollection)
  }
  const deleteRow = () => {
    // deleteDocs
  }

  return {
    isReady,
    row,
    model,
    competition,
    game,
    rosters,
    teams,
    config,

    // Admin
    writePlayStacks,
    deleteRow
  }
}
