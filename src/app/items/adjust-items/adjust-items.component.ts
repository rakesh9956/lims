
import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbCalendar, NgbDateParserFormatter, NgbDateStruct, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject, Subscription, debounceTime } from 'rxjs';
import { AllItemsService } from 'src/app/core/Services/all-items.service';
import { IndentService } from 'src/app/core/Services/indent.service';
import { CustomDateParserFormatter } from 'src/app/core/Services/ngbdate-format.service';
import { FormValueTrimeer, UsernameValidator } from 'src/Utils/validators';

@Component({
  selector: 'app-adjust-items',
  templateUrl: './adjust-items.component.html',
  styleUrls: ['./adjust-items.component.scss'],
  providers: [
    { provide: NgbDateParserFormatter, useClass: CustomDateParserFormatter },
  ],
})
export class AdjustItemsComponent implements OnInit {
  shimmerVisible: boolean;
  stockAdjestment: any = [];
  allLocations: any = [];
  keyword: any = '';
  Keyword: string = '';
  pageNumber: any = 1;
  rowCount: any = 40;
  orderBy: any = '';
  sortType: any = 'desc';
  ItemsData: any = [];
  newStockAdjestmentForm: FormGroup = {} as any;
  itemsPerPage = 40
  currentPage: any = 1;
  maxSize: number = 3;
  boundaryLinks: boolean = true;
  size: string = 'lg';
  filterStockAdjestment: any = [];
  searchItem: any;
  selectedDate: NgbDateStruct;
  ListLocations: any;
  Location: any;
  UserGuid: any;
  Item: any;
  totalcount: any;
  modelChanged = new Subject<string>();
  subscriptions: Subscription | any;
  IsSelect: boolean = true;
  locationControl: FormControl = new FormControl();
  IsExpire: boolean = false;
  isMenuCollapsed: boolean = true;
  itemOptionsPerPage = [40, 80, 120, 160, 200, 240, 280, 320];
  TotalItemsData: any=[];
  BatchItems: any=[];
  ItemQuantity: any;
  constructor(private modalService: NgbModal,
    private allItemsService: AllItemsService,
    private fb: FormBuilder,
    private calendar: NgbCalendar,
    private indentService:IndentService
  ) {
    const today = this.calendar.getToday();
    this.selectedDate = {
      year: today.year, month: today.month, day: today.day
    };
    this.subscriptions = new Subscription();
    this.modelChanged
      .pipe(debounceTime(1000))
      .subscribe((model: string) => {
        this.keyword = model
        this.getStockAdjestmentItems()
      });
  }

