import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AllQuotationsComponent } from './all-quotations/all-quotations.component';
import { CompareQuotationsComponent } from './compare-quotations/compare-quotations.component';
import { NewQuotationComponent } from './new-quotation/new-quotation.component';

const routes: Routes = [
  { path: '', component: AllQuotationsComponent },
  { path: 'edit-quotation/:QuotationGuid', component: NewQuotationComponent },
  { path: 'new-quotation', component: NewQuotationComponent },
  { path: 'compare-quotations', component: CompareQuotationsComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class QuotationsRoutingModule { }
