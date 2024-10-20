import { NO_ERRORS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
import { DpConsumptionRoutingModule } from './dp-consumption-routing.module';
import { DpConsumptionComponent } from './dp-consumption/dp-consumption.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/shared/shared.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';


@NgModule({
  declarations: [
    DpConsumptionComponent
  ],
  imports: [
    CommonModule,
    DpConsumptionRoutingModule,
    NgSelectModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    NgbModule
  ],
  schemas: [
    NO_ERRORS_SCHEMA
  ]
})
export class DpConsumptionModule { }
