<script lang="ts" setup>
import type { Team, CompetitionTeam, TeamId } from '@/types/teams'
import { TeamsLibKey, PlayersLibKey, CompetitionKey } from '@/types/symbols'
import { ref, inject, computed } from 'vue'
import ButtonComp from '@/components/ButtonComp.vue'
import TypeaheadSelectComp from '@/components/TypeaheadSelectComp.vue'
import PlayersSelect from './components/PlayersSelect.vue'
import type { CompetitionPlayer, Player, PlayerId } from '@/types/players'
import { useRoute } from 'vue-router'
import FieldComp from '@/components/FieldComp.vue'
import type { Option } from '@/types/comp-fields'

const route = useRoute()
const { teamId } = route.params

const competition = inject(CompetitionKey)
const teamsLib = inject(TeamsLibKey)
const playersLib = inject(PlayersLibKey)

type FormData = {
  id: TeamId | undefined
  sponsor: string | undefined
  players: CompetitionPlayer[]
}
const dataDefault: FormData = {
  id: undefined,
  sponsor: undefined,
  players: []
}

const data = ref<FormData>({
  ...dataDefault,
  ...(competition?.value?.teams.find(
    (team: CompetitionTeam) => team.id === teamId
  ) as CompetitionTeam)
})

const teamsOptions = computed((): Option[] => {
  const competitionOtherTeams: TeamId[] = competition?.value?.teams
    ? competition?.value?.teams
        .filter((team: CompetitionTeam) => team.id !== data.value.id)
        .map((team: CompetitionTeam) => team.id)
    : []
  return teamsLib?.value
    ? teamsLib?.value.map(
        (row: Team): Option => ({
          text: row.title,
          value: row.id,
          disabled: competitionOtherTeams?.includes(row.id)
        })
      )
    : []
})
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

const handleSubmit = async (ev: Event) => {
  ev.preventDefault()
}
</script>
<template>
  <h5>Edit team</h5>
  <form @submit="handleSubmit">
    <p class="small text-muted">{{ data.id || 'n/a' }}</p>
    <FieldComp label="Team">
      <TypeaheadSelectComp v-model="data.id" :options="teamsOptions" />
    </FieldComp>
    <PlayersSelect v-model="data.players" :options="playersOptions" label="Players" />
    <div class="d-flex justify-content-end gap-2">
      <RouterLink class="btn btn-light" :to="{ name: 'admin-competition-teams' }"
        >Cancel</RouterLink
      >
      <ButtonComp variant="primary" type="submit">Save</ButtonComp>
    </div>
  </form>
</template>
@/composable/useTeams
