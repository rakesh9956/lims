import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { CONFIGURATION } from 'src/app/app.constant';

@Injectable({
  providedIn: 'root'
})
export class AllReportsService {
  yodaBaseUrl!: string;
  constructor(private http: HttpClient) {
    this.yodaBaseUrl = CONFIGURATION.baseUrls.yodaBaseUrl
  }
  /**
   * this service methis get the stock ledger reports
   * @param FromDate 
   * @param ToDate 
   * @param LocationGuid 
   * @param CategoryTypeGuid 
   * @param SubCategoryTypeGuid 
   * @param ItemGuid 
   * @returns 
   */


  GetStockLedgerReports(FromDate: any, ToDate: any, LocationGuid: any,ItemGuid?:any) {
    const params: any = { FromDate, ToDate, LocationGuid,ItemGuid }
    return this.http.get<any>(`${CONFIGURATION.baseUrls.yodaBaseUrl}/api/AllReports/GetStockLedgerReports`, { params }).pipe(map((res: any) => {
      return res || [];
    }));
  }

  GetIndentLocation(params = {} as any) {
    return this.http.get<any>(`${CONFIGURATION.baseUrls.yodaBaseUrl}/api/Indent/GetIndentLocation`, { params }).pipe(map((res: any) => {
      return res || {};
    }));
  }

  getItemsDefaults(params = {} as any) {
    return this.http.get<any>(`${this.yodaBaseUrl}/api/Items/GetItemsDefaults`, { params }).pipe(map((res: any) => {
      return res || {};
    }));
  }

  getLowStockReports( LocationsGuid:any=null)
   {
    const params: any = {LocationsGuid}; 
    if (LocationsGuid !== null) {
      params.LocationsGuid = LocationsGuid;
    }    
    return this.http.get<any>(`${this.yodaBaseUrl}/api/AllReports/GetLowStockReports`, { params }).pipe(map((res: any) => {
      return res || {}
    }))
  }


  getStatusReports(LocationGuid:any=null,ItemGuid:any=null,FromDate:any='',ToDate:any='',IsStore:any) {
    const params: any = {LocationGuid,ItemGuid,FromDate,ToDate,IsStore};  
    return this.http.get<any>(`${this.yodaBaseUrl}/api/AllReports/GetStockStatusReports`, { params }).pipe(map((res: any) => {
      return res || {}
    }))
  }

  GetconsumeReports(FromDate:any,ToDate:any,CenterTypeGuid:any,ZoneGuid:any,StateGuid:any,CityGuid:any,CenterGuid:any,UserLocationGuid:any,CategoryTypeGuid:any,ItemGuid:any,ItemCategoryGuid:any) {
    const params: any = { FromDate,ToDate,CenterTypeGuid,ZoneGuid,StateGuid,CityGuid,CenterGuid,UserLocationGuid,CategoryTypeGuid,ItemGuid,ItemCategoryGuid }  
    return this.http.get<any>(`${CONFIGURATION.baseUrls.yodaBaseUrl}/api/AllReports/GetIndentConsumeReports`, { params }).pipe(map((res: any) => {
      return res || [];
    }));
   }
   getApprovalQuotations(CenterGud:any=null,FromDate:any='',ToDate:any='',UserLocationGuid:any=null,SupplierGuid:any=null) {
    const params: any={UserLocationGuid,CenterGud,FromDate,ToDate}
    if (SupplierGuid !== null) {
      params.SupplierGuid = SupplierGuid;
    }
     return this.http.get<any>(`${this.yodaBaseUrl}/api/AllReports/GetApprovalQuoationReports`, { params }).pipe(map((res: any) => {
      return res || {};
    }));
  }
  GetStockinHandReports(FromDate:any,ToDate:any,CenterGuid:any,UserLocationGuid: any)
  {
   const params: any= {FromDate,ToDate,CenterGuid,UserLocationGuid}
   return this.http.get<any>(`${CONFIGURATION.baseUrls.yodaBaseUrl}/api/AllReports/GetStockinHandReports`, { params }).pipe(map((res: any) => {
     return res || [];
   }));
  }
  getIssueReports(UserLocationGuid='',FromDate='',ToDate='',IsStore:boolean){
    const params: any= {UserLocationGuid,FromDate,ToDate,IsStore}
    return this.http.get<any>(`${CONFIGURATION.baseUrls.yodaBaseUrl}/api/AllReports/GetIssueReports`, { params }).pipe(map((res: any) => {
      return res;
    }));
  }
  
  getStockExpiryReports(params = {} as any) {
    return this.http.get<any>(`${this.yodaBaseUrl}/api/AllReports/GetStockExpiryReports`, { params }).pipe(map((res: any) => {
      return res || {};
    }));
  }
  GetStockVerificationReports(FromDate:any,ToDate:any,LocationGuid: any,ItemGuid:any)
  {
   const params: any= {FromDate,ToDate,LocationGuid,ItemGuid}
   return this.http.get<any>(`${CONFIGURATION.baseUrls.yodaBaseUrl}/api/AllReports/GetStockVerificationReports`, { params }).pipe(map((res: any) => {
     return res || [];
   }));
  }
  GetStockTransaction(FromDate: any, ToDate: any,ItemGuid?:any,LocationGuid?:any,) {
    const params: any = { FromDate, ToDate,ItemGuid,LocationGuid}
    return this.http.get<any>(`${CONFIGURATION.baseUrls.yodaBaseUrl}/api/AllReports/GetStockTransactionReports`, { params }).pipe(map((res: any) => {
      return res || [];
    }));
  }
  GetStoreStockinHandReports(CenterGuid:any,UserLocationGuid: any,ItemGuid:any)
  {
   const params: any= {CenterGuid,UserLocationGuid,ItemGuid}
   return this.http.get<any>(`${CONFIGURATION.baseUrls.yodaBaseUrl}/api/AllReports/GetStoreStockinHandReports`, { params }).pipe(map((res: any) => {
     return res || [];
   }));
  }
}
