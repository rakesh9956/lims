import { Component, OnInit } from '@angular/core';
import { AllReportsService } from 'src/app/core/Services/all-reports.service';
import { DatePipe } from '@angular/common';
import { Workbook } from 'exceljs';
import * as saveAs from 'file-saver';
import { FormControl } from '@angular/forms';
import { NgbCalendar, NgbDateParserFormatter, NgbDateStruct} from '@ng-bootstrap/ng-bootstrap';
import { QuotationService } from 'src/app/core/Services/quotation.service';
import { AuthenticationService } from 'src/app/core/Services/authentication.service';
import { CustomDateParserFormatter } from 'src/app/core/Services/ngbdate-format.service';
import { IndentService } from 'src/app/core/Services/indent.service';
import autoTable from 'jspdf-autotable';
import { ColumnMode } from '@swimlane/ngx-datatable';
import jsPDF from 'jspdf';
import  * as moment  from 'moment';

@Component({
  selector: 'app-stock-status-report',
  templateUrl: './stock-status-report.component.html',
  styleUrls: ['./stock-status-report.component.scss'],
  providers: [
    { provide: NgbDateParserFormatter, useClass: CustomDateParserFormatter },
  ],
})
export class StockStatusReportComponent implements OnInit {

  shimmerVisible: boolean;
  ColumnMode = ColumnMode;
  loadingIndicator : boolean = true;
  UnparsedHtml: any = '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta content="IE=edge" http-equiv="X-UA-Compatible"><meta content="width=device-width,initial-scale=1" name="viewport"><title>Stock Statement Report</title><style>table{border-collapse:collapse;border:1px solid #000}table td,table th{border-bottom:1px solid #000;border-right:1px solid #000;padding:5px;text-align:left;word-wrap:break-word;word-break:break-all;font-size:10px}table th{background-color:#ccc}.logo{height:28px;display:flex;align-items:center;justify-content:center;padding:20px 0}</style></head><body><table style="text-align:center;table-layout:fixed" width="100%"><tbody><tr><td><div class="logo"><img data-v-0e549244="" src="assets/images/YodaLIMSLogo.png" alt="Yoda LIMS"></div></td></tr></tbody></table><table style="text-align:center;table-layout:fixed" width="100%"><tr><td style="text-align:center;font-weight:700;font-size:16px">Stock Statement Report</td></tr><tr><td style="text-align:center;font-weight:700;font-size:14px">As On :%%newDate%%</td></tr></table><table style="table-layout:fixed;margin-top:30px" width="100%"><thead><tr><th>S No.</th><th>Item Name</th><th>Location</th><th>Manufacturer</th><th>Department</th><th>Catalog No</th><th>Batch no</th><th>Expiry Date</th><th>Stock in Hand</th><th>Scrap Quantity</th><th>Unit price</th><th>Total price</th><th>Post By</th></tr></thead><tbody><tr id="StockStatusReports"><td>%%SNumber%%</td><td>%%ItemName%%</td><td>%%Location%%</td><td>%%Manufacturer%%</td><td>%%SubCategoryTypeName%%</td><td>%%Catalog%%</td><td>%%BatchNumber%%</td><td>%%ExpiryDate%%</td><td>%%StockinHand%%</td><td>%%ScrapQuantity%%</td><td>%%Unitprice%%</td><td>%%Amount%%</td><td>%%Username%%</td><tr><th colspan="12" style="text-align:right">Total Stock</th><th>%%TotalQuantity%%</th></tr><tr><th colspan="12" style="text-align:right">Total Amount</th><th>%%TotalAmount%%</th></tr></tbody></table></body></html>';
  UnpasedHtmldep:any='<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta content="IE=edge" http-equiv="X-UA-Compatible"><meta content="width=device-width,initial-scale=1" name="viewport"><title>Stock Statement Report</title><style>table{border-collapse:collapse;border:1px solid #000}table td,table th{border-bottom:1px solid #000;border-right:1px solid #000;padding:5px;text-align:left;word-wrap:break-word;word-break:break-all;font-size:10px}table th{background-color:#ccc}.logo{height:28px;display:flex;align-items:center;justify-content:center;padding:20px 0}</style></head><body><table style="text-align:center;table-layout:fixed" width="100%"><tbody><tr><td><div class="logo"><img data-v-0e549244="" src="assets/images/YodaLIMSLogo.png" alt="Yoda LIMS"></div></td></tr></tbody></table><table style="text-align:center;table-layout:fixed" width="100%"><tr><td style="text-align:center;font-weight:700;font-size:16px">Stock Statement Report</td></tr><tr><td style="text-align:center;font-weight:700;font-size:14px">As On :%%newDate%%</td></tr></table><table style="table-layout:fixed;margin-top:30px" width="100%"><thead><tr><th>S No.</th><th>Item Name</th><th>Location</th><th>Manufacturer</th><th>Department</th><th>Catalog No</th><th>Batch no</th><th>Expiry Date</th><th>Receive Quantity</th><th>Remaining Quantity</th><th>Consume Quantity</th><th>Return Quantity</th><th>Received By</th></tr></thead><tbody><tr id="StockStatusReports"><td>%%SNumber%%</td><td>%%ItemName%%</td><td>%%Location%%</td><td>%%Manufacturer%%</td><td>%%SubCategoryTypeName%%</td><td>%%Catalog%%</td><td>%%BatchNumber%%</td><td>%%ExpiryDate%%</td><td>%%ReceiveQty%%</td><td>%%StockinHand%%</td><td>%%IssueQuantity%%</td><td>%%ReturnQuantity%%</td><td>%%Username%%</td><tr><th colspan="12" style="text-align:right">Remaining Stock</th><th>%%TotalQuantity%%</th></tr></tbody></table></body></html>';
  LocationsGuid: any = null;
  ItemGuid: any = '';
  stockStatusReports: any = [];
  currentDate: any;
  CenterList: any[];
  centerList: any = [];
  LocationList: any[];
  isDisable: boolean = true;
  CenterclearControl: FormControl = new FormControl();
  clearControl: FormControl = new FormControl();
  ItemclearControl: FormControl = new FormControl();
  cleardateControl: FormControl = new FormControl();
  clearFromControl: FormControl = new FormControl();
  defaultData: any = [];
  noDataFound: boolean = false;
  LocationGuid: any=[];
  minDate:NgbDateStruct;
  selectfromDate:  any="";
  FromDate: any='';
   ToDate: any='';
   serviceAuth : any;
  isSelected: boolean;
  CenterGuid: any =[];
  TotalAmount: any;
  TotalQuantity: any;
  IsStore: boolean;
  Allitems: any=[];
  totalPageNumbers : any
  constructor(
    private allReportsService: AllReportsService, private datePipe: DatePipe,
    private calendar: NgbCalendar,
    private quotationService: QuotationService,
    private authservice: AuthenticationService,
    public calender:NgbCalendar,
    private indentService:IndentService
  ) {
    this.serviceAuth = authservice;
    const formatDate = new Date();
    this.currentDate = this.datePipe.transform(formatDate, 'dd-MM-yyyy');
  }
   
