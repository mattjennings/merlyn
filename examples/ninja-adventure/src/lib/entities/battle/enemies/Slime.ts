import {
  BattleCharacter,
  type BattleCharacterArgs,
} from '$lib/entities/BattleCharacter'
import image from '$res/Actor/Monsters/Slime.png'

export type SlimeArgs = Omit<BattleCharacterArgs, 'hp' | 'image' | 'name'>

export class Slime extends BattleCharacter {
  constructor(args: SlimeArgs) {
    super({
      ...args,
      name: 'Slime',
      hp: 50,
      image,
    })
  }
}
