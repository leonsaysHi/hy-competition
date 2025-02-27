<script lang="ts" setup>
import type { Team } from '@/types/team'
import { computed, ref, watch } from 'vue'
import type { Ref } from 'vue'
import ButtonComp from '@/components/ButtonComp.vue'
import InputComp from '@/components/InputComp.vue'
import useTeamsLib from '@/composable/useTeamsLib'
import FieldComp from '@/components/FieldComp.vue'
import ImageUpload from '@/components/ImageUpload.vue'
import { getAbbrev } from '@/utils/strings'
interface IProps {
  row?: Team | undefined | null
  isBusy?: boolean
}
const props = withDefaults(defineProps<IProps>(), {
  row: undefined,
  isBusy: false
})

type TeamForm = {
  id?: string | undefined
  title?: string
  short?: string
  logoUpload?: File | undefined
  logo?: string
  color?: string
}
const getDefaultData = (): TeamForm => ({
  id: undefined,
  title: '',
  short: '',
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
  (row) => {
    data.value = { ...getDefaultData(), ...(row?.id ? row : {}) }
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
    if (!data.value.short?.length) {
      data.value.short = getAbbrev(data.value.title)
    }

    delete errors.value.title
    emit('submit', data.value as Team)
    data.value = getDefaultData()
  }
}
const shortHelper = computed(() => {
  return !data.value.title ? undefined : `Ex: ${getAbbrev(data.value.title)}`
})
</script>
<template>
  <form @submit="handleSubmit">
    <p class="small text-muted">{{ data.id || 'n/a' }}</p>
    <FieldComp label="Name">
      <InputComp
        v-model="data.title"
        :invalidFeedback="errors.title"
        :isInvalid="Boolean(errors.title)"
        :disabled="isBusy"
        required
      />
    </FieldComp>
    <FieldComp label="Short name" :helper="shortHelper">
      <InputComp
        v-model="data.short"
        placeholder="2 or 3 letters max"
        :invalidFeedback="errors.short"
        :isInvalid="Boolean(errors.short)"
        :disabled="isBusy"
      />
    </FieldComp>
    <FieldComp label="Logo">
      <ImageUpload v-model="data.logoUpload" :src="data.logo" :disabled="isBusy" />
    </FieldComp>
    <FieldComp label="Color">
      <InputComp v-model="data.color" type="color" :disabled="isBusy" />
    </FieldComp>
    <div class="d-flex justify-content-end gap-2">
      <ButtonComp variant="primary" type="submit" :is-busy="isBusy">Save</ButtonComp>
    </div>
  </form>
</template>
