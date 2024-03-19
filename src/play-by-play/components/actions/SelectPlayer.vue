<template>
  <div class="vstack gap-3">
    <div class="vstack gap-1">
      <template v-for="opt in sortedOptions" :key="opt.value">
        <ButtonComp
          :variant="opt.disabled ? 'light' : 'primary'"
          :class="opt.disabled && 'border'"
          size="lg"
          :disabled="opt.disabled"
          @click="() => handleSelect(opt.value)"
        >
          <span class="jersey-number">#{{ opt.number }}</span>
          <span class="vr" />
          <span class="jersey-name">{{ opt.text }}</span>
        </ButtonComp>
      </template>
    </div>
    <template v-if="!hideCancel || !hideSubmit">
      <div class="hstack justify-content-between">
        <ButtonComp
          variant="light"
          class="border"
          :disabled="hideCancel"
          size="lg"
          @click="handleCancel"
          >{{ t('cta.cancel') }}</ButtonComp
        >
        <ButtonComp variant="success" :disabled="hideSubmit" size="lg" @click="handleSubmit">{{
          t('cta.submit')
        }}</ButtonComp>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import ButtonComp from '@/components/ButtonComp.vue'
import type { PlayerId } from '@/types/players'
import type { PlayersOptions } from '../PlaysInput.vue'
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'

const { t } = useI18n()
interface IProps {
  options: PlayersOptions[]
  hideSubmit?: boolean
  hideCancel?: boolean
}

const props = withDefaults(defineProps<IProps>(), {
  hideSubmit: false,
  hideCancel: false
})
const emit = defineEmits(['resolve', 'reject'])

const sortedOptions = computed(() => {
  const result = props.options.slice()
  result.sort((a, b) => {
    const numA = a.number
    const numB = b.number
    return numA.localeCompare(numB, undefined, { numeric: true, sensitivity: 'base' })
  })
  return result
})

const handleSelect = (playerId: PlayerId) => {
  emit('resolve', playerId)
}
const handleSubmit = () => {
  emit('reject', 'submit')
}
const handleCancel = () => {
  emit('reject')
}
</script>
