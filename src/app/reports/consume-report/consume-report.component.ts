import { DatePipe, formatDate } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { NgbCalendar, NgbDateParserFormatter, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { Workbook } from 'exceljs';
import * as html2pdf from 'html2pdf.js';
import { AllReportsService } from 'src/app/core/Services/all-reports.service';
import { QuotationService } from 'src/app/core/Services/quotation.service';
import { saveAs } from 'file-saver';
import { AuthenticationService } from 'src/app/core/Services/authentication.service';
import { GlobalService } from 'src/app/core/Services/global.service';
import { FormControl } from '@angular/forms';
import { CustomDateParserFormatter } from 'src/app/core/Services/ngbdate-format.service'
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ColumnMode } from '@swimlane/ngx-datatable';


@Component({
  selector: 'app-consume-report',
  templateUrl: './consume-report.component.html',
  styleUrls: ['./consume-report.component.scss'],
  providers: [
    { provide: NgbDateParserFormatter, useClass: CustomDateParserFormatter },
  ],
})

export class ConsumeReportComponent implements OnInit {
ColumnMode = ColumnMode;
loadingIndicator : boolean = true;
  shimmerVisible: boolean;
  selectedDate: any;
  selectedToDate: NgbDateStruct;
  minDate:NgbDateStruct;
  UnparsedHtml: any = '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Consume Report</title><style>table{border-collapse:collapse;border:1px solid #000}table td,table th{border-bottom:1px solid #000;border-right:1px solid #000;padding:5px;text-align:left;word-wrap:break-word;word-break:break-all;font-size:10px}table th{background-color:#ccc}.logo{height:28px;display:flex;align-items:center;justify-content:center;padding:20px 0}</style></head><body><table style="text-align:center;table-layout:fixed" width="100%"><tbody><tr><td><div class="logo"><img data-v-0e549244="" src="assets/images/YodaLIMSLogo.png" alt="Yoda LIMS"></div></td></tr></tbody></table><table style="text-align:center;table-layout:fixed" width="100%"><tbody><tr><td style="text-align:center;font-weight:700;font-size:16px">Consume Report Detail</td></tr><tr><td style="text-align:center;font-weight:700;font-size:14px">As On :%%newDate%%</td></tr></tbody></table><table style="table-layout:fixed;margin-top:20px" width="100%"><thead><tr><th>S. No.</th><th>Item Name</th><th>Manufacturer</th><th>Catlog No.</th><th>Qty</th><th width="150">Location</th><th>Department</th><th>Consumed Date</th><th>Consumed By</th></tr></thead><tbody><tr id="consumeReports"><td>%%SNo%%</td><td>%%Item Name%%</td><td>%%Manufacturer%%</td><td>%%Catlog No.%%</td><td>%%Qty%%<td>%%Location%%</td><td>%%Department%%</td><td>%%Consumed Date%%</td><td>%%Consumed By%%</td></tr></tbody></table></body></html>';
  FromDate: any='';
  ToDate: any='';
  CenterTypeGuid: any='';
  ZoneGuid: any='';
  StateGuid: any='';
  CityGuid: any='';
  CenterGuid: any='';
  LocationGuid: any=[];
  CategoryTypeGuid: any='';
  ItemGuid: any='';
  ItemCategoryGuid: any='';
  selecteToDate: any;
  selectefromDate: any;
  consumeReportList:any=[];
  selectedconsumeReportList: any=[];
  LocationListList: any=[];
  newDate:any; 
  LocationList: any[];
  CenterTypeList: any[];
  CenterList: any[];
  formattedDate: any;
  selectfromDate: NgbDateStruct;
  //selectedfromDate:any="";
  currentDate: string | null;
  noDataFound: boolean=false;
  isDisable: boolean = true;
  clearControl: FormControl = new FormControl();
  CenterclearControl: FormControl = new FormControl();
  cleardateControl: FormControl = new FormControl();
  clearFromControl: FormControl = new FormControl(); 
  defaultData: any = [];
  centerList: any = [];
  buttonDisable:boolean=true;
  totalPageNumbers : any
  constructor(
    private allReportsService: AllReportsService,
    private quotationService: QuotationService,
    private authservice: AuthenticationService,
    private datePipe: DatePipe, 
    private globalService: GlobalService,
    private calendar: NgbCalendar,
  ) { }

