const adminRoutes = [
  {
    path: 'competition/:competitionId/game/:gameId',
    name: 'box-score-record',
    component: () => import('@/box-score/GameInput.vue')
  }
]

export default adminRoutes
