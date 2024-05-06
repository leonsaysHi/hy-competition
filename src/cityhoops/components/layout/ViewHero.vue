<script setup lang="ts">
import HeroBg from '@/cityhoops/assets/hero-bg.png'
const styleObj = {
  backgroundImage: `url(${HeroBg})`
}
</script>

<template>
  <div
    class="hero p-5 mb-4 bg-black text-white d-flex flex-column flex-lg-row justify-content-between rounded-3"
    :style="styleObj"
  >
    <div class="pb-5"><slot></slot></div>
    <div><slot name="nav"></slot></div>
  </div>
</template>
