import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbDateStruct, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectComponent } from '@ng-select/ng-select';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { AuthenticationService } from 'src/app/core/Services/authentication.service';
import { PurchaseOrderService } from 'src/app/core/Services/purchase-order.service';
import { QuotationService } from 'src/app/core/Services/quotation.service';
import * as html2pdf from 'html2pdf.js';
import * as moment from 'moment';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-po-against-pi',
  templateUrl: './po-against-pi.component.html',
  styleUrls: ['./po-against-pi.component.scss']
})
export class PoAgainstPiComponent implements OnInit {
  [x: string]: any;
  @ViewChild(DatatableComponent) table: DatatableComponent;
  shimmerVisible: boolean;
  selectedDate: NgbDateStruct;
  ListOfSupplier: any = []
  SupplierItems: any;
  purchaseOrderForm: FormGroup = {} as any;
  lstpurchaseOrderItems: FormArray = {} as any;
  FormChanged: boolean = false;
  FromDate: string = '';
  ToDate: string = '';
  IndentNo: any = [];
  LocationGuid: any = [];
  SupplierGuid: any = []
  CenterLocation: any;
  modelChanged = new Subject<string>();
  LstIndentItems: any;
  SelectedIndentItem: any = []
  minDate: any;
  PurchaseOrderGuid: any;
  purchaseOrderDetails: any = [];
  PurchaseOrderItemDetails: any = []
  quantity: any = [];
  index: any = 0;
  isChecked: any;
  status: string;
  DeleteQuotation:any;
  isReadOnly: boolean = true;
  @ViewChild('ngSelectComponent') ngSelectComponent: NgSelectComponent;
  @ViewChild('ExpiryQuotation', { static: true }) expiryQuotationModal!: TemplateRef<any>;
  @ViewChild('packSizeDiff', { static: true }) packSizeDiff!: TemplateRef<any>;
  selectedPendingPI: any;
  QuotationsForItem: any;
  QuotationItemlist: any = [];
  isAllCheckboxChecked: boolean;
  allcheckbox:boolean=false;
  isUrgent: boolean = false;
  recallReason: string = '';
  IsReasonQuotationNo: boolean = false;
  lstQuotationNo : any = [];
  body: any = {
    PurchaseOrderGuid: '',
    ApprovalType: '',
    Reason: '',
    UserGuid: '',
    ApprovalPhoneNumber: '',
    ApprovalEmail: '',
    ApprovalName: ''
  };
  purchaseOrderGuid: any;
  PurchaseOrderGuid1: any;
  UnparsedHtml: any='<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Purchase Order Report</title><style>table{border-collapse:collapse;border:1px solid #000}table td,table th{border-bottom:1px solid #000;border-right:1px solid #000;padding:5px;text-align:left;word-wrap:break-word;word-break:break-all;font-size:10px}table tr:last-child td{border-bottom:none}p{margin:0}</style></head><body><table style="text-align:center;table-layout:fixed" width="100%"><tbody><tr><td><div style="height:28px;display:flex;align-items:center;padding:20px 0"><img data-v-0e549244="" src="data:image/png;base64,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" alt="Yoda LIMS"></div></td></tr></tbody></table><table style="table-layout:fixed" width="100%"><tbody><tr><td style="font-weight:700;font-size:20px;text-align:center">Purchase Order</td></tr></tbody></table><table style="table-layout:fixed" width="100%"><tbody><tr><td style="font-size:14px"><b>PO No:</b>%%PurchaseOrderNo%%</td><td style="font-size:14px"><b>PO Date:</b>%%POCreatedDate%%</td></tr></tbody></table><table style="table-layout:fixed" width="100%"><tbody><tr><td style="font-weight:700;font-size:14px">Ordered By</td><td rowspan="2" style="font-weight:700;font-size:14px">Vendor details</td></tr><tr><td style="font-weight:700;font-size:14px"><b>Yoda lifeline diagnostics pvt ltd</b></td></tr><tr><td style="font-size:14px"><p><b>Address:</b>%%StoreLocationAddress%%</p><p><b>Contact:</b>%%ContactPersonNo%%</p><p><b>GST:</b>%%GSTNNO%%</p></td><td style="font-size:14px"><p><b>Vendor name:</b>%%SupplierName%%<p><b>Vendor address:</b>%%Address%%</p><p><b>Contact person:</b>%%PrimaryContactPerson%%</p><p><b>Vendor mobile:</b>%%PrimaryContactPersonMobileNo%%,%%SecondaryContactPersonMobileNo%%</p><p><b>Vendor email:</b>%%VendorEmailId%%</p><p><b>GST:</b>%%GSTIN%%</p></td></tr><td style="font-size:14px"><b>Bill to address</b></td><td style="font-size:14px"><b>Ship to address</b></td><tr><td style="font-size:14px"><p><b>Name:</b>%%CenterName%%</p><p><b>Address:</b>%%BillStoreLocationAddress%%</p><p><b>Contact person:</b>%%BillingContactPerson%%</p><p><b>Mobile:</b>%%BillingMobileNo%%</p><p><b>Email:</b>%%BillingPersonEmail%%</p><p><b>GST:</b>%%BillLocationGST%%</p></td><td style="font-size:14px"><p><b>Name:</b>%%ShippingCenterName%%</p><p><b>Address:</b>%%ShipStoreLocationAddress%%</p><p><b>Contact person:</b>%%shipingContactPerson%%</p><p><b>Mobile:</b>%%ShipingMobileNo%%</p><p><b>Email:</b>%%ShipingPersonEmail%%</p><p><b>GST:</b>%%ShipLocationGST%%</p></td></tr><tr><td style="font-size:14px"><b>Supplier state:</b>%%SupplierState%%</td><td style="font-size:14px"></td></tr></tbody></table><table style="table-layout:fixed" width="100%"><thead><tr><th width="27">S. No.</th><th width="120">Item name/Item code</th><th width="54">Cat No.</th><th width="54">MFD</th><th width="30">Unit</th><th width="25">Pack size</th><th width="30">Qty</th><th width="54">Unit price</th><th width="30">Disc %</th><th width="20">GST %</th><th width="54">GST amnt.</th><th width="60">Amnt</th></tr></thead><tbody><tr id="PurchaseOrderItemDetails"><td>%%S.NO%%</td><td>%%ItemName%%</td><td>%%CatalogNo%%</td><td>%%ManufactureName%%</td><td>%%MinorUnitName%%</td><td>%%PackSize%%</td><td>%%OrderedQty%%</td><td>&#8377; %%BuyPrice%%</td><td>%%DiscountPer%%</td><td>%%CGST+SGST+UGST%%</td><td>&#8377; %%TaxAmount%%</td><td>&#8377; %%NetAmount%%</td></tr><tr><td colspan="12" style="font-size:12px;text-align:right">Total amount in INR : %%TotalPrice%%</td></tr></tbody></table><table style="width:100%;margin-top:5px"><tbody><tr><td>Created by: %%CreatedBy%%</td><td>Checked by: %%CheckedByName%%</td><td>Approved by: %%AppprovedByName%%</td><td>Recalled by: %%RecallByName%%</td><td>Cancelled by: %%CancelledBy%%</td></tr></tbody></table><table style="width:100%;margin-top:5px"><tbody><tr><td><strong>Payment Term :</strong><strong>%%PaymentTerm%%<strong></strong><br><strong>Delivery term :</strong><strong>%%Deliveryterm%%</strong></td></tr></tbody></table><table style="table-layout:fixed;border:none;margin-top:30px" width="100%"><tbody><tr><td style="font-size:14px;border:none;padding:0;text-align:right"><b>Date:</b>%%PurchaseOrderDownloadDate%%</td></tr><tr><td style="font-size:14px;border:none;padding:0;text-align:right">This is a computer generated document, hence signature is not required.</td></tr></tbody></table></body></html>';
  formattedDate: any;
  PurchaseOrderName: any;
  ShippingLocation: any;
  location: any;
  locationGuid: any;
  Approvalroles: any;
  centername:any
  PurchaseViewDetails: any=[];
  isUrgentControl = new FormControl(false);
  PaymentDetailForm: any;
  fileToUpload: any;
  TodayDate :  any;
  quotationExpired:boolean=false;
  packSizeArray:any=[];
  packSizeString:any;
  role:any
  constructor(
    private modalService: NgbModal,
    private fb: FormBuilder,
    private purchaseOrderService: PurchaseOrderService,
    public route: ActivatedRoute,
    private router: Router,
    private quotationService: QuotationService,
    private datepipe:DatePipe,
    public authservice: AuthenticationService) {
    this.fetch((data: any) => {
      this.modelChanged
        .pipe(debounceTime(1000))
        .subscribe(model => {
          this.IndentNo = model;
          this.GetPOAgainstPIPostDefaults()
        })
    });
    this.isUrgentControl.valueChanges.subscribe((value) => {
      if (value) {
        this.FormChanged=true
      } else {
        this.FormChanged=true
      }
    });
  }
  /**
  * Type : Angular hook 
  * this method is used for on page load functions
  * 
  */
  ngOnInit(): void {
    this.status = this.route.snapshot.paramMap.get('Status') || ''
    
    this.PurchaseOrderGuid = this.route.snapshot.paramMap.get('PurchaseOrderGuid') || ''
    if(this.PurchaseOrderGuid != ''){
      let type = localStorage.setItem("Type" , "Purchase Orders");
    }
    let lstOfRoles = this.authservice.LoggedInUser.POROLES.split(',')
    const currentDate = new Date();
    this.TodayDate = { year: +moment(currentDate).format('YYYY'), month: +moment(currentDate).format('MM'), day: +moment(currentDate).format('DD') };
    //const TodayformattedDate = moment(currentDate).format('DD/MM/YYYY hh:mm');
    this.Approvalroles= lstOfRoles.filter((roles:any)=>roles=='Approval')
    this.initForms()
    this.PaymentDetailForms();
    //this.GetAllPurchaseOrderDetails()
    this.addItemslist.removeAt(0)
    if (!this.PurchaseOrderGuid) {
      this.GetPOAgainstPIPostDefaults();
    }
    this.GetLocationsAndSuppliersByDefault();
    this.purchaseOrderForm.valueChanges.pipe(distinctUntilChanged()).subscribe(values => {
      this.FormChanged = true;
      this.status == "Approved" ? this.isReadOnly == true : this.isReadOnly == false;
    }
    );
    this.role = this.authservice.LoggedInUser.POROLES
  }