  ngOnInit(): void {
     this.GetReportsLocation();
     this.GetAllItems();
      const currentDate = new Date();
      this.currentDate = this.datePipe.transform(currentDate, 'dd-MMM-yyyy hh:mm a');
      const today = this.calendar.getToday();
        this.minDate = {
          year: today.year, month: today.month, day: today.day
        };
        this.IsStore=this.authservice.LoggedInUser.STORE
     }
     GetReportsLocation() {
      let DepartmentGuid=this.authservice.LoggedInUser.DEFAULTROLES.toLowerCase().includes('ADMIN'.toLowerCase()) && this.authservice.LoggedInUser.LOCATIONSGUID=='00000000-0000-0000-0000-000000000000' ?'00000000-0000-0000-0000-000000000000':
      this.authservice.LoggedInUser.LOCATIONSGUID.split(",");
      this.quotationService.getQuotationPostDefaults(DepartmentGuid).subscribe((data: any,) => {
        this.defaultData = data.Result;
        this.LocationList = data.Result.LstQuotationCenterLocationType;
        this.centerList = data.Result.LstQuotationStateDetailsType.filter((f: { CenterGuid: any; }) => this.LocationList.some((filter: { CenterGuid: any; }) => filter.CenterGuid === f.CenterGuid));
      }, error => {
      })
    }
     /**
   * this service method used to get all items
   */
   GetAllItems() {
    this.shimmerVisible = true;
    this.indentService.Getindentitems(false).subscribe(data => {
       const Itemsdata = data.oGetIndentitems;
       this.Allitems = Itemsdata.filter((value: any, index: any, self: any) => {
        const firstIndex = self.findIndex((item: any) => item.ItemGuid === value.ItemGuid || item.ItemName === value.ItemName);
        return index === firstIndex;
      });
      this.shimmerVisible = false;
    }, 
      (error: any) => {
        this.shimmerVisible = false;
    })
  }
  getStatusReportData(TypeName:any = null) {
    this.shimmerVisible=true;
     if(this.LocationGuid?.length==0){
     this.LocationGuid =this.authservice.LoggedInUser.DEFAULTROLES.toLowerCase().includes('ADMIN'.toLowerCase()) && this.authservice.LoggedInUser.LOCATIONSGUID=='00000000-0000-0000-0000-000000000000' ?'00000000-0000-0000-0000-000000000000': this.authservice.LoggedInUser.LOCATIONSGUID.split(",");
    }
    this.allReportsService.getStatusReports(this.LocationGuid,this.ItemGuid,this.FromDate,this.ToDate,this.IsStore).subscribe(data => {
      this.stockStatusReports = data;
      this.TotalAmount= this.stockStatusReports.reduce((total: any, report: { UnitPrice: any;StockinHand: any}) => total + report.UnitPrice * report.StockinHand, 0);
      this.TotalQuantity= this.stockStatusReports.reduce((total: any, report: { StockinHand: any}) => total + report.StockinHand, 0);
      this.shimmerVisible=false;
          if (this.stockStatusReports?.length == 0) {
            this.noDataFound = true
          } else {
            TypeName == 'pdf' ? this.downloadReport() : TypeName == 'excel' ? this.downloadExcel() : '';
            this.noDataFound = false
          }
        }, error => {
          this.shimmerVisible=false;
        })
  
  }

