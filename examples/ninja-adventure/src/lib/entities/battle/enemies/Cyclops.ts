import {
  BattleCharacter,
  type BattleCharacterArgs,
} from '$lib/entities/BattleCharacter'
import imgRed from '$res/Actor/Monsters/Cyclops/Cyclops.png'
import imgGreen from '$res/Actor/Monsters/Cyclops2/Cyclops2.png'

export interface CyclopsArgs
  extends Omit<BattleCharacterArgs, 'hp' | 'image' | 'name'> {
  variant?: 'green' | 'red'
}

export class Cyclops extends BattleCharacter {
  constructor(args: CyclopsArgs) {
    let hp
    let image

    if (args.variant === 'green') {
      hp = 75
      image = imgGreen
    } else {
      hp = 50
      image = imgRed
    }
    super({
      ...args,
      name: 'Cyclops',
      hp,
      image,
    })
  }
}
