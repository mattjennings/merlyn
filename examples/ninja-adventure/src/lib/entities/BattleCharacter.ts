import { Character, type CharacterArgs } from './Character'

export interface BattleCharacterArgs extends CharacterArgs {
  hp: number
  name: string
}
export class BattleCharacter extends Character {
  hp: number

  constructor({ hp, ...args }: BattleCharacterArgs) {
    super({
      facing: 'right',
      ...args,
    })
    this.hp = hp
  }
}
