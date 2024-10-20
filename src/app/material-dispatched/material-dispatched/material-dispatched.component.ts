import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbCalendar, NgbDateParserFormatter, NgbDateStruct, NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { ColumnMode, DatatableComponent } from '@swimlane/ngx-datatable';
import { Subject, Subscription, debounceTime } from 'rxjs';
import { AuthenticationService } from 'src/app/core/Services/authentication.service';
import { GlobalService } from 'src/app/core/Services/global.service';
import { IndentService } from 'src/app/core/Services/indent.service';
import { CustomDateParserFormatter } from 'src/app/core/Services/ngbdate-format.service';
import { StoreLocationsService } from 'src/app/core/Services/store-locations.service';
import { DatePipe, formatDate } from '@angular/common';
import * as html2pdf from 'html2pdf.js';
import { saveAs } from 'file-saver';
import { Workbook } from 'exceljs';
import * as moment from 'moment';
import { ToastrService } from 'ngx-toastr';
import { Console } from 'console';
@Component({
  selector: 'app-material-dispatched',
  templateUrl: './material-dispatched.component.html',
  styleUrls: ['./material-dispatched.component.scss'],
  providers: [
    { provide: NgbDateParserFormatter, useClass: CustomDateParserFormatter },
  ],
})
export class MaterialDispatchedComponent implements OnInit {
  @ViewChild(DatatableComponent) table: DatatableComponent;
  @ViewChild("batchItems") batchItems: TemplateRef<any>;
  modalOption: NgbModalOptions;

  shimmerVisible:boolean
  /*** Paginatin Option Starts ***/
  maxSize: number = 3;
  totalCount: any = '';
  itemsPerPage: any = 40;
  boundaryLinks: boolean = true;
  size: string = 'lg';
  itemOptionsPerPage: any = ['40', '80', '120', '160', '200', '240', '280', '320']
  PageNumber: any = 1;
  RowCount: any = 40;
  OrderBy: any = '';
  SortType: any = 'desc';
  /*** Paginatin Option Starts ***/
  defaultNavActiveId = 1;
  rows: any[] = [];
  temp: any[] = [];
  loadingIndicator = true;
  reorderable = true;
  selectedDate: NgbDateStruct;
  selectedToDate: any = "";
  selectefromDate: any;
  ColumnMode = ColumnMode;
  lstFromLocations: any = [];
  lstIndentLocation: any = [];
  selectedSuppName: any
  SIindentList: any = [];
  FromLocationGuid: any = '';
  ToLocationGuid: any = '';
  LocationGuid: any
  ToindentList: any = [];
  indentList: any = [];
  //Isprintbarcode: boolean = false;
  IndentItemsDetailForm: FormGroup = {} as any;
  LisIndentItems: FormArray = {} as any;
  selectIndentItems: FormArray = {} as any;
  ConsumeDetailItems: FormArray = {} as any;
  index: any = 0;
  BatchUnit: any;
  UserGuid: any;
  IsButtonShow: boolean = false;
  BatchNumberList: any = [];
  FromDate: any = '';
  EndDate: any = '';
  IndentGuid: any;
  newBatchNumberList: any = [];
  guids: any = [];
  Guidoutput: any = [];
  Reciveditems: any = [];
  BatchReciveDetails: any = [];
  Consumeitems: any = [];
  Keyword: any = '';
  IssueFromDate: any = '';
  IssueToDate: any = '';
  IndentGuidlst: any = [];
  IsSelect: boolean = false;
  SelectedDispatchItems: any = []
  BatchTotalItems: any = [];
  IsSearchShow: boolean = true;
  isChecked: boolean = false;
  minDate: NgbDateStruct;
  //maxDate: NgbDateStruct;
  newDate: string;
  selecteToDate: string;
  RecivedSending: any;
  modelChanged = new Subject<string>();
  subscriptions: Subscription | any;
  showError: boolean = false;
  clearControl: FormControl = new FormControl();
  cleardateControl: FormControl = new FormControl();
  clearfromdateControl: FormControl = new FormControl();
  TolocationControl: FormControl = new FormControl();
  BatchNumberLst: any = [];
  noDataFound: boolean;
  isDisable: boolean = true;
  selectedFromDate: any
  UnparsedHtml: any = '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Supplier Quotation</title><style>table{border-collapse:collapse;border:1px solid #000}table td,table th{border-bottom:1px solid #000;border-right:1px solid #000;padding:5px;text-align:left;word-wrap:break-word;word-break:break-all;font-size:10px}table tr:last-child td{border-bottom:none}p{margin:0}</style></head><body><table style="table-layout:fixed;background-color:#ccc" width="100%"><tbody><tr><td style="font-weight:700;font-size:24px;text-align:center">Material Issue Note</td></tr></tbody></table><table style="table-layout:fixed;background-color:#ccc" width="100%"><tbody><tr><td style="font-size:14px"><b>Issue note no:</b>%%Issuenote%%</td><td style="font-size:10px;text-align:right"><b>Issue Date:</b>%%Date%%</td></tr></tbody></table><table style="table-layout:fixed;background-color:#ccc" width="100%"><tbody><tr></tr></tbody></table><table style="table-layout:fixed" width="100%"><tbody><tr><td style="font-size:14px;color:red"><b>From:</b>%%FromLocation%%</td><td style="font-size:14px;color:red"><b>To:</b>%%ToLocation%%</td></tr></tbody></table><table style="table-layout:fixed" width="100%"><thead><tr><th>S.no.</th><th>Indent No</th><th>Item</th><th>Vendor Item</th><th>Manufacturer name</th><th>Prod Batch number</th><th>Item Catalog no.</th><th>Expiry date</th><th>Quantity</th></tr></thead><tbody><tr id="Reciveditems"><td>%%ItemSNo%%</td><td>%%IndentNo%%</td><td>%%ItemName%%</td><td>%%VendorItemName%%</td><td>%%Manufacturername%%</td><td>%%Batchnumber%%</td><td>%%ItemCatalog%%</td><td>%%Expirydate%%</td><td>%%Quantity%%</td></tr></tbody></table><table style="width:100%;margin-top:5px"><thead><tr><th>Issue By:%%RecivedBy%%</th></tr></thead></table><div style="font-size:small"><b>Note:</b>Above items mentioned being sent as sample and have no commercial value. Not for sale.</div><div style="text-align:right;margin-top:1rem"><div><b>Date:</b>%%CurrentDate%%</div><div style="font-size:x-small">This is a computer generated document, hence signature is not required.</div></div></body></html>';
  SelectedIssueFromDate: any;
  clearIssuedateControl: FormControl = new FormControl();
  Store: any;
  tabId:number
  selectedBatch: any=[];
  RejectQuantity: any='';
  ReturnIndentGuidlst: any=[];
  IndetguidOutput: any=[];
  ButtonDisable: boolean=false;
  RejectDisable: boolean=true;
  AcceptQty: any;
  isAnyValueFilled: boolean =false;
  checkAllItemsChecked:boolean;
  selecteditems:any=[];
  isAllCheckbox:boolean=false
  constructor(
    private globalService: GlobalService,
    private indentService: IndentService,
    private fb: FormBuilder,
    public route: ActivatedRoute,
    private modalService: NgbModal,
    private calendar: NgbCalendar,
    public authservice: AuthenticationService,
    private datepipe: DatePipe,
    private toastr: ToastrService
  ) {
    this.subscriptions = new Subscription();
    this.modelChanged
      .pipe(debounceTime(1000))
      .subscribe((model: string) => {
        this.Keyword = model
        this.GetBatchDetails();
      });
  }

