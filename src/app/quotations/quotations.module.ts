import { NgModule } from '@angular/core';
import { CommonModule,DatePipe } from '@angular/common';

import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { QuotationsRoutingModule } from './quotations-routing.module';
import { AllQuotationsComponent } from './all-quotations/all-quotations.component';
import { NewQuotationComponent } from './new-quotation/new-quotation.component';
import { CompareQuotationsComponent } from './compare-quotations/compare-quotations.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgbAlertModule, NgbDatepickerModule, NgbDateStruct, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { JsonPipe } from '@angular/common';
import { AngularDoubleScrollModule } from 'angular-double-scroll';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { SharedModule } from "../../shared/shared.module";
import { NgxDocViewerModule } from 'ngx-doc-viewer';
@NgModule({
    declarations: [
        AllQuotationsComponent,
        NewQuotationComponent,
        CompareQuotationsComponent
    ],
    providers: [
        DatePipe
    ],
    imports: [
        CommonModule,
        QuotationsRoutingModule,
        NgxDatatableModule,
        FormsModule,
        ReactiveFormsModule,
        NgbModule,
        NgSelectModule,
        NgbDatepickerModule,
        JsonPipe,
        NgbAlertModule,
        AngularDoubleScrollModule,
        NgMultiSelectDropDownModule,
        SharedModule,
        NgxDocViewerModule,
    ]
})
export class QuotationsModule { }
