export class BufferReordenamento {
  constructor(
    public numInst: number,
    public inst: string,
    public busy: boolean,
    public estado: number,
    public dest: string,
    public valor: number,
    public cyclesToComplete: number
  ) {}
}

/*
Estado pode ser
  1. Despacho: instrução vai pra estação de reserva
  2. Execução: instrução entra em execução
  3. Escrita: isntrução é escrita no Buffer de reordenação e sai da estação de reserva
  4. Commit: instrução é comitada (finalizada) e é considerada como finalizada
*/
