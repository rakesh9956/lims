import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MaterialDispatchedRoutingModule } from './material-dispatched-routing.module';
import { MaterialDispatchedComponent } from './material-dispatched/material-dispatched.component';
import { NgbDatepickerModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AngularDoubleScrollModule } from 'angular-double-scroll';
import { SharedModule } from 'src/shared/shared.module';
import { DatesFilterItemsPipe } from 'src/Utils/expirydateFilter';
import { ExpiryDatesFilterItemsPipe } from 'src/Utils/expirydatespipe';

@NgModule({
  declarations: [
    MaterialDispatchedComponent,
    DatesFilterItemsPipe,
    ExpiryDatesFilterItemsPipe
  ],
  imports: [
    CommonModule,
    MaterialDispatchedRoutingModule,
    NgbDatepickerModule,
    NgxDatatableModule,
    CommonModule,
    NgbModule,
    NgSelectModule,
    FormsModule,
    ReactiveFormsModule,
    AngularDoubleScrollModule,
    SharedModule
  ]
})
export class MaterialDispatchedModule { }
