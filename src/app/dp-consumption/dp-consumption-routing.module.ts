import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DpConsumptionComponent } from './dp-consumption/dp-consumption.component';
const routes: Routes = [
  { path: '', component: DpConsumptionComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DpConsumptionRoutingModule { }
