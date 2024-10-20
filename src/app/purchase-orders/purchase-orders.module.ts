import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';


import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { AllPurchaseOrdersComponent } from './all-purchase-orders/all-purchase-orders.component';
import { NewPurchaseOrderComponent } from './new-purchase-order/new-purchase-order.component';
import { PurchaseOrdersRoutingModule } from './purchase-orders-routing.module';
import { PoAgainstPiComponent } from './po-against-pi/po-against-pi.component';
import { AngularDoubleScrollModule } from 'angular-double-scroll';
import { SharedModule } from "../../shared/shared.module";
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { FilterItemsPipe } from 'src/Utils/search';
import { FilterQuotationsItemsPipe } from 'src/Utils/filterQuotations';
import { ExactNumberPipe } from 'src/app/pipe/afterdecimalrate';
import {PipesModule} from '../pipe/pipe.module';
import { PoViewComponent } from './po-view/po-view.component'
import { PoPaymentHistoryComponent } from './po-paymentHistory/po-paymenthistory.component';
import { NgxDocViewerModule } from 'ngx-doc-viewer';

@NgModule({
    declarations: [
        AllPurchaseOrdersComponent,
        NewPurchaseOrderComponent,
        PoAgainstPiComponent,
        FilterItemsPipe,
        FilterQuotationsItemsPipe,
        PoViewComponent,
        PoPaymentHistoryComponent
      //  ExactNumberPipe

    ],
    imports: [
        CommonModule,
        PurchaseOrdersRoutingModule,
        NgxDatatableModule,
        FormsModule,
        ReactiveFormsModule,
        NgbModule,
        NgSelectModule,
        AngularDoubleScrollModule,
        SharedModule,
        PipesModule,
        NgMultiSelectDropDownModule,
        NgxDocViewerModule,
    ],
    //exports:[ExactNumberPipe]
})
export class PurchaseOrdersModule { }
