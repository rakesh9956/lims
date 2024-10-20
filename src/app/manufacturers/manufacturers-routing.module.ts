import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddManufacturerComponent } from './add-manufacturer/add-manufacturer.component';
import { AllManufacturersComponent } from './all-manufacturers/all-manufacturers.component';

const routes: Routes = [
  { path: '', component: AllManufacturersComponent },
  { path: 'new-manufacturer', component: AddManufacturerComponent },
  { path: 'new-manufacturer/:ManufactureGuid', component: AddManufacturerComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ManufacturersRoutingModule { }
