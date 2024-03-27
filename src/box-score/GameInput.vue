<script lang="ts" setup>
import type { Game, GameDocBoxScore, GameDocScores } from '@/types/games'
import { computed, ref } from 'vue'
import useLibs from '@/composable/useLibs'
import GameScores from './components/GameScores.vue'
import GamePeriods from './components/GamePeriods.vue'
import PlaysInput, { type Play } from './components/PlaysInput.vue'
import type { TeamId } from '@/types/teams'
import type { Rosters } from '@/types/games'
import type { Competition, CompetitionConfig } from '@/types/competitions'
import type { PlayerId } from '@/types/players'
import type { PlayerStatKey } from '@/types/stats'
import useCompetitionAdmin from '@/composable/useCompetitionAdmin'

interface IProps {
  config: CompetitionConfig
  competition: Competition
  rosters: Rosters
  game: Game
}
const props = withDefaults(defineProps<IProps>(), {})

const { writeGame: updateCompetitionGameDoc } = useCompetitionAdmin(props.competition.id)
const { getTeamName } = useLibs()
const { nbPeriods, periodsLength } = props.config

const periodIdx = ref<number>(props.game?.scores && Array.isArray(props.game?.scores[0]) ? props.game?.scores[0].length - 1 : 0)

const periodItems = computed<(-1 | 0 | 1)[]>(() => {
  const scoresByPeriods = Object.keys(props.game.scores).reduce((result: number[], teamId: TeamId) => {
    props.game.scores[teamId].forEach((n: number, idx: number) => {
      result[idx] = result[idx] ? result[idx] + n : n
    })
    return result
  }, [])
  return new Array(Math.max(nbPeriods, periodIdx.value + 1))
    .fill(0)
    .map((p, idx) =>
      scoresByPeriods[idx] && scoresByPeriods[idx] > 0
        ? 1
        : idx === periodIdx.value
          ? 0
          : -1
  )
})
const getTeamIdFromPlayerId = (playerId: PlayerId): TeamId => {
  return Object.keys(props.rosters).find((teamId: TeamId) =>
  playerId in props.rosters[teamId]
  ) as TeamId
}

const handleChangePeriod = (n: 1 | -1) => {
  periodIdx.value += n
}
const handleAddPlayStack = async (plays: Play[]) => {
  const payload = {
    ...props.game,
    isFinished: false,
    isLive: true
  }
  console.log(props.game, payload)
  plays.forEach((play: Play) => {
    const { playerId, actionKey }: { playerId: PlayerId, actionKey: PlayerStatKey } = play
    const teamId: TeamId = getTeamIdFromPlayerId(playerId)
    console.log(playerId, actionKey)
    payload.boxscore[playerId][actionKey] += 1
    switch (actionKey) {
      case 'fg3m': 
        payload.scores[teamId][periodIdx.value] += 3
        break
      case 'fgm': 
        payload.scores[teamId][periodIdx.value] += 2
        break
      case 'ftm': 
        payload.scores[teamId][periodIdx.value] += 1
        break
    }
  })
  // update box score
  // update scores
  console.log(payload)
  await updateCompetitionGameDoc(payload)
  
}
</script>
<template>
  <div class="flex-grow-0 hstack justify-content-between border-bottom p-1">
    <div>
      <small>{{ competition?.title }}</small>
      <div class="jersey-team">{{ game.teams.map(getTeamName).join('&times;') }}</div>
    </div>
    <GameScores :scores="game.scores" />
  </div>
  <GamePeriods
    :period-idx="periodIdx"
    :periods-items="periodItems"
    @change-period="handleChangePeriod"
  />
  <div class="flex-grow-1 vstack gap-3 px-1 py-3">
    <PlaysInput 
      :rosters="rosters" 
      :tracked-stats="competition.trackedStats"
      @add-play-stack="handleAddPlayStack"
    />
  </div>
</template>
