import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CONFIGURATION } from 'src/app/app.constant';
import { map, Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class GrnService {
  yodaBaseUrl!: string;
  constructor(private http: HttpClient) {
    this.yodaBaseUrl = CONFIGURATION.baseUrls.yodaBaseUrl
  }

  /**Get GRN status */
  getGRN(PageNumber: any, RowCount: any, Keyword: string = '', OrderBy: string = '', SortType: any = 'desc', CenterLocationGuid: any, selecteFromDate: any, selecteToDate: any,invoiceGuid:any
 , post:any,Unpost:any,Cancel:any,MakerStatus:any,ChekerStatus:any,UserLocationGuid?:any) {
    const params: any = { PageNumber, RowCount, Keyword, OrderBy, SortType, CenterLocationGuid, selecteFromDate, selecteToDate,invoiceGuid,post,Unpost,Cancel,MakerStatus,ChekerStatus,UserLocationGuid}
    return this.http.get<any>(`${CONFIGURATION.baseUrls.yodaBaseUrl}/api/GoodsReceiptNotes/GetGRN`, { params }).pipe(map((res: any) => {
      return res || [];
    }));
  }
  /**Get GRN status */
  GetPOnumbers(CenterLocationGuid: string) {
    const params: any = { CenterLocationGuid }  
    return this.http.get<any>(`${CONFIGURATION.baseUrls.yodaBaseUrl}/api/GoodsReceiptNotes/GetPOnumbers`, { params }).pipe(map((res: any) => {
      return res || [];
    }));
  }
  SaveGRNDetails(body: any): Observable<any> {
    return this.http.post(`${CONFIGURATION.baseUrls.yodaBaseUrl}/api/GoodsReceiptNotes/SaveInvoiceDetails`, body).pipe(map((res: any) => {
      return res;
    }));
  }
  /**
* 
* @param formData Upload company logo 
* @returns 
*/
  Uploadinvoice(formData: FormData): Observable<any> {
    return this.http.post(CONFIGURATION.baseUrls.yodaBaseUrl + '/api/Upload/Uploadinvoice', formData).pipe(map((res: any) => {
      return res || {};
    }));
  }
  /**
   * @param GRNGuid 
   * @returns 
   */
  GetEditGRNdetails(InvoiceGuid: string) {
    const params: any = { InvoiceGuid }
    return this.http.get<any>(`${CONFIGURATION.baseUrls.yodaBaseUrl}/api/GoodsReceiptNotes/GetEditGRNdetails`, { params }).pipe(map((res: any) => {
      return res || [];
    }));
  }
  UpdateGRNPostStatus(body:any): Observable<any> {
    return this.http.post(`${CONFIGURATION.baseUrls.yodaBaseUrl}/api/GoodsReceiptNotes/UpdateGRNPostStatus`,body).pipe(map((res: any) => {
      return res;
    }));
  }
  UpdateGRNCancel(body:any): Observable<any> {
    return this.http.post(`${CONFIGURATION.baseUrls.yodaBaseUrl}/api/GoodsReceiptNotes/UpdateGRNCancel`,body).pipe(map((res: any) => {
      return res;
    }));
  }
  UpdateGRNStatus(body:any): Observable<any> {
    return this.http.post(`${CONFIGURATION.baseUrls.yodaBaseUrl}/api/GoodsReceiptNotes/UpdateGRNStatus`,body).pipe(map((res: any) => {
      return res;
    }));
  }
  GetGrnReports(FromDate: string="", ToDate: string="",FilterOn:string,Status:string,CenterTypeGuid:any,ZoneGuid:any,StateGuid:any,CityGuid:any,CenterGuid:any,UserLocationGuid:any,ReportTypeInExcelGuid:any,GRNTypeGuid:any):Observable<any>{
    const params: any = { FromDate, ToDate,FilterOn,Status,CenterTypeGuid, ZoneGuid,StateGuid,CityGuid,CenterGuid,UserLocationGuid,ReportTypeInExcelGuid,GRNTypeGuid};
    return this.http.get( `${CONFIGURATION.baseUrls.yodaBaseUrl}/api/AllReports/GetGRNReports`,{params} ).pipe(map((res: any = {}) => {
      return res;
    }));
  }
}
