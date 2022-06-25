import { goToScene } from '$game'
import Tilemap from '$lib/entities/Tilemap'
import { Player } from '$lib/Player'
import { BattleTransition } from '$lib/transitions/BattleTransition'
import tilemap from '$res/Tilemaps/world.tmx'
import { Scene } from 'merlyn'
import sndBattleIntro from '$res/Musics/battle-intro.wav'
import sndBattleLoop from '$res/Musics/battle-loop.wav'
import sndVillage from '$res/Musics/4 - Village.ogg'
import sndBattleStarted from '$res/Sounds/Game/Explosion4.wav'

import { playSong } from '$lib/sound/audio-manager'

export default class World extends Scene {
  player!: Player
  battleCounter = -1

  onInitialize(engine: ex.Engine) {
    const map = new Tilemap(tilemap, this)
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
    playSong(sndVillage)
  }

  startBattle() {
    sndBattleStarted.volume = 0.25
    sndBattleStarted.playbackRate = 0.4
    sndBattleStarted.play()

    playSong(sndBattleIntro, {
      pauseCurrent: true,
      loop: false,
      onComplete: () => {
        playSong(sndBattleLoop)
      },
    })

    goToScene('battle', {
      transition: new BattleTransition(),
    })
    this.resetBattleCounter()
  }

  resetBattleCounter() {
    const max = 100 //2000
    const min = 10 //500
    this.battleCounter = Math.floor(Math.random() * (max - min + 1)) + min
  }

  onIntro(progress: number) {}

  onOutro(progress: number) {}
}
