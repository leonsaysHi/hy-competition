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
    <form @submit="handleAddPlayer" class="d-flex align-items-end gap-2">
      <FieldComp label="Number">
        <InputComp v-model="addPlayer.number" placeholder="#" required />
      </FieldComp>
      <FieldComp label="Player" class="flex-grow-1">
        <TypeaheadSelectComp
          v-model="addPlayer.id"
          :options="playersOptions"
          placeholder="Player"
          required
        />
      </FieldComp>
      <div class="mb-3">
        <ButtonComp
          variant="primary"
          type="submit"
          :disabled="!addPlayer.id || addPlayerIsBusy"
          :is-busy="addPlayerIsBusy"
          >Add</ButtonComp
        >
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
    <ModalComp ref="deleteModal" title="Confirm removal" ok-title="Remove" ok-variant="danger">
      <p>
        Sure to remove player
        <strong>{{ deletePlayer?.fname }} {{ deletePlayer?.lname }}</strong> from team.
      </p>
      <template #modal-ok="{ okTitle, okVariant, okDisabled }">
        <ButtonComp
          :variant="okVariant"
          :disabled="okDisabled"
          :isBusy="deletePlayerIsBusy"
          @click="handleRemove"
        >
          {{ okTitle }}
        </ButtonComp>
      </template>
    </ModalComp>
  </div>
</template>

<script setup lang="ts">
import { ref, inject, computed } from 'vue'
import { useRoute } from 'vue-router'
import TypeaheadSelectComp from '@/components/TypeaheadSelectComp.vue'
import { CompetitionKey } from '@/types/symbols'

import usePlayersLib from '@/composable/usePlayersLib'
import InputComp from '@/components/InputComp.vue'
import FieldComp from '@/components/FieldComp.vue'
import TableComp from '@/components/TableComp.vue'
import ButtonComp from '@/components/ButtonComp.vue'
import type { TableField, TableItem } from '@/types/comp-table'
import type { CompetitionPlayer, CompetitionPlayerDoc, Player } from '@/types/players'
import type { Option } from '@/types/comp-fields'
import ModalComp from '@/components/ModalComp.vue'
import useCompetitions from '@/composable/useCompetitions'
import type { CompetitionTeam } from '@/types/teams'

const competition = inject(CompetitionKey)
const { rows: playersLib } = usePlayersLib()

const playersOptions = computed((): Option[] => {
  const competitionOtherPlayers: PlayerId[] = competition?.value?.teams
    ? competition?.value?.teams.reduce((acc: PlayerId[], team: CompetitionTeam) => {
        return [...acc, ...team.players.map((player: CompetitionPlayer) => player.id)]
      }, [])
    : []
  return playersLib?.value
    ? playersLib?.value.map(
        (row: Player): Option => ({
          text: [row.fname, row.lname].join(' '),
          value: row.id,
          disabled: competitionOtherPlayers?.includes(row.id)
        })
      )
    : []
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

const players = computed((): CompetitionPlayer[] => {
  const team = competition?.value?.teams?.find(
    (team: CompetitionTeam) => team.id === teamId
  ) as CompetitionTeam
  return team?.players
})
const playersItems = computed(() => {
  return players.value
    ? players.value.map((row: CompetitionPlayer) => {
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
    : []
})

const route = useRoute()
const { competitionId, teamId } = route.params
const { addRowTeamPlayer: addPlayerDoc, deleteRowTeamPlayer: removePlayerDoc } = useCompetitions()
// Add Player
const addPlayer = ref<CompetitionPlayer>({})
const addPlayerIsBusy = ref(false)
const handleAddPlayer = async (ev: Event) => {
  ev.preventDefault()
  addPlayerIsBusy.value = true
  await addPlayerDoc(competitionId, teamId, { ...addPlayer.value })
  addPlayerIsBusy.value = false
  addPlayer.value = {}
}

// Edit Player
const editPlayer = ref<undefined | CompetitionPlayer>(undefined)
const editPlayerIsBusy = ref(false)
const editModal = ref<typeof ModalComp>()
const handleEditPlayer = (item: TableItem) => {
  editPlayer.value = item as unknown as CompetitionPlayer
  editModal.value?.show()
}
const handleSubmitPlayer = async (ev: Event) => {
  ev.preventDefault()
  editPlayerIsBusy.value = true
  const { id, number }: CompetitionPlayer = editPlayer.value
  const idx = players.value.findIndex((player: CompetitionPlayer) => player.id === id)
  const payload = {
    ...players.value[idx],
    number
  } as CompetitionPlayer
  await addPlayerDoc(competitionId, teamId, payload)
  editPlayerIsBusy.value = false
  editModal.value?.hide()
}
// Delete Player
const deletePlayer = ref<undefined | CompetitionPlayer>(undefined)
const deletePlayerIsBusy = ref(false)
const deleteModal = ref<typeof ModalComp>()
const handleConfirmDeletePlayer = (row: TableItem) => {
  deletePlayer.value = row as unknown as CompetitionPlayer
  deleteModal.value?.show()
}
const handleRemove = () => {
  deletePlayerIsBusy.value = true
  removePlayerDoc(competitionId, teamId, { ...deletePlayer.value })
  deletePlayerIsBusy.value = false
  deleteModal.value?.hide()
}
</script>

<style scoped lang="scss"></style>