  ngOnInit(): void {
 // this.GetconsumeReports();
  this.GetconsumeReportsLocation();
  const newDate1 = {day: new Date().getDate(),month: new Date().getMonth() + 1,year: new Date().getFullYear()};
   //this.newDate = formatDate(new Date(newDate1.year, newDate1.month - 1, newDate1.day), 'dd-MM-yyyy', 'en'); 
   //const formatDate = new Date();
   const currentDate = new Date();
   //this.currentDate = this.datePipe.transform(formatDate, 'dd-MM-yyyy');
   this.currentDate = this.datePipe.transform(currentDate, 'dd-MMM-yyyy hh:mm a');

   const today = this.calendar.getToday();
     this.minDate = {
       year: today.year, month: today.month, day: today.day
     };
  }

   /**
   * this service method used to get consume reports
   */
   GetconsumeReports(type:any = null) {
    this.shimmerVisible=true;
    if(this.LocationGuid.length==0){
      this.LocationGuid =this.authservice.LoggedInUser.DEFAULTROLES.toLowerCase().includes('ADMIN'.toLowerCase()) && this.authservice.LoggedInUser.LOCATIONSGUID=='00000000-0000-0000-0000-000000000000' ?'00000000-0000-0000-0000-000000000000': this.authservice.LoggedInUser.LOCATIONSGUID.split(",");
    }
    this.allReportsService. GetconsumeReports(this.FromDate, this.ToDate, this.CenterTypeGuid, this.ZoneGuid, this.StateGuid, this.CityGuid, this.CenterGuid, this.LocationGuid, this.CategoryTypeGuid, this.ItemGuid, this.ItemCategoryGuid).subscribe((data)=>{
    this.consumeReportList=data || []; 
    this.shimmerVisible=false;
    if(this.consumeReportList.length>0){
      this.noDataFound=false
      type == 'pdf'?this.downloadReport():  type == 'excel' ? this.downloadExcel() : '';
    }else{
      this.noDataFound=true
    }
  }, error => {
    this.shimmerVisible=false;
  })
 }

  GetconsumeReportsLocation() {
    this.shimmerVisible=true;
    let DepartmentGuid=this.authservice.LoggedInUser.DEFAULTROLES.toLowerCase().includes('ADMIN'.toLowerCase()) && this.authservice.LoggedInUser.LOCATIONSGUID=='00000000-0000-0000-0000-000000000000' ?'00000000-0000-0000-0000-000000000000':
    this.authservice.LoggedInUser.LOCATIONSGUID.split(",");
    this.quotationService.getQuotationPostDefaults(DepartmentGuid).subscribe((data: any,) => {
      this.defaultData = data.Result;
      this.LocationList = data.Result.LstQuotationCenterLocationType;
      this.centerList = data.Result.LstQuotationStateDetailsType.filter((f: { CenterGuid: any; }) => this.LocationList.some((filter: { CenterGuid: any; }) => filter.CenterGuid === f.CenterGuid));
    this.shimmerVisible=false;
    }, error => {
    this.globalService.stopSpinner();
    this.shimmerVisible=false;
    })
  }

  /**
   * this change event used to change the location and item details
   * @param event 
   */
  ChangeLocation(event: any) {
    this.LocationGuid = event.CenterLocationGuid
    this.isDisable = false
    //this.GetconsumeReports();
	
  }

  /**
   * this event used to select the from date
   * @param event 
   */
  selectFromDate(event: any) {
    // this.selectefromDate = event.year + "-" + event.month + "-" + event.day;
    this.FromDate = event.year + "-" + event.month + "-" + event.day;
    this.selectfromDate = event
   this.isDisable = true
    this.selectefromDate = {
      year: event.year, month: event.month, day: event.day
    };
    this.selecteToDate = "";
    this.ToDate=''
  }

  /**
   * this event used to select the To date
   * @param event  
   */
  selectToDate(event: any) {
    this.isDisable = false
    this.noDataFound = false
    this.selecteToDate =event;
    this.ToDate = event.year + "-" + event.month + "-" + event.day;
    //this.GetconsumeReports();
  }