  ngOnInit(): void {
    this.getStockAdjestmentItems()
    this.getLocationDefaults()
    this.allItems()
    this.inItForm()
    this.boundaryLinks = false;
    this.UserGuid = localStorage.getItem('UserGuid');
  }
  openBasicModal(content: TemplateRef<any>) {
    this.modalService.open(content, { size: 'xl' }).result.then((result: string) => {
      console.log("Modal closed" + result);
    }).catch((res: any) => { });
  }
  inItForm() {
    this.newStockAdjestmentForm = this.fb.group({
      LocationGuid: ['', [Validators.required]],
      ItemGuid: ['', [Validators.required]],
      ItemQuantity: ['', [Validators.required]],
      BatchNumber: ['', [Validators.required, UsernameValidator.cannotContainSpace]],
      IsStore: ['', [Validators.required]],
      UserGuid: [''],
      Expiredate: [null],
      Unitprice: ['', [Validators.required]],
      GSTper: ['', [Validators.required]],
      Discountper: ['', [Validators.required]],
      Discoutamount: ['', [Validators.required]],
      GSTamount: ['', [Validators.required]],
      Totalprice: ['', [Validators.required]],
      ItemPrice: ['', [Validators.required]],
      Reson: ['', [Validators.required]],
      StockGuid: [''],
      indentGuid: [''],
      VendorItemName:[''],
      IsAdjust : [''],
    })
  }
  /**
   * this service method used to Get all stockAdjustment items 
   */
  getStockAdjestmentItems() {
    this.shimmerVisible = true;
    //this.globalService.startSpinner();
    this.allItemsService.getStockAdjement(this.pageNumber, this.rowCount, this.keyword, this.orderBy, this.sortType).subscribe(data => {
      this.filterStockAdjestment = data.Result || []
      // this.globalService.stopSpinner();
      this.shimmerVisible = false;
      this.stockAdjestment = this.filterStockAdjestment;
      this.totalcount = this.stockAdjestment[0]?.TotalCount
    },
      err => {
        // this.globalService.stopSpinner();
        this.shimmerVisible = false;
      })
  }
  /**
   * this service method used to get all locations
   */
  getLocationDefaults() {
   // this.shimmerVisible = true;
    // this.globalService.startSpinner();
    this.allItemsService.getQuotationPostDefaults().subscribe(data => {
      this.ListLocations = data.Result.LstQuotationCenterLocationType || []
      this.allLocations = this.ListLocations || []
      // this.globalService.stopSpinner();
      //this.shimmerVisible = false;
    },
      err => {
        // this.globalService.stopSpinner();
        this.shimmerVisible = false;
      })
  }
  /**
   * this service method used to get batches
   */
  saveStockAdjestmentItems() {
    this.newStockAdjestmentForm.patchValue({
      UserGuid: this.UserGuid,
      Expiredate: this.IsExpire==true ?'': this.newStockAdjestmentForm.value.Expiredate.year + "-" + this.newStockAdjestmentForm.value.Expiredate.month + "-" + this.newStockAdjestmentForm.value.Expiredate.day
    })
    this.allItemsService.saveStockAdjestment(this.newStockAdjestmentForm.value).subscribe(data => {
      this.getStockAdjestmentItems();
      this.newStockAdjestmentForm.reset();
      this.Location = [];
      this.Item = [];
      // this.globalService.stopSpinner();
      this.shimmerVisible = false;

    },
      err => {
        // this.globalService.stopSpinner();
        this.shimmerVisible = false;
      })
  }
  /**
   * this event used to get the Batche
   * @param event 
   */
  getItemsByGuid(event:any) {
    this.newStockAdjestmentForm.patchValue({
      ItemQuantity:'',
      Expiredate:null,
      Unitprice:'',
      GSTper:'',
      Discountper:'',
      Discoutamount:'',
      GSTamount:'',
      Totalprice:'',
      StockGuid:'',
      ItemPrice:'',
      VendorItemName:'',
      BatchNumber:null,
      IsAdjust : ''
      })
    if(event!=undefined){
      this.allItemsService.GetItemByGuid(event.ItemGuid,this.newStockAdjestmentForm.value.LocationGuid,this.newStockAdjestmentForm.value.IsStore).subscribe(data => {
        this.BatchItems = data.Result || [];
      },
        err => {
          this.shimmerVisible = false;
        })
    }
    else{
      this.BatchItems=[];
    }
    if (event.IsExpirable == 'YES') {
      this.IsExpire = false;
    }
    else {
      this.IsExpire = true;
    }
  }
  get BatchNumber() {
    return this.newStockAdjestmentForm.value.BatchNumber?.trim();
  }
  /**
   * this service method used to get the all items
   */
  allItems() {
    // this.globalService.startSpinner();
    this.shimmerVisible = true;
    this.indentService.Getindentitems(false).subscribe(data => {
      // this.globalService.stopSpinner();
      this.shimmerVisible = false;
      this.TotalItemsData = data.oGetIndentitems;
      this.ItemsData=this.TotalItemsData.filter((item:any) => item.IsDeleted==false );
      this.ItemsData = data.oGetIndentitems.filter((value: any, index: any, self: any) => {
        const firstIndex = self.findIndex((item: any) => item.ItemGuid === value.ItemGuid || item.ItemName === value.ItemName);
        return index === firstIndex;
      });
      this.ItemsData = this.TotalItemsData.map((obj: { ItemName: any, CatalogNo: any }) => ({
        ...obj,  
        ItemfullName: obj.ItemName +" ("+ obj.CatalogNo+")"
      }));
    },
      error => {
        // this.globalService.stopSpinner();
        this.shimmerVisible = false;
      });
  }
  filterItems() {
    if (this.searchItem != "") {
      this.stockAdjestment = this.stockAdjestment.filter((item: any) => item.ItemName.toLowerCase().includes(this.searchItem.toLowerCase()));
    } else {
      this.stockAdjestment = this.filterStockAdjestment.slice(0, 40)
    }
  }
  /**
   * this event used to filters the locations based on Type
   * @param type 
   */
  SelectLocationtype(type: any) {
    this.IsSelect = false;
    this.newStockAdjestmentForm.reset();
    if (type == 'Department') {
      this.allLocations = this.ListLocations?.filter((item: { IsStore: boolean; }) => item.IsStore == false);
      this.newStockAdjestmentForm.patchValue({
        IsStore: false
      })

    }
    else {
      this.allLocations = this.ListLocations?.filter((item: { IsStore: boolean; }) => item.IsStore == true);
      this.newStockAdjestmentForm.patchValue({
        IsStore: true
      })
    }
  }
  /**
   * this change event used to change the Issue Invoice No search
   * @param event 
   */
  Search(event: any) {
    this.modelChanged.next(event.target.value);
  }
  /**
   * this change event used to change the page number
   * @param event 
   */
  onPageChange(event: any): void {
    this.pageNumber = event;
    this.getStockAdjestmentItems();
  }
  /**
 * this change event used to ExpiryDate
 * @param event 
 */
  onDateSelect(event: any) {
    this.newStockAdjestmentForm.patchValue({
      Expiredate: event
    })
  }
  ChangeLocations(event:any){
    if(event==undefined){
    this.Item =[];
    this.newStockAdjestmentForm.reset();
    }
  }
  ChangeEvent(event: any) {
    this.pageNumber = 1;
    this.rowCount = event.target.value
    this.getStockAdjestmentItems();
  }
  /**
   * this event used to restrict mines values in Quantity
   * @param event 
   */
  ChangeQuantity(event: any) {
    const inputValue = event.target.value;
    const numericValue = parseInt(inputValue);
    const value =this.ItemQuantity-this.ItemQuantity-this.ItemQuantity
    if(this.BatchItems.length==0 && numericValue<=0){
      this.newStockAdjestmentForm.patchValue({
        ItemQuantity: 0,
      })
    }
    else if (value>numericValue){
      this.newStockAdjestmentForm.patchValue({
        ItemQuantity:this.ItemQuantity,
      })
    }
    else{
      this.newStockAdjestmentForm.patchValue({
        ItemQuantity:inputValue,
      })
    }
    this.ChangePrice(event)
  }
  /**
   * this event used to caluculate the amounts
   */
  ChangePrice(event: any) {
    const Totalprice = this.newStockAdjestmentForm.value.Unitprice * this.newStockAdjestmentForm.value.ItemQuantity
    const DiscwithGstAmoutnt = this.newStockAdjestmentForm.value?.Discountper ? Totalprice - (Totalprice * this.newStockAdjestmentForm.value?.Discountper / 100) : ''
    const GSTamount = DiscwithGstAmoutnt ? (DiscwithGstAmoutnt * this.newStockAdjestmentForm.value?.GSTper / 100) : this.newStockAdjestmentForm.value?.GSTper / 100 * Totalprice
    const Discount = this.newStockAdjestmentForm.value?.Discountper / 100 * Totalprice
    const ItemDisWithGST = this.newStockAdjestmentForm.value?.Discountper ? this.newStockAdjestmentForm.value.Unitprice - (this.newStockAdjestmentForm.value.Unitprice * this.newStockAdjestmentForm.value?.Discountper / 100) : ''
    const itemGSTamount = ItemDisWithGST ? (ItemDisWithGST * this.newStockAdjestmentForm.value?.GSTper / 100) : this.newStockAdjestmentForm.value?.GSTper / 100 * this.newStockAdjestmentForm.value.Unitprice
    const itemDiscount = this.newStockAdjestmentForm.value?.Discountper / 100 * this.newStockAdjestmentForm.value.Unitprice
    const Finalprice = (Totalprice + GSTamount) - (Discount)
    const ItemPrice = (this.newStockAdjestmentForm.value.Unitprice + itemGSTamount) - (itemDiscount)
    this.newStockAdjestmentForm.patchValue({
      Totalprice: Finalprice ||'',
      GSTamount: GSTamount ||'',
      Discoutamount: Discount || 0,
      ItemPrice: ItemPrice ||''
    })
  }
  /**
   * this chage event used to change the dicount per
   * @param event 
   */
  onDiscountChange(event: any) {
    const values = event.target.value; 
    const intValue = values.replace(/[:"]/g, ''); 
    const finalvalue = intValue
    if (finalvalue < 101 && finalvalue >= 0) {
      this.newStockAdjestmentForm.patchValue({
        Discountper: finalvalue,
      })
    }
    else {
      this.newStockAdjestmentForm.patchValue({
        Discountper: '',
      })
    }
    this.ChangePrice(event);
  }
  /**
   * this event used to change the GST per
   * @param event 
   */
  OnGSTChange(event: any) {
    const values = event.target.value; 
    const intValue = values.replace(/[:"]/g, ''); 
    const finalvalue = intValue
    if (finalvalue < 101 && finalvalue >= 0) {
      this.newStockAdjestmentForm.patchValue({
        GSTper: finalvalue,
      })
    }
    else {
      this.newStockAdjestmentForm.patchValue({
        GSTper: '',
      })
    }
    this.ChangePrice(event);
  }
  /**
   * this event used to change the batch number
   * @param event 
   */
  ChangeBatchNumber(event:any){
    this.newStockAdjestmentForm.get('VendorItemName')?.clearValidators();
    this.newStockAdjestmentForm.get('VendorItemName')?.updateValueAndValidity();
    if(event==undefined){
    this.newStockAdjestmentForm.patchValue({
    ItemQuantity:'',
    Expiredate:null,
    Unitprice:'',
    GSTper:'',
    Discountper:'',
    Discoutamount:'',
    GSTamount:'',
    Totalprice:'',
    StockGuid:'',
    ItemPrice:'',
    VendorItemName:'',
    IsAdjust : ''
    })
    }else{
   const item=this.BatchItems.filter((item:any)=>item.BatchNumber==event.BatchNumber);
   this.newStockAdjestmentForm.patchValue({
    ItemQuantity:item[0].NewQty,
    Expiredate:this.IsExpire==true?null:({ day: new Date(item[0].ExpiryDate).getDate(), month: new Date(item[0].ExpiryDate).getMonth() + 1, year: new Date(item[0].ExpiryDate).getFullYear() }),
    Unitprice:item[0].UnitPrice,
    GSTper:item[0].TaxPer,
    Discountper:item[0].DiscountPer,
    Discoutamount:item[0].DiscountAmount,
    GSTamount:item[0].TaxAmount,
    Totalprice:item[0].TotalAmount,
    StockGuid:item[0].StockGuid,
    ItemPrice:item[0].UnitPrice + item[0].TaxAmount - item[0].DiscountAmount,
    indentGuid:item[0].IndentGuid,
    VendorItemName:item[0].VendorItemName,
    IsAdjust : item[0].IsAdjust
   })
   //this.newStockAdjestmentForm.get('Expiredate')?.setValue(null);
   this.ItemQuantity=item[0].NewQty
   this.IsExpire=item[0].IsExpirable  
  }
}
  event(event:any){
   const BatchNumber=event.target.value
   this.newStockAdjestmentForm.patchValue({
    BatchNumber:BatchNumber
   })
  }
}