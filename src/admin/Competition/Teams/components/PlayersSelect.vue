<template>
  <div class="mb-3">
    <template v-if="!isLibsReady">
      <SpinnerComp />
    </template>
    <template v-else>
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
      <AddTeamPlayerForm :playersOptions="playersOptions" @submit="handleAddPlayer" />
      <ModalComp ref="editModal" title="Edit player" hide-footer>
        <template v-if="editPlayer">
          <TeamPlayerForm :value="editPlayer" :player="editPlayer" @submit="handleSubmitPlayer" />
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
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

import AddTeamPlayerForm from '@/admin/competition/forms/AddTeamPlayerForm.vue'
import TeamPlayerForm from '@/admin/competition/forms/TeamPlayerForm.vue'
import TableComp from '@/components/TableComp.vue'
import ButtonComp from '@/components/ButtonComp.vue'
import type { TableField, TableItem } from '@/types/comp-table'
import type { CompetitionPlayer, Player, PlayerId } from '@/types/players'
import type { Option } from '@/types/comp-fields'
import ModalComp from '@/components/ModalComp.vue'
import type { CompetitionTeam } from '@/types/teams'

import useLibs from '@/composable/useLibs'
import useCompetition from '@/composable/useCompetition'
import SpinnerComp from '@/components/SpinnerComp.vue'
import { useRoute } from 'vue-router'
const route = useRoute()
const { competitionId, teamId } = route.params
const { isReady: isLibsReady, playersRows: playersLib, getPlayer } = useLibs()

const {
  row: competition,
  writePlayer: addPlayer,
  deletePlayer: removePlayer,
} = useCompetition(competitionId)

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
        const player: Player | undefined = getPlayer(row.id)
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

// Add Player
const handleAddPlayer = async (data) => {
  await addPlayer(teamId, { ...data })
}

// Edit Player
const editPlayer = ref<undefined | CompetitionPlayer>(undefined)
const editModal = ref<typeof ModalComp>()
const handleEditPlayer = (item: TableItem) => {
  editPlayer.value = item as unknown as CompetitionPlayer
  editModal.value?.show()
}
const handleSubmitPlayer = async (data: CompetitionPlayer) => {
  const { id, number }: CompetitionPlayer = data
  const idx = players.value.findIndex((player: CompetitionPlayer) => player.id === id)
  const payload = {
    ...players.value[idx],
    number
  } as CompetitionPlayer
  await addPlayer(teamId, payload)
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
  removePlayer(teamId, { ...deletePlayer.value })
  deletePlayerIsBusy.value = false
  deleteModal.value?.hide()
}
</script>

<style scoped lang="scss"></style>
