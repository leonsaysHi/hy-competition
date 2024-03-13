import { createRouter, createWebHistory } from 'vue-router'
import FrontView from '@/views/IndexView.vue'
import HomeView from '@/views/HomeView.vue'
import CompetitionView from '@/views/competition/IndexView.vue'
import CompetitionDetailsView from '@/views/competition/DetailsView.vue'
import CompetitionGameDetailsView from '@/views/competition/GameDetailsView.vue'
import CompetitionTeamDetailsView from '@/views/competition/TeamDetailsView.vue'
import CompetitionPlayerDetailsView from '@/views/competition/PlayerDetailsView.vue'
import TeamsView from '@/views/teams/IndexView.vue'
import TeamsListView from '@/views/teams/ListView.vue'
import TeamDetailsView from '@/views/teams/DetailsView.vue'
import PlayersView from '@/views/players/IndexView.vue'
import PlayersListView from '@/views/players/ListView.vue'
import PlayerDetailsView from '@/views/players/DetailsView.vue'
import adminRoutes from './admin'
import playByPlayRoutes from './play-by-play'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: FrontView,
      children: [
        {
          path: '',
          name: 'home',
          component: HomeView
        },
        {
          path: '/competition/:competitionId',
          component: CompetitionView,
          children: [
            {
              path: ':phase?',
              name: 'competition',
              component: CompetitionDetailsView
            },
            {
              path: 'game/:gameId',
              name: 'competition-game',
              component: CompetitionGameDetailsView
            },
            {
              path: 'team/:teamId',
              name: 'competition-team',
              component: CompetitionTeamDetailsView
            },
            {
              path: 'player/:playerId',
              name: 'competition-player',
              component: CompetitionPlayerDetailsView
            }
          ]
        },
        {
          path: '/teams',
          component: TeamsView,
          children: [
            {
              path: '',
              name: 'teams',
              component: TeamsListView
            },
            {
              path: ':teamId',
              name: 'team',
              component: TeamDetailsView
            }
          ]
        },
        {
          path: '/players',
          component: PlayersView,
          children: [
            {
              path: '',
              name: 'players',
              component: PlayersListView
            },
            {
              path: ':playerId',
              name: 'player',
              component: PlayerDetailsView
            }
          ]
        },
        {
          path: '/about',
          name: 'about',
          // route level code-splitting
          // this generates a separate chunk (About.[hash].js) for this route
          // which is lazy-loaded when the route is visited.
          component: () => import('@/views/AboutView.vue')
        }
      ]
    },
    {
      path: '/play-by-play',
      component: () => import('@/play-by-play/IndexView.vue'),
      children: playByPlayRoutes
    },
    {
      path: '/admin',
      component: () => import('@/admin/IndexView.vue'),
      children: adminRoutes
    }
  ]
})

export default router
