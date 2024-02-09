<script lang="ts" setup>
import { inject } from 'vue'
const teams = inject('teams')
</script>
<template>
  <div>
    <h1>Teams home</h1>
    <p>All teams list:</p>
    <p>Infos, current competitions, gp/wins, top3 rankings</p>
    <ul class="list-unstyled">
      <template v-for="row in teams" :key="row.id">
        <li>
          <RouterLink :to="{ name: 'team', params: { teamId: row.id } }">{{
            row.title
          }}</RouterLink>
        </li>
      </template>
    </ul>
  </div>
</template>
