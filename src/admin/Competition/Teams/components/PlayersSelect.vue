<template>
  <div class="mb-3">
    <TableComp :fields="fields" :items="playersItems">
      <template #id="{ item }"> {{ item.fname }} {{ item.lname }} </template>
      <template #actions="{ item }">
        <div class="d-flex justify-content-end gap-1">
          <ButtonComp variant="light" size="sm" @click="() => handleEditPlayer(item)"
            >Edit</ButtonComp
          >
          <ButtonComp variant="danger" size="sm" @click="() => handleConfirmDeletePlayer(item)"
            >Remove</ButtonComp
          >
        </div>
      </template>
    </TableComp>
    <h5>Add player</h5>
    <form ref="addPlayerForm" @submit="handleAddPlayer" class="d-flex align-items-end gap-2">
      <FieldComp label="Number">
        <InputComp v-model="addPlayer.number" placeholder="#" required />
      </FieldComp>
      <FieldComp label="Player" class="flex-grow-1">
        <TypeaheadSelectComp v-model="addPlayer.id" :options="options" placeholder="Player" required />
      </FieldComp>
      <div class="mb-3">
        <ButtonComp variant="primary" type="submit" :disabled="!addPlayer.id">Add</ButtonComp>
      </div>
    </form>
    <ModalComp ref="editModal" title="Edit player" hide-footer>
      <template v-if="editPlayer">
        <form @submit="handleSubmitPlayer">
          <h5>{{ editPlayer.fname }} {{ editPlayer.lname }}</h5>
          <FieldComp label="Number">
            <InputComp v-model="editPlayer.number" :options="teamsOptions" />
          </FieldComp>
          <div class="d-flex justify-content-end gap-2">
            <ButtonComp variant="light" @click="editModal.hide">Cancel</ButtonComp>
            <ButtonComp variant="primary" type="submit">Save</ButtonComp>
          </div>
        </form>
      </template>
    </ModalComp>
    <ModalComp ref="deleteModal" title="Confirm removal" ok-variant="danger" @ok="handleRemove">
      <p>
        Sure to remove player <strong>{{ deletePlayer?.fname }} {{ deletePlayer?.lname }}</strong> from
      team.</p>
    </ModalComp>
  </div>
</template>

<script setup lang="ts">
import { ref, inject, computed } from 'vue'
import TypeaheadSelectComp from '@/components/TypeaheadSelectComp.vue'
import { PlayersLibKey } from '@/types/symbols'
import InputComp from '@/components/InputComp.vue'
import FieldComp from '@/components/FieldComp.vue'
import TableComp from '@/components/TableComp.vue'
import ButtonComp from '@/components/ButtonComp.vue'
import type { TableField, TableItem } from '@/types/comp-table'
import type { CompetitionPlayer, Player, PlayerId } from '@/types/players'
import type { Option } from '@/types/comp-fields'
import ModalComp from '@/components/ModalComp.vue'

const playersLib = inject(PlayersLibKey)
interface IProps {
  modelValue: CompetitionPlayer[]
  options: Option[]
}
const props = withDefaults(defineProps<IProps>(), {
  modelValue: () => [],
  options: () => []
})

const fields: TableField[] = [
  {
    key: 'number',
    label: '#'
  },
  {
    key: 'id',
    label: 'Player'
  },
  {
    key: 'identification',
    label: 'Identification'
  },
  {
    key: 'actions',
    label: ''
  }
]

const emit = defineEmits(['update:modelValue'])
const model = computed({
  get: (): CompetitionPlayer[] => props.modelValue,
  set: (val: CompetitionPlayer[]) => emit('update:modelValue', val)
})
const playersItems = computed((): TableItem[] => {
  return model.value.map((row: CompetitionPlayer) => {
    const player: Player | undefined = playersLib?.value?.find((p) => row.id === p.id)
    const { fname, lname, dob, identification } = player || {}
    return {
      fname,
      lname,
      dob,
      identification,
      ...row
    } as TableItem
  })
})

// Add Player
const addPlayerForm = ref<HTMLElement>()
const addPlayer = ref<undefined | CompetitionPlayerDoc>({})
const handleAddPlayer = (ev) => {
  ev.preventDefault()
  model.value.push({ ...addPlayer.value })
  addPlayerForm.value.reset()
}

// Edit Player
const editPlayer = ref<undefined | CompetitionPlayer>(undefined)
const editModal = ref<typeof ModalComp>()
const handleEditPlayer = (item: TableItem) => {
  editPlayer.value = item
  editModal.value.show()
}
const handleSubmitPlayer = (ev, values: CompetitionPlayer) => {
  ev.preventDefault()
  const { id, number } = editPlayer.value
  const idx = model.value.findIndex((player: CompetitionPlayer) => player.id === id)
  const newValue: CompetitionPlayer = {
    ...model.value[idx],
    number
  }
  model.value.splice(idx, 1, newValue)
  editModal.value.hide()
}
// Delete Player
const deletePlayer = ref<undefined | CompetitionPlayer>(undefined)
const deleteModal = ref<typeof ModalComp>()
const handleConfirmDeletePlayer = (row: TableItem) => {
  deletePlayer.value = row
  deleteModal.value?.show()
}
const handleRemove = () => {
  const idx = model.value.findIndex((row) => row.id === deletePlayer.value.id)
  model.value.splice(idx, 1)
  deleteModal.value?.hide()
}
</script>

<style scoped lang="scss"></style>
