<script lang="ts" setup>
import TeamLogo from '@/components/teams/TeamLogo.vue'
import ButtonComp from '@/components/ButtonComp.vue'
import LineupInput from './LineupInput.vue'
import { computed, ref } from 'vue'
import type { LineUps, Rosters } from '../Game.vue';
import useLibs from '@/composable/useLibs';
import type { TeamId } from '@/types/teams';

interface IProps {
  modelValue: LineUps
  rosters: Rosters
  length?: number
}
const props = withDefaults(defineProps<IProps>(), {
  length: 5
})

const { getTeamName } = useLibs()
const emit = defineEmits(['update:modelValue'])
const data = ref<LineUps>(Object.keys(props.rosters).reduce((result: LineUps, teamId: TeamId) => {
    result[teamId] = []
    return result
  }, {} as LineUps))

const teamsId = computed(() => Object.keys(props.rosters))

const isLineupValid = computed(() => Object.keys(data.value)
  .every(
    (teamId: TeamId) =>
      Array.isArray(data.value[teamId]) && data.value[teamId].length === 1 // props.length
  )
)
const handleConfirmLineups = () => { 
  emit('update:modelValue', data.value)
  
}

</script>
<template>
  <div class="row gap-2">
          <template v-for="teamId in teamsId" :key="teamId">
            <div class="col">
              <div class="vstack align-items-center gap-1">
                <TeamLogo :team-id="teamId" :size="45" />
                <h3 class="jersey-team">{{ getTeamName(teamId) }}</h3>
              </div>
              <LineupInput v-model="data[teamId]" :roster="rosters[teamId]" :length="5" />
            </div>
          </template>
        </div>
        <div class="d-flex justify-content-center">
          <ButtonComp variant="success" :disabled="!isLineupValid" @click="handleConfirmLineups">
            Start game
          </ButtonComp>
        </div>
</template>./LineupInput.vue