  ngOnInit(): void {
    this.UserGuid = localStorage.getItem('UserGuid') || '';
    this.FromLocationGuid = '';
    this.ToLocationGuid = '';
    // this.GetDefaultLocation();
    this.GetSIRequestLocations();
    this.intForm();
    this.addItemslist.removeAt(this.index = 0)
    this.Itemslist.removeAt(this.index = 0)
    this.ConsumeItemslist.removeAt(this.index = 0)
    this.GetBatchDetails();
    const newDate1 = { day: new Date().getDate(), month: new Date().getMonth() + 1, year: new Date().getFullYear() };
    this.newDate = formatDate(new Date(newDate1.year, newDate1.month - 1, newDate1.day), 'dd-MM-yyyy', 'en');
    const today = this.calendar.getToday();
    this.minDate = {
      year: today.year, month: today.month, day: today.day
    };
   this.Store=this.authservice.LoggedInUser.STORE
   this.tabId=(this.Store==true || this.Store=='true') ? 2 :1
  }
  intForm() {
    this.IndentItemsDetailForm = this.fb.group({
      LisIndentItems: this.fb.array([
        this.fb.group({
          ItemName: [''],
          VendorItemName: [''],
          IndentNo: [''],
          CreatedDt: [''],
          FromRights: [''],
          NewQty: [''],
          ReqQty: [''],
          IsSelected: [false],
          ItemGuid: [''],
          ReceiveQty: [''],
        })
      ]),
      selectIndentItems: this.fb.array([
        this.fb.group({
          ItemName: [''],
          VendorItemName: [''],
          IndentNo: [''],
          CreatedDt: [''],
          FromRights: [''],
          NewQty: [''],
          ReqQty: [''],
          BatchQuantity: [''],
          IsBatchCreated: [false],
          ItemGuid: [''],
          NumberOfBox: [''],
          Ischecked : [false],
          BatchExpiryDate : [''],
          StockGuid : [''],
          NewQuantity : [''],
          BatchNumber : [''],
          IsExpirable : [false],
          BatchExpiryDates:[],
          SelectedItemIndex:[''],
          addButton:[false],
          IsAddSelected: [false],
        })
      ]),
      ConsumeDetailItems: this.fb.array([
        this.fb.group({
          ItemName: [''],
          ItemGuid: [''],
          BatchNumber: [''],
          ConsumeQuantity: [''],
          ReasonForUse: [''],
          Units: ['']
        })
      ])
    })
  }

