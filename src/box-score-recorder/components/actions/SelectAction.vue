<template>
  <div class="vstack gap-3">
    <div class="flex-grow-0 row g-2">
      <template v-for="teamId in teams" :key="teamId">
        <div class="col">
          <div class="vstack align-items-center gap-1">
            <TeamLogo :team-id="teamId" :size="45" />
            <h3 class="jersey-team">{{ getTeamName(teamId) }}</h3>
          </div>
          <div class="vstack gap-1">
            <template v-for="opt in options[teamId]" :key="opt.value">
              <ButtonComp
                :variant="opt.variant || 'primary'"
                size="lg"
                class="lh-1"
                @click="() => handleSelect(teamId, opt.value)"
                >{{ opt.text }}</ButtonComp
              >
            </template>
          </div>
        </div>
      </template>
    </div>
    <template v-if="!hideCancel || !hideSubmit">
      <hr class="my-0" />
      <div class="hstack gap-1">
        <ButtonComp
          variant="light"
          class="border flex-grow-1"
          :disabled="hideCancel"
          size="lg"
          @click="handleCancel"
          >{{ t('cta.cancel') }}</ButtonComp
        >
        <ButtonComp
          variant="success"
          class="flex-grow-1"
          :disabled="hideSubmit"
          size="lg"
          @click="handleSubmit"
          >{{ t('cta.submit') }}</ButtonComp
        >
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import ButtonComp from '@/components/ButtonComp.vue'
import TeamLogo from '@/components/teams/TeamLogo.vue'
import useLibs from '@/composable/useLibs'
import type { PlayKey, PlayOptions } from '@/types/box-score-recorder'
import type { TeamId } from '@/types/teams'
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'

const { t } = useI18n()
interface IProps {
  options: PlayOptions
  hideSubmit?: boolean
  hideCancel?: boolean
}

const props = withDefaults(defineProps<IProps>(), {
  hideSubmit: false,
  hideCancel: false
})
const emit = defineEmits(['select', 'cancel'])

const teams = computed(() =>
  Object.keys(props.options).filter((teamId: TeamId) => props.options[teamId]?.length)
)

const handleSelect = (teamId: TeamId, playKey: PlayKey) => {
  emit('select', { teamId, playKey })
}
const handleSubmit = () => {
  emit('cancel', 'submit')
}
const handleCancel = () => {
  emit('cancel')
}
const { getTeamName } = useLibs()
</script>
