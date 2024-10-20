import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SettingsRoutingModule } from './settings-routing.module';
import { AccountSettingsComponent } from './account-settings/account-settings.component';
import { ProfileSettingsComponent } from './profile-settings/profile-settings.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    AccountSettingsComponent,
    ProfileSettingsComponent
  ],
  imports: [
    CommonModule,
    SettingsRoutingModule,
    FormsModule,
    ReactiveFormsModule,
  ]
})
export class SettingsModule { }
