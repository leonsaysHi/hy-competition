<script lang="ts" setup>
import usePlayersLib from '@/composable/usePlayersLib'
const { rows: playersLib } = usePlayersLib()
</script>
<template>
  <div>
    <h1>Players home</h1>
    <p>All players list</p>
    <p>Infos, awards</p>
    <ul class="list-unstyled">
      <template v-for="row in playersLib" :key="row.id">
        <li>
          <RouterLink :to="{ name: 'player', params: { playerId: row.id } }"
            >{{ row.fname }}{{ row.lname }}</RouterLink
          >
        </li>
      </template>
    </ul>
  </div>
</template>
