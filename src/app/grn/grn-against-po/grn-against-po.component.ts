import { Component, ElementRef, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbCalendar, NgbDateParserFormatter, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ColumnMode, DatatableComponent } from '@swimlane/ngx-datatable';
import { Subject, debounceTime, distinctUntilChanged, throttleTime } from 'rxjs';
import { GrnService } from 'src/app/core/Services/grn.service';
import { PurchaseOrderService } from 'src/app/core/Services/purchase-order.service';
import * as _ from 'lodash';
import { CustomDateParserFormatter } from '../grn-status/grn-status.component';
import { AuthenticationService } from 'src/app/core/Services/authentication.service';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { UserManagementService } from 'src/app/core/Services/user-management.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-grn-against-po',
  templateUrl: './grn-against-po.component.html',
  styleUrls: ['./grn-against-po.component.scss'],
  providers: [
    { provide: NgbDateParserFormatter, useClass: CustomDateParserFormatter },
  ],
})
export class GrnAgainstPoComponent implements OnInit {
  @ViewChild(DatatableComponent) table: DatatableComponent;
  shimmerVisible:boolean=false;
  EditshimmerVisible:boolean=false;
  rows: any[] = [];
  temp: any[] = [];
  loadingIndicator = true;
  ColumnMode = ColumnMode;
  InvoiceDetailForm: FormGroup = {} as any;
  InvoiceGuid: any = '00000000-0000-0000-0000-000000000000';
  Subject: any = 'This Aproved BY PO';
  CenterLocacityList: any = [];
  PoNumberList: any = [];
  SupplierDetails: any = [];
  uniqueList: any = [];
  ApprovedDate: string;
  ListGRNItems: FormArray = {} as any;
  ListInvoiceDocuments: FormArray = {} as any;
  ItemRate: any;
  index: any = 0;
  InvoiceDocument: any;
  fileToUpload: any;
  FormChanged: boolean;
  selectedVender: any;
  FileName: any;
  File: string;
  FilePath: any;
  OriginalFileName: any;
  FileDate: any;
  NewFileName: string = "GRN Invoice";
  Isdisable: boolean = true;
  newDate: any;
  ReleasedCount: any;
  GRNdetails: any = [];
  Date: any = '2023-05-03';
  Itemsdetails: any = [];
  removeItemsList: any = [];
  removedItems: any = [];
  FinalRate: any = 0;
  stockdate: any;
  Isprintbarcode: boolean = false;
  UserGuid: any;
  IsDocumentShow: boolean = true;
  VenderDetails: any = [];
  poNumber: any;
  Document: any;
  @ViewChild('fileInput') fileInput!: ElementRef;
  ShowPdfFile: any;
  isFileUplodad: boolean = false
  ISinvoice: any;
  keyword:any='';
  grnstsatusList: any = [];
  rowCount: any = 150;
  pageNumber: any = 1;
  SpinnerCheck:boolean=false;
  modelChanged = new Subject<string>();
  Invoicevalid: boolean=false;
  NetTotalAmount: any;
  locationGuid: any;
  expireDate: string;
  dropdownSettings: IDropdownSettings = {};
  totalReleasedCount: number;
  AllItems: any=[];
  userList: any=[];
  center:string=''
  originalFormValues: any; 
  GrnStatus: string | null;
  modifiedFields: any=[];
  filterInvoiceDocuments: FormArray<any>;
  constructor(
    private fb: FormBuilder,
    private grnService: GrnService,
    private router: Router,
    private purchaseOrderService: PurchaseOrderService,
    private modalService: NgbModal,
    public route: ActivatedRoute,
    private calendar: NgbCalendar,
    private authservice: AuthenticationService,
    private userManagementService: UserManagementService,
  ) {
    this.fetch((data: any) => {
      this.temp = data;
      this.rows = data;
    });
    this.stockdate = calendar.getToday();
    this.modelChanged
    .pipe(debounceTime(2000))
    .subscribe(model => {
      this.keyword = model;
      this.getGRNStatus();
    });
  }
  ngOnInit(): void {
    const currentDate = new Date();
    this.newDate = { day: new Date().getDate(), month: new Date().getMonth() + 1, year: new Date().getFullYear() };
    this.GetPurchaseOrderPostDefaults();
    this.InvoiceGuid = this.route.snapshot.paramMap.get('Guid') || '';
    if(this.InvoiceGuid != ''){
      localStorage.setItem("Type" , "Goods Receipt");
    }
    this.center=this.authservice.LoggedInUser.LOCATIONSGUID;
    this.GetAllUsersList()
    if (this.InvoiceGuid != '') {
      this.EditGRN();
      this.GrnStatus = localStorage.getItem('GrnStatus');
    }
    this.initForms();
    this.originalFormValues = { ...this.InvoiceDetailForm.value };
    this.addItemslist.removeAt(this.index = 0)
    this.InvoiceDocuments.removeAt(this.index = 0)
    this.UserGuid = localStorage.getItem('UserGuid');
    this.InvoiceDetailForm.patchValue({
      UserGuid:this.UserGuid
    })
    this.InvoiceDetailForm.valueChanges.pipe(
      distinctUntilChanged(),
      throttleTime(500)
    ).subscribe((value) => {
      this.FormChanged = true;
      this.modifiedFields = Object.keys(this.InvoiceDetailForm.controls).filter(controlName => {
        const control = this.InvoiceDetailForm.get(controlName);
        return control && control.dirty;
      });
    });
    this.dropdownSettings = {
      singleSelection: false,
      idField: 'PurchaseOrderNo',
      textField: 'PurchaseOrderNo',
      enableCheckAll: false,
      allowSearchFilter: true,
      itemsShowLimit: 2,
      
    };
  }
  initForms(): void {
    this.InvoiceDetailForm = this.fb.group({
      InvoiceGuid: [null],
      UserGuid: [''],
      InvoiceNumber: ['', [Validators.required]],
      ChallanNumber: [''],
      SupplierId: [''],
      GateEntryNo: [''],
      Frieght: [''],
      Octroi: [''],
      RoundOff: ['',],
      NetAmount: [''],
      InvoiceAmount: ['', [Validators.required]],
      PONumber: ['', [Validators.required]],
      SupplierName: [''],
      TotalNetAmount: ['', [Validators.required]],
      TotalDiscountAmount: [''],
      TotalTaxAmount: [''],
      LocationId: [''],
      ChallanDate: [null],
      InvoiceDate: [''],
      CenterLocationGuid: [''],
      ApprovedDate: [null],
      Subject: [''],
      NetTotal: [''],
      Discount: [''],
      IGST: [''],
      CGST: [''],
      SGST: [''],
      Narration: ['', [Validators.required]],
      InvoiceDocument: [''],
      ListGRNItems: this.fb.array([
        this.fb.group({
          ItemId: [''],
          ItemName: [''],
          VendorItemName: [''],
          ItemGuid: [''],
          BatchNumber: ['', [Validators.required]],
          ItemRate: [''],
          DiscountPercentage: [''],
          TaxAmount: [''],
          // TotalGstamount: [''],
          FinalPrice: [''],
          TotalAmount: [''],
          ExpiryDate: ['', [Validators.required]],
          IsExpirable: [''],
          //  StockDate: [''],
          Narration: [''],
          LocationId: [''],
          PanelId: [''],
          IndentNo: [''],
          IndentNumber:[''],
          FromLocationId: [''],
          UserId: [''],
          ManufactureId: [''],
          HSNCode: [''],
          CatalogNo: [''],
          PurchasedUnit: [''],
          MacId: [''],
          MajorUnitId: [''],
          MajorUnit: [''],
          MinorUnitId: [''],
          MinorUnit: [''],
          Converter: ['',],
          PackSize: [''],
          IssueMultiplier: [''],
          BarcodeNo: [''],
          BarcodeGenrationOption: ['',[Validators.required]],
          IGSTPer: [''],
          GSTPer: [''],
          SGSTPer: [''],
          UTGSTPer: [''],
          FreeQty: [''],
          CGSTPer: [''],
          ConsumptionUnit: [''],
          NetAmount: [''],
          ReleasedCount: [''],
          DiscountAmount: [''],
          Taxper: [''],
          StockId: [''],
          ISDeleted: [0],
          IsBarcodePrinted: [false],
          InitialCount: [''],
          PendingQty: [''],
          InstialCount: [''],
          IsButtonShow: [false],
          StockGuid:[''],
          TotalItemRate:[''],
          PurchaseOrderNo:['']
        })
      ]),
      ListInvoiceDocuments: this.fb.array([
        this.fb.group({
          Id:[null],
          FileName: [''],
          File: [''],
          ItemName: [''],
          FilePath: [''],
          OriginalFileName: [''],
          FileDate: [''],
          NewFileName: [''],
        })
      ])
    })
  }
  onUserGuidChange(newUserGuid: any): void {
    this.UserGuid=newUserGuid.UserGuid
  }
  fetch(cb: any) {
    const req = new XMLHttpRequest();
    req.open('GET', `assets/data/all-items.json`);
    req.onload = () => {
      cb(JSON.parse(req.response));
    };
    req.send();
  }
  updateFilter(event: any) {
    const val = event.target.value.toLowerCase();

    // filter our data
    const temp = this.temp.filter(function (d) {
      return d.itemName.toLowerCase().indexOf(val) !== -1 || !val;
    });

    // update the rows
    this.rows = temp;
    // Whenever the filter changes, always go back to the first page
    this.table.offset = 0;
  }
  openBasicModal(content: TemplateRef<any>) {
    this.modalService.open(content, { size: 'md' }).result.then((result) => {
      console.log("Modal closed" + result);
    }).catch((res) => { });
  }
  /**
 * this  service method is Get GRN values for Edit
 */
  EditGRN() {
    this.EditshimmerVisible=true;
    this.grnService.GetEditGRNdetails(this.InvoiceGuid).subscribe(data => {
      this.GRNdetails = data.listGetEditGRNdetails || [];
      this.InvoiceDetailForm.value.ListInvoiceDocuments = data.listinvoiceDocuments || [];
      if(data.listinvoiceDocuments.length>0){
        this.IsDocumentShow = false;
        const documentsArray = this.InvoiceDetailForm.get('ListInvoiceDocuments') as FormArray;
        while (documentsArray.length) {
            documentsArray.removeAt(0);
        }
        this.filterInvoiceDocuments=data.listinvoiceDocuments
        data.listinvoiceDocuments.forEach((document:any) => {
          const fileDate = new Date(document.FileDate);
          const formattedFileDate = `${fileDate.getFullYear()}-${(fileDate.getMonth() + 1).toString().padStart(2, '0')}-${fileDate.getDate().toString().padStart(2, '0')}`;
          console.log("document",document)
            documentsArray.push(this.fb.group({
                Id:document.Id,
                FileName: document.FileName,
                OriginalFileName: document.OriginalFileName,
                FilePath: document.FilePath,
                FileDate: formattedFileDate==null?"":formattedFileDate,
                NewFileName: document.NewFileName,
                File:'null',
                IsDeleted:document.IsDeleted
            }));
        });
      }
      this.Itemsdetails = data.listitemsDetails || [];
      this.NetTotalAmount=this.GRNdetails[0]?.NetAmount;
      this.locationGuid= this.GRNdetails[0]?.CenterLocationGuid;
      this.selectedVender=this.GRNdetails[0]?.SupplierName;
      this.InvoiceDetailForm.patchValue({
        InvoiceGuid: this.GRNdetails[0]?.Guid,
        UserGuid:this.UserGuid,
        CenterLocationGuid: this.locationGuid,
        ChallanDate: this.GRNdetails[0]?.ChalanDate == '0001-01-01T00:00:00' ? null : ({ day: new Date(this.GRNdetails[0]?.ChalanDate).getDate(), month: new Date(this.GRNdetails[0]?.ChalanDate).getMonth() + 1, year: new Date(this.GRNdetails[0]?.ChalanDate).getFullYear() }),
        ChallanNumber: this.GRNdetails[0]?.ChalanNo,
        Frieght: this.GRNdetails[0]?.Freight,
        GateEntryNo: this.GRNdetails[0]?.GatePassInWard,
        InvoiceAmount: this.GRNdetails[0].InvoiceAmount.toString().match(/^\d+(?:\.\d{0,2})?/)[0],
        InvoiceDate: ({ day: new Date(this.GRNdetails[0]?.InvoiceDate).getDate(), month: new Date(this.GRNdetails[0]?.InvoiceDate).getMonth() + 1, year: new Date(this.GRNdetails[0]?.InvoiceDate).getFullYear() }),
        LedgerTransactionNo: this.GRNdetails[0].LedgerTransactionNo,
        Narration: this.GRNdetails[0]?.Narration,
        NetTotal: this.GRNdetails[0]?.NetAmount.toString().match(/^\d+(?:\.\d{0,2})?/)[0],
        Octroi: this.GRNdetails[0]?.Octori,
        PONumber: this.GRNdetails[0]?.PurchaseOrderNo,
        IndentNo : this.GRNdetails[0]?.IndentNo,
        RoundOff: this.GRNdetails[0]?.RoundOff,
        SupplierName: this.selectedVender,
        Subject: this.Subject,
        ApprovedDate: null,
        InvoiceNumber: this.GRNdetails[0]?.InvoiceNo,
        LocationId: this.GRNdetails[0]?.LocationId,
        SupplierId: this.GRNdetails[0]?.VendorId,
        TotalDiscountAmount: this.GRNdetails[0]?.DiscountOnTotal,
        TotalTaxAmount: this.GRNdetails[0]?.TaxAmount,
        SGST: this.GRNdetails[0]?.SGST,
        CGST: this.GRNdetails[0]?.CGST,
        IGST: this.GRNdetails[0]?.IGST,
        TotalNetAmount: this.GRNdetails[0]?.GrossAmount,
        Discount: this.GRNdetails[0]?.Discount
      })
      this.addItemslist.value.forEach((f: any) => {
        this.removeItemsList.push(f);
      })
      this.Isprintbarcode = this.Itemsdetails[0]?.IsBarcodePrinted;
      this.Itemsdetails.forEach((items: any) => {
        this.addItemslist.push(this.fb.group({
          StockId: items.StockId,
          ItemName: items.ItemName,
          VendorItemName: items.VendorItemName,
          ItemId: items.ItemId,
          Converter: items.Converter,
          BarcodeNo: items.BarcodeNo,
          BatchNumber: items.BatchNumber,
          ItemRate: items.Rate,
          ReleasedCount: items.ReleasedCount,
          DiscountPercentage: items.DiscountPer,
          IGSTPer: items.IGSTPer,
          CGSTPer: items.CGSTPer,
          SGSTPer: items.SGSTPer,
          DiscountAmount: items.DiscountAmount,
          TaxAmount: items.TaxAmount,
          NetAmount: [items.UnitPrice],
          TotalAmount: items.TotalAmount,
          ExpiryDate: items.ExpiryDate == '0001-01-01T00:00:00' ? null : ({ day: new Date(items.ExpiryDate).getDate(), month: new Date(items.ExpiryDate).getMonth() + 1, year: new Date(items.ExpiryDate).getFullYear() }),
          // ItemCode: '',
          MachineId: items.MachineId,
          macId: items.MachineId,
          MachineName: items.MachineName,
          MajorUnitId: items.MajorUnitId,
          MajorUnit: items.MajorUnit,
          ManufactureId: items.ManufactureId,
          PackSize: items.PackSize,
          PurchaseOrderNo:items.PurchaseOrderNo,
          FromLocationId: items.LocationId,
          UnitPrice: items.UnitPrice,
          Narration: this.InvoiceDetailForm.value.Narration,
          //StockDate: items.StockDate,
          MinorUnit: items.MinorUnitName,
          BarcodeGenrationOption: items.BarcodeGenrationOption,
          Taxper: items.IGSTPer + items.CGSTPer + items.SGSTPer,
          PanelId: items.PanelId,
          IndentNo: items.IndentNo,
          UserId: items.IndentNo,
          MinorUnitId: items.MinorUnitId,
          IssueMultiplier: items.IssueMultiplier,
          ISDeleted: 0,
          HsnCode: items.HsnCode,
          CatalogNo:items.CatalogNo,
          IsBarcodePrinted: [false],
          ItemGuid: items.ItemGuid,
          InitialCount: items.InitialCount,
          UTGSTPer: items.UTGSTPer,
          IsExpirable: items.IsExpirable,
          InstialCount:items.ReleasedCount,
          IsButtonShow:[false],
          PurchaseOrderId:'',
          StockGuid:items.StockGuid,
          TotalItemRate:items.ReleasedCount*items.Rate
        }
        ))
      })
      this.EditshimmerVisible=false;
      this.FormChanged = false
    },
    (err)=>{
      this.EditshimmerVisible=false;
    })

  }
  /**
   * This service call used to save to GRN
   */
  InvoiceDetails(): void {
    this.addItemslist.value.forEach((element: any, index: any) => {
      const barcodedetails = this.addItemslist.at(index)
      barcodedetails.patchValue({
        BatchNumber: element.BatchNumber,
        BarcodeNo: element.BarcodeNo ||'',
        ExpiryDate: element.ExpiryDate ? element.ExpiryDate.year + "-" + element.ExpiryDate.month + "-" + element.ExpiryDate.day : '',
        Narration: this.InvoiceDetailForm.value.Narration,
        Taxper: element.IGSTPer + element.CGSTPer + element.IGSTPer,
      });
      if (this.InvoiceDetailForm.value.InvoiceGuid != null) {
        this.addItemslist.value.push(...this.removedItems)
        this.poNumber = this.InvoiceDetailForm.value.PONumber
      }
      else {
        this.poNumber = this.InvoiceDetailForm.value.PONumber.map((po: { PurchaseOrderNo: any; }) => po.PurchaseOrderNo).join(',')
      }
    });
    let input = {
      InvoiceGuid: this.InvoiceDetailForm.value.InvoiceGuid,
      UserGuid: this.InvoiceDetailForm.value.UserGuid,
      InvoiceNumber: this.InvoiceDetailForm.value.InvoiceNumber,
      challanNumber: this.InvoiceDetailForm.value.ChallanNumber,
      InvoiceDate: this.InvoiceDetailForm.value.InvoiceDate.year + "-" + this.InvoiceDetailForm.value.InvoiceDate.month + "-" + this.InvoiceDetailForm.value.InvoiceDate.day,
      supplierId: this.InvoiceDetailForm.value.SupplierId,
      gateEntryNo: this.InvoiceDetailForm.value.GateEntryNo,
      frieght: this.InvoiceDetailForm.value.Frieght,
      octroi: this.InvoiceDetailForm.value.Octroi,
      roundOff: this.InvoiceDetailForm.value.RoundOff,
      grnAmount: this.InvoiceDetailForm.value.NetTotal,
      invoiceAmount: this.InvoiceDetailForm.value.InvoiceAmount,
      purchaseOrderNo: this.poNumber,
      totalAmount: this.InvoiceDetailForm.value.TotalNetAmount,
      discountAmount: this.InvoiceDetailForm.value.TotalDiscountAmount,
      taxAmount: this.InvoiceDetailForm.value.TotalTaxAmount,
      locationId: this.InvoiceDetailForm.value.LocationId,
      challanDate: this.InvoiceDetailForm.value.ChallanDate ? this.InvoiceDetailForm.value.ChallanDate.year + "-" + this.InvoiceDetailForm.value.ChallanDate.month + "-" + this.InvoiceDetailForm.value.ChallanDate.day : '',
      discount: this.InvoiceDetailForm.value.Discount,
      igst: this.InvoiceDetailForm.value.IGST,
      cgst: this.InvoiceDetailForm.value.CGST,
      sgst: this.InvoiceDetailForm.value.SGST,
      narration: this.InvoiceDetailForm.value.Narration,
      InvoiceDocument: this.InvoiceDetailForm.value.ListInvoiceDocuments.length,
      //LstInvioceDocuments: this.filterInvoiceDocuments,
      LstInvioceDocuments : this.InvoiceDetailForm.value.ListInvoiceDocuments.filter((document:any) => (document.Id === null&&document.IsDeleted==false)||(document.Id != null&&document.IsDeleted==true)),
      LstGRNItems: this.InvoiceDetailForm.value.ListGRNItems,
    }
    this.grnService.SaveGRNDetails(input).subscribe(
      (data) => {
        if(this.modifiedFields.length==1 && this.modifiedFields[0]=="UserGuid"&& this.GrnStatus=="Checked"){
          this.UpdateGRNstatus()
          this.getGRNStatus();
        }
        this.router.navigateByUrl('/grn');

      },
      (err) => {
      });
      
   }
  /**
 * this service call used to get the centers List
 */
  GetPurchaseOrderPostDefaults() {
    let DepotmentGuid =this.authservice.LoggedInUser.DEFAULTROLES.toLowerCase().includes('ADMIN'.toLowerCase()) && this.authservice.LoggedInUser.LOCATIONSGUID=='00000000-0000-0000-0000-000000000000'  ?'00000000-0000-0000-0000-000000000000': this.authservice.LoggedInUser.LOCATIONSGUID.split(",")
  this.shimmerVisible=true;
    this.purchaseOrderService.GetPurchaseOrderPostDefaults(DepotmentGuid).subscribe(data => {
     this.shimmerVisible=false;
      this.CenterLocacityList = data.Result.LstCenterLocationType;
      this.FormChanged = false

    },
      (err) => {
       this.shimmerVisible=false;
      });
  }
   /**
 * this service call used to get the centers List
 */
  UpdateGRNstatus() {
    let input = {
      invoiceGuid:this.InvoiceDetailForm.value.InvoiceGuid,
      Status: "Checker",
      UserGuid: this.UserGuid,
      ApproveReason:"",
      CheckedReason:""
    }
    this.grnService.UpdateGRNStatus(input).subscribe(
      (data) => {
    });
  }
  /**
   * this change event used to InvoiceDate
   * @param event
   */
  onFromDateSelect(event: any) {
    // let Date = event.year + "-" + event.month + "-" + event.day;
    this.InvoiceDetailForm.patchValue({
      InvoiceDate: event
    })
  }
  /**
   * this change event used to change the ChallanDate
   * @param event
   */
  FromDateSelect(event: any) {
    // let finalDate = event.year + "-" + event.month + "-" + event.day;
    this.InvoiceDetailForm.patchValue({
      ChallanDate: event
    })
  }
  /**
   * this method is formcontols
   */
  get addItemslist(): FormArray {
    return this.InvoiceDetailForm.get('ListGRNItems') as FormArray;
  }
  /**
   * this event used to add the items
   * @param index
   */
  AddItemsList(index: any) {
    const newFormControl = this.fb.group({
      ItemId: this.InvoiceDetailForm.get('ListGRNItems')?.value[index].ItemId,
      ItemName: this.InvoiceDetailForm.get('ListGRNItems')?.value[index].ItemName,
      VendorItemName: this.InvoiceDetailForm.get('ListGRNItems')?.value[index].VendorItemName,
      ItemCode: this.InvoiceDetailForm.get('ListGRNItems')?.value[index].ItemCode,
      HsnCode: this.InvoiceDetailForm.get('ListGRNItems')?.value[index].HsnCode,
      CatalogNo: this.InvoiceDetailForm.get('ListGRNItems')?.value[index].CatalogNo,
      Converter: this.InvoiceDetailForm.get('ListGRNItems')?.value[index].Converter,
      BarcodeNo: [''],
      BatchNumber: [''],
      ExpiryDate: this.InvoiceDetailForm.get('ListGRNItems')?.value[index].ExpiryDate,
       ReleasedCount: [0],
      //  ReleasedCount: this.InvoiceDetailForm.get('ListGRNItems')?.value[index].ReleasedCount,
      ItemRate: this.InvoiceDetailForm.get('ListGRNItems')?.value[index].ItemRate,
      DiscountPercentage: this.InvoiceDetailForm.get('ListGRNItems')?.value[index].DiscountPercentage,
      IGSTPer: this.InvoiceDetailForm.get('ListGRNItems')?.value[index].IGSTPer,
      CGSTPer: this.InvoiceDetailForm.get('ListGRNItems')?.value[index].CGSTPer,
      SGSTPer: this.InvoiceDetailForm.get('ListGRNItems')?.value[index].SGSTPer,
      DiscountAmount: this.InvoiceDetailForm.get('ListGRNItems')?.value[index].DiscountAmount,
      TaxAmount: this.InvoiceDetailForm.get('ListGRNItems')?.value[index].TaxAmount,
      NetAmount: this.InvoiceDetailForm.get('ListGRNItems')?.value[index].NetAmount,
      TotalAmount:0,
      PackSize: this.InvoiceDetailForm.get('ListGRNItems')?.value[index].PackSize,
      PurchaseOrderId: this.InvoiceDetailForm.get('ListGRNItems')?.value[index].PurchaseOrderId,
      PurchaseOrderNo: this.InvoiceDetailForm.get('ListGRNItems')?.value[index].PurchaseOrderNo,
      //  StockDate: this.InvoiceDetailForm.get('ListGRNItems')?.value[index].StockDate,
      UnitPrice: this.InvoiceDetailForm.get('ListGRNItems')?.value[index].UnitPrice,
      Narration: this.InvoiceDetailForm.get('ListGRNItems')?.value[index].Narration,
      MinorUnit: this.InvoiceDetailForm.get('ListGRNItems')?.value[index].MinorUnit,
      ManufactureId: this.InvoiceDetailForm.get('ListGRNItems')?.value[index].ManufactureId,
      MajorUnit: this.InvoiceDetailForm.get('ListGRNItems')?.value[index].MajorUnit,
      MachineName: this.InvoiceDetailForm.get('ListGRNItems')?.value[index].MachineName,
      MachineId: this.InvoiceDetailForm.get('ListGRNItems')?.value[index].MachineId,
      FromLocationId: this.InvoiceDetailForm.get('ListGRNItems')?.value[index].FromLocationId,
      ItemGuid: this.InvoiceDetailForm.get('ListGRNItems')?.value[index].ItemGuid,
      InitialCount: this.InvoiceDetailForm.get('ListGRNItems')?.value[index].InitialCount,
      InstialCount: this.InvoiceDetailForm.get('ListGRNItems')?.value[index].InstialCount,
      IsButtonShow: this.InvoiceDetailForm.get('ListGRNItems')?.value[index].IsButtonShow,
      IsExpirable: this.InvoiceDetailForm.get('ListGRNItems')?.value[index].IsExpirable,
      StockGuid: this.InvoiceDetailForm.get('ListGRNItems')?.value[index].StockGuid,
      IndentNumber  : this.InvoiceDetailForm.get('ListGRNItems')?.value[index].IndentNumber,
      ISDeleted: 0,
      TotalItemRate:''
    });
    (this.InvoiceDetailForm.controls.ListGRNItems as FormArray).insert(index + 1, newFormControl);
    const formArray = this.InvoiceDetailForm.get('ListGRNItems') as FormArray;
    const filteredArray = formArray.value.filter((obj: { TotalAmount: string; }) => obj.TotalAmount);
    const sumTotal = filteredArray.reduce((acc: any, obj: { TotalAmount: any; }) => acc + obj.TotalAmount, 0);
    this.InvoiceDetailForm.patchValue({
      NetTotal: sumTotal.toString().match(/^\d+(?:\.\d{0,2})?/)
    })
    this.FormChanged = false;
  }
  /**
   * this event get Purchase order numbers dropdown list
   * @param event 
   */
  GetPOnumber(event: any) {
    this.VenderDetails = []; 
    this.selectedVender=[];
    if (!event || this.InvoiceDetailForm.value.CenterLocationGuid == null) {
      this.uniqueList = [];
      this.VenderDetails = []; 
      this.selectedVender=[];
      this.addItemslist.clear();
      this.InvoiceDetailForm.patchValue({
        SupplierName: '',
        PONumber: '',
        ApprovedDate: ''
      })
      this.FormChanged = false
    }
    this.PoNumberList = [];
    this.grnService.GetPOnumbers(this.InvoiceDetailForm.value.CenterLocationGuid).subscribe(data => {
      this.PoNumberList = data || [];
      let poList = this.PoNumberList;
      this.uniqueList = poList.filter((obj: { VendorName: any; }, index: any, self: any[]) =>
        index === self.findIndex((item) => (
          item.VendorName === obj.VendorName
        ))
      );
      if (this.InvoiceDetailForm.value.InvoiceGuid != null) {
        this.GetSupplier(event, this.index)
      }
    },
      (err) => {
      });
  }
  /**
   * this event to get the Supliers
   */
  GetVenderdetails(event: any) {
    if (!event || this.InvoiceDetailForm.value.PONumber == null) {
      this.addItemslist.clear();
      this.selectedVender=[];
      this.InvoiceDetailForm.patchValue({
        SupplierName: null,
        PONumber: '',
        ApprovedDate: ''
      })
      this.FormChanged = false
    }
    this.InvoiceDetailForm.patchValue({
      PONumber: '',
    })
    this.addItemslist.clear();
    this.VenderDetails = [];
    let SupplierDetail = this.PoNumberList.filter((item: { VendorName: string; }) => item.VendorName === event.VendorName);
    this.VenderDetails = SupplierDetail.filter((obj: { PurchaseOrderNo: any; }, index: any, self: any[]) =>
      index === self.findIndex((item) => (
        item.PurchaseOrderNo === obj.PurchaseOrderNo
      ))
    );
  }
   /**
   * this event to get the All Users
   */
   GetAllUsersList() {
    this.userManagementService.getUsersList(this.center).subscribe(data => {
      this.userList = data;
    }, 
    (err: HttpErrorResponse) => {
      //console.log("err")
    })
  }
  /**
   * this event get the SupplierDetails
   * @param event
   */
  GetSupplier(event: any, index: any) {
    if (!event || this.InvoiceDetailForm.value.PONumber == null) {
      this.VenderDetails = [];
      this.addItemslist.clear();
      this.InvoiceDetailForm.patchValue({
        SupplierName: '',
        PONumber: '',
        ApprovedDate: ''
      })
    }
    this.addItemslist.clear();
    this.SupplierDetails = this.PoNumberList.filter((item: { PurchaseOrderNo: string; }) => item.PurchaseOrderNo === event.PurchaseOrderNo);
    this.SupplierDetails = this.PoNumberList.filter((item: { PurchaseOrderNo: any; }) => { return event.some((array2Item: any) => item.PurchaseOrderNo === array2Item.PurchaseOrderNo); });
    this.NetTotalAmount= this.SupplierDetails .map((item: { NetTotal: string; }) => (item.NetTotal)).reduce((acc: any, curr: any) => acc + curr, 0);
    this.InvoiceDetailForm.patchValue({
      PurchaseOrderNo: this.SupplierDetails[0]?.PurchaseOrderNo,
      SupplierName: this.SupplierDetails[0]?.VendorName,
      SupplierId: this.SupplierDetails[0]?.VendorId,
      Subject: this.Subject,
      NetAmount: this.SupplierDetails[0]?.NetAmount,
      LocationId: this.SupplierDetails[0]?.LocationId,
      NetTotal: this.NetTotalAmount,
      TotalTaxAmount: this.SupplierDetails[0]?.TaxAmount,
      TotalNetAmount: this.SupplierDetails[0]?.NetAmount,
      TotalDiscountAmount: this.SupplierDetails[0]?.DiscountAmount,
      ApprovedDate: ({ day: new Date(this.SupplierDetails[0]?.OrderDate).getDate(), month: new Date(this.SupplierDetails[0]?.OrderDate).getMonth() + 1, year: new Date(this.SupplierDetails[0]?.OrderDate).getFullYear() })

    }, { emitEvent: true })
    this.setValue();
  }
  /**
   * this method is get the item details
   */
  setValue() {
    const data = this.SupplierDetails;
    if (this.SupplierDetails.length != 0) {
      data.forEach((element: {
        TotalAmount: any, NetAmount: any; Rate: any; IGSTPer: any; DiscountAmt: any; CGSTPer: any; DiscountAmount: any; DiscountPercentage: any; ItemName: any; VendorItemName:any,TaxAmount: any, SGSTPer: any, OrderedQty: any, HsnCode: any,CatalogNo:any,
        ItemCode: any, Converter: any, ItemId: any, MachineId: any, MachineName: any, MajorUnitId: any, MajorUnitName: any, ManufactureId: any, ManufactureName: any, PackSize: any, PurchaseOrderId: any, PurchaseOrderNo: any
        UnitPrice: any, LocationId: any, BarcodeNo: any, BatchNumber: any, ExpiryDate: any, Narration: any, MinorUnit: any, MinorUnitId: any, ItemGuid: any, IsExpirable: any, UGSTPer: any,TotalItemRate:any,IndentNo : any
      }) => {
        this.addItemslist.push(this.fb.group({
          ItemRate: element?.Rate,
          ItemId: element?.ItemId,
          IGSTPer: element?.IGSTPer,
          DiscountAmount: (element?.DiscountAmount*element?.OrderedQty),
          CGSTPer: element?.CGSTPer,
          UTGSTPer: element?.UGSTPer,
          DiscountPercentage: element?.DiscountPercentage,
          ItemName: element?.ItemName,
          VendorItemName: element?.VendorItemName,
          TaxAmount:element?.TaxAmount,
          NetAmount: element?.UnitPrice,
          SGSTPer: element?.SGSTPer,
          TotalAmount: (element?.UnitPrice*element?.OrderedQty),
          ReleasedCount: element?.OrderedQty,
          HsnCode: element?.HsnCode,
          CatalogNo:element?.CatalogNo,
          ItemCode: element?.ItemCode,
          Converter: element?.Converter,
          MachineId: element?.MachineId,
          MachineName: element?.MachineName,
          MajorUnitId: element?.MajorUnitId,
          MajorUnit: element?.MajorUnitName || '',
          ManufactureId: element?.ManufactureId,
          PackSize: element?.PackSize,
          PurchaseOrderId: element?.PurchaseOrderId,
          PurchaseOrderNo: element?.PurchaseOrderNo,
          FromLocationId: element?.LocationId,
          UnitPrice: element?.UnitPrice,
          BatchNumber: element?.BatchNumber,
          BarcodeNo: element?.BarcodeNo,
          ExpiryDate: element?.ExpiryDate,
          IsExpirable: element?.IsExpirable,
          MinorUnit: element?.MinorUnit || '',
          MinorUnitId: element?.MinorUnitId,
          Narration: this.InvoiceDetailForm.value.Narration,
          Taxper: element?.SGSTPer + element?.CGSTPer + element?.IGSTPer,
          IsBarcodePrinted: [false],
          InitialCount: element.OrderedQty,
          PendingQty: '',
          ItemGuid: element.ItemGuid,
          InstialCount: element?.OrderedQty,
          IsButtonShow:[false],
          TotalItemRate:(element?.OrderedQty*element?.Rate),
          IndentNumber : element.IndentNo
        }));
        const formArray = this.InvoiceDetailForm.get('ListGRNItems') as FormArray;
        const filteredArray = formArray.value.filter((obj: { TotalAmount: string; }) => obj.TotalAmount);
        const Discountper = filteredArray.reduce((acc: any, obj: { DiscountPercentage: any; }) => acc + obj.DiscountPercentage, 0);
        const SGSTper = filteredArray.reduce((acc: any, obj: { SGSTPer: any; }) => acc + obj.SGSTPer, 0);
        const CGSTper = filteredArray.reduce((acc: any, obj: { CGSTPer: any; }) => acc + obj.CGSTPer, 0);
        const IGSTper = filteredArray.reduce((acc: any, obj: { IGSTPer: any; }) => acc + obj.IGSTPer, 0);
        const sumDiscountAmount = filteredArray.reduce((acc: any, obj: { DiscountAmount: any; }) => acc + obj.DiscountAmount, 0);
        const sumTaxAmount = filteredArray.reduce((acc: any, obj: { TaxAmount: any; }) => acc + obj.TaxAmount, 0);
        const SumNetAmount = filteredArray.reduce((acc: any, obj: { NetAmount: any; }) => acc + obj.NetAmount, 0);
        const TotalAmount = filteredArray.reduce((acc: any, obj: { TotalAmount: any; }) => acc + obj.TotalAmount, 0);
        const sumTotalItemRate = filteredArray.reduce((acc: any, obj: { TotalItemRate: any; }) => acc + obj.TotalItemRate, 0);
        this.NetTotalAmount = TotalAmount;
        this.InvoiceDetailForm.patchValue({
          ItemName: element.ItemName,
          VendorItemName: element.VendorItemName,
          ItemId: element.ItemId,
          ItemRate: element.Rate,
          IGSTPer: element.IGSTPer,
          CGSTPer: element.CGSTPer,
          DiscountAmount: element.DiscountAmount,
          DiscountPercentage: element.DiscountPercentage,
          // TaxAmount: element.TaxAmount,
          SGSTPer: element.SGSTPer,
          TotalAmount: element.TotalAmount,
          ReleasedCount: element.OrderedQty,
          HsnCode: element.HsnCode,
          CatalogNo:element.CatalogNo,
          Discount: Discountper,
          SGST: SGSTper,
          CGST: CGSTper,
          IGST: IGSTper,
          TotalTaxAmount: sumTaxAmount ,
          TotalNetAmount: sumTotalItemRate,
          TotalDiscountAmount: sumDiscountAmount,
          NetTotal:TotalAmount.toString().match(/^\d+(?:\.\d{0,2})?/)[0]
        }, { emitEvent: true })

      })
    }
  }
  /**
   * this method change the item price
   * @param index
   */
  ChangePrice(index: any, event: any) {
    const quantity = (this.InvoiceDetailForm.get('ListGRNItems')?.value[index].ReleasedCount);
    this.ItemRate = this.InvoiceDetailForm.get('ListGRNItems')?.value[index].ItemRate;
    const TotalTaxPer =  (this.InvoiceDetailForm.get('ListGRNItems')?.value[index].IGSTPer)!=0?(this.InvoiceDetailForm.get('ListGRNItems')?.value[index].IGSTPer):
    (this.InvoiceDetailForm.get('ListGRNItems')?.value[index].CGSTPer)+(this.InvoiceDetailForm.get('ListGRNItems')?.value[index].SGSTPer);
    const Discountamtper=(this.InvoiceDetailForm.get('ListGRNItems')?.value[index].DiscountPercentage);
    let DiscountPer= this.ItemRate-(this.ItemRate * this.InvoiceDetailForm.get('ListGRNItems')?.value[index].DiscountPercentage/100)
    let totalGSTamount =  (DiscountPer * TotalTaxPer/100)*(quantity)
    let discountAmount = (this.ItemRate / 100 * this.InvoiceDetailForm.get('ListGRNItems')?.value[index].DiscountPercentage)*(quantity);
    const Discount =(this.ItemRate*Discountamtper)/100
    const tax =(this.ItemRate-Discount)*(TotalTaxPer)/100
    let FinalPrice = (tax+this.ItemRate-Discount);
    let TotalPrice = this.InvoiceDetailForm.get('ListGRNItems')?.value[index].ReleasedCount * FinalPrice;
    const ItemDetails = this.addItemslist.at(index);
    const FrieghtAmount = this.InvoiceDetailForm.get('Frieght')?.value || 0
    const Octroiamt = this.InvoiceDetailForm.get('Octroi')?.value || 0
    const RoundOff = this.InvoiceDetailForm.get('RoundOff')?.value || 0
    const TotalRate=this.ItemRate*quantity;
    ItemDetails.patchValue({
        TaxAmount: totalGSTamount,
      NetAmount: FinalPrice ,
      TotalAmount: TotalPrice,
      DiscountAmount: discountAmount,
        UnitPrice: FinalPrice,
        TotalItemRate:TotalRate
    })
    const formArray = this.InvoiceDetailForm.get('ListGRNItems') as FormArray;
    const filteredArray = formArray.value.filter((obj: { TotalAmount: string; }) => obj.TotalAmount);
    const sumTotal = filteredArray.reduce((acc: any, obj: { TotalAmount: any; }) => acc + obj.TotalAmount, 0);
    const sumDiscountAmount = filteredArray.reduce((acc: any, obj: { DiscountAmount: any; }) => acc + obj.DiscountAmount, 0);
    const sumTaxAmount = filteredArray.reduce((acc: any, obj: { TaxAmount: any; }) => acc + obj.TaxAmount, 0);
    const SumNetAmount = filteredArray.reduce((acc: any, obj: { TotalItemRate: any; }) => acc + obj.TotalItemRate, 0);
    const Discountper = filteredArray.reduce((acc: any, obj: { DiscountPercentage: any; }) => acc + obj.DiscountPercentage, 0);
    const SGSTper = filteredArray.reduce((acc: any, obj: { SGSTPer: any; }) => acc + obj.SGSTPer, 0);
    const CGSTper = filteredArray.reduce((acc: any, obj: { CGSTPer: any; }) => acc + obj.CGSTPer, 0);
    const IGSTper = filteredArray.reduce((acc: any, obj: { IGSTPer: any; }) => acc + obj.IGSTPer, 0);
    this.NetTotalAmount=sumTotal;
    this.InvoiceDetailForm.patchValue({
      NetTotal: (sumTotal +FrieghtAmount+Octroiamt+RoundOff).toString().match(/^\d+(?:\.\d{0,2})?/)[0],
      TotalDiscountAmount: sumDiscountAmount,
      TotalTaxAmount: sumTaxAmount,
      TotalNetAmount: SumNetAmount,
      Discount: Discountper,
      SGST: SGSTper,
      CGST: CGSTper,
      IGST: IGSTper,
    }, { emitEvent: true })
    this.FormChanged = true;
  }
  ChangeNetAmt(event: any) {
    const FrieghtAmount = this.InvoiceDetailForm.get('Frieght')?.value || 0
    const Octroiamt = this.InvoiceDetailForm.get('Octroi')?.value || 0
    const RoundOff = this.InvoiceDetailForm.get('RoundOff')?.value || 0
    if (this.InvoiceGuid == '') {
      let TotalPrice = this.NetTotalAmount + FrieghtAmount + Octroiamt + RoundOff;
      this.InvoiceDetailForm.patchValue({
        NetTotal: TotalPrice.toString().match(/^\d+(?:\.\d{0,2})?/)[0]
      }, { emitEvent: true })
    }
    else {
      let Price = (this.NetTotalAmount + FrieghtAmount + Octroiamt + RoundOff);
      this.InvoiceDetailForm.patchValue({
        NetTotal: Price.toString().match(/^\d+(?:\.\d{0,2})?/)[0],
      }, { emitEvent: true })
    }
  }
  /** 
  * This click event is used to reset the Form
  */
  FormReset() {
    if (this.InvoiceGuid == '') {
      this.InvoiceDetailForm.reset();
      this.uniqueList = [];
      this.InvoiceDocuments.clear();
      this.SupplierDetails = [];
      this.InvoiceDetailForm.patchValue({
        PONumber: '',
        ApprovedDate: '',
        NetTotal: '',
      })
      this.addItemslist.clear();
    }
    if (this.InvoiceGuid) {
      this.addItemslist.clear();
      this.EditGRN();
    }
    this.Isprintbarcode = false;
    this.FormChanged = false;
  }
  /**
   * this method used to add invoice documents
   * @param $event
   */
  UplodeInvoice(event: any) {
    this.FormChanged = true
    this.fileToUpload = event.srcElement.files[0];
    const allowed_types = ['application/pdf', 'application/msword', 'application/docx', 'application/doc', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!_.includes(allowed_types, event.target.files[0]?.type)) {
      const resumePdfInput = document.getElementById('upload-resume') as HTMLInputElement
      if (resumePdfInput) {
        resumePdfInput.value = '';
      }

      this.isFileUplodad = true
      this.ShowPdfFile = "Please upload pdf, doc, docx file only!";
      return; 
    }
    const formData: FormData = new FormData();
    var fileName = this.fileToUpload.name;
    fileName = fileName.substring(0, fileName.lastIndexOf('.'));
    formData.append('File', this.fileToUpload, this.fileToUpload.name);
    formData.append('FileName', ("").concat(this.fileToUpload.name));
    this.grnService.Uploadinvoice(formData).subscribe(data => {
      this.isFileUplodad = false
      this.InvoiceDocument = data.result;
      this.FileName = this.fileToUpload.name,
        this.File = 'null',
        this.FilePath = data.result,
        this.OriginalFileName = this.fileToUpload.type,
        this.FileDate = this.InvoiceDetailForm.value.ApprovedDate,
        this.NewFileName = ''
      this.AddList();
    },
      (err) => {
      });
  }
  /**
   * this method is formcontols
   */
  get InvoiceDocuments(): FormArray {
    return this.InvoiceDetailForm.get('ListInvoiceDocuments') as FormArray;
  }
  /**
   * this method used to push the documents
   */
  AddList() {
    this.InvoiceDocuments.push(this.fb.group({
      Id:null,
      FileName: this.FileName,
      File: this.File,
      FilePath: this.FilePath,
      OriginalFileName: this.OriginalFileName,
      FileDate: this.Date==null?"":this.Date,
      NewFileName: this.NewFileName,
      IsDeleted:null
    }))
    this.InvoiceDetailForm.patchValue({
      Id:null,
      FileName: this.FileName,
      File: this.File,
      FilePath: this.FilePath,
      OriginalFileName: this.OriginalFileName,
      FileDate: this.Date==null?"":this.Date,
      NewFileName: this.NewFileName,
      IsDeleted:null
    }, { emitEvent: true })
    this.Isdisable = false;
    this.IsDocumentShow = true;
    this.FormChanged = true
    console.log("hjf",this.InvoiceDetailForm.controls.ListInvoiceDocuments.value)
  }
  AddDocument() {
    const invoiceDocuments = this.InvoiceDetailForm.controls.ListInvoiceDocuments;
    const invoiceDocumentsArray = this.InvoiceDetailForm.controls.ListInvoiceDocuments.value
  
    for (let i = 0; i < invoiceDocumentsArray.length; i++) {
      if (invoiceDocumentsArray[i].Id === null &&invoiceDocumentsArray[i].IsDeleted==null) {
        invoiceDocumentsArray[i].IsDeleted = false;
      }
      if(invoiceDocumentsArray[i].Id != null){
        invoiceDocumentsArray[i].FileDate = "0001-01-01T00:00:00";
        const fileDate = new Date(invoiceDocumentsArray[i].FileDate);
        const formattedFileDate = `${fileDate.getFullYear()}-${(fileDate.getMonth() + 1).toString().padStart(2, '0')}-${fileDate.getDate().toString().padStart(2, '0')}`;
        invoiceDocumentsArray[i].FileDate=formattedFileDate
      }
    }
    invoiceDocuments.patchValue(invoiceDocumentsArray, { emitEvent: true });
  }
  /**
   * this event used to remove the documents
   * @param index
   */
  remove(index: any) {
    this.FormChanged=true
    this.filterInvoiceDocuments=this.InvoiceDocuments;
    //this.InvoiceDocuments.removeAt(index)
    const resumePdfInput = document.getElementById('upload-resume') as HTMLInputElement
    if (resumePdfInput) {
      resumePdfInput.value = '';
    }
    //this.filterInvoiceDocuments.value[index].IsDeleted=true
    //this.InvoiceDetailForm.value.ListInvoiceDocuments[index].IsDeleted=true
    this.Isdisable = true;
    const invoiceDocumentArray = this.InvoiceDetailForm.get('ListInvoiceDocuments') as FormArray;
    const invoiceDocumentControl = invoiceDocumentArray.at(index) as FormGroup | null; // Add null type
    if (invoiceDocumentControl) {
      const isDeletedControl = invoiceDocumentControl.get('IsDeleted');
      if (isDeletedControl) {
        isDeletedControl.setValue(true);
      }
    }
  }
  filterInvoice() {
    this.IsDocumentShow = false;
    const documents = [...this.InvoiceDetailForm.value.ListInvoiceDocuments];
    const filteredDocuments = documents.filter(document => document.IsDeleted !== null); 
    const listInvoiceDocumentsArray = this.InvoiceDetailForm.get('ListInvoiceDocuments') as FormArray;
    listInvoiceDocumentsArray.clear();
    filteredDocuments.forEach(document => {
      const documentGroup = this.fb.group({
        Id: document.Id,
        FileName: document.FileName,
        File: document.File,
        FilePath: document.FilePath,
        OriginalFileName: document.OriginalFileName,
        FileDate: document.Date,
        NewFileName: document.NewFileName,
        IsDeleted: document.IsDeleted
      });
      listInvoiceDocumentsArray.push(documentGroup);
    });
  }
  
