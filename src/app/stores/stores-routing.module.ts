import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AllStoresComponent } from './all-stores/all-stores.component';
import { CentersComponent } from './centers/centers.component';
import { NewCenterComponent } from './new-center/new-center.component';
import { NewStoreComponent } from './new-store/new-store.component';
import { NrdcComponent } from './nrdc/nrdc.component';

const routes: Routes = [
  { path: '', component: AllStoresComponent },
  { path: 'new-store', component: NewStoreComponent },
  { path: 'centers', component: CentersComponent },
  { path: 'new-center', component: NewCenterComponent },
  { path: 'nrdc', component: NrdcComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StoresRoutingModule { }
