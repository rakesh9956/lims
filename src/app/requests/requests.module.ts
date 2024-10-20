import { CommonModule, DatePipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbAlertModule, NgbDatepickerModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { NgxPaginationModule } from 'ngx-pagination';
import { AllRequestsComponent } from './all-requests/all-requests.component';
import { FulfilledRequestsComponent } from './fulfilled-requests/fulfilled-requests.component';
import { NewRequestComponent } from './new-request/new-request.component';
import { PendingRequestsComponent } from './pending-requests/pending-requests.component';
import { RequestsRoutingModule } from './requests-routing.module';
import { ReturnsComponent } from './returns/returns.component';
import { AngularDoubleScrollModule } from 'angular-double-scroll';
import { SharedModule } from 'src/shared/shared.module';

@NgModule({
  declarations: [
    AllRequestsComponent,
    PendingRequestsComponent,
    FulfilledRequestsComponent,
    ReturnsComponent,
    NewRequestComponent
  ],
  imports: [
    CommonModule,
    RequestsRoutingModule,
    NgxDatatableModule,
    ReactiveFormsModule,
    NgSelectModule,
    NgxPaginationModule,
    FormsModule,
    NgbDatepickerModule,
    NgbAlertModule,
    NgbModule,
    AngularDoubleScrollModule,
    SharedModule
  ],
  providers: [DatePipe]
})
export class RequestsModule { }
