<script lang="ts" setup>
import SpinnerComp from '@/components/SpinnerComp.vue'
import usePlayersLib from '@/composable/usePlayersLib'
const { isReady } = usePlayersLib()
</script>
<template>
  <template v-if="!isReady"><SpinnerComp /></template>
  <template v-else>
    <RouterView></RouterView>
  </template>
</template>
