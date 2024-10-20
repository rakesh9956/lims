import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { NgbCalendar, NgbDateParserFormatter, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Workbook } from 'exceljs';
import { saveAs } from 'file-saver';
import { ColumnMode } from '@swimlane/ngx-datatable';
import { AllReportsService } from 'src/app/core/Services/all-reports.service';
import { AuthenticationService } from 'src/app/core/Services/authentication.service';
import { CustomDateParserFormatter } from 'src/app/core/Services/ngbdate-format.service';
import { QuotationService } from 'src/app/core/Services/quotation.service';
@Component({
  selector: 'app-issue-report',
  templateUrl: './issue-report.component.html',
  styleUrls: ['./issue-report.component.scss'],
  providers: [
    { provide: NgbDateParserFormatter, useClass: CustomDateParserFormatter },
  ],
})
export class IssueReportComponent implements OnInit {
  shimmerVisible: boolean;
  ColumnMode = ColumnMode;
  loadingIndicator : boolean = true;
  UnparsedHtml: any = '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Issue Report</title><style>table{border-collapse:collapse;border:1px solid #000}table td,table th{border-bottom:1px solid #000;border-right:1px solid #000;padding:5px;text-align:left;word-wrap:break-word;word-break:break-all;font-size:10px}table th{background-color:#ccc}.logo{height:28px;display:flex;align-items:center;justify-content:center;padding:20px 0}</style></head><body><table style="text-align:center;table-layout:fixed" width="100%"><tbody><tr><td><div class="logo"><img data-v-0e549244="" src="assets/images/YodaLIMSLogo.png" alt="Yoda LIMS"></div></td></tr></tbody></table><table style="text-align:center;table-layout:fixed" width="100%"><tbody><tr><td style="text-align:center;font-weight:700;font-size:16px">Issue Report Amt Summary</td></tr><tr><td style="text-align:center;font-weight:700;font-size:14px">Period From : %%fromDate%% Period To :%%toDate%%</td></tr></tbody></table><table style="table-layout:fixed;margin-top:20px" width="100%"><thead><tr><th>S.No.</th><th>Indent #</th><th>Material Issue No</th><th>Barcode No.</th><th>Issue Date</th><th>Dispatch Location</th><th>Receive Location</th><th>Item Name</th><th>Request Quantity</th><th>Issue Quantity</th><th>Receive Quantity</th><th>Return Quantity</th><th>Rate (₹)</th><th>Buy Price (₹)</th><th>Discount Amt (₹)</th><th>Tax %</th><th>Issue Amt (₹)</th></tr></thead><tbody><tr id="issuereport"><td>%%index(i)%%</td><td>%%IndentNo%%</td><td>%%MaterialIssueNo%%</td><td>%%BarcodeNo%%</td><td>%%CreatedDt%%</td><td>%%FromLocation%%</td><td>%%ToLocation%%</td><td>%%ItemName%%</td><td>%%RequestQuantity%%</td><td>%%IssueQty%%</td><td>%%ReceiveQty%%</td><td>%%RejectQuantity%%</td><td>%%Rate%%</td><td>%%ReceiveAmt%%</td><td>%%DiscountAmount%%</td><td>%%TaxPer%%</td><td>%%ReceivetotalAmt%%</td></tr></tbody></table></body></html>';
  LocationGuid: any = [];
  FromDate: string = '';
  ToDate: string = '';
  IssueList: any = [];
  CenterList: any;
  LocationList: any;
  defaultData: any;
  selectedFromDate: any = "";
  selectedToDate: any = "";
  isDisable: boolean = true;
  cleardateControl: FormControl = new FormControl();
  clearControl: FormControl = new FormControl();
  CenterclearControl: FormControl = new FormControl();
  clearFromDateControl: FormControl = new FormControl();
  noDataFound: boolean = false;
  toDate: any;
  fromDate: any;
  locationGuid: any;
  buttonDisable: boolean = true;
  IsStore: boolean;
  totalPageNumbers : any
  constructor(private allReportsService: AllReportsService,
    private authservice: AuthenticationService,
    private quotationservice: QuotationService,
    private datepipe: DatePipe,
    public calendar: NgbCalendar
  ) { }

