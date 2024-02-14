<script lang="ts" setup>
import type { Game } from '@/types/games'
import type { TeamId } from '@/types/teams'
import { ref, watch } from 'vue'
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
  teams: []
}
const data = ref<TeamForm>({
  ...dataDefault
})

const emit = defineEmits(['save'])

const handleSubmit = async (ev: Event) => {
  ev.preventDefault()
}
const handleCancel = () => {
  emit('save')
}
</script>
<template>
  <form @submit="handleSubmit">
    <p class="small text-muted">{{ data.id || 'n/a' }}</p>
    <div class="d-flex justify-content-end gap-2">
      <ButtonComp variant="light" @click="handleCancel">Cancel</ButtonComp>
      <ButtonComp variant="primary" type="submit">Save</ButtonComp>
    </div>
  </form>
</template>
@/composable/useTeams
