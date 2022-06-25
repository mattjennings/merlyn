import { Character, CharacterArgs } from './Character'

export class BattleCharacter extends Character {
  constructor(args: CharacterArgs) {
    super({
      ...args,
    })
  }
}