  ngOnInit(): void {
    // this.getIssueReports();
    this.getDefaultIssueReportsData();
    this.IsStore = JSON.parse(this.authservice.LoggedInUser.STORE)
  }
  /**
   * this service method used to get the issue reports details
   * @param type 
   */
  getIssueReports(type: any = null) {
    // this.globalservice.startSpinner();
    this.shimmerVisible = true;
    this.IssueList = []
    if (this.LocationGuid.length == 0) {
      this.LocationGuid = this.authservice.LoggedInUser.DEFAULTROLES.toLowerCase().includes('ADMIN'.toLowerCase()) && this.authservice.LoggedInUser.LOCATIONSGUID == '00000000-0000-0000-0000-000000000000' ? '00000000-0000-0000-0000-000000000000' : this.authservice.LoggedInUser.LOCATIONSGUID.split(",");
    }
    this.allReportsService.getIssueReports(this.LocationGuid, this.FromDate, this.ToDate, this.IsStore).subscribe(data => {
      this.IssueList = data || []
      // this.globalservice.stopSpinner();
      this.shimmerVisible = false;
      if (this.IssueList?.length > 0) {
        type == 'pdf' ? this.downloadReport()  : type == 'excel' ? this.downloadExcel() : "";
        this.noDataFound = false
      }
      else {
        this.noDataFound = true
      }
    }, error => {
      // this.globalservice.stopSpinner();
      this.shimmerVisible = false;
    }
    )
  }
  /**
   * this service method used to get the centers and locations
   */
  getDefaultIssueReportsData() {
    // this.globalservice.startSpinner();
    this.shimmerVisible = true;
    const DepotmentGuid = this.authservice.LoggedInUser.DEFAULTROLES.toLowerCase().includes('ADMIN'.toLowerCase()) && this.authservice.LoggedInUser.LOCATIONSGUID == '00000000-0000-0000-0000-000000000000' ? '00000000-0000-0000-0000-000000000000' : this.authservice.LoggedInUser.LOCATIONSGUID.split(",");
    this.quotationservice.getQuotationPostDefaults(DepotmentGuid).subscribe(({ Result }) => {
      this.defaultData = Result;
      this.LocationList = Result.LstQuotationCenterLocationType;
      this.CenterList = Result.LstQuotationStateDetailsType.filter((f: { CenterGuid: any; }) => this.LocationList.some((filter: { CenterGuid: any; }) => filter.CenterGuid === f.CenterGuid));
      // this.globalservice.stopSpinner();
      this.shimmerVisible = false;
    }, error => {
      // this.globalservice.stopSpinner();
      this.shimmerVisible = false;
    });
  }
  /**
   * this event used to select the from location
   * @param event 
   */
  selectFromDate(event: any) {
    this.ToDate = '';
    this.cleardateControl.reset();
    this.noDataFound = false
    this.isDisable = true
    this.selectedFromDate = event
    this.selectedToDate = " "
    this.FromDate = event.year + "-" + event.month + "-" + event.day
  }
  /**
   * this event used to select the to date
   * @param event 
   */
  selectToDate(event: any) {
    this.noDataFound = false
    this.isDisable = false
    this.selectedToDate = event
    this.ToDate = event.year + "-" + event.month + "-" + event.day
  }
  /**
   * this event used to filters the centers and locations
   * @param event 
   */
  filterData(event: any) {
    this.LocationGuid = []
    if (event != undefined) {
      if (event.CenterLocationGuid != undefined) {
        this.buttonDisable = false;
        this.LocationGuid = event.CenterLocationGuid
        this.IsStore = event.IsStore
      }
      this.CenterList = this.defaultData.LstQuotationStateDetailsType.filter((f: { CenterGuid: any; }) => f.CenterGuid == event.CenterGuid);
      this.LocationList = this.defaultData.LstQuotationCenterLocationType.filter((f: { CenterGuid: any; }) => f.CenterGuid == event.CenterGuid);
    } else {
      this.clearControl.reset();
      this.CenterclearControl.reset();
      this.buttonDisable = true
      // this.noDataFound = false
      // this.isDisable = false
      this.LocationList = this.defaultData.LstQuotationCenterLocationType
      this.CenterList = this.defaultData.LstQuotationStateDetailsType.filter((f: { CenterGuid: any; }) => this.LocationList.some((filter: { CenterGuid: any; }) => filter.CenterGuid === f.CenterGuid));
    }
  }
  /**
   * this event used to clear the colums
   */
  clearFilters() {
    this.IssueList=[];
    this.buttonDisable = true
    this.isDisable = true
    this.noDataFound = false
    this.LocationGuid = []
    this.FromDate = ''
    this.ToDate = ''
    this.clearFromDateControl.reset();
    this.cleardateControl.reset();
    this.clearControl.reset();
    this.CenterclearControl.reset();
    this.LocationList = this.defaultData.LstQuotationCenterLocationType
    this.CenterList = this.defaultData.LstQuotationStateDetailsType.filter((f: { CenterGuid: any; }) => this.LocationList.some((filter: { CenterGuid: any; }) => filter.CenterGuid === f.CenterGuid));
  }
  /**
   * this event used to remove the location
   */
  removeLocation() {
    this.locationGuid = []
  }
  async downloadReport(){
    await  this.downloadPdf();
    this.downloadPdfNew();
}
PrepareData() : any[]{
  interface Issue {
    IndentNo: string;
    FromLocation: string;
    ToLocation: string;
    ItemName: string;
    ItemExpiryDate : any;
    MaterialIssueNo: string;
    BarcodeNo: any;
    CreatedDt: any;
    ReqQty: any;
    SendQty: any;
    RejectQuantity: any;
    Rate: any;
    DiscountAmount: any;
    TaxPer: any;
    ReceiveAmt: any;
    ReceiveQty: any;
  }
 return this.IssueList.map((issue: Issue, index: number) => [ 
    { content: index + 1, styles: { minCellWidth: 10 } },
    { content: issue.IndentNo, styles: { minCellWidth: 5 } }, 
    { content: issue.MaterialIssueNo, styles: { minCellWidth: 15 } },
    { content: issue.BarcodeNo == ""|| issue.BarcodeNo==null? 'N/A' : issue.BarcodeNo, styles: { minCellWidth: 15 } },
    { content: this.datepipe.transform(issue.CreatedDt, 'dd-MM-yyyy HH:mm:ss'), styles: { minCellWidth: 15 } },
    { content: issue.ToLocation, styles: { minCellWidth: 30 } },
    { content: issue.FromLocation, styles: { minCellWidth: 30 } },
    { content: issue.ItemName, styles: { minCellWidth: 15 } },
    { content: this.datepipe.transform(issue.ItemExpiryDate, 'dd-MM-yyyy HH:mm:ss'), styles: { minCellWidth: 15 } },
    { content: issue.ReqQty, styles: { minCellWidth: 15 } },
    { content: issue.SendQty, styles: { minCellWidth: 15 } },
    { content: issue.ReceiveQty, styles: { minCellWidth: 15 } },
    { content: issue.ReceiveQty==0?0:issue.RejectQuantity, styles: { minCellWidth: 15 } },
    { content: issue.Rate, styles: { minCellWidth: 15 } },
    { content: issue.ReceiveAmt, styles: { minCellWidth: 15 } },
    { content: issue.DiscountAmount, styles: { minCellWidth: 15 } },
    { content: issue.TaxPer, styles: { minCellWidth: 15 } },
    { content: issue.ReceiveAmt * issue.ReceiveQty, styles: { minCellWidth: 15 } },
  ]);
}
  /**
   * this event used to download the pdf
   */
  downloadPdf() {
    const doc = new jsPDF({ orientation: 'landscape' });
    const imageHeight = 15;
    const cursorY = imageHeight + 30;
    const tableWidth = 290;
    let currentPageNumber = 0;
    autoTable(doc, {
      head: [this.createHeaderCols()],
      body: this.PrepareData(),
      startY: cursorY,
      tableWidth: tableWidth,
      margin: { left: 3 },
      didDrawPage: (data) => {
        currentPageNumber++; 
        this.totalPageNumbers = currentPageNumber
      },
    });
  }
  downloadPdfNew() {
    const doc = new jsPDF({ orientation: 'landscape' });
    const imageUrl =
      'https://yoda-inventory-management.s3.ap-south-1.amazonaws.com/yodalims/invoices/yoda_logo';
    const imageWidth = 110;
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
      const headline1Content = 'Issue Report Summary';
      const headline1XPos = 110;
      const headline1YPos = imageYPos + imageHeight + 10-data;
      const headline1FontSize = 10;
      doc
        .text(headline1Content, headline1XPos, headline1YPos)
        .setFontSize(headline1FontSize);
    }
    const createSubTitle = (data:any) =>{
      const headline2Content = 'Period From: ' + this.datepipe.transform(this.FromDate, "dd-MM-yyyy") + ' Period To: ' + this.datepipe.transform(this.ToDate, "dd-MM-yyyy");
      const headline2XPos = 110;
      const headline2YPos = imageYPos + imageHeight + 16-data;
      const headline2FontSize = 10;
      doc
        .text(headline2Content, headline2XPos, headline2YPos)
        .setFontSize(headline2FontSize);
    }
    const cursorY = imageHeight + 30;
    const tableWidth = 290
    let currentPageNumber = 0;
    autoTable(doc, {
      head: [this.createHeaderCols()],
      body: this.PrepareData(),
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
    doc.save('issue-report.pdf');
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
      { content: 'Indent #', styles: { ...headerColStyles } },
      { content: 'Material Issue No', styles: { ...headerColStyles } },
      { content: 'Barcode No.', styles: { ...headerColStyles } },
      { content: 'Issue Date', styles: { ...headerColStyles } },
      { content: 'Dispatch Location', styles: { ...headerColStyles } },
      { content: 'Receive Location', styles: { ...headerColStyles } },
      { content: 'Item Name', styles: { ...headerColStyles } },
      { content: 'Item Expiry Date', styles: { ...headerColStyles } },
      { content: 'Request Quantity', styles: { ...headerColStyles } },
      { content: 'Issue Quantity', styles: { ...headerColStyles } },
      { content: 'Receive Quantity', styles: { ...headerColStyles } },
      { content: 'Return Quantity', styles: { ...headerColStyles } },
      { content: 'Rate (Rs)', styles: { ...headerColStyles } },
      { content: 'Buy Price (Rs)', styles: { ...headerColStyles } },
      { content: 'Discount Amt (Rs)', styles: { ...headerColStyles } },
      { content: 'Tax %', styles: { ...headerColStyles } },
      { content: 'Issue Amt (Rs)', styles: { ...headerColStyles } },
    ];
  }

