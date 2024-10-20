import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AllSuppliersComponent } from './all-suppliers/all-suppliers.component';
import { NewSupplierComponent } from './new-supplier/new-supplier.component';

const routes: Routes = [
  { path: '', component: AllSuppliersComponent },
  { path: 'new-supplier', component: NewSupplierComponent },
  { path: 'new-supplier/:SupplierGuid', component: NewSupplierComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SuppliersRoutingModule { }
