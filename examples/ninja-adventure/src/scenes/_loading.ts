import { loader } from '$game'
import { Engine, Scene } from 'excalibur'
import { LoadingScene } from '@mattjennings/merlin'

export default class Loading extends LoadingScene {
  onInitialize(engine: Engine): void {
    const center = new ex.Vector(engine.drawWidth / 2, engine.drawHeight / 2)

    engine.add(
      new ex.Actor({
        x: 0,
        y: 0,
        width: engine.canvasWidth,
        height: engine.canvasHeight,
        color: new ex.Color(50, 50, 50),
      })
    )

    engine.add(
      new ex.Label({
        x: center.x,
        y: center.y,
        text: 'Loading...',
        font: new ex.Font({
          textAlign: ex.TextAlign.Center,
          size: 32,
          unit: ex.FontUnit.Px,
          color: ex.Color.White,
          quality: 2,
        }),
      })
    )
  }

  onLoadStart() {
    console.log('start')
  }

  onLoadProgress(progress: number) {
    console.log('progress', progress)
  }

  onLoadComplete() {
    console.log('complete')
  }
}
