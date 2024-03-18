<template>
    <div>
        <RouterLink
        class="btn btn-primary btn-sm"
        :to="{ name: 'play-by-play', params: { competitionId, gameId } }"
        >Play-by-play</RouterLink>
    </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()
const { competitionId, gameId } = route.params


</script>

<style scoped lang="scss">

</style>
