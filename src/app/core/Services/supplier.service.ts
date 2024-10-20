import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { CONFIGURATION } from 'src/app/app.constant';

@Injectable({
  providedIn: 'root'
})
export class SupplierService {
  yodaBaseUrl:string;
  constructor(private http: HttpClient) { 
      this.yodaBaseUrl = CONFIGURATION.baseUrls.yodaBaseUrl
    }
 /**
 * Get All Suppliers details
 * @param keyword 
 * @param orderBy 
 * @param sortType 
 * @param pageNumber 
 * @param rowCount 
 * @returns 
 */
  GetAllSuppliers(  keyword: string="", orderBy: string = "", sortType :string='desc', pageNumber = -1, rowCount = -1,SearchType:string="",Active:string): Observable<any> {
    const params: any = { keyword, orderBy, sortType, pageNumber, rowCount,SearchType, Active};
    return this.http.get<any>(`${CONFIGURATION.baseUrls.yodaBaseUrl}/api/Supplier/GetAllSuppliers`, { params }).pipe(map((res: any = {}) => {
      return res || {};
    }));
  }
 /**
 * Save Suppliers Details
 * @param body 
 * @returns 
 */
  SaveSupplierDetails(body: any): Observable<any> {
    return this.http.post<any>(`${this.yodaBaseUrl}/api/Supplier/SaveSupplierDetails`, body).pipe(map((res: any) => {
        return res || {};
    }));
 }
 /**
 * Get Suppliers Post Defaults
 * @returns 
 */
  GetSupplierPostDefaults():Observable<any>{
  return this.http.get(CONFIGURATION.baseUrls.yodaBaseUrl+'/api/Supplier/GetSupplierPostDefaults').pipe(map((res: any = {}) => {
    return res;
  })); 
 }
 /**
 * 
 * @param supplierGuid 
 * @returns 
 * this method is used for delete the supplier
 */
 DeleteSupplierDetails(SupplierGuid:any): Observable<any> {
  let options = {
    SupplierGuid:SupplierGuid
  };
  return this.http.post( CONFIGURATION.baseUrls.yodaBaseUrl+'/api/Supplier/DeleteSupplier',options ).pipe(map((res: any ) => {
    return res;
  }));
 }

 /**
 * Get Supplier PendingPo details
 * @param SupplierGuid 
 */
 GetSupplierPendingPo(  SupplierGuid: string): Observable<any> {
  const params: any = { SupplierGuid};
  return this.http.get<any>(`${CONFIGURATION.baseUrls.yodaBaseUrl}/api/Items/GetSupplierPendingPo`, { params }).pipe(map((res: any = {}) => {
    return res || {};
  }));
}
UpdateSupplierStatus(SupplierGuid:any): Observable<any> {
  let options = {
    SupplierGuid:SupplierGuid
  };
  return this.http.post( `${CONFIGURATION.baseUrls.yodaBaseUrl}/api/Supplier/UpdateSupplier`,options ).pipe(map((res: any ) => {
    return res;
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
