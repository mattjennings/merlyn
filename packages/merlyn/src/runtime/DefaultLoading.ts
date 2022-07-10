export default class DefaultLoading extends ex.Scene {
  label!: ex.Label

  onInitialize(engine: ex.Engine) {
    this.label = new ex.Label({
      text: 'Loading...',
      x: engine.drawWidth / 2,
      y: engine.drawHeight / 2,
      font: new ex.Font({
        textAlign: ex.TextAlign.Center,
        size: engine.drawWidth / 10,
        unit: ex.FontUnit.Px,
        color: ex.Color.White,
        quality: 2,
      }),
      z: Infinity,
    })

    engine.add(this.label)
  }

  onActivate() {
    this.label.graphics.opacity = 0

    setTimeout(() => {
      this.label.actions.fade(1, 500)
    }, 1000)
  }

  onLoad(progress: number) {
    this.label.text = `Loading... ${Math.floor(progress)}%`
  }
}
