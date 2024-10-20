import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { CONFIGURATION } from 'src/app/app.constant';

@Injectable({
  providedIn: 'root'
})
export class UserManagementService {
  yodaBaseUrl:string;
  constructor(private http: HttpClient) {
    this.yodaBaseUrl = CONFIGURATION.baseUrls.yodaBaseUrl
   }
   getUserDefaults():Observable<any>{
    return this.http.get(CONFIGURATION.baseUrls.yodaBaseUrl+'/api/UserManagement/GetUserDefaults').pipe(map((res: any = {}) => {
      return res;
    })); 
  }

  saveEmployeeDetails(body: any): Observable<any> {
    return this.http.post<any>(`${this.yodaBaseUrl}/api/UserManagement/SaveEmployeeDetails`, body).pipe(map((res: any) => {
        return res || {};
    }));
  }

getAllUsers(pageNumber = 1, rowCount = 10 ,Keyword?: string, OrderBy: string="",SortType:string='desc',Active?:any,Center:string='', ClientType:any = null) : Observable<any>{
    const params: any = { pageNumber, rowCount , Keyword, OrderBy, SortType,Active,Center , ClientType};
    return this.http.get<any>(`${CONFIGURATION.baseUrls.yodaBaseUrl}/api/UserManagement/GetAllUsers`, { params }).pipe(map((res: any={}) => {
      return res || {};
    }));
  }

  getAllUsersList(Center:string='') : Observable<any>{
    const params: any = { Center};
    return this.http.get<any>(`${CONFIGURATION.baseUrls.yodaBaseUrl}/api/UserManagement/GetAllUsers`,{ params }).pipe(map((res: any={}) => {
      return res || {};
    }));
  }
  getUsersList(Center:string='') : Observable<any>{
    const params: any = { Center};
    return this.http.get<any>(`${CONFIGURATION.baseUrls.yodaBaseUrl}/api/UserManagement/GetUsers`,{ params }).pipe(map((res: any={}) => {
      return res || {};
    }));
  }
  getUserDetails(EmployeeGuid:any):Observable<any>{
    const params: any = { EmployeeGuid};
    return this.http.get(CONFIGURATION.baseUrls.yodaBaseUrl+'/api/UserManagement/GetUserDetails',{params}).pipe(map((res: any = {}) => {
      return res;
    })); 
  }

  saveXMLDetails(XMLlist : any){
    let options = {
      lstsaveXMLUserDetailsUDT : XMLlist
    }

    return this.http.post<any>(CONFIGURATION.baseUrls.yodaBaseUrl+'/api/UserManagement/SaveUserXMLData', options).pipe(map((res: any) => {
       return res || {};
    }));
  }

  saveEmployeeXMLDetails(body : any): Observable<any> {
    let Options = {
      saveXMLEmployeeDetailsCommandUDT : body
    }
    return this.http.post<any>(CONFIGURATION.baseUrls.yodaBaseUrl+'/api/UserManagement/SaveXMLEmployeeDetails', Options).pipe(map((res: any) => {
        return res || {};
    }));
  }
  registerUser(cred: any): Observable<any> {
    let body = {
      email: cred.email,
      password: cred.password,
      confirmPassword: cred.confirmPassword,
      createDate:cred.CreateDate,
      updateDate:cred.UpdateDate,
      firstName:cred.FirstName,
      PhoneNumber:cred.PhoneNumber,
      CountryCode:cred.CountryCode,
      EmailConfirmed:cred.EmailConfirmed,
      UserName:cred.UserName,
      Clienttype:cred.Clienttype,
      paymentRoles:cred.paymentRoles
    } as any;
    let options = {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    };
    return this.http.post(`${CONFIGURATION.baseUrls.authBaseUrl}/api/v1/auth/signup`, body, options).pipe(map((res: any = {}) => {
      return res;
    }));
  }
  OnUpdateUserActivityStatus(body:any): Observable<any> {
    let Body = {
      IsActive:body.IsActive,
      UserGuid:body.UserGuid
    } as any;
    let options = {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    };
    return this.http.post<any>(`${CONFIGURATION.baseUrls.authBaseUrl}/api/v1/User/UpdateIsdeleted`, Body,options).pipe(map((res: any) => {
        return res || {};
    }));
  }
  updateEmail(body:any): Observable<any> {
    let Body = {
      Email:body.email,
      UserGuid:body.UserGuid
    } as any;
    let options = {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    };
    return this.http.post<any>(`${CONFIGURATION.baseUrls.authBaseUrl}/api/v1/Auth/UpdateEmail`, Body,options).pipe(map((res: any) => {
        return res || {};
    }));
  }
  deactivateUser(body:any): Observable<any> {
    return this.http.post<any>(`${CONFIGURATION.baseUrls.yodaBaseUrl}/api/UserManagement/DeactivateUser`, body).pipe(map((res: any) => {
        return res || {};
    }));
  }

  saveDesignation(body: any): Observable<any> {
    let params={
      Designation:body
    }
    return this.http.post<any>(`${CONFIGURATION.baseUrls.yodaBaseUrl}/api/UserManagement/SaveDesignation`,params).pipe(map((res: any) => {
     return res || {};
    }));
  }

  saveCenter(body: any): Observable<any> {
    let params={
      Center:body
    }
    return this.http.post<any>(`${CONFIGURATION.baseUrls.yodaBaseUrl}/api/UserManagement/SaveCenter`,params).pipe(map((res: any) => {
     return res || {};
    }));
  }
  GetDuplicateUserDetails(KeyWord:any,searchType:any) : Observable<any>{
    const params: any = { KeyWord, searchType};
    return this.http.get<any>(`${CONFIGURATION.baseUrls.yodaBaseUrl}/api/UserManagement/GetDuplicateUserDetails`, { params }).pipe(map((res: any={}) => {
      return res || {};
    }));
  }
  GetUserPermissionLocations(UserLocationGuid:string=""){
    const params: any = { UserLocationGuid};
    return this.http.get<any>(`${CONFIGURATION.baseUrls.yodaBaseUrl}/api/UserManagement/GetUserPermissionLocations`,{params}).pipe(map((res: any) => {
      return res || {};
    }));
  }
 
    
}