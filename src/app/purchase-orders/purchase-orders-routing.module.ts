import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AllPurchaseOrdersComponent } from './all-purchase-orders/all-purchase-orders.component';
import { NewPurchaseOrderComponent } from './new-purchase-order/new-purchase-order.component';
import { PoAgainstPiComponent } from './po-against-pi/po-against-pi.component';
import { PoViewComponent } from './po-view/po-view.component';
import { PoPaymentHistoryComponent } from './po-paymentHistory/po-paymenthistory.component';

const routes: Routes = [
  { path: '', component: AllPurchaseOrdersComponent },
  { path: 'new-purchase-order', component: NewPurchaseOrderComponent },
  { path: 'new-purchase-order/:PurchaseOrderGuid', component: NewPurchaseOrderComponent },
  { path: 'po-against-pi', component: PoAgainstPiComponent },
  { path: 'po-against-pi/:PurchaseOrderGuid/:Status', component: PoAgainstPiComponent },
  { path: 'po-view', component: PoViewComponent },
  {path:'po-payhistory',component:PoPaymentHistoryComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PurchaseOrdersRoutingModule { }
