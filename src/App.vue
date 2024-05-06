<script setup lang="ts">
import { RouterView } from 'vue-router'
import useAuthentification from './composable/useAuthentification'
const { user } = useAuthentification()
console.log(user)
</script>

<template>
  <RouterView />
</template>
