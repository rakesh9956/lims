import { Component, OnInit } from '@angular/core';
import {  FormControl } from '@angular/forms';
import { NgbCalendar, NgbDateParserFormatter, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { IndentService } from 'src/app/core/Services/indent.service';
import { Workbook } from 'exceljs';
import * as saveAs from 'file-saver';
import { DatePipe } from '@angular/common';
import { AuthenticationService } from 'src/app/core/Services/authentication.service';
import { CustomDateParserFormatter } from 'src/app/core/Services/ngbdate-format.service';
import { QuotationService } from 'src/app/core/Services/quotation.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ColumnMode } from '@swimlane/ngx-datatable';



@Component({
  selector: 'app-indent-report',
  templateUrl: './indent-report.component.html',
  styleUrls: ['./indent-report.component.scss'],
  providers: [
    { provide: NgbDateParserFormatter, useClass: CustomDateParserFormatter },
  ],
})
export class IndentReportComponent implements OnInit {

  /*** Paginatin Option Starts ***/
  maxSize: number = 3;
  boundaryLinks: boolean = true;
  ColumnMode = ColumnMode;
  loadingIndicator : boolean = true;
  size: string = 'lg';
  /*** Paginatin Option Starts ***/
  shimmerVisible: boolean;
  paginationRoundedCurrentPage = 1;
  UnparsedHtml: any = '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Indent Report</title><style>table{border-collapse:collapse;border:1px solid #000}table td,table th{border-bottom:1px solid #000;border-right:1px solid #000;padding:5px;text-align:left;word-wrap:break-word;word-break:break-all;font-size:10px}table th{background-color:#ccc}.logo{height:28px;display:flex;align-items:center;justify-content:center;padding:20px 0}</style></head><body><table style="text-align:center;table-layout:fixed" width="100%"><tbody><tr><td><div class="logo"><img data-v-0e549244="" src="assets/images/YodaLIMSLogo.png" alt="Yoda LIMS"></div></td></tr></tbody></table><table style="text-align:center;table-layout:fixed" width="100%"><tbody><tr><td style="text-align:center;font-weight:700;font-size:16px">Indent Report</td></tr><tr><td style="text-align:center;font-weight:700;font-size:14px">As On :%%newDate%%</td></tr></tbody></table><table style="table-layout:fixed;margin-top:20px" width="100%"><thead><tr><th>Indent No</th><th>Indent Type</th><th>Item Name</th><th>Item Qty</th><th>Created date</th><th>Created By</th><th>Checked date</th><th>Checked By</th><th>Approved date</th><th >Approved By</th><th>Expected Date</th><th>Request Location</th><th>Indent Location</th></tr></thead><tbody><tr id="indents"><td>%%IndentNo%%</td><td>%%IndentType%%</td><td>%%ItemName%%</td><td>%%ItemQty%%</td><td>%%CreatedDate%%</td><td>%%CreatedBy%%</td><td>%%CheckedDate%%</td><td>%%CheckedBy%%</td><td>%%ApprovedDate%%</td><td>%%ApprovedBy%%</td><td>%%ExpectedDate%%</td><td>%%FromLocation%%</td><td>%%ToLocation%%</td></tr></tbody></table></body></html>';
  FromDate: any = '';
  ToDate: any = '';
  IndentNo: string = '';
  minDate: NgbDateStruct;
  indentreport: any = [];
  newDate: string;
  clearControl: FormControl = new FormControl();
  CenterclearControl: FormControl = new FormControl();
  cleardateControl: FormControl = new FormControl();
  clearFromControl: FormControl = new FormControl();
  selectfromDate: any = "";
  isDisable: boolean = true;
  noDataFound: boolean = false;
  currentDate: string | null;
  LocationGuid: any = '';
  calendar: any;
  defaultData: any = [];
  LocationList: any = [];
  centerList: any = [];
  totalIndent: any = [];
  indentType: any;
  SIfilterActive:any;
  PIfilterActive:any;
  IsStore:boolean;
  totalPageNumbers : any
  constructor(
    private indentService: IndentService,
    public authservice: AuthenticationService,
    public calender: NgbCalendar,
    private datePipe: DatePipe,
    private quotationService: QuotationService,
  ) {
    {
      const formatDate = new Date();
      this.currentDate = this.datePipe.transform(formatDate, 'dd-MM-yyyy');
    }
  }
  ngOnInit(): void {
    this.GetReportsLocation();
    const currentDate = new Date();
    this.currentDate = this.datePipe.transform(currentDate, 'dd-MMM-yyyy hh:mm a');
    const today = this.calendar?.getToday();
    this.minDate = {
      year: today?.year, month: today?.month, day: today?.day
    };
    this.IsStore = this.authservice.LoggedInUser.STORE
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
 * this service method used to get the indent reports details
 * @param TypeName 
 */
  IndentReportData(TypeName: any = null) {
    this.shimmerVisible = true;
    this.indentreport = [];
    this.totalIndent = [];
    if (this.LocationGuid?.length == 0) {
      this.LocationGuid = this.authservice.LoggedInUser.DEFAULTROLES.toLowerCase().includes('ADMIN'.toLowerCase()) && this.authservice.LoggedInUser.LOCATIONSGUID == '00000000-0000-0000-0000-000000000000' ? '00000000-0000-0000-0000-000000000000' : this.authservice.LoggedInUser.LOCATIONSGUID.split(",");
    }
    this.indentService.IndentReports(this.LocationGuid, this.FromDate, this.ToDate,this.IsStore ).subscribe(data => {
      this.totalIndent = data || []
      if (this.indentType == 'PI') {
        this.indentreport = this.totalIndent.filter((item: any) => item.IndentType === 'PI')
      }
      else if (this.indentType =='SI') {
        this.indentreport = this.totalIndent.filter((item: any) => item.IndentType === 'SI')
      }
      else {
        this.indentreport = this.totalIndent;
      }
      this.shimmerVisible = false;
      if (this.indentreport?.length == 0) {
        this.noDataFound = true
      } else {
        TypeName == 'pdf' ? this.downloadReport() : TypeName == 'excel' ? this.downloadExcel() :"";
        this.noDataFound = false
      }
    }, error => {
      this.shimmerVisible = false;
    })
  }
  /**
   * this event used to select the from date
   * @param event 
   */
  selectFromDate(event: any) {
    this.noDataFound = false;
    this.ToDate = '';
    this.isDisable = true;
    this.cleardateControl.reset();
    this.selectfromDate = event
    this.FromDate = event.year + "-" + event.month + "-" + event.day;
  }
  /**
   * this event used to select the to date
   * @param event 
   */
  selectToDate(event: any) {
    this.ToDate = event.year + "-" + event.month + "-" + event.day;
    if (this.FromDate != '' && this.ToDate != '') {
      this.isDisable = false
    } else {
      this.isDisable = true
      this.noDataFound = false
    }
  }
  /**
   * this event used to clear the colums
   */
  Onremove() {
    this.indentreport=[];
    this.LocationGuid = '';
    this.FromDate = '';
    this.ToDate = '';
    this.clearFromControl.reset();
    this.cleardateControl.reset();
    this.clearControl.reset();
    this.CenterclearControl.reset();
    this.LocationList = this.defaultData.LstQuotationCenterLocationType
    this.centerList = this.defaultData.LstQuotationStateDetailsType.filter((f: { CenterGuid: any; }) => this.LocationList.some((filter: { CenterGuid: any; }) => filter.CenterGuid === f.CenterGuid));
    this.isDisable = true;
    this.noDataFound = false;
    this.indentType=[];
    this.SIfilterActive='';
    this.PIfilterActive='';
  }
  /**
   * this event filter the locations and centers
   * @param event 
   */
  filterData(event: any) {
    this.noDataFound = false;
    if (event != undefined) {
      if (event.CenterLocationGuid != undefined) {
        this.LocationGuid = event.CenterLocationGuid
        this.IsStore=event.IsStore
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
   * this event used to download the pdf
   */
  // DownloadPdf() {
  //   this.indentType=[];
  //   let html = "";
  //   html = this.UnparsedHtml;
  //   const replacements: any = {
  //     '%%newDate%%': this.currentDate || '',
  //   };
  //   for (const key in replacements) {
  //     html = html.replace(key, replacements[key]);
  //   }
  //   if (this.indentreport?.length > 0) {
  //     let dochtml: any = '';
  //     dochtml = new DOMParser().parseFromString(html, 'text/html');
  //     let indents: any = dochtml.querySelector('#indents');

  //     if (indents) {
  //       indents.innerHTML = '';
  //       for (let i = 0; i < this.indentreport.length; i++) {
  //         let updatedTemplate: any = '';
  //         updatedTemplate = this.UnparsedHtml
  //           .replace('%%IndentNo%%', this.indentreport[i].IndentNo)
  //           .replace('%%ItemName%%', this.indentreport[i].ItemName)
  //           .replace('%%ExpectedDate%%', this.indentreport[i].ExpectedDate ? this.datePipe.transform(this.indentreport[i].ExpectedDate, 'dd-MM-yyyy') : 'N/A')
  //           .replace('%%IndentType%%', this.indentreport[i].IndentType)
  //           .replace('%%ItemQty%%', this.indentreport[i].ItemQty)
  //           .replace('%%FromLocation%%', this.indentreport[i].FromLocation)
  //           .replace('%%ToLocation%%', this.indentreport[i].ToLocation == null ? 'N/A' : this.indentreport[i].ToLocation)
  //           .replace('%%CreatedBy%%', this.indentreport[i].CreatedBy)
  //           .replace('%%CheckedBy%%', this.indentreport[i].CheckedUserName)
  //           .replace('%%ApprovedBy%%', this.indentreport[i].ApprovedUserName)
  //           .replace('%%CreatedDate%%', this.datePipe.transform(this.indentreport[i].CreatedDt, 'dd-MM-yyyy'))
  //           .replace('%%CheckedDate%%', this.indentreport[i].CheckedDate == '0001-01-01T00:00:00' ? 'N/A' : this.datePipe.transform(this.indentreport[i].CheckedDate, 'dd-MM-yyyy'))
  //           .replace('%%ApprovedDate%%', this.indentreport[i].ApprovedDate == '0001-01-01T00:00:00' ? 'N/A' : this.datePipe.transform(this.indentreport[i].ApprovedDate, 'dd-MM-yyyy'))

  //         let jobElement: any = '';
  //         jobElement = new DOMParser().parseFromString(updatedTemplate, 'text/html').querySelector('#indents');
  //         indents.appendChild(jobElement);
  //       }
  //     }
  //     html = dochtml.documentElement.outerHTML;
  //   }
  //   const options = {
  //     filename: `IndentReport-report.pdf`,
  //     margin: 0.2,
  //     image: { type: 'jpeg', quality: 0.98 },
  //     html2canvas: { scale: 1 },
  //     jsPDF: { unit: 'in', format: 'a3', orientation: 'landscape' }
  //   };
  //   const element = html;
  //   html2pdf().from(element).set(options).save();
  // }
  async downloadReport(){
    await  this.DownloadPdf();
    this.DownloadPdfNew();
}
PrepareData() :any[]{
  interface Indent {
    IndentNo: string;
    IndentType: string;
    ItemName: string;
    VendorItemName : string;
    ItemQty: string;
    CreatedDt: any;
    CreatedBy: any;
    CheckedDate: any;
    CheckedUserName: any;
    ApprovedDate: any;
    ApprovedUserName: any;
    ExpectedDate: any;
    FromLocation: any;
    ToLocation: any;
    ReceiveQty: any;
  }
 return this.indentreport.map((indent: Indent, index: number) => [ 
    { content: index + 1, styles: { minCellWidth: 10 } },
    { content: indent.IndentNo, styles: { minCellWidth: 25 } }, 
    { content: indent.IndentType, styles: { minCellWidth: 10} },
    { content: indent.ItemName, styles: { minCellWidth: 24 } },
    { content: indent.VendorItemName ? indent.VendorItemName : 'N/A', styles: { minCellWidth: 24 } },
    { content: this.datePipe.transform(indent.CreatedDt, 'dd-MM-yyyy HH:mm:ss'), styles: { minCellWidth: 22 } },
    { content: indent.ItemQty, styles: { minCellWidth: 15 } },
    //{ content: indent.ApprovedUserName== null ? 'N/A' : indent.ApprovedUserName, styles: { minCellWidth: 15 } },
    { content: indent.FromLocation, styles: { minCellWidth: 35 } },
    { content: indent.ToLocation, styles: { minCellWidth: 55 } },
    { content: this.datePipe.transform(indent.CreatedDt, 'dd-MM-yyyy HH:mm:ss') + (indent.CreatedBy == null ? "N/A" : indent.CreatedBy), styles: { minCellWidth: 15 } },
    { content: this.datePipe.transform(indent.CheckedDate, 'dd-MM-yyyy HH:mm:ss') + (indent.CheckedUserName == null ? "N/A" : indent.CheckedUserName), styles: { minCellWidth: 15 } },
    { content: this.datePipe.transform(indent.ApprovedDate, 'dd-MM-yyyy HH:mm:ss') + (indent.ApprovedUserName == null ? "N/A" : indent.ApprovedUserName), styles: { minCellWidth: 16 } },
    { content: this.datePipe.transform(indent.ExpectedDate, 'dd-MM-yyyy HH:mm:ss'), styles: { minCellWidth: 24 } },

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
        this.totalPageNumbers = currentPageNumber
      },
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
      const headline1Content = 'Indent Report Summary';
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
    doc.save('indent-report.pdf');
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
      { content: 'IndentNo', styles: { ...headerColStyles } },
      { content: 'IndentType', styles: { ...headerColStyles } },
      { content: 'ItemName', styles: { ...headerColStyles } },
      { content: 'VendorItemName', styles: { ...headerColStyles } },
      { content: 'CreatedDt', styles: { ...headerColStyles } },
      { content: 'ItemQty', styles: { ...headerColStyles } },
      { content: 'FromLocation', styles: { ...headerColStyles } },
      { content: 'ToLocation', styles: { ...headerColStyles } },
      { content: 'Created', styles: { ...headerColStyles } },
      { content: 'Checked', styles: { ...headerColStyles } },
      { content: 'Approved', styles: { ...headerColStyles } },
      { content: 'ExpectedDate', styles: { ...headerColStyles } },
    ];
  }
  /**
   * this event used to download the Excel
   */
  downloadExcel() {
    this.indentType=[];
    const header = ['Indent No', 'Indent Type', 'Item Name','Vendor Item Name','Item Code', 'Item Qty', 'Created Date', 'Created By', 'Checked Date', 'Checked By', 'Approved Date	', 'Approved By', 'Expected Date	', 'Request Location	', 'Indent Location'];
    // Create workbook and worksheet
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('Sharing Data');
    const fromDateParts = this.FromDate.split('-');
    const toDateParts = this.ToDate.split('-');
    const formattedFromDate = this.FromDate != "" ?fromDateParts[2] + '-' + fromDateParts[1] + '-' + fromDateParts[0] : null;
    const formattedToDate = this.ToDate != "" ? toDateParts[2] + '-' + toDateParts[1] + '-' + toDateParts[0]:null;
    const headline2Content = 'Period From: ' + formattedFromDate + ' Period To: ' + formattedToDate;
    worksheet.addRow([null,null,null,null,null,null,"Indent Report"])
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
    // Add Header Row
    const headerRow = worksheet.addRow(header);
    // Cell Style : Fill and Border
    headerRow.eachCell((cell: any, number: any) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFFF00' },
        bgColor: { argb: 'FF0000FF' }
      };
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    });
    worksheet.getColumn(1).width = 30;
    worksheet.getColumn(2).width = 15;
    worksheet.getColumn(3).width = 40;
    worksheet.getColumn(4).width = 20;
    worksheet.getColumn(5).width = 20;
    worksheet.getColumn(6).width = 20;
    worksheet.getColumn(7).width = 20;
    worksheet.getColumn(8).width = 20;
    worksheet.getColumn(9).width = 20;
    worksheet.getColumn(10).width = 20;
    worksheet.getColumn(11).width = 20;
    worksheet.getColumn(12).width = 30;
    worksheet.getColumn(13).width = 30;
    worksheet.getColumn(14).width = 30;
    // worksheet.addRow([]);
    this.indentreport.forEach((item: any) => {
      const row = worksheet.addRow([
        item.IndentNo,
        item.IndentType,
        item.ItemName,
        item.VendorItemName? item.VendorItemName : 'N/A',
        item.ApolloItemCode,
        item.ItemQty,
        // this.datePipe.transform(item.CreatedDt, 'dd-MM-yyyy'),
        item.CreatedDt  == '0001-01-01T00:00:00' ? 'N/A' : this.datePipe.transform(item.CreatedDt, 'dd-MM-yyyy HH:mm:ss'),
        item.CreatedBy,
        item.CheckedDate == '0001-01-01T00:00:00' ? 'N/A' : this.datePipe.transform(item.CheckedDate, 'dd-MM-yyyy HH:mm:ss'),
        item.CheckedUserName,
        item.ApprovedDate == '0001-01-01T00:00:00' ? 'N/A' : this.datePipe.transform(item.ApprovedDate, 'dd-MM-yyyy HH:mm:ss'),
        item.ApprovedUserName,
        item.ExpectedDate ? this.datePipe.transform(item.ExpectedDate, 'dd-MM-yyyy HH:mm:ss') : 'N/A',
        item.FromLocation,
        item.ToLocation == null ? 'N/A' : item.ToLocation,
      ]);
    });
    const fileName = 'IndentReport-print.xlsx';
    workbook.xlsx.writeBuffer().then((data: any) => {
      const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, fileName);
    });
  }
  /**
   * this event used to filter the data based on SI
   * @param event 
   */
  changeSI(event: any) {
    var selectedValues: any = [];
    let checkboxSI: any = document.getElementById('si') || false;
    var checkboxPI: any = document.getElementById('pi') || false;
    if (checkboxSI.checked && checkboxPI.checked) {
      selectedValues = ['SI', 'PI'];
    }
    else if(checkboxSI.checked) {
      selectedValues = ['SI'];
    } else if (checkboxPI.checked) {
      selectedValues = ['PI'];
    } else {
      selectedValues = [];
    }
    this.indentType = selectedValues.join(",")
  }
}
