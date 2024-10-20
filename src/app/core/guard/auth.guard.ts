import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Observable } from 'rxjs';
import { AuthenticationService } from '../Services/authentication.service';

@Injectable()
export class AuthGuard implements CanActivate {
  public jwtHelper: JwtHelperService = new JwtHelperService();
  constructor(private router: Router,
    private authService:AuthenticationService,
    private http: HttpClient) {}

    async canActivate(){
      if (!this.jwtHelper.isTokenExpired(this.authService.LoggedInUser.WebToken)) {
        return true;
      }
      const isRefreshSuccess = await this.refreshingTokens(this.authService.LoggedInUser.WebToken);
      if (!isRefreshSuccess) {
        this.router.navigateByUrl('/auth/login');
        return false;
      }
  
      return isRefreshSuccess;
    }
    canActivateChild(
      route: ActivatedRouteSnapshot,
      state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree |any {
      if (!this.jwtHelper.isTokenExpired(this.authService.LoggedInUser.WebToken)) {
        return true;
      }
      else{
        this.authService.refreshToken(this.authService.LoggedInUser.RefreshToken).subscribe((res:any) => {
          const dfrg = res;
          return true;
        }, (err: HttpErrorResponse) => {
          this.router.navigateByUrl('/auth/login');
          return false;
        });
      }
    }
    private async refreshingTokens(token: string | null): Promise<boolean> {
      const refreshToken: string | null = this.authService.LoggedInUser.RefreshToken;
      if (!token || !refreshToken) {
        return false;
      }
      const tokenModel = JSON.stringify({refreshToken: refreshToken });
      let isRefreshSuccess = false; // initialize the variable to false
      try {
        this.authService.refreshToken(refreshToken).subscribe(res => {
          const dfrg = res;
          isRefreshSuccess = true; // set the variable to true if the observable emits a value
        }, (err: HttpErrorResponse) => {
          isRefreshSuccess = false;
        });
      }
      catch (ex) {
        isRefreshSuccess = false;
      }
      return isRefreshSuccess;
    }
    
  }
