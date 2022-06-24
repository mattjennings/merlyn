/* eslint-disable @typescript-eslint/triple-slash-reference */
/// <reference types="vite/client" />

import type * as Excalibur from 'excalibur'

declare global {
  export const ex: typeof Excalibur
}

declare module 'excalibur' {
  export interface Scene {
    isTransitioning?: boolean

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
