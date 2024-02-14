<script lang="ts" setup>
import { provide, type Ref } from 'vue'
import usePlayers from '@/composable/usePlayers'
import type { Player } from '@/types/players'
import { PlayersLibKey } from '@/types/symbols'
const { getRows: getPlayers } = usePlayers()
const playersLib = getPlayers() as Ref<Player[] | undefined>
provide(PlayersLibKey, playersLib)
</script>
<template>
  <template v-if="playersLib"> Loading players list... </template>
  <template v-else>
    <RouterView></RouterView>
  </template>
</template>
