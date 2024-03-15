<script lang="ts" setup>
import ButtonComp from '@/components/ButtonComp.vue'
import { computed, ref } from 'vue'

interface IProps {
  modelValue: number
  gameLength?: number
  nbPeriods?: number
  disabled?: boolean
}
const props = withDefaults(defineProps<IProps>(), {
  gameLength: 4 * 10 * 60 * 1000,
  nbPeriods: 4,
  disabled: false
})

const emit = defineEmits(['update:modelValue', 'stopped'])
const model = computed({
  get: (): number => props.modelValue,
  set: (val: number) => emit('update:modelValue', val)
})

const now: number = Date.now()
const startTime = ref<number>(now)
const pauseTime = ref<number>(now)
const currentPeriodIdx = ref<number>(0)
const animationFrame = ref<number | null>(null)
const isRunning = computed({
  get: (): boolean => !!animationFrame.value,
  set: (val: boolean) => {
    if (val && !animationFrame.value) {
      runningTime()
    } else if (!val && !!animationFrame.value) {
      cancelAnimationFrame(animationFrame.value)
      animationFrame.value = null
    }
  }
})
const handleStart = () => {
  if (!isRunning.value) {
    startTime.value += Date.now() - pauseTime.value
    isRunning.value = true
  }
}
const handlePause = () => {
  if (isRunning.value) {
    isRunning.value = false
    pauseTime.value = Math.min(Date.now(), currentPeriodEndTime.value)
  }
}

const handleJump = (sec: number) => {
  handlePause()
  // can't jump outside the current period:
  const jumpTime = Math.max(
    -inPeriodTime.value,
    Math.min(
      sec * 1000,
      periodLength.value - inPeriodTime.value
    )
  )
  startTime.value = startTime.value - jumpTime
  model.value = pauseTime.value - startTime.value
}

const handleNextPeriod = () => {
  currentPeriodIdx.value += 1
}
const runningTime = () => {
  const newTime = Math.min(
    Date.now() - startTime.value, 
    currentPeriodEndTime.value - startTime.value
  )
  model.value = newTime
  if (startTime.value + newTime === currentPeriodEndTime.value) {
    handlePause()
  } else {
    animationFrame.value = requestAnimationFrame(runningTime)
  }
}

const periodLength = computed<number>(() => props.gameLength / props.nbPeriods)
const currentPeriodStartTime = computed<number>(() => startTime.value + (currentPeriodIdx.value * periodLength.value))
const currentPeriodEndTime = computed<number>(() => startTime.value + ((currentPeriodIdx.value + 1) * periodLength.value))
const isStartOfCurrentPeriod = computed<boolean>(() => inPeriodTime.value === 0)
const isEndOfCurrentPeriod = computed<boolean>(() => inPeriodTime.value === periodLength.value)
const isEndOfGame = computed<boolean>(() => isEndOfCurrentPeriod.value && currentPeriodIdx.value === props.nbPeriods - 1)

const periodItems = computed<(-1 | 0 | 1)[]>(() =>
  new Array(props.nbPeriods)
    .fill(null)
    .map((p, idx) =>
      idx < currentPeriodIdx.value || (idx === currentPeriodIdx.value && inPeriodTime.value > 0)
        ? 1
        : idx > currentPeriodIdx.value
          ? -1
          : 0
    )
)
const inPeriodTime = computed(() => model.value - (currentPeriodIdx.value * periodLength.value))
const minutes = computed<string>(() => {
  const mil = periodLength.value - inPeriodTime.value
  const value = Math.floor(mil / 60000)
  return value > 10 ? value.toString() : `0${value}`
})
const secondes = computed<string>(() => {
  const mil = periodLength.value - inPeriodTime.value
  const value = Math.floor(Math.ceil(mil % 60000) / 1000)
  return value < 10 ? `0${value}` : value < 60 ? value.toString() : '00'
})
const tenths = computed<string>(() => {
  const value = 10 - Math.floor((inPeriodTime.value % 1000) / 100)
  return value < 10 ? value.toString() : '0'
})
</script>
<template>
  <div class="hstack text-white bg-dark">
    <div class="vstack">
      <div class="hstack justify-content-center align-items-end display-2 lh-1 font-monospace">
        <span>{{ minutes }}</span>
        <span>:</span>
        <span>{{ secondes }}</span>
        <span>:</span>
        <span class="display-5">{{ tenths }}</span>
      </div>
      <div class="hstack gap-2 justify-content-center">
        <template v-for="(p, idx) in periodItems" :key="idx">
          <i
            class="bi bi-circle-fill"
            :class="p === 1 ? 'text-warning' : p === 0 ? 'text-white' : 'text-secondary'"
          ></i>
        </template>
      </div>
    </div>
    <div class="hstack gap-1">
      <div class="vstack gap-1">
        <ButtonComp @click="() => handleJump(-1)" :disabled="disabled || isStartOfCurrentPeriod"><i class="bi bi-rewind-fill"></i></ButtonComp>
        <ButtonComp @click="() => handleJump(1)" :disabled="disabled || isEndOfCurrentPeriod"><i class="bi bi-fast-forward-fill"></i></ButtonComp>
      </div>
      <div class="hstack align-items-stretch">
        <template v-if="isEndOfGame"><ButtonComp disabled variant="success"><i class="bi bi-check-square-fill"></i></ButtonComp></template>
        <template v-else-if="isEndOfCurrentPeriod"><ButtonComp @click="handleNextPeriod()" variant="primary" :disabled="disabled"><i class="bi bi-check-square-fill"></i></ButtonComp></template>
        <template v-else-if="!isRunning"><ButtonComp @click="handleStart()" :disabled="disabled"><i class="bi bi-play-fill"></i></ButtonComp></template>
        <template v-else><ButtonComp @click="handlePause()" :disabled="disabled"><i class="bi bi-pause-fill"></i></ButtonComp></template>
      </div>
    </div>
  </div>
</template>
<style scoped lang="scss">
.wrapper {
  min-height: 100vh;
}
</style>
