<script lang="ts" setup>
import ModalComp from '@/components/ModalComp.vue'
import TeamLogo from '@/components/teams/TeamLogo.vue'
import ButtonComp from '@/components/ButtonComp.vue'
import { computed, ref } from 'vue'
import type { LineUps, Rosters } from '../GameInput.vue'
import useLibs from '@/composable/useLibs'
import type { TeamId } from '@/types/teams'
import type { PlayerId } from '@/types/players'

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

const data = ref<LineUps>(
  Object.keys(props.rosters).reduce((result: LineUps, teamId: TeamId) => {
    result[teamId] = new Array(props.length).fill(undefined)
    /*
    result.sort((a, b) => {
      const numA = props.roster[a as PlayerId].number
      const numB = props.roster[b as PlayerId].number
      return numA.localeCompare(numB)
    })
    */
    return result
  }, {} as LineUps)
)

const teamsId = computed(() => Object.keys(props.rosters))

const lineupModalEl = ref<typeof ModalComp>()
const selectedTeamLineUp = ref<TeamId | undefined>()

const handleClickLinupSpot = (teamId: TeamId, idx: number) => {
  data.value[teamId][idx] = undefined
  selectedTeamLineUp.value = teamId
  lineupModalEl.value?.show()
}
const handleSelectRosterPlayer = (playerId: PlayerId) => {
  const teamId = selectedTeamLineUp.value as TeamId
  const idx = data.value[teamId].findIndex((playerId: PlayerId | undefined) => !playerId)
  data.value[teamId].splice(idx, 1, playerId)
  if (data.value[teamId].every(Boolean)) {
    lineupModalEl.value?.hide()
  }
}

const lineupOptions = computed(() => {
  if (!selectedTeamLineUp.value) {
    return []
  }
  const teamId = selectedTeamLineUp.value as TeamId
  return Object.keys(props.rosters[teamId]).map((playerId: PlayerId) => ({
    value: playerId,
    text: `${props.rosters[teamId][playerId].fname} ${props.rosters[teamId][playerId].lname}`,
    player: props.rosters[teamId][playerId],
    disabled: data.value[teamId].includes(playerId)
  }))
})
const isLineupValid = computed(() =>
  Object.keys(data.value).every(
    (teamId: TeamId) => Array.isArray(data.value[teamId]) && data.value[teamId].length > 0 // data.value[teamId].every(Boolean)
  )
)
const handleConfirmLineups = () => {
  const result = {}
  Object.keys(data.value).forEach((teamId: TeamId) => {
    result[teamId] = data.value[teamId].filter(Boolean)
  })
  emit('update:modelValue', result)
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
        <div class="vstack gap-1">
          <template v-for="(playerId, idx) in data[teamId]" :key="playerId">
            <ButtonComp
              :variant="playerId ? 'primary' : 'outline-secondary'"
              class="text-start"
              @click="() => handleClickLinupSpot(teamId, idx)"
            >
              <template v-if="playerId">
                <strong class="jersey-number">#{{ rosters[teamId][playerId].number }}</strong>
                <span class="vr" />
                <span class="jersey-name"
                  >{{ rosters[teamId][playerId].fname }} {{ rosters[teamId][playerId].lname }}</span
                >
              </template>
              <template v-else>??</template>
            </ButtonComp>
          </template>
        </div>
      </div>
    </template>
  </div>
  <div class="d-flex justify-content-center">
    <ButtonComp variant="success" :disabled="!isLineupValid" @click="handleConfirmLineups">
      Start game
    </ButtonComp>
  </div>
  <ModalComp ref="lineupModalEl" title="Lineup" hide-footer>
    <div class="vstack gap-1">
      <template v-for="opt in lineupOptions" :key="opt.value">
        <ButtonComp
          :variant="opt.disabled ? 'light' : 'primary'"
          :disabled="opt.disabled"
          class="text-start"
          @click="() => handleSelectRosterPlayer(opt.value)"
        >
          <strong class="jersey-number">#{{ opt.player.number }}</strong>
          <span class="vr" />
          <span class="jersey-name">{{ opt.text }}</span>
        </ButtonComp>
      </template>
    </div>
  </ModalComp>
</template>
./LineupInput.vue
