<script lang="ts" setup>
import { inject } from 'vue'
const players = inject('players')
</script>
<template>
  <div>
    <h1>Players home</h1>
    <p>All players list:</p>
    <ul>
      <template v-for="row in players" :key="row.id">
        <li>{{ row.fname }}{{ row.lname }}</li>
      </template>
    </ul>
  </div>
</template>
