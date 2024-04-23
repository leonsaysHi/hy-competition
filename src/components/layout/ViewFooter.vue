<script setup lang="ts">
import ImageComp from '@/components/ImageComp.vue'
import { useI18n } from 'vue-i18n'
import HoopsYardLogo from '@/assets/images/hoops-yard.png'

const { t } = useI18n()
</script>

<template>
    <footer class="text-body-secondary py-4 border-top">
      <div class="container-xl d-flex flex-row-reverse justify-content-between">
        <a href="#">{{ t('global.backToTop') }}</a>
        <p class="mb-0">
          Powered by <ImageComp :src="HoopsYardLogo" title="Hoops Yard" :width="35" />
        </p>
      </div>
    </footer>
</template>