<script lang="ts" setup>
import PlayersSelect from './components/PlayersSelect.vue'
import TeamForm from '@/admin/competition/forms/TeamForm.vue'
import useLibs from '@/composable/useLibs'
import useCompetition from '@/composable/useCompetition'
import SpinnerComp from '@/components/SpinnerComp.vue'
import { useRoute } from 'vue-router'
import type { CompetitionTeam } from '@/types/teams'
import { computed } from 'vue'

const route = useRoute()
const { competitionId, teamId } = route.params
const { isReady: isLibsReady, getTeam } = useLibs()
const { isReady, row, writeTeam: writeCompetitionTeam } = useCompetition(competitionId)

const data = computed(() => {
  return row.value?.teams?.find((team: CompetitionTeam) => team.id === teamId)
})

const handleSubmit = async (payload: CompetitionTeam) => {
  await writeCompetitionTeam({
    id: teamId,
    ...payload
  })
}

</script>
<template>
  <h5>Edit</h5>
  <template v-if="!isLibsReady || !isReady">
    <SpinnerComp />
  </template>
  <template v-else>
    <h4 class="mb-0">{{ getTeam(teamId)?.title }}</h4>
    <TeamForm :value="data" @submit="handleSubmit" />
    <PlayersSelect label="Players" />
  </template>
</template>
