<script lang="ts" setup>
import { usePlayers } from '@/stores/players'
import { provide } from 'vue'
const players = usePlayers()
provide('players', players)
</script>
<template>
  <template v-if="!Array.isArray(players)"> Loading players list... </template>
  <template v-else>
    <RouterView></RouterView>
  </template>
</template>
