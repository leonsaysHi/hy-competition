<script lang="ts" setup>
import { useTeams } from '@/stores/teams'
import { provide } from 'vue'
const teams = useTeams()
provide('teams', teams)
</script>
<template>
  <template v-if="!Array.isArray(teams)"> Loading teams list... </template>
  <template v-else>
    <RouterView></RouterView>
  </template>
</template>
