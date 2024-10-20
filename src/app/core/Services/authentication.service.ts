import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { BehaviorSubject, Observable, of, Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { IConfirmPassword, ILogin } from '../interface/auth';
import { LoggedInUser } from '../models/logged-in-user';
import { CONFIGURATION } from 'src/app/app.constant';
import jwt_decode from "jwt-decode";
import { UserPermissionLocationsService } from './user-permission-locations.service';


@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  ISAUTHENTICATED = false;
  LoggedInUser: LoggedInUser = {} as LoggedInUser;
  formupdate: any;
  constructor(
    private http: HttpClient,
    private router: Router,
    private UserPermissionService: UserPermissionLocationsService,
  ) {
    const tokenData = JSON.parse(this.DecodeSecrects() || '{}');  // Assign empty stringified object if decodesecrects fucntion returns empty string
    this.ISAUTHENTICATED = this.ValidateToken(tokenData.access_token || '');
    if (this.ISAUTHENTICATED) {
      let data: any = jwt_decode(tokenData.access_token);
      data['webToken'] = tokenData.access_token || '';
      data['refreshToken'] = tokenData.refresh_token || '';
      this.LoggedInUser = new LoggedInUser(data);
     let UpadatemobileNo=localStorage.getItem('accountSettingUpdatedmobileNO')||''
     this.UserPermissionService.Changelocation.subscribe(user => {
      if (user !== '') {
        this.LoggedInUser.LOCATIONSGUID=user
      }
      else{
        let SelectedLocationGuid = localStorage.getItem('UserDeportments')
        this.LoggedInUser.LOCATIONSGUID=SelectedLocationGuid
      }
    })
     if(UpadatemobileNo){
      this.LoggedInUser.PhoneNumber=UpadatemobileNo
     }
    }
   }

  login(cred: ILogin) {
    let body = new URLSearchParams();
    localStorage.setItem('Email', cred.userName);
    body.set('username', cred.userName);
    body.set('password', cred.password);
    body.set('grant_type', "password");
    body.set('scope', "api1 offline_access");
    body.set('client_id', "ro.client");
    body.set('client_secret', "secret");
    body.set('auth_type', cred.authType);
    body.set('social_token', cred.clientId);
    body.set('verification_code',cred.verificationCode);
    body.set('phone_num',cred.phoneNum);
    body.set('country_code',cred.countryCode);
    body.set('user_type_id', "1");
    let options = {
      headers: new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded')
    };

    return this.http.post(`${CONFIGURATION.baseUrls.authBaseUrl}/connect/token`, body.toString(), options).pipe(map((res: any = {}) => {
      let data: any = jwt_decode(res.access_token);
      if (res && res.access_token && data.EmailConfirmed.toLowerCase() == 'true') {
        this.ISAUTHENTICATED = true;
        var email = data['Email']
       
        var guid = data['UserGuid']
        
        localStorage.setItem('UserGuid', guid);
        localStorage.setItem('EmailVerified', data.EmailConfirmed.toLowerCase());
        data['webToken'] = res.access_token || '';
        data['refreshToken'] = res.refresh_token || '';
        this.LoggedInUser = new LoggedInUser(data);
        this.EncodeSecrects(res);
      } else {
        this.flushToken();
        if (data.EmailConfirmed.toLowerCase() == 'false') {
          localStorage.setItem('EmailVerified', data.EmailConfirmed.toLowerCase());
          localStorage.setItem('ResendGuid', data['UserGuid']);
          this.router.navigateByUrl('/auth/not-verified');
        }
        else {
          //localStorage.setItem('EmailVerified',null);
          return null;
          //  window.location.href = '.';
        }
      }
      return res;
    }));
  }
  refreshToken(token: any) {
    let body = new URLSearchParams();
    body.set('grant_type', "refresh_token"); 
    body.set('refresh_token', token);
    body.set('client_id', "ro.client");
    body.set('client_secret', "secret");
    let options = {
      headers: new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded')
    };
    return this.http.post(`${CONFIGURATION.baseUrls.authBaseUrl}/connect/token`, body.toString(), options).pipe(map((res: any = {}) => {
      let data: any = jwt_decode(res.access_token);
      if (res && res.access_token) {
        this.ISAUTHENTICATED = true;
        this.LoggedInUser.WebToken = res.access_token || '';
        this.LoggedInUser.RefreshToken = res.refresh_token || '';
       // this.LoggedInUser = new LoggedInUser(data);
        this.EncodeSecrects(res);
      return res;
    };
  }))
  }
  /**
   * Store authenticated response in localstorage to persist
   * @param res -Response From Authenticate API
   * @param isImpersonated 
   */
  EncodeSecrects(res: any = {}, isImpersonated = false): void {

    if (Object.keys(res).length > 0) {
      localStorage.setItem('token', btoa(JSON.stringify(res)));
    }
  }

  /**
   * Flush User Data
   */
  flushToken(): void {
    const ClearingItems: string[] = ['token', 'token2','SelectedStore','SelectedLocationGuid','UserDeportments','UserDeportments'];
    ClearingItems.forEach((item: string) => {
      localStorage.removeItem(item);
      localStorage.clear()
    });
    this.ISAUTHENTICATED = false;
    this.LoggedInUser = {} as any;
  }
  /**
   * Retrive Keys from the localstorage
   *
   */
  DecodeSecrects(): string {
    let data = localStorage.getItem('token') || '';
    if (data.length > 0) {
      return atob(data);
    } else {
      return '';
    }
  }
   /**
   * Validate Token
   * Check the issued date and current date to loggedin user
   */
   ValidateToken(token = ''): boolean {
    token = (token || '').split('.')[1] || '';
    if (token) {
      let part: any = JSON.parse(atob(token));
      const IDate = new Date(part.exp || '');
      const CDate = new Date();
      // TODO:
      // Check the Authentication server when for expiry date
      // Right now expiry date is not comming correctly
      // Check and add condition only for expiry date and logout the user
      if (token || IDate > CDate && 1) {
        return true;
      } else {
        this.logout();
      }
    }
    return false;
  }
  /**
   * Logout function clear the Token and other attributes from localstorage
   */
  logout(): void {
    this.flushToken();
    // Let the page to reload because to get the current and latest store information
    // this.router.navigateByUrl('/auth/login');
    // window.location.href = '.';
  }
  
    UpdatePassword(cred: IConfirmPassword) {
      let body = {
        userId:cred.userId,
        password: cred.password,
        confirmPassword: cred.confirmPassword
      } as any;
      let options = {
        headers: new HttpHeaders().set('Content-Type', 'application/json')
      };
      return this.http.post(`${CONFIGURATION.baseUrls.authBaseUrl}/api/v1/user/UpdatePassword`, body, options).pipe(map((res: any = {}) => {
        return res;
      }));
    }

    UpdateEmployeeProfile(input:any): Observable<any>  {
      return this.http.post<any>(`${CONFIGURATION.baseUrls.yodaBaseUrl}/api/UserManagement/UpdateEmployeeProfile`, input).pipe(map((res: any) => {
        return res || {};
    }));
    }

    GetJson(): Observable<any> {
      return this.http.get('/assets/countrycode.json');
    }

    CheckUserName(userName: string) {
      const params: any = { userName };
      return this.http.get<any>(`${CONFIGURATION.baseUrls.authBaseUrl}/api/v1/user/CheckDuplicateUserName`, { params }).pipe(map((res: any) => {
        return res || {};
      }));
    }

    /**
     * This is User Check if email already exists or not 
     */
    CheckUserEmail(Email: string) {
      const body: any = { Email: Email };
      let options = {
        headers: new HttpHeaders().set('Content-Type', 'application/json')
      };
      return this.http.post<any>(`${CONFIGURATION.baseUrls.authBaseUrl}/api/v1/Auth/DuplicateEmailCheck`, body, options).pipe(map((res: any) => {
        return res || {};
      }));
    }
    GetUserByGuid(userGuid: any): Observable<any> {
      const params: any = { userGuid };
      return this.http.get<any>(`${CONFIGURATION.baseUrls.authBaseUrl}/api/v1/User/GetUserByGuid`, { params }).pipe(map((res: any) => {
        return res || {};
      }));
    }
     /**
   * This is for EmailConfirm
   * @param UserGuid 
   * @param Email 
   * @returns 
   */

  UpdateEmailConfirmed(UserGuid: any) {
    let body = {
      UserGuid: UserGuid
    } as any;
    let options = {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    };
    return this.http.post(`${CONFIGURATION.baseUrls.authBaseUrl}/api/v1/user/UpdateEmailConfirmed`, body, options).pipe(map((res: any = {}) => {
      return res;
    }));
  }
  /**
   * This is used to resend email verification email
   */
  ResendEmail(UpdateDate: any,UserGuid:any) {
    const body: any = { UpdateDate,UserGuid };
    let options = {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    };
    return this.http.post<any>(`${CONFIGURATION.baseUrls.authBaseUrl}/api/v1/User/ResendEmailVerification`, body, options).pipe(map((res: any) => {
      return res || {};
    }));
  }
  sendEmail(body: any): Observable<any> {
    let options = {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    };
    return this.http.post<any>(`${CONFIGURATION.baseUrls.yodaBaseUrl}/api/Email/SendEmail`, body,options).pipe(map((res: any) => {
      return res || {};
    }));
  }
}
