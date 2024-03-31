const adminRoutes = [
  {
    path: '',
    name: 'admin',
    component: () => import('@/admin/dashboard/IndexView.vue')
  },
  {
    path: 'teams',
    name: 'admin-teams',
    component: () => import('@/admin/teams/ListView.vue')
  },
  {
    path: 'players',
    name: 'admin-players',
    component: () => import('@/admin/players/ListView.vue')
  },
  {
    path: 'competition/:competitionId',
    name: 'admin-competition-home',
    redirect: { name: 'admin-competition-games' },
    component: () => import('@/admin/competition/IndexView.vue'),
    children: [
      {
        path: 'edit',
        name: 'admin-competition-configuration',
        component: () => import('@/admin/competition/FormView.vue')
      },
      {
        path: 'phases',
        component: () => import('@/admin/competition/phases/IndexView.vue'),
        children: [
          {
            path: '',
            name: 'admin-competition-phases',
            component: () => import('@/admin/competition/phases/ListView.vue')
          },
          {
            path: 'edit',
            name: 'admin-competition-edit-phase',
            component: () => import('@/admin/competition/phases/FormView.vue')
          }
        ]
      },
      {
        path: 'games',
        component: () => import('@/admin/competition/games/IndexView.vue'),
        children: [
          {
            path: '',
            name: 'admin-competition-games',
            component: () => import('@/admin/competition/games/ListView.vue')
          },
          {
            path: 'edit/:gameId',
            name: 'admin-competition-edit-game',
            component: () => import('@/admin/competition/games/FormView.vue')
          }
        ]
      },
      {
        path: 'teams',
        component: () => import('@/admin/competition/teams/IndexView.vue'),
        children: [
          {
            path: '',
            name: 'admin-competition-teams',
            component: () => import('@/admin/competition/teams/ListView.vue')
          },
          {
            path: 'edit/:teamId',
            name: 'admin-competition-edit-team',
            component: () => import('@/admin/competition/teams/FormView.vue')
          }
        ]
      }
    ]
  }
]

export default adminRoutes
