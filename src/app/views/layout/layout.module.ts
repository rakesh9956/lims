import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { BaseComponent } from './base/base.component';
import { NavbarComponent } from './navbar/navbar.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { FooterComponent } from './footer/footer.component';

import { ContentAnimateDirective } from '../../core/content-animate/content-animate.directive';

import { NgbDropdownModule, NgbCollapseModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { FeatherIconModule } from '../../core/feather-icon/feather-icon.module';

import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { PERFECT_SCROLLBAR_CONFIG } from 'ngx-perfect-scrollbar';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { ItemsModule } from 'src/app/items/items.module';
import { ManufacturersModule } from 'src/app/manufacturers/manufacturers.module';
import { ReportsModule } from 'src/app/reports/reports.module';
import { RequestsModule } from 'src/app/requests/requests.module';
import { StoresModule } from 'src/app/stores/stores.module';
import { SuppliersModule } from 'src/app/suppliers/suppliers.module';
import { UserManagementModule } from 'src/app/user-management/user-management.module';
import { SettingsModule } from 'src/app/settings/settings.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { NoSidebarComponent } from './no-sidebar/no-sidebar.component';

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true
};


@NgModule({
  declarations: [BaseComponent, NavbarComponent, SidebarComponent, FooterComponent, ContentAnimateDirective, NoSidebarComponent],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    NgbDropdownModule,
    NgbCollapseModule,
    PerfectScrollbarModule,
    FeatherIconModule,
    ItemsModule,
    ManufacturersModule,
    ReportsModule,
    RequestsModule,
    StoresModule,
    SuppliersModule,
    UserManagementModule,
    SettingsModule,
    NgSelectModule,
    NgbModule,
  ],
  providers: [
    {
      provide: PERFECT_SCROLLBAR_CONFIG,
      useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG
    }
  ]
})
export class LayoutModule { }