  /**
  * this method is formcontols
  */
  get addItemslist(): FormArray {
    return this.IndentItemsDetailForm.get('LisIndentItems') as FormArray;
  }
  /**
 * this method is formcontols
 */
  get Itemslist(): FormArray {
    return this.IndentItemsDetailForm.get('selectIndentItems') as FormArray;
  }
  /**
 * this method is formcontols
 */
  get ConsumeItemslist(): FormArray {
    return this.IndentItemsDetailForm.get('ConsumeDetailItems') as FormArray;
  }
  /**
   * this service method used to save the batches
   */
  SaveBatch(): void {
    if(this.IndentItemsDetailForm.get('selectIndentItems')?.invalid){
        this.toastr.warning('Please enter the Batch Quantity for the selected items.');
      return;
    }
    this.Itemslist.value?.forEach((element: any, index: any) => {
      const barcodedetails = this.Itemslist.at(index)
      barcodedetails.patchValue({
        NumberOfBox: element.NumberOfBox,
        BatchQuantity: element.BatchQuantity,
        NewQty: element.BatchQuantity,
        ReqQty: element.BatchQuantity,
        BatchExpireDate : element.BatchExpiryDate?.slice(0, 10),
        StockGuid : element.StockGuid
      });
    });
    const selectedItems = this.IndentItemsDetailForm.value.selectIndentItems.filter(     
      (item: any) => item.Ischecked=== true
    );
    let input = {
      userGuid: this.UserGuid,
      lstBatchNumbers: selectedItems
    }
    this.globalService.startSpinner();
    this.indentService.SavBatchDetails(input).subscribe(
      (data) => {
        this.globalService.stopSpinner();
        this.Keyword='';
        this.GetBatchDetails();
      },
      (err) => {
        this.globalService.stopSpinner();
      })
  }
  /***
    * This method is used for get the default indent location 
    */
  GetDefaultLocation() {
    // this.globalService.startSpinner();
    this.shimmerVisible=true;
    let DepotmentGuid = this.authservice.LoggedInUser.DEFAULTROLES.toLowerCase().includes('ADMIN'.toLowerCase()) && this.authservice.LoggedInUser.LOCATIONSGUID == '00000000-0000-0000-0000-000000000000' ? '00000000-0000-0000-0000-000000000000' : this.authservice.LoggedInUser.LOCATIONSGUID.toLowerCase().split(",");
    this.indentService.GetIndentLocation().subscribe(
      (data) => {
        // this.lstFromLocations = data.getIndentLocationResponse
        if (DepotmentGuid == '00000000-0000-0000-0000-000000000000') {
          this.lstFromLocations = data.getIndentLocationResponse
        }
        else {
          let OriginalLstIndentLocation = data.getIndentLocationResponse
          const filteredLocations = OriginalLstIndentLocation.filter((LocationData: any) =>
            DepotmentGuid.includes(LocationData.LocationGuid)
          );

          this.lstFromLocations = filteredLocations;
        }
        // this.globalService.stopSpinner();
        this.shimmerVisible=false;
      });
  }
  /**
   * this service method used to get the To locations
   * @param event 
   */
  GetSIIndent(event: any) {
    this.TolocationControl.reset();
    if (!event || event == undefined) {
      this.addItemslist.clear();
      this.Itemslist.clear();
      this.indentList = [];
      this.IsSearchShow=true
    }
    else {
      this.FromLocationGuid = event.LocationGuid || ''
      this.indentService.GetSIindentDetails(this.FromLocationGuid, this.ToLocationGuid, this.Keyword, this.IssueFromDate, this.IssueToDate).subscribe(
        (data) => {
          this.SIindentList = data.Result || [];
          this.indentList = this.SIindentList.filter((obj: { LocationGuid: any; }, index: any, self: any[]) =>
            index === self.findIndex((item) => (
              item.LocationGuid === obj.LocationGuid
            ))
          );
        })
    }
  }
  /**
   * this service method get the To location items
   * @param event 
   */
  GetSIInde(event: any) {
    if (event == undefined || !event) {
      this.IsSearchShow = true
    }
    this.addItemslist.clear();
    this.Itemslist.clear();
    this.FromLocationGuid;
    this.ToLocationGuid = event.LocationGuid || '';
    this.indentService.GetSIindentDetails(this.FromLocationGuid, this.ToLocationGuid, this.Keyword, this.IssueFromDate, this.IssueToDate).subscribe(
      (data) => {
        this.ToindentList = data.Result || [];
        this.IsSearchShow = false;
      })
    this.ToLocationGuid = '';
  }
  /**
   * this service method used to get the all bactch items
   */
  GetBatchDetails() {
    this.newBatchNumberList = [];
    // this.globalService.startSpinner();
    this.shimmerVisible=true;
    let DepotmentGuid = this.authservice.LoggedInUser.DEFAULTROLES.toLowerCase().includes('ADMIN'.toLowerCase()) && this.authservice.LoggedInUser.LOCATIONSGUID == '00000000-0000-0000-0000-000000000000' ? '00000000-0000-0000-0000-000000000000' : this.authservice.LoggedInUser.LOCATIONSGUID.split(",");
    let IsStore=this.authservice.LoggedInUser.STORE
    this.indentService.GetBatchDetail(this.FromDate, this.EndDate, this.PageNumber, this.RowCount, this.Keyword, this.OrderBy, this.SortType, DepotmentGuid,IsStore).subscribe(
      (data) => {
        // this.globalService.stopSpinner();
        this.shimmerVisible=false;
        if(this.authservice.LoggedInUser.STORE=='false' || this.authservice.LoggedInUser.STORE==false){
          this.BatchNumberList=data.Result.filter((data:any)=>data.DispatchStatus==true)
        }
        else{
          this.BatchNumberList = data.Result || [];
        }
        this.newBatchNumberList = this.BatchNumberList.filter((obj: { BatchNumber: any; }, index: any, self: any[]) =>
          index === self.findIndex((item) => (
            item.BatchNumber === obj.BatchNumber
          ))
        );
        this.totalCount = this.newBatchNumberList.length;
        this.ChangePagenumber(1)
      },
      (err) => {
        // this.globalService.stopSpinner();
        this.shimmerVisible=false;
      });
  }
  /**
   * this event set the ISSUE DETAIL
   */
  setvalue() {
    const uniqueItems: Set<string> = new Set();
    this.ToindentList.forEach((element: {
      ItemName: any, VendorItemName:any, IndentNo: any, CreatedDt: any, FromRights: any, NewQty: any, ReqQty: any,ItemReceiveQty:any, ItemGuid: any; ReceiveQty: any, BatchExpiryDate: any,StcokGuid : any,NewQuantity : any,BatchNumber : any,IsExpirable : any
    }) => {
      const key = `${element.ItemName}-${element.IndentNo}`;
      if (!uniqueItems.has(key)) {
        uniqueItems.add(key);
        this.addItemslist.push(this.fb.group({
          ItemName: element.ItemName,
          VendorItemName: element.VendorItemName?element.VendorItemName:'N/A',
          IndentNo: element.IndentNo,
          CreatedDt: element.CreatedDt,
          FromRights: element.FromRights,
          NewQty: element.NewQty,
          ReqQty: (element.ReqQty - element.ItemReceiveQty),
          IsSelected: false,
          ItemGuid: element.ItemGuid,
          BatchExpiryDate: element.BatchExpiryDate,
          StcokGuid : element.StcokGuid,
          NewQuantity : element.NewQuantity,
          IsExpirable : element.IsExpirable,
          BatchNumber : element.BatchNumber,
          ItemReceiveQty:element.ItemReceiveQty
        }));
      }
    });
    this.IsSearchShow = true;
  }
  /**
   * this event select the batch items
   * @param event 
   * @param item 
   */
  SelectedBatch(event: any, item: any,index?:number) {
    const checked = event.target.checked;
    const matchedList = this.ToindentList.filter((ab: any) => ab.ItemGuid === item.value.ItemGuid && ab.IndentNo === item.value.IndentNo);
    if (checked === true) {
      this.selectedBatch = this.selectedBatch.concat(matchedList.map((matchedItem: any) => ({
        CreatedDt: matchedItem.CreatedDt,
        FromRights: matchedItem.FromRights,
        IndentNo: matchedItem.IndentNo,
        ItemGuid: matchedItem.ItemGuid,
        ItemName: matchedItem.ItemName,
        NewQty: matchedItem.NewQty,
        ReqQty: (matchedItem.ReqQty - matchedItem.ReceiveQty),
        BatchExpiryDate: matchedItem.BatchExpiryDate,
        StcokGuid : matchedItem.StcokGuid,
        Isselected: true,
        NewQuantity : matchedItem.NewQuantity,
        IsExpirable : matchedItem.IsExpirable,
        BatchNumber : matchedItem.BatchNumber,
        VendorItemName : matchedItem.VendorItemName,
        SelectedIndex : index
      })));
    } else {
      const selectedBatch = this.selectedBatch.filter((selectedItem: { ItemGuid: any; IndentNo: any }) =>
        selectedItem.ItemGuid !== item.value.ItemGuid || selectedItem.IndentNo !== item.value.IndentNo
      );
      this.selectedBatch = selectedBatch;
    }
    this.listenToFormChanges();
  }
  /**
   * this event set the Dispach items
   * @param item 
   * @param index 
   */
  selectitems() {
     this.selectedBatch.sort((a: any, b: any) => {
      const dateA = moment(a.BatchExpiryDate);
      const dateB = moment(b.BatchExpiryDate);
      if (dateA.isValid() && dateB.isValid()) {
        return dateA.isBefore(dateB) ? -1 : 1;
      } else if (dateA.isValid()) {
        return -1; 
      } else if (dateB.isValid()) {
        return 1; 
      } else {
        return 0; 
      }
    });
    this.selecteditems = [];
    const today = moment();// get today's date
  
    this.selectedBatch.forEach((element: {
      CreatedDt: any, FromRights: any, IndentNo: any, ItemGuid: any, ItemName: any, NewQty: any, ReqQty: any, BatchExpiryDate: any, StcokGuid: any, NewQuantity: any, BatchNumber: any, IsExpirable: any, VendorItemName: any,
      SelectedIndex: number
    }) => {
      if (element.NewQty === 0) {
        return;
      }
      if (element.NewQuantity != 0) {
        let updatedExpiryDate = element.BatchExpiryDate ? moment(element.BatchExpiryDate).format("DD-MM-YYYY") : null;
        const expiryDate = moment(updatedExpiryDate, "DD-MM-YYYY"); 
        if (expiryDate.isSameOrAfter(today) || element.BatchExpiryDate==null) {
          this.selecteditems.push({
            ItemName: element.ItemName,
            IndentNo: element.IndentNo,
            CreatedDt: element.CreatedDt,
            FromRights: element.FromRights,
            NewQty: element.NewQuantity,
            ReqQty: element.ReqQty,
            ItemGuid: element.ItemGuid,
            BatchQuantity: '',
            NumberOfBox: 1,
            BatchExpiryDate: updatedExpiryDate,
            StcokGuid: element.StcokGuid,
            IsBatchCreated: true,
            Ischecked: false,
            NewQuantity: element.NewQuantity,
            IsExpirable: element.IsExpirable,
            BatchNumber: element.BatchNumber,
            VendorItemName: element.VendorItemName,
            IsAddSelected: false
          });
  
          if (
            element.ItemGuid &&
            this.Itemslist?.value.length > 0 ?
              !this.Itemslist?.value.some((item: any) => item?.ItemGuid === element?.ItemGuid) : true
          ) {
            let updatedExpiryDate = element.BatchExpiryDate ? moment(element.BatchExpiryDate).format("DD-MM-YYYY") : null;
            this.Itemslist.push(this.fb.group({
              ItemName: element.ItemName,
              IndentNo: element.IndentNo,
              CreatedDt: element.CreatedDt,
              FromRights: element.FromRights,
              NewQty: element.NewQuantity,
              ReqQty: element.ReqQty,
              ItemGuid: element.ItemGuid,
              BatchQuantity: '',
              NumberOfBox: 1,
              BatchExpiryDate: updatedExpiryDate,
              StcokGuid: element.StcokGuid,
              IsBatchCreated: true,
              Ischecked: false,
              NewQuantity: element.NewQuantity,
              IsExpirable: element.IsExpirable,
              BatchNumber: element.BatchNumber,
              VendorItemName: element.VendorItemName,
              BatchExpiryDates: updatedExpiryDate,
              SelectedItemIndex: element.SelectedIndex,
              IsAddSelected: false
            }));
          }
        }
      }
    });
  }
  
  
  
  
  /**
   * this event set the batch items
   * @param index 
   * @param item 
   */
  SetBatchNumber(index: any, item: any) {
    let RequestQty = this.IndentItemsDetailForm.get('selectIndentItems')?.value[index].ReqQty;
    let InHouseUnit = this.IndentItemsDetailForm.get('selectIndentItems')?.value[index].NewQty;
    if (RequestQty > InHouseUnit) {
      this.BatchUnit = InHouseUnit
    }
    if (RequestQty < InHouseUnit) {
      this.BatchUnit = RequestQty
    }
    this.Itemslist.push(this.fb.group({
      BatchQuantity: this.BatchUnit
    }))
  }
  /**
   * remove the batch items
   */
  remove(index: any) {
    this.Itemslist.removeAt(index)
  }
  openBasicXlModal(content: TemplateRef<any>) {
    this.modalService.open(content, { size: 'xl' }).result.then((result) => {
      console.log("Modal closed" + result);
    }).catch((res) => { });
  }
  //restricted the popup modal
  openBackDropCustomClass(content: TemplateRef<any>) {
    this.modalService.open(content, { backdrop: 'static', keyboard: false, size: 'xl' });
  }
  DispatchDetails(index: any, event: any, fromName?: any) {
    if (fromName == 'CourierName') {
      const updatedObj = { ...this.IndentGuidlst[index], CourierName: event.target.value };
      this.IndentGuidlst.splice(index, 1, updatedObj);
    }
    else {
      const updatedObj = { ...this.IndentGuidlst[index], AWBNumber: event.target.value };
      this.IndentGuidlst.splice(index, 1, updatedObj);
    }
  }
  /**
 * this event used to filters the indent Guid
 */
  onCheckboxChange(item: any, event: any) {
    this.isChecked = event.target.checked;
  }
  SaveGuid(event: any, index: any) {
    this.SelectedDispatchItems=[]
    if (this.isChecked === false) {
      this.SelectedDispatchItems = this.SelectedDispatchItems.filter(
        (item: { BatchNumber: string }) => item.BatchNumber !== event.BatchNumber
      );
      this.IndentGuidlst = this.IndentGuidlst.filter(
        (item: { indentGuid: any }) => item.indentGuid !== event.Guid
      );
    }
    if (this.isChecked === true) {
      const supplierDetails = this.BatchNumberList.filter(
        (item: { BatchNumber: string }) => item.BatchNumber === event.BatchNumber
      );
      this.SelectedDispatchItems.push(...supplierDetails);
      const guidOutput = supplierDetails.map((obj: { Guid: any }) => ({
        indentGuid: obj.Guid,
        CourierName: '',
        AWBNumber: ''
      }));
      for (let i = 0; i < guidOutput.length; i++) {
        this.IndentGuidlst.push(guidOutput[i]);
      }
    }
  }
  /**
   * this service method used to save the Dispach items
   */
  Savedispatch() {
    let input = {
      Status: true,
      UserGuid: this.UserGuid,
      lstBatchNumbersDispatch: this.IndentGuidlst
    }
    this.indentService.SaveDispatch(input).subscribe(
      (data) => {
        this.globalService.stopSpinner();
        this.Guidoutput = [];
        this.SelectedDispatchItems=[]
        this.GetBatchDetails();
      },
      (err) => {
        this.globalService.stopSpinner();
      });
  }
  /**
   * remove the batch items
   */
  CleareItems() {
    this.Itemslist.clear();
  }
  /**
   * this service method used to save the Recived items
   */
  SaveReciveDetails(): void {
    let input = {
      userGuid: this.UserGuid,
      lstBatchReciveDetails: this.BatchReciveDetails
    }
    // this.globalService.startSpinner();
    this.shimmerVisible=true;
    this.indentService.SavReciveDetails(input).subscribe(
      (data) => {
        // this.globalService.stopSpinner();
        this.shimmerVisible=false;
        this.GetBatchDetails();
      },
      (err) => {
        // this.globalService.stopSpinner();
        this.shimmerVisible=false;
      })
  }
  /**
   * this Service method used to save the Consumed items
   */
  SaveConsumeItems(): void {
    this.ConsumeItemslist.value.forEach((element: any, index: any) => {
      const barcodedetails = this.ConsumeItemslist.at(index)
      barcodedetails.patchValue({
        ReasonForUse: element.ReasonForUse,
        Units: element.Units
      });
    });
    let input = {
      userGuid: this.UserGuid,
      LstConsumeItems: this.IndentItemsDetailForm.value.ConsumeDetailItems
    }
    this.globalService.startSpinner();
    this.indentService.SaveConsumeDetails(input).subscribe(
      (data) => {
        this.globalService.stopSpinner();
        this.GetBatchDetails();
      },
      (err) => {
        this.globalService.stopSpinner();
      })
  }
  /**
   * this event Set the Consume items
   * @param event 
   */
  SetConsumeItems(event: any) {
    this.Consumeitems = this.BatchNumberList.filter((item: { BatchNumber: string; }) => item.BatchNumber === event.BatchNumber);
    this.Consumeitems.forEach((element: {
      ItemName: any, BatchNumber: any, ItemGuid: any, ConsumeQty: any, IssueMultiplier: any
    }) => {
      this.ConsumeItemslist.push(this.fb.group({
        ItemName: element.ItemName,
        BatchNumber: element.BatchNumber,
        ItemGuid: element.ItemGuid,
        ConsumeQuantity: element.ConsumeQty,
        ReasonForUse: '',
        Units: (element.ConsumeQty * element.IssueMultiplier)
      }))
    })
  }
  /**
   * this change event used to change the Issue Invoice No search
   * @param event 
   */
  Search(event: any) {
    if(event.target.value!=''){
      this.Keyword = (event.target.value);
      this.GetSIInde(event);
    }
  }
  /**
   * this change event used to change the issue from date
   * @param event 
   */
  selectFromDate(event: any) {
    this.SelectedIssueFromDate = event;
    this.IssueToDate='';
    this.IsSearchShow = true;
    this.clearIssuedateControl.reset();
    this.IssueFromDate = event.year + "-" + event.month + "-" + event.day;
  }
  /**
 * this change event used to change the issue from date
 * @param event 
 */
  selectToDate(event: any) {
    this.IssueToDate = event.year + "-" + event.month + "-" + event.day;
    if (this.IssueFromDate != '' || this.IssueToDate != '') {
      this.GetSIInde(event);
    }
  }
  /**
   * this change event change the row number
   * @param rowNo 
   */
  ChangeEvent(rowNo: any) {
    this.itemsPerPage = rowNo.target.value;
    this.RowCount = rowNo.target.value;
    this.PageNumber = 1;
    this.GetBatchDetails();
  }
  /**
   * this change event to chage the page number
   * @param event 
   */
  ChangePagenumber(event: any) {
    this.PageNumber = event;
    this.BatchNumberLst = this.newBatchNumberList.slice((this.PageNumber - 1) * this.itemsPerPage, this.PageNumber * this.itemsPerPage);
  }
  /**
   * this change event used to search the bathes
   * @param event 
   */
  ChangeSearch(event: any) {
    this.modelChanged.next(event.target.value);
  }
  /**
   * this event change to the  From Date
   * @param event 
   */
  SelectstartDate(event: any) {
    this.cleardateControl.reset();
    this.noDataFound = false;
    this.isDisable = false;
    this.selectedFromDate = event;
    this.EndDate='';
    this.FromDate = event.year + "-" + event.month + "-" + event.day;
    this.selectefromDate = {
      year: event.year,
      month: event.month,
      day: event.day
    };
    this.selectedToDate = "";
    this.GetBatchDetails();
  }
  /**
  * this event change to the  To Date
  * @param event 
  */
  SelectEndDate(event: any,) {
    this.noDataFound = false
    this.isDisable = false
    this.selectedToDate = event
    this.EndDate = event.year + "-" + event.month + "-" + event.day;
      this.GetBatchDetails();
  }
  /**
   * this event used to show the items
   * @param event 
   */
  ShowItems(event: any) {
    this.BatchTotalItems = this.BatchNumberList.filter((item: { BatchNumber: string; }) => item.BatchNumber === event.BatchNumber);
  }
  /**
   * this event used to validation for BatchQuantity
   * @param value 
   * @param index 
   */
  BatchQuantity(event:any, index: any) {
    const ItemQuantity=event.target.value
    const value1=event.target.value
    const value=parseFloat(value1)
    const selectIndentItemsArray = this.IndentItemsDetailForm.get('selectIndentItems') as FormArray;
    const BatchQuantityCountControl = this.IndentItemsDetailForm.get('selectIndentItems.' + index + '.BatchQuantity');
    let Requestunit = this.IndentItemsDetailForm.get('selectIndentItems')?.value[index].ReqQty;
    let NewQty = this.IndentItemsDetailForm.get('selectIndentItems')?.value[index].NewQuantity;
    const targetItemGuid = this.IndentItemsDetailForm.get('selectIndentItems')?.value[index].ItemGuid;
    let totalQuantity = 0;
    let totalbatchQuantity = 0;
    for (const control of selectIndentItemsArray.controls) {
     totalQuantity = 0;
     totalbatchQuantity = 0;
      const itemguid = control.get('ItemGuid')?.value; 
      const reqQty = control.get('ReqQty')?.value;
      const BatchExpiryDate=control.get('BatchExpiryDate')?.value?.slice(0, 10)
      const today = new Date();
      let expiryDate  : any
      if(BatchExpiryDate){
        const parts = BatchExpiryDate?.split('-');
         expiryDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
      }
      if (itemguid === targetItemGuid &&  expiryDate < today) {
        totalQuantity += reqQty;
      }
      const BatchQuantity = control.get('BatchQuantity')?.value;
      if (itemguid === targetItemGuid) {
        let Quanty=parseFloat(BatchQuantity?BatchQuantity :0)
        let totalqu=totalbatchQuantity+Quanty
        totalbatchQuantity =totalqu;
      }
    }
    setTimeout(()=>{
      if (value <= Requestunit) {
        if (value <= NewQty) {
          BatchQuantityCountControl?.setValue(value);
        } else {
          BatchQuantityCountControl?.setValue(0);
        }
      } else {
        BatchQuantityCountControl?.setValue(0);
      }
    },500)
  }
  /**
  * this event used to filter the recived items
  * @param event 
  */
  SetReciveItems(event: any, type: any) {
    this.Reciveditems = this.BatchNumberList.filter((item: { BatchNumber: string; }) => item.BatchNumber === event);
    this.BatchReciveDetails = this.Reciveditems.map((obj: { Guid: any; NoOfBox: any; SendQty: any, BatchNumber: any, ReceiveQty: any ,ManufactureName:any,RejectQuantity:any,Rejectreason:any}) =>
      ({ indentGuid: obj.Guid, numberOfBoxes: obj.NoOfBox, BatchQuantity: obj.SendQty, BatchNumber: obj.BatchNumber , ManufactureName:obj.ManufactureName,RejectQuantity:0,Rejectreason:''}));
      if (type == 'PDF') {
      this.DownloadPdf();
    }
    else if(type == 'XL'){
      this.downloadExcel();
    }
  }
  /**
   * set recive quantity
   * @param index 
   * @param event 
   */
  SetReciveDetails(index: any, event: any) {
    const updatedObj = { ...this.BatchReciveDetails[index], BatchQuantity: event.target.value };
    this.BatchReciveDetails.splice(index, 1, updatedObj);
  }
  /**
   * this event used to set validation For recived items quantity
   * @param item 
   * @param index 
   * @param event 
   */
  setvalidation(item: any, index: number, event: any) {
    const Reciveite = this.newBatchNumberList.filter((OBJ: { BatchNumber: string; }) => OBJ.BatchNumber === item.BatchNumber);
    let ReceiveQty = item.ReceiveQty;
    let value = event.target.value;
    let number = parseInt(value);
    if (number <= ReceiveQty) {
      this.RecivedSending = value;
      this.ButtonDisable=true;
      this.Reciveditems[index].isReturn=true;
    } else {
      this.RecivedSending = ReceiveQty;
      this.ButtonDisable=false;
      this.Reciveditems[index].isReturn=false;
    }
    if(ReceiveQty==number){
      this.ButtonDisable=false;
      this.Reciveditems[index].isReturn=false;
    }
   this.BatchReciveDetails[index].BatchQuantity = this.RecivedSending;
    this.Reciveditems[index].SendQty = this.RecivedSending;
    this.Reciveditems[index].RejectQuantity = (item.ReceiveQty-this.RecivedSending);
    this.BatchReciveDetails[index].RejectQuantity =(item.ReceiveQty-this.RecivedSending);
  }
   /**
   * this event used to set validation For recived items quantity
   * @param item 
   * @param index 
   * @param event 
   */
     setrejuctquntity(item: any, index: number, event: any) {
     let value = event.target.value;
     let number = parseInt(value);
     let DispathQty = item.ReceiveQty;
     let RejectQty=item.SendQty+number
    if (number < 0) {
      this.RejectQuantity=0;
    } 
    else if (DispathQty>=RejectQty){
      this.RejectQuantity= number;
      this.ButtonDisable=true;
    }
    else {
      this.RejectQuantity = 0;
    }
    this.Reciveditems[index].RejectQuantity =this.RejectQuantity;
    this.BatchReciveDetails[index].RejectQuantity = this.RejectQuantity;
  }
  setreoson(item:any,index:any,event:any){
  const Reason=event.target.value
  this.BatchReciveDetails[index].Rejectreason = Reason;
  if(Reason==""){
    this.ButtonDisable=true;
    this.Reciveditems[index].isReturn=true;
  }else{
    this.ButtonDisable=false ;
    this.Reciveditems[index].isReturn=false;
  }
  }
  /**
   * this event restrict the nagitive values in recived items
   * @param event 
   */
  restrictCharectors(event: any) {
    const allowedRegex = /[0-9]/g;
    if (!event.key.match(allowedRegex)) {
      event.preventDefault();
    }
  }
  /**
   * This event used clear the filter values
   */
  ClearFilter() {
    this.isDisable = true
    this.noDataFound = false
    this.FromLocationGuid = '';
    this.ToLocationGuid = '';
    this.Keyword = "";
    this.IssueFromDate = "";
    this.clearControl.reset();
    this.cleardateControl.reset();
    this.clearfromdateControl.reset();
    this.TolocationControl.reset();
    this.clearIssuedateControl.reset();
    this.IssueFromDate='';
    this.IssueToDate='';
    this.addItemslist.clear();
    this.IsSearchShow=true;
    this.selectedBatch=[];
  }
  Remove() {
    this.FromDate='';
    this.EndDate='';
    this.Keyword=[];
    this.clearfromdateControl.reset();
    this.cleardateControl.reset();
    this.GetBatchDetails();
  }
  /**
   * This method used to dowload the Pdf
   */
  DownloadPdf() {
    let html = "";
    html = this.UnparsedHtml;
    const replacements: any = {
      '%%Issuenote%%': this.Reciveditems[0].MaterialIssueNo || '',
      '%%FromLocation%%': this.Reciveditems[0].ToLocation==null?'N/A':this.Reciveditems[0].ToLocation || '',
      '%%ToLocation%%': this.Reciveditems[0].FromLocation==null?'N/A':this.Reciveditems[0].FromLocation || '',
      '%%Date%%':this.Reciveditems[0].DispatchDate=='0001-01-01T00:00:00'?'N/A': this.datepipe.transform(this.Reciveditems[0].DispatchDate, 'dd-MMM-yyyy hh:mm a') || '',
      '%%RecivedBy%%': this.Reciveditems[0].DispatchedUser || '',
      '%%CurrentDate%%': this.newDate || ''
    };
    for (const key in replacements) {
      html = html.replace(key, replacements[key]);
    }
    let dochtml: any = '';
    dochtml = new DOMParser().parseFromString(html, 'text/html');
    let Reciveditems: any = dochtml.querySelector('#Reciveditems');
    Reciveditems.innerHTML = '';
    for (let i = 0; i < this.Reciveditems.length; i++) {
      let updatedTemplate: any = '';
      updatedTemplate = this.UnparsedHtml
        .replace('%%ItemSNo%%', i + 1 || '')
        .replace('%%IndentNo%%', this.Reciveditems[i].IndentNo || '')
        .replace('%%ItemName%%', this.Reciveditems[i].ItemName || '')
        .replace('%%VendorItemName%%', this.Reciveditems[i].VendorItemName?this.Reciveditems[i].VendorItemName:'N/A' || '')
        .replace('%%Manufacturername%%', this.Reciveditems[i].ManufactureName || '')
        .replace('%%Expirydate%%', this.Reciveditems[i].Expiredate =='0001-01-01T00:00:00' ? 'N/A' : this.datepipe.transform (this.Reciveditems[i].Expiredate,'dd-MM-yyyy')  || '')
        .replace('%%ItemCatalog%%', this.Reciveditems[i].CatalogNo || '')
        .replace('%%Quantity%%', this.Reciveditems[i].SendQty || '')
        .replace('%%Batchnumber%%', this.Reciveditems[i].GrnBatchNumber || '')
      let jobElement: any = '';
      jobElement = new DOMParser().parseFromString(updatedTemplate, 'text/html').querySelector('#Reciveditems');
      Reciveditems.appendChild(jobElement);
    }
    html = dochtml.documentElement.outerHTML
    const options = {
      filename: `Issueitems-Details_${this.Reciveditems[0].MaterialIssueNo}.pdf`,
      margin: 0.2,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 1 },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'landscape' }
    };
    const element = html;
    html2pdf().from(element).set(options).save();
  }
