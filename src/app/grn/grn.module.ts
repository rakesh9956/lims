import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GrnRoutingModule } from './grn-routing.module';
import { GrnStatusComponent } from './grn-status/grn-status.component';
import { NewGrnComponent } from './new-grn/new-grn.component';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { GrnAgainstPoComponent } from './grn-against-po/grn-against-po.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxDocViewerModule } from 'ngx-doc-viewer';
import { FormsModule, ReactiveFormsModule, } from '@angular/forms';
import { NgbDatepickerModule } from '@ng-bootstrap/ng-bootstrap';
import { AngularDoubleScrollModule } from 'angular-double-scroll';
import { SharedModule } from 'src/shared/shared.module';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { ExactNumberPipe } from 'src/app/pipe/afterdecimalrate';
import { PipesModule } from '../pipe/pipe.module';
@NgModule({
  declarations: [
    GrnStatusComponent,
    NewGrnComponent,
    GrnAgainstPoComponent,
   // ExactNumberPipe
  ],
  imports: [
    CommonModule,
    GrnRoutingModule,
    NgxDatatableModule,
    NgbModule,
    NgSelectModule,
    FormsModule,
    ReactiveFormsModule,
    NgbDatepickerModule,
    AngularDoubleScrollModule,
    NgxDocViewerModule,
    SharedModule,
    PipesModule,
    NgMultiSelectDropDownModule
  ],
  schemas: [
    NO_ERRORS_SCHEMA
  ],
  //exports:[ExactNumberPipe]
})
export class GrnModule { }
