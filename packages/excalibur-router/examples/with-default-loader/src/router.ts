import { Router } from 'excalibur-router'
import Level1 from './level1'

export const router = new Router({
  routes: {
    level1: () => import('./level1'),
    level2: () => import('./level2'),
  },
})
