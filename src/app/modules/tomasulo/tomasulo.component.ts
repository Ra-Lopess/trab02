import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import {Instruction} from "./instruction";
import {ReservationStation} from "./reservation-station";
import {Register} from "./register";
import {BufferReordenamento} from "./buffer-reordenamento";

export const InstructionType: Map<string, { }> = new Map([
    ['lw' , {type: 'memory', cycles: 2}],
    ['sw' , {type: 'memory', cycles: 2}],
    ['add', {type: 'arithmetic', cycles: 1}],
    ['addi', {type: 'arithmetic', cycles: 3}],
    ['sub', {type: 'arithmetic', cycles: 1}],
    ['mult', {type: 'arithmetic', cycles: 2}],
    ['div', {type: 'arithmetic', cycles: 2}],
    ['beq', {type: 'branch', cycles: 1}]
  ]);

@Component({
  selector: 'app-tomasulo',
  templateUrl: './tomasulo.component.html',
  styleUrls: ['./tomasulo.component.scss']
})
export class TomasuloComponent implements OnInit {
  instructions = [
    'addi R1 R5 2',
    'beq R3 R2 1',
    'sub R5 R1 R6',
    'lw R4 R2 0'
  ];
  instructionsQueue: Array<Instruction> = [];
  //bufferReorder = {busy: false, instruction: '', state: '', destination: '', value: ''};
  registers: Array<Register> = [];
  reservationStationComponent: Array<ReservationStation>= []
  bufferReorder: Array<BufferReordenamento> = [];
  cycleActual = 0;
  branching = 0;
  notCompleted: any;

  instructionsForm = this.formBuilder.group({
    op: '',
    regDest: '',
    reg1: '',
    reg2: '',
    numReg: '',
    cicloADD: '',
    cicloDIV: '',
    cicloLOAD: '',
    cicloBRANCH: '',
  });

  constructor(
    private formBuilder: FormBuilder,
  ) { }

  ngOnInit(): void {
    this.loadInstructionQueue();
    this.loadReservationStation(3, 3, 2);
    this.loadRegister();
  }

  onSubmit(): void {
    this.instructionsForm.reset();
  }

  loadRegister(numReg: number = 10){
    for(let i = 0; i < numReg; i++){
      this.registers.push(new Register(3, 0, false));
    }
  }


  loadInstructionQueue(){
    this.instructions.forEach(instruction => {
      const instructionEl = new Instruction(instruction, 0, 0, 0, 0);
      this.instructionsQueue.push(instructionEl);
    });
  }

  loadReservationStation(loaders: number, adders: number, multipliers: number){
    for (let i = 0; i < adders; i++) {
      const add = new ReservationStation(('add' + i), false, '', 0, 0,0, 0, 0, '');
      this.reservationStationComponent.push(add);
    }
    for (let i = 0; i < loaders; i++) {
      const load = new ReservationStation(('load' + i), false, '', 0, 0,0, 0, 0, '');
      this.reservationStationComponent.push(load);
    }
    for (let i = 0; i < multipliers; i++) {
      const add = new ReservationStation(('multiplier' + i), false, '', 0, 0,0, 0, 0, '');
      this.reservationStationComponent.push(add);
    }
  }

  nextCycle(){
    if (this.bufferReorder.length > 0){
      this.bufferReorder.forEach(buffer => {
        if(buffer.estado !== 5){
          if (buffer.estado === 3){
            buffer.estado++;
          }
          // pode ser executada ou seja se depende de algum valor
          if(buffer.estado === 1 && this.canExecute(buffer.numInst) && this.isInReservationStation(buffer.numInst)){
            this.updateReservationStation(buffer);
            buffer.estado++;
          }

          if(buffer.cyclesToComplete === 0){
            buffer.estado++;
            let valor = this.registers.find(reg => reg.reorder === buffer.numInst)?.valor
            buffer.valor = (valor) ? valor : 0;
            this.leaveReservationStation(buffer.numInst);
            buffer.cyclesToComplete = -1;
          }

          if(buffer.estado === 2 && buffer.cyclesToComplete > 0){
            this.defInstType(buffer.numInst, buffer.inst);
            buffer.cyclesToComplete --;
          }
        }
      })
      const existsInstructionNotComitted = this.bufferReorder.find(buffer => buffer.estado <= 3);
      console.log(existsInstructionNotComitted)
      this.notCompleted = !(existsInstructionNotComitted);
    }

    const nextInstruction: any = this.instructionsQueue[this.cycleActual];
    if (nextInstruction){
      const dest = nextInstruction.instruction.split(' ')[1];
      const instructionType: any = InstructionType.get(nextInstruction.instruction.split(' ')[0]);
      console.log("BranchSizeINI = " + this.branching)
      if(this.branching === 0){
        this.bufferReorder.push(new BufferReordenamento(this.cycleActual + 1, nextInstruction.instruction, true, 1, dest, -1, instructionType.cycles));
        this.enterReservationStation(this.bufferReorder[this.cycleActual]);
      }else{
        this.bufferReorder.push(new BufferReordenamento(this.cycleActual + 1, nextInstruction.instruction, true, 5, dest, -1, instructionType.cycles));
        this.branching--;
        console.log(this.branching)
      }

    }
    this.cycleActual ++;

  }

