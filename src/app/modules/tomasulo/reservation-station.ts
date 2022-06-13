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
    public vj: number,
    public vk: number,
    public qj: number,
    public qk: number,
    public dest: number,
    public A: '',
  ) {}

  leaveReserve(){
    this.busy = false;
    this.instruction = "";
    this.vj = 0;
    this.vk = 0;
    this.qj = 0;
    this.qk = 0;
    this.dest = 0;
    this.A = "";
  }
}
