import { TiledMapResource } from '@excaliburjs/plugin-tiled'
console.log(TiledMapResource)

const engine = new ex.Engine({
  backgroundColor: ex.Color.fromHex('#5fcde4'),
  width: 600,
  height: 400,
  // Turn off anti-aliasing for pixel art graphics
  antialiasing: false,
})

// Set global gravity, 800 pixels/sec^2
ex.Physics.acc = new ex.Vector(0, 800)

// Game events to handle
engine.on('hidden', () => {
  console.log('pause')
  engine.stop()
})
engine.on('visible', () => {
  console.log('start')
  engine.start()
})

export const loader = new ex.Loader()

export default engine