  filterData(event: any) {
    if (event != undefined) {
      if (event.CenterLocationGuid != undefined) {
        
        //this.isDisable = false
        //this.noDataFound = false
        this.buttonDisable=false    
        this.LocationGuid = event.CenterLocationGuid
      }
      this.LocationList = this.defaultData.LstQuotationCenterLocationType.filter((f: { CenterGuid: any; }) => f.CenterGuid == event.CenterGuid);
      this.centerList = this.defaultData.LstQuotationStateDetailsType.filter((f: { CenterGuid: any; }) => f.CenterGuid == event.CenterGuid);
    }
      else {
        this.LocationGuid=""
        this.buttonDisable=true
        this.clearControl.reset();
        this.CenterclearControl.reset();
        //this.cleardateControl.reset()
        //this.isDisable = true
        this.noDataFound = false
        this.LocationList = this.defaultData.LstQuotationCenterLocationType
        this.centerList = this.defaultData.LstQuotationStateDetailsType.filter((f: { CenterGuid: any; }) => this.LocationList.some((filter: { CenterGuid: any; }) => filter.CenterGuid === f.CenterGuid));
      }
  }  

  // DownloadPdf() {
  //   let html = "";
  //   html = this.UnparsedHtml;
  //   const replacements: any = {
  //     '%%newDate%%': this.currentDate || '',
  //   };
  //   for (const key in replacements) {
  //     html = html.replace(key, replacements[key]);
  //   }
  //     let dochtml: any = '';
  //     dochtml = new DOMParser().parseFromString(html, 'text/html');
  //     let consumeReport: any = dochtml.querySelector('#consumeReports');

