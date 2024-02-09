<script lang="ts" setup>
import { inject } from 'vue'
const competition = inject('competition')
const games = inject('games')
</script>
<template>
  <div>
    <h1>{{ competition?.title }}</h1>
    <p>Single competition details</p>
    <p>Infos, Standing, Ranking, Prev/Next games: infos, games list, players list</p>
    <ul class="list-unstyled">
      <template v-for="game in games" :key="game.id">
        <li>
          <RouterLink
            :to="{
              name: 'competition-game',
              params: { competitionId: competition?.id, gameId: game?.id }
            }"
            >{{ game?.teams.join('|') }}</RouterLink
          >
        </li>
      </template>
    </ul>
  </div>
</template>
