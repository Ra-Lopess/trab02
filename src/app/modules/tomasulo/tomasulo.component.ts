import { Component, OnInit } from '@angular/core';
import {Instruction} from "./instruction";
import {ReservationStation} from "./reservation-station";
import {Register} from "./register";
import {BufferReordenamento} from "./buffer-reordenamento";
import {splitClasses} from "@angular/compiler";

export const InstructionType: Map<string, { }> = new Map([
    ['lw' , {type: 'memory', cycles: 4}],
    ['sw' , {type: 'memory', cycles: 3}],
    ['add', {type: 'arithmetic', cycles: 1}],
    ['addi', {type: 'arithmetic', cycles: 1}],
    ['sub', {type: 'arithmetic', cycles: 1}],
    ['mult', {type: 'arithmetic', cycles: 2}],
    ['div', {type: 'arithmetic', cycles: 2}],
    ['bne', {type: 'branch', cycles: 2}]
  ]);

@Component({
  selector: 'app-tomasulo',
  templateUrl: './tomasulo.component.html',
  styleUrls: ['./tomasulo.component.scss']
})
export class TomasuloComponent implements OnInit {
  instructions = [
    'lw F6 32 R2',
    'lw F2 44 R3',
    'mult FO F2 F4',
    'sub F8 F2 F6',
    'div F9 F0 F6',
    'add F6 F8 F2'
  ];
  instructionsQueue: Array<Instruction> = [];
  //bufferReorder = {busy: false, instruction: '', state: '', destination: '', value: ''};
  registers: Array<Register> = [];
  reservationStationComponent: Array<ReservationStation>= []
  bufferReorder: Array<BufferReordenamento> = [];
  cycleActual = 0;
  instructionActual: any;

  constructor() { }

  ngOnInit(): void {
    this.loadInstructionQueue();
    this.loadReservationStation(3, 3, 2);
    this.loadRegister();
  }

  loadRegister(numReg: number = 10){
    for(let i = 0; i < numReg; i++){
      this.registers.push(new Register(0, 0, false));
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
      const add = new ReservationStation(('add' + i), false, '', '', '',0, 0, 0, '');
      this.reservationStationComponent.push(add);
    }
    for (let i = 0; i < loaders; i++) {
      const load = new ReservationStation(('load' + i), false, '', '', '',0, 0, 0, '');
      this.reservationStationComponent.push(load);
    }
    for (let i = 0; i < multipliers; i++) {
      const add = new ReservationStation(('multiplier' + i), false, '', '', '',0, 0, 0, '');
      this.reservationStationComponent.push(add);
    }
  }

  nextCycle(){
    if (this.bufferReorder.length > 0){
      this.bufferReorder.forEach(buffer => {
        // pode ser executada ou seja se depende de algum valor
        if(buffer.estado === 1 && this.canExecute(buffer.numInst) && this.enterReservationStation(buffer.inst, buffer.numInst)){
          buffer.estado++;
        }

        if(buffer.cyclesToComplete === 0){
          buffer.estado++;
          let valor = this.registers.find(reg => reg.reorder === buffer.numInst)?.valor
          buffer.valor = (valor) ? valor : 0;
        }

        if(buffer.estado === 2 && buffer.cyclesToComplete > 0){
          this.defInstType(buffer.numInst, buffer.inst);
          buffer.cyclesToComplete --;
        }

      })
    }

    const nextInstruction: any = this.instructionsQueue[this.cycleActual];
    if (nextInstruction){
      const dest = nextInstruction.instruction.split(' ')[1];
      const instructionType: any = InstructionType.get(nextInstruction.instruction.split(' ')[0]);
      this.bufferReorder.push(new BufferReordenamento(this.cycleActual + 1, nextInstruction.instruction, true, 1, dest, -1, instructionType.cycles));
    }
    this.cycleActual ++;

  }

  enterReservationStation(inst: string, numInst: number){
    const type = this.defInstTypeRet(inst);
    const [opCode, dest, reg1, reg2] = inst.split(' ');

    switch (type){
      case "R":
        return this.enterArit(opCode, '','',0,0, numInst);
        break;
      case "D":
        return this.enterMem(opCode, '','',0,0, numInst, reg1 + reg2);
        break;
      case "CB":
        return this.enterBranch(opCode, '','',0,0, numInst, reg1);
        break;
      default:
        console.log("):)")
        return false;
        break;
    }
  }
  enterArit(opCode: string, vj: string, vk: string, qj: number, qk: number, dest: number){
    let reservStationName: string;
    if(opCode === "add" || opCode === "sub")
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

  enterMem(opCode: string, vj: string, vk: string, qj: number, qk: number, dest: number, A: string){

  }

  enterBranch(opCode: string, vj: string, vk: string, qj: number, qk: number, dest: number, A: string){

  }

  canExecute(numberOfInstructionActual: number){
    const currentInstruction = this.bufferReorder.find(buffer => buffer.numInst === numberOfInstructionActual)?.inst
    const lastInstruction = this.bufferReorder.find(buffer => buffer.numInst === numberOfInstructionActual-1)?.inst;
    if (lastInstruction && currentInstruction){
      const destL = lastInstruction.split(' ')[1];
      const [opCode, dest, reg1, reg2] = lastInstruction.split(' ');
      return !(reg1 === destL || reg2 === destL);
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
      default:
        return 'Comitada';
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
    debugger
    if(!this.registers[numDest]){
      this.registers[numDest] = new Register(0, numInstruction, true);
    }


    if (typeObj.type === 'memory'){
      this.memoryInstruction(opCode, dest, reg1);
    }else if (typeObj.type === 'arithmetic'){
      this.arithmeticInstruction(opCode, dest, reg1, reg2);
    }else if (typeObj.type === 'branch'){
      this.branchInstruction(opCode, reg1, reg2);
    }
  }

  // Memory opcode op, Rn, Rt
  /*
    rD: endereço escrita ou leitura
    op: complementa id da operação básica
   */
  memoryInstruction(opcode: string, rD: string, op: string){
    if (opcode === 'lw'){

    }else if (opcode === 'sw'){

    }

    switch (opcode){
      case 'lw':

        break;
      case 'sw':

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
    switch (opcode){
      case 'add':

        break;
      case 'addi':

        break;
      case 'sub':

        break;
      case 'mult':

        break;
      case 'div':

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
  branchInstruction(opcode: string, rD: string, COND_BR_address: string){

  }
  executeInstruction(instruction: string){

  }



}
