  import { DatePipe, formatDate } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { NgbCalendar, NgbDateParserFormatter, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { AllReportsService } from 'src/app/core/Services/all-reports.service';
import { AuthenticationService } from 'src/app/core/Services/authentication.service';
import { QuotationService } from 'src/app/core/Services/quotation.service';
import * as saveAs from 'file-saver';
import { Workbook } from 'exceljs';
import { IndentService } from 'src/app/core/Services/indent.service';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import { CustomDateParserFormatter } from 'src/app/core/Services/ngbdate-format.service';
import { ColumnMode } from '@swimlane/ngx-datatable';
@Component({
  selector: 'app-stock-transaction-report',
  templateUrl: './stock-transaction-report.component.html',
  styleUrls: ['./stock-transaction-report.component.scss'],
  providers: [
    { provide: NgbDateParserFormatter, useClass: CustomDateParserFormatter },
  ],
})
export class StockTransactionReportComponent implements OnInit {
  ColumnMode = ColumnMode;
  loadingIndicator : boolean = true;
  shimmerVisible: boolean;
  UnparsedHtml: any = '<html lang="en"><head><meta charset="UTF-8"><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Stock Ledger Report</title><style>table{border-collapse:collapse;border:1px solid #000}table td,table th{border-bottom:1px solid #000;border-right:1px solid #000;padding:5px;text-align:left;word-wrap:break-word;word-break:break-all;font-size:10px}table th{background-color:#ccc}.logo{height:28px;display:flex;align-items:center;justify-content:center;padding:20px 0}</style></head><body><table style="text-align:center;table-layout:fixed" width="100%"><tbody><tr><td><div class="logo"><img data-v-0e549244="" src="assets/images/YodaLIMSLogo.png" alt="Yoda LIMS"></div></td></tr></tbody></table><table style="text-align:center;table-layout:fixed" width="100%"><tbody><tr><td style="text-align:center;font-weight:700;font-size:16px">Stock Ledger Report</td></tr><tr><td style="text-align:center;font-weight:700;font-size:14px">From Dt :%%FromDate%% - To Dt: %%ToDate%%</td></tr></tbody></table><table style="table-layout:fixed;margin-top:20px" width="100%"><thead><tr><th>Transaction Date</th><th>Item Name</th><th>Transaction Numbur</th><th>Particulars</th><th>Transaction Quantity</th><th>InHand Quantity</th></tr></thead><tbody><tr id="StockLedgerReports"><td>%%TransactionDate%%</td><td>%%ItemName%%</td><td>%%TransactionNumbur%%</td><td> %%Particulars%% %%FromLocation%%</td><td>%%TransactionQuantity%%</td><td>%%InHandQuantity%%</td></tr></tbody></table></body></html>';
  FromDate: any = '';
  ToDate: any = '';
  LocationGuid: any =[];
  selecteToDate: any;
  selectefromDate: any;
  StockReportList: any = [];
  LocationList: any = [];
  newDate: any;
  centerList: any = [];
  isDisable: boolean = true;
  minDate: NgbDateStruct;
  defaultData: any = [];
  noDataFound: boolean = false;
  CeneterclearControl: FormControl = new FormControl();
  clearControl: FormControl = new FormControl();
  cleardateControl: FormControl = new FormControl();
  clearFromControl: FormControl = new FormControl();
  currentDate: string | null;
  buttonDisable: boolean = true;
  itemsList: any;
  allItems: any;
  ItemGuid:any= []
  IsStore: any;
  totalPageNumbers : any
  constructor(
    private allReportsService: AllReportsService,
    private quotationService: QuotationService,
    private authservice: AuthenticationService,
    private datePipe: DatePipe,
    private calendar: NgbCalendar,
    private indentService:IndentService
  ) { }

  ngOnInit(): void {
    const newDate1 = { day: new Date().getDate(), month: new Date().getMonth() + 1, year: new Date().getFullYear() };
    this.newDate = formatDate(new Date(newDate1.year, newDate1.month - 1, newDate1.day), 'dd-MM-yyyy', 'en');
   this.IsStore=this.authservice.LoggedInUser.STORE;
    this.GetLocations();
    this.getAllItemDetails();
    const today = this.calendar.getToday();
    const currentDate = new Date();
    this.currentDate = this.datePipe.transform(currentDate, 'dd-MMM-yyyy hh:mm a');
    this.minDate = {
      year: today.year, month: today.month, day: today.day
    };
  }
  /**
   * this servive call used to Get locations
   */
  GetLocations() {
    // this.globalService.startSpinner();
    this.shimmerVisible = true;
    let DepartmentGuid = this.authservice.LoggedInUser.DEFAULTROLES.toLowerCase().includes('ADMIN'.toLowerCase()) && this.authservice.LoggedInUser.LOCATIONSGUID == '00000000-0000-0000-0000-000000000000' ? '00000000-0000-0000-0000-000000000000' :
      this.authservice.LoggedInUser.LOCATIONSGUID?.split(",")
    this.quotationService.getQuotationPostDefaults(DepartmentGuid).subscribe((data: any,) => {
      this.defaultData = data.Result;
      this.LocationList = data.Result.LstQuotationCenterLocationType;
      this.centerList = data.Result.LstQuotationStateDetailsType.filter((f: { CenterGuid: any; }) => this.LocationList.some((filter: { CenterGuid: any; }) => filter.CenterGuid === f.CenterGuid));
      // this.globalService.stopSpinner();
      this.shimmerVisible = false;
    }, error => {
      // this.globalService.stopSpinner();
      this.shimmerVisible = false;
    })
  }
  /**
   * this service method used to get stock ledger reports
   */
  getStockTransactionReports(type: string, item: any) {
    // this.globalService.startSpinner()
    this.shimmerVisible = true;
    if (this.LocationGuid.length == 0) {
      this.LocationGuid = this.authservice.LoggedInUser.DEFAULTROLES.toLowerCase().includes('ADMIN'.toLowerCase()) && this.authservice.LoggedInUser.LOCATIONSGUID == '00000000-0000-0000-0000-000000000000' ? '00000000-0000-0000-0000-000000000000' : this.authservice.LoggedInUser.LOCATIONSGUID.split(",");
    }
    this.allReportsService.GetStockTransaction(this.FromDate,this.ToDate,this.ItemGuid,this.LocationGuid).subscribe((data) => {
      this.StockReportList = data || [];
      // this.globalService.stopSpinner()
      this.shimmerVisible = false;
      if (this.StockReportList.length > 0) {
        this.noDataFound = false;
        if (type === 'pdf') {
          this.downloadReport();
        } else if (type === 'excel') {
          this.downloadExcel();
        } else if (item) {
        } 
      } else {
        this.noDataFound = true;
      }
    }, error => {
      // this.globalService.stopSpinner();
      this.shimmerVisible = false;
    })
  }
  

  filterData(event: any) {
    if (event.length!==0) {
        this.isDisable = false  
        this.noDataFound = false
        this.buttonDisable = false
        this.LocationGuid=event.map((item: { CenterLocationGuid: any; }) => item.CenterLocationGuid);; 
        this.IsStore=event.IsStore;
      //this.LocationList = this.defaultData.LstQuotationCenterLocationType.filter((f: { CenterGuid: any; }) => f.CenterGuid == event[0].CenterGuid);
      //this.centerList = this.defaultData.LstQuotationStateDetailsType.filter((f: { CenterGuid: any; }) => f.CenterGuid == event[0].CenterGuid);
    }
    else if(this.FromDate!=''&&this.ToDate!=''){
      this.LocationGuid = "";
      this.isDisable = false; 
      this.noDataFound = false;
    }
    else {
      this.LocationGuid = "";
      this.buttonDisable = true;
      this.clearControl.reset();
      this.CeneterclearControl.reset();
      this.LocationList = this.defaultData.LstQuotationCenterLocationType;
      this.centerList = this.defaultData.LstQuotationStateDetailsType.filter((f: { CenterGuid: any; }) => this.LocationList.some((filter: { CenterGuid: any; }) => filter.CenterGuid === f.CenterGuid));
    }
  }

  /**
   * this event used to select the from date
   * @param event 
   */
  selectFromDate(event: any) {
    this.FromDate = event.year + "-" + event.month + "-" + event.day;
    this.isDisable = true
    this.ToDate = '';
    this.selectefromDate = event
    this.selectefromDate = {
      year: event.year, month: event.month, day: event.day
    };
    this.selecteToDate = "";
  }

  /**
   * this event used to select the To date 
   */
  selectToDate(event: any) {
    this.isDisable = false
    this.noDataFound = false
    this.selecteToDate = event;
    this.ToDate = event.year + "-" + event.month + "-" + event.day;
  }
  ChangeLocation(event: any) {
    this.LocationGuid = event.CenterLocationGuid
    this.isDisable = false
  }
  /**
   * this change event used to chenge the location and item details
   * @param event 
   * @param Typename 
   */
  Change(event: any, Typename: any) {
    if (Typename === 'Location') {
      this.LocationGuid = event.target.value
    }
    // this.getStockLedgerReports();
  }
  /**
   * this event used to dowload the exel file
   */
  downloadExcel() {
    const header = ['Transaction Date','Item Name','Vendor Item Name','Item Code','Department','UOM','Vendor','Vendor Code','Transaction Number','Particulars','Transaction Quantity','InHand Quantity'];
    // Create workbook and worksheet
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('Sharing Data');
    const fromDateParts = this.FromDate.split('-');
    const toDateParts = this.ToDate.split('-');
    const formattedFromDate = this.FromDate != "" ?fromDateParts[2] + '-' + fromDateParts[1] + '-' + fromDateParts[0] : null;
    const formattedToDate = this.ToDate != "" ? toDateParts[2] + '-' + toDateParts[1] + '-' + toDateParts[0]:null;
    const headline2Content = 'Period From: ' + formattedFromDate + ' Period To: ' + formattedToDate;
    worksheet.addRow([null,null,null,null,null,"STOCK LEDGER REPORT DETAILS"])
    worksheet.addRow([null,null,null,null,null,headline2Content])
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
    worksheet.getColumn(1).width = 20;
    worksheet.getColumn(2).width = 40;
    worksheet.getColumn(3).width = 30;
    worksheet.getColumn(4).width = 40;
    worksheet.getColumn(5).width = 20;
    worksheet.getColumn(6).width = 20;
    worksheet.getColumn(7).width = 20;
    worksheet.getColumn(8).width = 20;
    worksheet.getColumn(9).width = 20;
    worksheet.getColumn(10).width = 20;
    worksheet.getColumn(11).width = 20;
    // worksheet.addRow([]);
    this.StockReportList.forEach((item: any) => {
      const row = worksheet.addRow([
        item.TransactionDate == '0001-01-01T00:00:00' ? 'N/A' : formatDate(item.TransactionDate, 'dd-MM-yyyy', 'en'),
        item.ItemName,
        item.VendorItemName ? item.VendorItemName : "N/A",
        item.ApolloItemCode,
        item.DepartmentTypeName,
        item.MajorUnitName,
        item.SupplierName ? item.SupplierName : "N/A",
        item.SupplierCode ? item.SupplierCode : "N/A",
        item.TRNNumber,
        item.Type+" "+item.fromLocation,
        item.TransactionQty,
        item.InHandQty
      ]);
    });
    const fileName = 'StockLedgerReports-print.xlsx';
    workbook.xlsx.writeBuffer().then((data: any) => {
      const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, fileName);
    });
  }
  async downloadReport(){
    await  this.DownloadPdf();
      this.DownloadPdfnew();
    }
    prepareData() :  any[] {
      interface Stock {
        TransactionDate: string;
        ItemName: string;
        VendorItemName : string;
        ApolloItemCode:string;
        DepartmentTypeName:string;
        MajorUnitName:string;
        SupplierName:string;
        SupplierCode:string;
        TRNNumber: any;
        Type: any;
        TransactionQty: any;
        InHandQty: any;
        fromLocation: any;
        ChekedDate: any;
        ToLocation: any;
      }
      let rowStyle: any = {};
      return  this.StockReportList.map((stock: Stock, index: number) => {
        rowStyle = {};
        if (stock.Type == 'Item Recieved by') {
          rowStyle = { fillColor: '#90EE90' };
        }
        if (stock.Type == 'Item Consumed by') {
          rowStyle = { fillColor: '#FFFFE0' };
        }
        if (stock.Type == 'Item Adjusted by') {
          rowStyle = { fillColor: '#FFA07A' };
        }
        if (stock.Type == 'Item Issued by') {
          rowStyle = { fillColor: '#ADD8E6' };
        }
        return [
          { content: index + 1, styles: { minCellWidth: 8, ...rowStyle } },
          { content: stock.TransactionDate == null ? 'N/A' : this.datePipe.transform(stock.TransactionDate, 'dd-MM-yyyy'), styles: { minCellWidth: 23, ...rowStyle } },
          { content: stock.ItemName, styles: { minCellWidth: 10, ...rowStyle } },
          { content: stock.VendorItemName ? stock.VendorItemName : "N/A", styles: { minCellWidth: 10, ...rowStyle } },
          { content: stock.ApolloItemCode, styles: { minCellWidth: 10, ...rowStyle } },
          { content: stock.DepartmentTypeName, styles: { minCellWidth: 10, ...rowStyle } },
          { content: stock.MajorUnitName, styles: { minCellWidth: 10, ...rowStyle } },
          { content: stock.SupplierName ? stock.SupplierName : "N/A", styles: { minCellWidth: 10, ...rowStyle } },
          { content: stock.SupplierCode ? stock.SupplierCode : "N/A", styles: { minCellWidth: 10, ...rowStyle } },
          { content: stock.TRNNumber, styles: { minCellWidth: 20, ...rowStyle } },
          { content: stock.Type == null ? 'N/A' : stock.Type + ' ' + stock.fromLocation, styles: { minCellWidth: 10, ...rowStyle } },
          { content: stock.TransactionQty, styles: { minCellWidth: 20, ...rowStyle } },
          { content: stock.InHandQty == null ? 'N/A' : stock.InHandQty, styles: { minCellWidth: 23, ...rowStyle } },
          { content: stock.fromLocation == null ? 'N/A' : stock.fromLocation, styles: { minCellWidth: 20, ...rowStyle } },
          { content: stock.ToLocation == 'null' ? 'N/A' : stock.ToLocation, styles: { minCellWidth: 23, ...rowStyle } },
        ];
      });
    }
  DownloadPdf() {
    const doc = new jsPDF({ orientation: 'landscape' });
    const imageHeight = 15;
    const cursorY = imageHeight + 30;
    let currentPageNumber = 0;
    const tableWidth = 290;
    autoTable(doc, {
      head: [this.createHeaderCols()],
      body: this.prepareData(),
      startY: cursorY,
      tableWidth: tableWidth,
      margin: { left: 3 },
      didDrawPage: (data) => {
        currentPageNumber++; 
        this.totalPageNumbers = currentPageNumber;
      },
    });
  }
  DownloadPdfnew() {
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
      const headline1Content = 'Stock Ledger Report Summary';
      const headline1XPos = 110;
      const headline1YPos = imageYPos + imageHeight + 10-data;
      const headline1FontSize = 10;
      doc
        .text(headline1Content, headline1XPos, headline1YPos)
        .setFontSize(headline1FontSize);
    }
    const createSubTitle = (data:any) =>{
      const headline2Content = 'Period From: ' + this.datePipe.transform(this.FromDate, "dd-MM-yyyy") + ' Period To: ' + this.datePipe.transform(this.ToDate, "dd-MM-yyyy");
      const headline2XPos = 110;
      const headline2YPos = imageYPos + imageHeight + 16-data;
      const headline2FontSize = 10;
      doc
        .text(headline2Content, headline2XPos, headline2YPos)
        .setFontSize(headline2FontSize);
    }
    const cursorY = imageHeight + 30;
    const tableWidth = 290;
    let currentPageNumber = 0;
    autoTable(doc, {
      head: [this.createHeaderCols()],
      body: this.prepareData(),
      startY: cursorY,
      theme: 'grid',
      tableWidth: tableWidth,
      margin: { left: 3 },
      didDrawPage: (data) => {
        const yPos = data.pageNumber > 1 ? 30 : 5;
        createTitle(yPos);
        createSubTitle(yPos);
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
    });

    doc.save('Stock-Ledger-report.pdf');

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
      { content: 'Transaction Date', styles: { ...headerColStyles } },
      { content: 'Item Name', styles: { ...headerColStyles } },
      { content: 'Vendor Item Name', styles: { ...headerColStyles } },
      { content: 'Item Code', styles: { ...headerColStyles } },
      { content: 'Department', styles: { ...headerColStyles } },
      { content: 'UOM', styles: { ...headerColStyles } },
      { content: 'Vendor', styles: { ...headerColStyles } },
      { content: 'Vendor Code', styles: { ...headerColStyles } },
      { content: 'Transaction Number', styles: { ...headerColStyles } },
      { content: 'Particulars', styles: { ...headerColStyles } },
      { content: 'Transaction Quantity', styles: { ...headerColStyles } },
      { content: 'In Hand Quantity', styles: { ...headerColStyles } },
    ];
  }
  removeDates() {
    this.StockReportList=[];
    this.isDisable = true
    this.noDataFound = false
    this.FromDate = ""
    this.ToDate = ""
    this.StockReportList=[]
    this.LocationGuid = ""
    this.clearControl.reset();
    this.CeneterclearControl.reset();
    this.clearFromControl.reset();
    this.cleardateControl.reset();
    this.buttonDisable = true
    this.LocationList = this.defaultData.LstQuotationCenterLocationType
    this.centerList = this.defaultData.LstQuotationStateDetailsType.filter((f: { CenterGuid: any; }) => this.LocationList.some((filter: { CenterGuid: any; }) => filter.CenterGuid === f.CenterGuid));
  }
  Onremove() {
    //this.LocationGuid = []
  }
  getAllItemDetails() {
    this.indentService.Getindentitems(false).subscribe(data => {
      this.itemsList = data.oGetIndentitems;
      this.allItems = this.itemsList.filter((value: any, index: any, self: any) => {
        return index === self.findIndex((t: any) => (
          t.ItemGuid === value.ItemGuid || t.ItemName === value.ItemName
        ));
      })
    })
  }
  ChangeItem(event: any) {
    if (event != undefined) {
      this.ItemGuid = event.ItemGuid
    }
    else {
      this.ItemGuid = []
    }
  }
}
