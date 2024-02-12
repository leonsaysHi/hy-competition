<script lang="ts" setup>
import type { Game } from '@/types/games'
import type { TeamId } from '@/types/teams'
import { TeamsKey, CompetitionsKey } from '@/types/symbols'
import { ref, inject, watch } from 'vue'
import type { Ref } from 'vue'
import ButtonComp from '@/components/ButtonComp.vue'
interface IProps {
  row?: Game | undefined | null
}
const props = withDefaults(defineProps<IProps>(), {
  row: undefined
})

type TeamForm = {
  id: string | undefined
  teams: TeamId[]
}
const dataDefault = {
  id: undefined,
  teams: [],
}
const data = ref<TeamForm>({
  ...dataDefault
})

const emit = defineEmits(['done'])

const errors: Ref<{ [key: string]: undefined | string }> = ref({})
const teamsLib = inject(TeamsKey)

const competitions = inject(CompetitionsKey)

watch(
  () => props.row,
  (game) => {
    if (game?.id) {
      data.value = { ...dataDefault, ...game }
    } else if (game === undefined) {
      data.value = { ...dataDefault }
    }
  }
)

const handleSubmit = async (ev: Event) => {
  ev.preventDefault()
  
}
const handleCancel = () => emit('done')
</script>
<template>
  <form @submit="handleSubmit">
    <p class="small text-muted">{{ data.id || 'n/a' }}</p>
    Game Form
    <div class="d-flex justify-content-end gap-2">
      <ButtonComp variant="light" @click="handleCancel">Cancel</ButtonComp>
      <ButtonComp variant="primary" type="submit">Save</ButtonComp>
    </div>
  </form>
</template>
@/composable/useTeams
