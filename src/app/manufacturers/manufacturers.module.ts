import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ManufacturersRoutingModule } from './manufacturers-routing.module';
import { AddManufacturerComponent } from './add-manufacturer/add-manufacturer.component';
import { AllManufacturersComponent } from './all-manufacturers/all-manufacturers.component';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from 'src/shared/shared.module';


@NgModule({
  declarations: [
    AddManufacturerComponent,
    AllManufacturersComponent
  ],
  imports: [
    CommonModule,
    ManufacturersRoutingModule,
    NgxDatatableModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    SharedModule
  ]
})
export class ManufacturersModule { }
