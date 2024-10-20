import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { error } from 'console';
import { Subject, debounceTime } from 'rxjs';
import { AllItemsService } from 'src/app/core/Services/all-items.service';
import { AuthenticationService } from 'src/app/core/Services/authentication.service';
import { IndentService } from 'src/app/core/Services/indent.service';
import { PurchaseOrderService } from 'src/app/core/Services/purchase-order.service';

@Component({
  selector: 'app-stock-return-form',
  templateUrl: './stock-return-form.component.html',
  styleUrls: ['./stock-return-form.component.scss']
})
export class StockReturnFormComponent implements OnInit {

  shimmerVisible: boolean;
  StockreturnForm: FormGroup = {} as any;
  StockReturnItems: any = [];
  pageNumber: any = 1;
  RowCount: any = 40;
  Keyword: any = '';
  OrderBy: any = '';
  SortType: any = 'desc';
  UserGuid: any;
  Location: any;
  Item: any
  CenterLocation: any = [];
  LocationGuid: any;
  ReceivedItems: any = [];
  stockGuid:any;
  ToLocationGuid: any;
  filterItems: any=[];
  itemOptionsPerPage = [40, 80, 120, 160, 200, 240, 280, 320];
  TotalCount: any;
  maxSize: number;
  boundaryLinks: boolean;
  size: string;
  modelChanged = new Subject<string>();
  modelChange = new Subject<string>();
  RecivedQuantity: any;
  IsShow:boolean=false;
  isMenuCollapsed: boolean = true;
  Locations: any=[];
  Reason: string;
  reasons: string[] = [];
  selectedReason: any=[];
  ReasonGuid: any;
  lstReason: any=[];
  errormessage: string;
  defaultNavActiveId = 1;
  StorestockReturnItems: any=[];
  totalCount: any;
  IsButtonShow: boolean=false;
  StockReturnQuantity:any;
  keyword: any='';
  Store: any;
  Reasonshow:boolean=false;
  tabId: number;
  Roles: any;
  constructor(
    private modalService: NgbModal,
    private allitemservice: AllItemsService,
    private fb: FormBuilder,
    private authservice: AuthenticationService,
    private purchaseOrderService: PurchaseOrderService,
    private indentService: IndentService,
  ) { 
    this.modelChanged.pipe(debounceTime(1000)).subscribe(model => {
      this.Keyword = model;
      this.GetStockRetuns();
    });
    this.modelChange.pipe(debounceTime(1000)).subscribe(model => {
      this.keyword = model;
      this.GetDepartStockReturnItems();
    });
  }

