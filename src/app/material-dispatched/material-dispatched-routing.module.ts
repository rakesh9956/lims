import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MaterialDispatchedComponent } from './material-dispatched/material-dispatched.component';

const routes: Routes = [
  { path: '', component: MaterialDispatchedComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MaterialDispatchedRoutingModule { }
