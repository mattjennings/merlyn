/* eslint-disable @typescript-eslint/triple-slash-reference */
/// <reference types="vite/client" />

import type * as Excalibur from 'excalibur'
import { Transition } from './dist'

declare global {
  export const ex: typeof Excalibur
}

declare module 'excalibur' {
  export interface Scene {
    isTransitioning?: boolean
    transition?(): Transition | void

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
