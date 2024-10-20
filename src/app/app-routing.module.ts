import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BaseComponent } from './views/layout/base/base.component';
import { AuthGuard } from './core/guard/auth.guard';
import { ErrorPageComponent } from './views/pages/error-page/error-page.component';


const routes: Routes = [
  { path:'auth', loadChildren: () => import('./views/pages/auth/auth.module').then(m => m.AuthModule) },
  {
    path: '',
    component: BaseComponent,
    canActivate : [AuthGuard],
    children: [
      {
        path: 'dashboard',
        loadChildren: () => import('./views/pages/dashboard/dashboard.module').then(m => m.DashboardModule)
      },
      {
        path: 'advanced-form-elements',
        loadChildren: () => import('./views/pages/advanced-form-elements/advanced-form-elements.module').then(m => m.AdvancedFormElementsModule)
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }, 
      // { path: '**', redirectTo: 'dashboard', pathMatch: 'full' }

      // Yoda LIMS Flow Start
      { path: 'items', 
        loadChildren: () => import('./items/items.module').then(m => m.ItemsModule) 
      },
      { path: 'manufacturers', 
        loadChildren: () => import('./manufacturers/manufacturers.module').then(m => m.ManufacturersModule) 
      },
      { path: 'reports', 
        loadChildren: () => import('./reports/reports.module').then(m => m.ReportsModule)
      },
      { path: 'requests', 
        loadChildren: () => import('./requests/requests.module').then(m => m.RequestsModule)
      },
      { path: 'stores', 
        loadChildren: () => import('./stores/stores.module').then(m => m.StoresModule)
      },
      { path: 'suppliers', 
        loadChildren: () => import('./suppliers/suppliers.module').then(m => m.SuppliersModule)
      },
      { path: 'user-management', 
        loadChildren: () => import('./user-management/user-management.module').then(m => m.UserManagementModule)
      },
      { path: 'grn', 
        loadChildren: () => import('./grn/grn.module').then(m => m.GrnModule)
      },
      { path: 'purchase-orders', 
        loadChildren: () => import('./purchase-orders/purchase-orders.module').then(m => m.PurchaseOrdersModule)
      },
      { path: 'quotations', 
        loadChildren: () => import('./quotations/quotations.module').then(m => m.QuotationsModule)
      },
      { path: 'settings', 
        loadChildren: () => import('./settings/settings.module').then(m => m.SettingsModule)
      },
      { path: 'material-dispatched', 
        loadChildren: () => import('./material-dispatched/material-dispatched.module').then(m => m.MaterialDispatchedModule)
      },
      { path: 'dp-consumption', 
        loadChildren: () => import('./dp-consumption/dp-consumption.module').then(m => m.DpConsumptionModule)
      }
    ]
  },
  { 
    path: 'error',
    component: ErrorPageComponent,
    data: {
      'type': 404,
      'title': 'Page Not Found',
      'desc': 'Oopps!! The page you were looking for doesn\'t exist.'
    }
  },
  {
    path: 'error/:type',
    component: ErrorPageComponent
  },
  { path: '**', redirectTo: '/auth/login' , pathMatch: 'full'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'top' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
