import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { CONFIGURATION } from 'src/app/app.constant';

@Injectable({
  providedIn: 'root'
})
export class AllItemsService {

  yodaBaseUrl!: string;

  private paramSource = new BehaviorSubject(null);
  sharedParam = this.paramSource.asObservable();

  constructor(private http: HttpClient) {
    this.yodaBaseUrl = CONFIGURATION.baseUrls.yodaBaseUrl
  }

  changeParam(param: any['']) {
    this.paramSource.next(param)
  }

  /**it is used to get the location details from backend */
  getAllItems(params = {} as any): Observable<any> {
    // const params: any = { PageNumber, RowCount, Keyword, OrderBy, SortType, Type, ExipersIn }
    return this.http.get<any>(`${CONFIGURATION.baseUrls.yodaBaseUrl}/api/Items/GetAllItemsData`, { params }).pipe(map((res: any) => {
      return res || [];
    }));
  }
  /**
   * This method is used for get all ItemTypes
   * @param PageNumber 
   * @param RowCount 
   * @param Keyword 
   * @param OrderBy 
   * @param SortType 
   * @param Type 
   * @returns 
   */
  GetItemTypes(PageNumber: any = 1, RowCount: any = 40, Keyword: string = "", OrderBy: string = '', SortType = "desc") {
    const params: any = { PageNumber, RowCount, Keyword, OrderBy, SortType }
    return this.http.get<any>(`${CONFIGURATION.baseUrls.yodaBaseUrl}/api/Items/GetAllItemTypes`, { params }).pipe(map((res: any) => {
      return res || [];
    }));
  }
  /**
   * This method is used for get the SubCategoryName defaults while saving the Item types 
   * @returns 
   */
  GetItemTypesDefault() {
    return this.http.get<any>(`${CONFIGURATION.baseUrls.yodaBaseUrl}/api/Items/GetItemsDefaults`).pipe(map((res: any) => {
      return res || [];
    }));
  }
  /**
   * this method is used for save the Item Types
   * @param body 
   * @returns 
   */
  SaveItemTypes(body: any): Observable<any> {
    return this.http.post<any>(`${this.yodaBaseUrl}/api/Items/AddItemTypes`, body).pipe(map((res: any) => {
      return res || {};
    }));
  }

  //**Saving Added data for add item*/
  saveAddItems(body: any): Observable<any> {
    return this.http.post<any>(`${this.yodaBaseUrl}/api/Items/AddItems`, body).pipe(map((res: any) => {
      return res || {};
    }));
  }

  //**Get departmenttype,itemtype,manufacturertype,Machines,purchaseunit,consumptionunit */ 
  getItemsDefaults(params = {} as any) {
    return this.http.get<any>(`${this.yodaBaseUrl}/api/Items/GetItemsDefaults`, { params }).pipe(map((res: any) => {
      return res || {};
    }));
  }

  //**Get categorytype */
  getCategory(params = {} as any) {
    return this.http.get<any>(`${this.yodaBaseUrl}/api/Items/GetCateogory`, { params }).pipe(map((res: any) => {
      return res || {};
    }));
  }

  getItemDetails(ItemGuid: any): Observable<any> {
    const params: any = { ItemGuid };
    return this.http.get(CONFIGURATION.baseUrls.yodaBaseUrl + '/api/Items/GetItemDetails', { params }).pipe(map((res: any) => {
      return res || {};
    }));
  }

  savePurchaseUnit(body: any): Observable<any> {
    let params = {
      PurchaseUnit: body
    }
    return this.http.post<any>(`${this.yodaBaseUrl}/api/Items/SavePurchaseUnit`, params).pipe(map((res: any) => {
      return res || {};
    }));
  }

  saveManufacturer(body: any): Observable<any> {
    let params = {
      Manufacturer: body
    }
    return this.http.post<any>(`${this.yodaBaseUrl}/api/Items/SaveManufacturer`, params).pipe(map((res: any) => {
      return res || {};
    }));
  }
  getItemHistory(ItemGuid: any): Observable<any> {
    const params: any = { ItemGuid };
    return this.http.get(CONFIGURATION.baseUrls.yodaBaseUrl + '/api/Items/GetItemsHistory', { params }).pipe(map((res: any) => {
      return res || {};
    }));
  }
  DeleteItemtype(ItemTypeGuid: any): Observable<any> {
    let options = {
      ItemTypeGuid: ItemTypeGuid
    };
    return this.http.post(CONFIGURATION.baseUrls.yodaBaseUrl + '/api/Items/DeleteItemTypes', options).pipe(map((res: any) => {
      return res;
    }));
  }
  DeleteItem(itemGUid: any): Observable<any> {
    let options = {
      itemGUid: itemGUid
    };
    return this.http.post(CONFIGURATION.baseUrls.yodaBaseUrl + '/api/Items/DeleteItem', options).pipe(map((res: any) => {
      return res;
    }));
  }
  getStockAdjement(pageNumber: any, rowCount: any, keyword: any, orderBy: any, sortType: any) {
    const params: any = { pageNumber, rowCount, keyword, orderBy, sortType }
    return this.http.get<any>(`${this.yodaBaseUrl}/api/Items/GetStockAdjestMent`, { params }).pipe(map((res: any) => {
      return res || {};
    }));
  }

