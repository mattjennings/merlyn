export default class Loading extends ex.Scene {
  label!: ex.Label

  onInitialize(engine: ex.Engine) {
    this.label = new ex.Label({
      text: 'Loading...',
      x: engine.drawWidth / 2,
      y: engine.drawHeight / 2,
      font: new ex.Font({
        textAlign: ex.TextAlign.Center,
        family: 'Luminari',
        size: 64,
        unit: ex.FontUnit.Px,
        color: ex.Color.White,
        quality: 2,
      }),
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
    this.label.text = `Loading... ${Math.floor(progress * 100)}%`
  }
}
