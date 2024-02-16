<script lang="ts" setup>
import useCompetition from '@/composable/useCompetition'
import { useRoute } from 'vue-router'

const route = useRoute()
const { competitionId } = route.params

const { row } = useCompetition(competitionId)

</script>
<template>
  <div>
    <h1>{{ row?.title }}</h1>
    <p>Single competition details</p>
    <h5>Games</h5>
    <ul class="list-group list-group-flush">
      <template v-for="game in row.games" :key="game.id">
        <li class="list-group-item">
          <RouterLink
            :to="{
              name: 'competition-game',
              params: { competitionId, gameId: game?.id }
            }"
            >{{ game?.teams.join('|') }}</RouterLink
          >
        </li>
      </template>
    </ul>
  </div>
</template>
