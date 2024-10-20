import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { CONFIGURATION } from 'src/app/app.constant';

@Injectable({
  providedIn: 'root'
})
export class PurchaseOrderService {

  constructor(private http: HttpClient) { }
/**
 * 
 * @returns this method id used for the get default data 
 */
  GetPurchaseOrderPostDefaults(UserLocationGuid:any): Observable<any> {
    const params: any = { UserLocationGuid};
    return this.http.get( `${CONFIGURATION.baseUrls.yodaBaseUrl}/api/PurchaseOrder/GetPurchaseOrderPostDefaults`,{params} ).pipe(map((res: any = {}) => {
      return res;
    }));
  }
  /**
   * 
   * @param SupplierGuid this method ios used for the get the SupplierItems By Guid
   * @returns 
   */
  GetSupplierItemsByGuid(SupplierGuid:any): Observable<any> {
  return this.http.get( `${CONFIGURATION.baseUrls.yodaBaseUrl}/api/PurchaseOrder/GetPurchaseOrderItemsBySupplierGuid?SupplierGuid=`+SupplierGuid ).pipe(map((res: any = {}) => {
    return res;
  }));
}
/**
 * 
 * @param body this event is used for save the PurchaseOrderDetails
 * @returns 
 */
SavePurchaseOrderDetails(body:any): Observable<any> {
   
  return this.http.post( `${CONFIGURATION.baseUrls.yodaBaseUrl}/api/PurchaseOrder/SavePurchaseOrderDetails`, body).pipe(map((res: any ) => {
    return res;
  }));
}
/**
 * 
 * @param Keyword 
 * @param OrderBy 
 * @param SortType 
 * @param PageNumber 
 * @param RowCount 
 * @returns 
 * This method is used for get the all purchase order details
 */
GetAllPurchaseOrderDetails(Keyword?: string, OrderBy: string = "", SortType :string='asc', PageNumber = 1, RowCount = 40,Isurgent:boolean=false,Filter='',IsChangeQuotation:Boolean=false,UserLocationGuid?:string): Observable<any> {
  const params: any = { PageNumber, RowCount, Keyword, OrderBy, SortType,Isurgent,Filter,IsChangeQuotation,UserLocationGuid};
  return this.http.get( `${CONFIGURATION.baseUrls.yodaBaseUrl}/api/PurchaseOrder/GetAllPurchaseOrders`,{params} ).pipe(map((res: any = {}) => {
    return res;
  }));
}
/**
 * 
 * @param purchaseOrderGuid 
 * @returns 
 * this method is used for delete the purchase order
 */
DeletePurchaseOrderDetails(purchaseOrderGuid:any,UserGuid:any): Observable<any> {
  let options = {
    purchaseOrderGuid:purchaseOrderGuid,
    UserGuid:UserGuid
  };
  return this.http.post( CONFIGURATION.baseUrls.yodaBaseUrl+'/api/PurchaseOrder/DeletePurchaseOrder',options ).pipe(map((res: any ) => {
    return res;
  }));
}
/**
 * 
 * @param PurchaseOrederGuid 
 * @returns To get the purchase order details while edit the PurchaseOrderDetails
 */
GetPurchaseOrderDetails(PurchaseOrederGuid:any): Observable<any> {
  return this.http.get( `${CONFIGURATION.baseUrls.yodaBaseUrl}/api/PurchaseOrder/GetPurchaseOrderDetails?PurchaseOderGuid=`+PurchaseOrederGuid ).pipe(map((res: any = {}) => {
    return res;
  }));
}
GetGetPIForPODefaults(FromDate: any, ToDate: any, IndentNo :any, LocationGuid:any, SupplierGuid:any,UserLocationGuid:any): Observable<any> {
  const params: any = { FromDate, ToDate, IndentNo, LocationGuid, SupplierGuid,UserLocationGuid};
  return this.http.get( `${CONFIGURATION.baseUrls.yodaBaseUrl}/api/PurchaseOrder/GetPIForPODefaults`,{params} ).pipe(map((res: any = {}) => {
    return res;
  }));
}
GetPOAgainstPIPostDefaults(UserLocationGuid:any): Observable<any> {
  const params: any = {UserLocationGuid};
  return this.http.get( `${CONFIGURATION.baseUrls.yodaBaseUrl}/api/PurchaseOrder/GetPOAgainstPIPostDefaults`,{params} ).pipe(map((res: any = {}) => {
    return res;
  }));
}
SavePurchaseOrderPOAgainstPI(body:any): Observable<any> {
   
  return this.http.post( `${CONFIGURATION.baseUrls.yodaBaseUrl}/api/PurchaseOrder/SavePurchaseOrderPOAgainstPI`, body).pipe(map((res: any ) => {
    return res;
  }));
}
UpdatePurchaseOrderStatus(body:any): Observable<any> {
  return this.http.post( CONFIGURATION.baseUrls.yodaBaseUrl+'/api/PurchaseOrder/UpdatePurchaseOrderStatus',body ).pipe(map((res: any ) => {
    return res;
  }));
}
/**
 * this service is used to get the Indent reports details
 * @param FromDate 
 * @param ToDate 
 * @param POType 
 * @returns 
 */
GetIndentReports(FromDate: string="", ToDate: string="", POType :string="",UserLocationGuid?:any,CenterGuid?:string,SupplierGuid:any=null): Observable<any> {
  const params: any = { FromDate, ToDate, POType,UserLocationGuid,CenterGuid}
  if(SupplierGuid!==null){
    params.SupplierGuid=SupplierGuid;
  }
  return this.http.get( `${CONFIGURATION.baseUrls.yodaBaseUrl}/api/PurchaseOrder/GetPOReportDetails`,{params} ).pipe(map((res: any = {}) => {
    return res;
  }));
}
GetItemsStockExpReports(params = {} as any){
  return this.http.get<any>(`${CONFIGURATION.baseUrls.yodaBaseUrl}/api/AllReports/GetStockExpiryReports`,{ params }).pipe(map((res: any) => {
    return res || {};
  }));
}
GetPurchaseItemReports(params = {} as any) {
  return this.http.get<any>(`${CONFIGURATION.baseUrls.yodaBaseUrl}/api/AllReports/GetPurachaseItemsReports`,{ params }).pipe(map((res: any) => {
    return res || {};
  }));
}
UpdateShipiingLocation(purchaseOrderGuid:any,locationGuid:any): Observable<any> {
  let options = {
    PurchaseOrderGuid:purchaseOrderGuid,
    ShippingLocationGuid:locationGuid
  };
  return this.http.post( CONFIGURATION.baseUrls.yodaBaseUrl+'/api/PurchaseOrder/UpdateShippinLocation',options ).pipe(map((res: any ) => {
    return res;
  }));
}
GetEditPOView(PurchaseOrdernumber: string) {
  const params: any = { PurchaseOrdernumber }
  return this.http.get<any>(`${CONFIGURATION.baseUrls.yodaBaseUrl}/api/PurchaseOrder/ViewPurchaseOrderDetails`, { params }).pipe(map((res: any) => {
    return res || [];
  }));
}
SavePaymentHistory(body:any): Observable<any> {
  return this.http.post( `${CONFIGURATION.baseUrls.yodaBaseUrl}/api/POPaymentHistoryContoller/savePOPaymentHistory`, body).pipe(map((res: any ) => {
    return res;
  }));
}


getPaymentHistory(params:any): Observable<any> {
  return this.http.get( `${CONFIGURATION.baseUrls.yodaBaseUrl}/api/POPaymentHistoryContoller/getPOPaymentHistory`, { params }).pipe(map((res: any ) => {
    return res;
  }));
}


Uploadfiles(file : any){
  return this.http.post( `${CONFIGURATION.baseUrls.yodaBaseUrl}/api/Upload/Uploadinvoice`, file).pipe(map((res: any ) => {
    return res;
  }));
}

} 