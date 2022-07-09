export class BehaviourComponent<T> extends ex.Component<'behaviour'> {
  // Unique type name is required
  public readonly type = 'behaviour'
  behaviour: T[] = []

  async execute<T>(behaviour: Behaviour<T>[], loop?: boolean) {
    for (let i = 0; i < behaviour.length; i++) {
      await behaviour[i](this.owner as any)

      if (loop && i === behaviour.length - 1) {
        i = -1
      }
    }
  }
}

export type Behaviour<T> = (self: T) => void | Promise<void>
