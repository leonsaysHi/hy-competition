<template>
  <div class="vstack gap-3">
    <div class="row gap-2">
      <template v-for="teamId in teams" :key="teamId">
        <div class="col">
          <div class="vstack gap-1">
            <TeamLogo :team-id="teamId" :size="45" />
            <h3 class="jersey-team">{{ getTeamName(teamId) }}</h3>
          </div>
          <div class="vstack gap-1">
            <template v-for="opt in options[teamId]" :key="opt.value">
              <ButtonComp
                variant="primary"
                size="lg"
                @click="() => handleSelect(teamId, opt.value)"
                >{{ opt.text }}</ButtonComp
              >
            </template>
          </div>
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
import ButtonComp from '@/components/ButtonComp.vue'
import TeamLogo from '@/components/teams/TeamLogo.vue'
import useLibs from '@/composable/useLibs'
import type { PlayKey } from '@/play-by-play/GameInput.vue'
import type { TeamId } from '@/types/teams'
import type { ActionsOptions } from '../PlaysInput.vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
interface IProps {
  options: ActionsOptions
  hideSubmit?: boolean
  hideCancel?: boolean
}

const props = withDefaults(defineProps<IProps>(), {
  hideSubmit: false,
  hideCancel: false
})
const emit = defineEmits(['resolve', 'reject'])

const teams = Object.keys(props.options).filter((teamId: TeamId) => props.options[teamId].length)

const handleSelect = (teamId: TeamId, actionKey: PlayKey) => {
  emit('resolve', { teamId, actionKey })
}
const handleSubmit = () => {
  emit('reject', 'submit')
}
const handleCancel = () => {
  emit('reject')
}
const { getTeamName } = useLibs()
</script>
