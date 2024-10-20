import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AllRequestsComponent } from './all-requests/all-requests.component';
import { FulfilledRequestsComponent } from './fulfilled-requests/fulfilled-requests.component';
import { NewRequestComponent } from './new-request/new-request.component';
import { PendingRequestsComponent } from './pending-requests/pending-requests.component';
import { ReturnsComponent } from './returns/returns.component';

const routes: Routes = [
  { path: '', component: AllRequestsComponent },
  { path: 'fulfilled-requests', component: FulfilledRequestsComponent },
  { path: 'pending-requests', component: PendingRequestsComponent },
  { path: 'returns', component: ReturnsComponent },
  { path: 'new-request', component: NewRequestComponent },
  { path: 'new-request/:IndentGuid', component: NewRequestComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RequestsRoutingModule { }
