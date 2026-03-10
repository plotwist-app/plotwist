export interface Counter {
  nextId(): Promise<number>
  setInitialIfAbsent(initialValue: number): Promise<boolean>
}
