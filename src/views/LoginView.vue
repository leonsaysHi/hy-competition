<script setup lang="ts">
import ButtonComp from '@/components/ButtonComp.vue'
import useAuthentification from '@/composable/useAuthentification'
import { watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
const route = useRoute()
const router = useRouter()
const redirect = (route.query.redirect as string) || 'admin'
const { isAdmin, logIn } = useAuthentification()
const handleSignIn = () => logIn()

watchEffect(() => {
  if (isAdmin.value) {
    router.push({ name: redirect })
  }
})
</script>

<template>
  <div class="p-4 d-flex justify-content-center">
    <ButtonComp @click="handleSignIn"> Sign In with Google </ButtonComp>
  </div>
</template>