  /**
   * remove the items
   * @param index
   */
  removeitem(index: any, item: any) {
    this.addItemslist.value.forEach((element: any) => {
      const removedItem = element;
      if (this.InvoiceGuid != '') {
        if(element.IsExpirable==false){
          this.expireDate = element.ExpiryDate.year + "-" + element.ExpiryDate.month + "-" + element.ExpiryDate.day
        }
        if (element.StockId == item.value.StockId) {
          element.ISDeleted = 1;
          element.ExpiryDate = this.expireDate;
          this.removedItems.push(removedItem)
        }
      }
      else {
        if (element.StockId == item.value.StockId) {
          element.ISDeleted = 1;
          this.removedItems.push(removedItem)
        }
      }
    })
    this.addItemslist.removeAt(index);
    const formArray = this.InvoiceDetailForm.get('ListGRNItems') as FormArray;
    const filteredArray = formArray.value.filter((obj: { TotalAmount: string; }) => obj.TotalAmount);
    const sumTotal = filteredArray.reduce((acc: any, obj: { TotalAmount: any; }) => acc + obj.TotalAmount, 0);
    this.InvoiceDetailForm.patchValue({
      NetTotal: sumTotal.toString().match(/^\d+(?:\.\d{0,2})?/)[0]
    })
    this.ChangePrice(0,'')
  }
  // /**
  //  * this event used to sum the GRN amount
  //  */
  // AddedTax() {
  //   const Frieght = this.InvoiceDetailForm.value.Frieght;
  //   const Octroi = this.InvoiceDetailForm.value.Octroi;
  //   const RoundOff = this.InvoiceDetailForm.value.RoundOff;
  //   this.FinalRate = Frieght + Octroi + RoundOff;
  // }
  /**
   * this event used to slect the Print Barcode
   */
  Click() {
    if (this.Isprintbarcode) {
      this.Isprintbarcode = true;
    }
    else {
      this.Isprintbarcode = false;
    }
    this.addItemslist.value.forEach((element: any, index: any) => {
      this.addItemslist.value.forEach((element: any, index: any) => {
        const barcodedetails = this.addItemslist.at(index)
        barcodedetails.patchValue({
          IsBarcodePrinted: this.Isprintbarcode
        });
      })
    })
  }


