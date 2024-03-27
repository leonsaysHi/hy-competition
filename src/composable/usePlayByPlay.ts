import { collection } from 'firebase/firestore'
import { playByPlayColl } from '@/firebase-firestore'
import type { CompetitionId } from '@/types/competitions'

import { useFirestore } from '@vueuse/firebase/useFirestore'
import type { Game, GameId } from '@/types/games'
import type { Ref } from 'vue'
import { computed } from 'vue'
import { playByPlayStackConverter } from '@/utils/firestore-converters'
import type {
  PlayStack,
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
    rosters,
    config
  } = useCompetition(competitionId)

  const playByPlayCollection = playByPlayColl.withConverter(playByPlayStackConverter)
  //const playByPlayDoc = doc(playByPlayCollection, gameId)
  
  const playByPlayStacksCollection = collection(
    playByPlayCollection,
    `${gameId}/play-stacks`
  ).withConverter(playByPlayStackConverter)
  
  const playByPlay = useFirestore(playByPlayStacksCollection, undefined) as Ref<PlayStack[] | undefined>

  const game = computed(() => games.value.find((game: Game) => game.id === gameId))
  const isReady = computed<Boolean>(
    () => isCompetitionReady.value && playByPlay.value !== undefined
  )

  const row: Ref<PlayStack[] | undefined> = computed(() => {
    const result = isReady.value ? playByPlay.value || [] : undefined
    result?.sort((a, b) => a.time - b.time)
    return result
  })

  const model: Ref<PlayByPlayModel | undefined> = computed(() => {
    return isReady.value && Array.isArray(playByPlay.value) && game.value?.id
      ? new PlayByPlayModel(game.value?.id, config.value, row.value, rosters.value)
      : undefined
  })
  // Admin
  const writePlayStack = (playStack: PlayStack) => {
    writeDocs([playStack], playByPlayStacksCollection)
  }
  const deletePlayStack = () => {
    // deleteDocs
    // deleteDocs([playStack])
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
    writePlayStack,
    deletePlayStack
  }
}
