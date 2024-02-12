<script lang="ts" setup>
import type { Competition } from '@/types/competitions'
import type { CompetitionTeam } from '@/types/teams'
import { TeamsKey } from '@/types/symbols'
import { ref, inject, watch } from 'vue'
import type { Ref } from 'vue'
import ButtonComp from '@/components/ButtonComp.vue'
import InputComp from '@/components/InputComp.vue'
import CompetitionTeams from './components/CompetitionTeams.vue'

interface IProps {
  item?: CompetitionClass
}
const props = withDefaults(defineProps<IProps>(), {
  item: null
})

type CompetitionForm = {
  id: string | undefined
  teams: CompetitionTeam[]
}
const dataDefault = {
  id: undefined,
  teams: [],
}
const data = ref<CompetitionForm>({
  ...dataDefault
})

const emit = defineEmits(['done'])

const errors: Ref<{ [key: string]: undefined | string }> = ref({})
const teamsLib = inject(TeamsKey)

watch(
  () => props.item,
  (competition) => {
    if (competition?.id) {
      data.value = { ...dataDefault, ...competition }
    } else if (competition === undefined) {
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
    <InputComp v-model="data.title" label="Title" required />
    <InputComp v-model="data.date" type="date" label="Date" />
    <div class="d-flex justify-content-end gap-2">
      <ButtonComp variant="light" @click="handleCancel">Cancel</ButtonComp>
      <ButtonComp variant="primary" type="submit">Save</ButtonComp>
    </div>
  </form>
</template>
@/composable/useTeams