  /**
   * this event used to download the Excel
   */
  downloadExcel() {
    const header = ['Indent No.', 'Material Issue No', 'Issue Date', 'Dispatch Location', 'Recive Location', 'Item Name','Item Expiry Date','Vendor Batch number', 'Issues By Name','Issued By Date','Received By Name','Received By Date','Request Quantity', 'Issue Quantity','Receive Quantity', 'Return Quantity','Return Price','Buy Price Per Unit', 'Issue Amt'];
    // Create workbook and worksheet
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('Sharing Data');
    // Add Header Row
    const fromDateParts = this.FromDate.split('-');
    const toDateParts = this.ToDate.split('-');
    const formattedFromDate = this.FromDate != "" ?fromDateParts[2] + '-' + fromDateParts[1] + '-' + fromDateParts[0] : null;
    const formattedToDate = this.ToDate != "" ? toDateParts[2] + '-' + toDateParts[1] + '-' + toDateParts[0]:null;
    const headline2Content = 'Period From: ' + formattedFromDate + ' Period To: ' + formattedToDate;
    worksheet.addRow([null,null,null,null,null,null,"Issue Report"])
    worksheet.addRow([null,null,null,null,null,null,headline2Content])
    const cell1 = worksheet.getCell('G1');
  const cell2 = worksheet.getCell('G2');
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
    worksheet.getColumn(1).width = 20;
    worksheet.getColumn(2).width = 30;
    worksheet.getColumn(3).width = 20;
    worksheet.getColumn(4).width = 20;
    worksheet.getColumn(5).width = 30;
    worksheet.getColumn(6).width = 30;
    worksheet.getColumn(7).width = 30;
    worksheet.getColumn(8).width = 20;
    worksheet.getColumn(9).width = 20;
    worksheet.getColumn(10).width = 20;
    worksheet.getColumn(11).width = 20;
    worksheet.getColumn(12).width = 20;
    worksheet.getColumn(13).width = 20;
    worksheet.getColumn(14).width = 20;
    worksheet.getColumn(15).width = 20;

    // worksheet.addRow([]);

    // Add Data and Conditional Formatting
    this.IssueList.forEach((item: any) => {
      const row = worksheet.addRow([
        item.IndentNo,
        item.MaterialIssueNo,
        this.datepipe.transform(item.CreatedDt, 'dd-MM-yyyy HH:mm:ss'),
        item.ToLocation,
        item.FromLocation,
        item.ItemName,
        this.datepipe.transform(item.ItemExpiryDate, 'dd-MM-yyyy HH:mm:ss'),
        item.VendorBatchNumber ? item.VendorBatchNumber : 'N/A',
        item.IssuedByName ? item.IssuedByName : 'N/A',
        item.IssuedByDate ? this.datepipe.transform(item.IssuedByDate, 'dd-MM-yyyy HH:mm:ss') : 'N/A',
        item.ReceiveByUserName ? item.ReceiveByUserName : 'N/A',
        item.ReceiveDate ? this.datepipe.transform(item.ReceiveDate, 'dd-MM-yyyy HH:mm:ss') : 'N/A',
        item.ReqQty,
        item.SendQty,
        item.ReceiveQty,
        item.ReceiveQty==0?0:item.RejectQuantity,
        item.ReceiveAmt * item.ReceiveQty==0?0:item.RejectQuantity,
        item.ReceiveAmt,
        item.ReceiveAmt * item.SendQty
      ]);
    });
    // Create a file name for the downloaded file
    const fileName = 'IssueReport-print.xlsx';
    // Generate Excel File with given name
    workbook.xlsx.writeBuffer().then((data: any) => {
      const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, fileName);
    });
  }
}
