import { NgModule ,NO_ERRORS_SCHEMA} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

import { ItemsRoutingModule } from './items-routing.module';
import { AllItemsComponent } from './all-items/all-items.component';
import { LowStockItemsComponent } from './low-stock-items/low-stock-items.component';
import { ExpiringItemsComponent } from './expiring-items/expiring-items.component';
import { NewItemComponent } from './new-item/new-item.component';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { ArchwizardModule } from 'angular-archwizard';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ItemTypesComponent } from './item-types/item-types.component';
import { NewItemTypeComponent } from './new-item-type/new-item-type.component';

import { NgSelectModule } from '@ng-select/ng-select';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ViewItemComponent } from './view-item/view-item.component';
import { CItemDetailsComponent } from './c-item-details/c-item-details.component';
import { CItemSuppliersComponent } from './c-item-suppliers/c-item-suppliers.component';
import { CItemQuotationsComponent } from './c-item-quotations/c-item-quotations.component';
import { CItemPosComponent } from './c-item-pos/c-item-pos.component';
import { CItemActivityComponent } from './c-item-activity/c-item-activity.component';
import { AngularDoubleScrollModule } from 'angular-double-scroll';
import { StockReturnFormComponent } from './stock-return-form/stock-return-form.component';
import { ScrapItemsComponent } from './scrap-items/scrap-items.component';
import { CItemGrnComponent } from './c-item-grn/c-item-grn.component';
import { CItemIndentsComponent } from './c-item-indents/c-item-indents.component';
import { CItemSiComponent } from './c-item-si/c-item-si.component';
import { AdjustItemsComponent } from './adjust-items/adjust-items.component';
import { SharedModule } from 'src/shared/shared.module';
import { SiPendingItemsComponent } from './si-pending-items/si-pending-items.component';
import { CptComponent } from './cpt/cpt.component';
import { AllCptComponent } from './all-cpt/all-cpt.component';
import { LiveCptComponent } from './live-cpt/live-cpt.component';
import { GetAllCptsComponent } from './all-live-cpts/get-all-cpts.component';

@NgModule({
  declarations: [
    AllItemsComponent,
    LowStockItemsComponent,
    ExpiringItemsComponent,
    NewItemComponent,
    ItemTypesComponent,
    NewItemTypeComponent,
    ViewItemComponent,
    CItemDetailsComponent,
    CItemSuppliersComponent,
    CItemQuotationsComponent,
    CItemPosComponent,
    CItemActivityComponent,
    StockReturnFormComponent,
    ScrapItemsComponent,
    CItemGrnComponent,
    CItemIndentsComponent,
    CItemSiComponent,
    AdjustItemsComponent,
    SiPendingItemsComponent,
    CptComponent,
    AllCptComponent,
    LiveCptComponent,
    GetAllCptsComponent
  ],
  imports: [
    CommonModule,
    ItemsRoutingModule,
    NgxDatatableModule,
    ArchwizardModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    NgSelectModule,
    AngularDoubleScrollModule,
    SharedModule
  ],
  schemas: [NO_ERRORS_SCHEMA],
  providers:[DatePipe]
  
})
export class ItemsModule { }
