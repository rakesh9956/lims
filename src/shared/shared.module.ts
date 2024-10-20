import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShimmersComponent } from './shimmers/shimmers.component';




@NgModule({
  declarations: [
    ShimmersComponent
  ],
  imports: [
    CommonModule
  ],
  exports:[
    ShimmersComponent
  ]
})
export class SharedModule { }
