<template>
  <div class="vstack gap-3">
    <TeamLogo class="align-self-center" :team-id="teamId" :size="45" />
    <div class="flex-grow-0 row row-cols-2 g-1">
      <template v-for="opt in sortedOptions" :key="opt.value">
        <div class="col">
          <ButtonComp
            :variant="opt.disabled ? 'light' : 'primary'"
            :class="['w-100 vstack align-items-stretch', opt.disabled && 'border']"
            size="lg"
            :disabled="opt.disabled"
            no-flex
            @click="() => handleSelect(opt.value)"
          >
            <span class="lh-1 display-2 mb-0 text-center jersey-number">#{{ opt.number }}</span>
            <small class="lh-1 jersey-name">{{ opt.text }}</small>
          </ButtonComp>
        </div>
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
import TeamLogo from '@/components/teams/TeamLogo.vue'
import ButtonComp from '@/components/ButtonComp.vue'
import type { PlayerId } from '@/types/players'
import type { PlayersOptions } from '../PlaysInput.vue'
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'
import type { TeamId } from '@/types/teams'

const { t } = useI18n()
interface IProps {
  options: PlayersOptions[]
  teamId: TeamId
  hideSubmit?: boolean
  hideCancel?: boolean
}

const props = withDefaults(defineProps<IProps>(), {
  hideSubmit: false,
  hideCancel: false
})
const emit = defineEmits(['select', 'cancel'])

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
  emit('select', playerId)
}
const handleSubmit = () => {
  emit('cancel', 'submit')
}
const handleCancel = () => {
  emit('cancel')
}
</script>
