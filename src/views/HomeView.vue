<script lang="ts" setup>
import { useActiveCompetitions } from '@/stores/competitions'
const rows = useActiveCompetitions()
</script>
<template>
  <div>
    <h1>Organization home</h1>
    <h4>All competitions list:</h4>
    <p>Infos, competitions list w/ rank</p>
    <ul class="list-unstyled">
      <template v-for="row in rows" :key="row.id">
        <li>
          <RouterLink :to="{ name: 'competition', params: { competitionId: row.id } }">{{
            row.title
          }}</RouterLink>
        </li>
      </template>
    </ul>
  </div>
</template>