  /**
   * form initialization
   */
  initForms(): void {
    this.purchaseOrderForm = this.fb.group({
      PaymentTerm: [null, [Validators.required]],
      DeliveryTerm: [null, [Validators.required]],
      NFANo: [''],
      TermsandConditions: [''],
      Warranty: [''],
      IsEdit: [''],
      PendingPI: [null, [Validators.required]],
      SuppliersName: [null],
      PurchaseOrderGuid: [''],
      UserGuid: [this.authservice.LoggedInUser.UserGuid],
      FromDate1: [null],
      ToDate1: [null],
      IndentNumber: [''],
      paymentsTerms: [''],
      AddDeliveryTerm: [''],
      LocationGuid: [''],
      Isurgent:[false],
      lstpurchaseOrderItems: this.fb.array([
        this.fb.group({
          SupplierGuid: [null, [Validators.required]],
          VenderNme: [null, [Validators.required]],
          IndentNo: [''],
          ItemGuid: ['', [Validators.required]],
          ItemName: [''],
          CatalogNo : [''],
          ManufactureName: [''],
          POSize: ['', [Validators.required]],
          previousPOSize:['', [Validators.required]],
          PurchaseOrderUnit: [''],
          Narration: [''],
          ItemRate: ['', Validators.required],
          DiscountPercentage: ['', Validators.required],
          TaxPercentage: [''],
          UnitPrice: [''],
          OrderQuantity: [null],
          TotalAmount: [''],
          LocationGuid: [''],
          DeliveryLocation: [''],
          IsSelected: [false],
          PurchaseOrderId: [''],
          PurchaseOrderGuid: [''],
          TaxPerCGST: [''],
          TaxPerUGST: [''],
          TaxPerSGST: [''],
          TaxPerIGST: [''],
          QuotationId: [''],
          IsDeleted: [false],
          DefaultItemQuantity: [''],
          InitialAmount: [],
          ReasonQuotationNo:[''],
          QuotationNo: [null, [Validators.required]],
          latestQuotation: [''],
          VendorItemName:[''],
          StockInhandQuantity : [''],
          SNo:['']
        })
      ])
    });
  }
  PaymentDetailForms(): void {
    this.PaymentDetailForm = this.fb.group({
      purchaseOrderGuid:null,
      BankName: ["",[Validators.required]],
      TransectionID: [null,[Validators.required]],
      TransectionDate: [null, [Validators.required]],
      Modeofpayment: ["",[Validators.required]],
      Remarks: ["",[Validators.required]],
      PoNumber:[],
      TotalAmount:[],
      Dueamount:[],
      PaidAmount:["",[Validators.required]],
      DueAmount:[],
      status : [""],
      imageUrl : ["",[Validators.required]],
      InvoiceNumber:[null,[Validators.required]]
    });
  }

  get addItemslist(): FormArray {
    return this.purchaseOrderForm.get('lstpurchaseOrderItems') as FormArray;
  }
  /**
   * this event is used to add the form array
   */
  AddItems() {
    this.addItemslist.push(this.fb.group({
      SupplierGuid: [null, [Validators.required]],
      VenderNme: [null, [Validators.required]],
      ItemName: ['', [Validators.required]],
      CatalogNo : [''],
      IndentNo: [''],
      ItemGuid: ['', [Validators.required]],
      ManufactureName: [''],
      POSize: ['', [Validators.required]],
      previousPOSize:['', [Validators.required]],
      PurchaseOrderUnit: [''],
      Narration: [''],
      ItemRate: ['', Validators.required],
      DiscountPercentage: [null],
      TaxPercentage: [null],
      UnitPrice: [null],
      OrderQuantity: [null],
      TotalAmount: [''],
      LocationGuid: [''],
      DeliveryLocation: [''],
      IsSelected: [false],
      PurchaseOrderId: [''],
      PurchaseOrderGuid: [''],
      TaxPerCGST: [''],
      TaxPerUGST: [''],
      TaxPerSGST: [''],
      TaxPerIGST: [''],
      QuotationId: [''],
      IsDeleted: [false],
      DefaultItemQuantity: [''],
      InitialAmount: [''],
      QuotationNo: [null],
      latestQuotation: [''],
      ReasonQuotationNo:[''],
      VendorItemName:[''],
      StockInhandQuantity : [''],
      SNo:['']
    }), { emitEvent: true });
    this.FormChanged = false
  }
  /**
   * 
   * @param index this event is used for the remove the array
   */
  removeItems(index: any) {
    this.addItemslist.removeAt(index)
  }
  fetch(cb: any) {
    const req = new XMLHttpRequest();
    req.open('GET', `assets/data/all-items.json`);

    req.onload = () => {
      cb(JSON.parse(req.response));
    };

    req.send();
  }
  openBasicModal(content: TemplateRef<any>) {
    this.modalService.open(content, { backdrop: 'static', keyboard: false, size: 'md' }).result.then((result) => {
      console.log("Modal closed" + result);
    }).catch((res) => { });
    this.purchaseOrderForm.patchValue({
      AddDeliveryTerm: '',
      paymentsTerms: ''
    })
  }
  openExpiryQuotationModal() {
    this.modalService.open(this.expiryQuotationModal, {  backdrop: 'static', keyboard: false,size: 'md' }).result.then((result: any) => {
      console.log("Modal closed" + result);
    }).catch((res: any) => { });
  }
  openXlModal(content: TemplateRef<any>) {
    this.modalService.open(content, { backdrop: 'static', keyboard: false,  size: 'xl' }).result.then((result) => {
      console.log("Modal closed" + result);
    }).catch((res) => { });
  }
  openPackSizeDiffModal() {
    this.modalService.open(this.packSizeDiff, {  backdrop: 'static', keyboard: false,size: 'md' }).result.then((result: any) => {
      console.log("Modal closed" + result);
    }).catch((res: any) => { });
  }
  /**
  * This method is used for Get the Supplier items by passing supplier guid
  */
  GetLocationsAndSuppliersByDefault() {
    this.shimmerVisible = true;
    let DepotmentGuid = this.authservice.LoggedInUser.DEFAULTROLES.toLowerCase().includes('ADMIN'.toLowerCase()) && this.authservice.LoggedInUser.LOCATIONSGUID == '00000000-0000-0000-0000-000000000000' ? '00000000-0000-0000-0000-000000000000' : this.authservice.LoggedInUser.LOCATIONSGUID.split(",")
    this.purchaseOrderService.GetPOAgainstPIPostDefaults(DepotmentGuid).subscribe(data => {
      this.SupplierItems = data.Result.LstSuppliers
      this.CenterLocation = data.Result.LstCenterLocations;
      this.shimmerVisible = false;
      if (this.PurchaseOrderGuid) {
        this.GetPurchaseOrderDetails()
      }
    },
      (err: HttpErrorResponse) => {
        this.shimmerVisible = false;
      })
  }
  /**
   * This method is used to get the default data of purchase order page 
   */
  GetPOAgainstPIPostDefaults() {
    let DepotmentGuid = this.authservice.LoggedInUser.DEFAULTROLES.toLowerCase().includes('ADMIN'.toLowerCase()) && this.authservice.LoggedInUser.LOCATIONSGUID == '00000000-0000-0000-0000-000000000000' ? '00000000-0000-0000-0000-000000000000' : this.authservice.LoggedInUser.LOCATIONSGUID.split(",")
    this.purchaseOrderService.GetGetPIForPODefaults(this.FromDate, this.ToDate, this.IndentNo, this.LocationGuid, this.SupplierGuid, DepotmentGuid).subscribe(data => {
      this.ListOfSupplier = data.Result.LstIndentList

      if (DepotmentGuid == '00000000-0000-0000-0000-000000000000') {
        this.LstIndentItems = data.Result.lstGetPOAgainstPItItemTypes
      }
      else {
        this.LstIndentItems = data.Result.lstGetPOAgainstPItItemTypes.filter((items:any) => DepotmentGuid.includes(items.LocationGuid.toUpperCase()));
      }
      if (this.ListOfSupplier.length == 0) {
        this.purchaseOrderForm.patchValue({
          PendingPI: ''
        })
        this.addItemslist.clear()
      }
    },
      (err: HttpErrorResponse) => {

      })
  }
  /**
   * This method is used for Save the purchase order details
   */
  SaveSupplierDetails(): void {
    this.purchaseOrderService.SavePurchaseOrderDetails(this.purchaseOrderForm.value).subscribe(
      (saveitemDetails) => {
        this.router.navigateByUrl('/purchase-orders');
      },
      (err) => {
      });
  }
  OnSelectSupplier(event: any) {
      this.purchaseOrderForm.patchValue({
        PendingPI:null
      })
      this.addItemslist.clear()
    

    this.SupplierItems.forEach((obj: any) => {
      if (obj.SupplierGuid == event.SupplierGuid) {
        this.SupplierGuid.push(obj.SupplierGuid)
      }
    })
    this.GetPOAgainstPIPostDefaults()

  }
  SelectLocation(event: any) {
    if (event.length == 0) {
      this.ListOfSupplier = []
      this.addItemslist.clear()
      this.purchaseOrderForm.patchValue({
        PendingPI: ''
      })
    }
    this.LocationGuid = this.CenterLocation.filter((obj: any) => {
      return event.some((res: any) => obj.LocationGuid == res.LocationGuid);
    }).map((obj: any) => obj.LocationGuid);
    this.GetPOAgainstPIPostDefaults();
  }

