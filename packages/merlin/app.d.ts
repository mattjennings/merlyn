/* eslint-disable @typescript-eslint/triple-slash-reference */
/// <reference types="vite/client" />
/// <reference path="./modules.d.ts" />

import type * as Excalibur from 'excalibur'

declare global {
  export const ex: typeof Excalibur
}
