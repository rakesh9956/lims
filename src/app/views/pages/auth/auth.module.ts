import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login/login.component';
import { Routes, RouterModule } from '@angular/router';
import { AuthComponent } from './auth.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { ReactiveFormsModule } from '@angular/forms';
import { NotVerifiedComponent } from './not-verified/not-verified.component';
import { UserNotVerifiedComponent } from './user-not-verified/user-not-verified.component';
import { SupplierVerificationComponent } from './supplier-verification/supplier-verification.component';

const routes: Routes = [
  {
    path: '',
    component: AuthComponent,
    children: [
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
      },
      {
        path: 'login',
        component: LoginComponent
      },
      {
        path: 'forgot-password',
        component: ForgotPasswordComponent
      },
      {
        path: 'reset-password',
        component: ResetPasswordComponent
      },
      { path: 'supplier-verified', component: SupplierVerificationComponent },
      { path: 'supplier-verified/:SupplierGuid', component: SupplierVerificationComponent },

      { path: 'not-verified/:UserGuid', component: NotVerifiedComponent },
      { path: 'user-not-verified/:UserGuid', component: UserNotVerifiedComponent },
      { path: 'reset-password/:UserGuid', component: ResetPasswordComponent },
    ]
  },
]

@NgModule({
  declarations: [LoginComponent, AuthComponent, ForgotPasswordComponent, ResetPasswordComponent,NotVerifiedComponent, UserNotVerifiedComponent, SupplierVerificationComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes)
  ]
})
export class AuthModule { }