  /**
  * 
  * @param row 
  * this event is used for selectFromDate
  */
  selectFromDate(event: any) {
    this.minDate = event
    this.FromDate = event.year + "-" + event.month + "-" + event.day;
    this.GetPOAgainstPIPostDefaults()
  }
  /**
  * 
  * @param row 
  * this event is used for selectToDate
  */
  selectToDate(event: any) {
    this.ToDate = event.year + "-" + event.month + "-" + event.day;
    this.GetPOAgainstPIPostDefaults()
  }
  changeSearch(Keyword: any) {
    this.modelChanged.next(Keyword.target.value);
  }
  SelectIndentsForItems(event: any) {
    this.allcheckbox=false;
    this.selectedPendingPI = event;
    this.SelectedIndentItem = [];
    this.QuotationItemlist = [];
    this.packSizeArray=[]
    this.LstIndentItems.forEach((element: any) => {
      if (event.some((element1: any) => element.IndentNo === element1.IndentNo)) {
        this.SelectedIndentItem.push(element);
      }
    });
    this.QuotationItemlist = this.SelectedIndentItem.filter((obj: { QuotationNo: any; ItemGuid: any; IndentNo: any }, index: any, self: any[]) =>
      index === self.findIndex((item) => (
        item.QuotationNo === obj.QuotationNo && item.ItemGuid === obj.ItemGuid 
      ))
    );
    let QuotationDetauils:any=[]
    QuotationDetauils=this.SelectedIndentItem
 
    this.SelectedIndentItem = this.SelectedIndentItem.filter((obj: { IndentNo: any; ItemGuid: any, QuotationNo: any }, index: any, self: any[]) =>
      index === self.findIndex((item) => (
        item.ItemGuid === obj.ItemGuid && item.IndentNo === obj.IndentNo
      ))
    );
    this.lstQuotationNo=[];
      this.addItemslist.clear()
      this.SelectedIndentItem.forEach((POItems: any,index:number) => {
        if (POItems.latestQuotationNo == 0 || POItems.latestQuotationNo == null) {
          this.lstQuotationNo?.push({IndentNo : POItems.IndentNo ,QuotationNo : POItems.latestQuotationNo});
          this.addItemslist.push(this.fb.group({
            SNo:index+1,
            IndentNo: POItems.IndentNo,
            ItemName: POItems.ItemName,
            CatalogNo : POItems.CatalogNo,
            ItemGuid: POItems.ItemGuid,
            ManufactureName: '',
            LocationGuid: POItems.LocationGuid,
            DeliveryLocation: POItems.Location,
            POSize: '',
            previousPOSize:'',
            PurchaseOrderUnit: '',
            Narration: '',
            ItemRate: '',
            DiscountPercentage: '',
            TaxPercentage: '',
            UnitPrice: '',
            OrderQuantity: '',
            TotalAmount: '',
            SupplierGuid: '',
            VenderNme: '',
            TaxPerCGST: '',
            TaxPerUGST: '',
            TaxPerSGST: '',
            TaxPerIGST: '',
            QuotationId: '',
            DefaultItemQuantity: '',
            InitialAmount: '',
            QuotationNo: POItems.latestQuotationNo,
            IsSelected: false,
            ReasonQuotationNo : '',
            latestQuotation: POItems.latestQuotationNo,
            VendorItemName : POItems.VendorItemName,
            StockInhandQuantity : POItems.StockInhandQuantity
          }));
        }
        else {
          let data = QuotationDetauils.filter((data1: any) => data1.QuotationNo === POItems.latestQuotationNo && data1.ItemGuid == POItems.ItemGuid && POItems.IndentNo === data1.IndentNo)[0]
          this.lstQuotationNo?.push({IndentNo : data.IndentNo ,QuotationNo : data.latestQuotationNo });
          if(!this.PurchaseOrderGuid){
            this.addItemslist.push(this.fb.group({
              SNo:index+1,
              IndentNo: POItems.IndentNo,
              ItemName: POItems.ItemName,
              CatalogNo : POItems.CatalogNo,
              ItemGuid: POItems.ItemGuid,
              ManufactureName: data.ManufactureName,
              LocationGuid: data.LocationGuid,
              DeliveryLocation: data.Location,
              POSize: data.PackSize,
              previousPOSize:POItems.PackSize,
              PurchaseOrderUnit: data.PurchaseOrderUnit,
              Narration: data.Narration,
              ItemRate: data.QuotationRate,
              DiscountPercentage: data.DiscountPercentage,
              TaxPercentage: data.TaxPerIGST ? data.TaxPerIGST : (data.TaxPerCGST + data.TaxPerSGST),
              UnitPrice: data.UnitPrice,
              OrderQuantity: data.ReqQty,
              TotalAmount: (data.UnitPrice * data.ReqQty),
              SupplierGuid: data.SupplierGuid,
              VenderNme: data.SupplierName,
              TaxPerCGST: data.TaxPerCGST,
              TaxPerUGST: data.TaxPerUTGST,
              TaxPerSGST: data.TaxPerSGST,
              TaxPerIGST: data.TaxPerIGST,
              QuotationId: data.QuotationId,
              DefaultItemQuantity: data.ReqQty,
              InitialAmount: (data.UnitPrice * data.ReqQty),
              QuotationNo: data.latestQuotationNo,
              ReasonQuotationNo : '',
              IsSelected: false,
              latestQuotation: data.latestQuotationNo,
              VendorItemName : data.VendorItemName,
              StockInhandQuantity : data.StockInhandQuantity
            }), { emitEvent: true });
          }
        }
      });
    this.SelectedIndentItem.forEach((e1: any, index: number) => {
      if (index < this.addItemslist.value.length) {
        const e2 = this.addItemslist.value[index];
        if (e1.PackSize !== e2.POSize) {
          this.packSizeArray.push(e2.SNo);
        }
      }
    });
    this.packSizeString = this.packSizeArray.join(', ');
    if(this.packSizeString){
      this.openPackSizeDiffModal()
    }
    // let selectedIndeniitems:any = [];
    // selectedIndeniitems = this.SelectedIndentItem.filter((data: any) => data.latestQuotationNo === data.QuotationNo)

  }
  ItemQuantityCalculation(index: any, ItemGuid?: any) {
    const itemIndex = this.PurchaseOrderItemDetails.findIndex((item: any) => item.ItemGuid === ItemGuid);
    if (itemIndex >= 0) {
      this.SelectedIndentItem = this.PurchaseOrderItemDetails[index];
      let itemquantity = this.purchaseOrderForm.get('lstpurchaseOrderItems')?.value[index].OrderQuantity
      let NetAmount = (this.SelectedIndentItem.UnitPrice * itemquantity)
      const ItemDetails = this.addItemslist.at(index);
      ItemDetails.patchValue({
        TotalAmount: NetAmount,
      }, { emitEvent: true })
    }
    else {
      let itemquantity = this.purchaseOrderForm.get('lstpurchaseOrderItems')?.value[index].OrderQuantity
      let NetAmount = (this.addItemslist.value[index].UnitPrice * itemquantity)
      const ItemDetails = this.addItemslist.at(index);
      ItemDetails.patchValue({
        TotalAmount: NetAmount,
      }, { emitEvent: true })
    }
    this.allcheckbox=true? this.addItemslist.value[index].IsSelected = true : false;
  }

