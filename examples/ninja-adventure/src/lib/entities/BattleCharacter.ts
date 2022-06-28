import { Character, type CharacterArgs } from './Character'

export class BattleCharacter extends Character {
  constructor(args: CharacterArgs) {
    super({
      ...args,
    })
  }
}
