import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { NgbDateParserFormatter, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { ColumnMode } from '@swimlane/ngx-datatable';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap'
import { QuotationService } from 'src/app/core/Services/quotation.service';
import { debounceTime, Subject, Subscription } from 'rxjs';
import { Router } from '@angular/router';
import * as html2pdf from 'html2pdf.js';
import { GlobalService } from 'src/app/core/Services/global.service';
import { HttpErrorResponse } from '@angular/common/http';
import { CustomDateParserFormatter } from 'src/app/core/Services/ngbdate-format.service';
import { DatePipe } from '@angular/common';
import { AuthenticationService } from 'src/app/core/Services/authentication.service';
import { Workbook } from 'exceljs';
import * as saveAs from 'file-saver';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
@Component({
  selector: 'app-all-quotations',
  templateUrl: './all-quotations.component.html',
  styleUrls: ['./all-quotations.component.scss'],
  providers: [
    { provide: NgbDateParserFormatter, useClass: CustomDateParserFormatter },
  ],
})
export class AllQuotationsComponent implements OnInit {

  @ViewChild(DatatableComponent) table: DatatableComponent;

  /*** Paginatin Option Starts ***/
  maxSize: number = 3;
  boundaryLinks: boolean = true;
  size: string = 'lg';
  /*** Paginatin Option Starts ***/
  shimmerVisible: boolean;
  rows: any[] = [];
  temp: any[] = [];
  loadingIndicator = true;
  selectedDate: NgbDateStruct;
  minDate: NgbDateStruct;
  ColumnMode = ColumnMode;
  supplierGuid: any = [] = []
  itemGuid: any = [] = []
  locationGuid: any = [] = []
  keyWords: any = '';
  fromDate: string = '';
  toDate: string = '';
  pageNumber: number = 1;
  pageSize: number = 40;
  orderBy: string = "";
  sortType: string = 'desc';
  quotationsList: any = [];
  quotationsListForExport : any =[];
  supplierDetails: any = [];
  Keyword: any = '';
  rowCount: number = 40;
  itemOrder: string = '';
  sort: string = '';
  allItems: any = [];
  locations: any = [];
  modelChanged = new Subject<string>();
  subscriptions: Subscription | any;
  quotationGuid: any = [];
  quotationDetails: any = [];
  allItemsList: any = [];
  supplierList: any = [];
  pageCount: number = -1;
  defaultData: any = [];
  itemsList: any = [];
  userGuid: any = null;
  quotationguid: any;
  status: boolean;
  itemOptionsPerPage = [40, 80, 120, 160, 200, 240, 280, 320];
  itemsPerPage = 40;
  totalCount: any;
  UnparsedHtml: string = '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Supplier Quotation</title><style>table{border-collapse:collapse;border:1px solid #000}table td,table th{border-bottom:1px solid #000;border-right:1px solid #000;padding:5px;text-align:left;word-wrap:break-word;word-break:break-all;font-size:10px}table tr:last-child td{border-bottom:none}p{margin:0}</style></head><body><table style="text-align:center;table-layout:fixed" width="100%"><tbody><tr><td><div class="logo"><img data-v-0e549244="" src="assets/images/YodaLIMSLogo.png" alt="Yoda LIMS"></div></td></tr></tbody></table><table style="table-layout:fixed;background-color:#ccc" width="100%"><tbody><tr><td style="font-weight:700;font-size:24px;text-align:center">Supplier Quotation</td></tr></tbody></table><table style="table-layout:fixed;background-color:#ccc" width="100%"><tbody><tr><td style="font-size:14px"><b>Quotation no:</b>%%QuotationNo%%</td></tr></tbody></table><table style="table-layout:fixed;background-color:#ccc" width="100%"><tbody><tr><td style="font-size:14px"><b>Supplier name:</b>%%SupplierName%%</td><td style="font-size:14px"><b>GST no:</b>%%SupplierGSTIN%%</td></tr></tbody></table><table style="table-layout:fixed" width="100%"><tbody><tr><td style="font-size:14px;color:red"><b>Center:</b>%%CenterName%%</td><td style="font-size:14px;color:red"><b>Location:</b>%%CenterLocation%%</td></tr></tbody></table><table style="table-layout:fixed" width="100%"><thead><tr><th>S. no.</th><th>Item</th><th>VendorItemName</th><th width="10%">HSN code</th><th width="10%">Catalog no.</th><th width="10%">Manufacturer</th><th>Rate ₹</th><th>Qty</th><th style="min-width:50px">Disc %</th><th style="min-width:50px">SGST%</th><th style="min-width:50px">CGST %</th><th style="min-width:50px">IGST %</th><th style="min-width:50px">Amount ₹</th></tr></thead><tbody><tr id="supllierQuotation"><td>%%ItemSNo%%</td><td>%%ItemName%%</td><td>%%VendorItemName%%</td><td>%%ItemHSN%%</td><td>%%ItemCatalog%%</td><td>%%ItemManufacture%%</td><td>%%ItemRate%%</td><td>%%ItemQty%%</td><td>%%ItemDisc%%</td><td>%%ItemSGST%%</td><td>%%ItemCGST%%</td><td>%%ItemIGST%%</td><td>%%ItemAmount%%</td></tr></tbody></table><table style="table-layout:fixed" width="100%"><tbody><tr><td style="font-weight:700;font-size:12px;text-align:right">Total amount in INR : %%totalINRAmount%%</td></tr><tr><td style="font-size:12px"><b>Total amount in words:</b>%%AmountinWords%% rupees only</td></tr><tr><td style="font-size:12px"><b>Total No. of items in words:</b>%%QTYinWords%%</td></tr><tr><td style="font-size:12px;color:red"><b>Terms & Conditions</b></td></tr><tr id="termsandconditionsdata"><td style="font-size:10px">%%Terms%%</td></tr></tbody></table><table style="width:100%;margin-top:50px"><thead><tr><th>Created By:%%CreatedBy%%</th><th>Checked By:%%CheckedBy%%</th><th>Approved By:%%ApprovedBy%%</th><th>Cancel By:%%CancelBy%%</th></tr></thead></table><div style="text-align:right;margin-top:2rem"><div><b>Date:</b>%%Date%%</div><div>This is a computer generated document, hence signature is not required.</div></div></body></html>'
  termsCondition: any = [];
  itemOptionsOrders1: any = [] =
    [{ status: "Created" }, { status: "Checked" }, { status: "Approved" },{ status: "Cancelled"}];
  approved: boolean = false;
  checked: boolean = false;
  created: boolean = false;
  removeFromDate: any = null
  removeTodate: any = null
  isMenuCollapsed: boolean = true;
  isFilterCheck:boolean=false
  deliveryState: any;
  deliveryLocationName: any;
  supplierStateName: any;
  QuotationGuid: any;
  locationList: any;
  quotationFilter: any;
  totalQuotationCount: any;
  isDisable: boolean = false;
  currentPage: any = 1;
  quotationPageChange: any = [];
  searchTerm: string = '';
  IsCancel:boolean=false;
  selectedStatus: any = [];
  itemOptionsOrders: any = [];
  SupplierName: any;
  noQuotationFound: boolean = false;
  QuotationViewDetails:any;
  roles: any;
  reason: string='';
  ApproveReason:any;
  CheckedReason:any;
  CancelReason:any;
  quotation:any;
  UserDetails : any
  modal: any;
  QuotationNo: any;
  IsActive:boolean=true;
  json2:any=[];
  changes:any=[]
  quotationLogDetails:any=[];
  activityHistoryArray:any=[];
  showActivity:boolean=false
  invoiceDocuments: any;
  Document: any;
  constructor(private modalService: NgbModal, private quotationService: QuotationService, private route: Router, private globalService: GlobalService, private datePipe: DatePipe, public authservice: AuthenticationService,) {
    this.fetch((data: any) => {
      this.rows = data;
    });
    this.subscriptions = new Subscription();
    this.modelChanged
      .pipe(debounceTime(1000))
      .subscribe(model => {
        this.keyWords = model
        this.getAllQuotationDetails()
      });
  }

  ngOnInit(): void {
    if (window.outerWidth < 480) {
      this.maxSize = 2;
      this.boundaryLinks = false;
      this.size = 'sm';
    }
    this.userGuid = localStorage.getItem('UserGuid');
    const currentDate = new Date();
    this.selectedDate = { day: currentDate.getDate(), month: currentDate.getMonth() + 1, year: currentDate.getFullYear() };
    this.getAllItemDetails()
    this.getpurchaseorderPostDefaults()
    this.getAllQuotationDetails()
    this.roles = this.authservice.LoggedInUser.QOROLES
  }

  fetch(cb: any) {
    const req = new XMLHttpRequest();
    req.open('GET', `assets/data/all-quotations.json`);

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
  openXlModal(content: TemplateRef<any>) {
    this.modalService.open(content, { size: 'xl' }).result.then((result) => {
      console.log("Modal closed" + result);
    }).catch((res) => { });
  }

  /**
   * 
   * @param row 
   * this event is used for search based on names changeSearch
   */
  changeSearch(event: any) {
    this.pageNumber = 1;
    this.pageSize = 40;
    this.modelChanged.next(event.target.value);
  }

  /**
   * 
   * @param row 
   * this method is used for getAllQuotationDetails
   */
  getAllQuotationDetails() {
    this.itemOptionsOrders = this.itemOptionsOrders1;
    this.selectedStatus = [];
    let DepotmentGuid =this.authservice.LoggedInUser.DEFAULTROLES.toLowerCase().includes('ADMIN'.toLowerCase()) && this.authservice.LoggedInUser.LOCATIONSGUID=='00000000-0000-0000-0000-000000000000' ? '00000000-0000-0000-0000-000000000000': this.authservice.LoggedInUser.LOCATIONSGUID.split(",")
    // this.globalService.startSpinner();
    this.shimmerVisible = true;
    this.quotationService.getAllQuotations(
      this.supplierGuid, this.itemGuid, this.locationGuid,
      this.keyWords, this.fromDate, this.toDate, this.pageNumber,
      this.pageSize, this.orderBy, this.sortType, this.created,
      this.checked, this.approved,DepotmentGuid
    ).subscribe(
      (data) => {
        this.quotationFilter = data.allQuotations;
        this.quotationsList = data.allQuotations;
        this.noQuotationFound = this.quotationsList == null;
        this.totalCount = data.TotalCount;
        this.totalQuotationCount = data.TotalCount;
        if ((this.fromDate && this.supplierGuid.length > 0) || (this.fromDate && this.locationGuid.length > 0) || (this.fromDate && this.itemGuid.length > 0)) {
          if (this.quotationsList != null) {
            const filteredQuotations = data.allQuotations.filter((quotation: any) => {
              const quotationDate = new Date(quotation.FromDate);
              //const quotationToDate = new Date(quotation.ToDate);

              return this.toDate ==''? quotationDate >=new Date(this.fromDate) :  quotationDate >= new Date(this.fromDate) && quotationDate <= new Date(this.toDate)});
            this.quotationsList = filteredQuotations
          }
        }
        // this.globalService.stopSpinner();
        this.shimmerVisible = false;
        if (this.locationGuid.length > 0 || this.itemGuid.length > 0 || this.fromDate || this.toDate) {
          if (this.supplierGuid.length === 0 && this.quotationsList != null) {
            const supplierList = this.quotationsList
              .map((obj: any) => this.defaultData.Result.LstQuotationSupplierType
                .filter((f: { SupplierGuid: any }) => f.SupplierGuid === obj.SupplierGuid))
              .flat()
              .filter((value: any, index: any, self: any) => self.indexOf(value) === index);
            this.supplierDetails = supplierList;
            this.itemOptionsOrders = this.filterItemOptionsOrdersByStatus();
            this.getQuotationByGuid('');
          } else {
            this.supplierDetails = []
            this.itemOptionsOrders = this.filterItemOptionsOrdersByStatus();
          }
        } else {
          this.supplierDetails = this.defaultData.Result?.LstQuotationSupplierType;
        }
        this.getQuotationByGuid('');
        this.searchTerm = '';
      },
      (err: HttpErrorResponse) => {
        // this.globalService.stopSpinner();
        this.shimmerVisible = false;
        this.noQuotationFound = true;
      }
    );
  }

  filterItemOptionsOrdersByStatus() {
    return this.quotationFilter
      .flatMap((data: any) => {
        let status: string;
        if (data.ApprovalStatus === '0') {
          status = 'Created';
        } else if (data.ApprovalStatus === '1') {
          status = 'Checked';
        } else if (data.ApprovalStatus === '2') {
          status = 'Approved';
        } else {
          return [];
        }
        return this.itemOptionsOrders1.filter((item: any) => item.status === status);
      })
      .filter((value: any, index: number, self: any[]) => self.indexOf(value) === index);
  }

  /**
   * 
   * @param row 
   * this method is used for getQuotationByGuid
   */
  getQuotationByGuid(row: any) {
    this.quotationGuid = []
    this.locationList = ""
    this.QuotationViewDetails = row
    this.deliveryState = row.DeliveryStateName
    this.deliveryLocationName = row.DeliveryLocationName
    this.supplierStateName = row.SupplierSateName
    if (row.QuotationGuid != undefined) {
      this.quotationGuid = row.QuotationGuid
    } else {
      if (this.supplierGuid.length > 0 || this.locationGuid.length > 0 || this.fromDate || this.toDate || this.itemGuid.length > 0) {
        this.quotationsList.forEach((Quotation: any) => {
          this.quotationGuid.push(Quotation.QuotationGuid)
        })
      }
    }
    this.quotationService.getQuotationsByGuid(this.quotationGuid).subscribe(data => {
      this.quotationDetails = data.getQuotationsResponses
      this.UserDetails=data.getQuotationsResponses[0]
      this.json2=data.quotationLogData
      this.invoiceDocuments=data.listinvoiceDocuments
      this.quotationDetails = data.getQuotationsResponses.filter((value: any, index: any, self: any) => {
        return index === self.findIndex((t: any) => (
          t.ItemGuid === value.ItemGuid
        ));
      })
      this.quotationLogDetails = this.quotationDetails
      this.removeDuplicateValuesFromArrays()
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
        this.locations = this.defaultData.Result?.LstQuotationCenterLocationType;
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

  /**
   * 
   * @param row 
   * this method is used for getpurchaseorderPostDefaults
   */
  getpurchaseorderPostDefaults() {
    let DepotmentGuid =this.authservice.LoggedInUser.DEFAULTROLES?.toLowerCase().includes('ADMIN'.toLowerCase()) && this.authservice.LoggedInUser?.LOCATIONSGUID=='00000000-0000-0000-0000-000000000000' ?'00000000-0000-0000-0000-000000000000': this.authservice.LoggedInUser.LOCATIONSGUID?.split(",")
    this.quotationService.getQuotationPostDefaults(DepotmentGuid).subscribe(data => {
      this.defaultData = data
      this.locations = data.Result.LstQuotationCenterLocationType
      this.supplierDetails = data.Result.LstQuotationSupplierType
    })
  }

  /**
   * 
   * @param row 
   * this method is used for getAllItemDetails
   */
  getAllItemDetails() {
    this.Keyword = (this.Keyword == undefined || this.Keyword == null) ? this.Keyword || "" : this.Keyword
    this.quotationService.getAllItems(this.pageCount, this.rowCount, this.Keyword, this.itemOrder, this.sort,this.IsActive).subscribe(data => {
      this.itemsList = data.Result.getAllItemsResponses;
      this.allItems = this.itemsList.filter((value: any, index: any, self: any) => {
        return index === self.findIndex((t: any) => (
          t.ItemGuid === value.ItemGuid || t.ItemName === value.ItemName
        ));
      })
      this.allItems = this.allItems.sort((a: any, b: any) => a.ItemName?.trim().localeCompare(b.ItemName.trim()));
    })
  }

  /**
   * 
   * @param row 
   * this method is used for onSupplierFilter
   */
  onSupplierFilter(supplier: any) {
    this.currentPage=1
    this.keyWords=''
    supplier.length==0?this.isDisable = false:this.isDisable = true
    this.supplierGuid = []
    if(supplier.length>0){
      this.supplierDetails.forEach((obj: any) => {
        supplier.forEach((obj1: any) => {
          if (obj.SupplierGuid == obj1.SupplierGuid) {
            this.supplierGuid.push(obj.SupplierGuid);
          }
        })
      })
    }
    
    this.getAllQuotationDetails()
  }


  /**
   * 
   * @param row 
   * this event is used for filter Items onItemFiilters
   */
  onItemFiilters(event: any) {
    this.isDisable = true
    this.itemGuid = []




    this.allItems.forEach((obj: any) => {
      event.forEach((res: any) => {
        if (obj.ItemGuid == res.ItemGuid) {
          this.itemGuid.push(obj.ItemGuid)
        }
      })
    })
    this.getAllQuotationDetails()
  }


  /**
   * 
   * @param row 
   * this event is used for filter Locations onlocationFiilters
   */
  onlocationFiilters(event: any) {
    this.isDisable = true
    this.locationGuid = []
    this.locations.forEach((obj: any) => {
      event.forEach((res: any) => {
        if (obj.CenterLocationGuid == res.CenterLocationGuid) {
          this.locationGuid.push(obj.CenterLocationGuid)
        }
      })
    })
    this.getAllQuotationDetails()
  }


  /**
   * 
   * @param row 
   * this event is used for selectFromDate
   */
  selectFromDate(event: any) {
    this.selectedStatus = []
    this.removeTodate = null
    this.minDate = event
    this.fromDate = event.year + "-" + event.month + "-" + event.day;
    this.getAllQuotationDetails()
  }
  onDataRemove() {
    this.selectedStatus = []
    this.fromDate = ""
    this.toDate = ""
    this.removeFromDate = null;
    this.removeTodate = null
    this.created = false
    this.checked = false
    this.approved = false
    this.getAllQuotationDetails()
  }

  /**
   * 
   * @param row 
   * this event is used for selectToDate
   */
  selectToDate(event: any) {
    this.selectedStatus = []
    this.minDate = event
    this.toDate = event.year + "-" + event.month + "-" + event.day;
    this.getAllQuotationDetails()
  }

  /**
   * 
   * @param row 
   * this click event is used for goToQuotationPage
   */
  goToQuotationPage() {
    this.route.navigateByUrl('/quotations/new-quotation');
  }

  /** Get All Data*/
  GetAllData(event: any) {
    this.pageNumber = event;
    this.getAllQuotationDetails();
  }

  ChangeEvent(rowNo: any) {
    this.pageNumber = 1
    this.itemsPerPage = rowNo.target.value;
    this.pageSize = rowNo.target.value;
    this.getAllQuotationDetails();
  }
  UpdateQuotationCancel() {
    let input = {
      QuotationGuid: this.quotationGuid,
      IsCancel: true,
      UserGuid: this.userGuid,
      CancelReason: this.reason,
      CheckedReason:this.CheckedReason,
      ApproveReason:this.ApproveReason
    }; 
    this.globalService.startSpinner();
    this.quotationService.updateQuotationsData(input).subscribe(
      (data: any) => {
        this.quotationGuid = '';
        this.globalService.stopSpinner();
        this.getAllQuotationDetails()
      },
      (err: any) => {
        this.globalService.stopSpinner();
      }
    );
  } 
  SelectQuotation(event:any){
    this.quotationGuid=event.QuotationGuid;
    this.QuotationNo=event.QuotationNo;
    this.CheckedReason=event.CheckedReason||'';
    this.ApproveReason=event.ApproveReason||''
  }  
  onUpdateStatus() {
    this.updateQuotationStatus()
  }
  updateQuotationStatus() {
    let input = {
      QuotationGuid: this.quotationGuid,
      UserGuid: this.userGuid,
      ApprovalStatus: this.status,
      ApproveReason: this.status == true ? this.reason : '',
      CheckedReason: this.status != true ? this.reason : ''
    }
    this.quotationService.updateQuotationsData(input).subscribe(data => {
      let updateData = data
      this.reason=''
      this.getAllQuotationDetails()
    })
    this.shimmerVisible = true;
    this.getAllQuotationDetails()
    this.shimmerVisible = false; 
  }
  submitReasonAndChangeStatus(QuotationGuid:any) {
    this. quotationguid = QuotationGuid;
    console.log('Submitted reason:', this.reason);
}
change(quotation:any,Status:any){
  this.quotationGuid=quotation.QuotationGuid
  this.status=Status
 }
 changeApproval(quotation:any,Status:any){
  this.quotationGuid=quotation
  this.status=Status
 }


  DownloadPdf(quotation: any, print: any) {
    const doc = new jsPDF({ orientation: 'landscape' });
    this.quotationService.getQuotationsByGuid(quotation.QuotationGuid).subscribe(data => {
      let quotationDetails = data.getQuotationsResponses
      let termsCondition = data.getTermsConditions  
      const selectedDeliveryLocationArray = quotationDetails[0].LocationName.split(',').filter((value: any, index: any, self: any) => self.indexOf(value) === index);
      const selectedCenterLocationArray = quotationDetails[0].CenterName.split(',').filter((value: any, index: any, self: any) => self.indexOf(value) === index);
      if (quotationDetails.length > 0) {
        quotationDetails = quotationDetails.filter((value: any, index: any, self: any) => {
          return index === self.findIndex((t: any) => (
            t.ItemGuid === value.ItemGuid
          ));
        })
        let count = quotationDetails.length
        count=count/1
  
         quotationDetails = quotationDetails.filter((value: any, index: any, self: any) => {
          return index === self.findIndex((t: any) => (
            t.ItemGuid === value.ItemGuid
          ));
        });
      
        let totalPrice = quotationDetails.reduce((acc: any, qou: { BuyPrice: any; }) => acc + qou.BuyPrice, 0);
      
        let myInt = Math.round(totalPrice);
        const numWords = require('num-words')
        const amountInWords = numWords(myInt)
        const numbWords = require('num-words')
        const numberInWords = numbWords(count)
        let textRedColor = '#ff0000'
  
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
          { content: 'S.No', styles: { ...mainTableColStyles,cellWidth : 10} },
          { content: 'Item Name', styles: { ...mainTableColStyles,cellWidth : 30 } },
          { content: 'Vendor Item Name', styles: { ...mainTableColStyles,cellWidth : 30 } },
          { content: 'Item Code', styles: { ...mainTableColStyles,cellWidth : 20 } },
          { content: 'Pack Size', styles: { ...mainTableColStyles,cellWidth : 10 } },
          { content: 'Purchased Unit', styles: { ...mainTableColStyles,cellWidth : 20 } },
          { content: 'HSN code', styles: { ...mainTableColStyles,cellWidth : 20 } },
          { content: 'Catalog No', styles: { ...mainTableColStyles,cellWidth : 20 } },
          { content: 'Manufacturer', styles: { ...mainTableColStyles,cellWidth : 20 } },
          { content: 'Department Type', styles: { ...mainTableColStyles,cellWidth : 20 } },
          { content: 'Rate', styles: { ...mainTableColStyles,cellWidth : 20 } },
          { content: 'Qty', styles: { ...mainTableColStyles,cellWidth : 10 } },
          { content: 'Disc %', styles: { ...mainTableColStyles,cellWidth : 10 } },
          { content: 'SGST %', styles: { ...mainTableColStyles,cellWidth : 10 } },
          { content: 'CGST %', styles: { ...mainTableColStyles,cellWidth : 10 } },
          { content: 'IGST %', styles: { ...mainTableColStyles,cellWidth : 10 } },
          { content: 'Amount', styles: { ...mainTableColStyles,cellWidth : 20 } },
        ];
      }
  
      function createBodyRows() {
        let bodyRows = [];
        for (let i = 0; i < quotationDetails.length; i++) {
          bodyRows.push([
            { content: String(i + 1), styles: { minCellWidth: 5 , fontSize : 8} },
            { content: quotationDetails[i].ItemName, styles: { minCellWidth: 30,fontSize : 8 } },
            { content: quotationDetails[i].VendorItemName || 'N/A', styles: { minCellWidth: 30,fontSize : 8 } },
            { content: quotationDetails[i].ItemCode || 'N/A', styles: { minCellWidth: 10,fontSize : 8 } },
            { content: quotationDetails[i].PackSize || 'N/A', styles: { minCellWidth: 10,fontSize : 8 } },
            { content: quotationDetails[i].PurchasedUnit || 'N/A', styles: { minCellWidth: 10,fontSize : 8 } },
            { content: quotationDetails[i].HSNCode?quotationDetails[i].HSNCode:'N/A', styles: { minCellWidth: 15,fontSize : 8 } },
            { content: quotationDetails[i].CatalogNo, styles: { minCellWidth: 20,fontSize : 8 } },
            { content: quotationDetails[i].ManufactureName || '', styles: { minCellWidth: 10,fontSize : 8 } },
            { content: quotationDetails[i].Department.trim() || '', styles: { minCellWidth: 10,fontSize : 8 } },
            { content: quotationDetails[i].Rate || 'N/A', styles: { minCellWidth: 15,fontSize : 8 } },
            { content: quotationDetails[i].Qty || '', styles: { minCellWidth: 10,fontSize : 8 } },
            { content: quotationDetails[i].DiscountPer || '', styles: { minCellWidth: 10,fontSize : 8 } },
            { content: quotationDetails[i].SGSTPer == 0 ? '--' : quotationDetails[i].SGSTPer, styles: { minCellWidth: 10,fontSize : 8 } },
            { content: quotationDetails[i].CGSTPer == 0 ? '--' : quotationDetails[i].CGSTPer, styles: { minCellWidth: 10,fontSize : 8 } },
            { content: quotationDetails[i].IGSTPer, styles: { minCellWidth: 10,fontSize : 8 } },
            { content: quotationDetails[i].BuyPrice, styles: { minCellWidth: 15,fontSize : 8 } },
          ]);
        }
        return bodyRows;
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
        const headline1Content = 'Supplier Quotation';
        const headline1XPos = 3;
        const headline1YPos = imageYPos + 5 - yPos;
        const headline1FontSize = 10;
        return doc.text(headline1Content, headline1XPos, headline1YPos).setFontSize(headline1FontSize);
      }
      function createSubTitle(yPos: any) {
        const headline2Content = `Quotation No: ${quotationDetails[0].QuotationNo || ''}`;
        const headline2XPos = 3;
        const headline2YPos = imageYPos + 20 - yPos;
        const headline2FontSize = 10;
        return doc.text(headline2Content, headline2XPos, headline2YPos).setFontSize(headline2FontSize);
      }
  
      function generateGRNTable() {
        return autoTable(doc, {
          foot: [
            [
              {
                content: `Quotation No: ${quotationDetails[0].QuotationNo}`,
                colSpan :2,
                styles: { fillColor: '#fff', textColor: '#000000', lineWidth: 0.1, lineColor: '#cecece' },
              },
            ],
            [
              {
                content: `Supplier Name: ${quotationDetails[0].SupplierName}`,
                styles: { fillColor: '#fff', textColor: '#000000', lineWidth: 0.1, lineColor: '#cecece' },
              },
              {
                content: `GST no: ${ quotationDetails[0].GSTNNo}`,
                styles: { fillColor: '#fff', textColor: '#000000', lineWidth: 0.1, lineColor: '#cecece' },
              },
            ],
            [
              {
                content: `Center: ${selectedDeliveryLocationArray.join(', ')}`,
                styles: { fillColor: '#fff', textColor: textRedColor, lineWidth: 0.1, lineColor: '#cecece' },
              },
              {
                content: `Location: ${selectedCenterLocationArray.join(', ')}`,
                styles: { fillColor: '#fff', textColor: textRedColor, lineWidth: 0.1, lineColor: '#cecece' },
              },
            ],
          ],
          startY: cursorY1,
          theme: 'grid',
          tableWidth: tableWidth,
          margin: { left: 3 },
        });
      }
      function createRowsForTemsAndConditions() {
        let bodyRows = [];
        for (let i = 0; i < termsCondition.length; i++) {
          bodyRows.push([
            { content: termsCondition[i].TermsCondition, styles: {fillColor: '#fff', textColor: '#000000', lineWidth: 0.1, lineColor: '#cecece', minCellWidth: 30,fontSize : 8} },
          ]);
        }
        return [
          [
            {
              content: `Total amount in INR: ${totalPrice}`,
              styles: { fillColor: '#fff', textColor: '#000000', lineWidth: 0.1, lineColor: '#cecece' },
            },
          ],
          [
            {
              content: `Total Amount in Words: ${amountInWords}`,
              styles: { fillColor: '#fff', textColor: '#000000', lineWidth: 0.1, lineColor: '#cecece' },
            },
          ],
          [
            {
              content: `Total No. of items in words: ${numberInWords}`,
              styles: { fillColor: '#fff', textColor: '#000000', lineWidth: 0.1, lineColor: '#cecece' },
            },
          ],
          [
            {
              content: `Terms & Conditions: `,
              styles: { fillColor: '#fff', textColor: textRedColor, lineWidth: 0.1, lineColor: '#cecece' },
            },
          ],
          ...bodyRows
        ];
      }
      function generateChalanTable() {
        return autoTable(doc, {
          foot: createRowsForTemsAndConditions(),
          theme: 'grid',
          tableWidth: tableWidth,
          margin: { left: 3 },
        });
      }
      function createUsersQuotationData() {
        return autoTable(doc, {
          body:  [
            [
            {content : `Created by : ${quotationDetails[0].CreatedBy }`,colSpan: 2,styles : {...footerRowStyles} },
            {content : `Checked by : ${quotation.ApprovalStatus=="0"||quotationDetails[0].CheckedByName == null?"Not Checked":quotationDetails[0].CheckedByName}`,colSpan: 2,styles : {...footerRowStyles} },
            {content : `Approved by : ${quotationDetails[0].ApprovedByName == null ? 'Not Approved' : quotationDetails[0].ApprovedByName || ''}` ,colSpan: 2,styles : {...footerRowStyles} },
            {content : `Cancel by : ${quotation.ApprovalStatus !== "2" ? quotationDetails[0].CancelByName : 'Not Cancelled'}`,colSpan: 2,styles : {...footerRowStyles} }
           ] 
          ],
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
  
      function generateMainTable() {
        return autoTable(doc, {
          head: [createHeaderCols()],
          body: createBodyRows(),
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
      generateMainTable();
      generateChalanTable();
      createUsersQuotationData()
      createPageFooter();
  
      let dateObj = new Date(quotationDetails[0].CreateDate); 
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
        doc.save(`supplier-quotation${quotationDetails[0].QuotationNo+"_"+quotationDetails[0].SupplierCode+"_"+formattedDate}.pdf`);
      }
  }
})
  }

  /**
      * Type :(click) Event Function
      *  This method is used  to FiltersCheck of manage jobs
      */
  FiltersCheck(value: any) {
    this.selectedStatus = value
    this.isDisable = false
    this.itemsPerPage = 40
    let createdData: any[] = [];
    let checkedData: any[] = [];
    let approvedData: any[] = [];
    let cancelledData:any[]=[];
    let filteredData: any[] = [];
    this.quotationsList = [];

    if (value.length > 0) {
      value.forEach((filter: any) => {
        if (filter == 'Created') {
          createdData = this.quotationFilter.filter((f: { ApprovalStatus: any }) => f.ApprovalStatus == 0 && filter == 'Created');
          filteredData = filteredData.concat(createdData);
        }
        if (filter == 'Checked') {
          checkedData = this.quotationFilter.filter((f: { ApprovalStatus: any,IsCancel:any }) => f.ApprovalStatus == 1&&f.IsCancel==false && filter == 'Checked');
          filteredData = filteredData.concat(checkedData);
        }
        if (filter == 'Approved') {
          approvedData = this.quotationFilter.filter((f: { ApprovalStatus: any }) => f.ApprovalStatus == 2 && filter == 'Approved');
          filteredData = filteredData.concat(approvedData);
        }
        if (filter == 'Cancelled') {
          cancelledData = this.quotationFilter.filter((f: any) => f.IsCancel == true );
          filteredData = filteredData.concat(cancelledData);
        }
      })
    } else {
      this.isDisable = false
      this.quotationsList = this.quotationFilter;
      this.totalCount = this.totalQuotationCount
    }
   filteredData.length == 0 && value.length > 0 ? this.isFilterCheck=true:this.isFilterCheck=false

    if (filteredData.length > 0) {
      this.quotationsList = filteredData;
      this.quotationPageChange = filteredData
      this.totalCount = this.quotationsList.length
    } 
    // else {
    //   this.isFilterCheck = true
    // }
  }

  DeleteQuotation() {
    this.globalService.startSpinner();
    this.quotationService.DeleteQuotation(this.QuotationGuid).subscribe((data: any) => {
      this.globalService.stopSpinner();
      this.getAllQuotationDetails()
    },
      (err: HttpErrorResponse) => {
        this.globalService.stopSpinner();
      })

  }

  applyPaginationAndFilter(): void {
    this.quotationsList = this.quotationPageChange.slice((this.currentPage - 1) * this.itemsPerPage, this.currentPage * this.itemsPerPage);
  }

  onPageChange(event: any): void {
    this.currentPage = event;
    this.applyPaginationAndFilter();
  }


  filterQuotation() {
    if (this.quotationPageChange.length > 0) {
      this.quotationsList = this.quotationPageChange.filter((item: any) => 
        item.ItemName.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    } else if (this.supplierGuid.length > 0 || this.locationGuid.length > 0 || this.itemGuid.length > 0) {
      this.quotationsList = this.quotationFilter.filter((item: any) => 
        item.ItemName.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
    this.noQuotationFound = this.quotationsList.length === 0;
}

  openBasicModal(content: TemplateRef<any>) {
    this.modalService.open(content, { backdrop: 'static', keyboard: false ,size: 'md' }).result.then((result: string) => {
      console.log("Modal closed" + result);
    }).catch((res: any) => { });
  }
  Delquotation(row: any) {
    this.SupplierName = row.SupplierName
    this.QuotationGuid = row.QuotationGuid
  }
  GetAllQuotationsExcel(){
    this.getAllQuotationsForExport()
  }
    /**
   * 
   * @param row 
   * this method is used for getAllQuotationsForExport
   */
    getAllQuotationsForExport() {
      this.itemOptionsOrders = this.itemOptionsOrders1;
      this.selectedStatus = [];
      let DepotmentGuid : any =this.authservice.LoggedInUser.DEFAULTROLES.toLowerCase().includes('ADMIN'.toLowerCase()) && this.authservice.LoggedInUser.LOCATIONSGUID=='00000000-0000-0000-0000-000000000000' ? '00000000-0000-0000-0000-000000000000': this.authservice.LoggedInUser.LOCATIONSGUID.split(",")
      this.shimmerVisible = true;
      this.quotationService.getAllQuotationsForExport(
        this.supplierGuid, this.itemGuid, this.locationGuid,
        this.keyWords, this.fromDate, this.toDate, -1,
        this.pageSize, this.orderBy, this.sortType, this.created,
        this.checked, this.approved,DepotmentGuid
      ).subscribe(
        (data) => {
          this.quotationsListForExport = data.allQuotations;
             this.downloadExcel();
            this.shimmerVisible = false;
        },
        (err: HttpErrorResponse) => {
          this.shimmerVisible = false;
          this.noQuotationFound = true;
        }
      );
    }
  downloadExcel() {
    const header = [ 'Quotation NO','From date','To date','Status','Supplier name','Supplier address','GSTN NO','DL count','Item name','Vendor Item Name','Manufacture Name','Item Cancel By','Item Cancel Date','Rate','Discount Amt','GST Amount','Buy price'];
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('Sharing Data');
    const headerRow = worksheet.addRow(header);
    headerRow.eachCell((cell : any, number : any) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFFF00' },
        bgColor: { argb: 'FF0000FF' }
      };
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    });
    worksheet.getColumn(1).width = 30;
    worksheet.getColumn(2).width = 20;
    worksheet.getColumn(3).width = 30;
    worksheet.getColumn(4).width = 30;
    worksheet.getColumn(5).width = 15;
    worksheet.getColumn(6).width = 30;
    worksheet.getColumn(7).width = 20;
    worksheet.getColumn(8).width = 20;
    worksheet.getColumn(9).width = 20;
    worksheet.getColumn(10).width = 30;
    worksheet.getColumn(11).width = 20;
    worksheet.getColumn(11).width = 30;
    worksheet.getColumn(11).width = 30;
    worksheet.getColumn(12).width = 20;
    worksheet.getColumn(13).width = 20;
    worksheet.getColumn(14).width = 20;
    this.quotationsListForExport.forEach((item: any) => {
      const row = worksheet.addRow([
        item.QuotationNo,
        this.datePipe.transform(item.FromDate,'dd-MM-yyyy'),
        this.datePipe.transform(item.ToDate,'dd-MM-yyyy'),
        item.ApprovalStatus== "0" ?'Maker':item.ApprovalStatus=="1"?'Checked':item.ApprovalStatus== "2"?'Approved':'',
        item.SupplierName,
        item.SupplierAddress,
        item.GSTNNo,
        item.DeliveryLocationCount,
        item.ItemName,
        item.VendorItemName ? item.VendorItemName : 'N/A',
        item.ManufactureName ? item.ManufactureName : 'N/A',
        item.ItemCancelBy,
        this.datePipe.transform(item.ItemCancelDate,'dd-MM-yyyy'),
        item.Rate,
        item.DiscountAmt?item.DiscountAmt:0,
        item.GSTAmount?item.GSTAmount:0,
        item.BuyPrice
      ]);
    });
    const fileName = 'Quotationslist-print.xlsx';
    workbook.xlsx.writeBuffer().then((data: any) => {
      const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, fileName);
      this.pageNumber=1;
    });
  }
  clearReason() {
  this.reason = ''; 
}
removeDuplicateValuesFromArrays(){
  this.quotationLogDetails.forEach((element:any) => {
    element.LocationName = Array.from(new Set(element.LocationName.split(','))).join(',');
    element.CenterName = Array.from(new Set(element.CenterName.split(','))).join(',');
    element.LocationGuids = Array.from(new Set(element.LocationGuids.split(','))).join(',');
  });
  this.json2.forEach((element:any) => {
    element.QotationLogData.quotationsList.forEach((ele:any) => {
      ele.LocationName = Array.from(new Set(ele.LocationName.split(','))).join(',');
      ele.CenterName = Array.from(new Set(ele.CenterName.split(','))).join(',');
      ele.LocationGuids = Array.from(new Set(ele.LocationGuids.split(','))).join(',');
    });
});
}
onCheckActivityHistory(){
  const result :any= [];
  this.json2.forEach((element:any) => {
    result.push(element.QotationLogData);
  });
  this.activityHistoryArray=result;
//   this.quotationLogDetails.forEach((original:any) => {
//   this.json2.forEach((ele1:any) => {
//     ele1.QotationLogData.quotationsList.forEach((change:any) => {
//         this.compareObjects(original, change)
//     });
//   });
// });
 


}
PreviewInvoice(value: any) {
  this.Document = value;
}
}