  /**
   * This method is used for Save the purchase order details
   */
  onUrgentChange(value: boolean | null) {
    if (value !== null) {
      this.isChecked = value;
    }
  }
  SavePurchaseOrderPOAgainstPI(): void {
    this.shimmerVisible = true
    if (this.PurchaseOrderGuid == '') {
      this.purchaseOrderForm.value.lstpurchaseOrderItems = this.addItemslist.value
        .filter((control: any) => control.IsSelected === true) // Filter only the selected values
        .map((control: any) => control);
    }
  this.purchaseOrderForm.value.Isurgent 
    this.purchaseOrderService.SavePurchaseOrderPOAgainstPI(this.purchaseOrderForm.value).subscribe(
      (saveitemDetails) => {
        this.shimmerVisible = false;
        this.router.navigateByUrl('/purchase-orders');
      },
      (err) => {
        this.shimmerVisible = false;
      });
  }
  addOtherPaymentTerm() {
    this.purchaseOrderForm.patchValue({
      PaymentTerm: this.purchaseOrderForm.value.paymentsTerms
    }, { emitEvent: true })

  }
  addOtherDeliveryTerm() {
    this.purchaseOrderForm.patchValue({
      DeliveryTerm: this.purchaseOrderForm.value.AddDeliveryTerm
    }, { emitEvent: true })
  }
  OnItemsSelect(item: any, i: any) {
    if (this.PurchaseOrderGuid) {
      this.PurchaseOrderItemDetails.forEach((element: any) => {
        if (element.ItemGuid == item.value.ItemGuid && item.value.IsDeleted == false && item.value.IsSelected == false) {
          const ItemDetails = this.addItemslist.at(i);
          ItemDetails.patchValue({
            IsDeleted: true,
            IsSelected: false,
          });
        }
        if (element.ItemGuid == item.value.ItemGuid && item.value.IsSelected == true && item.value.IsDeleted == true) {
          const ItemDetails = this.addItemslist.at(i);
          ItemDetails.patchValue({
            IsDeleted: false,
            IsSelected: true
          });
        }
      })
    }
    else {
      this.addItemslist.value.forEach((element: any) => {
        if (element.ItemGuid == item.value.ItemGuid && item.value.IsSelected == true) {
          const ItemDetails = this.addItemslist.at(i);
          ItemDetails.get('QuotationNo')?.setValidators([Validators.required])
          ItemDetails.get('QuotationNo')?.updateValueAndValidity();
          ItemDetails.patchValue({
            IsSelected: true
          });
        }
        if (item.value.IsSelected == false && element.ItemGuid == item.value.ItemGuid) {
          const ItemDetails = this.addItemslist.at(i);
          ItemDetails.get('QuotationNo')?.clearValidators()
          ItemDetails.get('QuotationNo')?.updateValueAndValidity();
          ItemDetails.patchValue({
            IsSelected: false,
          });
        }
      })
    }
    this.isChecked = this.addItemslist.value.some((f: any) => f.IsSelected);
    const anyItemSelected = this.addItemslist.value.every((f: any) => f.IsSelected);
    this.allcheckbox = anyItemSelected;
  }
  handleCheckboxChange(event:any){ 
    this.addItemslist.value.forEach((element: any) => {
    if(event.target.checked==true && element.QuotationNo  != 0 ){
      element.IsSelected=true;  
      this.isChecked=true;
      this.allcheckbox=true            
    }
    else {
      element.IsSelected=false;   
      this.isChecked=false;  
      this.allcheckbox=false          
    }
  }
)
}
  GetPurchaseOrderDetails() {
    this.shimmerVisible = true;
    // this.PurchaseViewDetails=this.purchaseOrderDetails
    this.purchaseOrderService.GetPurchaseOrderDetails(this.PurchaseOrderGuid).subscribe(data => {
      this.purchaseOrderDetails = data.purchaseOrderDetails;
      const formattedPrice = parseFloat(this.purchaseOrderDetails.POTotalAmount).toFixed(2);
      const dueAmount =  parseInt(formattedPrice) -this.purchaseOrderDetails.DueAmount  ;
      this.PaymentDetailForm.patchValue({
        TotalAmount: formattedPrice,
        Dueamount: dueAmount
      });
      this.PurchaseOrderItemDetails = data.POItems.filter((obj: { IndentNo: any; ItemGuid: any }, index: any, self: any[]) =>
        index === self.findIndex((item) => (
          item.IndentNo === obj.IndentNo && item.ItemGuid === obj.ItemGuid
        ))
      );
      this.PurchaseViewDetails=this.purchaseOrderDetails
      this.purchaseOrderForm.patchValue({Isurgent : this.PurchaseViewDetails.Isurgent })
      this.QuotationItemlist = data.oItemQuotations
      this.GetSelectedPurchaseOrder()
     
      this.allcheckbox=true;
      this.shimmerVisible = false;
    },
      (err: HttpErrorResponse) => {
        this.shimmerVisible = false;
      })
  }
  GetSelectedPurchaseOrder() {
    this.addItemslist.clear()
    this.purchaseOrderForm.patchValue({
      PaymentTerm: this.purchaseOrderDetails.PaymentTermCondition,
      NFANo: this.purchaseOrderDetails.NFANo,
      TermsandConditions: this.purchaseOrderDetails.TermandCondition,
      DeliveryTerm: this.purchaseOrderDetails.PaymentDeliveryTerm,
      IsEdit: true,
      PurchaseOrderGuid: this.PurchaseOrderGuid,
    }, { emitEvent: true })
    this.PurchaseOrderItemDetails.forEach((element: any,index:number) => {
      this.addItemslist.push(this.fb.group({
        SNo:index+1,
        IndentNo: element.IndentNo,
        ItemName: [element.ItemName ? element.ItemName : '', Validators.required],
        CatalogNo : element.CatalogNo,
        ItemGuid: element.ItemGuid,
        ManufactureName: element.ManufactureName,
        LocationGuid: this.purchaseOrderDetails.LocationGuid,
        POSize: element.PackSize,
        PurchaseOrderUnit: element.MinorUnitName,
        Narration: element.Narration,
        ItemRate: element.Rate,
        DiscountPercentage: element.DiscountPer,
        TaxPercentage: element.IGST ? element.IGST : (element.SGST + element.CGST),
        UnitPrice: element.UnitPrice,
        OrderQuantity: [element.OrderedQty ? element.OrderedQty : '', Validators.required],
        TotalAmount: element.NetAmount,
        SupplierGuid: this.purchaseOrderDetails.SupplierGuid,
        VenderNme: this.purchaseOrderDetails.SupplierName,
        IsSelected: true,
        DeliveryLocation: this.purchaseOrderDetails.LocationName,
        PurchaseOrderId: element.PurchaseOrderId,
        PurchaseOrderGuid: element.PurchaseOrderGuid,
        IsDeleted: element.IsDeleted,
        TaxPerCGST: element.CGST,
        TaxPerUGST: element.UGST,
        TaxPerSGST: element.SGST,
        TaxPerIGST: element.IGST,
        QuotationNo: element.QuotationNo,
        ReasonQuotationNo : element?.ReasonQuotationNo,
        VendorItemName:element?.VendorItemName,
        StockInhandQuantity : element?.StockInhandQuantity
      }, (err: any) => {

      }));
      this.quantity.push(element)
    }, (err: any) => {

    })
    this.FormvalidatinRemove()
    this.FormChanged = false;

  }
  getQuotationByGuid(row: any) {
    this.quotationGuid=row?.QuotationGuid
    this.quotationService.getQuotationsByGuid(this.quotationGuid).subscribe((data:any) => {
      this.quotationDetails = data.getQuotationsResponses
      console.log("quotationDetails",this.quotationDetails)
      this.quotationDetails = data.getQuotationsResponses.filter((value: any, index: any, self: any) => {
        return index === self.findIndex((t: any) => (
          t.ItemGuid === value.ItemGuid
        ));
      })

      if (this.quotationDetails.length > 0) {
        const locationNames = data.getQuotationsResponses[0].LocationName.split(',').filter((value: any, index: any, self: any) => self.indexOf(value) === index);
        const myString = locationNames.join(', ');
        this.locationList = myString
      }
      if ((this.supplierGuid.length > 0 || this.itemGuid.length > 0 || this.fromDate || this.toDate) && !row) {
        if (this.locationGuid.length === 0 && this.quotationsList != null) {
          const centerLocationGuidArray = data.getQuotationsResponses
            .map((response: any) => response.LocationGuids)
            .flatMap((guids: any) => guids.split(','))
            .map((guid: any) => guid.trim().toLowerCase());
          let filteredData = this.defaultData.Result.LstQuotationCenterLocationType.filter(
            (item: { CenterLocationGuid: string }) =>
              centerLocationGuidArray.includes(item.CenterLocationGuid.toLowerCase())
          );
          this.locations = filteredData;
          this.itemOptionsOrders = this.filterItemOptionsOrdersByStatus();
        }
      } else if (row) {
        this.locations = this.locations
        this.itemOptionsOrders = this.filterItemOptionsOrdersByStatus();
      } else {
        this.locations = this.defaultData.Result.LstQuotationCenterLocationType;
      }

      if ((this.supplierGuid.length > 0 || this.locationGuid.length > 0 || this.fromDate || this.toDate) && !row) {
        if (this.itemGuid.length === 0 && this.quotationsList != null) {
          this.allItemsList = this.quotationDetails.map((obj: any) => this.itemsList.filter((f: { ItemGuid: any }) => f.ItemGuid === obj.ItemGuid)).flat()
            .filter((value: any, index: any, self: any) => index === self.findIndex((t: any) => t.ItemGuid === value.ItemGuid));
        }
        this.allItems = this.allItemsList
      } else if (row) {
        this.quotationDetails = data.getQuotationsResponses
        this.quotationDetails = this.quotationDetails.filter((value: any, index: any, self: any) => {
          const firstIndex = self.findIndex((item: any) => item.ItemGuid === value.ItemGuid || item.ItemName === value.ItemName);
          return index === firstIndex;
        });
      } else {
        this.allItems = this.itemsList.filter((value: any, index: any, self: any) => {
          return index === self.findIndex((t: any) => (
            t.ItemGuid === value.ItemGuid || t.ItemName === value.ItemName
          ));
        })
      }

    }, (err: HttpErrorResponse) => {
      this.globalService.stopSpinner();
      this.noQuotationFound = true
    })
  }

