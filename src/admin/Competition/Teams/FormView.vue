<script lang="ts" setup>
import type { Team, CompetitionTeam, TeamId } from '@/types/teams'
import { TeamsLibKey, CompetitionKey } from '@/types/symbols'
import { inject, computed } from 'vue'
import PlayersSelect from './components/PlayersSelect.vue'
import { useRoute } from 'vue-router'
import FieldComp from '@/components/FieldComp.vue'
import InputComp from '@/components/InputComp.vue'

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

const data = ref({
  ...dataDefault,
  ...(competition?.value?.teams.find((team: CompetitionTeam) => team.id === teamId) as FormData)
})

const selectedTeam = computed((): Team | undefined => {
  return data.value?.id ? teamsLib?.value?.find((row: Team) => row.id === data.value.id) : undefined
})

const handleSave = (ev: Event) => {
  ev.preventDefault()
}
</script>
<template>
  <h5>Edit</h5>
  <h4 class="mb-0">{{ selectedTeam?.title }}</h4>
  <p class="small text-muted">{{ data.id }}</p>
  <form @submit="handleSave">
    <FieldComp label="Sponsor">
      <InputComp />
    </FieldComp>
  </form>
  <PlayersSelect label="Players" />
</template>