  getQuotationPostDefaults(): Observable<any> {
    return this.http.get<any>(`${this.yodaBaseUrl}/api/Quotation/GetQuotationPostDefaults`).pipe(map((res: any) => {
      return res || {};
    }));
  }
  getNRDCDetails(PageNumber: any, RowCount: any, Keyword: any, OrderBy: any, SortType: any): Observable<any> {
    const params: any = { PageNumber, RowCount, Keyword, OrderBy, SortType }
    return this.http.get<any>(`${this.yodaBaseUrl}/api/GoodsReceiptNotes/GetNRDC`, { params }).pipe(map((res: any) => {
      return res || {};
    }));
  }
  saveStockAdjestment(input: any): Observable<any> {
    return this.http.post<any>(`${this.yodaBaseUrl}/api/Items/SaveAdjestMentItems`, input).pipe(map((res: any) => {
      return res || {};
    }));
  }

  GetItemsStockExpReports(params = {} as any) {
    return this.http.get<any>(`${CONFIGURATION.baseUrls.yodaBaseUrl}/api/AllReports/GetStockExpiryReports`, { params }).pipe(map((res: any) => {
      return res || {};
    }));
  }
  GetPurchaseItemReports(params = {} as any) {
    // const params: any = { LocationGuid, FromDate, ToDate }
    return this.http.get<any>(`${CONFIGURATION.baseUrls.yodaBaseUrl}/api/AllReports/GetPurachaseItemsReports`, { params }).pipe(map((res: any) => {
      return res || {};
    }));
  }
  /**
   * This service method Get the stock return items
   * @param pageNumber 
   * @param RowCount 
   * @param Keyword 
   * @param OrderBy   
   * @param SortType 
   * @returns 
   */
  getStockReturnItems(PageNumber: any, RowCount: any, Keyword: any, OrderBy: any, SortType: any, UserLocationGuid: any,IsStore:any) {
    const params: any = { PageNumber, RowCount, Keyword, OrderBy, SortType, UserLocationGuid,IsStore }
    return this.http.get<any>(`${this.yodaBaseUrl}/api/Items/GetStockReturnItems`, { params }).pipe(map((res: any) => {
      return res || {};
    }));
  }
  /**
   * This service method used to save StockReturnItems
   * @param input 
   * @returns 
   */
  saveStockReturnItems(input: any): Observable<any> {
    return this.http.post<any>(`${this.yodaBaseUrl}/api/Items/SaveStockReturnItems`, input).pipe(map((res: any) => {
      return res || {};
    }));
  }
  UpdateStockReturnItems(input: any): Observable<any> {
    return this.http.post<any>(`${this.yodaBaseUrl}/api/Items/UpdateStockReturnItems`, input).pipe(map((res: any) => {
      return res || {};
    }));
  }
  getScrapItemsItems(PageNumber: any, RowCount: any, Keyword: any, OrderBy: any, SortType: any, FromDate:any, EndDate:any, LocationGuid:any) {
    const params: any = { PageNumber, RowCount, Keyword, OrderBy, SortType, FromDate, EndDate, LocationGuid }
    return this.http.get<any>(`${this.yodaBaseUrl}/api/Items/GetScrapItems`, { params }).pipe(map((res: any) => {
      return res || {};
    }));
  }
  GetScrapItemsDetails(ScrapNumber:any) {
    const params: any = { ScrapNumber }
    return this.http.get<any>(`${this.yodaBaseUrl}/api/Items/GetScrapItemDetails`, { params }).pipe(map((res: any) => {
      return res || {};
    }));
  }

