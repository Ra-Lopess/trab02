import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {TomasuloComponent} from "./modules/tomasulo/tomasulo.component";

const routes: Routes = [
  { path: '', component: TomasuloComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
