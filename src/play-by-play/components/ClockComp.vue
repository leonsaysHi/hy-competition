<script lang="ts" setup>
import numeral from 'numeral'
import ButtonComp from '@/components/ButtonComp.vue'
import { computed, ref, watch, watchEffect } from 'vue'

interface IProps {
  modelValue: number
  gameLength?: number
  nbPeriods?: number
}
const props = withDefaults(defineProps<IProps>(), {
  gameLength: 4 * 10 * 60 * 1000,
  nbPeriods: 4
})
const emit = defineEmits(['update:modelValue', 'stopped'])
const model = computed({
  get: (): number => props.modelValue,
  set: (val: number) => emit('update:modelValue', val)
})
const startTime = ref<number>(0)
const isRunning = ref<boolean>(false)
const intervalId = ref<NodeJS.Timeout>()

const pauseTimestamp = ref<number | undefined>()
const handleStart = () => {
  if (isRunning.value) {
    return
  }
  isRunning.value = true
  if (pauseTimestamp.value) {
    startTime.value += Date.now() - pauseTimestamp.value
    pauseTimestamp.value = undefined
  } else {
    startTime.value = Date.now()
  }
  updateTimer()
}

const handlePause = () => {
  if (isRunning.value && intervalId.value) {
    clearInterval(intervalId.value)
    pauseTimestamp.value = Date.now()
  } else if (pauseTimestamp.value) {
    startTime.value += Date.now() - pauseTimestamp.value
    pauseTimestamp.value = undefined
    updateTimer()
  }
  isRunning.value = !isRunning.value
}

const updateTimer = () => {
  intervalId.value = setInterval(() => {
    if (isRunning.value) {
      const currentTime = Date.now()
      model.value = currentTime - startTime.value
      console.log(model.value % periodLength.value, periodIdx.value)
    }
  }, 100)
}

const periodLength = computed<number>(() =>
  numeral(props.gameLength).divide(props.nbPeriods).value()
)
const currentPeriodMil = computed(() => model.value % periodLength.value)
const periodIdx = computed(() => {
  return Math.floor(numeral(model.value).divide(periodLength.value).value())
})
watch(
  () => currentPeriodMil.value,
  (val, oldVal) => {
    if (isRunning.value && val < oldVal) {
      model.value = periodIdx.value * periodLength.value
      handlePause()
      emit('stopped')
    }
  }
)
const periods = computed(() =>
  new Array(props.nbPeriods).fill(null).map((p, idx) => idx <= periodIdx.value)
)
const minutes = computed<string>(() => {
  const mil = numeral(periodLength.value).subtract(currentPeriodMil.value).value()
  const value = Math.floor(mil / 60000)
  return value > 10 ? value.toString() : `0${value}`
})
const secondes = computed<string>(() => {
  const mil = numeral(periodLength.value).subtract(currentPeriodMil.value).value()
  const value = Math.floor(Math.ceil(mil % 60000) / 1000)
  return value < 10 ? `0${value}` : value < 60 ? value.toString() : '00'
})
const tenths = computed<string>(() => {
  const value = numeral(10)
    .subtract(Math.floor((currentPeriodMil.value % 1000) / 100))
    .value()
  return value < 10 ? value.toString() : '0'
})
</script>
<template>
  <div class="hstack text-white bg-dark">
    <div class="vstack py-2">
      <div class="hstack justify-content-center align-items-end display-2 lh-1 font-monospace">
        <span>{{ minutes }}</span>
        <span>:</span>
        <span>{{ secondes }}</span>
        <span>:</span>
        <span class="display-5">{{ tenths }}</span>
      </div>
      <div class="hstack gap-2 justify-content-center">
        <template v-for="(p, idx) in periods" :key="idx">
          <i class="bi bi-circle-fill" :class="p ? 'text-warning' : 'text-secondary'"></i>
        </template>
      </div>
    </div>
    <div class="vstack">
      <ButtonComp @click="handleStart()">Start</ButtonComp>
      <ButtonComp @click="handlePause()">Stop</ButtonComp>
    </div>
  </div>
</template>
<style scoped lang="scss">
.wrapper {
  min-height: 100vh;
}
</style>