  updateReservationStation(buffer: BufferReordenamento){
    let instReserveStation = this.reservationStationComponent.find(res => res.dest === buffer.numInst);
    const [opCode, dest, reg1, reg2] = buffer.inst.split(' ');

    if (instReserveStation){
      if(instReserveStation.qj !== 0){
        instReserveStation.qj = 0;
        instReserveStation.vj = this.registers[Number(reg1.slice(1)) | 0].valor;
      }
      if(instReserveStation.qk !== 0){
        if(!(buffer.inst.split(' ')[0] == "addi")){
          instReserveStation.qk = 0;
          instReserveStation.vk = this.registers[Number(reg2.slice(1)) | 0].valor;
        }
      }
    }
  }

  isInReservationStation(numInst: number){
    return this.reservationStationComponent.find(res => res.dest === numInst);
  }

  leaveReservationStation(numInst: number){
    let instructionReservation: any = this.reservationStationComponent.find(res => res.dest === numInst);
    instructionReservation.leaveReserve()
  }

  enterReservationStation(buffer: BufferReordenamento){
    const type = this.defInstTypeRet(buffer.inst);
    const [opCode, dest, reg1, reg2] = buffer.inst.split(' ');
    let qJ = 0, qK = 0, vJ = 0, vK = 0;

    if (this.registers[Number(reg1.slice(1)) | 0].busy)
      qJ = this.registers[Number(reg1.slice(1)) | 0].reorder;
    else
      vJ = this.registers[Number(reg1.slice(1)) | 0].valor;

    if(!(buffer.inst.split(' ')[0] == "addi")){
      if (this.registers[Number(reg2.slice(1)) | 0].busy)
        qK = this.registers[Number(reg2.slice(1)) | 0].reorder;
      else
        vK = this.registers[Number(reg2.slice(1)) | 0].valor;
    }

    switch (type){
      case "R":
        return this.enterArit(opCode, vJ,vK,qJ,qK, buffer.numInst);
      case "D":
        return this.enterMemory(opCode, vJ,vK,qJ,qK, buffer.numInst, reg1 + " + " + reg2);
      case "CB":
        return this.enterArit(opCode, vJ,vK,qJ,qK, buffer.numInst);
      default:
        return true;
    }
  }
  enterArit(opCode: string, vj: number, vk: number, qj: number, qk: number, dest: number){
    let reservStationName: string;
    if(opCode === "add" || opCode === "sub" || opCode === "addi" || opCode === "beq")
      reservStationName = "add";
    if(opCode === "div" || opCode === "mult")
      reservStationName = "multiplier";

    let reservationSpace = this.reservationStationComponent.find(res => res.name.includes(reservStationName) && !res.busy);

    if(reservationSpace){
      reservationSpace.busy = true;
      reservationSpace.instruction = opCode;
      reservationSpace.vj = vj;
      reservationSpace.vk = vk;
      reservationSpace.qj = qj;
      reservationSpace.qk = qk;
      reservationSpace.dest = dest;

      return true;
    }else{
      return false;
    }
  }

  enterMemory(opCode: string, vj: number, vk: number, qj: number, qk: number, dest: number, A: string){
    let reservStationName: string;
    if(opCode === "lw"){
      reservStationName = "load";
    }else{
      return true;
    }

    let reservationSpace = this.reservationStationComponent.find(res => res.name.includes(reservStationName) && !res.busy);

    if(reservationSpace){
      reservationSpace.busy = true;
      reservationSpace.instruction = opCode;
      reservationSpace.vj = vj;
      reservationSpace.vk = vk;
      reservationSpace.qj = qj;
      reservationSpace.qk = qk;
      reservationSpace.dest = dest;

      return true;
    }else{
      return false;
    }
  }

  enterBranch(opCode: string, vj: number, vk: number, qj: number, qk: number, dest: number, A: string){

  }

  canExecute(numberOfInstructionActual: number){
    const currentBuffer = this.bufferReorder.find(buffer => buffer.numInst === numberOfInstructionActual);
    const lastBuffer = this.bufferReorder.find(buffer => buffer.numInst === numberOfInstructionActual-1);
    if (lastBuffer && currentBuffer){
      const destLast = lastBuffer.inst.split(' ')[1];
      const [opCode, dest, reg1, reg2] = currentBuffer.inst.split(' ');
      // SE reg1 ou 2 for == destino do ultimo não pode pOrem pode se estiver na parte de escrita
      return lastBuffer.estado >= 3 || !(reg1 === destLast || reg2 === destLast);
    }
    return true;
  }

  estadoTranslate(estado: number){
    switch (estado){
      case 1:
          return 'Despachada';
        break;
      case 2:
        return 'Execução';
        break;
      case 3:
        return 'Escrita';
        break;
      case 4:
        return 'Comitada';
        break;
      default:
        return '';
        break;
    }

  }

