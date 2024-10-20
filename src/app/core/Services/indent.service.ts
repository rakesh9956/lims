import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { CONFIGURATION } from 'src/app/app.constant';

@Injectable({
  providedIn: 'root'
})
export class IndentService {
  [x: string]: any;
  notifyScore(arg0: number, arg1: string) {
    throw new Error('Method not implemented.');
  }
  yodaBaseUrl!:string;
  constructor(
    private http: HttpClient,
  ) {
    this.yodaBaseUrl = CONFIGURATION.baseUrls.yodaBaseUrl;
  }
  GetIndentLocation(params = {} as any){
    return this.http.get<any>(`${CONFIGURATION.baseUrls.yodaBaseUrl}/api/Indent/GetIndentLocation`,{params}).pipe(map((res: any) => {
      return res || {};
    }));
  }
  getCategory(params = {} as any){
  return this.http.get<any>(`${CONFIGURATION.baseUrls.yodaBaseUrl}/api/Items/GetCateogory`,{ params }).pipe(map((res: any) => {
  return res || {};
 }));
 }
 Getindentitems(B2Btype:any,LocationGuid?:any){
  const params: any = { B2Btype,LocationGuid:LocationGuid?LocationGuid:''}
  return this.http.get<any>(`${CONFIGURATION.baseUrls.yodaBaseUrl}/api/Indent/Getindentitems`,{params}).pipe(map((res: any) => {
    return res || {};
  }));
 }
 SaveIndentDetails(body:any){
  return this.http.post( CONFIGURATION.baseUrls.yodaBaseUrl+'/api/Indent/SaveIndentDetail',body ).pipe(map((res: any ) => {
    return res;
  }));
 }
 GetAllIndentDetails(PageNumber = 1, RowCount = 40,Keyword?: string, OrderBy: string = "", SortType :string='asc',UserLocationGuid:string="",IndentType:string="",IsStore:any=[]){
  const params: any = { PageNumber, RowCount, Keyword, OrderBy, SortType,UserLocationGuid,IndentType,IsStore };
  return this.http.get<any>(`${CONFIGURATION.baseUrls.yodaBaseUrl}/api/Indent/GetAllIndents`,{params}).pipe(map((res: any) => {
    return res || {};
  }));
}
GetIndentItemDeatilsByGuid(IndentGuid:any,IndentType:any){
  const params:any={IndentGuid,IndentType}
  return this.http.get<any>(`${CONFIGURATION.baseUrls.yodaBaseUrl}/api/Indent/GetIndentItemDeatilsByGuid`,{params}).pipe(map((res: any) => {
    return res || {};
  }));
}
IndentReports(LocationGuid:any,FromDate:any,ToDate:any,IsStore:any){
  const params: any = {LocationGuid,FromDate,ToDate,IsStore};
  return this.http.get<any>(`${CONFIGURATION.baseUrls.yodaBaseUrl}/api/Indent/IndentReports`,{ params }).pipe(map((res: any) => {
    return res || {};
   }));
 }
// GetIndentReportsDefaults(): Observable<any>  {
//  return this.http.get<any>(`${this.yodaBaseUrl}/api/Indent/GetIndentReportsDefaults`).pipe(map((res: any) => {
//  return res || {};
// }));
// }
IndentStatus(input:any): Observable<any>  {
  return this.http.post<any>(`${this.yodaBaseUrl}/api/Indent/IndentStatus`, input).pipe(map((res: any) => {
    return res || {};
 }));
 }
 /**
  * Get The SI Indent Details
  * @param FromLocationGuid 
  * @param ToLocationGuid 
  * @returns 
  */
 GetSIindentDetails(FromLocationGuid:any,ToLocationGuid:any,Keyword:any,IssueFromDate:any,IssueToDate:any){
  const params: any = {FromLocationGuid,ToLocationGuid,Keyword,IssueFromDate,IssueToDate}
  return this.http.get<any>(`${CONFIGURATION.baseUrls.yodaBaseUrl}/api/Indent/GetSIIndentsDetails`,{params}).pipe(map((res: any) => {
    return res || {};
  }));
 }
  /**
  * this method used to Create batch for items
  */
 SavBatchDetails(body: any): Observable<any> {
  return this.http.post(`${CONFIGURATION.baseUrls.yodaBaseUrl}/api/Indent/SaveBatchDetails`, body).pipe(map((res: any) => {
    return res;
  }));
}
 /**
  * this method used to save the Recived items
  */
SavReciveDetails(body: any): Observable<any> {
  return this.http.post(`${CONFIGURATION.baseUrls.yodaBaseUrl}/api/Indent/SaveReciveDetails`, body).pipe(map((res: any) => {
    return res;
  }));
}
 /**
  * this method used to Get the Batch created items
  */
GetBatchDetail(FromDate:any,EndDate:any,PageNumber:any,RowCount:any,Keyword:any,OrderBy:any,SortType:any,UserLocationGuid:any,IsStore:any){
  const params: any = {FromDate,EndDate,PageNumber,RowCount,Keyword,OrderBy,SortType,UserLocationGuid,IsStore}
  return this.http.get<any>(`${CONFIGURATION.baseUrls.yodaBaseUrl}/api/Indent/GetBatchDetails`,{params}).pipe(map((res: any) => {
    return res || {};
  }));
 }
 /**
  * this method used to save the Dispatch items
  */
 SaveDispatch(body: any): Observable<any> {
  return this.http.post(`${CONFIGURATION.baseUrls.yodaBaseUrl}/api/Indent/SaveBatchDispatchDetails`, body).pipe(map((res: any) => {
    return res;
  }));
}
/**
  * this method used to save the Consume items
  */
SaveConsumeDetails(body: any): Observable<any> {
  return this.http.post(`${CONFIGURATION.baseUrls.yodaBaseUrl}/api/Indent/SaveConsumeDetails`, body).pipe(map((res: any) => {
    return res;
  }));
}
/**
 * 
 * @param purchaseOrderGuid 
 * @returns 
 * this method is used for delete the purchase order
 */
DeleteIndentDetails(IndentGuid:any): Observable<any> {
  let options = {
    IndentGuid:IndentGuid
  };
  return this.http.post( CONFIGURATION.baseUrls.yodaBaseUrl+'/api/Indent/DeleteIndentDetail',options ).pipe(map((res: any ) => {
    return res;
  }));
}
/**
 * 
 * @param LocationGuid 
 * @returns 
 * This service method is used to get the ReceivedItemsDetails items by passing the location guid
 */
GetReceivedItemsDetails(LocationGuid:any){
  return this.http.get<any>(`${CONFIGURATION.baseUrls.yodaBaseUrl}/api/Indent/GetReceivedItemsDetailsByGuid?LocationGuid=`+LocationGuid).pipe(map((res: any) => {
    return res || {};
  }));
}
/**
 * 
 * @returns This service call is used to get the approved si's 
 */
GetApprovedSIForPI(LocationGuid?:string){
  return this.http.get<any>(`${CONFIGURATION.baseUrls.yodaBaseUrl}/api/Indent/GetApprovedSIForPI?LocationGuid=`+ LocationGuid).pipe(map((res: any) => {
    return res || {};
  }));  
} 
SaveScrapItemDetails(body:any){
  return this.http.post( CONFIGURATION.baseUrls.yodaBaseUrl+'/api/Items/SaveScrapItems',body ).pipe(map((res: any ) => {
    return res;
  }));
 }
  /**
  * Get The SI Indent Details
  * @param FromLocationGuid 
  * @param ToLocationGuid 
  * @returns 
  */
  GetSIRequestLocations(UserLocationGuid:any=[]){
    const params: any = {UserLocationGuid}
    return this.http.get<any>(`${CONFIGURATION.baseUrls.yodaBaseUrl}/api/Indent/GetSIRequestLocations`,{params}).pipe(map((res: any) => {
      return res || {};
    }));
   }
  /**
  * this method used to save store Received items
  */
 SaveStoreReturn(body: any): Observable<any> {
  return this.http.post(`${CONFIGURATION.baseUrls.yodaBaseUrl}/api/Indent/SaveStoreRecieveItems`, body).pipe(map((res: any) => {
    return res;
  }));
}
  /**
  * Get The SI Indent Details
  * @param FromLocationGuid 
  * @param ToLocationGuid 
  * @returns 
  */
  GetReturnItems(FromLocationGuid:any=[]){
    const params: any = {FromLocationGuid}
    return this.http.get<any>(`${CONFIGURATION.baseUrls.yodaBaseUrl}/api/Indent/GetStoreReturnItems`,{params}).pipe(map((res: any) => {
      return res || {};
    }));
   }
  /**
  * this method used to save  return  items to store to vender
  */
 SaveNRDCitems(body:any){
  return this.http.post( CONFIGURATION.baseUrls.yodaBaseUrl+'/api/Indent/SaveNRDCItems',body ).pipe(map((res: any ) => {
    return res;
  }));
 }
 /**
  * this method used to save B2B Received items
  */
 SaveB2BReceivedItems(body: any): Observable<any> {
  return this.http.post(`${CONFIGURATION.baseUrls.yodaBaseUrl}/api/Indent/SaveB2BReceivedItems`, body).pipe(map((res: any) => {
    return res;
  }));
}


saveIndentFromXL(ItemsDetailsFromXL:any): Observable<any>  {
  let options={
    itemsDetailsFromXLUDT : ItemsDetailsFromXL
  }
  return this.http.post(`${CONFIGURATION.baseUrls.yodaBaseUrl}/api/SaveIndenXl/SaveIndentFromXl`, options).pipe(map((res: any) => {
    return res || {};
 }));
 }

