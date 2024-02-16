<script lang="ts" setup>
import SpinnerComp from '@/components/SpinnerComp.vue'
import useCompetition from '@/composable/useCompetition'
import { useRoute } from 'vue-router'

const route = useRoute()
const { competitionId } = route.params

const { isReady } = useCompetition(competitionId)
</script>
<template>
  <template v-if="!isReady">
    <SpinnerComp />
    </template>
  <template v-else>
    <RouterView></RouterView>
  </template>
</template>
