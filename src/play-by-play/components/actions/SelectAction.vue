<template>
  <div class="row gap-2">
    <template v-for="teamId in teams" :key="teamId">
      <div class="col">
        <div class="vstack align-items-center gap-1">
          <TeamLogo :team-id="teamId" :size="45" />
          <h3 class="jersey-team">{{ getTeamName(teamId) }}</h3>
        </div>
        <div class="vstack gap-1">
          <template v-for="opt in options[teamId]" :key="opt.value">
            <ButtonComp variant="outline-primary" @click="() => handleSelect(teamId, opt.value)">{{
              opt.text
            }}</ButtonComp>
          </template>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import ButtonComp from '@/components/ButtonComp.vue'
import TeamLogo from '@/components/teams/TeamLogo.vue'
import useLibs from '@/composable/useLibs'
import type { PlayKey } from '@/play-by-play/GameInput.vue';
import type { TeamId } from '@/types/teams';

interface IProps {
  options: []
}

const props = withDefaults(defineProps<IProps>(), {})
const emit = defineEmits(['select', 'cancel'])

const teams = Object.keys(props.options).filter((teamId: TeamId) => props.options[teamId].length)

const handleSelect = (teamId: TeamId, actionKey: PlayKey) => {
  emit('select', { teamId, actionKey })
}
const handleCancel = () => {
  emit('cancel')
}
const { getTeamName } = useLibs()
</script>
