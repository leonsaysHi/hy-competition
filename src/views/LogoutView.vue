<script setup lang="ts">
import SpinnerComp from '@/components/SpinnerComp.vue';
import useAuthentification from '@/composable/useAuthentification'
import { watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
const route = useRoute()
const router = useRouter()
const redirect = (route.query.redirect as string) || 'home'
const { isAdmin, logOut } = useAuthentification()

watchEffect(async () => {
  if (!isAdmin.value) {
    router.push({ name: redirect })
  } else {
    await logOut()
  }
})
</script>

<template>
  <div class="vstack gap-2 align-items-center">
    <SpinnerComp />
    Logging out...
    </div>
</template>
