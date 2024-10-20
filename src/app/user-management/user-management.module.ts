import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserManagementRoutingModule } from './user-management-routing.module';
import { AllUsersComponent } from './all-users/all-users.component';
import { AddUserComponent } from './add-user/add-user.component';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AngularDoubleScrollModule } from 'angular-double-scroll';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { SharedModule } from 'src/shared/shared.module';

@NgModule({
  declarations: [
    AllUsersComponent,
    AddUserComponent
  ],
  imports: [
    CommonModule,
    UserManagementRoutingModule,
    NgxDatatableModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    NgSelectModule,
    AngularDoubleScrollModule,
    NgMultiSelectDropDownModule,
    SharedModule
  ]
})
export class UserManagementModule { }
