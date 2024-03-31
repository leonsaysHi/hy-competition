<script lang="ts" setup>
import type { Game } from '@/types/games'
import { computed, ref } from 'vue'
import useLibs from '@/composable/useLibs'
import GamePeriods from './components/GamePeriods.vue'
import PlaysDisplay from './components/PlaysDisplay.vue'
import PlaysInput from './components/PlaysInput.vue'
import type { Play } from '@/types/box-score-recoder'
import type { TeamId } from '@/types/teams'
import type { Rosters } from '@/types/games'
import type { Competition, CompetitionConfig } from '@/types/competitions'
import type { PlayerId } from '@/types/players'
import type { PlayerStatKey } from '@/types/stats'
import useCompetitionAdmin from '@/composable/useCompetitionAdmin'
import { add } from '@/utils/maths'
import ButtonComp from '@/components/ButtonComp.vue'
import router from '@/router'

interface IProps {
  config: CompetitionConfig
  competition: Competition
  rosters: Rosters
  game: Game
}
const props = withDefaults(defineProps<IProps>(), {})

const { writeGame: updateCompetitionGameDoc } = useCompetitionAdmin(props.competition.id)
const { getTeamName } = useLibs()
const { nbPeriods } = props.config

const body = ref<'play' | 'edit'>('play')
const history = ref<Play[][]>([])
const isBusy = ref<boolean>(false)
const periodIdx = ref<number>(
  props.game?.scores && Array.isArray(Object.values(props.game?.scores)[0])
    ? Object.values(props.game?.scores)[0].length - 1
    : 0
)

const isGameTied = computed(() => {
  const scores = Object.keys(props.game.scores).map((teamId: TeamId) =>
    props.game.scores[teamId].reduce(add, 0)
  )
  return scores[0] === scores[1]
})
const getTeamIdFromPlayerId = (playerId: PlayerId): TeamId => {
  return Object.keys(props.rosters).find(
    (teamId: TeamId) => playerId in props.rosters[teamId]
  ) as TeamId
}

const handleChangePeriod = async (idx: number) => {
  periodIdx.value = idx
  if (
    Object.values(props.game.scores).some(
      (periods: number[]) => periodIdx.value > periods.length - 1
    )
  ) {
    const payload = {
      ...props.game,
      isFinished: false,
      isLive: true
    }
    Object.keys(payload.scores).forEach((teamId: TeamId) => {
      payload.scores[teamId].push(0)
    })
    isBusy.value = true
    await updateCompetitionGameDoc(payload)
    isBusy.value = false
  }
}
const handleAddPlayStack = async (plays: Play[]) => {
  const payload = {
    ...props.game,
    isFinished: false,
    isLive: true
  }
  plays.forEach((play: Play) => {
    const { playerId, playKey }: { playerId: PlayerId; playKey: PlayerStatKey } = play
    const teamId: TeamId = getTeamIdFromPlayerId(playerId)
    payload.boxscore[playerId][playKey] += 1
    switch (playKey) {
      case 'fg3m':
        payload.scores[teamId][periodIdx.value] += 3
        play.periodIdx = periodIdx.value
        break
      case 'fgm':
        payload.scores[teamId][periodIdx.value] += 2
        play.periodIdx = periodIdx.value
        break
      case 'ftm':
        payload.scores[teamId][periodIdx.value] += 1
        play.periodIdx = periodIdx.value
        break
    }
  })
  isBusy.value = true
  await updateCompetitionGameDoc(payload)
  isBusy.value = false
  history.value.push(plays)
}
const handleRevertPlayStack = async (pIdx: number, idx: number) => {
  const payload = {
    ...props.game
  }
  const play = history.value[pIdx][idx]
  const { playerId, playKey }: { playerId: PlayerId; playKey: PlayerStatKey } = play
  const teamId: TeamId = getTeamIdFromPlayerId(playerId)
  payload.boxscore[playerId][playKey] -= 1
  switch (playKey) {
    case 'fg3m':
      payload.scores[teamId][play.periodIdx] -= 3
      break
    case 'fgm':
      payload.scores[teamId][play.periodIdx] -= 2
      break
    case 'ftm':
      payload.scores[teamId][play.periodIdx] -= 1
      break
  }
  isBusy.value = true
  await updateCompetitionGameDoc(payload)
  isBusy.value = false
  history.value[pIdx].splice(idx, 1)
  if (!history.value[pIdx].length) {
    history.value.splice(pIdx, 1)
  }
}
const handleStopRecording = async () => {
  const payload = {
    ...props.game,
    isFinished: true,
    isLive: false
  }
  isBusy.value = true
  await updateCompetitionGameDoc(payload)
  router.push({
    name: 'admin-competition-edit-game',
    params: { competitionId: props.competition.id, gameId: props.game.id }
  })
}
</script>
<template>
  <div class="flex-grow-0 hstack justify-content-between border-bottom p-1">
    <div>
      <small>{{ competition?.title }}</small>
      <div class="jersey-team">{{ game.teams.map(getTeamName).join('&times;') }}</div>
    </div>
    <ButtonComp variant="danger" size="sm" :is-busy="isBusy" @click="handleStopRecording"
      >Stop</ButtonComp
    >
  </div>
  <GamePeriods
    :period-idx="periodIdx"
    :scores="game.scores"
    :nb-periods="nbPeriods"
    :is-ot-enabled="isGameTied"
    @change-period="handleChangePeriod"
  />
  <div class="main vstack flex-grow-1" :class="`-${body}`">
    <div class="border-bottom flex-grow-0">
      <ButtonComp
        variant="light"
        :is-busy="isBusy"
        class="w-100 justify-content-center"
        @click="body = 'play'"
        ><i class="bi bi-record-circle"></i
      ></ButtonComp>
    </div>
    <div class="body flex-grow-1">
      <div class="play">
        <div class="vstack gap-3 px-1 py-3">
          <PlaysInput
            :rosters="rosters"
            :tracked-stats="competition.trackedStats"
            @add-play-stack="handleAddPlayStack"
          />
        </div>
      </div>
      <div class="edit">
        <div class="vstack gap-3 px-1 py-3">
          <PlaysDisplay
            :rosters="rosters"
            :history="history"
            :is-busy="isBusy"
            @revert-play-stack="handleRevertPlayStack"
          />
        </div>
      </div>
    </div>
    <div class="border-top flex-grow-0">
      <ButtonComp
        variant="light"
        :is-busy="isBusy"
        class="w-100 justify-content-center"
        @click="body = 'edit'"
        ><i class="bi bi-eraser-fill"></i
      ></ButtonComp>
    </div>
  </div>
</template>

<style scoped lang="scss">
.main {
  > div:first-child,
  > div:last-child {
    display: none;
  }
  > .body {
    position: relative;
    overflow-y: hidden;
    > .play,
    > .edit {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 100%;
      transition: top 0.3s;
      overflow-y: auto;
    }
  }
  &.-play {
    > div:last-child {
      display: block;
    }
    > .body {
      .edit {
        top: 100%;
        overflow-y: hidden;
        pointer-events: none;
        z-index: -1;
      }
    }
  }
  &.-edit {
    > div:first-child {
      display: block;
    }
    > .body {
      .play {
        top: -100%;
        overflow-y: hidden;
        pointer-events: none;
        z-index: -1;
      }
    }
  }
}
</style>
