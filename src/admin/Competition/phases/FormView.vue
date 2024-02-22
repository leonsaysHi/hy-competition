<template>
  <div>
    <nav aria-label="breadcrumb">
      <ol class="breadcrumb">
        <li class="breadcrumb-item">
          <RouterLink :to="{ name: 'admin-competition-phases' }">Phases list</RouterLink>
        </li>
        <li class="breadcrumb-item active" aria-current="page">Initiate new phase</li>
      </ol>
    </nav>
    <template v-if="!isLibsReady">
      <SpinnerComp />
    </template>
    <template v-else>
      <AddPhaseForm :teamsOptions="teamsOptions" @submit="handleAddPhase" />
    </template>
  </div>
</template>
<script lang="ts" setup>
import { useRoute, useRouter } from 'vue-router'
import { computed } from 'vue'
import type { Option } from '@/types/comp-fields'
import type { CompetitionTeam } from '@/types/teams'
import useCompetition from '@/composable/useCompetition'
import AddPhaseForm from '@/admin/competition/forms/AddPhaseForm.vue'
import useLibs from '@/composable/useLibs'
import SpinnerComp from '@/components/SpinnerComp.vue'

const route = useRoute()
const router = useRouter()
const { competitionId } = route.params

const { isReady: isLibsReady, getTeam } = useLibs()

const { row, writeCompetitionDoc } = useCompetition(competitionId)

const teamsOptions = computed((): Option[] => {
  return Array.isArray(row?.value?.teams)
    ? row?.value?.teams?.map((row: CompetitionTeam): Option => {
        const team = getTeam(row.id)
        return {
          value: team.id,
          text: team.title
        }
      })
    : []
})

// Add phase
const handleAddPhase = async (data) => {
  const phases = Array.isArray(row.value?.phases) ? row.value.phases : []
  phases.push(data)
  await writeCompetitionDoc({
    ...row.value,
    phases
  })
  router.push({ name: 'admin-competition-phases' })
}
</script>
