<script lang="ts" setup>
import SpinnerComp from '@/components/SpinnerComp.vue'
import useCompetition from '@/composable/useCompetition'

const competitionId = 'YNZaQiwQDMPHCWsE1KrQ'
const { isReady, row } = useCompetition(competitionId)
</script>
<template>
  <div>
    <template v-if="!isReady">
      <div class="py-5"><SpinnerComp /></div>
    </template>
    <template v-else-if="!row?.phases">
      <p>Error: No phase.</p>
    </template>
    <template v-else> Brackets list. </template>
  </div>
</template>