/**
 * This method used dowload the Exel
 */
  downloadExcel() {
    const header = ['ItemName', 'Vendor ItemName' ,'Manufacturername','GRN batch number','Catlog no.','Expiry date', 'Quantity', ];
    // Create workbook and worksheet
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('Sharing Data');
    // Add Header Row
    const headerRow = worksheet.addRow(header);
    // Cell Style : Fill and Border
    headerRow.eachCell((cell, number) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFFF00' },
        bgColor: { argb: 'FF0000FF' }
      };
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    });
    worksheet.getColumn(1).width = 40;
    worksheet.getColumn(2).width = 35;
    worksheet.getColumn(3).width = 20;
    worksheet.getColumn(4).width = 20;
    worksheet.getColumn(5).width = 20;
    worksheet.getColumn(6).width = 20;
    worksheet.getColumn(7).width = 20;
    // worksheet.addRow([]);
    this.Reciveditems.forEach((item: any) => {
        const row = worksheet.addRow([
          item.ItemName,
          item.VendorItemName?item.VendorItemName:'N/A',
          item.ManufactureName,
          item.GrnBatchNumber,
          item.CatalogNo,
          item.Expiredate =='0001-01-01T00:00:00' ? 'N/A' : this.datepipe.transform(item.Expiredate,'dd-MM-yyyy'),
          item.SendQty
        ]);
    });
    const fileName = `MaterialIssue${this.Reciveditems[0].MaterialIssueNo}.xlsx`;
    workbook.xlsx.writeBuffer().then((data: any) => {
      const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, fileName);
    });
   }
   GetSIRequestLocations() {
    let DepotmentGuid =this.authservice.LoggedInUser.DEFAULTROLES.toLowerCase().includes('ADMIN'.toLowerCase()) && this.authservice.LoggedInUser.LOCATIONSGUID=='00000000-0000-0000-0000-000000000000' ?'00000000-0000-0000-0000-000000000000': this.authservice.LoggedInUser.LOCATIONSGUID.split(",")
    this.indentService.GetSIRequestLocations(DepotmentGuid).subscribe(
      (data) => {
        this.lstFromLocations = data
    })
}
/**
 * this event used to set the reject items 
 * @param event 
 */
  SetStoreRecive(event:any){
  this.ReturnIndentGuidlst=[];
    this.IndetguidOutput = this.BatchNumberList.filter(
      (item: { BatchNumber: string,RejectQuantity:any }) => item.BatchNumber === event.BatchNumber && item.RejectQuantity!=null && item.RejectQuantity!=0
    );
    const guidOutput = this.IndetguidOutput.map((obj: { Guid: any,StockPhycicalGuid:any,RejectQuantity:any,AcceptQty:any}) => ({
      IndentGuid: obj.Guid,
      StockGuid:obj.StockPhycicalGuid,
      RejectQty:obj.RejectQuantity,
      AcceptQty:0
    }))
    for (let i = 0; i < guidOutput.length; i++) {
      this.ReturnIndentGuidlst.push(guidOutput[i]);
    }
   }
  /**
   * this event used to save the accept quantity
   * @param event 
   * @param item 
   * @param index 
   */
  SetAcceptQuantity(event:any,item:any,index:number) {
    let RejectQuantity = item.RejectQuantity;
    let RejectQuantity1 = parseInt(RejectQuantity);
    let value = event.target.value;
    let value1=parseInt(value);
    if (value1 < RejectQuantity1) {
      this.AcceptQty = value;
      this.RejectDisable=false;
    }else {
      this.AcceptQty = RejectQuantity;
      this.RejectDisable=false;
    }
   this.ReturnIndentGuidlst[index].AcceptQty = this.AcceptQty;
   this.IndetguidOutput[index].AcceptQty = this.AcceptQty;
  }
  /**
   * this service method used to save the Dispach items
   */
  SaveStoreReceive() {
    this.shimmerVisible=true;
    let input = {
      IsStore:this.Store,
      LstReceiveItems: this.ReturnIndentGuidlst
    }
    this.indentService.SaveStoreReturn(input).subscribe(
      (data) => {
        this.GetBatchDetails();
        this.IndetguidOutput=[];
        this.ReturnIndentGuidlst=[];
        this.AcceptQty='';
        this.shimmerVisible=false;
      },
      (err) => {
        this.shimmerVisible=false;
      });
  }
   /**
 * This event selects the  items
 * @param event 
 * @param item 
 */
   SelectItem(event: any, item: any, indexs: any) {
    const Ischecked = event.target.checked;
    this.Itemslist.controls.forEach((control, index) => {
      if (index === indexs) {
        control.patchValue({
          Ischecked: Ischecked
        });
        if(Ischecked){
          control.get('BatchQuantity')?.setValidators([Validators.required]);
          control.get('BatchQuantity')?.updateValueAndValidity();
        }else{
          control.get('BatchQuantity')?.clearValidators();
          control.get('BatchQuantity')?.updateValueAndValidity();
        }
      }
    });
    this.checkAllItemsChecked = this.Itemslist.value.every((f: any) => f.Ischecked);
  }
  isCheckboxDisabled(batchExpiryDate: any): boolean {
    if (!batchExpiryDate) {
      return true; 
    }
    const today = new Date();
    let parsedDate: any; 
    try {
      const [day, month, year] = batchExpiryDate.split('-');
      parsedDate = new Date(Number(year), Number(month) - 1, Number(day)); 
    } catch (error) {
      return true;
    }
    return parsedDate < today;
  }
  listenToFormChanges(): void {
    this.IndentItemsDetailForm.get('selectIndentItems')?.valueChanges.subscribe(values => {
      this.isAnyValueFilled = values.some((item: any) => {
        return (
          !!item.BatchQuantity &&
          !!item.NumberOfBox &&
          !!item.Ischecked
        );
      });
    });
  }  
   onSelectAllItems(event:any){
    const isChecked = event.target.checked;
    this.checkAllItemsChecked = isChecked;
    this.Itemslist.controls.forEach((control) => {
      const isExpirable = control.value.IsExpirable;
      const batchExpiryDate = control.value.BatchExpiryDate?.slice(0, 10);
      const isDisabled = this.isCheckboxDisabled(batchExpiryDate);
      const shouldCheck = isExpirable ? isChecked : !isDisabled && isChecked;
      control.patchValue({ Ischecked: shouldCheck });
      
      if (shouldCheck) {
        control.get('BatchQuantity')?.setValidators([Validators.required]);
        control.get('BatchQuantity')?.updateValueAndValidity();
      }
      else if (!isChecked){
        control.get('BatchQuantity')?.clearValidators();
        control.get('BatchQuantity')?.updateValueAndValidity();
      }
    });
  }
  selectAllItems(event: any) {
    const isChecked = event.target.checked;
    this.selectedBatch=[]
    const indentItemsList = this.IndentItemsDetailForm?.get('LisIndentItems')?.value;
      const matchedList = this.ToindentList.flatMap((ab: any) => 
      indentItemsList.map((element: any, index: number) => 
        ab.ItemGuid === element.ItemGuid && ab.IndentNo === element.IndentNo ? { ...ab, SelectedIndex:index+1 } : null
      ).filter((item: any) => item !== null)
    );
    matchedList.forEach((item:any, index:any) => {
      if (item.NewQty > 0) {
        (this.IndentItemsDetailForm?.get('LisIndentItems') as FormArray)?.controls?.forEach((control:any) => {
          control.patchValue({
            IsSelected: isChecked,
          });
        });
        if(isChecked){
          this.selectedBatch.push({
            CreatedDt: item.CreatedDt,
            FromRights: item.FromRights,
            IndentNo: item.IndentNo,
            ItemGuid: item.ItemGuid,
            ItemName: item.ItemName,
            NewQty: item.NewQty,
            ReqQty: item.ReqQty - item.ReceiveQty,
            BatchExpiryDate: item.BatchExpiryDate,
            StcokGuid: item.StcokGuid,
            Isselected: true,
            NewQuantity: item.NewQuantity,
            IsExpirable: item.IsExpirable,
            BatchNumber: item.BatchNumber,
            VendorItemName: item.VendorItemName,
            SelectedIndex : item.SelectedIndex
          });
        }else{
          this.selectedBatch=[]
        }
        
      }
    });
    this.listenToFormChanges()
  }
  onSelectExpiryDates(event: any, index: any) {
    if(event!=undefined){
      let filteredData = this.selecteditems.filter((item: any) => {
        return item.ItemGuid === event.ItemGuid && item.BatchExpiryDate === event.BatchExpiryDate && event.BatchNumber === item.BatchNumber;
      });
      let array = this.Itemslist.at(index);
      filteredData.forEach((data: any) => {
        array.patchValue({
          ItemName: data.ItemName,
          IndentNo: data.IndentNo,
          CreatedDt: data.CreatedDt,
          FromRights: data.FromRights,
          NewQty: data.NewQuantity,
          ReqQty: data.ReqQty,
          ItemGuid: data.ItemGuid,
          BatchQuantity: '',
          NumberOfBox: 1,
          BatchExpiryDate: data.BatchExpiryDate,
          StcokGuid: data.StcokGuid,
          IsBatchCreated: true,
          IsChecked: false,
          NewQuantity: data.NewQuantity,
          IsExpirable: data.IsExpirable,
          BatchNumber: data.BatchNumber,
          VendorItemName: data.VendorItemName,
        });
      });
    }else{
      let array = this.Itemslist.at(index);
          array.patchValue({
          IndentNo: '',
          CreatedDt: '',
          FromRights: '',
          NewQty: '',
          ReqQty: '',
          BatchQuantity: '',
          NumberOfBox: 1,
          BatchExpiryDate: '',
          StcokGuid: '',
          IsBatchCreated: true,
          IsChecked: false,
          NewQuantity: '',
          IsExpirable: '',
          BatchNumber: '',
         
        });
    }
    
  }
  onSelectItems(ItemDetails: any) {
    ItemDetails.get('IsAddSelected').setValue(true);
    this.selecteditems.forEach((element: any) => {
      if (element.ItemGuid === ItemDetails.value.ItemGuid && element.BatchNumber !== ItemDetails.value.BatchNumber) {
        // Find the index of the matching ItemName
        const index = this.Itemslist.controls.findIndex((itemGroup: any) => itemGroup.controls.ItemGuid.value === element.ItemGuid);
        const newItem = this.fb.group({
          ItemName: element.ItemName,
          IndentNo: element.IndentNo,
          CreatedDt: element.CreatedDt,
          FromRights: element.FromRights,
          NewQty: element.NewQuantity,
          ReqQty: element.ReqQty,
          ItemGuid: element.ItemGuid,
          BatchQuantity: '',
          NumberOfBox: 1,
          BatchExpiryDate: element.BatchExpiryDate,
          StcokGuid: element.StcokGuid,
          IsBatchCreated: true,
          Ischecked: false,
          NewQuantity: element.NewQuantity,
          IsExpirable: element.IsExpirable,
          BatchNumber: element.BatchNumber,
          VendorItemName: element.VendorItemName,
          BatchExpiryDates: element.BatchExpiryDate,
          SelectedItemIndex: element.SelectedIndex,
          addButton: true
        });
  
        if (index !== -1) {
          this.Itemslist.insert(index + 1, newItem);
        } else {
          this.Itemslist.push(newItem);
        }
      }
    });
  }
  
}