  SaveMachine(body: any): Observable<any> {
    return this.http.post<any>(`${this.yodaBaseUrl}/api/Items/AddMachine`, body).pipe(map((res: any) => {
      return res || {};
    }));
  }
  SaveSubcategeorytype(body: any): Observable<any> {
    return this.http.post<any>(`${this.yodaBaseUrl}/api/Items/SaveSubCategory`, body).pipe(map((res: any) => {
      return res || {};
    }));
  }
  SaveCustomPurchaseUnit(body: any): Observable<any> {
    return this.http.post<any>(`${this.yodaBaseUrl}/api/Items/SaveCustomPurchaseUnit`, body).pipe(map((res: any) => {
      return res || {};
    }));
  }
  SaveStockReturnItemReason(body: any): Observable<any> {
    return this.http.post<any>(`${this.yodaBaseUrl}/api/Items/SaveStockReturnItemReason`, body).pipe(map((res: any) => {
      return res || {};
    }));
  }
  GetStockReturnItemReason(params = {} as any) {
   return this.http.get<any>(`${CONFIGURATION.baseUrls.yodaBaseUrl}/api/Items/GetStockReturnItemReason`, { params }).pipe(map((res: any) => {
      return res || {};
    }));
  }
   getDepartStockReturnItems(PageNumber: any, RowCount: any, Keyword: any, OrderBy: any, SortType: any, IsStore:any,UserLocationGuid: any ) {
    const params: any = { PageNumber, RowCount, Keyword, OrderBy, SortType,IsStore,UserLocationGuid}
    return this.http.get<any>(`${this.yodaBaseUrl}/api/Items/GetDepartStockReturnItems`, { params }).pipe(map((res: any) => {
      return res || {};
    }));
  }
  GetItemByGuid(ItemGuid: any,LocationGuid:any,IsStore:any): Observable<any> {
    let params = {
      ItemGuid: ItemGuid,
      LocationGuid:LocationGuid,
      IsStore:IsStore
    };
    return this.http.get(CONFIGURATION.baseUrls.yodaBaseUrl + '/api/Items/GetItemsDetailsByGuid', {params}).pipe(map((res: any) => {
      return res;
    }));
  }

  updateItemStatusData(input:any): Observable<any>  {
    return this.http.post<any>(`${this.yodaBaseUrl}/api/Items/UpdateItemStatus`, input).pipe(map((res: any) => {
      return res || {};
   }));
   }
   saveCPT(body: any): Observable<any> {
    return this.http.post<any>(`${this.yodaBaseUrl}/api/Items/SaveCPTDetails`, body).pipe(map((res: any) => {
      return res || {};
    }));
  }
  GetAllCpts(PageNumber: any = 1, RowCount: any = 40, Keyword: string = "", OrderBy: string = '', SortType = "desc",TestCodeKeyword='',ItemGuid="") {
    const params: any = { PageNumber, RowCount, Keyword, OrderBy, SortType,TestCodeKeyword,ItemGuid }
    return this.http.get<any>(`${CONFIGURATION.baseUrls.yodaBaseUrl}/api/Items/GetAllCpts`, { params }).pipe(map((res: any) => {
      return res || [];
    }));
  }
  GetCPTByGuid(CPTGuid: string): Observable<any> {
    let params = {
      CptGuid: CPTGuid
    };
    return this.http.get(CONFIGURATION.baseUrls.yodaBaseUrl + '/api/Items/GetCptDetailsByGuid', {params}).pipe(map((res: any) => {
      return res;
    }));
  }
  DeleteCPTByGuid(CPTGuid: any): Observable<any> {
    return this.http.post(CONFIGURATION.baseUrls.yodaBaseUrl + '/api/Items/DeleteCpt', CPTGuid).pipe(map((res: any) => {
      return res;
    }));
  }
  SaveLiveCPT(CPTGuid: any): Observable<any> {
    return this.http.post(CONFIGURATION.baseUrls.yodaBaseUrl + '/api/Items/SaveLIVECPTDetails', CPTGuid).pipe(map((res: any) => {
      return res;
    }));
  }
  GetAllLiveCpts(PageNumber: any = 1, RowCount: any = 40, Keyword: string = "", OrderBy: string = '', SortType = "desc") {
    const params: any = { PageNumber, RowCount, Keyword, OrderBy, SortType }
    return this.http.get<any>(`${CONFIGURATION.baseUrls.yodaBaseUrl}/api/Items/GetAllLiveCpts`, { params }).pipe(map((res: any) => {
      return res || [];
    }));
  }
  GetLiveCPTByGuid(LiveCptGuid:any) {
    let params = {
      LiveCptGuid: LiveCptGuid
    };
    return this.http.get<any>(CONFIGURATION.baseUrls.yodaBaseUrl + '/api/Items/GetLiveCptDetailsByGuid', {params}).pipe(map((res: any) => {
      return res || [];
    }));
  }
  GetAllCPTReport(FromDate:any,ToDate:any,CenterGuid:string,TestCode:string) {
    let params = {
      FromDate: FromDate,
      ToDate:ToDate,
      TestCode:TestCode,
      CenterGuid:CenterGuid
    };
    return this.http.get<any>(CONFIGURATION.baseUrls.yodaBaseUrl + '/api/Items/GetLiveCPTReport', {params}).pipe(map((res: any) => {
      return res || [];
    }));
  }
}
