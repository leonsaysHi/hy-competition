<script lang="ts" setup>
import type { Team } from '@/types/teams'
import { ref, watch } from 'vue'
import type { Ref } from 'vue'
import ButtonComp from '@/components/ButtonComp.vue'
import InputComp from '@/components/InputComp.vue'
import useTeamsLib from '@/composable/useTeamsLib'
import FieldComp from '@/components/FieldComp.vue'
import ImageUpload from '@/components/ImageUpload.vue'
interface IProps {
  row?: Team | undefined | null
}
const props = withDefaults(defineProps<IProps>(), {
  row: undefined
})

type TeamForm = {
  id?: string | undefined
  title?: string
  logoUpload?: File | undefined
  logo?: string
  color?: string
}
const getDefaultData = (): TeamForm => ({
  id: undefined,
  title: '',
  logoUpload: undefined,
  logo: '',
  color: ''
})
const data = ref<TeamForm>({
  ...getDefaultData()
})

const emit = defineEmits(['submit'])

const { rows } = useTeamsLib()

const errors: Ref<{ [key: string]: undefined | string }> = ref({})

watch(
  () => props.row,
  (team) => {
    if (team?.id) {
      data.value = { ...getDefaultData(), ...team }
    }
  }
)
const handleSubmit = (ev: Event) => {
  ev.preventDefault()
  const { id, title } = data.value
  if (
    !rows.value ||
    rows.value.findIndex(
      (team: Team) => (!id || team.id !== id) && team.title.toLowerCase() === title.toLowerCase()
    ) > -1
  ) {
    errors.value.title = 'This team already exists'
  } else {
    delete errors.value.title
    emit('submit', data.value as Team)
    data.value = getDefaultData()
  }
}
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
    <FieldComp label="Logo">
      <ImageUpload v-model="data.logoUpload" :src="data.logo" />
    </FieldComp>
    <FieldComp label="Color">
      <InputComp v-model="data.color" type="color" />
    </FieldComp>
    <div class="d-flex justify-content-end gap-2">
      <ButtonComp variant="primary" type="submit">Save</ButtonComp>
    </div>
  </form>
</template>
