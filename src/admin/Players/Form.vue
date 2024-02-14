<script lang="ts" setup>
import type { Player } from '@/types/players'
import { PlayersLibKey } from '@/types/symbols'
import { ref, inject, watch } from 'vue'
import type { Ref } from 'vue'
import ButtonComp from '@/components/ButtonComp.vue'
import InputComp from '@/components/InputComp.vue'
import usePlayers from '@/composable/usePlayers'
import FieldComp from '@/components/FieldComp.vue'
interface IProps {
  row?: Player | undefined | null
}
const props = withDefaults(defineProps<IProps>(), {
  row: undefined
})

type PlayerForm = {
  id: string | undefined
  fname: string
  lname: string
  identification: string
  dob: string
  foto: string
}
const dataDefault = {
  id: undefined,
  fname: '',
  lname: '',
  identification: '',
  foto: '',
  dob: ''
}
const data = ref<PlayerForm>({
  ...dataDefault
})

const emit = defineEmits(['done'])
const { writeRows: writePlayers } = usePlayers()

const errors: Ref<{ [key: string]: undefined | string }> = ref({})
const players = inject(PlayersLibKey)

watch(
  () => props.row,
  (player) => {
    if (player?.id) {
      data.value = { ...dataDefault, ...player }
    } else if (player === undefined) {
      data.value = { ...dataDefault }
    }
  }
)
const handleSubmit = async (ev: Event) => {
  ev.preventDefault()
  const row = data.value as Player
  const { id, identification } = row
  if (
    players.value.findIndex(
      (r) => (!id || r.id !== id) && r.identification.toLowerCase() === identification.toLowerCase()
    ) > -1
  ) {
    errors.value.identification = 'This player already exists'
  } else {
    delete errors.value.identification
    await writePlayers([row])
    emit('done')
  }
}
const handleCancel = () => emit('done')
</script>
<template>
  <form @submit="handleSubmit">
    <p class="small text-muted">{{ data.id || 'n/a' }}</p>
    <FieldComp label="First name">
      <InputComp v-model="data.fname" type="text" required />
    </FieldComp>
    <FieldComp label="Last name">
      <InputComp v-model="data.lname" type="text" required />
    </FieldComp>
    <FieldComp label="Identification">
      <InputComp
        v-model="data.identification"
        type="text"
        label="Identification"
        :invalidFeedback="errors.identification"
        :isInvalid="Boolean(errors.identification)"
        required
      />
    </FieldComp>
    <FieldComp label="Birthdate">
      <InputComp v-model="data.dob" type="date" />
    </FieldComp>
    <div class="d-flex justify-content-end gap-2">
      <ButtonComp variant="light" @click="handleCancel">Cancel</ButtonComp>
      <ButtonComp variant="primary" type="submit">Save</ButtonComp>
    </div>
  </form>
</template>
