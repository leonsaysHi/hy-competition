<script lang="ts" setup>
import SpinnerComp from '@/components/SpinnerComp.vue';
import useTeamsLib from '@/composable/useTeamsLib'

const { isReady } = useTeamsLib()
</script>
<template>
  <template v-if="!isReady"><SpinnerComp /></template>
  <template v-else>
    <RouterView></RouterView>
  </template>
</template>
@/composable/useTeamsLib