  //     if (consumeReport) {
  //       consumeReport.innerHTML = '';
  //       for (let i = 0; i < this.consumeReportList.length; i++) {
  //         let updatedTemplate: any = '';
  //         updatedTemplate = this.UnparsedHtml
  //         .replace('%%SNo%%',i+1)
  //         .replace('%%Location%%', this.consumeReportList[i].LocationName || '')
	// 	      .replace('%%Item Name%%', this.consumeReportList[i].ItemName || '')
	// 	      .replace('%%Qty%%', this.consumeReportList[i].ConsumeQuantity || '')
  //         .replace('%%Hsn Code%%', this.consumeReportList[i].HSNCode?'N/A':this.consumeReportList[i].HSNCode || '')
  //         .replace('%%Catlog No.%%', this.consumeReportList[i].CatalogNo ||'')
  //         .replace('%%Manufacturer%%', this.consumeReportList[i].Manufacturer ||'')
  //         .replace('%%Department%%', this.consumeReportList[i].Department ||'')
  //         .replace('%%Consumed Date%%', this.consumeReportList[i].ConsumeDate =='0001-01-01T00:00:00'?'N/A':this.datePipe.transform(this.consumeReportList[i].ConsumeDate, 'dd-MM-yyyy') )
  //         .replace('%%Consumed By%%', this.consumeReportList[i].ConsumeByName || '')
  //         let jobElement: any = '';
  //         jobElement = new DOMParser().parseFromString(updatedTemplate, 'text/html').querySelector('#consumeReports');
  //         consumeReport.appendChild(jobElement);
  //       }
  //     }
  //     html = dochtml.documentElement.outerHTML;
  //   const options = {
  //     filename: `consume-report.pdf`,
  //     margin: 0.1,
  //     image: { type: 'jpeg', quality: 0.98 },
  //     html2canvas: { scale: 1 },
  //     jsPDF: { unit: 'in', format: 'a4', orientation: 'landscape' }
  //   };
  //   const element = html;
  //   html2pdf().from(element).set(options).save();
  // }
async downloadReport(){
    await  this.DownloadPdf();
    this.DownloadPdfNew();
}
PrepareData() : any[]{
  interface Indent {
    ItemName: string;
    VendorItemName : string;
    ApolloItemCode:string;
    LocationName: string;
    ConsumeQuantity: any;
    HSNCode: any;
    CatalogNo: any;
    Manufacturer: any;
    Department: any;
    ConsumeDate: any;
    ConsumeByName: any;
  }
  return this.consumeReportList.map((consume: Indent, index: number) => [ // numeric value
    { content: index + 1, styles: { minCellWidth: 10 } },
    { content: consume.ItemName, styles: { minCellWidth: 10 } },
    { content: consume.VendorItemName ? consume.VendorItemName : 'N/A', styles: { minCellWidth: 10 } },
    { content: consume.ApolloItemCode, styles: { minCellWidth: 10 } },
    { content: consume.Manufacturer==null?"N/A":consume.Manufacturer, styles: { minCellWidth: 15 } },
    { content: consume.CatalogNo, styles: { minCellWidth: 20 } },
    { content: consume.ConsumeQuantity, styles: { minCellWidth: 15 } },
    { content: consume.LocationName, styles: { minCellWidth: 15 } },
    { content: consume.Department, styles: { minCellWidth: 15 } },
    { content: this.datePipe.transform(consume.ConsumeDate, 'dd-MM-yyyy HH:mm:ss'), styles: { minCellWidth: 20 } },
    { content: consume.ConsumeByName==null?"N/A":consume.ConsumeByName, styles: { minCellWidth: 15 } },
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

    doc?.addImage(
      imageUrl,
      'PNG',
      imageXPos,
      imageYPos,
      imageWidth,
      imageHeight
    );
    function createTitle(data:any){
      const headline1Content = 'Consume Report Summary';
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
    doc.save('consume-report.pdf');
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
      { content: 'Manufacturer', styles: { ...headerColStyles } },
      { content: 'Catalog No', styles: { ...headerColStyles } },
      { content: 'Qty', styles: { ...headerColStyles } },
      { content: 'Location Name', styles: { ...headerColStyles } },
      { content: 'Department', styles: { ...headerColStyles } },
      { content: 'Consumed Date', styles: { ...headerColStyles } },
      { content: 'Consumed By', styles: { ...headerColStyles } },
    ];
  }
  /**
   * this event used to dowload the exel file
   */
 downloadExcel(){
  const header = ['Item Name','Vendor Item Name','Item Code','Manufacturer','CatalogNo','Consume Quantity','Location','Department', 'Consumed Date', 'Consumed By Name'];
  // Create workbook and worksheet
  const workbook = new Workbook();
  const worksheet = workbook.addWorksheet('Sharing Data');
  const fromDateParts = this.FromDate.split('-');
  const toDateParts = this.ToDate.split('-');
  const formattedFromDate = this.FromDate != "" ?fromDateParts[2] + '-' + fromDateParts[1] + '-' + fromDateParts[0] : null;
  const formattedToDate = this.ToDate != "" ? toDateParts[2] + '-' + toDateParts[1] + '-' + toDateParts[0]:null;
  const headline2Content = 'Period From: ' + formattedFromDate + ' Period To: ' + formattedToDate;
  worksheet.addRow([null,null,null,null,"Consume Report"])
  worksheet.addRow([null,null,null,null,headline2Content])
  const cell1 = worksheet.getCell('E1');
const cell2 = worksheet.getCell('E2');
// Set the alignment properties
cell1.alignment = {
  horizontal: 'center'
};
cell2.alignment = {
  horizontal: 'center'
};
// Set the font properties
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
 worksheet.getColumn(1).width = 45;
 worksheet.getColumn(2).width = 30;
 worksheet.getColumn(3).width = 40;
 worksheet.getColumn(4).width = 20;
 worksheet.getColumn(5).width = 30;
 worksheet.getColumn(6).width = 40;
 worksheet.getColumn(7).width = 40;
 worksheet.getColumn(8).width = 35;
 worksheet.getColumn(9).width = 35; 
//  worksheet.addRow([]);
 this.consumeReportList .forEach((item: any) => {
   const row = worksheet.addRow([
     item.ItemName,
     item.VendorItemName ? item.VendorItemName : 'N/A',
     item.ApolloItemCode,
     item.Manufacturer,
     item.CatalogNo,
     item.ConsumeQuantity,
    item.LocationName,
    item.Department,
    item.ConsumeDate=='0001-01-01T00:00:00'  ?'N/A':this.datePipe.transform(item.ConsumeDate, 'dd-MM-yyyy HH:mm:ss'),
    item.ConsumeByName
   ]);
 });
   const fileName = 'consumeReports-print.xlsx';
 workbook.xlsx.writeBuffer().then((data: any) => {
   const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
   saveAs(blob, fileName);
 });
}  
removeDates() {
  this.consumeReportList=[];
  this.isDisable = true
  this.noDataFound = false
  this.FromDate = ""
  this.ToDate = ""
  this.LocationGuid = ""
  this.clearControl.reset();
  this.CenterclearControl.reset();
  this.clearFromControl.reset();
  this.cleardateControl.reset();
  this.buttonDisable=true
  this.LocationList = this.defaultData.LstQuotationCenterLocationType
  this.CenterList = this.defaultData.LstQuotationStateDetailsType.filter((f: { CenterGuid: any; }) => this.LocationList.some((filter: { CenterGuid: any; }) => filter.CenterGuid === f.CenterGuid));
}
Onremove() {
  //this.LocationGuid = []
}
}
