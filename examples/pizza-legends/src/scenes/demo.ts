import { Hero } from '$lib/entities/Hero'
import OverworldScene from '$lib/entities/OverworldScene'
import { gridToPx } from '$lib/util'
import { Character } from '$lib/entities/Character'

export default class Main extends OverworldScene {
  npcs = [
    // new Character({
    //   image: $res('characters/people/npc1.png'),
    //   pos: gridToPx(ex.vec(7, 9)),
    // }),
    new Character({
      image: $res('characters/people/npc2.png'),
      pos: gridToPx(ex.vec(3, 7)),
      // behaviour: [
      //   (self) => self.moveDistance('up', 1, { speed: 25 }),
      //   (self) => self.moveDistance('right', 1, { speed: 25 }),
      //   (self) => self.moveDistance('down', 1, { speed: 25 }),
      //   (self) => self.moveDistance('left', 1, { speed: 25 }),
      // ],
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

    // const hero = new Hero({
    //   pos: gridToPx(ex.vec(5, 6)),
    // })

    // engine.add(hero)
    // this.camera.addStrategy(new ex.LockCameraToActorStrategy(hero))
    this.npcs[0].moveDistance('left', 5, { cancelable: true })
  }
}
