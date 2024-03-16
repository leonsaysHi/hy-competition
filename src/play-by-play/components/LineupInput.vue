<script lang="ts" setup>
import ButtonComp from '@/components/ButtonComp.vue'
import ModalComp from '@/components/ModalComp.vue'
import type { PlayerId } from '@/types/players'
import { computed, ref } from 'vue'
import type { LineUpItem, Roster } from '../GameInput.vue'

interface IProps {
  modelValue: LineUpItem[]
  roster: Roster
  length?: number
}
const props = withDefaults(defineProps<IProps>(), {
  length: 5
})

const emit = defineEmits(['update:modelValue'])
const model = computed({
  get: (): LineUpItem[] => props.modelValue,
  set: (val: LineUpItem[]) => emit('update:modelValue', val)
})

const spots = computed<LineUpItem[]>(() => {
  const result = new Array(props.length)
    .fill(undefined)
    .map((playerId: PlayerId | undefined, idx) => {
      return model.value[idx] || undefined
    })
  result.sort((a, b) => {
    const numA = props.roster[a as PlayerId].number
    const numB = props.roster[b as PlayerId].number
    return numA.localeCompare(numB)
  })
  return result
})
const playersOptions = computed(() => {
  const result = Object.keys(props.roster).map((playerId: PlayerId) => ({
    ...props.roster[playerId],
    disabled: model.value.includes(playerId)
  }))
  result.sort((a, b) => {
    const numA = a.number
    const numB = b.number
    return numA.localeCompare(numB)
  })
  return result
})

const selectedSpotIdx = ref<number | undefined>()
const showRosterModal = ref<boolean>(false)
const selectInSpot = (idx: number) => {
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
          <strong class="jersey-number">#{{ roster[playerId].number }}</strong>
          <small class="jersey-name"
            >{{ roster[playerId].fname }} {{ roster[playerId].lname }}</small
          >
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
        <strong class="jersey-number">#{{ rosterPlayer.number }}</strong>
        <small class="jersey-name">{{ rosterPlayer.fname }} {{ rosterPlayer.lname }}</small>
      </ButtonComp>
    </template>
  </ModalComp>
</template>
<style scoped lang="scss">
.wrapper {
  min-height: 100vh;
}
</style>
