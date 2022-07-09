import { coroutine } from 'merlyn'

export const GRID_SIZE = 16

export function wait(ms: number) {
  return coroutine(function* () {
    while (ms > 0) {
      const ev = yield
      ms -= ev.delta
    }
  })
}
// }
/**
 * Converts a pixel value to the nearest grid value
 */
export function gridToPx(vec: ex.Vector) {
  return new ex.Vector(
    Math.round(vec.x * GRID_SIZE),
    Math.round(vec.y * GRID_SIZE)
  )
}

/**
 * Converts a coordinate in pixels to grid coordinates
 */
export function pxToGrid(vec: ex.Vector) {
  return new ex.Vector(
    Math.floor(vec.x / GRID_SIZE),
    Math.floor(vec.y / GRID_SIZE)
  )
}

/**
 * Snaps the vector to the nearest grid coordinate
 */
export function snapToGrid(vec: ex.Vector) {
  return ex.vec(
    Math.round(vec.x / GRID_SIZE) * GRID_SIZE,
    Math.round(vec.y / GRID_SIZE) * GRID_SIZE
  )
}
