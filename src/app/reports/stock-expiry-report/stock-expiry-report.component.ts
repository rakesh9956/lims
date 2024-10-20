import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { NgbCalendar, NgbDateParserFormatter, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { Workbook } from 'exceljs';
import { AllReportsService } from 'src/app/core/Services/all-reports.service';
import { AuthenticationService } from 'src/app/core/Services/authentication.service';
import { CustomDateParserFormatter } from 'src/app/core/Services/ngbdate-format.service';
import { QuotationService } from 'src/app/core/Services/quotation.service';
import { saveAs } from 'file-saver';
import { DatePipe } from '@angular/common';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import { ColumnMode } from '@swimlane/ngx-datatable';

@Component({
  selector: 'app-stock-expiry-report',
  templateUrl: './stock-expiry-report.component.html',
  styleUrls: ['./stock-expiry-report.component.scss'],
  providers: [{ provide: NgbDateParserFormatter, useClass: CustomDateParserFormatter }]
})
export class StockExpiryReportComponent implements OnInit {
  shimmerVisible: boolean;
  selectedFromDate: NgbDateStruct;
  selectedTodate: NgbDateStruct;
  ColumnMode = ColumnMode;
  loadingIndicator : boolean = true;
  UnparsedHtml: any = '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Indent Report</title><style>table{border-collapse:collapse;border:1px solid #000}table td,table th{border-bottom:1px solid #000;border-right:1px solid #000;padding:5px;text-align:left;word-wrap:break-word;word-break:break-all;font-size:10px}table th{background-color:#ccc}.logo{height:28px;display:flex;align-items:center;justify-content:center;padding:20px 0}</style></head><body><table style="text-align:center;table-layout:fixed" width="100%"><tbody><tr><td><div class="logo"><img data-v-0e549244="" src="assets/images/YodaLIMSLogo.png" alt="Yoda LIMS"></div></td></tr></tbody></table><table style="text-align:center;table-layout:fixed" width="100%"><tbody><tr><td style="text-align:center;font-weight:700;font-size:16px">Stock Expiry Report</td></tr><tr><td style="text-align:center;font-weight:700;font-size:14px">As On :%%newDate%%</td></tr></tbody></table><table style="table-layout:fixed;margin-top:20px" width="100%"><thead><tr><th>Location name</th><th>Item name</th><th>Stcok Id</th><th>Batch Number</th><th>Stock In Hand</th><th>Initial Quantity</th><th>Type name</th><th>Expires in(days)</th><tbody><tr id="purchaseReport"><td>%%LocationName%%</td><td>%%ItemName%%</td><td>%%StockID%%</td><td>%%BatchNumber%%</td><td>%%StackinQuantity%%</td><td>%%GRNQuantity%%</td><td>%%CategoryTypeName%%</td><td>%%ExpiresOn%%</td></tr></tbody></table></body></html>';
  expiryReports: any;
  locationGuid: any=[];
  fromDate: any='';
  toDate: any='';
  defaultData: any;
  locationsList: any;
  centerList: any;
  isDisabled: boolean = true;
  ClearToDate: FormControl = new FormControl;
  selectfromDate: any;
  selecttoDate: any;
  noDataFound: boolean = false;
  CenterName: FormControl = new FormControl;
  LocationName: FormControl = new FormControl;
  ClearFromDate: FormControl = new FormControl;
  totalPageNumbers : any
  newDate: string | null;
  previousToDate: any;
  integer: boolean;
  IsStore:boolean;
  constructor( 
    private stockReportsServic: AllReportsService,
    private authservice: AuthenticationService,
    private quotationservice: QuotationService,
    public calendar: NgbCalendar,
    private datepipe: DatePipe   
    ) { }

  ngOnInit(): void {
    const currentDate = new Date();
    this.newDate = this.datepipe.transform(currentDate, 'dd-MMM-yyyy hh:mm a');
    this.getDefaultData(); 
    this.IsStore=this.authservice.LoggedInUser.STORE
  }

  getStockReports(type: any = null) {
    if(this.locationGuid?.length==0){
      this.locationGuid =this.authservice.LoggedInUser.DEFAULTROLES.toLowerCase().includes('ADMIN'.toLowerCase()) && this.authservice.LoggedInUser.LOCATIONSGUID=='00000000-0000-0000-0000-000000000000' ?'00000000-0000-0000-0000-000000000000': this.authservice.LoggedInUser.LOCATIONSGUID.split(",");
     }
    let exp= {
      LocationGuid: this.locationGuid,
      FromDate: this.fromDate,
      ToDate: this.toDate,
      IsStore:this.IsStore
    }
    // this.globalService.startSpinner();
    this.shimmerVisible=true;
    this.stockReportsServic.getStockExpiryReports(exp).subscribe(data =>{
      // this.globalService.stopSpinner();
      this.shimmerVisible=false;
      // this.expiryReports = data.filter((N: {ExpiresOn: any})=> N.ExpiresOn>0);      
      this.expiryReports = data ||[];
      if(this.expiryReports?.length == 0){
        this.noDataFound=true
      }else{
        type=='pdf'? this. downloadReport(): type=='excel'?this.DownloadExcel(): "";
        this.noDataFound=false
      }
    },err => {
      
    })
  }

  getDefaultData() {
    // this.globalService.startSpinner()
    this.shimmerVisible=true;
    const DepotmentGuid = this.authservice.LoggedInUser.DEFAULTROLES.toLowerCase().includes('ADMIN'.toLowerCase()) && this.authservice.LoggedInUser.LOCATIONSGUID == '00000000-0000-0000-0000-000000000000' ? '00000000-0000-0000-0000-000000000000' : this.authservice.LoggedInUser.LOCATIONSGUID.split(",");
    this.quotationservice.getQuotationPostDefaults(DepotmentGuid).subscribe(({ Result }) => {
      // this.globalService.stopSpinner();
      this.shimmerVisible=false;
    this.defaultData = Result;
    this.locationsList = Result.LstQuotationCenterLocationType;
    this.centerList = Result.LstQuotationStateDetailsType.filter((f: { CenterGuid: any; }) => this.locationsList.some((filter: { CenterGuid: any; }) => filter.CenterGuid === f.CenterGuid));
    },err=> {
      // this.globalService.stopSpinner();
      this.shimmerVisible=false;
    });    
  }

  ChangeLocation(event: any) {
    this.locationGuid = ''
    if (event!= undefined) {
      if (event.CenterLocationGuid != undefined) {      
        this.locationGuid = event.CenterLocationGuid;
      }
      this.IsStore=event.IsStore
      this.centerList = this.defaultData.LstQuotationStateDetailsType.filter((f: { CenterGuid: any; }) => f.CenterGuid == event.CenterGuid);
      this.locationsList = this.defaultData.LstQuotationCenterLocationType.filter((f: { CenterGuid: any; }) => f.CenterGuid == event.CenterGuid);
    } else { 
      this.noDataFound = false;
      // this.isDisabled = false;  
      this.locationsList = this.defaultData.LstQuotationCenterLocationType
      this.centerList = this.defaultData.LstQuotationStateDetailsType.filter((f: { CenterGuid: any; }) => this.locationsList.some((filter: { CenterGuid: any; }) => filter.CenterGuid === f.CenterGuid));
      this.CenterName.reset();
      this.LocationName.reset();
    }
  }

  selectFromDate(event: any) {
    this.toDate = '';
    this.ClearToDate.reset();
    this.isDisabled = true;  
    this.selectfromDate = event;
    this.fromDate = event.year + "-" + event.month + "-" + event.day;    
    this.noDataFound = false;
    this.previousToDate ='';
  }
 
  selectToDate(event: any) {
    //const key = event.key;    
    // if (!/^\d$|Backspace|ArrowLeft|ArrowRight|Delete$/i.test(key)) {
    //   event.preventDefault();      
    //   this.integer = false;
    //   event.target.value = event.target.value.replace(/[^0-9.]/g, '');
    // } else {
    //   this.integer = true;
    //   const newValue = event.target.value.trim();
    //   const hasChanged = newValue !== this.previousToDate;
    //   this.toDate = newValue;
    //   this.isDisabled = !(newValue !== '' && this.fromDate !== '');
    //   this.noDataFound = !hasChanged;
    //   this.previousToDate = hasChanged ? newValue : this.previousToDate;
    // }
    this.selecttoDate = event;
    this.toDate = event.year + "-" + event.month + "-" + event.day;
    this.isDisabled=false
    console.log("toDate",this.toDate)
  }
  clearData() {
    this.expiryReports=null;
    this.isDisabled = true;
    this.noDataFound = false;
    this.toDate = '';
    this.fromDate = '';
    this.selectfromDate = '';
    this.locationGuid = '';
    this.CenterName.reset();
    this.LocationName.reset();
    this.ClearFromDate.reset();
    this.ClearToDate.reset();
    this.locationsList = this.defaultData.LstQuotationCenterLocationType;
    this.centerList = this.defaultData.LstQuotationStateDetailsType.filter((f: { CenterGuid: any; }) => this.locationsList.some((filter: { CenterGuid: any; }) => filter.CenterGuid === f.CenterGuid));
  }
  // DownloadPdf() {
  //   let html = "";
  //   html = this.UnparsedHtml;
  //   const replacements: any = {
  //     '%%newDate%%': this.newDate || ''    
  //   };
  //   for (const key in replacements) {
  //     html = html.replace(key, replacements[key]);
  //   }
  //   let dochtml: any = '';
  //   dochtml = new DOMParser().parseFromString(html, 'text/html');
  //   let StockLedgerReports: any = dochtml.querySelector('#purchaseReport');
  //   if (StockLedgerReports) {
  //     StockLedgerReports.innerHTML = '';
  //     for (let i = 0; i < this.expiryReports.length; i++) {
  //       let updatedTemplate: any = '';
  //       updatedTemplate = this.UnparsedHtml 
  //       .replace('%%LocationName%%', this.expiryReports[i].LocationName == null ? 'N/A' : this.expiryReports[i].LocationName)
  //       .replace('%%ItemName%%', this.expiryReports[i].ItemName)
  //       .replace('%%StockID%%', this.expiryReports[i].stockID)
  //       .replace('%%BatchNumber%%', this.expiryReports[i].BatchNumber)
  //       .replace('%%StackinQuantity%%', this.expiryReports[i].RemaningQuantity==null?'N/A':this.expiryReports[i].RemaningQuantity-this.expiryReports[i].ReturnQuantity||0) 
  //       .replace('%%GRNQuantity%%', this.expiryReports[i].InitialCount==null?'N/A':this.expiryReports[i].InitialCount)
  //       .replace('%%CategoryTypeName%%', this.expiryReports[i].CategoryTypeName)
  //       .replace('%%ExpiresOn%%', this.expiryReports[i].ExpiresOn < 0 ? 'Expired': this.expiryReports[i].RemaningQuantity == 0 ||  this.expiryReports[i].RemaningQuantity==null ? 'N/A': this.expiryReports[i].ExpiresOn
  //   );
  //       let jobElement: any = '';
  //       jobElement = new DOMParser().parseFromString(updatedTemplate, 'text/html').querySelector('#purchaseReport');
  //       StockLedgerReports.appendChild(jobElement);
  //     }
  //     html = dochtml.documentElement.outerHTML;
  //     const options = {
  //       filename: `Stock-expiry-report.pdf`,
  //       margin: 0.1,
  //       image: { type: 'jpeg', quality: 0.98 },
  //       html2canvas: { scale: 1 },
  //       jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
  //     };
  //     const element = html;
  //     html2pdf().from(element).set(options).save();
  //   }
  // }
  async downloadReport(){
    await  this.DownloadPdf();
    this.DownloadPdfNew();
  }
  PrepareData() : any[]{
    interface Stock {
      LocationName: string;
      ItemName: string;
      VendorItemName : string;
      ApolloItemCode:string;
      DepartmentTypeName:string;
      MajorUnitName:string;
      BuyPrice:string;
      stockID: string;
      BatchNumber: string;
      RemaningQuantity: number;
      InitialCount: any;
      CategoryTypeName:any
      ExpiresOn: any;
      ReturnQuantity:any
      ExpiryDate:any
      UnitPrice:any
    }
   return this.expiryReports.map((stock: Stock, index: number) => [
      { content: index + 1, styles: { minCellWidth: 5 } },
      { content: stock.LocationName, styles: { minCellWidth: 25 } }, 
      { content: stock.ItemName, styles: { minCellWidth: 15 } },
      { content: stock.VendorItemName ? stock.VendorItemName : 'N/A', styles: { minCellWidth: 15 } },
      { content: stock.ApolloItemCode, styles: { minCellWidth: 15 } },
      { content: stock.DepartmentTypeName, styles: { minCellWidth: 15 } },
      { content: stock.MajorUnitName, styles: { minCellWidth: 15 } },
      { content: stock.BuyPrice, styles: { minCellWidth: 15 } },
      { content: stock.stockID==null?'N/A':stock.stockID, styles: { minCellWidth: 10 } },
      { content: stock.BatchNumber, styles: { minCellWidth: 10 } },
      { content: stock.RemaningQuantity==null?'N/A':stock.RemaningQuantity-stock.ReturnQuantity||0, styles: { minCellWidth: 15 } },
      { content: stock.InitialCount==null?'N/A':stock.InitialCount, styles: { minCellWidth: 11 } },
      { content: stock.UnitPrice* (stock.RemaningQuantity-stock.ReturnQuantity),styles: { minCellWidth: 11 } },
      { content: stock.CategoryTypeName, styles: { minCellWidth: 11 } },
      { content: stock.ExpiresOn < 0 ? 'Expired':stock.ExpiresOn, styles: { minCellWidth: 11 } },
      { content: this.datepipe.transform(stock.ExpiryDate, 'dd-MM-yyyy'), styles: { minCellWidth: 15 } },
    ]);
  }
  DownloadPdf() {
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
        this.totalPageNumbers=currentPageNumber 
      }
    });
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
      const headline1Content = 'Stock Expiry Report Summary';
      const headline1XPos = 110;
      const headline1YPos = imageYPos + imageHeight + 10-data;
      const headline1FontSize = 10;
      doc
        .text(headline1Content, headline1XPos, headline1YPos)
        .setFontSize(headline1FontSize);
    }
    const createSubTitle = (data:any) =>{
      const headline2Content = 'As On: ' + this.newDate;
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
    doc.save('Stock-expiry.pdf');
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
      { content: 'Location name', styles: { ...headerColStyles } },
      { content: 'Item name', styles: { ...headerColStyles } },
      { content: 'Vendor Item name', styles: { ...headerColStyles } },
      { content: 'Item Code', styles: { ...headerColStyles } },
      { content: 'Department', styles: { ...headerColStyles } },
      { content: 'UOM', styles: { ...headerColStyles } },
      { content: 'Unit Price', styles: { ...headerColStyles } },
      { content: 'GRN NO', styles: { ...headerColStyles } },
      { content: 'Batch Number', styles: { ...headerColStyles } },
      { content: 'Stock in Hand', styles: { ...headerColStyles } },
      { content: 'Initial Quantity', styles: { ...headerColStyles } },
      { content: 'Total Amount', styles: { ...headerColStyles } },
      { content: 'Type name', styles: { ...headerColStyles } },
      { content: 'Expires in (days)', styles: { ...headerColStyles } },
      { content: 'ExpiryDate', styles: { ...headerColStyles } },
    ];
  }
  
  
  

  DownloadExcel() {
    const header = ['Location name', 'Item name','Vendor Item name','Item Code','Department','UOM','Unit Price', 'GRN NO','Batch Number','Stcok In Hand','GRN Quantity','Total Amount','Type Nmae','Expiry in(days)','ExpiryDate'];
    // Create workbook and worksheet
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('Sharing Data');
    const fromDateParts = this.fromDate.split('-');
  const toDateParts = this.toDate.split('-');
  const formattedFromDate = this.fromDate != "" ?fromDateParts[2] + '-' + fromDateParts[1] + '-' + fromDateParts[0] : null;
  const formattedToDate = this.toDate != "" ? toDateParts[2] + '-' + toDateParts[1] + '-' + toDateParts[0]:null;
  const headline2Content = 'Period From: ' + formattedFromDate + ' Period To: ' + formattedToDate;
  worksheet.addRow([null,null,null,null,null,"Stock Expiry Report"])
  worksheet.addRow([null,null,null,null,null,headline2Content])
  const cell1 = worksheet.getCell('F1');
  const cell2 = worksheet.getCell('F2');
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
    worksheet.getColumn(1).width = 30;
    worksheet.getColumn(2).width = 30;
    worksheet.getColumn(3).width = 20;
    worksheet.getColumn(4).width = 20;
    worksheet.getColumn(5).width = 20;
    worksheet.getColumn(6).width = 20;
    worksheet.getColumn(7).width = 20;
    worksheet.getColumn(8).width = 20;
    worksheet.getColumn(9).width = 20;
    worksheet.getColumn(10).width = 20;
    worksheet.getColumn(11).width = 20;
    worksheet.getColumn(12).width = 20;

    // worksheet.addRow([]);
    // Add Data and Conditional Formatting
    this.expiryReports.forEach((item: any) => {
      const row = worksheet.addRow([
        item.LocationName == null ? 'N/A' : item.LocationName,       
        item.ItemName,
        item.VendorItemName ? item.VendorItemName : 'N/A',
        item.ApolloItemCode==null?"N/A":item.ApolloItemCode,
        item.DepartmentTypeName==null?"N/A":item.DepartmentTypeName,
        item.MajorUnitName==null?"N/A":item.MajorUnitName,
        item.BuyPrice==null?"N/A": parseFloat(item.BuyPrice) || 0,
        item.stockID==null?"N/A":item.stockID,
        item.BatchNumber==null?'N/A':item.BatchNumber,
        item.RemaningQuantity==null?'N/A':item.RemaningQuantity-item.ReturnQuantity||0,
        item.InitialCount,
        item.UnitPrice* (item.RemaningQuantity-item.ReturnQuantity),
        item.CategoryTypeName,
        item.ExpiresOn<0?'Expired':item.RemaningQuantity==0 || item.RemaningQuantity==null?'N/A':item.ExpiresOn,  
        this.datepipe.transform(item.ExpiryDate, 'dd-MM-yyyy')   
      ]);
    });
    // Create a file name for the downloaded file
    const fileName = 'Stock-Expiry-Report-print.xlsx';
    // Generate Excel File with given name
    workbook.xlsx.writeBuffer().then((data: any) => {
      const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, fileName);
    });
  }
  /**
   * this event used to validation for days
   * @param data 
   * @returns 
   */
  // SelectDays(data:any){
  // return data.target.value = data.target.value.replace(/[^0-9.]/g, '');
  // }
}
