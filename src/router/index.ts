import { createRouter, createWebHistory } from 'vue-router'
import FrontView from '../views/IndexView.vue'
import HomeView from '../views/HomeView.vue'
import CompetitionView from '../views/Competition/IndexView.vue'
import CompetitionDetailsView from '../views/Competition/DetailsView.vue'
import CompetitionGameDetailsView from '../views/Competition/GameDetailsView.vue'
import TeamsView from '../views/Teams/IndexView.vue'
import TeamsListView from '../views/Teams/ListView.vue'
import TeamDetailsView from '../views/Teams/DetailsView.vue'
import PlayersView from '../views/Players/IndexView.vue'
import PlayersListView from '../views/Players/ListView.vue'
import PlayerDetailsView from '../views/Players/DetailsView.vue'
import adminRoutes from './admin'

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
              path: '',
              name: 'competition',
              component: CompetitionDetailsView
            },
            {
              path: 'games/:gameId',
              name: 'competition-game',
              component: CompetitionGameDetailsView
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
          component: () => import('../views/AboutView.vue')
        }
      ]
    },
    {
      path: '/admin',
      component: () => import('../admin/IndexView.vue'),
      children: adminRoutes
    }
  ]
})

export default router
