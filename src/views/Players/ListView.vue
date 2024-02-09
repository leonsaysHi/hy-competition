<script lang="ts" setup>
import { inject } from 'vue'
const players = inject('players')
</script>
<template>
  <div>
    <h1>Players home</h1>
    <p>All players list</p>
    <p>Infos, awards</p>
    <ul class="list-unstyled">
      <template v-for="row in players" :key="row.id">
        <li>
          <RouterLink :to="{ name: 'player', params: { playerId: row.id } }"
            >{{ row.fname }}{{ row.lname }}</RouterLink
          >
        </li>
      </template>
    </ul>
  </div>
</template>
