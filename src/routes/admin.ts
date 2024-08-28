const adminRoutes = [
  {
    path: '',
    name: 'admin',
    component: () => import('@/admin/Dashboard/IndexView.vue')
  },
  {
    path: 'teams',
    name: 'admin-teams',
    component: () => import('@/admin/Teams/ListView.vue')
  },
  {
    path: 'players',
    name: 'admin-players',
    component: () => import('@/admin/Players/ListView.vue')
  },
  {
    path: 'competition/:competitionId',
    name: 'admin-competition-home',
    redirect: { name: 'admin-competition-games' },
    component: () => import('@/admin/Competitions/IndexView.vue'),
    children: [
      {
        path: 'edit',
        name: 'admin-competition-configuration',
        component: () => import('@/admin/Competitions/FormView.vue')
      },
      {
        path: 'phases',
        component: () => import('@/admin/Competitions/phases/IndexView.vue'),
        children: [
          {
            path: '',
            name: 'admin-competition-phases',
            component: () => import('@/admin/Competitions/phases/ListView.vue')
          },
          {
            path: 'edit/:phaseIdx?',
            name: 'admin-competition-edit-phase',
            component: () => import('@/admin/Competitions/phases/FormView.vue')
          }
        ]
      },
      {
        path: 'games',
        component: () => import('@/admin/Competitions/games/IndexView.vue'),
        children: [
          {
            path: '',
            name: 'admin-competition-games',
            component: () => import('@/admin/Competitions/games/ListView.vue')
          },
          {
            path: 'edit/:gameId',
            name: 'admin-competition-edit-game',
            component: () => import('@/admin/Competitions/games/FormView.vue')
          }
        ]
      },
      {
        path: 'teams',
        component: () => import('@/admin/Competitions/teams/IndexView.vue'),
        children: [
          {
            path: '',
            name: 'admin-competition-teams',
            component: () => import('@/admin/Competitions/teams/ListView.vue')
          },
          {
            path: 'edit/:teamId',
            name: 'admin-competition-edit-team',
            component: () => import('@/admin/Competitions/teams/FormView.vue')
          }
        ]
      }
    ]
  }
]

export default adminRoutes
