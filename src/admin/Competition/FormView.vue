<script lang="ts" setup>
import CompetitionForm from '@/admin/competition/forms/CompetitionForm.vue'
import SpinnerComp from '@/components/SpinnerComp.vue'
import useCompetition from '@/composable/useCompetition'
import useCompetitionAdmin from '@/composable/useCompetitionAdmin'
import type { Competition, CompetitionDoc, CompetitionId } from '@/types/competitions'
import { ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const { competitionId } = route.params as { competitionId: CompetitionId }
const { isReady, row } = useCompetition(competitionId)
const { writeCompetitionDoc } = useCompetitionAdmin(competitionId)
const isBusy = ref(false)
const handleSubmit = async (values: CompetitionDoc) => {
  const payload = {
    id: competitionId || undefined,
    ...values
  } as Competition
  isBusy.value = true
  await writeCompetitionDoc(payload)
  setTimeout(() => (isBusy.value = false), 150)
}
</script>
<template>
  <nav aria-label="breadcrumb">
    <ol class="breadcrumb">
      <li class="breadcrumb-item active" aria-current="page">Edit settings</li>
    </ol>
  </nav>
  <template v-if="!isReady">
    <SpinnerComp />
  </template>
  <template v-else>
    <CompetitionForm :value="row" :is-busy="isBusy" @submit="handleSubmit" />
  </template>
</template>
