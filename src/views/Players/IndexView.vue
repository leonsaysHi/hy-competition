<script lang="ts" setup>
import { provide, type Ref } from 'vue'
import usePlayers from '@/composable/usePlayers'
import type { Player } from '@/types/players'
import { PlayersKey } from '@/types/symbols'
const { getRows: getPlayers } = usePlayers()
const players = getPlayers() as Ref<Player[] | undefined>
provide(PlayersKey, players)
</script>
<template>
  <template v-if="!Array.isArray(players)"> Loading players list... </template>
  <template v-else>
    <RouterView></RouterView>
  </template>
</template>