  FormReset() {
    this.purchaseOrderForm.reset()
    this.addItemslist.clear();
    this.FormChanged = false;
    this.allcheckbox= this.PurchaseOrderGuid? true : false;
    this.addItemslist.value.forEach((item: any) => {
    item.IsSelected = false;
  });
    // this.ListOfSupplier = []
    // this.purchaseOrderForm.patchValue({
    //   UserGuid: this.authservice.LoggedInUser.UserGuid
    // })
    if (this.PurchaseOrderGuid) {
      this.GetSelectedPurchaseOrder();
    }
  }

  FormvalidatinRemove() {
    let sdasd: any = this.purchaseOrderForm.get('SuppliersName')
    let sdasd1: any = this.purchaseOrderForm.get('PendingPI')
    sdasd.clearValidators();
    sdasd.updateValueAndValidity();
    sdasd1.clearValidators();
    sdasd1.updateValueAndValidity();
    this.isChecked = this.addItemslist.value.some((f: any) => f.IsSelected);
  }
  get c() {
    return this.purchaseOrderForm.controls;
  }
  get PendingPI() {
    return this.c?.PendingPI.value || '';
  }
  AddReasonForQuotationNo(event : any , index : any){
    let count =0;
    if(count == 0){
      for (let i = 0; i < this.lstQuotationNo?.length; i++) {
        const formGroup = this.addItemslist as FormArray;
        let reasonQuotationNoControl;
        if (formGroup && formGroup.length > index) {
          reasonQuotationNoControl = formGroup.at(i).get('QuotationNo');
  
          if (reasonQuotationNoControl) {
            const currentValue = reasonQuotationNoControl?.value?.QuotationNo;
  
            if (currentValue) {
              reasonQuotationNoControl.patchValue(currentValue);
            }
          }
        }
        if (reasonQuotationNoControl) {
          if (reasonQuotationNoControl?.value == this.lstQuotationNo[i]?.QuotationNo) {
            this.IsReasonQuotationNo = false;
          } else {
            this.IsReasonQuotationNo = true;
  
            if (this.addItemslist.value[i].ReasonQuotationNo != null && this.addItemslist.value[i].ReasonQuotationNo != "") {
              this.IsReasonQuotationNo = false;
            } else {
              this.IsReasonQuotationNo = true;
              count++;
            }
          }
        }
      }
    }
    this.allcheckbox==true? this.addItemslist.value[index].IsSelected = true : false;
  }
  ChangeDiscount(item: any, index: any) {
    let TotalGstPer = this.addItemslist.value[index].TaxPerIGST > 0 ? this.addItemslist.value[index].TaxPerIGST : (this.addItemslist.value[index].TaxPerCGST + this.addItemslist.value[index].TaxPerSGST)
    const discount = (item.value.ItemRate - (item.value.ItemRate * Number(this.addItemslist.value[index].DiscountPercentage)) / 100);
    const taxAmount = (discount) * (TotalGstPer / 100);
    const totalPrice = discount + taxAmount;
    const ItemDetails = this.addItemslist.at(index);
    ItemDetails.patchValue({
      UnitPrice: totalPrice,
      TotalAmount: totalPrice * this.addItemslist.value[index].OrderQuantity
    })
    if (this.PurchaseOrderGuid) {
      this.PurchaseOrderItemDetails[index].UnitPrice = totalPrice
    }
    this.allcheckbox=true? this.addItemslist.value[index].IsSelected = true : false;
  }
  removeSupplier(event: any) {
    this.SupplierGuid = this.SupplierGuid.filter((indent: any) => indent !== event.value.SupplierGuid)
    this.GetPOAgainstPIPostDefaults()
    for (let i = this.selectedPendingPI?.length - 1; i >= 0; i--) {
      if (this.selectedPendingPI[i].SupplierGuid == event.value.SupplierGuid) {
        let data = this.selectedPendingPI[i].IndentNo;
        const selectedItems = this.purchaseOrderForm.get('PendingPI')?.value;
        const indexToRemove = selectedItems.findIndex((item: any) => item.IndentNo === data);
        if (indexToRemove !== -1) {
          selectedItems.splice(indexToRemove, 1);
        }
        this.purchaseOrderForm.get('PendingPI')?.setValue(selectedItems);
      }
    }
    if (this.addItemslist.length > 0) {
      for (let i = this.addItemslist.length - 1; i >= 0; i--) {
        const element = this.addItemslist.at(i);
        if (element.value.SupplierGuid === event.value.SupplierGuid) {
          this.addItemslist.removeAt(i);
        }
      }
    }
  }
  /**
   * this event is used for clear the all supplier
   */
  onSelectClose() {
    this.addItemslist.clear()
    this.purchaseOrderForm.get('PendingPI')?.setValue('')
    this.SupplierGuid = []
    this.GetPOAgainstPIPostDefaults()
  }
  OnSelectQuotation(event: any, index: any) {
    this.packSizeArray=[]
    this.packSizeString=''
    const currentDate: moment.Moment = moment();
    const entryDateTo: moment.Moment = moment(event?.EntryDateTo, 'MM/DD/YYYY HH:mm:ss');
    this.quotationExpired=false
   if (entryDateTo.isBefore(currentDate)) {
    this.quotationExpired=true
    this.openExpiryQuotationModal();
   }
   let ItemsData:any=this.addItemslist.at(index)
   if(event.PackSize != ItemsData.value.previousPOSize){
    this.packSizeArray.push(index+1)
    this.packSizeString = this.packSizeArray.join(', ');
    this.openPackSizeDiffModal()
   }
    const formGroup = this.addItemslist as FormArray;
    if (formGroup && formGroup.length > index) {
      const reasonQuotationNoControl = formGroup.at(index).get('ReasonQuotationNo');

      if (reasonQuotationNoControl) {
        const currentValue = reasonQuotationNoControl.value;

        if (currentValue) {
          reasonQuotationNoControl.patchValue(null);
        }
      }
    }
    let count =0;
    for (let i = 0; i < this.lstQuotationNo?.length; i++) {
      if(count == 0){
        const formGroup = this.addItemslist as FormArray;
        let reasonQuotationNoControl;
        if (formGroup && formGroup.length > index) {
          reasonQuotationNoControl = formGroup.at(i).get('QuotationNo');
  
          if (reasonQuotationNoControl) {
            const currentValue = reasonQuotationNoControl?.value?.QuotationNo;
  
            if (currentValue) {
              reasonQuotationNoControl.patchValue(currentValue);
            }
          }
        }
        if (reasonQuotationNoControl) {
          if (reasonQuotationNoControl?.value == this.lstQuotationNo[i]?.QuotationNo || reasonQuotationNoControl?.value == null) {
            this.IsReasonQuotationNo = false;
          } else {
            this.IsReasonQuotationNo = true;
  
            if (this.addItemslist.value[i].ReasonQuotationNo != null && this.addItemslist.value[i].ReasonQuotationNo != "") {
              this.IsReasonQuotationNo = false;
            } else {
              this.IsReasonQuotationNo = true;
              count++;
            }
          }
        }
      }
    }

    if (event != undefined) {
      if (!this.PurchaseOrderGuid) {
        let data: any = []
        data = this.LstIndentItems.filter((item: any) => item.QuotationNo == event.QuotationNo && item.ItemGuid == event.ItemGuid && item.IndentNo === event.IndentNo)
        let array = this.addItemslist.at(index)
        data.forEach((POItems: any) => {
          array.patchValue({
            ManufactureName: POItems.ManufactureName,
            // LocationGuid: POItems.LocationGuid,
            // DeliveryLocation: POItems.Location,
            POSize: POItems.PackSize,
            PurchaseOrderUnit: POItems.PurchaseOrderUnit,
            Narration: POItems.Narration,
            ItemRate: POItems.QuotationRate,
            DiscountPercentage: POItems.DiscountPercentage,
            TaxPercentage: POItems.TaxPerIGST ? POItems.TaxPerIGST : (POItems.TaxPerCGST + POItems.TaxPerSGST),
            UnitPrice: POItems.UnitPrice,
            OrderQuantity: POItems.ReqQty,
            TotalAmount: (POItems.UnitPrice * POItems.ReqQty),
            SupplierGuid: POItems.SupplierGuid,
            VenderNme: POItems.SupplierName,
            TaxPerCGST: POItems.TaxPerCGST,
            TaxPerUGST: POItems.TaxPerUTGST,
            TaxPerSGST: POItems.TaxPerSGST,
            TaxPerIGST: POItems.TaxPerIGST,
            QuotationId: POItems.QuotationId,
            DefaultItemQuantity: POItems.ReqQty,
            InitialAmount: (POItems.UnitPrice * POItems.ReqQty),
            QuotationNo: POItems.QuotationNo,
            VendorItemName:POItems.VendorItemName,
            StockInhandQuantity : POItems.StockInhandQuantity
          });
        });
      } else {
        let ItemQuotations = this.QuotationsForItem.filter((ele: any) => ele.QuotationNo == event.QuotationNo && ele.ItemGuid == event.ItemGuid)
        let array = this.addItemslist.at(index)
        ItemQuotations.forEach((POItems: any) => {
          array.patchValue({
            ManufactureName: POItems.quotationManufactureName,
            // LocationGuid: POItems.LocationGuid,
            // DeliveryLocation: POItems.Location,
            POSize: POItems.PackSize,
            PurchaseOrderUnit: POItems.MinorUnitName,
            Narration: POItems.Narration,
            ItemRate: POItems.QuotaionRate,
            DiscountPercentage: POItems.DiscountPer,
            TaxPercentage: POItems.IGSTPer ? POItems.IGSTPer : (POItems.CGSTPer + POItems.SGSTPer),
            UnitPrice: POItems.ItemUnitPrice,
            OrderQuantity: POItems.OrderedQty,
            TotalAmount: (POItems.ItemUnitPrice * POItems.OrderedQty),
            SupplierGuid: POItems.SupplierGuid,
            VenderNme: POItems.QuotationSupplier,
            TaxPerCGST: POItems.CGSTPer,
            TaxPerUGST: POItems.TaxPerUTGST,
            TaxPerSGST: POItems.SGSTPer,
            TaxPerIGST: POItems.IGSTPer,
            QuotationId: POItems.QuotationId,
            DefaultItemQuantity: POItems.ReqQty,
            InitialAmount: (POItems.UnitPrice * POItems.ReqQty),
            QuotationNo: POItems.QuotationNo,
            VendorItemName:POItems.VendorItemName,
            StockInhandQuantity : POItems.StockInhandQuantity
          });
        });
      }
      
    }
    else {
      let array = this.addItemslist.at(index)
      array.patchValue({
        ManufactureName: '',
        // LocationGuid: POItems.LocationGuid,
        // DeliveryLocation: POItems.Location,
        POSize: '',
        previousPOSize:'',
        PurchaseOrderUnit: '',
        Narration: '',
        ItemRate: '',
        DiscountPercentage: '',
        TaxPercentage: '',
        UnitPrice: '',
        // OrderQuantity: '',
        TotalAmount: '',
        TaxPerCGST: '',
        TaxPerUGST: '',
        TaxPerSGST: '',
        TaxPerIGST: '',
        QuotationId: '',
        DefaultItemQuantity: '',
        InitialAmount: '',
        QuotationNo: null,
        SupplierGuid: null,
        VenderNme: null,
      })
      this.FormChanged=false
    }
    if( this.allcheckbox==true && (event?.QuotationNo != undefined && event?.QuotationNo != null )) {
      this.addItemslist.value[index].IsSelected = true
    }else{
      this.addItemslist.value[index].IsSelected = false;
      this.allcheckbox=true
    } 
  }
  ChangePOStatus(PurchaseOrderGuid: any, ApprovalType: any) { 
    this.body.PurchaseOrderGuid = PurchaseOrderGuid;
    this.body.ApprovalType = ApprovalType;
    this.body.UserGuid = this.authservice.LoggedInUser.UserGuid;
    this.body.ApprovalPhoneNumber = this.authservice.LoggedInUser.PhoneNumber;
    this.body.ApprovalEmail = this.authservice.LoggedInUser.Email;
    this.body.ApprovalName = this.authservice.LoggedInUser.FirstName;
    this.body.CheckedReason = ApprovalType=="Checker" ? this.reason : '',
    this.body.ApproveReason = ApprovalType !="Checker" ? this.reason : '',
    this.body.PoDate = this.purchaseOrderDetails.POCreatedDate || '',
    this.body.VendorId = this.purchaseOrderDetails.VendorId || '',
    this.purchaseOrderService.UpdatePurchaseOrderStatus(this.body).subscribe(data => {
      this.router.navigate( ['/purchase-orders']);
      this.reason=''
      this.GetAllPurchaseOrderDetails();
    }, (err: HttpErrorResponse) => {
    });
  }
  GetAllPurchaseOrderDetails() {
    throw new Error('Method not implemented.');
  }
  OnSelectPO(event: any) {
    const status = event.Status;
    const indentNo = event.IndentNo;
    const urlParams = [event.PurchaseOrderGuid, status === 'Approved' ? status : indentNo ? '' : undefined];
    this.router.navigate(indentNo ? ['/purchase-orders/po-against-pi', ...urlParams] : ['/purchase-orders/new-purchase-order', ...urlParams]);
    // if(event.Status=='Approved') {
    //   this.router.navigate(['/purchase-orders/po-against-pi', event.PurchaseOrderGuid, event.Status]);
    // }
    // else if (event.IndentNo) {
    //   this.router.navigate(['/purchase-orders/po-against-pi', event.PurchaseOrderGuid, '']);
    // }
    // else {
    //   this.router.navigate(['/purchase-orders/new-purchase-order', event.PurchaseOrderGuid]);
    // }

  }
   DownloadPdf(print: any) {
    let totalPrice = 0
    let html = "";
    html = this.UnparsedHtml;
    this.purchaseOrderService.GetPurchaseOrderDetails(this.PurchaseOrderGuid).subscribe(data => {
      this.purchaseOrderDetails = data.purchaseOrderDetails || '';
      this.PurchaseOrderItemDetails = data.POItems.filter((obj: { IndentNo: any;ItemGuid:any }, index: any, self: any[]) =>
      index === self.findIndex((item) => (
        item.IndentNo === obj.IndentNo && item.ItemGuid === obj.ItemGuid
      ))
    ) || ''
      let myInt = Math.round(totalPrice);
      const numWords = require('num-words')
      const amountInWords = numWords(myInt)
      const numbWords = require('num-words')
      const numberInWords = numbWords(totalPrice)
      const currentDate = new Date();
      const TodayformattedDate = this.datepipe.transform(currentDate, 'dd-MMM-yyyy hh:mm a');
      const replacements: any = {
        '%%PurchaseOrderNo%%': this.purchaseOrderDetails.PurchaseOrderNo || '',
        '%%POCreatedDate%%': this.purchaseOrderDetails.POCreatedDate || '',
        '%%SupplierName%%': this.purchaseOrderDetails.SupplierName || '',
        '%%Address%%': this.purchaseOrderDetails.Address || '',
        '%%VendorEmailId%%': this.purchaseOrderDetails.VendorEmailId || '',
        '%%GSTIN%%': this.purchaseOrderDetails.GSTIN || '',
        '%%PrimaryContactPersonMobileNo%%': this.purchaseOrderDetails.PrimaryContactPersonMobileNo || '',
        '%%SecondaryContactPersonMobileNo%%': this.purchaseOrderDetails.SecondaryContactPersonMobileNo || '',
        '%%PrimaryContactPerson%%': this.purchaseOrderDetails.PrimaryContactPerson || '',
        '%%ContactPersonNo%%': this.purchaseOrderDetails.OrderedContactPersonNo || '',
        '%%StoreLocationAddress%%': this.purchaseOrderDetails.StoreLocationAddress || '',
        '%%GSTNNO%%': this.purchaseOrderDetails.GSTNNO || '',
        '%%CenterName%%': this.purchaseOrderDetails.CenterLocation || '',
        '%%ShippingCenterName%%': this.purchaseOrderDetails.ShipLocation?this.purchaseOrderDetails.ShipLocation:this.purchaseOrderDetails.CenterLocation || '',
        '%%ShipStoreLocationAddress%%': this.purchaseOrderDetails.ShipStoreLocationAddress?this.purchaseOrderDetails.ShipStoreLocationAddress:this.purchaseOrderDetails.StoreLocationAddress || '',
        '%%BillStoreLocationAddress%%': this.purchaseOrderDetails.StoreLocationAddress || '',
        '%%BillingContactPerson%%': this.purchaseOrderDetails.OrderedContactPerson || '',
        '%%BillingMobileNo%%': this.purchaseOrderDetails.OrderedContactPersonNo || '',
        '%%BillingPersonEmail%%': this.purchaseOrderDetails.OrderedContactPersonEmail || '',
        '%%shipingContactPerson%%': this.purchaseOrderDetails.ShipContactPerson?this.purchaseOrderDetails.ShipContactPerson:this.purchaseOrderDetails.OrderedContactPerson || '',
        '%%ShipingMobileNo%%': this.purchaseOrderDetails.ShipContactPersonNo?this.purchaseOrderDetails.ShipContactPersonNo:this.purchaseOrderDetails.OrderedContactPersonNo || '',
        '%%ShipingPersonEmail%%': this.purchaseOrderDetails.ShipContactPersonEmail?this.purchaseOrderDetails.ShipContactPersonEmail:this.purchaseOrderDetails.OrderedContactPersonEmail || '',
        '%%CreatedBy%%': this.purchaseOrderDetails.CreatedBy || '',
        '%%CheckedByName%%':this.status=="Maker"?"": this.purchaseOrderDetails.CheckedByName || '',
        '%%AppprovedByName%%': this.purchaseOrderDetails.AppprovedByName || '',
        '%%RecallByName%%': this.purchaseOrderDetails.RecallByName==null?"":this.purchaseOrderDetails.RecallByName,
        '%%CancelledBy%%': this.purchaseOrderDetails.CancelledBy==null?"":this.purchaseOrderDetails.CancelledBy,
        '%%OrderedBy%%':this.purchaseOrderDetails.CenterLocation ||'',
        '%%SupplierState%%':this.purchaseOrderDetails.SupplierState || '',
        '%%ShipLocationGST%%':this.purchaseOrderDetails.ShipGSTNNO?this.purchaseOrderDetails.ShipGSTNNO:this.purchaseOrderDetails.GSTNNO || '',
        '%%BillLocationGST%%':this.purchaseOrderDetails.GSTNNO || '',
       '%%PurchaseOrderDownloadDate%%':TodayformattedDate,
       '%%TotalPrice%%':this.purchaseOrderDetails.POTotalAmount.toString().match(/^\d+(?:\.\d{0,2})?/),
       '%%PaymentTerm%%':this.purchaseOrderDetails.PaymentTermCondition,
       '%%Deliveryterm%%':this.purchaseOrderDetails.PaymentDeliveryTerm,

      };
      for (const key in replacements) {
        html = html.replace(key, replacements[key]);
      }
      let dochtml: any = '';
      dochtml = new DOMParser().parseFromString(html, 'text/html');
      let PurchaseOrderItemDetails: any = dochtml.querySelector('#PurchaseOrderItemDetails');
      PurchaseOrderItemDetails.innerHTML = '';
      for (let i = 0; i < this.PurchaseOrderItemDetails.length; i++) {
        if (this.PurchaseOrderItemDetails[i].OrderedQty === "0.00") {
          continue;
      }
        const array = (this.PurchaseOrderItemDetails[i].CGST + this.PurchaseOrderItemDetails[i].SGST + this.PurchaseOrderItemDetails[i].UGST)
        let updatedTemplate: any = '';
        updatedTemplate = this.UnparsedHtml
          .replace('%%S.NO%%', i+1)
          .replace('%%ItemName%%', this.PurchaseOrderItemDetails[i].ItemName || '')
          .replace('%%CatalogNo%%',this.PurchaseOrderItemDetails[i].CatalogNo || '')
          .replace('%%ManufactureName%%',this.PurchaseOrderItemDetails[i].ManufactureName || '')
          .replace('%%MinorUnitName%%', this.PurchaseOrderItemDetails[i].MinorUnitName || '')
          .replace('%%PackSize%%', this.PurchaseOrderItemDetails[i].PackSize || '')
          .replace('%%OrderedQty%%', this.PurchaseOrderItemDetails[i].OrderedQty || '')
          .replace('%%UnitPrice%%', this.PurchaseOrderItemDetails[i].UnitPrice || '')
          .replace('%%DiscountPer%%', this.PurchaseOrderItemDetails[i].DiscountPer || '')
          .replace('%%TaxAmount%%', this.PurchaseOrderItemDetails[i].TaxAmount || '')
          .replace('%%NetAmount%%', this.PurchaseOrderItemDetails[i].NetAmount || '')
          .replace('%%Address%%', this.PurchaseOrderItemDetails[i].Address || '')
          .replace('%%CGST+SGST+UGST%%',
          (this.PurchaseOrderItemDetails[i].CGST+this.PurchaseOrderItemDetails[i].SGST) == 0 && this.PurchaseOrderItemDetails[i].IGST == 0 ? this.PurchaseOrderItemDetails[i].IGST:
(this.PurchaseOrderItemDetails[i].IGST?this.PurchaseOrderItemDetails[i].IGST:(this.PurchaseOrderItemDetails[i].CGST+this.PurchaseOrderItemDetails[i].SGST)))
        .replace('%%TaxAmount%%', this.PurchaseOrderItemDetails[i].TaxAmount ||'')
        .replace('%%BuyPrice%%', (this.PurchaseOrderItemDetails[i].Rate )  ||'')
        let jobElement: any = '';
        jobElement = new DOMParser().parseFromString(updatedTemplate, 'text/html').querySelector('#PurchaseOrderItemDetails');
        PurchaseOrderItemDetails.appendChild(jobElement);
      }
      let dateParts = this.purchaseOrderDetails.POCreatedDate.split('-'); 
      let formattedDate = dateParts[0] + dateParts[1] + dateParts[2];
      html = dochtml.documentElement.outerHTML
      const options = {
        margin: 0.2,
        filename: `POReport_${this.purchaseOrderDetails.PurchaseOrderNo+"_"+this.purchaseOrderDetails.SupplierCode+"_"+formattedDate}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 1 },
        jsPDF: { unit: 'in', format: 'A3', orientation: 'portrait' }
      };
      const element = html;
      if (print == "print") {
        html2pdf().from(element).set(options).outputPdf('datauristring').then((pdfAsString: any) => {
          // Open the PDF in a new window for printing 
          const printWindow: any = window.open();
          printWindow.document.write(html);
          printWindow.document.close();
          printWindow.focus();
          // Print the PDF after a short delay 
          setTimeout(() => {
            printWindow.print();
          }, 250);
        });
      } else {
        html2pdf().from(element).set(options).save()
      }
    })
    // this.invoiceGuid='';
    // this.getGRNStatus();
  }
  DeletePurchaseOrder() {
    this.UserGuid=this.authservice.LoggedInUser.UserGuid
    this.purchaseOrderService.DeletePurchaseOrderDetails(this.purchaseOrderGuid,this.UserGuid).subscribe(data => {
      this.router.navigate(['/purchase-orders']);
      this.GetAllPurchaseOrderDetails()
    },
      (err: HttpErrorResponse) => {
      })

  }
  PurchaseOrderDetailas(row: any) {
    this.FormChanged=false
    this.PurchaseOrderName = row.SupplierName
    this.purchaseOrderGuid = row.PurchaseOrderGuid;
    this.purchaseOrderNo = row.PurchaseOrderNo
    this.ShippingLocation=row.ShippingLocation;
    this.location=row.StoreName
    this.centername=row.CenterLocation;
    this.locationGuid=row.LocationGuid
  }
  UpdateShippingLocation() {
    this.purchaseOrderService.UpdateShipiingLocation(this.purchaseOrderGuid,this.locationGuid).subscribe(data => {
    this.router.navigate(['/purchase-orders']);
    this.GetAllPurchaseOrderDetails()
    },
      (err: HttpErrorResponse) => {
      })
  }
  Changelocation(event:any){
    if(!event){
      this.locationGuid=''
    }
    else{
      this.locationGuid=event.LocationGuid
    }
    
  }
  confirmRecall() {
    this.body.Reason = this.recallReason;
    this.ChangePOStatus(this.PurchaseOrderGuid1 , 'Recall');
  }
  getPurchaseOrderGuid(PurchaseOrderGuid:any){
    this.PurchaseOrderGuid1 = PurchaseOrderGuid
    this.FormChanged=false
  }
  deleteAndRedirect(purchaseOrderDetails: any) {
    this.router.navigate(['/purchase-orders']);
  }
  ISUrgentPO(event:any){
  this.FormChanged=true
  this.isUrgent=true  
  if(event.target.checked==true)
  {
   this.Isurgent=true
   this.purchaseOrderForm.value.Isurgent=true
  }
  else{
   this.Isurgent=false
   this.purchaseOrderForm.value.Isurgent=false

  }
}
changestatus(purcahse:any,Status:any){ 
  // this.PurchaseViewDetails=purcahse.PurchaseOrderGuid
  this.FormChanged=false
  this.status=Status
  
}
UpdateStatus() {
  this.ChangePOStatus(this.PurchaseOrderGuid,this.status);
}
resetfrom(){
  this.PaymentDetailForm.reset();
      this.fileUrl="";
      this.PaymentDetailForm.patchValue({imageUrl : this.fileUrl,
        BankName : '',
        PaidAmount : "",
        Remarks : "",
        Modeofpayment : "",
        TransectionDate : null,
        TransectionID : null,
        InvoiceNumber:null
      })
  this.PaymentDetailForm.get('Modeofpayment').setValue('');
}
 /**
   * this method used to add invoice documents
   * @param $event
   */
 markAsTouched(controlName: string) {
  this.PaymentDetailForm.get(controlName)?.markAsTouched();
}
RemoveImage(){
  this.fileUrl = "";
  console.log("ahaha")
  const editableDiv = document.getElementById("editableDiv");
  if (editableDiv) {
      editableDiv.innerHTML = ""; // or innerHTML = ""
      editableDiv.style.color = "#adb7c1";
      editableDiv.setAttribute("contenteditable", "true");
      editableDiv.classList.add('PasteContent')
  }
  this.PaymentDetailForm?.patchValue({imageUrl : this.fileUrl})
}
pasteImage(event: any) {
  console.log(event)
  const pastedImage = event.clipboardData.files[0];
  this.fileToUpload = pastedImage;
  const formData: FormData = new FormData();
  var fileName = this.fileToUpload?.name;
  fileName = fileName.substring(0, fileName.lastIndexOf('.'));
  formData.append('File', this.fileToUpload, this.fileToUpload?.name);
  formData.append('FileName', ("").concat(this.fileToUpload.name));
  this.purchaseOrderService.Uploadfiles(formData).subscribe((data: any) => {
    this.fileUrl = data?.result;
    const editableDiv = document.getElementById("editableDiv");
    if (editableDiv) {
      editableDiv.innerText = "file Uploaded"; // or innerHTML = ""
        editableDiv.classList.remove('PasteContent')
      editableDiv.style.color = "#1bbd09";
      editableDiv.setAttribute("contenteditable", "false");
    }
    this.PaymentDetailForm.patchValue({ imageUrl: data?.result?.toString() });
  },
  
    (err: any) => {
    });
}

UplodeInvoice(event: any) {
  this.fileToUpload = event.srcElement.files[0];
  const formData: FormData = new FormData();
  var fileName = this.fileToUpload.name;
  fileName = fileName.substring(0, fileName.lastIndexOf('.'));
  formData.append('File', this.fileToUpload, this.fileToUpload.name);
  formData.append('FileName', ("").concat(this.fileToUpload.name));
  this.purchaseOrderService.Uploadfiles(formData).subscribe((data: any) => {
    this.fileUrl = data.result;
    const editableDiv = document.getElementById("editableDiv");
    if (editableDiv) {
      editableDiv.classList.remove('PasteContent')
        editableDiv.innerText = "file Uploaded"; // or innerHTML = ""
        editableDiv.style.color = "#1bbd09";
        editableDiv.setAttribute("contenteditable", "false");
    }
    this.PaymentDetailForm.patchValue({imageUrl : this.fileUrl})
  },
    (err: any) => {
    });
}

SavePayment(): void {
  this.shimmerVisible = true;
  const today=new Date()
  let input={
    purchaseOrderGuid: this.purchaseOrderDetails.PurchaseOrderGuid,
    PurchaseOrderNo : this.purchaseOrderDetails.PurchaseOrderNo,
    bankname: this.PaymentDetailForm.value.BankName,
    transectionid: this.PaymentDetailForm.value.TransectionID,
    InvoiceNumber:this.PaymentDetailForm.value.InvoiceNumber,
    transectiondate:moment(this.PaymentDetailForm.TransectionDate),
    modeofpayment: this.PaymentDetailForm?.value?.Modeofpayment,
    remarks: this.PaymentDetailForm?.value?.Remarks,
    totalAmount: parseInt(this.PaymentDetailForm?.value?.TotalAmount),
    paidAmount: parseInt(this.PaymentDetailForm.value.PaidAmount),
    status: "",
    imageUrl: this.PaymentDetailForm.value.imageUrl,
    poNumber:this.purchaseOrderDetails.PurchaseOrderNo,
    CreatedBy :  this.authservice.LoggedInUser.UserGuid,
    UpdatedBy :  this.authservice.LoggedInUser.UserGuid,
  }
  this.purchaseOrderService.SavePaymentHistory(input).subscribe(
    (saveitemDetails) => {
      this.shimmerVisible = false;
      this.SendVerificationEmail()
      this.resetfrom()
      this.router.navigate(['/purchase-orders/po-payhistory']);
    },
    (err) => {
      this.shimmerVisible = false;
    });
}
paidamount(event: any): void {
  const paidAmount = parseFloat(event.target.value);
  const totalAmount = this.PaymentDetailForm.value.Dueamount;
  if (isNaN(paidAmount)) {
    this.isvalid = false; 
  } else if (paidAmount > totalAmount) {
    this.isvalid = true;   
  } else {
    this.isvalid = false;  
  }
}
restrictCharectors(event: any) {
  const allowedRegex = /[0-9]/g;
  if (!event.key.match(allowedRegex)) {
    event.preventDefault();
  }
}  
clearReason(){
  this.recallReason=''
  }
  SendVerificationEmail(): void {
    const today = new Date();
    const year = today.getFullYear();
    const dueamount = parseInt(this.PaymentDetailForm?.value?.Dueamount) - parseInt(this.PaymentDetailForm.value.PaidAmount);
  const totalamount = parseInt(this.PaymentDetailForm?.value?.TotalAmount);
  const PaidAmount = totalamount - dueamount;

  let percentagePaid = (PaidAmount / totalamount) * 100;
  percentagePaid = parseInt(percentagePaid.toString(), 10);
  console.log("percentagePaid",percentagePaid)
    let status=""
    if(percentagePaid==100){
      status="FullyPaid"
    }
    if(percentagePaid>=75 && percentagePaid<=99){
      status="Mostly Paid"
    }
    if(percentagePaid>=50 && percentagePaid<75){
      status="Partially Paid"
    }
    if(percentagePaid<50){
      status="Payment Due"
    }
    const formattedDate = `${this.PaymentDetailForm.value.TransectionDate.day}/${this.PaymentDetailForm.value.TransectionDate.month}/${this.PaymentDetailForm.value.TransectionDate.year}`;
    let body = {
      to: this.purchaseOrderDetails.VendorEmailId,
      Body: "",
      subject: "PaymentVerification",
      lstReplacebleVariables: [
        {
          user: this.purchaseOrderDetails.SupplierName,
          year: year,
          paymentType: this.PaymentDetailForm?.value?.Modeofpayment,
          bankName: this.PaymentDetailForm.value.BankName,
          totalAmount: this.PaymentDetailForm?.value?.TotalAmount,
          paidAmount: this.previousPaidAmount,
          dueAmount: parseInt(this.PaymentDetailForm?.value?.Dueamount) - parseInt(this.PaymentDetailForm.value.PaidAmount),
          transactionId: this.PaymentDetailForm.value.TransectionID,
          orderId: this.PurchaseOrderNumber,
          currentliPaidAmount: this.PaymentDetailForm.value.PaidAmount,
          PaymentDate: formattedDate,
          status:status,
          InvoiceNo:this.PaymentDetailForm.value.InvoiceNumber
        },
      ],
    };
    this.authservice.sendEmail(body).subscribe((res: any) => {});
  }
}

