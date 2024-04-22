<script setup lang="ts">
import HeroBg from '@/cityhoops/assets/hero-bg.webp'
console.log(HeroBg)
const styleObj = {
  backgroundImage: `url(${HeroBg})`,
  backgroundSize: 'cover',
  backgroundPosition: '0 35%',
  backgroundBlendMode: 'difference'
}
</script>

<template>
  <div 
    class="p-5 mb-4 bg-dark text-white d-flex justify-content-between rounded-3"
    :style="styleObj"
  >
    <div class="pb-5"><slot></slot></div>
    <div><slot name="nav"></slot></div>
  </div>
</template>
