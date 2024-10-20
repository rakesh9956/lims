import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { NgbCalendar, NgbDateParserFormatter, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { AllReportsService } from 'src/app/core/Services/all-reports.service';
import { AuthenticationService } from 'src/app/core/Services/authentication.service';
import { QuotationService } from 'src/app/core/Services/quotation.service';
import * as saveAs from 'file-saver';
import { Workbook } from 'exceljs';
import { CustomDateParserFormatter } from 'src/app/core/Services/ngbdate-format.service';
import { AllItemsService } from 'src/app/core/Services/all-items.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ColumnMode } from '@swimlane/ngx-datatable';
@Component({
  selector: 'app-stock-verification-report',
  templateUrl: './stock-verification-report.component.html',
  styleUrls: ['./stock-verification-report.component.scss'],
  providers: [
    { provide: NgbDateParserFormatter, useClass: CustomDateParserFormatter },
  ],
})
export class StockVerificationReportComponent implements OnInit {
  ColumnMode = ColumnMode;
  loadingIndicator : boolean = true;
  shimmerVisible: boolean;
  defaultData: any = [];
  LocationList: any = [];
  centerList: any = [];
  LocationGuid: any='';
  ToDate: any='';
  isDisable: boolean = true;
  noDataFound: boolean = false;
  FromDate: any='';
  selectfromDate: any;
  CenterclearControl: FormControl = new FormControl();
  clearControl: FormControl = new FormControl();
  cleardateControl: FormControl = new FormControl();
  clearFromControl: FormControl = new FormControl();
  clearItemControl: FormControl = new FormControl();
  StockVerification: any = [];
  UnparsedHtml: any='<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta content="IE=edge" http-equiv="X-UA-Compatible"><meta content="width=device-width,initial-scale=1" name="viewport"><title>Stock Status Report</title><style>table{border-collapse:collapse;border:1px solid #000}table td,table th{border-bottom:1px solid #000;border-right:1px solid #000;padding:5px;text-align:left;word-wrap:break-word;word-break:break-all;font-size:10px}table th{background-color:#ccc}.logo{height:28px;display:flex;align-items:center;justify-content:center;padding:20px 0}</style></head><body><table style="text-align:center;table-layout:fixed" width="100%"><tbody><tr><td><div class="logo"><img data-v-0e549244="" src="assets/images/YodaLIMSLogo.png" alt="Yoda LIMS"></div></td></tr></tbody></table><table style="text-align:center;table-layout:fixed" width="100%"><tr><td style="text-align:center;font-weight:700;font-size:16px">Stock Status Report</td></tr><tr><td style="text-align:center;font-weight:700;font-size:14px">As On :%%newDate%%</td></tr></table><table style="table-layout:fixed;margin-top:30px" width="100%"><thead><tr><th>Stock Id</th><th>Item Name</th><th>Location</th><th>Batch #</th><th>Maker By</th><th>Maker Date</th><th>checked By</th><th>Checked Date</th><th>Approved By</th><th>Approved Date</th><th>Approval status</th><th>GRN Quantity</th><th>Rate ₹</th><th>Discount %</th><th>Discount Amt ₹</th><th>Tax %</th><th>Tax Amt ₹</th><th>Buy Price ₹</th></tr></thead><tbody><tr id="AprovedStockReports"><td>%%StockId%%</td><td>%%ItemName%%</td><td>%%Location%%</td><td>%%BatchNumber%%</td><td>%%EntryBy%%</td><td>%%EntryDate%%</td><td>%%CheckedBy%%</td><td>%%ChekedDate%%</td><td>%%AprovedBy%%</td><td>%%AproveDate%%</td><td>%%Staus%%</td><td>%%GRNQuantity%%</td><td>%%Rate%%</td><td>%%discoutper%%</td><td>%%discountamt%%</td><td>%%taxper%%</td><td>%%taxamt%%</td><td>%%Unitprice%%</td></tr><tr><th colspan="17" style="text-align:right">Total Amount</th><th>%%TotalAmount%%</th></tr></tbody></table></body></html>';
  currentDate: any;
  TotalAmount: any;
  Allitems: any=[];
  ItemGuid: any='';
  totalPageNumbers : any;
  constructor(
    private allReportsService: AllReportsService,
    private datePipe: DatePipe,
    private quotationService: QuotationService,
    private authservice: AuthenticationService,
    public calender: NgbCalendar,
    private allItemsService:AllItemsService
  ) { }

  ngOnInit(): void {
    this.GetReportsLocation();
    const currentDate = new Date();
    this.currentDate = this.datePipe.transform(currentDate, 'dd-MMM-yyyy hh:mm a');
    this.GetAllItems();
  }
  /**
   * this service method used to get the defualt centers and locations
   */
  GetReportsLocation() {
    this.shimmerVisible = true;
    let DepartmentGuid = this.authservice.LoggedInUser.DEFAULTROLES.toLowerCase().includes('ADMIN'.toLowerCase()) && this.authservice.LoggedInUser.LOCATIONSGUID == '00000000-0000-0000-0000-000000000000' ? '00000000-0000-0000-0000-000000000000' :
      this.authservice.LoggedInUser.LOCATIONSGUID.split(",");
    this.quotationService.getQuotationPostDefaults(DepartmentGuid).subscribe((data: any,) => {
      this.defaultData = data.Result;
      this.LocationList = data.Result.LstQuotationCenterLocationType;
      this.centerList = data.Result.LstQuotationStateDetailsType.filter((f: { CenterGuid: any; }) => this.LocationList.some((filter: { CenterGuid: any; }) => filter.CenterGuid === f.CenterGuid));
      this.shimmerVisible = false;
    }, error => {
      this.shimmerVisible = false;
    })
  }
  /**
   * this event filter the locations and centers
   * @param event 
   */
  filterData(event: any) {
    if (event != undefined) {
      if (event.CenterLocationGuid != undefined) {
        this.LocationGuid = event.CenterLocationGuid
      }
      this.LocationList = this.defaultData.LstQuotationCenterLocationType.filter((f: { CenterGuid: any; }) => f.CenterGuid == event.CenterGuid);
      this.centerList = this.defaultData.LstQuotationStateDetailsType.filter((f: { CenterGuid: any; }) => f.CenterGuid == event.CenterGuid);
    }
    else {
      this.LocationGuid = '';
      this.clearControl.reset();
      this.CenterclearControl.reset();
      this.LocationList = this.defaultData.LstQuotationCenterLocationType
      this.centerList = this.defaultData.LstQuotationStateDetailsType.filter((f: { CenterGuid: any; }) => this.LocationList.some((filter: { CenterGuid: any; }) => filter.CenterGuid === f.CenterGuid));
    }
  }
   /**
   * this service method used to get all items
   */
   GetAllItems() {
    this.shimmerVisible = true
    let items = {
      PageNumber: 1,
      RowCount: 40,
      Keyword: '',
      OrderBy: '',
      SortType: '',
      IsActive:true
    }
    this.allItemsService.getAllItems(items).subscribe((data: { Result: { getAllItemsResponses: any}; }) => {
       const Itemsdata = data.Result.getAllItemsResponses;
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
  /**
   * this event used to select the from date
   * @param event 
   */
  selectFromDate(event: any) {
    this.ToDate = '';
    //this.isDisable = true;
    this.cleardateControl.reset()
    this.selectfromDate = event
    this.FromDate = event.year + "-" + event.month + "-" + event.day;
  }
  /**
   * this event used to select the to date
   * @param event 
   */
  selectToDate(event: any) {
    this.ToDate = event.year + "-" + event.month + "-" + event.day;
    if(this.ToDate!=''){
      this.isDisable = false;
      this.noDataFound=false;
    }
  }
  /**
   * this service method used to get the stock verification details
   * @param type 
   */
  getStatusReportData(type: any = null) {
    this.shimmerVisible = true;
    if (this.LocationGuid?.length == 0) {
      this.LocationGuid = this.authservice.LoggedInUser.DEFAULTROLES.toLowerCase().includes('ADMIN'.toLowerCase()) && this.authservice.LoggedInUser.LOCATIONSGUID == '00000000-0000-0000-0000-000000000000' ? '00000000-0000-0000-0000-000000000000' : this.authservice.LoggedInUser.LOCATIONSGUID.split(",");
    }
    this.allReportsService.GetStockVerificationReports(this.FromDate, this.ToDate, this.LocationGuid,this.ItemGuid).subscribe(data => {
      this.StockVerification = data||[];
      this.TotalAmount = this.StockVerification.reduce((total: any, report: { UnitPrice: any; ReleasedCount: any }) => (total + (report.UnitPrice * report.ReleasedCount)), 0);  
      this.shimmerVisible = false;
      if (this.StockVerification?.length == 0) {
        this.noDataFound = true;
      } else {
        type == 'pdf' ? this.downloadReport() : type == 'excel' ?  this.downloadExcel() : "";
        this.noDataFound = false; 
        
      }
    }, error => {
      this.shimmerVisible = false;
    })
  }
  /**
   * this click event used to Download the pdf
   */
  // DownloadPdf() {
  //   let html = "";
  //   html = this.UnparsedHtml;
  //   const replacements: any = {
  //     '%%newDate%%': this.currentDate || '',
  //     '%%TotalAmount%%':this.TotalAmount.toString().match(/^\d+(?:\.\d{0,2})?/)
  //   };
  //   for (const key in replacements) {
  //     html = html.replace(key, replacements[key]);
  //   }
  //   if (this.StockVerification?.length > 0) {
  //     let dochtml: any = '';
  //     dochtml = new DOMParser().parseFromString(html, 'text/html');
  //     let AprovedStockReports: any = dochtml.querySelector('#AprovedStockReports');

  //     if (AprovedStockReports) {
  //       AprovedStockReports.innerHTML = '';
  //       for (let i = 0; i < this.StockVerification.length; i++) {
  //         let updatedTemplate: any = '';
  //         updatedTemplate = this.UnparsedHtml
  //           .replace('%%StockId%%', this.StockVerification[i].StockId)
  //           .replace('%%ItemName%%', this.StockVerification[i].ItemName)
  //           .replace('%%Location%%', this.StockVerification[i].location)
  //           .replace('%%BatchNumber%%', this.StockVerification[i].batchnumber==null?'N/A':this.StockVerification[i].batchnumber)
  //           .replace('%%EntryBy%%', this.StockVerification[i].MakerBy)
  //           .replace('%%EntryDate%%',this.datePipe.transform(this.StockVerification[i].createdDt, 'dd-MM-yyyy'))
  //           .replace('%%CheckedBy%%', this.StockVerification[i].ChekedBy==null?'N/A':this.StockVerification[i].ChekedBy)
  //           .replace('%%ChekedDate%%', this.StockVerification[i].ChekedDate=='0001-01-01T00:00:00'?'N/A':this.datePipe.transform(this.StockVerification[i].ChekedDate, 'dd-MM-yyyy'))
  //           .replace('%%AprovedBy%%', this.StockVerification[i].AprovedBy==null?'N/A':this.StockVerification[i].AprovedBy)
  //           .replace('%%AproveDate%%', this.StockVerification[i].AprovedDate=='0001-01-01T00:00:00'?'N/A':this.datePipe.transform(this.StockVerification[i].AprovedDate,'dd-MM-yyyy'))
  //           .replace('%%Staus%%', this.StockVerification[i].StatusName=='Aproved'?'Approved':this.StockVerification[i].StatusName)
  //           .replace('%%GRNQuantity%%', this.StockVerification[i].ReleasedCount)
  //           //.replace('%%NewQty%%', this.StockVerification[i].RemaningQuantity)
  //           .replace('%%Rate%%', this.StockVerification[i].Rate)
  //           .replace('%%discoutper%%', this.StockVerification[i].DiscountPer)
  //           .replace('%%discountamt%%', this.StockVerification[i].DiscountAmount.toString().match(/^\d+(?:\.\d{0,2})?/))
  //           .replace('%%taxper%%', this.StockVerification[i].TaxPer)
  //           .replace('%%taxamt%%', this.StockVerification[i].TaxAmount.toString().match(/^\d+(?:\.\d{0,2})?/))
  //           .replace('%%Unitprice%%', this.StockVerification[i].UnitPrice.toString().match(/^\d+(?:\.\d{0,2})?/))

  //         let jobElement: any = '';
  //         jobElement = new DOMParser().parseFromString(updatedTemplate, 'text/html').querySelector('#AprovedStockReports');
  //         AprovedStockReports.appendChild(jobElement);
  //       }
  //     }
  //     html = dochtml.documentElement.outerHTML;
  //   }
  //   const options = {
  //     filename: `StockStatusReport-report.pdf`,
  //     margin: 0.2,
  //     image: { type: 'jpeg', quality: 0.98 },
  //     html2canvas: { scale: 1 },
  //     jsPDF: { unit: 'in', format: 'a3', orientation: 'landscape' }
  //   };
  //   const element = html;
  //   html2pdf().from(element).set(options).save();
  // }
  PrepareData () :any[]{
    interface Stock {
      StockId: string;
      ItemName: string;
      VendorItemName : string;
      location: any;
      batchnumber: any;
      MakerBy: any;
      createdDt: any;
      ChekedBy: any;
      ChekedDate: any;
      AprovedBy: any;
      AprovedDate: any;
      StatusName: any;
      ReleasedCount: any;
      NewQty:any
      Rate: any;
      DiscountPer: any;
      DiscountAmount: any;
      TaxPer: any;
      TaxAmount: any;
      UnitPrice:any
    }
     return this.StockVerification.map((stock: Stock, index: number) => [ // numeric value
      { content: index + 1, styles: { minCellWidth: 8 } },
      { content: stock.StockId, styles: { minCellWidth: 10 } }, 
      { content: stock.ItemName, styles: { minCellWidth: 10 } }, 
      { content: stock.VendorItemName ? stock.VendorItemName : 'N/A', styles: { minCellWidth: 10 } }, 
      { content: stock.location, styles: { minCellWidth: 20 } },
      { content: stock.batchnumber==null?'N/A':stock.batchnumber, styles: { minCellWidth: 10 } },
      { content: stock.MakerBy, styles: { minCellWidth: 20 } },
      { content: stock.createdDt==null?"N/A":this.datePipe.transform(stock.createdDt, 'dd-MM-yyyy HH:mm:ss'), styles: { minCellWidth: 23 } },
      { content: stock.ChekedBy==null?"N/A":stock.ChekedBy, styles: { minCellWidth: 20 } },
      { content: stock.ChekedDate=="0001-01-01T00:00:00"?"N/A":this.datePipe.transform(stock.ChekedDate, 'dd-MM-yyyy HH:mm:ss'), styles: { minCellWidth: 23 } },
      { content: stock.AprovedBy==null?"N/A":stock.AprovedBy, styles: { minCellWidth: 20 } },
      { content: stock.AprovedDate=="0001-01-01T00:00:00"?"N/A":this.datePipe.transform(stock.AprovedDate, 'dd-MM-yyyy HH:mm:ss'), styles: { minCellWidth: 23 } },
      { content: stock.StatusName=='Aproved'?'Approved':stock.StatusName, styles: { minCellWidth: 20 } },
      { content: stock.ReleasedCount==null?"N/A":stock.ReleasedCount, styles: { minCellWidth: 15 } },
      { content: stock.Rate==null?"N/A":stock.Rate, styles: { minCellWidth: 10 } },
      { content: stock.DiscountPer, styles: { minCellWidth: 10 } },
      { content: stock.DiscountAmount==0?"N/A":stock.DiscountAmount.toString().match(/^\d+(?:\.\d{0,2})?/), styles: { minCellWidth: 12 } },
      { content: stock.TaxPer==null?"N/A":stock.TaxPer, styles: { minCellWidth: 15 } },
      { content: stock.TaxAmount==null?"N/A":stock.TaxAmount.toString().match(/^\d+(?:\.\d{0,2})?/), styles: { minCellWidth: 11 } },
      { content: stock.UnitPrice.toString().match(/^\d+(?:\.\d{0,2})?/), styles: { minCellWidth: 12 } },
    ]);
  }
  async downloadReport(){
    await  this.DownloadPdf();
      this.DownloadPdfview();
    }
  DownloadPdf() {
    const doc = new jsPDF({ orientation: 'landscape' });
    const imageHeight = 15;
    let currentPageNumber = 0;
    const cursorY = imageHeight + 30;
    autoTable(doc, {
      head: [this.createHeaderCols()],
      body: this.PrepareData(),
      startY: cursorY,
      margin: { left: 3 },
      didDrawPage: (data) => {
        currentPageNumber++; 
        this.totalPageNumbers = currentPageNumber
      },
    });
  }
  DownloadPdfview() {
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
      const headline1Content = 'Stock Status Report Summary';
      const headline1XPos = 110;
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
      body: this.PrepareData(),
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
    });

    doc.save('Stock-Status-report.pdf');

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
      { content: 'Stock Id', styles: { ...headerColStyles } },
      { content: 'Item Name', styles: { ...headerColStyles } },
      { content: 'Vendor Item Name', styles: { ...headerColStyles } },
      { content: 'Location', styles: { ...headerColStyles } },
      { content: 'Batch #', styles: { ...headerColStyles } },
      { content: 'Maker By', styles: { ...headerColStyles } },
      { content: 'Maker Date', styles: { ...headerColStyles } },
      { content: 'Checked By', styles: { ...headerColStyles } },
      { content: 'Checked Date', styles: { ...headerColStyles } },
      { content: 'Approved By', styles: { ...headerColStyles } },
      { content: 'Approved Date', styles: { ...headerColStyles } },
      { content: 'Approval status', styles: { ...headerColStyles } },
      { content: 'GRN Qty', styles: { ...headerColStyles } },
      { content: 'Rate', styles: { ...headerColStyles } },
      { content: 'Disc %', styles: { ...headerColStyles } },
      { content: 'Disc Amt', styles: { ...headerColStyles } },
      { content: 'Tax %', styles: { ...headerColStyles } },
      { content: 'Tax Amt', styles: { ...headerColStyles } },
      { content: 'Buy Price', styles: { ...headerColStyles } },
    ];
  }


  /**
* this click event used to Download the Excel
*/
  downloadExcel() {
    const header = ['Stock Id', 'Item Name','Vendor Item Name', 'Location', 'Batch Number', 'Entry By','Entry Date','Checked By','Checked Date','Approved By', 'Approved Date', 'Aproval status', 'GRN Quantity', 'Rate ₹', 'Discount Per %', 'Discount Amt ₹', 'Tax Per %', 'Tax Amt ₹', 'Unit Price ₹'];
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
    worksheet.addRow([null,null,null,null,null,null,null,null,"Stock Status Report"])
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
    const headerRow = worksheet.addRow(header);
    // Cell Style : Fill and Border
    // const headerRow1 = worksheet.addRow(header1);
    // headerRow1.height = 20;
    // headerRow1.font = {
    //  bold: true,
    //  size: 14,
    // };
     // headerRow1.alignment = { vertical: 'middle', horizontal: 'center' };
    headerRow.eachCell((cell: any, number: any) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFFF00' },
        bgColor: { argb: 'FF0000FF' }
      };
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    });
    worksheet.getColumn(1).width = 15;
    worksheet.getColumn(2).width = 50;
    worksheet.getColumn(3).width = 50;
    worksheet.getColumn(4).width = 20;
    worksheet.getColumn(5).width = 20;
    worksheet.getColumn(6).width = 20;
    worksheet.getColumn(7).width = 20;
    worksheet.getColumn(8).width = 20;
    worksheet.getColumn(9).width = 20;
    worksheet.getColumn(10).width = 20;
    worksheet.getColumn(11).width = 20;
    worksheet.getColumn(12).width = 20;
    worksheet.getColumn(13).width = 20;
    worksheet.getColumn(14).width = 20;
    worksheet.getColumn(15).width = 20;
    worksheet.getColumn(16).width = 20;
    worksheet.getColumn(17).width = 20;
    worksheet.getColumn(18).width = 20;
    worksheet.getColumn(19).width = 20;

    // worksheet.addRow([]);
    this.StockVerification.forEach((item: any) => {
      const row = worksheet.addRow([
        item.StockId,
        item.ItemName,
        item.VendorItemName ? item.VendorItemName : 'N/A',
        item.location,
        item.batchnumber==null?'N/A':item.batchnumber,
        item.MakerBy,
        this.datePipe.transform(item.createdDt,'dd-MM-yyyy HH:mm:ss'),
        item.ChekedBy==null?'N/A':item.ChekedBy,
        item.ChekedDate=='0001-01-01T00:00:00'?'N/A':this.datePipe.transform(item.ChekedDate,'dd-MM-yyyy HH:mm:ss'),
        item.AprovedBy==null?'N/A':item.AprovedBy,
        item.AprovedDate=='0001-01-01T00:00:00'?'N/A': this.datePipe.transform(item.AprovedDate,'dd-MM-yyyy HH:mm:ss'),
        item.StatusName=='Aproved'?'Approved':item.StatusName,
        item.ReleasedCount,
        item.Rate,
        item.DiscountPer,
        item.DiscountAmount,
        item.TaxPer,
        item.TaxAmount,
        item.UnitPrice
      ]);
    });
    const fileName = 'StockStatusReport-print.xlsx';
    workbook.xlsx.writeBuffer().then((data: any) => {
      const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, fileName);
    });
  }
  /**
   * this event used to clear the data
   */
  Onremove(){
    this.StockVerification=[];
    this.LocationGuid='';
    this.FromDate='';
    this.ToDate='';
    this.clearFromControl.reset();
    this.cleardateControl.reset();
    this.LocationList = this.defaultData.LstQuotationCenterLocationType
    this.centerList = this.defaultData.LstQuotationStateDetailsType.filter((f: { CenterGuid: any; }) => this.LocationList.some((filter: { CenterGuid: any; }) => filter.CenterGuid === f.CenterGuid));
    this.isDisable=true;
    this.clearControl.reset();
    this.CenterclearControl.reset();
    this.clearItemControl.reset();
    this.noDataFound=false;
  }
  /**
   * this event used to select the item
   * @param event 
   */
  OnselectItem(event:any){
    if(event==undefined||event==null){
      this.ItemGuid=''
    }
    else{
      this.ItemGuid=event.ItemGuid
    }
  }
}

