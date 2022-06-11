// name: nome da estacão de reserva
// busy: fala se aquela estação está sendo utilizada ou não
// op: op code
// vj e vk: holds register values
// qj e qk: sources register
export class ReservationStation {
  constructor(
    public name: string,
    public busy: boolean,
    public instruction: string,
    public vj: string,
    public vk: string,
    public qj: number,
    public qk: number,
    public dest: number,
    public A: '',
  ) {}
}
