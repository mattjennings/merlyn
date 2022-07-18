import { Router } from 'excalibur-router'
import BootLoader from './loaders/boot'
import DefaultLoader from './loaders/default'

export const router = new Router({
  routes: {
    level1: () => import('./routes/level1'),
    level2: () => import('./routes/level2'),
  },
  loaders: {
    boot: BootLoader,
    default: DefaultLoader,
  },
})
