<script lang="ts" setup>
import { inject } from 'vue'
import { CompetitionKey, GamesKey } from '@/types/symbols'
const row = inject(CompetitionKey)
const games = inject(GamesKey)
</script>
<template>
  <div>
    <h1>{{ row?.title }}</h1>
    <p>Single competition details</p>
    <p>
      {{ row }}
    </p>
    <h5>Games</h5>
    <ul class="list-group list-group-flush">
      <template v-for="game in games" :key="game.id">
        <li class="list-group-item">
          <RouterLink
            :to="{
              name: 'competition-game',
              params: { competitionId: row?.id, gameId: game?.id }
            }"
            >{{ game?.teams.join('|') }}</RouterLink
          >
        </li>
      </template>
    </ul>
  </div>
</template>