  matcher(event: any, value: any) {
    const input = event.target.value;
    const isRound = value === 'Round';

    if (isRound && !/^-?\d*\.?\d*$/.test(input + event.key)) {
      event.preventDefault();
    } else if (!isRound && !event.key.match(/[0-9.]/g)) {
      event.preventDefault();
    }
  }
  /**
   * this event used to restrict the relesed count
   * @param value
   * @param index
   */
  onReleasedCountChange(value: number, index: any) {
    const ItemId = this.InvoiceDetailForm.get('ListGRNItems')?.value[index].ItemId;
    const ReleasedCount = this.InvoiceDetailForm.get('ListGRNItems')?.value[index].ReleasedCount;
    const PurchaseOrderNo = this.InvoiceDetailForm.get('ListGRNItems')?.value[index].PurchaseOrderNo;
    const IndentNo = this.InvoiceDetailForm.get('ListGRNItems')?.value[index].IndentNumber;
    const StockGuid = this.InvoiceDetailForm.get('ListGRNItems')?.value[index].StockGuid;
    let OrderedQty = this.SupplierDetails.filter((item: { ItemId: string; PurchaseOrderNo: string, IndentNo: string }) => item.ItemId === ItemId && item.PurchaseOrderNo === PurchaseOrderNo && item.IndentNo === IndentNo);
    let GRNQty = this.Itemsdetails.filter((item: { ItemId: string; StockGuid: any }) => item.ItemId === ItemId && item.StockGuid === StockGuid);
    const addItemsList = this.InvoiceDetailForm.get('ListGRNItems') as FormArray;
    if(this.InvoiceGuid==''){
      const filteredItems = addItemsList?.controls.filter(control => {
        const item = control.value;
        return item.PurchaseOrderNo === PurchaseOrderNo && item.ItemId === ItemId && item.IndentNumber === IndentNo;
      });
      this.totalReleasedCount = filteredItems.reduce((sum, control) => {
        const releasedCount = parseFloat(control.value.ReleasedCount);
        return isNaN(releasedCount) ? sum : sum + releasedCount;
      }, 0);
    const releasedCountControl = this.InvoiceDetailForm.get('ListGRNItems.' + index + '.ReleasedCount');
    this.AllItems=filteredItems
      const listGRNItemsArray = this.AllItems;
    if (!value || value < 0 ) {
      releasedCountControl?.setValue(0)
    }
    else if ((OrderedQty[0]?.OrderedQty) <this.totalReleasedCount) {
      releasedCountControl?.setValue(0)
    }  
    else if ((OrderedQty[0]?.OrderedQty)==this.totalReleasedCount) {
      for (let index = 0; index < listGRNItemsArray.length; index++) {  
        listGRNItemsArray.at(index).get('IsButtonShow')?.setValue(false);
        }
    }
    else {
      releasedCountControl?.setValue(value);
      for (let index = 0; index < listGRNItemsArray.length; index++) {
        listGRNItemsArray.at(index).get('IsButtonShow')?.setValue(true);
        }
      }
  }
    else{
      this.AllItems=[]
      const EditfilteredItems = addItemsList?.controls.filter(control => {
        const item = control.value;
        return item.StockGuid === StockGuid && item.ItemId === ItemId;
      });
      this.totalReleasedCount = EditfilteredItems.reduce((sum, control) => {
        return sum + control.value.ReleasedCount;
      }, 0);
        const releasedCountControl = this.InvoiceDetailForm.get('ListGRNItems.' + index + '.ReleasedCount');
        this.AllItems=EditfilteredItems
      const listGRNItemsArray = this.AllItems;
      if (!value || value < 0 ) {
        releasedCountControl?.setValue(0)
      }
      else if ((GRNQty[0]?.ReleasedCount) <this.totalReleasedCount) {
        releasedCountControl?.setValue(0)
      } 
      else if ((GRNQty[0]?.ReleasedCount)==this.totalReleasedCount) {
        for (let index = 0; index < listGRNItemsArray.length; index++) {  
          listGRNItemsArray.at(index).get('IsButtonShow')?.setValue(false);
        }
        }
      else {
        releasedCountControl?.setValue(value);
        for (let index = 0; index < listGRNItemsArray.length; index++) {
          listGRNItemsArray.at(index).get('IsButtonShow')?.setValue(true);
      }
    }
    }
    this.FormChanged = false
  }  
  /**
   * this event used to preview the invoice document
   * @param value
   */
  PreviewInvoice(value: any) {
    this.Document = value;
  }
  onDiscountChange(value: number, index: any) {
    const releasedCountControl = this.InvoiceDetailForm.get('ListGRNItems.' + index + '.DiscountPercentage');
    if (!value || value <= 0) {
      releasedCountControl?.setValue(this.SupplierDetails[index].DiscountPercentage)
    }
    else if (value > 101) {
      releasedCountControl?.setValue(this.SupplierDetails[index].DiscountPercentage);
    }
    else {
      releasedCountControl?.setValue(value);
    }
    this.FormChanged = false
  }
  getGRNStatus() {
    let DepotmentGuid =this.authservice.LoggedInUser.DEFAULTROLES.toLowerCase().includes('ADMIN'.toLowerCase()) && this.authservice.LoggedInUser.LOCATIONSGUID=='00000000-0000-0000-0000-000000000000' ?'00000000-0000-0000-0000-000000000000': this.authservice.LoggedInUser.LOCATIONSGUID.split(",")
    this.grnService.getGRN(this.pageNumber, this.rowCount, this.keyword, '', '', '', '', '', '', '', '', '', '', '',DepotmentGuid).subscribe(data => {
      this.grnstsatusList = data || [];
      this.change();
    },
      (err) => {
      });
  }
  /**
 * this event used to validation for invoice numbers
 * @param event
 */
  changeInvoice(event: any) {
    this.keyword = event.target.value;
    this.modelChanged.next(this.keyword);
    this.SpinnerCheck=true;
  }
  change():void {
    if (this.InvoiceGuid =='') {
      this.poNumber = this.InvoiceDetailForm.value.PONumber.map((po: { PurchaseOrderNo: any; }) => po.PurchaseOrderNo).join(',')
    }
    else {
      this.poNumber = this.InvoiceDetailForm.value.PONumber
    }
    const found = this.grnstsatusList.some((array1Item: { PurchaseOrderNo: any; InvoiceNo: any }) => {
      const purchaseOrderNumbers = array1Item.PurchaseOrderNo.split(',');
      const poNumbers = this.poNumber.split(',');
      const commonNumbers = purchaseOrderNumbers.filter((num: any) => poNumbers.includes(num));
      return commonNumbers.length > 0 && this.keyword === array1Item.InvoiceNo;
    });
    this.SpinnerCheck=false;

    if (found) {
      this.ISinvoice = 'Invoice number already exists!';
      this.Invoicevalid=true;
    }
    else{
      this.ISinvoice = '';
      this.Invoicevalid=false
    }
  }
  setFormChanged(){
   this.FormChanged=true
  }
  /**
   * this event used to Deselect PO number
   * @param event 
   */
  public onItemSelect(item: any) {
      this.addItemslist.clear();
      this.InvoiceDetailForm.patchValue({
        NetTotal:''
      });
  }
}