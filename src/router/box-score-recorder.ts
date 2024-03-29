const adminRoutes = [
  {
    path: 'competition/:competitionId/game/:gameId',
    name: 'box-score-record',
    component: () => import('@/box-score-recorder/GameInput.vue')
  }
]

export default adminRoutes
