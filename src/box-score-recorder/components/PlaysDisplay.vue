<script lang="ts" setup>
import ButtonComp from '@/components/ButtonComp.vue'
import TeamLogo from '@/components/teams/TeamLogo.vue'
import type { PlayerId } from '@/types/players'
import type { TeamId } from '@/types/teams'
import type { Rosters } from '@/types/games'
import type { Play } from '@/types/box-score-recoder'
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'
const { t } = useI18n()

interface IProps {
  rosters: Rosters
  history: Play[][]
  isBusy?: boolean
}

const props = withDefaults(defineProps<IProps>(), {
  isBusy: false
})

const emit = defineEmits(['revert-play-stack'])

const handleRevert = (pIdx: number, idx: number) => emit('revert-play-stack', pIdx, idx)

const getTeamIdFromPlayerId = (playerId: PlayerId): TeamId => {
  return Object.keys(props.rosters).find(
    (teamId: TeamId) => playerId in props.rosters[teamId]
  ) as TeamId
}

const items = computed(() => {
  return props.history.map((stack: Play[]) => [
    ...stack.map((play: Play) => {
      const teamId: TeamId = getTeamIdFromPlayerId(play.playerId)
      return {
        ...play,
        teamId,
        player: props.rosters[teamId][play.playerId]
      }
    })
  ])
})
</script>
<template>
  <template v-if="!items.length"><p>No history to revert.</p></template>
  <template v-else>
    <ul class="list-group list-group-flush">
      <template v-for="(item, pIdx) in items" :key="pIdx">
        <li class="list-group-item hstack gap-3">
          <div class="vstack">
            <template v-for="(itemPlay, idx) in item" :key="idx">
              <div class="hstack gap-3 align-items-center">
                <TeamLogo :team-id="getTeamIdFromPlayerId(itemPlay.playerId)" :size="25" />
                <div class="hstack gap-1 h6 mb-0 pt-1">
                  <span
                    >#<span class="jersey-number">{{ itemPlay.player.number }}</span></span
                  >
                  <span class="jersey-name">{{ itemPlay.player.lname }}</span>
                </div>
                <strong>{{ t(`options.scoreboxRecorder.${itemPlay.playKey}`) }}</strong>
                <ButtonComp
                  variant="danger"
                  size="sm"
                  class="ms-auto"
                  :is-busy="isBusy"
                  @click="handleRevert(pIdx, idx)"
                  ><i class="bi bi-x"></i
                ></ButtonComp>
              </div>
            </template>
          </div>
        </li>
      </template>
    </ul>
  </template>
</template>
