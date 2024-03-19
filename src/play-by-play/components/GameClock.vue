<script lang="ts" setup>
import ButtonComp from '@/components/ButtonComp.vue'
import { add } from '@/utils/maths'
import { computed, ref } from 'vue'

interface IProps {
  modelValue: number
  periodIdx: number
  periodsLength: number[]
  disabled?: boolean
}
const props = withDefaults(defineProps<IProps>(), {
  disabled: false
})

const emit = defineEmits(['update:modelValue', 'end-of-period', 'next-period'])
const model = computed({
  get: (): number => props.modelValue,
  set: (val: number) => emit('update:modelValue', val)
})

const now: number = Date.now()
const startTime = ref<number>(now - props.modelValue)
const pauseTime = ref<number>(now)
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
const buttonsVariant = computed(() => (isRunning.value ? 'light' : 'primary'))
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
    Math.min(sec * 1000, props.periodsLength[props.periodIdx] - inPeriodTime.value)
  )
  startTime.value = startTime.value - jumpTime
  model.value = pauseTime.value - startTime.value
}

const handleNextPeriod = () => {
  emit('next-period')
}
const runningTime = () => {
  const newTime = Math.min(
    Date.now() - startTime.value,
    currentPeriodEndTime.value - startTime.value
  )
  model.value = newTime
  if (startTime.value + newTime === currentPeriodEndTime.value) {
    handlePause()
    emit('end-of-period')
  } else {
    animationFrame.value = requestAnimationFrame(runningTime)
  }
}

const currentPeriodStartTime = computed<number>(() => {
  const duration = props.periodsLength.slice(0, props.periodIdx).reduce(add, 0)
  console.log('duration to period start', duration)
  return startTime.value + duration
})
const currentPeriodEndTime = computed<number>(() => {
  const duration = props.periodsLength[props.periodIdx]
  console.log('duration to period end', duration)
  return currentPeriodStartTime.value + duration
})
const inPeriodTime = computed(() => {
  const duration = props.periodsLength.slice(0, props.periodIdx).reduce(add, 0)
  return model.value - duration
})

const isStartOfCurrentPeriod = computed<boolean>(() => inPeriodTime.value === 0)
const isEndOfCurrentPeriod = computed<boolean>(
  () => inPeriodTime.value === props.periodsLength[props.periodIdx]
)
const isGameOver = computed<boolean>(
  () => isEndOfCurrentPeriod.value && props.periodsLength.length === props.periodIdx + 1
)

const periodItems = computed<(-1 | 0 | 1)[]>(() =>
  props.periodsLength.map((p, idx) =>
    idx < props.periodIdx || (idx === props.periodIdx && inPeriodTime.value > 0)
      ? 1
      : idx > props.periodIdx
        ? -1
        : 0
  )
)
const minutes = computed<string>(() => {
  const mil = props.periodsLength[props.periodIdx] - inPeriodTime.value
  const value = Math.floor(mil / 60000)
  return value < 10 ? `0${value}` : value.toString()
})
const secondes = computed<string>(() => {
  const mil = props.periodsLength[props.periodIdx] - inPeriodTime.value
  const value = Math.floor(Math.ceil(mil % 60000) / 1000)
  return value < 10 ? `0${value}` : value < 60 ? value.toString() : '00'
})
const tenths = computed<string>(() => {
  const value = 10 - Math.floor((inPeriodTime.value % 1000) / 100)
  return value < 10 ? value.toString() : '0'
})
</script>
<template>
  <div class="hstack text-white bg-success" :class="!isRunning && 'bg-dark'">
    <div class="flex-grow-0 vstack gap-1">
      <ButtonComp
        @click="() => handleJump(-1)"
        :variant="buttonsVariant"
        size="lg"
        :disabled="disabled || isStartOfCurrentPeriod"
        ><i class="bi bi-rewind-fill"></i
      ></ButtonComp>
      <ButtonComp
        @click="() => handleJump(1)"
        :variant="buttonsVariant"
        size="lg"
        :disabled="disabled || isEndOfCurrentPeriod"
        ><i class="bi bi-fast-forward-fill"></i
      ></ButtonComp>
    </div>
    <div class="vstack">
      <div class="hstack justify-content-center align-items-end display-2 lh-1 font-scoreboard">
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
    <div class="hstack flex-grow-0 align-items-stretch">
      <template v-if="isGameOver"
        ><ButtonComp variant="success" size="lg" disabled
          ><i class="bi bi-check-square-fill"></i></ButtonComp
      ></template>
      <template v-else-if="isEndOfCurrentPeriod"
        ><ButtonComp @click="handleNextPeriod()" variant="primary" size="lg" :disabled="disabled"
          ><i class="bi bi-check-square-fill"></i></ButtonComp
      ></template>
      <template v-else-if="!isRunning"
        ><ButtonComp @click="handleStart()" :variant="buttonsVariant" size="lg" :disabled="disabled"
          ><i class="bi bi-play-fill"></i></ButtonComp
      ></template>
      <template v-else
        ><ButtonComp @click="handlePause()" :variant="buttonsVariant" size="lg" :disabled="disabled"
          ><i class="bi bi-pause-fill"></i></ButtonComp
      ></template>
    </div>
  </div>
</template>
<style scoped lang="scss">
.wrapper {
  min-height: 100vh;
}
</style>
