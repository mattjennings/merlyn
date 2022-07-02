import { Hero } from '$lib/Hero'
import OverworldScene from '$lib/OverworldScene'
import { gridToPx } from '$lib/util'
import { Character } from '$lib/Character'

export default class Main extends OverworldScene {
  npcs = [
    new Character({
      pos: gridToPx(ex.vec(7, 9)),
      image: $res('characters/people/npc1.png'),
      behaviour: [
        { type: 'stand', direction: 'left', time: 800 },
        { type: 'stand', direction: 'up', time: 1200 },
        { type: 'stand', direction: 'down', time: 300 },
        { type: 'stand', direction: 'right', time: 1200 },
      ],
    }),
    new Character({
      pos: gridToPx(ex.vec(3, 7)),
      image: $res('characters/people/npc2.png'),
      behaviour: [
        { type: 'walk', direction: 'left' },
        { type: 'stand', direction: 'up', time: 800 },
        { type: 'walk', direction: 'up' },
        { type: 'walk', direction: 'right' },
        { type: 'walk', direction: 'down' },
      ],
    }),
  ]

  constructor() {
    super({
      map: {
        lower: $res('maps/DemoLower.png'),
        upper: $res('maps/DemoUpper.png'),
        walls: [
          // objects
          {
            x: [7, 8],
            y: [6, 7],
          },
          // edge of map
          {
            x: [1, 10],
            y: 3,
          },
          {
            x: 6,
            y: 4,
          },
          {
            x: 8,
            y: 4,
          },
          {
            x: 11,
            y: [4, 9],
          },
          {
            x: [1, 4],
            y: 10,
          },
          {
            x: [6, 10],
            y: 10,
          },
          {
            x: 0,
            y: [4, 10],
          },
        ],
      },
    })
  }

  onInitialize(engine: ex.Engine) {
    super.onInitialize(engine)

    const hero = new Hero({
      pos: gridToPx(ex.vec(5, 6)),
    })

    engine.add(hero)
    this.camera.addStrategy(new ex.LockCameraToActorStrategy(hero))
  }
}
