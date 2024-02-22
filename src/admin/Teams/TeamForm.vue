<script lang="ts" setup>
import type { Team } from '@/types/teams'
import { ref, watch } from 'vue'
import type { Ref } from 'vue'
import ButtonComp from '@/components/ButtonComp.vue'
import InputComp from '@/components/InputComp.vue'
import useTeamsLib from '@/composable/useTeamsLib'
import FieldComp from '@/components/FieldComp.vue'
interface IProps {
  row?: Team | undefined | null
}
const props = withDefaults(defineProps<IProps>(), {
  row: undefined
})

type TeamForm = {
  id: string | undefined
  title: string
  logo: string
  color: string
}
const dataDefault = {
  id: undefined,
  title: '',
  logo: '',
  color: ''
}
const data = ref<TeamForm>({
  ...dataDefault
})

const emit = defineEmits(['done'])
const { rows, writeRows: writeTeams } = useTeamsLib()

const errors: Ref<{ [key: string]: undefined | string }> = ref({})

watch(
  () => props.row,
  (team) => {
    if (team?.id) {
      data.value = { ...dataDefault, ...team }
    } else if (team === undefined) {
      data.value = { ...dataDefault }
    }
  }
)
const handleSubmit = async (ev: Event) => {
  ev.preventDefault()
  const row = data.value as Team
  const { id, title } = row
  if (
    rows.value.findIndex(
      (team: Team) => (!id || team.id !== id) && team.title.toLowerCase() === title.toLowerCase()
    ) > -1
  ) {
    errors.value.title = 'This team already exists'
  } else {
    delete errors.value.title
    await writeTeams([row])
    emit('done')
  }
}
const handleCancel = () => emit('done')
</script>
<template>
  <form @submit="handleSubmit">
    <p class="small text-muted">{{ data.id || 'n/a' }}</p>
    <FieldComp label="Name">
      <InputComp
        v-model="data.title"
        :invalidFeedback="errors.title"
        :isInvalid="Boolean(errors.title)"
        required
      />
    </FieldComp>
    <FieldComp label="Color">
      <InputComp v-model="data.color" type="color" />
    </FieldComp>
    <div class="d-flex justify-content-end gap-2">
      <ButtonComp variant="light" @click="handleCancel">Cancel</ButtonComp>
      <ButtonComp variant="primary" type="submit">Save</ButtonComp>
    </div>
  </form>
</template>