  filterData(event: any) {
    if (event != undefined) {
      if (event.CenterLocationGuid != undefined) {
        this.LocationGuid = event.CenterLocationGuid
        this.IsStore=event.IsStore;
        this.ItemGuid='';
      }
      this.LocationList = this.defaultData.LstQuotationCenterLocationType.filter((f: { CenterGuid: any; }) => f.CenterGuid == event.CenterGuid);
      this.centerList = this.defaultData.LstQuotationStateDetailsType.filter((f: { CenterGuid: any; }) => f.CenterGuid == event.CenterGuid);
    }
      else {
        this.LocationGuid="";
        this.ItemGuid='';
        this.clearControl.reset();
        this.CenterclearControl.reset();
        this.ItemclearControl.reset();
        this.LocationList = this.defaultData.LstQuotationCenterLocationType
        this.centerList = this.defaultData.LstQuotationStateDetailsType.filter((f: { CenterGuid: any; }) => this.LocationList.some((filter: { CenterGuid: any; }) => filter.CenterGuid === f.CenterGuid));
      }
  } 
  Onremove() {
    this.LocationGuid = []
  }
  removeDates() {
    this.stockStatusReports=[];
    this.isDisable = true
    this.noDataFound = false
    this.FromDate = ""
    this.ToDate = ""
    this.LocationGuid = ""
    this.ItemGuid='';
    this.clearControl.reset();
    this.CenterclearControl.reset();
    this.clearFromControl.reset();
    this.cleardateControl.reset();
    this.ItemclearControl.reset();
    this.LocationList = this.defaultData.LstQuotationCenterLocationType
    this.CenterList = this.defaultData.LstQuotationStateDetailsType.filter((f: { CenterGuid: any; }) => this.LocationList.some((filter: { CenterGuid: any; }) => filter.CenterGuid === f.CenterGuid));
  }
  selectFromDate(event: any) {
    this.ToDate = '';
    this.cleardateControl.reset()
    this.isDisable=true
    this.noDataFound = false
    this.FromDate = event.year + "-" + event.month + "-" + event.day;
    this.isSelected=false
    this.selectfromDate = event
    this.FromDate = event.year + "-" + event.month + "-" + event.day;
    }
  selectToDate(event: any) {
    if(!this.selectfromDate) {
    this.isDisable = true
    } else{
      this.isDisable = false
      this.noDataFound = false 
    } 
    this.isDisable = false;
    this.ToDate = event.year + "-" + event.month + "-" + event.day;  
  }
  ChangeData(event: any, Typename: any) {
    if (Typename === 'Location') {
      this.LocationsGuid = event.target.value
    }
    if (Typename === 'Centres') {
      this.CenterGuid = event.target.value
    }
    if (Typename === 'Dates') {
      this.FromDate = event.target.value
    }
    if (Typename === 'Dates') {
      this.ToDate = event.target.value
    }
  }
async downloadReport(){
    await  this.DownloadPdf();
    this.DownloadPdfNew();
}
  DownloadPdf() {
    const doc = new jsPDF({ orientation: 'landscape' });
    const imageHeight = 15;
    const cursorY = imageHeight + 30;
    const tableWidth = 290;
    interface Stock {
      ItemName: string;
      VendorItemName : string;
      ApolloItemCode:String;
      DepartmentTypeName:string;
      MajorUnitName:string;
      SupplierName:string;
      SupplierCode:string;
      Location: string;
      ManufactureName: any;
      CatalogNo: any;
      BatchNumber: any;
      ExpiryDate: any;
      ReceiveQty: any;
      UserName: any;
      StockinHand: any;
      ConsumeQuantity: any;
      // SubCategoryTypeName: any;
      ScrapQuantity: any;
      ReturnQuantity: any;
      UnitPrice:any
    }
    if((this.IsStore==false || this.authservice.LoggedInUser.STORE=="false")){
      const data = this.stockStatusReports?.map((stock: Stock, index: number) => [ 
      { content: index + 1, styles: { minCellWidth: 10 } },
      { content: stock.ItemName, styles: { minCellWidth: 15 } }, 
      { content: stock.VendorItemName ? stock.VendorItemName : "N/A", styles: { minCellWidth: 15 } },
      { content: stock.ApolloItemCode, styles: { minCellWidth: 15 } }, 
      { content: stock.DepartmentTypeName, styles: { minCellWidth: 15 } },
      { content: stock.MajorUnitName==""||stock.MajorUnitName==null?"N/A" :stock.MajorUnitName.slice(0,10), styles: { minCellWidth: 15 } },  
      { content: stock.SupplierName==""||stock.SupplierName==null? "N/A" : stock.SupplierName.slice(0,10), styles: { minCellWidth: 15 } },  
      { content: stock.SupplierCode==""||stock.SupplierCode==null? "N/A" : stock.SupplierCode.slice(0,10), styles: { minCellWidth: 15 } },  
      { content: stock.Location, styles: { minCellWidth: 10 } },
      { content: stock.ManufactureName==""||stock.ManufactureName==null? "N/A" :stock.ManufactureName.slice(0,10),styles: { minCellWidth: 15 } },
      // { content: stock.SubCategoryTypeName, styles: { minCellWidth: 20 } },
      { content: stock.CatalogNo, styles: { minCellWidth: 15 } },
      { content: stock.BatchNumber, styles: { minCellWidth: 15 } },
      { content: stock.ExpiryDate==null?"N/A":stock.ExpiryDate.slice(0,10), styles: { minCellWidth: 15 } },
      { content: stock.StockinHand==null?"N/A":stock.ReceiveQty.toString().match(/^\d+(?:\.\d{0,2})?/), styles: { minCellWidth: 15 } },
      { content: stock.StockinHand==0?"N/A":stock.StockinHand, styles: { minCellWidth: 15 } },
      { content: stock.ConsumeQuantity==null?"N/A":stock.ConsumeQuantity.toString().match(/^\d+(?:\.\d{0,1})?/), styles: { minCellWidth: 15 } },
      { content: stock.ReturnQuantity==null?"N/A":stock.ReturnQuantity.toString().match(/^\d+(?:\d{0,2})?/), styles: { minCellWidth: 15 } },
      { content: stock.UserName, styles: { minCellWidth: 10 } },
    ]);
    let currentPageNumber = 0;
      autoTable(doc, {
        head: [this.createHeaderCol()],
        body: data,
        startY: cursorY,
        tableWidth: tableWidth,
        margin: { left: 3 },
        didDrawPage: (data) => {
          currentPageNumber++; 
          this.totalPageNumbers=currentPageNumber
        },
      })
    }
    else{
      const data = this.stockStatusReports?.map((stock: Stock, index: number) => [ 
      { content: index + 1, styles: { minCellWidth: 10 } },
      { content: stock.ItemName, styles: { minCellWidth: 15 } },
      { content: stock.VendorItemName ? stock.VendorItemName : "N/A", styles: { minCellWidth: 15 } },
      { content: stock.ApolloItemCode, styles: { minCellWidth: 15 } },  
      { content: stock.DepartmentTypeName, styles: { minCellWidth: 15 } }, 
      { content: stock.MajorUnitName==""||stock.MajorUnitName==null?"N/A" :stock.MajorUnitName.slice(0,10), styles: { minCellWidth: 15 } },  
      { content: stock.SupplierName, styles: { minCellWidth: 15 } }, 
      { content: stock.SupplierCode==""||stock.SupplierCode==null? "N/A" : stock.SupplierCode.slice(0,10), styles: { minCellWidth: 15 } },  
      { content: stock.Location, styles: { minCellWidth: 10 } },
      { content: stock.ManufactureName==""||stock.ManufactureName==null? "N/A" :stock.ManufactureName.slice(0,10),styles: { minCellWidth: 15 } },
      // { content: stock.SubCategoryTypeName, styles: { minCellWidth: 20 } },
      { content: stock.CatalogNo, styles: { minCellWidth: 15 } },
      { content: stock.BatchNumber, styles: { minCellWidth: 20 } },
      { content: stock.ExpiryDate==null?"N/A":stock.ExpiryDate.slice(0,10), styles: { minCellWidth: 15 } },
      { content: stock.StockinHand==null?"N/A":stock.StockinHand.toFixed(2), styles: { minCellWidth: 15 } },
      { content: stock.ScrapQuantity==0?"N/A":stock.ScrapQuantity, styles: { minCellWidth: 15 } },
      { content: stock.UnitPrice==null?"N/A":stock.UnitPrice.toFixed(2), styles: { minCellWidth: 15 } },
      { content: stock.StockinHand==null?"N/A":stock.UnitPrice* stock.StockinHand.toString().match(/^\d+(?:\d{0,2})?/), styles: { minCellWidth: 15 } },
      { content: stock.UserName, styles: { minCellWidth: 20 } },
    ])
    let currentPageNumber = 0;
      autoTable(doc, {
        head: [this.createHeaderCols()],
        body: data,
        startY: cursorY,
        theme: 'grid',
        tableWidth: tableWidth,
        margin: { left: 3 },
        didDrawPage: (data) => {
          currentPageNumber++;
          this.totalPageNumbers=currentPageNumber
        },
      })
    }
  }
  DownloadPdfNew() {
    const doc = new jsPDF({ orientation: 'landscape' });
    const imageUrl =
      'https://yoda-inventory-management.s3.ap-south-1.amazonaws.com/yodalims/invoices/yoda_logo';
    const imageWidth = 100;
    const imageHeight = 15;
    const imageXPos = 10;
    const imageYPos = 10;
    const headerColStyles = {
      fontSize: 8,
      fillColor: '#fff',
      textColor: '#000',
      lineColor: '#fff',
      textAlign: 'center',
    };

    doc.addImage(
      imageUrl,
      'PNG',
      imageXPos,
      imageYPos,
      imageWidth,
      imageHeight
    );
    function createTitle(data:any){
      const headline1Content = 'Stock Statement Report Summary';
      const headline1XPos = 100;
      const headline1YPos = imageYPos + imageHeight + 10-data;
      const headline1FontSize = 10;
      doc
        .text(headline1Content, headline1XPos, headline1YPos)
        .setFontSize(headline1FontSize);
    }
    const createSubTitle = (doc: any, data: any, FromDate: any | null, ToDate: Date) => {
      let headline2Content = '';
      if (FromDate === '') {
        ToDate = new Date();
        headline2Content = 'As on ' + this.datePipe.transform(ToDate, "dd-MMM-yyyy hh:mm a");
      } else {
        headline2Content = 'Period From: ' + this.datePipe.transform(FromDate, "dd-MM-yyyy");
        headline2Content += ' Period To: ' + this.datePipe.transform(ToDate, "dd-MM-yyyy");
      }
      const headline2XPos = 100;
      const headline2YPos = imageYPos + imageHeight + 16 - data;
      const headline2FontSize = 10;
      doc
        .text(headline2Content, headline2XPos, headline2YPos)
        .setFontSize(headline2FontSize);
    }    
    const cursorY = imageHeight + 30;
    const tableWidth = 290;
    interface Stock {
      ItemName: string;
      VendorItemName : string;
      ApolloItemCode:string;
      DepartmentTypeName:string;
      MajorUnitName:string;
      SupplierName:string;
      SupplierCode:string;
      Location: string;
      ManufactureName: any;
      CatalogNo: any;
      BatchNumber: any;
      ExpiryDate: any;
      ReceiveQty: any;
      UserName: any;
      StockinHand: any;
      ConsumeQuantity: any;
      SubCategoryTypeName: any;
      ScrapQuantity: any;
      ReturnQuantity: any;
      UnitPrice:any
    }
    if((this.IsStore==false || this.authservice.LoggedInUser.STORE=="false")){
      const data = this.stockStatusReports.map((stock: Stock, index: number) => [ 
      { content: index + 1, styles: { minCellWidth: 10 } },
      { content: stock.ItemName, styles: { minCellWidth: 15 } },
      { content: stock.VendorItemName ? stock.VendorItemName : 'N/A', styles: { minCellWidth: 15 } },  
      { content: stock.ApolloItemCode, styles: { minCellWidth: 15 } }, 
      { content: stock.DepartmentTypeName, styles: { minCellWidth: 20 } }, 
      { content: stock.MajorUnitName==""||stock.MajorUnitName==null?"N/A" :stock.MajorUnitName.slice(0,10), styles: { minCellWidth: 20 } },  
      { content: stock.SupplierName==null? "N/A" : stock.SupplierName.slice(0,10), styles: { minCellWidth: 20 } },  
      { content: stock.SupplierCode==null? "N/A" : stock.SupplierCode.slice(0,10), styles: { minCellWidth: 20 } },  
      { content: stock.Location, styles: { minCellWidth: 10 } },
      { content: stock.ManufactureName==""||stock.ManufactureName==null? "N/A" :stock.ManufactureName.slice(0,10),styles: { minCellWidth: 15 } },
      { content: stock.SubCategoryTypeName, styles: { minCellWidth: 20 } },
      { content: stock.CatalogNo, styles: { minCellWidth: 15 } },
      { content: stock.BatchNumber, styles: { minCellWidth: 20 } },
      { content: stock.ExpiryDate==null?"N/A":stock.ExpiryDate.slice(0,10), styles: { minCellWidth: 15 } },
      { content: stock.StockinHand==null?"N/A":stock.ReceiveQty.toString().match(/^\d+(?:\.\d{0,2})?/), styles: { minCellWidth: 15 } },
      { content: stock.StockinHand==0?"N/A":stock.StockinHand, styles: { minCellWidth: 15 } },
      { content: stock.ConsumeQuantity==null?"N/A":stock.ConsumeQuantity.toString().match(/^\d+(?:\.\d{0,1})?/), styles: { minCellWidth: 15 } },
      { content: stock.ReturnQuantity==null?"N/A":stock.ReturnQuantity.toString().match(/^\d+(?:\d{0,2})?/), styles: { minCellWidth: 15 } },
      { content: stock.UserName, styles: { minCellWidth: 20 } },
    ]);
    let currentPageNumber = 0;
      autoTable(doc, {
        head: [this.createHeaderCol()],
        body: data,
        startY: cursorY,
        theme: 'grid',
        tableWidth: tableWidth,
        margin: { left: 3 },
        didDrawPage: (data) => {
          const yPos = data.pageNumber > 1 ? 30 : 5;
          createTitle(yPos);
          createSubTitle(doc, yPos, this.FromDate, this.ToDate);
          currentPageNumber++; 
          const footerContent = `Page.No ${currentPageNumber} of ${this.totalPageNumbers}`;
          doc.setTextColor(headerColStyles.textColor); 
          doc.setFontSize(headerColStyles.fontSize); 
          doc.setFillColor(headerColStyles.fillColor); 
          doc.rect(
            10,
            doc.internal.pageSize.height - 10,
            doc.internal.pageSize.width - 20,
            10,
            'F'
          ); 
          doc.text(footerContent, 15, doc.internal.pageSize.height - 5); 
        },
      }),

      doc.save('stock-statement-report.pdf')
    }
    else{
      const data = this.stockStatusReports.map((stock: Stock, index: number) => [
      { content: index + 1, styles: { minCellWidth: 10 } },
      { content: stock.ItemName, styles: { minCellWidth: 15 } }, 
      { content: stock.VendorItemName ? stock.VendorItemName : 'N/A', styles: { minCellWidth: 15 } },
      { content: stock.ApolloItemCode, styles: { minCellWidth: 15 } },
      { content: stock.DepartmentTypeName, styles: { minCellWidth: 20 } },  
      { content: stock.MajorUnitName==""||stock.MajorUnitName==null?"N/A" :stock.MajorUnitName.slice(0,10), styles: { minCellWidth: 12 } },  
      { content: stock.SupplierName==""||stock.SupplierName==null? "N/A" : stock.SupplierName.slice(0,10), styles: { minCellWidth: 20 } },  
      { content: stock.SupplierCode==""||stock.SupplierCode==null? "N/A" : stock.SupplierCode.slice(0,10), styles: { minCellWidth: 15 } },  
      { content: stock.Location, styles: { minCellWidth: 20 } },
      { content: stock.ManufactureName==""||stock.ManufactureName==null? "N/A" :stock.ManufactureName.slice(0,10),styles: { minCellWidth: 15 } },
      { content: stock.SubCategoryTypeName, styles: { minCellWidth: 20 } },
      { content: stock.CatalogNo, styles: { minCellWidth: 15 } },
      { content: stock.BatchNumber, styles: { minCellWidth: 18 } },
      { content: stock.ExpiryDate==null?"N/A":stock.ExpiryDate.slice(0,10), styles: { minCellWidth: 23 } },
      { content: stock.StockinHand==null?"N/A":stock.StockinHand.toFixed(2), styles: { minCellWidth: 15 } },
      { content: stock.ScrapQuantity==0?"N/A":stock.ScrapQuantity, styles: { minCellWidth: 15 } },
      { content: stock.UnitPrice==null?"N/A":stock.UnitPrice.toFixed(2), styles: { minCellWidth: 15 } },
      { content: stock.StockinHand==null?"N/A":stock.UnitPrice* stock.StockinHand.toString().match(/^\d+(?:\d{0,2})?/), styles: { minCellWidth: 15 } },
      { content: stock.UserName, styles: { minCellWidth: 10 } },
    ])
    let currentPageNumber = 0;
      autoTable(doc, {
        head: [this.createHeaderCols()],
        body: data,
        startY: cursorY,
        theme: 'grid',
        tableWidth: tableWidth,
        margin: { left: 3 },
        didDrawPage: (data) => {
          const yPos = data.pageNumber > 1 ? 30 : 5;
          createTitle(yPos);
          createSubTitle(doc, yPos, this.FromDate, this.ToDate);
          currentPageNumber++; 
          const footerContent = `Page. No ${currentPageNumber} of ${this.totalPageNumbers}`;
          doc.setTextColor(headerColStyles.textColor); 
          doc.setFontSize(headerColStyles.fontSize); 
          doc.setFillColor(headerColStyles.fillColor); 
          doc.rect(
            10,
            doc.internal.pageSize.height - 10,
            doc.internal.pageSize.width - 20,
            10,
            'F'
          ); 
          doc.text(footerContent, 15, doc.internal.pageSize.height - 5); 
        },
      }),
      doc.save('stock-statement-report.pdf') 
    }
  }
  public createHeaderCols() {
    const headerColStyles = {
      fontSize: 8,
      fillColor: '#00435d',
      textColor: '#fff',
      lineColor: '#fff',
    };
    return [
      { content: 'S.No', styles: { ...headerColStyles } },
      { content: 'Item Name', styles: { ...headerColStyles } },
      { content: 'Vendor Item Name', styles: { ...headerColStyles } },
      { content: 'Item Code', styles: { ...headerColStyles } },
      { content: 'Department', styles: { ...headerColStyles } },
      { content: 'UOM', styles: { ...headerColStyles } },
      { content: 'Vendor', styles: { ...headerColStyles } },
      { content: 'Vendor Code', styles: { ...headerColStyles } },
      { content: 'Location', styles: { ...headerColStyles } },
      { content: 'Manufacturer', styles: { ...headerColStyles } },
      // { content: 'Department', styles: { ...headerColStyles } },
      { content: 'Catalog No.', styles: { ...headerColStyles } },
      { content: 'Batch no', styles: { ...headerColStyles } },
      { content: 'Expiry Date', styles: { ...headerColStyles } },
      { content: 'Stock in Hand', styles: { ...headerColStyles } },
      { content: 'Scrap Quantity', styles: { ...headerColStyles } },
      { content: 'Unit price', styles: { ...headerColStyles } },
      { content: 'Total price', styles: { ...headerColStyles } },
      { content: 'Post by', styles: { ...headerColStyles } },
     
    ];
  }
  public createHeaderCol() {
    const headerColStyles = {
      fontSize: 8,
      fillColor: '#00435d',
      textColor: '#fff',
      lineColor: '#fff',
    };
    return [
      { content: 'S.No', styles: { ...headerColStyles } },
      { content: 'Item Name', styles: { ...headerColStyles } },
      { content: 'Vendor Item Name', styles: { ...headerColStyles } },
      { content: 'Item Code', styles: { ...headerColStyles } },
      { content: 'Department', styles: { ...headerColStyles } },
      { content: 'UOM', styles: { ...headerColStyles } },
      { content: 'Vendor', styles: { ...headerColStyles } },
      { content: 'Vendor Code', styles: { ...headerColStyles } },
      { content: 'Location', styles: { ...headerColStyles } },
      { content: 'Manufacturer', styles: { ...headerColStyles } },
      // { content: 'Department', styles: { ...headerColStyles } },
      { content: 'Catalog No.', styles: { ...headerColStyles } },
      { content: 'Batch no', styles: { ...headerColStyles } },
      { content: 'Expiry Date', styles: { ...headerColStyles } },
      { content: 'Receive Quantity', styles: { ...headerColStyles } },
      { content: 'Remaining Quantity', styles: { ...headerColStyles } },
      { content: 'Consume Quantity', styles: { ...headerColStyles } },
      { content: 'Return Quantity', styles: { ...headerColStyles } },
      { content: 'Received by', styles: { ...headerColStyles } },
     
    ];
  }
  downloadExcel() {
    const header = ['Stock Id', 'Item Name','Vendor Item Name','Item Code','Department','UOM','Vendor','Vendor Code','Location', 'Manufacturer','Catalog No','Batch-Number','Expiry Date','Stock In Hand','Unit price','Total price','Posted By'];
    const headerFordepot = ['Stock Id', 'Item Name','Item Code','Department','UOM','Vendor','Vendor Code','Location', 'Manufacturer','Catalog No','Batch-Number','Expiry Date','	Recive Quantity', 'Remaining Quantity','Consume Quantity','Return Quantity','Recived By'];
    // Create workbook and worksheet
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('Sharing Data');
        
    let headline2Content = '';
    if (this.FromDate && this.ToDate) {
        const fromDateParts = this.FromDate.split('-');
        const toDateParts = this.ToDate.split('-');
        const formattedFromDate = fromDateParts[2] + '-' + fromDateParts[1] + '-' + fromDateParts[0];
        const formattedToDate = toDateParts[2] + '-' + toDateParts[1] + '-' + toDateParts[0];
        headline2Content = 'Period From: ' + formattedFromDate + ' Period To: ' + formattedToDate;
      } else if (this.ToDate) {
        const toDateParts = this.ToDate.split('-');
        const formattedToDate = toDateParts[2] + '-' + toDateParts[1] + '-' + toDateParts[0];
        const now = new Date();
        const currentTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        headline2Content = 'As On: ' + formattedToDate + ' ' + currentTime;
    }
    worksheet.addRow([null,null,null,null,null,null,null,null,"STOCK STATEMENT REPORT"])
    worksheet.addRow([null,null,null,null,null,null,null,null,headline2Content])
    const cell1 = worksheet.getCell('I1');
    const cell2 = worksheet.getCell('I2');
    cell1.alignment = {
      horizontal: 'center'
    };
    cell2.alignment = {
      horizontal: 'center'
    };
      cell1.font = {
        bold: true,
        size: 20
      };
      cell2.font = {
        bold: true,
        size: 15
      };
    worksheet.addRow([])
    // Add Header Row
    const headerRow = worksheet.addRow(this.IsStore==false || this.authservice.LoggedInUser.STORE=="false" ? headerFordepot:header);
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
    worksheet.getColumn(1).width = 20;
    worksheet.getColumn(2).width = 40;
    worksheet.getColumn(3).width = 40;
    worksheet.getColumn(4).width = 30;
    worksheet.getColumn(5).width = 20;
    worksheet.getColumn(6).width = 20;
    worksheet.getColumn(7).width = 20;
    worksheet.getColumn(8).width = 40;
    worksheet.getColumn(9).width = 20;
    worksheet.getColumn(10).width = 20;
    worksheet.getColumn(11).width = 20;
    worksheet.getColumn(12).width = 20;
    worksheet.getColumn(13).width = 20;
    worksheet.getColumn(14).width = 20;
    worksheet.getColumn(15).width = 20;
    worksheet.getColumn(16).width = 20;
    worksheet.getColumn(17).width = 20;
    // worksheet.addRow([]);

    if(this.IsStore==false || this.authservice.LoggedInUser.STORE=="false"){
      this.stockStatusReports?.forEach((item: any) => {
        const row = worksheet.addRow([
          item?.StockId ? item?.StockId : 'N/A',
          item?.ItemName,
          item?.VendorItemName ? item?.VendorItemName : 'N/A',
          item?.ApolloItemCode ? item?.ApolloItemCode : 'N/A',
          item?.DepartmentTypeName ? item?.DepartmentTypeName : 'N/A',
          item?.MajorUnitName ? item?.MajorUnitName : 'N/A',
          item?.SupplierName ? item?.SupplierName : 'N/A',
          item?.SupplierCode ? item?.SupplierCode : 'N/A',
          item?.Location ? item?.Location : 'N/A',
          item?.ManufactureName ? item?.ManufactureName : 'N/A',
          // item?.SubCategoryTypeName ? item?.SubCategoryTypeName : 'N/A',
          item?.CatalogNo ? item?.CatalogNo : 'N/A',
          item?.BatchNumber,
          // item?.ExpiryDate ? item?.ExpiryDate : 'N/A',
          moment(item?.ExpiryDate).format('dd-MM-yyyy')||"N/A",
          item?.ReceiveQty ? item?.ReceiveQty : 'N/A',
          item?.StockinHand,
          item?.ConsumeQuantity == null ? "N/A" : Number(item?.ConsumeQuantity)?.toFixed(1),
          item?.ReturnQuantity==null?"N/A":item?.ReturnQuantity,
          item?.UserName ? item.UserName : 'N/A',
        ]);
      });
    }
    else{
      this.stockStatusReports?.forEach((item: any) => {
        const row = worksheet.addRow([
          item?.StockId ? item?.StockId : 'N/A',
          item?.ItemName,
          item?.VendorItemName ? item?.VendorItemName : 'N/A',
          item?.ApolloItemCode ? item.ApolloItemCode : 'N/A',
          item?.DepartmentTypeName ? item.DepartmentTypeName : 'N/A',
          item?.MajorUnitName ? item?.MajorUnitName : 'N/A',
          item?.SupplierName ? item?.SupplierName : 'N/A',
          item?.SupplierCode ? item?.SupplierCode : 'N/A',
          item?.Location ? item?.Location : 'N/A',
          item?.ManufactureName ? item?.ManufactureName : 'N/A',
          // item?.SubCategoryTypeName ? item?.SubCategoryTypeName : 'N/A',
          item?.CatalogNo ? item?.CatalogNo : 'N/A',
          item?.BatchNumber,
          item?.ExpiryDate != "Invalid Date" && item?.ExpiryDate != "" && item?.ExpiryDate != null? moment( new Date(item?.ExpiryDate)).format('DD-MM-yyyy'): "N/A",
          item?.StockinHand ? item?.StockinHand : 'N/A',
          item?.UnitPrice==null?"N/A":item?.UnitPrice?.toFixed(2),
          item?.StockinHand==null?"N/A":item?.UnitPrice* item?.StockinHand?.toString()?.match(/^\d+(?:\d{0,2})?/),
          item?.UserName ? item?.UserName : 'N/A',
        ]);
      });
    }
    
    const fileName = 'StockStatementReports-print.xlsx';
    workbook.xlsx.writeBuffer().then((data: any) => {
      const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, fileName);
    });
  }
  /**
   * this event used to select the item
   * @param event 
   */
  selectItem(event:any){
    if(event==undefined){
      this.ItemGuid='';
    }
   else{
    this.ItemGuid=event.ItemGuid;
   }
  }
}
