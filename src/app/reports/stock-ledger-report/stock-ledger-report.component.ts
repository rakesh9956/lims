import { Component, OnInit } from '@angular/core';
import { NgbCalendar, NgbDateParserFormatter, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { Workbook } from 'exceljs';
import { AllReportsService } from 'src/app/core/Services/all-reports.service';
import { saveAs } from 'file-saver';
import { DatePipe, formatDate } from '@angular/common';
import { QuotationService } from 'src/app/core/Services/quotation.service';
import { AuthenticationService } from 'src/app/core/Services/authentication.service';
import { FormControl } from '@angular/forms';
import { CustomDateParserFormatter } from 'src/app/core/Services/ngbdate-format.service';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import { ColumnMode } from '@swimlane/ngx-datatable';

@Component({
  selector: 'app-stock-ledger-report',
  templateUrl: './stock-ledger-report.component.html',
  styleUrls: ['./stock-ledger-report.component.scss'],
  providers: [
    { provide: NgbDateParserFormatter, useClass: CustomDateParserFormatter },
  ],
})
export class StockLedgerReportComponent implements OnInit {
  ColumnMode = ColumnMode;
  loadingIndicator : boolean = true;
  shimmerVisible: boolean;
  UnparsedHtml: any = '<html lang="en"><head><meta charset="UTF-8"><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Indent vs PO vs GRN</title><style>table{border-collapse:collapse;border:1px solid #000}table td,table th{border-bottom:1px solid #000;border-right:1px solid #000;padding:5px;text-align:left;word-wrap:break-word;word-break:break-all;font-size:10px}table th{background-color:#ccc}.logo{height:28px;display:flex;align-items:center;justify-content:center;padding:20px 0}</style></head><body><table style="text-align:center;table-layout:fixed" width="100%"><tbody><tr><td><div class="logo"><img data-v-0e549244="" src="assets/images/YodaLIMSLogo.png" alt="Yoda LIMS"></div></td></tr></tbody></table><table style="text-align:center;table-layout:fixed" width="100%"><tbody><tr><td style="text-align:center;font-weight:700;font-size:16px">Indent vs PO vs GRN</td></tr><tr><td style="text-align:center;font-weight:700;font-size:14px">From Dt :%%FromDate%% - To Dt: %%ToDate%%</td></tr></tbody></table><table style="table-layout:fixed;margin-top:20px" width="100%"><thead><tr><th>Item Name</th><th>Item Type</th><th>Transaction Numbur</th><th>Transaction Date</th><th>Location</th><th>PO Number</th><th>PO Quantity</th><th>GRN Quantity</th><th>In Hand Qty</th><th>Indent No.</th><th>Expiry Date</th><th>Scrap Quantity</th></tr></thead><tbody><tr id="StockLedgerReports"><td>%%ItemName%%</td><td>%%ItemType%%</td><td>%%TransactionNumber%%</td><td>%%TransactionDate%%</td><td>%%Location%%</td><td>%%PONumber%%</td><td>%%POQuantity%%</td><td>%%Quantity%%</td><td>%%InHandQty%%</td><td>%%Indent%%</td><td>%%Expiry%%</td><td>%%ScrapQuantity%%</td></tr></tbody></table></body></html>';
  FromDate: any = '';
  ToDate: any = '';
  LocationGuid: any = '';
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
  clearLocationControl: FormControl = new FormControl();
  cleardateControl: FormControl = new FormControl();
  clearFromControl: FormControl = new FormControl();
  currentDate: string | null;
  buttonDisable: boolean = true;
  pageCount: number = -1;
  rowCount: number = 40;
  itemOrder: string = '';
  sort: string = '';
  itemsList: any;
  allItems: any;
  ItemGuid:any= []
  IsActive:boolean=true
  totalPageNumbers:any;
  constructor(
    private allReportsService: AllReportsService,
    private quotationService: QuotationService,
    private authservice: AuthenticationService,
    private datePipe: DatePipe,
    private calendar: NgbCalendar,
    public calender: NgbCalendar,
  ) { }

  ngOnInit(): void {
    const newDate1 = { day: new Date().getDate(), month: new Date().getMonth() + 1, year: new Date().getFullYear() };
    this.newDate = formatDate(new Date(newDate1.year, newDate1.month - 1, newDate1.day), 'dd-MM-yyyy', 'en');
    this.GetLocations();
    this.getAllItemDetails()
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
  getStockLedgerReports(type: string, item: any) {
    // this.globalService.startSpinner()
    this.shimmerVisible = true;
    if (this.LocationGuid.length == 0) {
      this.LocationGuid = this.authservice.LoggedInUser.DEFAULTROLES.toLowerCase().includes('ADMIN'.toLowerCase()) && this.authservice.LoggedInUser.LOCATIONSGUID == '00000000-0000-0000-0000-000000000000' ? '00000000-0000-0000-0000-000000000000' : this.authservice.LoggedInUser.LOCATIONSGUID.split(",");
    }
    this.allReportsService.GetStockLedgerReports(this.FromDate, this.ToDate, this.LocationGuid, this.ItemGuid).subscribe((data) => {
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
    if (event != undefined) {
      if (event.CenterLocationGuid != undefined) {
        //this.isDisable = false
        //this.noDataFound = false
        this.buttonDisable = false
        this.LocationGuid = event.CenterLocationGuid
      }
      this.LocationList = this.defaultData.LstQuotationCenterLocationType.filter((f: { CenterGuid: any; }) => f.CenterGuid == event.CenterGuid);
      this.centerList = this.defaultData.LstQuotationStateDetailsType.filter((f: { CenterGuid: any; }) => f.CenterGuid == event.CenterGuid);
    }
    else {
      this.LocationGuid = ""
      this.buttonDisable = true
      this.clearControl.reset();
      this.clearLocationControl.reset()
      this.CeneterclearControl.reset();
      // this.isDisable = true
      //this.noDataFound = false
      this.LocationList = this.defaultData.LstQuotationCenterLocationType
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
    const header = ['Item Name' ,'Vendor Item Name','ItemCode', 'Department', 'Units of measurement' ,  'Location'  , 'Indent No.' ,'Indent status' ,'Indent Approval Date' ,'Expected Date For Indent','Item Quantity For Indent',
    'PO Number' , 'PO Quantity' ,'PO amount','PoRaisedDate'  , 'Pending Item Count', 'GRN Transaction Number','Invoice Number', 'Batch Number', 'Suplier Name','Expiry Date',
    'GRN Transaction Date','GRN Quantity','GRN Amount'];
    // Create workbook and worksheet
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('Sharing Data');
    // Add Header Row
    const fromDateParts = this.FromDate.split('-');
    const toDateParts = this.ToDate.split('-');
    const formattedFromDate = this.FromDate != "" ?fromDateParts[2] + '-' + fromDateParts[1] + '-' + fromDateParts[0] : null;
    const formattedToDate = this.ToDate != "" ? toDateParts[2] + '-' + toDateParts[1] + '-' + toDateParts[0]:null;
    const headline2Content = 'Period From: ' + formattedFromDate + ' Period To: ' + formattedToDate;
    worksheet.addRow([null,null,null,null,null,null,null,null,"Indent vs PO vs GRN Report"])
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
    worksheet.getColumn(2).width = 30;
    worksheet.getColumn(3).width = 30;
    worksheet.getColumn(4).width = 20;
    worksheet.getColumn(5).width = 40;
    worksheet.getColumn(6).width = 30;
    worksheet.getColumn(7).width = 20;
    worksheet.getColumn(8).width = 20;
    worksheet.getColumn(9).width = 20;
    worksheet.getColumn(10).width = 20;
    worksheet.getColumn(11).width = 20;
    worksheet.getColumn(12).width = 30;
    worksheet.getColumn(13).width = 30;
    worksheet.getColumn(14).width = 30;
    worksheet.getColumn(15).width = 25;
    worksheet.getColumn(16).width = 25;
    worksheet.getColumn(17).width = 25;
    worksheet.getColumn(18).width = 20; 
    worksheet.getColumn(19).width = 30; 
    worksheet.getColumn(20).width = 20;
    worksheet.getColumn(20).width = 20;
    worksheet.getColumn(22).width = 20;
    // worksheet.getColumn(18).width = 30;
    // worksheet.addRow([]);
    this.StockReportList.forEach((item: any) => {
      const row = worksheet.addRow([
        item.ItemName,
        item.VendorItemName ? item.VendorItemName : 'N/A',
        item.ItemCode == null ? 'N/A' : item.ItemCode,
        item.SubCategoryTypeName,
        item.MajorUnitName == null && item.MajorUnitName == "" ? 'N/A' : item.MajorUnitName,
        item.Location != null && item.Location != ""? item.Location : "N/A",
        item.IndentNo == null ? 'N/A' : item.IndentNo,
        item.Status == null ? 'N/A' : item.Status,
        item.IndentApprovalDate == '0001-01-01T00:00:00' ? 'N/A' : formatDate(item.IndentApprovalDate, 'dd-MM-yyyy HH:mm:ss', 'en'),
        item.ExpectedDateForIndent == '0001-01-01T00:00:00' ? 'N/A' : formatDate(item.ExpectedDateForIndent, 'dd-MM-yyyy HH:mm:ss', 'en'),
        item.ItemQtyForIndent,
        item.PurchaseOrderNo  == null ? 'N/A' :item.PurchaseOrderNo.split(",").map((data: string) => data.trim()).join('\n'),
        item.POQuantity,
        item.Amount == null ? 'N/A' : parseFloat(item.Amount) || 0,
        item.PODate == '0001-01-01T00:00:00' ? 'N/A' : formatDate(item.PODate, 'dd-MM-yyyy HH:mm:ss', 'en'), 
        item.PendingQuantity == null ? 'N/A' : item.PendingQuantity,
        item.LedgerTransactionNo == null && item.LedgerTransactionNo == "" ? 'N/A' : item.LedgerTransactionNo,
        item.InvoiceNo == null ? 'N/A' : item.InvoiceNo,
        item.BatchNumber == null ? 'N/A' : item.BatchNumber,
        item.SupplierName == null ? 'N/A' : item.SupplierName,
        item.ExpiryDate == '0001-01-01T00:00:00' ? 'N/A' : formatDate(item.ExpiryDate, 'dd-MM-yyyy HH:mm:ss', 'en'),
        item.CreatedDt == '0001-01-01T00:00:00' ? 'N/A' : formatDate(item.CreatedDt, 'dd-MM-yyyy HH:mm:ss', 'en'),
        //item.BarcodeNo == null ? 'N/A' : item.BarcodeNo,
        // item.ExpiryDate == '0001-01-01T00:00:00' ? 'N/A' : formatDate(item.ExpiryDate, 'dd-MM-yyyy', 'en'),
        item.ReleasedCount,
        item.GRNAmount == null ? 'N/A' : parseFloat(item.GRNAmount) || 0,
      ]);
    });


    const fileName = 'IndentvsPOvsGRNReport-print.xlsx';
    workbook.xlsx.writeBuffer().then((data: any) => {
      const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, fileName);
    });
  }
  prepareData() :  any[] {
    interface Stock {
      SupplierName: string;
      BatchNumber: string;
      InvoiceNo: string;
      SubCategoryTypeName: string;
      LedgerTransactionNo: string;
      TransactionDate: any
      Location: string;
      ItemName: string;
      VendorItemName : string;
      ReleasedCount: string;
      POQuantity: any;
      CreatedDt: any;
      GRNAmount : any;
      NewQty: any;
      PurchaseOrderNo: any;
      IndentNo: any;
      ExpiryDate: any;
      ScrapQuantity: any;
      PendingQuantity : any;
      PODate:any;
      IndentApprovalDate:any;
      Status : any;
      Amount : any;
      ItemCode : any;
      Unitsofmeasurement : any; 
      MajorUnitName : any;
    }
    return this.StockReportList.map((stock: Stock, index: number) => [ 
      { content: index + 1, styles: { minCellWidth: 10 } },
      { content: stock.ItemName, styles: { minCellWidth: 15 } }, 
      { content: stock.VendorItemName?  stock.VendorItemName : 'N/A', styles: { minCellWidth: 12 } }, 
      { content: stock.SubCategoryTypeName, styles: { minCellWidth: 10 } },
      { content: stock.ItemCode, styles: { minCellWidth: 10 } },
      { content: stock.LedgerTransactionNo == null ? 'N/A' : stock.LedgerTransactionNo, styles: { minCellWidth: 15 } },
      { content: stock.CreatedDt == '0001-01-01T00:00:00' ? 'N/A' : formatDate(stock.CreatedDt, 'dd-MM-yyyy HH:mm:ss', 'en'), styles: { minCellWidth: 12 } },
      { content: stock.InvoiceNo == null ? 'N/A' : stock.InvoiceNo, styles: { minCellWidth: 12 }},
      { content: stock.BatchNumber == null ? 'N/A' : stock.BatchNumber, styles: { minCellWidth: 12 }},
      { content: stock.SupplierName == null ? 'N/A' : stock.SupplierName, styles: { minCellWidth: 12 }},
      { content: stock.ExpiryDate == '0001-01-01T00:00:00' ? 'N/A' : formatDate(stock.ExpiryDate, 'dd-MM-yyyy', 'en'), styles: { minCellWidth: 10 }},
      { content: stock.GRNAmount != null && stock.GRNAmount != "" ?  parseFloat(stock.GRNAmount).toFixed(2): "N/A", styles: { minCellWidth: 10 } },
      { content: stock.Location!= null && stock.Location!= "" ? stock.Location : "N/A" , styles: { minCellWidth: 25 } },
      {
        content: stock.PurchaseOrderNo == null || stock.PurchaseOrderNo === '' ? 'N/A' : stock.PurchaseOrderNo.split(",").map((data: string) => data.trim()).join('\n'),
        styles: { minCellWidth: 10 }
      },
      { content: stock.POQuantity, styles: { minCellWidth: 10 } },
      { content: stock.ReleasedCount, styles: { minCellWidth: 10 } },
      { content: stock.PendingQuantity==null?"N/A":stock.PendingQuantity, styles: { minCellWidth: 12 } },
      { content: stock.IndentNo  == null || '' ? 'N/A' : stock.IndentNo, styles: { minCellWidth: 15 } },
      { content: stock.PODate == '0001-01-01T00:00:00' ? 'N/A' : formatDate(stock.PODate, 'dd-MM-yyyy HH:mm:ss', 'en'), styles: { minCellWidth: 12 } },
      { content: stock.IndentApprovalDate == '0001-01-01T00:00:00' ? 'N/A' : formatDate(stock.IndentApprovalDate, 'dd-MM-yyyy HH:mm:ss', 'en'), styles: { minCellWidth: 12 } },
      { content: stock.Status, styles: { minCellWidth: 12 } },
      { content: stock.Amount != null && stock.Amount != "" ?  parseFloat(stock.Amount).toFixed(2): "N/A", styles: { minCellWidth: 12 } },
      
      { content: stock.MajorUnitName != "" && stock.MajorUnitName != null ? stock.MajorUnitName : "N/A", styles: { minCellWidth: 12 } },
      { content: stock.ScrapQuantity, styles: { minCellWidth: 10 } },
      
    ]);
  }
  async downloadReport(){
    await  this.DownloadPdf();
      this.downloadPdfNew();
    }
  DownloadPdf() {
    const doc = new jsPDF({ orientation: 'landscape' });
    const imageHeight = 15;
    let currentPageNumber = 0;
    const cursorY = imageHeight + 30;
    autoTable(doc, {
      head: [this.createHeaderCols()],
      body: this.prepareData() ,
      startY: cursorY,
      margin: { left: 3 },
      didDrawPage: (data) => {
        currentPageNumber++; 
        this.totalPageNumbers = currentPageNumber;
      },
    });
  }
  downloadPdfNew() {
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
      const headline1Content = 'Indent vs PO vs GRN Report Summary';
      const headline1XPos = 100;
      const headline1YPos = imageYPos + imageHeight + 10-data;
      const headline1FontSize = 10;
      doc
        .text(headline1Content, headline1XPos, headline1YPos)
        .setFontSize(headline1FontSize);
    }
    const createSubTitle = (data:any) =>{
      const headline2Content = 'Period From: ' + this.datePipe.transform(this.FromDate, "dd-MM-yyyy") + ' Period To: ' + this.datePipe.transform(this.ToDate, "dd-MM-yyyy");
      const headline2XPos = 100;
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
      body: this.prepareData() ,
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
    doc.save('Indent vs PO vs GRN Report Amt Summary.pdf');
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
      { content: 'Name', styles: { ...headerColStyles } },
      { content: 'Vendor Item Name', styles: { ...headerColStyles } },
      { content: 'Type', styles: { ...headerColStyles } },
      { content: 'Code', styles: { ...headerColStyles } },
      { content: 'Trnsc No', styles: { ...headerColStyles } },
      { content: 'Trnsc Date', styles: { ...headerColStyles } },
      { content: 'Invoice No', styles: { ...headerColStyles } },
      { content: 'Batch No', styles: { ...headerColStyles } },
      { content: 'Suplier', styles: { ...headerColStyles } },
      { content: 'ExpiryDate', styles: { ...headerColStyles } },
      { content: 'GRN Amount', styles: { ...headerColStyles } },
      { content: 'Location', styles: { ...headerColStyles } },
      { content: 'PO Number', styles: { ...headerColStyles} },
      { content: 'PO QTY', styles: { ...headerColStyles } },
      { content: 'GRN QTY', styles: { ...headerColStyles } },
      { content: 'Pndg Count', styles: { ...headerColStyles } },
      { content: 'Indent No', styles: { ...headerColStyles } },
      { content: 'PODate', styles: { ...headerColStyles } },
      { content: 'IndentAppDT', styles: { ...headerColStyles } },
      { content: 'Status', styles: { ...headerColStyles } },
      { content: 'PO amount', styles: { ...headerColStyles } },
      { content: 'Units', styles: { ...headerColStyles } }, 
      { content: 'Srcp QTY', styles: { ...headerColStyles } },
    ];
  }
  removeDates() {
    this.StockReportList = [];
    this.isDisable = true
    this.noDataFound = false
    this.FromDate = ""
    this.ToDate = ""
    this.StockReportList=[]
    this.LocationGuid = ""
    this.ItemGuid=[]
    this.clearControl.reset();
    this.clearLocationControl.reset()
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
    // this.Keyword = (this.Keyword == undefined || this.Keyword == null) ? this.Keyword || "" : this.Keyword
    this.quotationService.getAllItems(this.pageCount, this.rowCount, '', this.itemOrder, this.sort,this.IsActive).subscribe(data => {
      this.itemsList = data.Result.getAllItemsResponses;
      this.allItems = this.itemsList.filter((value: any, index: any, self: any) => {
        return index === self.findIndex((t: any) => (
          t.ItemGuid === value.ItemGuid || t.ItemName === value.ItemName
        ));
      })
      this.allItems = this.allItems.sort((a: any, b: any) => a.ItemName?.trim().localeCompare(b.ItemName.trim()));
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
  formatAmount(amount: any): string {
    if (!amount) return "N/A";
    return parseFloat(amount).toFixed(2);
}
}