  ngOnInit(): void {
    this.UserGuid = localStorage.getItem('UserGuid') || '';
    this.GetStockRetuns();
    this.inItForms();
    this.GetLocationsByDefault();
    this.GetStockReturnItemReason();
    this.Store=this.authservice.LoggedInUser.STORE
    this.tabId=(this.Store==true || this.Store=='true') ? 2 :1
    if (window.outerWidth < 480) {
      this.maxSize = 2;
      this.boundaryLinks = false;
      this.size = 'sm';
    }
    this.GetDepartStockReturnItems();
   this.Roles =this.authservice.LoggedInUser.SRFROLES
  }
  inItForms(): void {
    this.StockreturnForm = this.fb.group({
      LocationGuid: ['', Validators.required],
      ToLocationGuid: [''],
      ItemGuid: ['', Validators.required],
      StockReturnQty: ['',Validators.required],
      Reason:['',Validators.required],
      StockGuid: [''],
      UserGuid: [''] ,
      BatchNumber:[''],
      DptmReturnGuid:[''],
      StockAcceptQty:['']
    })
  }
  openModal(content: TemplateRef<any>, size: string = 'lg') {
    this.modalService.open(content, { size: size }).result.then((result) => {
      console.log("Modal closed" + result);
    }).catch((res) => { });
  }
  rejectModal(content: TemplateRef<any>, size: string = 'md') {
    this.modalService.open(content, { size: size }).result.then((result) => {
      console.log("Modal closed" + result);
    }).catch((res) => { });
  }
  /**
   * this service method used to get the stock return items
   */
  GetStockRetuns() {
    this.shimmerVisible = true;
    let DepotmentGuid =this.authservice.LoggedInUser.DEFAULTROLES.toLowerCase().includes('ADMIN'.toLowerCase()) && this.authservice.LoggedInUser.LOCATIONSGUID=='00000000-0000-0000-0000-000000000000' ?'00000000-0000-0000-0000-000000000000': this.authservice.LoggedInUser.LOCATIONSGUID.split(",")
    let IsStore=this.authservice.LoggedInUser.STORE
    this.allitemservice.getStockReturnItems(this.pageNumber, this.RowCount, this.Keyword, this.OrderBy, this.SortType,DepotmentGuid,IsStore).subscribe(data => {
      this.shimmerVisible = false;
      this.StockReturnItems = data.Result || [];
      if(this.StockReturnItems.length!=0){
        this.IsShow=false;
      }
      else{
        this.IsShow=true;
      }
      this.TotalCount=this.StockReturnItems[0].TotalCount;
    },
      (err: HttpErrorResponse) => {
        this.shimmerVisible = false;
      })
  }
  /**
 * this default method used to egt the locations
 */
  GetLocationsByDefault() {
    let DepotmentGuid = this.authservice.LoggedInUser.DEFAULTROLES.toLowerCase().includes('ADMIN'.toLowerCase()) && this.authservice.LoggedInUser.LOCATIONSGUID == '00000000-0000-0000-0000-000000000000' ? '00000000-0000-0000-0000-000000000000' : this.authservice.LoggedInUser.LOCATIONSGUID.split(",")
    this.shimmerVisible = true;
    this.purchaseOrderService.GetPOAgainstPIPostDefaults(DepotmentGuid).subscribe(data => {
      this.shimmerVisible = false;
      this.Locations=data.Result.LstCenterLocations || [];  
      this.CenterLocation =this.Locations.filter((item:any)=>item.IsStore===false)
    },
      (err: HttpErrorResponse) => {
        this.shimmerVisible = false;
      })
  }
  /**
   * this Service method used to save the stock return items
   */
  SaveReturnItems(){
    this.shimmerVisible = true;
    this.StockreturnForm.patchValue({
      UserGuid:this.UserGuid
    })
    this.allitemservice.saveStockReturnItems(this.StockreturnForm.value).subscribe(data=>{
      this.GetStockRetuns();
      this.GetDepartStockReturnItems();
      this.StockreturnForm.reset();
      this.shimmerVisible = false;
    },
    (err:HttpErrorResponse)=>{
      this.shimmerVisible = false;
    })
  }
  /**
   * this change event used to select the location
   * @param event 
   */
  SelectLocation(event: any) {
    this.LocationGuid = event?.LocationGuid
    this.filterItems=[];
    if (event != undefined) {
      this.GetReceivedItemsDetails(event.LocationGuid)
    }
    else {
      this.ReceivedItems = [];
      this.StockreturnForm.reset();
    }
  }
  /**
* This  method is used to get the  items  in drop down
*/
  GetReceivedItemsDetails(LocationGuid: any) {
    this.indentService.GetReceivedItemsDetails(LocationGuid).subscribe(data => {
      this.ReceivedItems = data.Result ||[]
      this.filterItems=this.ReceivedItems.filter((item:any) => item.TolocationGuid !='00000000-0000-0000-0000-000000000000' && item.IsDeleted==false && (item.ReceiveQty)-(item.DPConsumeQty)-(item.ReturnQuantity)-(item.ScrapQuantity)>0);
      this.filterItems = this.filterItems.map((obj: { ItemName: any, VendorItemName: any }) => ({
        ...obj,  
        ItemfullName: obj.ItemName + (obj.VendorItemName !== null ? " (" + obj.VendorItemName + ")" : " (N/A)")
      }));
      this.shimmerVisible = false;
    },
      (err: HttpErrorResponse) => {
        this.shimmerVisible = false;
      })
  }
  /**
   * this change event used to select the item 
   * @param event 
   */
  SelectItem(event:any){
    this.stockGuid=event?.StockGuid;
    this.ToLocationGuid=event?.TolocationGuid;
    this.RecivedQuantity=(event?.ReceiveQty)-(event?.ReturnQuantity)-(event?.DPConsumeQty)-(event?.ScrapQuantity);
    const BatchNumber=event?.BatchNumber
  if(event!=undefined){
      this.StockreturnForm.patchValue({
        StockGuid:this.stockGuid,
        ToLocationGuid:this.ToLocationGuid,
        BatchNumber:BatchNumber,
        StockReturnQty:this.RecivedQuantity
      })
    }
    else{
        this.StockreturnForm.get('StockReturnQty')?.reset();
    }          
  }
  /**
   * This event used to change the row count
   * @param event 
   */
  ChangeEvent(event:any){
    this.RowCount=event.target.value;
    this.pageNumber=1;
    this.GetStockRetuns();
  }
  /**
   * this event used to change the pagenumber
   * @param event 
   */
  ChangePagenumber(event:any){
    this.pageNumber=event
    this.GetStockRetuns();
  }
  /**
   * this event used to change the search
   * @param event 
   */
  changeSearch(event:any){
    this.pageNumber = 1;
    this.RowCount = 40;
    this.modelChanged.next(event.target.value);
  }
  /**
   * this event check the recive quantity of item
   * @param event 
   */
  ChangeStockReturnQty(event:any){
    const Quantity=parseFloat(event.target.value)
    const newQuantity=(event.target.value)
    if(Quantity<0){
      this.StockreturnForm.patchValue({
        StockReturnQty:this.RecivedQuantity
      })
    }
    if(Quantity>this.RecivedQuantity){
        this.StockreturnForm.patchValue({
        StockReturnQty:this.RecivedQuantity
      })
    }
    else{
      this.StockreturnForm.patchValue({
        StockReturnQty:newQuantity
      })
    }
  }
  click() {
    this.StockreturnForm.reset();
    this.inItForms();
    this.Item = [];
    this.Location=[];
    this.selectedReason=[];
  }
  /**
   * this service method used to save the reason
   */
  SaveStockReturnItemReason() {
    let body ={
      Reason: this.Reason 
    }
    this.allitemservice.SaveStockReturnItemReason(body).subscribe(data => {
      this.ReasonGuid =data.ReasonGuid
    this.GetStockReturnItemReason()
       this.StockreturnForm.patchValue({
        Reason: data.Reason
      })
      this.Reasonshow=false;
      this.reasons.push(data.Reason);
    })
   
  }
  /**
   * this service method used to get the reason dropdown
   */
  GetStockReturnItemReason() {
    this.allitemservice.GetStockReturnItemReason().subscribe((data) => {  
   this.lstReason =data.Result
   console.log(this.lstReason)
  })
  }
  /**
   * this change event is check the reason dublicate values
   * @param event 
   */
  dublicatechecking(event:any) {
    let duplicatereason = this.lstReason.find((f: { Reason: any }) => f.Reason === event.target.value);
    if (duplicatereason) {
      this.errormessage = 'Reason already exists';
      } else {
      this.errormessage = '';
    }
  }
  /**
   * this click event used to click the accept and reject buttons
   * @param item 
   * @param dept 
   */
 event(item:any){
    this.StockreturnForm.patchValue({
      StockGuid:item.StockGuid,
      LocationGuid:item.IndentLocationGuid,
      BatchNumber:item.BatchNumber,
      ToLocationGuid:item.LocationGuid,
      DptmReturnGuid:item.Guid,
      ItemGuid:item.ItemGuid,
      Reason:'',
      StockAcceptQty:item.ReturnQuantity,
      StockReturnQty:0
    })
    this.StockReturnQuantity=item.ReturnQuantity;
  }
 /**
 * this Service method used to save the stock return items
 */
 UpdateStockReturn(){
  this.shimmerVisible = true;
  this.allitemservice.UpdateStockReturnItems(this.StockreturnForm.value).subscribe(data=>{
    this.GetStockRetuns();
    this.StockreturnForm.reset();
    this.shimmerVisible = false;
  },
  (err:HttpErrorResponse)=>{
    this.shimmerVisible = false;
  })
 }
 /**
  * this service method used to get department return items
  */
 GetDepartStockReturnItems() {
  this.shimmerVisible = true;
  let DepotmentGuid =this.authservice.LoggedInUser.DEFAULTROLES.toLowerCase().includes('ADMIN'.toLowerCase()) && this.authservice.LoggedInUser.LOCATIONSGUID=='00000000-0000-0000-0000-000000000000' && this.Store!=false ?'00000000-0000-0000-0000-000000000000': this.authservice.LoggedInUser.LOCATIONSGUID.split(",")
  //let IsStore=this.authservice.LoggedInUser.STORE
  this.allitemservice.getDepartStockReturnItems(this.pageNumber, this.RowCount, this.keyword, this.OrderBy, this.SortType,this.Store,DepotmentGuid).subscribe(data => {
    this.shimmerVisible = false;
    this.StorestockReturnItems = data.Result || [];
    if(this.StorestockReturnItems.length!=0){
      this.IsShow=false;
    }
    else{
      this.IsShow=true;
    }
    this.totalCount=this.StorestockReturnItems[0]?.TotalCount;
   },
    (err: HttpErrorResponse) => {
      this.shimmerVisible = false;
    })
  }
  /**
   * this change event used to chage the serch
   * @param event 
   */
  changeitemSearch(event:any){
    this.pageNumber = 1;
    this.RowCount = 40;
    this.modelChange.next(event.target.value);
  }
  /**
   * this change event used to change the row count
   * @param event 
   */
  ChangeRowcount(event:any){
    this.RowCount=event.target.value;
    this.pageNumber=1;
    this.GetDepartStockReturnItems();
  }
/**
 * this event used to change the pagenumber
 * @param event 
 */
  ChangePage(event:any){
    this.pageNumber=event
    this.GetDepartStockReturnItems();
  }
  /**
   * this event used to chage the  StockAccept Qty
   * @param event 
   */
  ChangeQuantity(event:any){
    let value=event.target.value;
    const Quantity=parseInt(value)
     const totalQuantity=event.target.value;
     if(this.StockReturnQuantity>Quantity){
      this.StockreturnForm.patchValue({
        StockAcceptQty:totalQuantity,
        StockReturnQty:this.StockReturnQuantity-totalQuantity
    })
    this.IsButtonShow=true
   }
   else{
    this.StockreturnForm.patchValue({
      StockAcceptQty:this.StockReturnQuantity,
      StockReturnQty:0
    })
    this.IsButtonShow=false
   }
  }
  changeReason(event:any){
    const reason=event.target.value
    if(reason==''){
      this.IsButtonShow=true;
    }
    else{
      this.IsButtonShow=false;
    }
  }
  Action(){
    this.Reasonshow=true;
  }
  reasonevent(event:any){
    const value=event.target.value;
    if(value==''){
      this.IsButtonShow=false;
    }
    else{
      this.IsButtonShow=true;
      this.Reason=value;
    }

  }
 }
