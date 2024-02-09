<script lang="ts" setup>
import useTeams from '@/composable/useTeams'
import type { Team } from '@/types/teams'
import { TeamsKey } from '@/types/symbols'
import { provide, type Ref } from 'vue'

const { getRows: getTeams } = useTeams()
const teams = getTeams() as Ref<Team[] | undefined>
provide(TeamsKey, teams)
</script>
<template>
  <template v-if="!Array.isArray(teams)"> Loading teams list... </template>
  <template v-else>
    <RouterView></RouterView>
  </template>
</template>