 GetQuantityOnLocationAndItem(FromLocationGuid:any,ItemGuid : any){
  const params: any = { FromLocationGuid,ItemGuid}
  return this.http.get<any>(`${CONFIGURATION.baseUrls.yodaBaseUrl}/api/Indent/GetQuantityOnLocationAndItem`,{params}).pipe(map((res: any) => {
    return res || {};
  }));
 }
  /**
  * Get The SI Indent Details
  * @param FromLocationGuid 
  * @param ToLocationGuid 
  * @returns 
  */
  GetSIPendingindentDetails(FromLocationGuid:any,ToLocationGuid:any,Keyword:any,IssueFromDate:any,IssueToDate:any){
    const params: any = {FromLocationGuid,ToLocationGuid,Keyword,IssueFromDate,IssueToDate}
    return this.http.get<any>(`${CONFIGURATION.baseUrls.yodaBaseUrl}/api/Indent/GetSIPendingIndentsDetails`,{params}).pipe(map((res: any) => {
      return res || {};
    }));
   }
    /**
  * Get The PI Indent Details
  * @param FromLocationGuid 
  * @param ToLocationGuid 
  * @returns 
  */
    GetPIPendingIndentsDetails(FromLocationGuid:any,ToLocationGuid:any,Keyword:any,IssueFromDate:any,IssueToDate:any){
    const params: any = {FromLocationGuid,ToLocationGuid,Keyword,IssueFromDate,IssueToDate}
    return this.http.get<any>(`${CONFIGURATION.baseUrls.yodaBaseUrl}/api/Indent/GetPIPendingIndentsDetails`,{params}).pipe(map((res: any) => {
      return res || {};
    }));
   }

}



  

