import { Component, ViewChild,TemplateRef, Injectable } from '@angular/core';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { ColumnMode } from '@swimlane/ngx-datatable';
import { PeoplesData, Person } from 'src/app/core/dummy-datas/peoples.data';
import { NgbDate, NgbCalendar, NgbDateParserFormatter, NgbModal, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { GrnService } from 'src/app/core/Services/grn.service';
import { GlobalService } from 'src/app/core/Services/global.service';
import { PurchaseOrderService } from 'src/app/core/Services/purchase-order.service';
import {  Subject, Subscription, debounceTime } from 'rxjs';
import * as html2pdf from 'html2pdf.js';
import { AuthenticationService } from 'src/app/core/Services/authentication.service';
import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { UserManagementService } from 'src/app/core/Services/user-management.service';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';

@Injectable()
export class CustomDateParserFormatter extends NgbDateParserFormatter {
  readonly DELIMITER = '-';
  parse(value: string): NgbDateStruct | null {
    if (value) {
      const date = value.split(this.DELIMITER);
      return {
        day: parseInt(date[0], 10),
        month: parseInt(date[1], 10),
        year: parseInt(date[2], 10),
      };
    }
    return null;
  }
  format(date: NgbDateStruct | null): string {
    if (date) {
      const day = date.day < 10 ? '0' + date.day : date.day;
      const month = date.month < 10 ? '0' + date.month : date.month;
      const year = date.year;
      return day + this.DELIMITER + month + this.DELIMITER + year;
    }
    return '';
  }
}

@Component({
  selector: 'app-grn-status',
  templateUrl: './grn-status.component.html',
  styleUrls: ['./grn-status.component.scss'],
  providers: [
    { provide: NgbDateParserFormatter, useClass: CustomDateParserFormatter },
  ],
})
export class GrnStatusComponent {
  [x: string]: any;
  @ViewChild(DatatableComponent) table: DatatableComponent;
  /*** Paginatin Option Starts ***/
  maxSize: number = 3;
  boundaryLinks: boolean = true;
  size: string = 'lg';
  /*** Paginatin Option Starts ***/
  shimmerVisible: boolean;
  hoveredDate: NgbDate | null = null;
  fromDate: NgbDate | null
  toDate: NgbDate | null
  rows: any[] = [];
  temp: any[] = [];
  people: Person[] = [];
  loadingIndicator = true;
  selectedSuppName: any;
  ColumnMode = ColumnMode;
  orderBy: any = '';
  grnstsatusList: any = [];
  itemOrder: any = '';
  SortType: string = '';
  keyword: string = '';
  pageNumber = 1;
  rowCount = 40;
  CenterLocationList: any = [];
  CenterLocationGuid: any = '';
  selectedStatuses: any = [] = []
  FromDate: any='';
  EndDate: any = '';
  pageSize: any = 40;
  totalCount: any;
  modelChanged = new Subject<string>();
  subscriptions: Subscription | any;
  itemOptionsPerPage: any = ['40', '80', '120', '160', '200', '240', '280', '320']
  itemsPerPage: any = 40;
  GRNdetails: any;
  UnparsedHtml: string = '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Supplier Quotation</title><style>table{border-collapse:collapse;border:1px solid #000}Item name table td,table th{border-bottom:1px solid #000;border-right:1px solid #000;padding:5px;text-align:left;word-wrap:break-word;word-break:break-all;font-size:10px}table tr:last-child td{border-bottom:none}p{margin:0}table tbody td,table thead th{word-break:break-word}</style></head><body><table style="text-align:center;table-layout:fixed" width="100%"><tbody><tr><td><div style="height:28px;display:flex;align-items:center;padding:20px 0"><img data-v-0e549244="" src="assets/images/YodaLIMSLogo.png" alt="Yoda LIMS"></div></td></tr></tbody></table><table style="table-layout:fixed;background-color:#ccc" width="100%"><tbody><tr><td style="font-weight:700;font-size:24px;text-align:center">Goods receipt note details</td></tr></tbody></table><table style="table-layout:fixed;background-color:#ccc" width="100%"><tbody><tr><td style="font-size:14px"><b>Goods receipt no:</b>%%Ledgertransactiono%%</td><td style="font-size:14px"><b>GRN Date:</b>%%GRNDate%%</td></tr></tbody></table><table style="table-layout:fixed;background-color:#ccc" width="100%"><tbody><tr><td style="font-size:14px"><b>Supplier name:</b>%%SupplierName%%</td><td style="font-size:14px"><b>Purchase order no:</b>%%PurchaseOrderNo%%</td><td style="font-size:14px"><b>Invoice No.:</b>%%InvoiceNo%%</td></tr></tbody></table><table style="table-layout:fixed" width="100%"><tbody><tr><td style="font-size:14px;color:red"><b>Location:</b>%%CenterLocation%%</td></tr></tbody></table><table style="table-layout:fixed" width="100%"><thead><tr><th>Chalan No.</th><th>Freight amount (₹)</th><th>Octroi amount (₹)</th><th>Gross amount (₹)</th><th>Discount amount (₹)</th><th>GST amount (₹)</th><th>Round off amount (₹)</th><th>Net amount (₹)</th></tr></thead><tbody><tr><td>%%ChalanNo%%</td><td>%%Freight%%</td><td>%%Octori%%</td><td>%%GrossAmount%%</td><td>%%DiscountOnTotal%%</td><td>%%TaxAmount%%</td><td>(₹) %%RoundOff%%</td><td>(₹) %%NetAmount%%</td></tbody></table><table style="table-layout:fixed" width="100%"><tbody><tr><td style="font-weight:700;font-size:12px;text-align:right">Total GRN amount in INR : %%NetTotalAmount%%</td></tr><tr><td style="font-size:12px"><b>Total amount in words:</b>%%TotalAmount%% rupees only</td></tr><tr></tr><tr></tr></tbody></table><table style="table-layout:fixed;background-color:#ccc;margin-top:20px" width="100%"><tbody><tr><td style="font-size:14px"><b>Item Details:</b></td></tr></tbody></table><table style="table-layout:fixed" width="100%"><thead><tr><th>S NO.</th><th>Item name</th><th>Vendor Item name</th><th>HSN code</th><th>Catalog no</th><th>Converter</th><th>Barcode</th><th>Batch number</th><th>Item rate</th><th>Order qty</th><th>Adjust qty</th><th>Adjust Reason</th><th>Discount %</th><th>CGST %</th><th>SGST %</th><th>IGST %</th><th>Discount amount (₹)</th><th>GST Amount (₹)</th><th>Buy Price (₹)</th><th>Net Amount (₹)</th></tr></thead><tbody><tr id="GRNItemDetails"><th>%%ItemId%%</th><th>%%ItemName%%</th><th>%%VendorItemName%%</th><th>%%HSNCode%%</th><th>%%CatalogNo%%</th><th>%%ConvEnter%%</th><th>%%Barcode%%</th><th>%%BatchNumber%%</th><th>%%ItemRate%%</th><th>%%OrderQuantity%%</th><th>%%AdjustQty%%</th><th>%%AdjustReason%%</th><th>%%Dicsountper%%</th><th>%%CGSTper%%</th><th>%%SGSTPer%%</th><th>%%IGSTper%%</th><th>%%DicsountAmount%%</th><th>%%GSTAmount%%</th><th>(₹) %%BuyPrice%%</th><th>(₹) %%ItemsNetAmount%%</th></tr><tr><td colspan="18" style="font-weight:700;font-size:16px">Total amount in INR : %%GRNAmount%%</td></tr></tbody><table style="table-layout:fixed" width="100%"><tbody><tr><td style="font-weight:700;font-size:10px">Created by: %%CreatedBy%%</td><td style="font-weight:700;font-size:10px">Checked by: %%CheckedByName%%</td><td style="font-weight:700;font-size:10px">Approved by: %%AppprovedByName%%</td><td style="font-weight:700;font-size:10px">Post by: %%PostByName%%</td><td style="font-weight:700;font-size:10px">Cancel by: %%CancelByName%%</td></tr></tbody></table></table><table style="table-layout:fixed;border:none;margin-top:50px" width="100%"><tbody><tr><td style="font-size:14px;border:none;padding:0;text-align:right"><b>Date:</b>%%GRNDownloadDate%%</td></tr><tr><td style="font-size:14px;border:none;padding:0;text-align:right">This is a computer generated document, hence signature is not required.</td></tr></tbody></table></body></html>'
  invoiceGuid: any = '';
  ItemsDetails: any = [];
  invoiceDocument: any = [];
  isMenuCollapsed: boolean = true;
  roles: any;
  UserGuid: any;
  viewitemDetails: any = [];
  satusList: any = [];
  isNoData: boolean;
  Iscancel: boolean;
  post: any = '';
  reason:string='';
  invoiceGuiddata:any=''
  Unpost: any = '';
  Cancel: any = '';
  status: any;
  itemOptionsOrders1: any = ['Post','Unpost','Cancel','Maker','Checked'];
  GRNList: any = [];
  removeFromDate: any = null;
  removeTodate: any = null;
  minDate: NgbDateStruct;
  selectedDate: NgbDateStruct;
  selecteFromDate: any = '';
  selecteToDate: any = '';
  MakerStatus: any='';
  ChekerStatus: any='';
  selectedStatus:any='';
  formattedDate: any;
  GRNnumber: any;
  allcheckbox: boolean=false;
  addItemslist: any;
  isChecked: boolean;
  PurchaseOrderGuid:any; 
  PurchaseOrderNo: any;
  GrnViewDetails:any;
  center:any='';
  invoiceDocuments:any=[];
  totalTaxAmount:any
  constructor(private calendar: NgbCalendar,
    public formatter: NgbDateParserFormatter,
    private grnService: GrnService,
    private globalService: GlobalService,
    private router: Router,
    private userManagementService: UserManagementService,
    private purchaseOrderService: PurchaseOrderService, private authservice: AuthenticationService, private modalService: NgbModal, private datepipe:DatePipe) {
    this.fromDate = calendar.getToday();
    this.toDate = calendar.getNext(calendar.getToday(), 'd', 10);
    this.fetch((data: any) => {
      this.temp = data;
      this.rows = data;
      // setTimeout(() => {
      //   this.loadingIndicator = false;
      // }, 1500);
    });
    this.subscriptions = new Subscription();
    this.modelChanged
      .pipe(debounceTime(1000))
      .subscribe((model: string) => {
        this.keyword = model
        this.getGRNStatus();
      });
  }

  ngOnInit(): void {
    let type = localStorage.getItem("Type");
    if(type == "Goods Receipt"){
      let pageNum = localStorage.getItem("pageNumber");
      this.pageNumber = pageNum ? parseInt(pageNum): 1;
      let PageCount = localStorage.getItem("PerPage");
      this.itemsPerPage =PageCount ? parseInt(PageCount): 40 ;
      this.rowCount =PageCount ? parseInt(PageCount): 40 ;
      localStorage.removeItem("Type");
      localStorage.removeItem("pageNumber");
      localStorage.removeItem("PerPage");
    }
    const AcurrentDate = new Date();
    this.formattedDate = this.datepipe.transform(AcurrentDate, 'dd-MMM-yyyy hh:mm a');
    this.UserGuid = localStorage.getItem('UserGuid')
    if (window.outerWidth < 480) {
      this.maxSize = 2;
      this.boundaryLinks = false;
      this.size = 'sm';
    }
    this.people = PeoplesData.peoples;
    this.SortType = 'desc';
    this.getGRNStatus();
    this.GetPurchaseOrderPostDefaults();
    this.roles = this.authservice.LoggedInUser.GRNROLES
    this.center=this.authservice.LoggedInUser.LOCATIONSGUID;
    this.LoggedInUserGuid=this.authservice.LoggedInUser.UserGuid
    this.GetAllUsersList()
    const currentDate = new Date();
    this.selectedDate = { year: currentDate.getFullYear(), month: currentDate.getMonth() + 1, day: currentDate.getDate() };
  }

  fetch(cb: any) {
    const req = new XMLHttpRequest();
    req.open('GET', `assets/data/grn.json`);

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

  onDateSelection(date: NgbDate) {
    if (!this.fromDate && !this.toDate) {
      this.fromDate = date;
    } else if (this.fromDate && !this.toDate && date && date.after(this.fromDate)) {
      this.toDate = date;
    } else {
      this.toDate = null;
      this.fromDate = date;
    }
  }

  isHovered(date: NgbDate) {
    return this.fromDate && !this.toDate && this.hoveredDate && date.after(this.fromDate) && date.before(this.hoveredDate);
  }

  isInside(date: NgbDate) {
    return this.toDate && date.after(this.fromDate) && date.before(this.toDate);
  }

  isRange(date: NgbDate) {
    return date.equals(this.fromDate) || (this.toDate && date.equals(this.toDate)) || this.isInside(date) || this.isHovered(date);
  }

  validateInput(currentValue: NgbDate | null, input: string): NgbDate | null {
    const parsed = this.formatter.parse(input);
    return parsed && this.calendar.isValid(NgbDate.from(parsed)) ? NgbDate.from(parsed) : currentValue;
  }
  openXlModal(content: TemplateRef<any>) {
    this.modalService.open(content, { backdrop: 'static', keyboard: false, size: 'xl' }).result.then((result) => {
      console.log("Modal closed" + result);
    }).catch((res) => { });
  }
  openBasicModal(content: TemplateRef<any>) {
    this.modalService.open(content, { backdrop: 'static', keyboard: false ,size: 'md' }).result.then((result) => {
      console.log("Modal closed" + result);
    }).catch((res) => { });
  } 
  /**
   * this  service method is Get all GRN List
   */
  getGRNStatus() {
    let DepotmentGuid =this.authservice.LoggedInUser.DEFAULTROLES.toLowerCase().includes('ADMIN'.toLowerCase()) && this.authservice.LoggedInUser.LOCATIONSGUID=='00000000-0000-0000-0000-000000000000' ?'00000000-0000-0000-0000-000000000000': this.authservice.LoggedInUser.LOCATIONSGUID.split(",")
    // this.globalService.startSpinner();
    this.shimmerVisible=true;
    // this.grnstsatusList = [];E
    this.keyword = (this.keyword == undefined || this.keyword == null) ? this.keyword || "" : this.keyword;
    this.grnService.getGRN(this.pageNumber, this.rowCount, this.keyword, this.orderBy, this.SortType, this.CenterLocationGuid, this.selecteFromDate,
     this.selecteToDate, this.invoiceGuid,this.post,this.Unpost,this.Cancel,this.MakerStatus,this.ChekerStatus,DepotmentGuid).subscribe(data => {
      this.invoiceGuid=[];
      this.grnstsatusList = data || [];
      this.GRNList = data || [];
      this.grnstsatusList = this.GRNList;
      // this.globalService.stopSpinner();
      this.shimmerVisible=false;
      if (this.grnstsatusList.length > 0) {
        this.isNoData = false;
        this.Iscancel = false;
      }
      else {
        this.isNoData = true;
        this.Iscancel = true;
      }
      this.totalCount = data[0]?.TotalCount;;
    }, (err) => {  
      this.shimmerVisible=false;
    })
  }
  /**
   * this service call used to get the center locations
   */
  GetPurchaseOrderPostDefaults() {
    let DepotmentGuid =this.authservice.LoggedInUser.DEFAULTROLES.toLowerCase().includes('ADMIN'.toLowerCase())  && this.authservice.LoggedInUser.LOCATIONSGUID=='00000000-0000-0000-0000-000000000000' ?'00000000-0000-0000-0000-000000000000': this.authservice.LoggedInUser.LOCATIONSGUID.split(",")
    // this.globalService.startSpinner();
    this.shimmerVisible=true;
    this.purchaseOrderService.GetPurchaseOrderPostDefaults(DepotmentGuid).subscribe(data => {
      this.CenterLocationList = data.Result.LstCenterLocationType;
      this.globalService.stopSpinner();
    },
      (err) => {
        this.globalService.stopSpinner();
      });
  }
  /**
   * this change event used to change the locations
   * @param event 
   */
  change(event: any) {
    this.CenterLocationGuid = '';
    if (event) {
      this.CenterLocationGuid = event.CenterLocationGuid;
    }
    this.getGRNStatus();
  }
  /**
  * this change event used to StartDate
  * @param event 
  */
  // SatrtDateSelect(event: any) {
  //   let finalDate = event.year + "-" + event.month + "-" + event.day;
  //   this.minDate = event
  //   this.FromDate = finalDate;
  //   if (this.FromDate != '' && this.EndDate != '') {
  //     this.getGRNStatus();
  //   }
  // }
  selectFromDate(event: any) {
    this.removeTodate = null
    this.minDate = event
    this.FromDate = event.day + "-" + event.month + "-" + event.year;
    this.selecteFromDate = event.year + "-" + event.month + "-" + event.day
      this.getGRNStatus();
  }
  /**
   * this change event used to change the EndDate
   * @param event 
   */
  // EndDateSelect(event: any) { 
  //   let finalDate = event.year + "-" + event.month + "-" + event.day;
  //   this.minDate = event
  //   this.EndDate = finalDate;
  //   if (this.FromDate != '' && this.EndDate != '') {
  //     this.getGRNStatus();

  //   }
  // }
  selectToDate(event: any) {
    // this.minDate = event
    this.EndDate = event.day + "-" + event.month + "-" + event.year;
    this.selecteToDate = event.year + "-" + event.month + "-" + event.day
    this.getGRNStatus()
  }
  /**
   * this change event change the row number
   * @param rowNo 
   */
  ChangeEvent(rowNo: any) {
    this.itemsPerPage = rowNo.target.value;
    this.rowCount = rowNo.target.value;
    localStorage.setItem("PerPage" , rowNo.target.value);
    this.pageNumber = 1;
    this.getGRNStatus();
  }
  /**
   * this change event to chanege search
   * @param event 
   */
  changeSearch(event: any) {
    this.pageNumber = 1;
    this.pageSize = 40;
    this.modelChanged.next(event.target.value);
  }
  /**
   * this change event to chage the page number
   * @param event 
   */
  ChangePagenumber(event: any) {
    this.pageNumber = event;
    localStorage.setItem("pageNumber" , event);
    this.getGRNStatus();
  }
  /**
   * this service method used to post the GRN
   * @param Guid 
   */
  UpdateGRNPostStatus() {
    let input = {
      invoiceGuid: this.invoiceGuid,
      isPost: true,
      UserGuid: this.UserGuid,
      UnpostReason:this.reason
    }
    this.globalService.startSpinner();
    this.grnService.UpdateGRNPostStatus(input).subscribe(
      (data) => {
        this.invoiceGuid='';
        this.getGRNStatus();
        this.globalService.stopSpinner();
        this.reason=''
        this.UserGuid=this.LoggedInUserGuid;
      },
      (err) => {
        this.globalService.stopSpinner();
      });
  }
  /**
   * this service method used to Cancel the GRN
   * @param Guid 
   */
  UpdateGRNCancel() {   
    let input = {
      invoiceGuid: this.invoiceGuid,
      iscancel: true,
      UserGuid: this.UserGuid
    }
    this.globalService.startSpinner();
    this.grnService.UpdateGRNCancel(input).subscribe(
      (data) => {
        this.invoiceGuid=''
        this.getGRNStatus();
        this.globalService.stopSpinner();
      },
      (err) => {
        this.globalService.stopSpinner();
      });
  }
  /**
   * this service method used to change the GRN Aprove status
   * @param Guid 
   * @param status 
   */
  UpdateGRNStatus(Guid: any, status: any) {
    debugger
    this.invoiceGuid = Guid 
    this.status = status !== undefined ? status : this.status;
    let input = {
      invoiceGuid:this.invoiceGuid,
      Status: this.status,
      UserGuid: this.UserGuid,
      ApproveReason: this.status != "Checker" ? this.reason : '',
      CheckedReason: this.status == "Checker" ? this.reason : '' 
    }
    this.globalService.startSpinner();
    this.grnService.UpdateGRNStatus(input).subscribe(
      (data) => {
        this.invoiceGuid=''
        this.reason = ''
        this.getGRNStatus();
        this.globalService.stopSpinner();
        this.UserGuid=this.LoggedInUserGuid;
      },
      (err) => {
        this.globalService.stopSpinner();
      });
  }
  UpdateStatus() {
    this.UpdateGRNStatus(this.invoiceGuiddata, this.status);
  }
  Changestaus(Guid: any, status: any) {
    this.invoiceGuiddata = Guid;
    this.status = status;
    this.grnService.GetEditGRNdetails(this.invoiceGuiddata).subscribe(data => {
      this.GRNdetails = data.listGetEditGRNdetails || [];
      this.reason=''
      // console.log("GRNdetails",this.GRNdetails)
      // if(status=="Checker"){
      //   this.UserGuid=this.GRNdetails[0].UserGuid

      // }
      // else if(status=="Aproved"){
      //   this.UserGuid=this.GRNdetails[0].ChekedByUser

      // }
      // else{
      //   this.UserGuid=this.GRNdetails[0].AprovedByUser
      // }
    })
  }
  DownloadPdf(invoiceGuid: any, status: any, print: any) {
    this.invoiceGuid = invoiceGuid ? invoiceGuid : this.invoiceGuid;
    const doc = new jsPDF({ orientation: 'landscape' });
  
    this.grnService.GetEditGRNdetails(this.invoiceGuid).subscribe(data => {
      let grnstsatusList = data.listGetEditGRNdetails || [];
      let ItemsDetails = data.listitemsDetails || [];
      this.invoiceDocument = data.listinvoiceDocuments || [];
  
      let totalPrice = grnstsatusList[0].NetAmount.toString().match(/^\d+(?:\.\d{0,2})?/);
      let totalItemAmount = ItemsDetails.reduce((total : any, item : any) => total + Number(item.TotalAmount), 0).toString();
      let myInt = Math.floor(Number(totalPrice));
      const numWords = require('num-words');
      const amountInWords = numWords(myInt);
  
      const headerColStyles = {
        fontSize: 8,
        fillColor: '#00435d',
        textColor: '#fff',
        lineColor: '#fff',
        minCellWidth : 10
      };

      const mainTableColStyles={
        ...headerColStyles,
        cellWidth : 14.5
      }
  
      const footerRowStyles = {
        fontSize: 8,
        fillColor: '#00435d',
        textColor: '#fff',
        lineColor: '#fff',
      };
  
      function createHeaderCols() {
        return [
          { content: 'S.No', styles: { ...mainTableColStyles,cellWidth : 8} },
          { content: 'Item Name', styles: { ...mainTableColStyles,cellWidth : 20 } },
          { content: 'Vendor Item Name', styles: { ...mainTableColStyles,cellWidth : 20 } },
          { content: 'HSN code', styles: { ...mainTableColStyles } },
          { content: 'Catalog No', styles: { ...mainTableColStyles } },
          { content: 'Converter', styles: { ...mainTableColStyles,cellWidth : 10 } },
          { content: 'Barcode', styles: { ...mainTableColStyles } },
          { content: 'Batch Number', styles: { ...mainTableColStyles } },
          { content: 'Item rate', styles: { ...mainTableColStyles } },
          { content: 'Order qty', styles: { ...mainTableColStyles } },
          { content: 'Adjust qty', styles: { ...mainTableColStyles } },
          { content: 'Adjust reason', styles: { ...mainTableColStyles } },
          { content: 'Discount %', styles: { ...mainTableColStyles } },
          { content: 'CGST%', styles: { ...mainTableColStyles } },
          { content: 'SGST%', styles: { ...mainTableColStyles } },
          { content: 'IGST%', styles: { ...mainTableColStyles } },
          { content: 'Discount Amount', styles: { ...mainTableColStyles } },
          { content: 'GST Amount', styles: { ...mainTableColStyles, fontSize: 7 } },
          { content: 'Buy Price', styles: { ...mainTableColStyles } },
          { content: 'Net Amount', styles: { ...mainTableColStyles } },
        ];
      }
  
      function createBodyRows() {
        let bodyRows = [];
        for (let i = 0; i < ItemsDetails.length; i++) {
          bodyRows.push([
            { content: String(i + 1), styles: { minCellWidth: 5 , fontSize : 8} },
            { content: ItemsDetails[i].ItemName, styles: { minCellWidth: 30,fontSize : 8 } },
            { content: ItemsDetails[i].VendorItemName || 'N/A', styles: { minCellWidth: 30,fontSize : 8 } },
            { content: ItemsDetails[i].HsnCode || 'N/A', styles: { minCellWidth: 15,fontSize : 8 } },
            { content: ItemsDetails[i].CatalogNo || 'N/A', styles: { minCellWidth: 20,fontSize : 8 } },
            { content: ItemsDetails[i].Converter || '', styles: { minCellWidth: 10,fontSize : 8 } },
            { content: ItemsDetails[i].BarcodeNo || 'N/A', styles: { minCellWidth: 15,fontSize : 8 } },
            { content: ItemsDetails[i].BatchNumber || '', styles: { minCellWidth: 15,fontSize : 8 } },
            { content: ItemsDetails[i].Rate.toString().match(/^\d+(?:\.\d{0,2})?/) || '', styles: { minCellWidth: 15,fontSize : 8 } },
            { content: ItemsDetails[i].ReleasedCount || '', styles: { minCellWidth: 10,fontSize : 8 } },
            { content: ItemsDetails[i].AdjustQty || 'N/A', styles: { minCellWidth: 10,fontSize : 8 } },
            { content: ItemsDetails[i].AdjustReason || 'N/A', styles: { minCellWidth: 30,fontSize : 8 } },
            { content: ItemsDetails[i].DiscountPer || '0', styles: { minCellWidth: 15,fontSize : 8 } },
            { content: ItemsDetails[i].CGSTPer || '0', styles: { minCellWidth: 15,fontSize : 8 } },
            { content: ItemsDetails[i].SGSTPer || '', styles: { minCellWidth: 15,fontSize : 8 } },
            { content: ItemsDetails[i].IGSTPer || '0', styles: { minCellWidth: 15,fontSize : 8 } },
            { content: ItemsDetails[i].DiscountAmount.toString().match(/^\d+(?:\.\d{0,2})?/) || '', styles: { minCellWidth: 15,fontSize : 8 } },
            { content: ItemsDetails[i].TaxAmount.toString().match(/^\d+(?:\.\d{0,2})?/) || '', styles: { minCellWidth: 15,fontSize : 8 } },
            { content: ItemsDetails[i].UnitPrice.toString().match(/^\d+(?:\.\d{0,2})?/) || '', styles: { minCellWidth: 15,fontSize : 8 } },
            { content: ItemsDetails[i].TotalAmount.toString().match(/^\d+(?:\.\d{0,2})?/) || '', styles: { minCellWidth: 15,fontSize : 8 } }
          ]);
        }
        return bodyRows;
      }
  
      function createFooter(page: any) {
        return [
          {
            content: page,
            colSpan: createHeaderCols().length,
            styles: { ...footerRowStyles },
          },
        ];
      }
  
      const imageUrl = 'https://yoda-task-manager.s3.ap-south-1.amazonaws.com/users/profile/verificationdocuments/yodalimslogo.png';
      const imageWidth = 110;
      const imageHeight = 15;
      const imageXPos = 100;
      const imageYPos = 5;
  
      doc.addImage(imageUrl, 'PNG', imageXPos, imageYPos, imageWidth, imageHeight);
  
      let cursorY1 = imageYPos + imageHeight + 5;
      const tableWidth = 290;

      function createSecondaryImg() {
        const imageWidth = 70;
        const imageHeight = 10;
        const imageXPos = 220;
        const imageYPos = 8;
        doc.addImage(imageUrl, 'PNG', imageXPos, imageYPos, imageWidth, imageHeight);
      }

      function createPageFooter() {
        const currentDate = new Date();
        const formattedDate = currentDate.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'long',
          year: 'numeric'
        }).replace(/ /g, '-');
        const text = `Date: ${formattedDate}\nThis is computer generated document, hence signature is not required.`;
        const xPos = 290;
        const yPos = 190;
        doc.text(text, xPos, yPos, { align: 'right' }).setFontSize(8);
      }
  
      function createTitle(yPos: any) {
        const headline1Content = 'Goods Receipt Note Details';
        const headline1XPos = 3;
        const headline1YPos = imageYPos + 5 - yPos;
        const headline1FontSize = 10;
        return doc.text(headline1Content, headline1XPos, headline1YPos).setFontSize(headline1FontSize);
      }
  
      let GRNDate = this.datepipe.transform(grnstsatusList[0].GRNDate, 'dd-MMM-yyyy');
      function createSubTitle(yPos: any) {
        const grnDate = GRNDate;
        const headline2Content = `Goods Receipt No: ${grnstsatusList[0].LedgerTransactionNo}\nGRN Date: ${grnDate}`;
        const headline2XPos = 3;
        const headline2YPos = imageYPos + 20 - yPos;
        const headline2FontSize = 10;
        return doc.text(headline2Content, headline2XPos, headline2YPos).setFontSize(headline2FontSize);
      }
  
      function generateGRNTable() {
        return autoTable(doc, {
          head: [
            [{ content: 'Goods Receipt Notes Details', colSpan: 6, styles: { ...headerColStyles, fontSize: 14, fontStyle: 'bold', halign: 'center', lineWidth: { bottom: 1 } } }],
            [
              { content: 'Goods Receipt No', styles: { ...headerColStyles } },
              { content: 'GRN Date', styles: { ...headerColStyles } },
              { content: 'Supplier Name', styles: { ...headerColStyles } },
              { content: 'Purchase Order No', styles: { ...headerColStyles , cellWidth : 60} },
              { content: 'Invoice No', styles: { ...headerColStyles } },
              { content: 'Location', styles: { ...headerColStyles } },
            ],
          ],
          body: [
            [
              { content: grnstsatusList[0].LedgerTransactionNo },
              { content: GRNDate },
              { content: grnstsatusList[0].SupplierName },
              { content: grnstsatusList[0].PurchaseOrderNo },
              { content: grnstsatusList[0].InvoiceNo },
              { content: grnstsatusList[0].Location },
            ],
          ],
          startY: cursorY1,
          theme: 'grid',
          tableWidth: tableWidth,
          margin: { left: 3 },
        });
      }
  
      function generateChalanTable() {
        return autoTable(doc, {
          head: [
            [
              { content: 'Chalan No', styles: { ...headerColStyles } },
              { content: 'Freight Amount', styles: { ...headerColStyles } },
              { content: 'Octroi Amount', styles: { ...headerColStyles } },
              { content: 'Gross Amount', styles: { ...headerColStyles } },
              { content: 'Discount Amount', styles: { ...headerColStyles } },
              { content: 'GST Amount', styles: { ...headerColStyles } },
              { content: 'Round Off Amount', styles: { ...headerColStyles } },
              { content: 'Net Amount', styles: { ...headerColStyles } },
            ],
          ],
          body: [
            [
              { content: grnstsatusList[0].ChalanNo || 'N/A' },
              { content: grnstsatusList[0].Freight },
              { content: grnstsatusList[0].Octori },
              { content: grnstsatusList[0].GrossAmount.toString().match(/^\d+(?:\.\d{0,2})?/) || '0' },
              { content: grnstsatusList[0].DiscountOnTotal.toString().match(/^\d+(?:\.\d{0,2})?/) || '0' },
              { content: totalItemAmount.toString().match(/^\d+(?:\.\d{0,2})?/) || '0' },
              { content: grnstsatusList[0].RoundOff || '0' },
              { content: grnstsatusList[0].NetAmount.toString().match(/^\d+(?:\.\d{0,2})?/) || '0' },
            ],
          ],
          foot: [
            [
              {
                content: `Total Amount in Words: ${amountInWords}`,
                colSpan: 4,
                styles: { fillColor: '#fff', textColor: '#000000', lineWidth: 0.1, lineColor: '#cecece' },
              },
              {
                content: `Total GRN Amount in INR: ${grnstsatusList[0].NetAmount.toString().match(/^\d+(?:\.\d{0,2})?/) || '0'}`,
                colSpan: 4,
                styles: { fillColor: '#fff', textColor: '#000000', lineWidth: 0.1, lineColor: '#cecece' },
              },
            ],
          ],
          theme: 'grid',
          tableWidth: tableWidth,
          // startY: cursorY2,
          margin: { left: 3 },
        });
      }
      function createMainTableFooter() {
        return [
          [{content: `Total  amount in INR : ${grnstsatusList[0].NetAmount.toString().match(/^\d+(?:\.\d{0,2})?/) || '0'}`,colSpan: 20,styles : {...footerRowStyles,lineWidth: { bottom: 1 }}}],
          [
          {content : `Created by : ${grnstsatusList[0].MakerByName ||''}`,colSpan: 4,styles : {...footerRowStyles} },
          {content : `Checked by : ${status==1||status==2?grnstsatusList[0].ChekedByName:""}`,colSpan: 4,styles : {...footerRowStyles} },
          {content : `Approved by : ${status==2?grnstsatusList[0].AprovedByName ||'':"N/A"}` ,colSpan: 4,styles : {...footerRowStyles} },
          {content : `Post by : ${grnstsatusList[0].PostedByName ||''}`,colSpan: 4,styles : {...footerRowStyles} },
          {content : `Cancel by : ${grnstsatusList[0].CancelByName ||''}` ,colSpan: 4,styles : {...footerRowStyles}}
         ] 
        ]
      }
  
      function generateMainTable() {
        return autoTable(doc, {
          head: [createHeaderCols()],
          body: createBodyRows(),
          foot : createMainTableFooter(),
          // startY: cursorY3,
          theme: 'grid',
          tableWidth: tableWidth,
          margin: { left: 3, top: 30 },
          willDrawPage: (data) => {},
          didDrawPage: (data) => {
            const yPos = data.pageNumber > 1 ? 30 : 5;
            if (data.pageNumber > 1) {
              createTitle(0);
              createSubTitle(8);
              createSecondaryImg();
            }
          },
        });
      }
  
      generateGRNTable();
      generateChalanTable();
      generateMainTable();
      createPageFooter();
  
      let dateObj = new Date(grnstsatusList[0].GRNDate);
      let day = String(dateObj.getDate()).padStart(2, '0');
      let month = String(dateObj.getMonth() + 1).padStart(2, '0');
      let year = String(dateObj.getFullYear());
      let formattedDate = day + month + year;
      if (print !== "") {
        const pdfOutput = doc.output('bloburl');
        const printWindow :any = window.open(pdfOutput);
        setTimeout(() => {
          printWindow.print();
        }, 250);
      } else {
        doc.save(`GRN-Report-${grnstsatusList[0].LedgerTransactionNo}_${grnstsatusList[0].SupplierCode}_${formattedDate}.pdf`);
      }
    });
  
    this.invoiceGuid = '';
    this.getGRNStatus();
  }
  
  
  ViewGRN(item: any) {
    this.GrnViewDetails = item;
    this.invoiceGuid =item.Guid;
    this.GRNnumber=item.LedgerTransactionNo;
    this.status=item.Status;
    this.globalService.startSpinner();
    this.grnService.GetEditGRNdetails(this.invoiceGuid).subscribe(data => {
      this.satusList = data.listGetEditGRNdetails || [];
      this.viewitemDetails = data.listitemsDetails || [];
      this.invoiceDocuments = data.listinvoiceDocuments || [];

      this.totalTaxAmount = this.viewitemDetails?.reduce((acc: number, element: any) => {
        let itemTotal: number;
        if (element?.IGSTPer > 0) {
          itemTotal = element?.ReleasedCount * 
                      (element?.Rate - (element?.Rate * element?.DiscountPer * 0.01)) * 
                      (element?.IGSTPer * 0.01);
        } else {
          itemTotal = element?.ReleasedCount * 
                      (element?.Rate - (element?.Rate * element?.DiscountPer * 0.01)) * 
                      ((element?.SGSTPer + element?.CGSTPer) * 0.01);
        }
        return acc + itemTotal;
      }, 0);
      this.globalService.stopSpinner();
    },
      (err) => {
        this.globalService.stopSpinner();
      });
  }
  getStatus(event:any){
    localStorage.setItem("GrnStatus",event.StatusName)
  }
  GetAllUsersList() {
    this.userManagementService.getUsersList(this.center).subscribe((data:any) => {
      this.userList = data;
    }, 
    (err: HttpErrorResponse) => {
      //console.log("err")
    })
  }
  onUserGuidChange(newUserGuid: any): void {
    this.UserGuid=newUserGuid.UserGuid
  }
  FiltersCheck(event: any) {
    if (event.length > 0) {
      if (event == "Cancel") {
        this.globalService.startSpinner();
        this.grnstsatusList = this.GRNList.filter((item: { Iscancel: boolean; }) => item.Iscancel == true);
        this.globalService.stopSpinner();
      }
      if (event == "Post") {
        this.globalService.startSpinner();
        this.grnstsatusList = this.GRNList.filter((item: { IsPost: boolean; }) => item.IsPost == true);
        this.globalService.stopSpinner();
      }
      if (event == "UnPost") {
        this.globalService.startSpinner();
        this.grnstsatusList = this.GRNList.filter((item: { IsPost: boolean; }) => item.IsPost == false || null);
        this.globalService.stopSpinner();
      }
    }
    else {
      this.grnstsatusList = this.GRNList
    }
  }
  onDataRemove() {
    this.FromDate = "";
    this.removeFromDate = null;
    this.removeTodate = null
    this.selecteFromDate = '';
    this.selecteToDate = '';
    this.selectedSuppName = null;
    this.CenterLocationGuid = ''
    this.selectedStatuses = [];
    this.Cancel=null;
    this.post=null;
    this.Unpost=null;
    this.MakerStatus=null;
    this.ChekerStatus=null; 
    this.selectedStatus='';
    this.getGRNStatus();
  }
  Getevent(event:any){
    this.Cancel='';
    this.post='';
    this.Unpost='';
    this.MakerStatus='';
    this.ChekerStatus='';
    if (event.target.value == "Cancel") {
     this.Cancel=event.target.value;
    }
    if (event.target.value == "Post") {
      this.post=event.target.value;
    }
    if (event.target.value == "Unpost") {
      this.Unpost=event.target.value;
    }
    if (event.target.value == "Maker") {
      this.MakerStatus=event.target.value;
    }
    if (event.target.value == "Checked") {
      this.ChekerStatus=event.target.value;
    }
    this.pageNumber=1;
    this.getGRNStatus();
  }
  SelectGRN(event:any){
    this.invoiceGuid=event.Guid?event.Guid:this.invoiceGuid;
    this.GRNnumber=event.LedgerTransactionNo;
  }  
  handleCheckboxChange(event:any){ 
    this.allcheckbox=true
      this.addItemslist.value.forEach((element: any) => {
      if(event.target.checked==true){
        element.IsSelected=true;  
        this.isChecked=true;            
      }
      else {
        element.IsSelected=false;   
        this.isChecked=false;            
   
      }
    }
  )
}
GetPoNumbers(event: any) {
  localStorage.setItem('PurchaseOrderNo', event.PurchaseOrderNo);
  localStorage.setItem('PurchaseOrderGuid', event.PurchaseOrderGuid);
  this.router.navigate(['/purchase-orders/po-view']); 
}
PreviewInvoice(value: any) {
  this.Document = value;
}
}
