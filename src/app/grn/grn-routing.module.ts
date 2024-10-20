import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GrnAgainstPoComponent } from './grn-against-po/grn-against-po.component';
import { GrnStatusComponent } from './grn-status/grn-status.component';
import { NewGrnComponent } from './new-grn/new-grn.component';

const routes: Routes = [
  { path: '', component: GrnStatusComponent },
  { path: 'new-grn', component: NewGrnComponent },
  { path: 'grn-against-po', component: GrnAgainstPoComponent },
  { path: 'grn-against-po/:Guid', component: GrnAgainstPoComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GrnRoutingModule { }
