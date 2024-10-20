import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddUserComponent } from './add-user/add-user.component';
import { AllUsersComponent } from './all-users/all-users.component';

const routes: Routes = [
  { path: '', component: AllUsersComponent },
  // { path: 'new-user', component: AddUserComponent },
  { path: ':userType', component: AddUserComponent },
  { path: ':userType/:EmployeeGuid', component: AddUserComponent },
  { path: 'new-user/:EmployeeGuid', component: AddUserComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserManagementRoutingModule { }
