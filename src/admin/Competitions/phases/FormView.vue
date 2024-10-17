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
    <template v-if="!isReady || !isLibsReady">
      <SpinnerComp />
    </template>
    <template v-else>
      <template v-if="showGroupsDisabledWarning">
        <AlertComp variant="warning">
          <p>Games have already started ; You should not edit groups' teams...</p>
          <template v-if="!bypassGroupsDisabled">
            <ButtonComp variant="danger" size="sm" @click="bypassGroupsDisabled = !bypassGroupsDisabled">Edit groups teams anyway</ButtonComp>
          </template>
          <template v-else>
            <ButtonComp variant="danger" size="sm" disabled>Edit groups teams anyway</ButtonComp>
          </template>
        </AlertComp>
      </template>
      <PhaseForm :value="data" :is-group-disabled="showGroupsDisabledWarning && !bypassGroupsDisabled" :is-busy="isBusy" :teamsOptions="teamsOptions" @submit="handleSubmit" />
    </template>
  </div>
</template>
<script lang="ts" setup>
import { useRoute, useRouter } from 'vue-router'
import { computed, ref } from 'vue'
import type { Option } from '@/types/comp-fields'
import type { CompetitionTeam } from '@/types/team'
import useCompetition from '@/composable/useCompetition'
import PhaseForm from '@/admin/Competitions/forms/PhaseForm.vue'
import useLibs from '@/composable/useLibs'
import AlertComp from '@/components/AlertComp.vue'
import SpinnerComp from '@/components/SpinnerComp.vue'
import useCompetitionAdmin from '@/composable/useCompetitionAdmin'
import type { Competition, CompetitionId, Phase } from '@/types/competitions'
import type { Game } from '@/types/games'
import { isAfter } from 'date-fns'
import ButtonComp from '@/components/ButtonComp.vue'

const route = useRoute()
const router = useRouter()
const { competitionId, phaseIdx }: { competitionId: CompetitionId, phaseIdx: Number } = route.params

const { isReady: isLibsReady, getTeam } = useLibs()
const { row, isReady } = useCompetition(competitionId)

const isBusy = ref(false)

const bypassGroupsDisabled = ref(false)
const showGroupsDisabledWarning = computed(() => {
  const phaseStartDate = data.value?.datetime
  const game = row.value?.games
    .find((game: Game) => phaseStartDate && isAfter(game.datetime, phaseStartDate))
  return Boolean(phaseIdx !== undefined && game)
})

const data = computed(() => {
  return typeof phaseIdx === 'string' && !isNaN(phaseIdx) ? row.value?.phases?.[Number(phaseIdx)] : undefined
})

const { writeCompetitionDoc } = useCompetitionAdmin(competitionId)

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

// Save phase
const handleSubmit = async (data: Phase) => {
  const phases = Array.isArray(row.value?.phases) ? row.value.phases : []
  phases.splice(
    phaseIdx === undefined ? phases.length : phaseIdx as number,
    1, 
    data
  )
  const payload: Competition = {
    ...row.value,
    phases
  }
  isBusy.value = true
  await writeCompetitionDoc(payload)
  isBusy.value = false
  router.push({ name: 'admin-competition-phases' })
}
</script>
