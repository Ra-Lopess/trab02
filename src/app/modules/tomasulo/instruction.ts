export class Instruction {
  constructor(
    public instruction: string,
    public issue: number,
    public start: number,
    public finish: number,
    public written: number) {}
}
