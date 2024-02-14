<script lang="ts" setup>
import useTeams from '@/composable/useTeams'
import type { Team } from '@/types/teams'
import { TeamsLibKey } from '@/types/symbols'
import { provide, type Ref } from 'vue'

const { getRows: getTeams } = useTeams()
const teamsLib = getTeams() as Ref<Team[] | undefined>
provide(TeamsLibKey, teamsLib)
</script>
<template>
  <template v-if="!teamsLib"> Loading teams list... </template>
  <template v-else>
    <RouterView></RouterView>
  </template>
</template>
