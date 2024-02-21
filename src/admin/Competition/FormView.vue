<script lang="ts" setup>
import CompetitionForm from '@/admin/competition/forms/CompetitionForm.vue'
import SpinnerComp from '@/components/SpinnerComp.vue'
import useCompetition from '@/composable/useCompetition'
import type { CompetitionDoc } from '@/types/competitions'
import { useRoute } from 'vue-router'

const route = useRoute()
const { competitionId } = route.params
const { isReady, writeCompetitionDoc: addCompetition, row } = useCompetition(competitionId)

const handleSubmit = async (values: CompetitionDoc) => {
  const payload = {
    id: competitionId || undefined,
    ...values
  }
  await addCompetition(payload)
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
