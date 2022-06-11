import { Component, OnInit } from '@angular/core';
import {Instruction} from "./instruction";
import {ReservationStation} from "./reservation-station";

export const InstructionType = {
  lw: {type: 'memory-read', cycles: 4},
  sw: {type: 'memory-store', cycles: 3},
  add: {type: 'arithmetic', cycles: 1},
  addi: {type: 'arithmetic', cycles: 1},
  sub: {type: 'arithmetic', cycles: 1},
  mult: {type: 'arithmetic', cycles: 2},
  div: {type: 'arithmetic', cycles: 2},
  bne: {type: 'branch', cycles: 2}
};

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
  bufferReorder = {busy: false, instruction: '', state: '', destination: '', value: ''};
  registers = [
    {
      name: "F0",
      qi: "",
      content: "",
    },
    {
      name: "F1",
      qi: "",
      content: "44",
    },
    {
      name: "F2",
      qi: "",
      content: "12",
    },
    {
      name: "F3",
      qi: "",
      content: "",
    },
    {
      name: "F4",
      qi: "",
      content: "33",
    },
    {
      name: "F5",
      qi: "",
      content: "48",
    },
    {
      name: "F6",
      qi: "",
      content: "25",
    },
    {
      name: "F7",
      qi: "",
      content: "",
    },
    {
      name: "F8",
      qi: "",
      content: "7",
    },
    {
      name: "F9",
      qi: "",
      content: "100",
    },
  ];
  reservationStationComponent: Array<ReservationStation>= []
  cycleActual = 0;

  constructor() { }

  ngOnInit(): void {
    this.loadInstructionQueue();
    this.loadReservationStation(3, 3, 2)
  }

  loadInstructionQueue(){
    this.instructions.forEach(instruction => {
      const instructionEl = new Instruction(instruction, 0, 0, 0, 0);
      this.instructionsQueue.push(instructionEl);
    });
  }

  loadReservationStation(loaders: number, adders: number, multipliers: number){
    for (let i = 0; i < adders; i++) {
      const add = new ReservationStation(('add' + i), false, '', '', '','', '', '', '');
      this.reservationStationComponent.push(add);
    }
    for (let i = 0; i < loaders; i++) {
      const load = new ReservationStation(('load' + i), false, '', '', '','', '', '', '');
      this.reservationStationComponent.push(load);
    }
    for (let i = 0; i < multipliers; i++) {
      const add = new ReservationStation(('multiplier' + i), false, '', '', '','', '', '', '');
      this.reservationStationComponent.push(add);
    }
  }

  nextCycle(){
    const nextInstruction =
      this.instructionsQueue[this.cycleActual] ?
        this.instructionsQueue[this.cycleActual].instruction.split(' ')[0] : null;
    if (nextInstruction){

    }
    this.cycleActual ++;

  }

}
