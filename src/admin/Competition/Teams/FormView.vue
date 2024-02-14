<script lang="ts" setup>
import type { Team, CompetitionTeam, TeamId } from '@/types/teams'
import { TeamsLibKey, CompetitionKey } from '@/types/symbols'
import { inject, computed } from 'vue'
import PlayersSelect from './components/PlayersSelect.vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const { teamId } = route.params

const competition = inject(CompetitionKey)
const teamsLib = inject(TeamsLibKey)

type FormData = {
  id: TeamId | undefined
  sponsor: string | undefined
}
const dataDefault: FormData = {
  id: undefined,
  sponsor: undefined
}

const data = computed(
  (): FormData => ({
    ...dataDefault,
    ...(competition?.value?.teams.find(
      (team: CompetitionTeam) => team.id === teamId
    ) as CompetitionTeam)
  })
)

const selectedTeam = computed((): Team | undefined => {
  return data.value?.id ? teamsLib?.value?.find((row: Team) => row.id === data.value.id) : undefined
})
</script>
<template>
  <h5>Edit team</h5>
  <h4>{{ selectedTeam?.title }}</h4>
  <p class="small text-muted">{{ data.id }}</p>
  <PlayersSelect label="Players" />
</template>
