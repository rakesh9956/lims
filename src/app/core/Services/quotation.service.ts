import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { CONFIGURATION } from 'src/app/app.constant';

@Injectable({
  providedIn: 'root'
})
export class QuotationService {

  yodaBaseUrl:string;
  getAllQuotationDetails: any;

  constructor(private http: HttpClient) { 
    this.yodaBaseUrl = CONFIGURATION.baseUrls.yodaBaseUrl
  }
  saveQuotationsData(input:any): Observable<any>  {
    return this.http.post<any>(`${this.yodaBaseUrl}/api/Quotation/SaveQuotation`, input).pipe(map((res: any) => {
      return res || {};
   }));
   }

   getQuotationPostDefaults(UserLocationGuid:any): Observable<any>  {
    const params:any={UserLocationGuid}
    return this.http.get<any>(`${this.yodaBaseUrl}/api/Quotation/GetQuotationPostDefaults`,{params}).pipe(map((res: any) => {
      return res || {};
   }));
   }



   getAllItems(PageNumber = 1, RowCount = 40, Keyword?: string, OrderBy?: string, SortType? :string,IsActive:boolean=false): Observable<any> {
    const params: any = {PageNumber, RowCount, Keyword, OrderBy, SortType,IsActive};
    return this.http.get<any>(`${this.yodaBaseUrl}/api/Items/GetAllItemsData`, { params }).pipe(map((res: any = {}) => {
      return res || {};
    }));
  }

  getSupplierPostDefaults(): Observable<any>  {
    return this.http.get<any>(`${this.yodaBaseUrl}/api/Supplier/GetSupplierPostDefaults`).pipe(map((res: any) => {
      return res || {};
   }));
   }

   getAllQuotations(SupplierGuid:any=[],ItemGuid:any=[],LocationGuid:any=[],Keywords:any="",FromDate:any,ToDate:any,PageNo:any,PageSize:any,OrderBy:any="",SortType:any="",IsCreated:any,IsChecked:any,IsApproved:any,UserLocationGuid?:any): Observable<any> {   
    const params: any = { SupplierGuid,ItemGuid,LocationGuid,Keywords,FromDate,ToDate,PageNo,PageSize,OrderBy,SortType,IsCreated,IsChecked,IsApproved,UserLocationGuid };
    return this.http.get<any>(`${this.yodaBaseUrl}/api/Quotation/GetAllQuotations`, {params}).pipe(map((res: any = {}) => {
      return res || {};
    }));
  }

  getAllQuotationsForExport(SupplierGuid:any=[],ItemGuid:any=[],LocationGuid:any=[],Keywords:any="",FromDate:any,ToDate:any,PageNo:any,PageSize:any,OrderBy:any="",SortType:any="",IsCreated:any,IsChecked:any,IsApproved:any,UserLocationGuid?:any): Observable<any> {   
    const params: any = { SupplierGuid,ItemGuid,LocationGuid,Keywords,FromDate,ToDate,PageNo,PageSize,OrderBy,SortType,IsCreated,IsChecked,IsApproved,UserLocationGuid };
    return this.http.get<any>(`${this.yodaBaseUrl}/api/Quotation/GetAllQuotationsForExport`, {params}).pipe(map((res: any = {}) => {
      return res || {};
    }));
  }


  getQuotationsByGuid(QuotationGuid:any ): Observable<any> {   
    const params: any = {QuotationGuid};
    return this.http.get<any>(`${this.yodaBaseUrl}/api/Quotation/GetQuotationByGuid`, {params}).pipe(map((res: any = {}) => {
      return res || {};
    }));
  }

  updateQuotationsData(input:any): Observable<any>  {
    return this.http.post<any>(`${this.yodaBaseUrl}/api/Quotation/UpdateQuotationStatus`, input).pipe(map((res: any) => {
      return res || {};
   }));
   }
   DeleteQuotation(QuotationGuid:any): Observable<any> {
    let options = {
      QuotationGuid:QuotationGuid
    };
    return this.http.post( CONFIGURATION.baseUrls.yodaBaseUrl+'/api/Quotation/DeleteQuotation',options ).pipe(map((res: any ) => {
      return res;
    }));
  }
  UpdateQuotationCancel(body:any): Observable<any> {
    return this.http.post(`${CONFIGURATION.baseUrls.yodaBaseUrl}/api/Quotation/UpdateQuotationStatus`,body).pipe(map((res: any) => {
      return res;
    }));
  }

  UpdateQuotationItemCancel(body:any): Observable<any> {
    return this.http.post(`${CONFIGURATION.baseUrls.yodaBaseUrl}/api/Quotation/CancelQuotationItem`,body).pipe(map((res: any) => {
      return res;
    }));
  }
 }
