import type * as Excalibur from 'excalibur'

// for some reason, this fixes module augmentation from replacing excalibur
// instead of merging
declare global {
  export type ex = typeof Excalibur
}

declare module 'excalibur' {
  export interface Scene {
    isTransitioning?: boolean
    transition?: Transition

    onIntroStart?(): void
    onIntro?(progress: number): void
    onIntroComplete?(): void

    onOutroStart?(): void
    onOutro?(progress: number): void
    onOutroComplete?(): void

    onLoadStart?(): void
    onLoad?(progress: number): void
    onLoadComplete?(): void
  }
}
