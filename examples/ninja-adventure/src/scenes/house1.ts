import Overworld from '$lib/scenes/Overworld'

export default class House1 extends Overworld {
  constructor() {
    super({
      map: $res('Tilemaps/house1.tmx'),
    })
  }
}
