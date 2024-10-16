<script lang="ts" setup>
import ButtonComp from '@/components/ButtonComp.vue'
import SpinnerComp from '@/components/SpinnerComp.vue'
import useCompetitionsLib from '@/composable/useCompetitionsLib'
import useOptionsLib from '@/composable/useOptionsLib'
import type { Competition } from '@/types/competitions'
import { formatDistanceToNow } from 'date-fns'
import { computed, ref } from 'vue'
const { isReady, rows } = useCompetitionsLib()
const { getGender, getCategory } = useOptionsLib()

const showPasts = ref(false)
const activeItems = computed(() => rows.value?.filter((row: Competition) => row.isActive) || [])
const currentItems = computed(() => {
  const currentItems = activeItems.value.filter((row: Competition) => !row.isOver)
  return currentItems.length 
    ? currentItems
    : activeItems.value.slice(0, 1)
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
  result.push(...activeItems.value.slice(activeItems.value.length - 1))
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
      
      <h2>{{ $t('home.currentItems', currentItems?.length || 0) }}:</h2>
      <template v-if="!currentItems?.length">
        <p>{{ $t('home.noItem') }}.</p>
      </template>
      <template v-else>
        <div class="row row-cols-1 row-cols-lg-2 g-2">
          <template v-for="row in currentItems" :key="row.id">
            <div class="col">
              <div class="card h-100  border-dark">
                <div class="card-body">
                  <h3 class="card-title">{{ row.title }}</h3>
                  <h6 class="card-subtitle mb-3">{{ getGender(row?.gender)?.long }} - {{ getCategory(row?.category)?.text }}</h6>
                  <RouterLink
                    :to="{ name: 'competition', params: { competitionId: row.id } }"
                    class="stretched-link btn btn-primary border-dark stretched-link"
                    >{{ $t('cta.view') }}</RouterLink
                  >
                </div>
                <div class="card-footer text-bg-primary border-dark">
                  <small>{{ $t('home.lastUpdate') }} {{ formatDistanceToNow(row.lastUpdate) }}</small>
                </div>
              </div>
            </div>
          </template>
        </div>
      </template>

      <template v-if="!showPasts && pastItems?.length">
        <div class="d-flex flex-column flex-md-row">
          <ButtonComp class="mt-4 border d-flex gap-3 justify-content-between" variant="light" block @click="showPasts = true"><span>{{ $t('home.pastItems') }}</span><i class="bi bi-chevron-down"></i></ButtonComp>
        </div>
      </template>
      <template v-if="showPasts">
        <h5 class="mt-4">{{ $t('home.pastItems') }}:</h5>
        <template v-if="!pastItems?.length">
          <p>{{ $t('home.noItem') }}.</p>
        </template>
        <template v-else>
          <div class="row row-cols-1 row-cols-md-2 row-cols-md-3 g-2">
            <template v-for="row in pastItems" :key="row.id">
              <div class="col">
                <div class="card h-100">
                  <div class="card-body d-flex flex-column align-items-start">
                    <template v-if="row.id">
                      <div class="flex-grow-1">
                        <h6 class="card-title">{{ row.title }}</h6>
                        <p class="card-subtitle mb-2">{{ getGender(row?.gender)?.long }} - {{ getCategory(row?.category)?.text }}</p>
                      </div>
                      <RouterLink
                        :to="{ name: 'competition', params: { competitionId: row.id } }"
                        class="stretched-link btn btn-primary stretched-link"
                        >{{ $t('cta.view') }}</RouterLink>
                    </template>
                    <template v-else>
                      <div class="flex-grow-1">
                        <h6 class="card-title">{{ row.title }}</h6>
                        <p class="card-subtitle mb-2">{{ row.subtitle }}</p>
                      </div>
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
