<script lang="ts" setup>
import ButtonComp from '@/components/ButtonComp.vue'
import ModalComp from '@/components/ModalComp.vue'
import type { PlayerId } from '@/types/players';
import { computed, ref } from 'vue'
import type { PlayerIn, PlayersIn, Roster } from '../Game.vue';

interface IProps {
  modelValue: PlayerIn[]
  roster: Roster
  length?: number
}

const emit = defineEmits(['update:modelValue'])
const model = computed({
  get: (): PlayerIn[] => props.modelValue,
  set: (val: PlayerIn[]) => emit('update:modelValue', val)
})

const props = withDefaults(defineProps<IProps>(), {
  length: 5
})
const spots = computed<PlayerIn[]>(() => {
  return new Array(props.length)
    .fill(undefined)
    .map((playerId: PlayerId | undefined, idx) => {
      return model.value[idx] || undefined
    })
})
const playersOptions = computed(() => Object.keys(props.roster)
  .map((playerId: PlayerId) => ({
    ...props.roster[playerId],
    disabled: model.value.includes(playerId)
    
  }))
)

const selectedSpotIdx = ref<number | undefined>()
const showRosterModal = ref<boolean>(false)
const selectInSpot = (idx:number) => {
  selectedSpotIdx.value = idx
  showRosterModal.value = true
}
const selectPlayer = (playerId: PlayerId) => {
  model.value.splice(selectedSpotIdx.value as number, 1, playerId)
  showRosterModal.value = false
}

</script>
<template>
  <div class="vstack gap-1">
    <template v-for="(playerId, idx) in spots" :key="playerId">
      <ButtonComp 
          :variant="playerId ? 'primary' : 'outline-secondary'"
          class="text-start"
          @click="() => selectInSpot(idx)"
        >
        <template v-if="playerId">
          <strong>{{ roster[playerId].number }}</strong>
          <small>{{ roster[playerId].fname }} {{ roster[playerId].lname }}</small>
        </template>
        <template v-else>??</template>
      </ButtonComp>
    </template>
  </div>
  <ModalComp v-model="showRosterModal" hide-header hide-ok>
    <template v-for="rosterPlayer in playersOptions" :key="rosterPlayer.id">
      <ButtonComp 
          :variant="rosterPlayer.disabled ? 'light' : 'primary'"
          :disabled="rosterPlayer.disabled"
          class="text-start"
          @click="() => selectPlayer(rosterPlayer.id)"
        >
        <strong>{{ rosterPlayer.number }}</strong>
        <small>{{ rosterPlayer.fname }} {{ rosterPlayer.lname }}</small>
      </ButtonComp>
    </template>
  </ModalComp>
</template>
<style scoped lang="scss">
.wrapper {
  min-height: 100vh;
}
</style>
