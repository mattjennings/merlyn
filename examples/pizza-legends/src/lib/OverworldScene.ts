import { Character } from './Character'
import { Image } from './Image'
import { gridToPx, GRID_SIZE } from './util'

export interface OverworldSceneArgs {
  map: {
    lower: ex.ImageSource
    upper: ex.ImageSource

    /**
     * If either x or y is an array it will be treated as a range of [start, end].
     */
    walls: Array<{
      x: number | number[]
      y: number | number[]
    }>
  }
}

export default class OverworldScene extends ex.Scene {
  npcs: Character[] = []

  map: {
    lower: Image
    upper: Image
    walls: ex.Actor[]
  }

  constructor({ map }: OverworldSceneArgs) {
    super()

    this.map = {
      // add lower/upper images of the map
      lower: new Image({
        x: 0,
        y: 0,
        anchor: ex.vec(0, 0),
        src: map.lower,
        z: -100,
      }),
      upper: new Image({
        x: 0,
        y: 0,
        anchor: ex.vec(0, 0),
        src: map.upper,
        z: 100,
      }),

      // create colliders for each wall
      walls: map.walls.flatMap((coords) => {
        const getUpperBounds = (value: number | number[]) =>
          Array.isArray(value) ? value[1] : value
        const getLowerBounds = (value: number | number[]) =>
          Array.isArray(value) ? value[0] : value

        const walls: ex.Actor[] = []

        for (
          let x = getLowerBounds(coords.x);
          x <= getUpperBounds(coords.x);
          x++
        ) {
          for (
            let y = getLowerBounds(coords.y);
            y <= getUpperBounds(coords.y);
            y++
          ) {
            walls.push(
              new ex.Actor({
                pos: gridToPx(ex.vec(x, y)),
                width: GRID_SIZE,
                height: GRID_SIZE,
                anchor: ex.vec(0, 0),
                collisionType: ex.CollisionType.Fixed,
              })
            )
          }
        }

        return walls
      }),
    }
  }

  onInitialize(engine: ex.Engine) {
    engine.add(this.map.lower)
    engine.add(this.map.upper)
    this.map.walls.forEach((wall) => engine.add(wall))
    this.npcs.forEach((npc) => engine.add(npc))
  }
}
