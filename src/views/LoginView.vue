<script setup lang="ts">
import ButtonComp from '@/components/ButtonComp.vue'
import useAuthentification from '@/composable/useAuthentification'
import { ref, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
const route = useRoute()
const router = useRouter()
const redirect = (route.query.redirect as string) || 'admin'
const { isAdmin, logIn } = useAuthentification()
const error = ref()
const handleSignIn = () => {try { logIn() } catch (err) { error.value = err}}

watchEffect(() => {
  if (isAdmin.value) {
    router.push({ name: redirect })
  }
})
</script>

<template>
  <div class="p-4 d-flex justify-content-center">
    <ButtonComp @click="handleSignIn"> Sign In with Google </ButtonComp>
    <template v-if="error"><p class="text-danger">{{ error }}</p></template>
  </div>
</template>
