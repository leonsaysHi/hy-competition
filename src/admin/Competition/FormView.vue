<script lang="ts" setup>
import CompetitionForm from '@/admin/competition/forms/CompetitionForm.vue'
import SpinnerComp from '@/components/SpinnerComp.vue'
import useCompetition from '@/composable/useCompetition'
import type { Competition } from '@/types/competitions'
import { useRoute } from 'vue-router'

const route = useRoute()
const { competitionId } = route.params
const { isReady, writeRow: writeCompetition, row } = useCompetition(competitionId)

const handleSubmit = async (values: Competition) => {
  const payload = {
    ...values
  }
  payload.id = competitionId || null
  await writeCompetition(payload)
}
</script>
<template>
  <template v-if="!isReady">
    <SpinnerComp />
  </template>
  <template v-else>
    <CompetitionForm :value="row" @submit="handleSubmit" />
  </template>
</template>
