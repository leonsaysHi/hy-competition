<script lang="ts" setup>
import { GamesKey } from '@/types/symbols'
import type { Game } from '@/types/games'
import type { Ref } from 'vue'
import { inject, computed } from 'vue'
const games = inject(GamesKey) as Ref<Game[]>

import { useRoute } from 'vue-router'

const route = useRoute()
const { gameId } = route.params
const row = computed(() => games.value.find((r) => r.id === gameId))
</script>
<template>
  <div>
    <h1>Game home</h1>
    <p>Single competition game details</p>
    <p>
      {{ row }}
    </p>
  </div>
</template>
