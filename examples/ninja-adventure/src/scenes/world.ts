import { router } from '$game'
import Tilemap from '$lib/entities/Tilemap'
import type { Player } from '$lib/Player'
import { BattleTransition } from '$lib/transitions/BattleTransition'
import { Cyclops } from '$lib/entities/battle/enemies/Cyclops'
import { Slime } from '$lib/entities/battle/enemies/Slime'

import { playSong } from '$lib/sound/audio-manager'

export default class World extends ex.Scene {
  player!: Player
  battleCounter = -1

  onInitialize(engine: ex.Engine) {
    const map = new Tilemap($res('Tilemaps/world.tmx'), this)
    engine.add(map)

    this.resetBattleCounter()
    map.once('initialize', () => {
      this.player = this.actors.find((p) => p.name === 'player') as Player

      this.player.on('move', () => {
        this.battleCounter--
        if (this.battleCounter <= 0) {
          this.startBattle()
        }
      })
    })
  }

  onActivate() {
    playSong($res('Musics/village.mp3'))
  }

  startBattle() {
    const sndBattleStarted = $res('Sounds/Game/Explosion4.wav')

    sndBattleStarted.playbackRate = 0.4
    sndBattleStarted.play(0.25)

    playSong($res('Musics/battle-intro.mp3'), {
      pauseCurrent: true,
      loop: false,
      onComplete: () => {
        playSong($res('Musics/battle-loop.mp3'))
      },
    })

    const groups = [
      [
        new Cyclops({
          x: 16,
          y: 16 * 3,
        }),
        new Cyclops({
          x: 16,
          y: 16 * 5,
        }),
      ],
      [
        new Cyclops({
          x: 16,
          y: 16 * 4,
        }),
      ],
      [
        new Slime({
          x: 16,
          y: 16 * 4,
        }),
      ],
      [
        new Slime({
          x: 16,
          y: 16 * 3,
        }),
        new Cyclops({
          x: 16,
          y: 16 * 5,
        }),
      ],
    ]

    router.goto('battle', {
      data: {
        // choose from groups at random
        enemies: groups[Math.floor(Math.random() * groups.length)],
      },
      transition: new BattleTransition(),
    })
    this.resetBattleCounter()
  }

  resetBattleCounter() {
    const max = 750
    const min = 250
    this.battleCounter = Math.floor(Math.random() * (max - min + 1)) + min
  }

  onIntro(progress: number) {}

  onOutro(progress: number) {}
}
