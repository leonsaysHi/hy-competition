<script lang="ts" setup>
import { useGameDetails } from '@/stores/games'
import { useRoute } from 'vue-router'
const route = useRoute()
const { gameId, competitionId } = route.params
const row = useGameDetails(competitionId as string, gameId as string)
</script>
<template>
  <div>
    <h1>Competition game home</h1>
    <p>Single competition game details</p>
    <p>
      Game infos, Teams info, teams ranking, Game datas: game infos, team infos, competition
      standing, boxscores.
    </p>
    <p>{{ row }}</p>
  </div>
</template>
