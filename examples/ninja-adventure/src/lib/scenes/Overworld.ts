import type { CharacterArgs } from '$lib/entities/Character'
import TilemapObjects from '$lib/entities/TilemapObjects'
import { Player } from '$lib/Player'
import type { TiledMapResource } from '@excaliburjs/plugin-tiled'

export interface OverworldArgs {
  map: TiledMapResource
}
export default class Overworld extends ex.Scene<{
  player?: Partial<CharacterArgs>
}> {
  map: TiledMapResource

  constructor(args: OverworldArgs) {
    super()
    this.map = args.map

    this.on('initialize', ({ engine }) => {
      this.map.addTiledMapToScene(this)
      const objects = new TilemapObjects(this.map, this)

      engine.add(objects)
      objects.once('initialize', () => {
        this.emit('tilemap-initialized', undefined)
      })

      const tilemapWidth = this.map.data.width * this.map.data.tileWidth
      const tilemapHeight = this.map.data.height * this.map.data.tileHeight

      // create world bounds
      engine.add(
        new ex.Actor({
          collisionType: ex.CollisionType.Fixed,
          collider: new ex.CompositeCollider([
            new ex.EdgeCollider({
              begin: ex.vec(0, 0),
              end: ex.vec(0, tilemapHeight),
            }),
            new ex.EdgeCollider({
              begin: ex.vec(0, tilemapHeight),
              end: ex.vec(tilemapWidth, tilemapHeight),
            }),
            new ex.EdgeCollider({
              begin: ex.vec(tilemapWidth, tilemapHeight),
              end: ex.vec(tilemapWidth, 0),
            }),
            new ex.EdgeCollider({
              begin: ex.vec(tilemapWidth, 0),
              end: ex.vec(0, 0),
            }),
          ]),
        })
      )
    })

    this.on('activate', ({ context }) => {
      const data = context.data as unknown as {
        player?: Pick<CharacterArgs, 'x' | 'y' | 'facing'>
      }

      if (data?.player) {
        let player = this.actors.find(
          (actor) => actor.name === 'player'
        ) as Player

        if (!player) {
          player = new Player({
            ...data.player,
          })
          this.add(player)
        } else {
          if (data.player.x !== undefined && data.player.y !== undefined) {
            player.pos = new ex.Vector(data.player.x, data.player.y)
          }
          player.updateFacing(data.player.facing)
        }
      }
    })
  }
}
