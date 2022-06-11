import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { InstructionUnitComponent } from './modules/instruction-queue/instruction-unit/instruction-unit.component';
import { TomasuloComponent } from './modules/tomasulo/tomasulo.component';

@NgModule({
  declarations: [
    AppComponent,
    InstructionUnitComponent,
    TomasuloComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
