import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExactNumberPipe } from './afterdecimalrate';

@NgModule({
  declarations: [ExactNumberPipe],
  imports: [
    CommonModule
  ],
  entryComponents: [ExactNumberPipe],
  exports: [ExactNumberPipe]
})
export class PipesModule { }