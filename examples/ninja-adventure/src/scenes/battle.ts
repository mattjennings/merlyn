import { BattleCharacter } from '$lib/entities/BattleCharacter'
import Tilemap from '$lib/entities/Tilemap'
import tilemap from '$res/Tilemaps/battle.tmx'
import imgPlayer from '$res/Actor/Characters/GreenNinja/SpriteSheet.png'
import imgCyclops from '$res/Actor/Monsters/Cyclope/Cyclopes.png'
import { goToScene } from '$game'
import { FadeTransition } from 'merlyn'
import SvelteUI from '$lib/ui/SvelteUI'
import BattleUI from '$lib/ui/Battle.svelte'

export default class Battle extends ex.Scene {
  partyHasEntered = false
  runningAway = false

  ui?: SvelteUI

  heros: BattleCharacter[] = []
  enemies: BattleCharacter[] = []

  onInitialize(engine: ex.Engine) {
    const map = new Tilemap(tilemap, this)
    engine.add(map)
  }

  onActivate() {
    this.partyHasEntered = false

    this.heros = [
      new BattleCharacter({
        name: 'player-battle',
        x: 16 * 15,
        y: 16 * 3.5,
        facing: 'left',
        image: imgPlayer,
      }),
    ]

    this.enemies = [
      new BattleCharacter({
        x: 16,
        y: 16 * 3,
        facing: 'right',
        image: imgCyclops,
      }),
      new BattleCharacter({
        x: 16,
        y: 16 * 5,
        facing: 'right',
        image: imgCyclops,
      }),
    ]

    this.heros.forEach((actor) => this.engine.add(actor))
    this.enemies.forEach((actor) => this.engine.add(actor))
  }

  async runAway() {
    if (!this.runningAway) {
      await Promise.all(
        this.heros.map((hero) => hero.moveTo(ex.vec(32, 0), 300))
      )
      goToScene('world', {
        transition: new FadeTransition(),
      })
    }
  }

  onOutro() {
    if (this.ui) {
      this.engine.remove(this.ui)
    }
  }

  onDeactivate() {
    this.heros.forEach((actor) => this.engine.remove(actor))
    this.enemies.forEach((actor) => this.engine.remove(actor))

    if (this.ui) {
      this.engine.remove(this.ui)
    }
  }

  onIntro(progress: number) {
    if (!this.partyHasEntered && progress > 0.75) {
      this.heros.forEach((hero) => {
        hero.moveTo(ex.vec(-32, 0), 300)
      })
      this.partyHasEntered = true

      this.ui = new SvelteUI({
        component: BattleUI,
      })
      this.ui.svelteComponent.$on('flee', () => {
        this.runAway()
        this.engine.remove(this.ui!)
      })
      this.engine.add(this.ui)
    }
  }
}
