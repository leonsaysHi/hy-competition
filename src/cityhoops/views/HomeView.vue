<script lang="ts" setup>
import ButtonComp from '@/components/ButtonComp.vue'
import SpinnerComp from '@/components/SpinnerComp.vue'
import useCompetitionsLib from '@/composable/useCompetitionsLib'
import type { Competition } from '@/types/competitions'
import { formatDistanceToNow } from 'date-fns'
import { computed, ref } from 'vue'
const { isReady, rows } = useCompetitionsLib()

const showPasts = ref(false)
const currentItems = computed(() => {
  return rows.value?.filter((row: Competition) => row.isActive && !row.isOver)
}) 


const previousSeasons = [
    { url: 'https://www.cityhoopspty.com/season1/', title: 'SEASON 1'  },
    { url: 'https://www.cityhoopspty.com/season2/', title: 'SEASON 2'  },
    { url: 'https://www.cityhoopspty.com/season3/', title: 'SEASON 3'  },
    { url: 'https://www.cityhoopspty.com/season4/', title: 'SEASON 4'  },
    { url: 'https://www.cityhoopspty.com/season4femenina/', title: 'SEASON 4', subtitle: 'Femenina'  },
    { url: 'https://www.cityhoopspty.com/season4categoriaabierta/', title: 'SEASON 4', subtitle: 'Categoría Abierta'  },
    { url: 'https://www.cityhoopspty.com/season5categoriaabierta', title: 'SEASON 5', subtitle: 'Categoría Abierta'  },
    { url: 'https://www.cityhoopspty.com/categoriadeacademiau18', title: 'SEASON 5', subtitle: 'Categoría Academia U18' }
  ].reverse()

const pastItems = computed(() => {
  const result = []
  result.push(...(rows.value?.filter((row: Competition) => row.isActive && row.isOver) || []))
  result.push(...previousSeasons)
  return result
}) 

</script>
<template>
  <div>
    <template v-if="!isReady">
      <SpinnerComp />
    </template>
    <template v-else>
      
      <h2>{{ $t('home.titleCurrents') }}</h2>
      <template v-if="!currentItems?.length">
        <p>Ningun liga ahora.</p>
      </template>
      <template v-else>
        <div class="row row-cols-1 row-cols-lg-2 g-2">
          <template v-for="row in currentItems" :key="row.id">
            <div class="col">
              <div class="card h-100 text-bg-primary border-dark">
                <div class="card-body">
                  <h3 class="card-title">{{ row.title }}</h3>
                  <RouterLink
                    :to="{ name: 'competition', params: { competitionId: row.id } }"
                    class="stretched-link btn btn-light stretched-link"
                    >{{ $t('cta.view') }}</RouterLink
                  >
                </div>
                <div class="card-footer">
                  <small class="text-body-secondary"
                    >{{ $t('home.lastUpdate') }} {{ formatDistanceToNow(row.lastUpdate) }}</small
                  >
                </div>
              </div>
            </div>
          </template>
        </div>
      </template>

      <template v-if="!showPasts && pastItems?.length">
        <div class="d-flex flex-column flex-md-row">
          <ButtonComp class="mt-4 border d-flex gap-3 justify-content-between" variant="light" block @click="showPasts = true"><span>{{ $t('home.showPasts') }}</span><i class="bi bi-chevron-down"></i></ButtonComp>
        </div>
      </template>
      <template v-if="showPasts">
        <h5 class="mt-4">{{ $t('home.titlePasts') }}</h5>
        <template v-if="!pastItems?.length">
          <p>Ningun liga pasada.</p>
        </template>
        <template v-else>
          <div class="row row-cols-1 row-cols-md-2 row-cols-md-3 g-2">
            <template v-for="row in pastItems" :key="row.id">
              <div class="col">
                <div class="card h-100">
                  <div class="card-body">
                    <h6 class="card-title">{{ row.title }}</h6>
                    <template v-if="row.subtitle"><p class="card-text">{{ row.subtitle }}</p></template>
                    <template v-if="row.id">
                      <RouterLink
                        :to="{ name: 'competition', params: { competitionId: row.id } }"
                        class="stretched-link btn btn-primary stretched-link"
                        >{{ $t('cta.view') }}</RouterLink>
                    </template>
                    <template v-else>
                      <a class="btn btn-primary stretched-link" :href="row.url" target="_blank"
                      >{{ $t('cta.view') }}</a>
                    </template>
                  </div>
                  <div class="card-footer">
                    <template v-if="row.id">
                      <small class="text-body-secondary"
                        >{{ $t('home.lastUpdate') }} {{ formatDistanceToNow(row.lastUpdate) }}</small
                      >
                    </template>
                    <template v-else>
                      <small class="text-body-secondary"
                        >-</small
                      >
                    </template>
                  </div>
                </div>
              </div>
            </template>
          </div>
        </template>
      </template>

    </template>
  </div>
</template>
