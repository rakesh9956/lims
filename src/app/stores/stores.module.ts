import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StoresRoutingModule } from './stores-routing.module';
import { AllStoresComponent } from './all-stores/all-stores.component';
import { NewStoreComponent } from './new-store/new-store.component';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CentersComponent } from './centers/centers.component';
import { NewCenterComponent } from './new-center/new-center.component';
import { AngularDoubleScrollModule } from 'angular-double-scroll';
import { SharedModule } from 'src/shared/shared.module';
import { NrdcComponent } from './nrdc/nrdc.component';
import { PipesModule } from '../pipe/pipe.module';

@NgModule({
  declarations: [
    AllStoresComponent,
    NewStoreComponent,
    CentersComponent,
    NewCenterComponent,
    NrdcComponent
  ],
  imports: [
    CommonModule,
    StoresRoutingModule,
    NgxDatatableModule,
    NgbModule,
    NgSelectModule,
    FormsModule,
    ReactiveFormsModule,
    AngularDoubleScrollModule,
    SharedModule,
    PipesModule,
  ]
})
export class StoresModule { }
