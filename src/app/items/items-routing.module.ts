import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AllItemsComponent } from './all-items/all-items.component';
import { ExpiringItemsComponent } from './expiring-items/expiring-items.component';
import { ItemTypesComponent } from './item-types/item-types.component';
import { LowStockItemsComponent } from './low-stock-items/low-stock-items.component';
import { NewItemTypeComponent } from './new-item-type/new-item-type.component';
import { NewItemComponent } from './new-item/new-item.component';
import { ViewItemComponent } from './view-item/view-item.component';
import { StockReturnFormComponent } from './stock-return-form/stock-return-form.component';
import { ScrapItemsComponent } from './scrap-items/scrap-items.component';
import { AdjustItemsComponent } from './adjust-items/adjust-items.component';
import { SiPendingItemsComponent } from './si-pending-items/si-pending-items.component'
import { CptComponent } from './cpt/cpt.component';
import { AllCptComponent } from './all-cpt/all-cpt.component';
import { LiveCptComponent } from './live-cpt/live-cpt.component';
import { GetAllCptsComponent } from './all-live-cpts/get-all-cpts.component';

const routes: Routes = [
  { path: '', component: AllItemsComponent },
  { path: 'new-item', component: NewItemComponent },
  { path: 'low-stock-items', component: LowStockItemsComponent },
  { path: 'expiring-items', component: ExpiringItemsComponent },
  { path: 'item-types', component: ItemTypesComponent },
  { path: 'item-types/new-item-type', component: NewItemTypeComponent },
  { path: 'new-item/:ItemGuid', component: NewItemComponent },
  { path: 'view-item/:ItemGuid', component: ViewItemComponent },
  { path: 'stock-return-form', component: StockReturnFormComponent },
  { path: 'scrap-items', component: ScrapItemsComponent },
  { path: 'adjust-items', component: AdjustItemsComponent },
  { path: 'si-pending-items', component: SiPendingItemsComponent },
  { path : 'cpt', component: CptComponent },
  { path : 'cpt/:CPTGuid', component: CptComponent },
  {path : 'all-cpt',component : AllCptComponent},
  {path : 'live-cpt',component : LiveCptComponent},
  {path : 'live-cpt/:LiveCptGuid',component : LiveCptComponent},
  {path : 'all-live-cpt',component : GetAllCptsComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ItemsRoutingModule { }