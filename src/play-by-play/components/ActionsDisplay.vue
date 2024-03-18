<script lang="ts" setup>
import { computed } from 'vue'
import type { Play, PlayByPlay, PlayStack, Roster, RosterPlayer, Rosters } from '../GameInput.vue'

import { useI18n } from 'vue-i18n'
import TeamLogo from '@/components/teams/TeamLogo.vue'
import ButtonComp from '@/components/ButtonComp.vue'
import type { TeamId } from '@/types/teams'
import type { PlayerId } from '@/types/players'
const { t } = useI18n()

interface IProps {
  items: PlayByPlay
  rosters: Rosters
  compact?: boolean
  showRemove?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<IProps>(), {
  disabled: false,
  compact: false,
  showRemove: false
})
const emit = defineEmits(['remove'])

const getTeamIdFromPlayerId = (playerId: PlayerId): TeamId => {
  return Object.keys(props.rosters).find((teamId: TeamId) =>
    Object.keys(props.rosters[teamId]).includes(playerId)
  ) as TeamId
}
const playByPlayStacks = computed(() => {
  return props.items.map((stack: PlayStack) => {
    return stack.map((play: Play) => {
      const player = Object.values(props.rosters)
        .map((roster: Roster) => Object.values(roster))
        .flat()
        .find((player: RosterPlayer) => player.id === play.playerId) as RosterPlayer
      const sec = play.time ? Math.floor((play.time % 60000) / 1000) : 0
      const min = play.time ? Math.floor(play.time / 60000) : 0
      const timeToString = (n: number) => (n < 10 ? `0${n}` : n.toString())
      return {
        ...play,
        timeString: `${timeToString(min)}:${timeToString(sec)}`,
        player
      }
    })
  })
})
const handleRemove = (idx: number) => {
  emit('remove', idx)
}
</script>
<template>
  <div class="vstack" :class="!compact && 'gap-1'">
    <template v-for="(stack, idx) in playByPlayStacks" :key="idx">
      <template v-for="act in stack" :key="act.actionKey">
        <div class="hstack gap-2" :class="!compact && 'p-1 border rounded-2'">
          <small class="ps-2 text-body-secondary">
            {{ act.timeString }}
          </small>
          <div class="hstack gap-1">
            <TeamLogo :team-id="getTeamIdFromPlayerId(act.playerId)" :size="30" />
            <span class="jersey-number">#{{ act.player.number }}</span>
            <span class="jersey-name">{{ act.player.fname }} {{ act.player.lname }}</span>
          </div>
          <div>
            {{ t(`options.playerStats.playByPlay.${act.actionKey}`) }}
          </div>
          <template v-if="showRemove">
            <ButtonComp class="ms-auto" variant="light" @click="handleRemove(idx)"
              ><div class="btn-close"></div
            ></ButtonComp>
          </template>
        </div>
      </template>
    </template>
  </div>
</template>
