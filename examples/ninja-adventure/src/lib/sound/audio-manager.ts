import { WebAudio } from 'excalibur'

let currentSong: ex.Sound | null = null
let isLooping = false

export const playSong = async (
  song: ex.Sound,
  opts: {
    pauseCurrent?: boolean
    loop?: boolean
    onComplete?: () => void
  } = {}
) => {
  const { loop = true, pauseCurrent } = opts
  if (currentSong !== song) {
    if (currentSong) {
      if (pauseCurrent) {
        currentSong.pause()
      } else {
        currentSong.stop()
      }
    }

    currentSong = song
    isLooping = loop
    song.play()
    if (loop) {
      song.loop = true
    }

    if (opts?.onComplete) {
      song.once('playbackend', opts.onComplete)
    }
  }
}

export const stopSong = () => {
  if (currentSong) {
    currentSong.loop = false
    currentSong.stop()
  }
}

window.addEventListener('pointerdown', () => {
  if (!WebAudio.isUnlocked()) {
    WebAudio.unlock()
    if (currentSong) {
      currentSong.loop = isLooping
      playSong(currentSong)
    }
  }
})