  defInstTypeRet(instruction: string) {
    const [opCode, dest, reg1, reg2] = instruction.split(' ');
    const typeObj: any = InstructionType.get(opCode);

    if (typeObj.type === 'memory') {
      return 'D';
    } else if (typeObj.type === 'arithmetic') {
      return 'R';
    } else if (typeObj.type === 'branch') {
      return 'CB';
    }

    return null;
  }

  defInstType(numInstruction:number, instruction: string){
    const [opCode, dest, reg1, reg2] = instruction.split(' ');
    const typeObj: any = InstructionType.get(opCode);

    dest.slice(1)
    const numDest: number = Number(dest.slice(1)) | 0;
    if(!this.registers[numDest]){
      this.registers[numDest] = new Register(0, numInstruction, true);
    }


    if (typeObj.type === 'memory'){
      this.memoryInstruction(opCode, dest, reg1, reg2);
    }else if (typeObj.type === 'arithmetic'){
      this.arithmeticInstruction(opCode, dest, reg1, reg2);
    }else if (typeObj.type === 'branch'){
      this.branchInstruction(opCode, dest, reg1, Number(reg2) | 0);
    }
  }

  // Memory opcode op, Rn, Rt
  /*
    rD: endereço escrita ou leitura
    r1: complementa id da operação básica
   */
  memoryInstruction(opcode: string, rD: string, r1: string, r2: string){
    let reg1 = this.registers[Number(r1.slice(1)) | 0];
    let reg2;
    if(r2.includes('R')){
      reg2 = this.registers[Number(r2.slice(1)) | 0];
    }else{
      reg2 = new Register(Number(r2), 0,true);
    }

    let regDest = this.registers[Number(rD.slice(1)) | 0];
    let result = 0;

    switch (opcode){
      case 'lw':
        result = reg1.valor;
        regDest.valor = result;
        regDest.reorder = Number(this.bufferReorder.find(buffer => buffer.inst.includes(opcode + " " + rD + " " + r1 + " " + r2))?.numInst);
        regDest.busy = true;
        break;
      case 'sw':
        result = reg1.valor;
        regDest.valor = result;
        regDest.reorder = Number(this.bufferReorder.find(buffer => buffer.inst.includes(opcode + " " + rD + " " + r1 + " " + r2))?.numInst);
        regDest.busy = true;
        break;
    }
  }
  // Arithmetic opcode Rm, Rn, Rd/*
  /*
    rD: Reg Dest
    r1: prim Reg
    r2: seg Reg
  */
  arithmeticInstruction(opcode: string, rD: string, r1: string, r2: string){
    let reg1 = this.registers[Number(r1.slice(1)) | 0];
    let reg2;
    if(r2.includes('R')){
      reg2 = this.registers[Number(r2.slice(1)) | 0];
    }else{
      reg2 = new Register(Number(r2), 0,true);
    }

    let regDest = this.registers[Number(rD.slice(1)) | 0];
    let result = 0;

    const valueDestin = this
    switch (opcode){
      case 'add':
        result = reg1.valor + reg2.valor;
        regDest.valor = result;
        regDest.reorder = Number(this.bufferReorder.find(buffer => buffer.inst.includes(opcode + " " + rD + " " + r1 + " " + r2))?.numInst);
        regDest.busy = true;
        break;
      case 'addi':
        result = reg1.valor + reg2.valor;
        regDest.valor = result;
        regDest.reorder = Number(this.bufferReorder.find(buffer => buffer.inst.includes(opcode + " " + rD + " " + r1 + " " + r2))?.numInst);
        regDest.busy = true;
        break;
      case 'sub':
        result = reg1.valor - reg2.valor;
        regDest.valor = result;
        regDest.reorder = Number(this.bufferReorder.find(buffer => buffer.inst.includes(opcode + " " + rD + " " + r1 + " " + r2))?.numInst);
        regDest.busy = true;
        break;
      case 'mult':
        result = reg1.valor * reg2.valor;
        regDest.valor = result;
        regDest.reorder = Number(this.bufferReorder.find(buffer => buffer.inst.includes(opcode + " " + rD + " " + r1 + " " + r2))?.numInst);
        regDest.busy = true;
        break;
      case 'div':
        result = reg1.valor / reg2.valor;
        regDest.valor = result;
        regDest.reorder = Number(this.bufferReorder.find(buffer => buffer.inst.includes(opcode + " " + rD + " " + r1 + " " + r2))?.numInst);
        regDest.busy = true;
        break;
      default:

        break;
    }

  }
  // Branch opcode COND_BR_address, Rt
  /*
    rD: reg Dest
    COND_BR_address: valor branch
   */
  // beq R1 R2 2
  branchInstruction(opcode: string, r1: string, r2: string, COND_BR_address: number){
    let reg1 = this.registers[Number(r1.slice(1)) | 0];
    let reg2 = this.registers[Number(r2.slice(1)) | 0];
    // 3 4 5 6 7
    //   | |
    if(reg1.valor === reg2.valor){
      this.branching = COND_BR_address;
    }

  }
}
