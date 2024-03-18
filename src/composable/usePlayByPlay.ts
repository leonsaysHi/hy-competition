import { collection, doc } from 'firebase/firestore'
import { playByPlayColl } from '@/firebase-firestore'
import type { CompetitionId } from '@/types/competitions'

import { useFirestore } from '@vueuse/firebase/useFirestore'
import type { Game, GameId } from '@/types/games'
import type { Ref } from 'vue'
import { computed } from 'vue'
import {
  playByPlayStackConverter
} from '@/utils/firestore-converters'
import type { PlayByPlay, PlayStack, PlayStackDoc } from '@/play-by-play/GameInput.vue'
import useCompetition from './useCompetition'
import useFirestoreAdmin from './useFirestoreAdmin'

const { writeDocs, deleteDocs } = useFirestoreAdmin()
export default function usePlayByPlay(competitionId: CompetitionId, gameId: GameId) {
    const { isReady: isCompetitionReady, row: competition, games, teams, config } = useCompetition(competitionId)
  
  const playByPlayCollection = playByPlayColl
  // const playByPlayDoc = doc(playByPlayCollection.withConverter(playByPlayStackConverter), gameId)
  const playByPlayStackCollection = collection(playByPlayCollection, `${gameId}/stacks`).withConverter(playByPlayStackConverter)

  const playByPlay = useFirestore(playByPlayStackCollection, undefined) as Ref<PlayByPlay | undefined>
  
  const game = computed(() => games.value.find((game: Game) => game.id === gameId))
  const isReady = computed<Boolean>(() => isCompetitionReady.value && playByPlay.value !== undefined)

  const row: Ref<PlayByPlay | undefined> = computed(() => {
    const result = isReady.value ? playByPlay.value || [] : undefined
    return result
  })
  // Admin
  const writeStack = (playStack: PlayStack) => {
    const stack: PlayStackDoc = { playStack }
    writeDocs([stack], playByPlayStackCollection)
  }
  const deleteRow = () => {
    // deleteDocs
  }

  return {
    isReady,
    row,
    competition, 
    game, 
    teams, 
    config,

    // Admin
    writeStack,
    deleteRow
  }
}
