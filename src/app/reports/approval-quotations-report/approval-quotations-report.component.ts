import { Component, OnInit, Type } from '@angular/core';
import { QuotationService } from 'src/app/core/Services/quotation.service';
import { AllReportsService } from 'src/app/core/Services/all-reports.service';
import { NgbCalendar, NgbDateParserFormatter, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { AuthenticationService } from 'src/app/core/Services/authentication.service';
import { DatePipe } from '@angular/common';
import { Workbook } from 'exceljs';
import * as saveAs from 'file-saver';
import { FormControl } from '@angular/forms';
import { CustomDateParserFormatter } from 'src/app/core/Services/ngbdate-format.service'
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import { ColumnMode } from '@swimlane/ngx-datatable';

@Component({
  selector: 'app-approval-quotations-report',
  templateUrl: './approval-quotations-report.component.html',
  styleUrls: ['./approval-quotations-report.component.scss'],
  providers: [
    { provide: NgbDateParserFormatter, useClass: CustomDateParserFormatter },
  ],
})
export class ApprovalQuotationsReportComponent implements OnInit {
  [x: string]: any;
  shimmerVisible:boolean
  ColumnMode = ColumnMode;
  selectedDate: NgbDateStruct;
  selectedToDate: any = ""
  CenterLocacityList: any;
  bindLabel: string;
  bindValue: string;
  UnparsedHtml: any = '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Indent Report</title><style>table{border-collapse:collapse;border:1px solid #000}table td,table th{border-bottom:1px solid #000;border-right:1px solid #000;padding:5px;text-align:left;word-wrap:break-word;word-break:break-all;font-size:10px}table th{background-color:#ccc}.logo{height:28px;display:flex;align-items:center;justify-content:center;padding:20px 0}</style></head><body><table style="text-align:center;table-layout:fixed" width="100%"><tbody><tr><td><div class="logo"><img data-v-0e549244="" src="assets/images/YodaLIMSLogo.png" alt="Yoda LIMS"></div></td></tr></tbody></table><table style="text-align:center;table-layout:fixed" width="100%"><tbody><tr><td style="text-align:center;font-weight:700;font-size:16px">Quotations Report</td></tr><tr><td style="text-align:center;font-weight:700;font-size:14px">As On :%%newDate%%</td></tr></tbody></table><table style="table-layout:fixed;margin-top:20px" width="100%"><thead><tr><th width="80">Quotation no.</th><th width="50">Supplier</th><th width="50">Location</th><th width="60">Item name</th><th width="70">Catalog no.</th><th width="70">Hsn code</th><th width="70">Manufacturer</th><th width="70">Machine</th><th width="70">Pack size</th><th width="60">Item rate ₹</th><th width="65">Discount %</th><th width="50">CGST %</th><th width="50">SGST %</th><th width="50">IGST %</th><th width="65">Buy price ₹</th><th width="70">Created date</th><th width="80">Checked date</th><th width="80">Approved date</th><th width="60">Created by</th><th width="65">Checked by</th><th width="70">Approved by</th></tr></thead><tbody><tr id="ApprovalQOreport"><td>%%QuotationNumber%%</td><td>%%SupplierName%%</td><td>%%LocationName%%</td><td>%%ItemName%%</td><td>%%Catalognumber%%</td><td>%%Hsncode%%</td><td>%%Manufacturer%%</td><td>%%Machine%%</td><td>%%Packsize%%</td><td>%%Itemrate%%</td><td>%%Discount%%</td><td>%%ItemCGST%%</td><td>%%ItemSGST%%</td><td>%%ItemIGST%%</td><td>%%ItemPrice%%</td><td>%%Createddate%%</td><td>%%Checkeddate%%</td><td>%%Approveddate%%</td><td>%%CreatedBy%%</td><td>%%CheckedBy%%</td><td>%%ApprovedBy%%</td></tr><tr></tr></tbody></table></body></html>';
  
  LocationGuid: any = [];
  centerGuid: any = null;
  loadingIndicator : boolean = true;
  fromDate: string = '';
  toDate: string = '';
  locationsList: any = [];
  centerList: any = [];
  quotationApprovalList: any = [] = [];
  currentDate: string | null;
  defaultData: any = [];
  selectfromDate: any = "";
  isDisable: boolean = true;
  noDataFound: boolean = false;
  clearControl: FormControl = new FormControl();
  CenterclearControl: FormControl = new FormControl();
  cleardateControl: FormControl = new FormControl();
  clearfromdateControl: FormControl = new FormControl();
  clearsControl: FormControl = new FormControl();
  buttonDisable: boolean = true
  supplierGuid: any = null;
  suppliersList: any = [];
  totalPageNumbers : any
  constructor(private allreportservice: AllReportsService, private quotationservice: QuotationService, private authservice: AuthenticationService, private datePipe: DatePipe,
   public calendar: NgbCalendar,) {
    const formatDate = new Date();
    this.currentDate = this.datePipe.transform(formatDate, 'dd-MM-yyyy');
  }

  ngOnInit(): void {
    this.getDefaultData()
  }


  getQuotationApprovalData(TypeName: any = null) {
    // this.globalService.startSpinner()
    this.shimmerVisible=true;
    if (this.LocationGuid?.length == 0 || this.LocationGuid==undefined) {
      this.LocationGuid = this.authservice.LoggedInUser.DEFAULTROLES.toLowerCase().includes('ADMIN'.toLowerCase()) && this.authservice.LoggedInUser.LOCATIONSGUID == '00000000-0000-0000-0000-000000000000' ? '00000000-0000-0000-0000-000000000000' : this.authservice.LoggedInUser.LOCATIONSGUID.split(",");
    }
    this.allreportservice.getApprovalQuotations(this.centerGuid, this.fromDate, this.toDate, this.LocationGuid, this.supplierGuid).subscribe(data => {
      this.quotationApprovalList = data.Result
      // this.globalService.stopSpinner()
      this.shimmerVisible=false;
      if (this.quotationApprovalList?.length == 0) {
        this.noDataFound = true
      } else {
        TypeName == 'pdf' ? this.downloadReport() : TypeName == 'excel' ? this.downloadExcel() : "";
        this.noDataFound = false
      }
      console.log(this.CenterclearControl.value,'qw')
    }, error => {
      // this.globalService.stopSpinner();
      this.shimmerVisible=false;
    })
  }

  getDefaultData() {
    // this.globalService.startSpinner()
    this.shimmerVisible=true;
    const DepotmentGuid = this.authservice.LoggedInUser.DEFAULTROLES.toLowerCase().includes('ADMIN'.toLowerCase()) && this.authservice.LoggedInUser.LOCATIONSGUID == '00000000-0000-0000-0000-000000000000' ? '00000000-0000-0000-0000-000000000000' : this.authservice.LoggedInUser.LOCATIONSGUID.split(",");
    this.quotationservice.getQuotationPostDefaults(DepotmentGuid).subscribe(({ Result }) => {
      this.defaultData = Result;
      this.locationsList = Result.LstQuotationCenterLocationType;
      this.suppliersList = Result.LstQuotationSupplierType
      this.centerList = Result.LstQuotationStateDetailsType.filter((f: { CenterGuid: any; }) => this.locationsList.some((filter: { CenterGuid: any; }) => filter.CenterGuid === f.CenterGuid));
      this.shimmerVisible=false;      
    }, error => {
      // this.globalService.stopSpinner();
      this.shimmerVisible=false;
    })
    
  }
  selectFromDate(event: any) {
    // this.noDataFound = false
    this.isDisable = true
    this.selectfromDate = event
    this.selectedToDate = ""
    this.toDate=""
    this.fromDate = event.year + "-" + event.month + "-" + event.day;
  }

  selectToDate(event: any) {
    this.noDataFound = false
    this.isDisable = false
    this.selectedToDate = event
    this.toDate = event.year + "-" + event.month + "-" + event.day;
  }
  async downloadReport(){
    await  this.DownloadPdf();
      this.DownloadPdfnew();
    }
    preparedata() : any[]{
      interface Issue {
        QuotationNo: string;
        ApprovalStatus : string;
        SupplierName: string;
        LocationName: string;
        ItemName: string;
        VendorItemName : string;
        CatalogNo: string;
        HSNCode: any;
        ManufactureName: any;
        MachineName: any;
        PackSize: any;
        Rate: any;
        GSTAmount: any;
        DiscountAmt: any;
        BuyPrice: any;
        CreateDate: any;
        CheckedDate: any;
        ApprovedDate: any;
        CreatedBy: any;
        CheckedByName: any;
        ApprovedByName: any;
        Department :any;
      }
      return  this.quotationApprovalList.map((report: Issue, index: number) => [ 
        { content: index + 1, styles: { minCellWidth: 10,fontSize:8 } },
        { content: report.QuotationNo, styles: { minCellWidth: 7,fontSize:8 } }, 
        { content: report.ApprovalStatus== "0" ?'Maker':report.ApprovalStatus=="1"?'Checked':report.ApprovalStatus== "2"?'Approved':'', styles: { minCellWidth: 7,fontSize:8 } }, 
        { content: report.SupplierName, styles: { minCellWidth: 15,fontSize:6 } },
        { content: report.LocationName, styles: { minCellWidth: 29,fontSize:6} },
        { content: report.ItemName, styles: { minCellWidth: 25,fontSize:8 } },
        { content: report.VendorItemName ? report.VendorItemName : 'N/A', styles: { minCellWidth: 20,fontSize:8 } },
        { content: report.CatalogNo, styles: { minCellWidth: 5,fontSize:8 } },
        { content: report.HSNCode==""||report.HSNCode==null?"N/A":report.HSNCode, styles: { minCellWidth: 12,fontSize:8 } },
        { content: report.ManufactureName, styles: { minCellWidth: 23,fontSize:8 } },
        { content: report.Department, styles: { minCellWidth: 23,fontSize:8 } },
        { content: report.MachineName==null||report.MachineName==""?'N/A':report.MachineName, styles: { minCellWidth: 20,fontSize:6 } },
        { content: report.PackSize, styles: { minCellWidth: 10,fontSize:8 } },
        { content: report.Rate, styles: { minCellWidth: 8,fontSize:8 } },
        { content: report.GSTAmount, styles: { minCellWidth: 8,fontSize:8} },
        { content: report.DiscountAmt, styles: { minCellWidth: 8,fontSize:8 } },
        { content: report.BuyPrice, styles: { minCellWidth: 18,fontSize:8} },
        { content: report.CreateDate+report.CreatedBy, styles: { minCellWidth: 15 ,fontSize:7} },
        { content: report.CheckedDate+report.CheckedByName, styles: { minCellWidth: 15 ,fontSize:7} },
        { content: report.ApprovedDate+report.ApprovedByName, styles: { minCellWidth: 15 ,fontSize:7} },
      ]);
    }
  DownloadPdf() {
    const doc = new jsPDF({ orientation: 'landscape' });
    const imageHeight = 15;
    const cursorY = imageHeight + 30;
    let currentPageNumber = 0;
    const tableWidth = 290;
    autoTable(doc, {
      head: [this.createHeaderCols()],
      body: this.preparedata(),
      startY: cursorY,
      tableWidth: tableWidth,
      margin: { left: 3 },
      didDrawPage: (data) => {
        currentPageNumber++; 
        this.totalPageNumbers = currentPageNumber
      }
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
      const headline1Content = 'Quotations Report  Summary';
      const headline1XPos = 100; 
      const headline1YPos = imageYPos + imageHeight + 10-data;
      const headline1FontSize = 10;
      doc
        .text(headline1Content, headline1XPos, headline1YPos)
        .setFontSize(headline1FontSize);
    }  
    const createSubTitle = (data:any) =>{
      const fromDateParts = this.fromDate.split('-');
      const toDateParts = this.toDate.split('-');
      const formattedFromDate = fromDateParts[2] + '-' + fromDateParts[1] + '-' + fromDateParts[0];
      const formattedToDate = toDateParts[2] + '-' + toDateParts[1] + '-' + toDateParts[0];
      const headline2Content = 'Period From: ' + formattedFromDate + ' Period To: ' + formattedToDate;
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
      body: this.preparedata(),
      startY: cursorY,
      theme: 'grid',
      tableWidth: tableWidth,
      margin: { left: 2 },
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
    doc.save('Quotations.pdf');
  }
  public createHeaderCols() {
    const headerColStyles = {
      fontSize: 6,
      fillColor: '#00435d',
      textColor: '#fff',
      lineColor: '#fff',
    };
    return [
      { content: 'S.No', styles: { ...headerColStyles } },
      { content: 'QuotationNumber', styles: { ...headerColStyles } },
      { content: 'QuotationStatus', styles: { ...headerColStyles } },
      { content: 'SupplierName', styles: { ...headerColStyles } },
      { content: 'LocationName', styles: { ...headerColStyles } },
      { content: 'ItemName', styles: { ...headerColStyles } },
      { content: 'VendorItemName', styles: { ...headerColStyles } },
      { content: 'CatalogNo', styles: { ...headerColStyles } },
      { content: 'Hsncode', styles: { ...headerColStyles } },
      { content: 'Manufacturer', styles: { ...headerColStyles } },
      { content: 'Department Type', styles: { ...headerColStyles } },
      { content: 'Machine', styles: { ...headerColStyles } },
      { content: 'Packsize', styles: { ...headerColStyles } },
      { content: 'Rate', styles: { ...headerColStyles } },
      { content: 'Tax', styles: { ...headerColStyles } },
      { content: 'Discount', styles: { ...headerColStyles } },
      { content: 'Price', styles: { ...headerColStyles } },
      { content: 'Created', styles: { ...headerColStyles } },
      { content: 'Checked', styles: { ...headerColStyles } },
      { content: 'Approved', styles: { ...headerColStyles } }
    ];
  }


  downloadExcel() {
    const header = ['Quotation no.','Item Code','Item Name','Vendor Item Name',"Pack Size","Catalog no.","Quantity/Unit" ,'Manufacturer','Department Type','Valid Upto','Rate per Unit','Tax Amount','Discount Amount','Buy Price','Vendor Name','Vendor Code','Vendor Address', 'Vendor Location', 'Quotation Date','Approved Date',
    'Approved By' ,"Remarks",'Checked Date','Checked By',"Remarks",'Created Date','Created by','Status','Item Cancel Date','Item Cancel By',"Item Cancel Reason"];
    // "Supplier Code" ,'Location','Catalog no.','Hsn code', 'Manufacturer', 'Machine', 'Pack size', 'Item rate ₹', 'Discount %', 'CGST %', 'SGST %', 'IGST %', 'Buy Price ₹' ];
    // Create workbook and worksheet
    const workbook = new Workbook();
    const fromDateParts = this.fromDate.split('-');
      const toDateParts = this.toDate.split('-');
      const formattedFromDate = fromDateParts[2] + '-' + fromDateParts[1] + '-' + fromDateParts[0];
      const formattedToDate = toDateParts[2] + '-' + toDateParts[1] + '-' + toDateParts[0];
      const headline2Content = 'Period From: ' + formattedFromDate + ' Period To: ' + formattedToDate;
    const worksheet = workbook.addWorksheet('Sharing Data');
    worksheet.addRow([null,null,null,null ,null,null,null,null ,null,null,null,"Quotations Report Summary"])
    worksheet.addRow([null,null,null,null ,null,null,null,null ,null,null,null,headline2Content])
    const cell1 = worksheet.getCell('L1');
const cell2 = worksheet.getCell('L2');
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
    worksheet.getColumn(1).width = 15;
    worksheet.getColumn(2).width = 25;
    worksheet.getColumn(3).width = 15;
    worksheet.getColumn(4).width = 30;
    worksheet.getColumn(5).width = 20;
    worksheet.getColumn(6).width = 10;
    worksheet.getColumn(7).width = 20;
    worksheet.getColumn(8).width = 15;
    worksheet.getColumn(9).width = 10;
    worksheet.getColumn(10).width = 15;
    worksheet.getColumn(11).width = 15;
    worksheet.getColumn(12).width = 15;
    worksheet.getColumn(13).width = 20;
    worksheet.getColumn(14).width = 20;
    worksheet.getColumn(15).width = 20;
    worksheet.getColumn(16).width = 20;
    worksheet.getColumn(17).width = 20;
    worksheet.getColumn(18).width = 20;
    worksheet.getColumn(19).width = 20;
    worksheet.getColumn(20).width = 20;
    worksheet.getColumn(21).width = 20;
    worksheet.getColumn(22).width = 20;
    worksheet.getColumn(23).width = 20;
    worksheet.getColumn(24).width = 20;
    worksheet.getColumn(25).width = 20;
    worksheet.getColumn(26).width = 20;
    worksheet.getColumn(27).width = 20;
    worksheet.getColumn(28).width = 20;
    let TotalPrice = 0;
    this.quotationApprovalList.forEach((item: any) => {
      TotalPrice += parseFloat(item.BuyPrice);
    })
    this.quotationApprovalList.forEach((item: any) => {
      const row = worksheet.addRow([
        item.QuotationNo || "N/A",
        item.ItemCode || "N/A",
        item.ItemName || "N/A",
        item.VendorItemName || "N/A",
        item.PackSize || "N/A",
        item.CatalogNo || "N/A",
        item.PurchasedUnit || "N/A",
        item.ManufactureName || "N/A",
        item.Department.trim() || "N/A",
        this.datePipe.transform(item.ToDate, 'dd-MM-yyyy')|| "N/A",
        item.Rate || "N/A",
        item.GSTAmount || 0,
        item.DiscountAmt || 0,
        item.BuyPrice || "N/A",
        item.SupplierName || "N/A",
        item.SupplierCode || "N/A",
        item.SupplierAddress || "N/A",
        item.SupplierStateName || "N/A",
        item.CreateDate || "N/A",
        item.ApprovedDate || "N/A",
        item.ApprovedByName || "N/A",
        item.ApproveReason || "N/A",
        item.CheckedDate || "N/A",
        item.CheckedByName || "N/A",
        item.CheckedReason || "N/A",
        item.CheckedDate || "N/A",
        item.CreatedBy || "N/A",
        item.ApprovalStatus== "0" ?'Maker':item.ApprovalStatus=="1"?'Checked':item.ApprovalStatus== "2"?'Approved':'' || "N/A",
        item.ItemCancelDate=='0001-01-01T00:00:00' ? 'N/A':this.datePipe.transform(item.ItemCancelDate, 'dd-MM-yyyy') || "N/A",
        item.ItemCancelBy == null ? 'N/A' : item.ItemCancelBy,
        item.ItemCancelReason == null ? 'N/A' : item.ItemCancelReason
      ]);
    }); 
    worksheet.addRow([]);
    worksheet.addRow(['','' , '','' , '','' ,'','' ,'', `Total buy price : ${parseFloat(TotalPrice.toFixed(2))}`])
    const fileName = 'Quotations-print.xlsx';
    workbook.xlsx.writeBuffer().then((data: any) => {
      const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, fileName);
    });
  }
  removeDates() {
    this.quotationApprovalList = [];
    this.supplierGuid = ""
    this.buttonDisable = true
    this.isDisable = true
    this.noDataFound = false
    this.fromDate = ""
    this.toDate = ""
    this.LocationGuid = ""
    this.centerGuid = ""
    this.clearControl.reset();
    this.CenterclearControl.reset();
    this.cleardateControl.reset()
    this.clearfromdateControl.reset()
    this.clearsControl.reset()
    this.locationsList = this.defaultData.LstQuotationCenterLocationType
    this.centerList = this.defaultData.LstQuotationStateDetailsType.filter((f: { CenterGuid: any; }) => this.locationsList.some((filter: { CenterGuid: any; }) => filter.CenterGuid === f.CenterGuid));
  }
  Onremove() {
    this.LocationGuid = []
  }
  // filterData(event: any, type: any) {
  //   if (event != undefined) {
  //     if (event.CenterLocationGuid || event.CenterGuid || event.SupplierGuid) {
  //       this.buttonDisable = false
  //       this.LocationGuid = event.CenterLocationGuid
  //       this.centerList = this.defaultData.LstQuotationStateDetailsType.filter((f: { CenterGuid: any; }) => f.CenterGuid == event.CenterGuid);
  //     this.locationsList = this.defaultData.LstQuotationCenterLocationType.filter((f: { CenterGuid: any; }) => f.CenterGuid == event.CenterGuid);
  //     }
  //     else {
  //       this.buttonDisable = true
  //       this.LocationGuid = ""
  //       this.noDataFound = false
  //       this.locationsList = this.defaultData.LstQuotationCenterLocationType
  //       this.centerList = this.defaultData.LstQuotationStateDetailsType.filter((f: { CenterGuid: any; }) => this.locationsList.some((filter: { CenterGuid: any; }) => filter.CenterGuid === f.CenterGuid));
  //     }
  //   }
  //   if (event != undefined ? event.SupplierGuid != undefined : event != undefined) {
  //     this.supplierGuid = event.SupplierGuid
  //   } else {
  //     event == undefined  ? this.supplierGuid = null: this.supplierGuid 
  //      this.noDataFound=false
  //   }
  //   if (type == "" && event == undefined) {
  //     this.clearControl.reset()
  //   }

  // }
  filterData(event: any, type: any){
    if(event!=undefined && type==''){
      if(event.CenterLocationGuid!=undefined || event.CenterGuid){
        this.buttonDisable = false
        this.LocationGuid = event.CenterLocationGuid
        this.centerList = this.defaultData.LstQuotationStateDetailsType.filter((f: { CenterGuid: any; }) => f.CenterGuid == event.CenterGuid);
        this.locationsList = this.defaultData.LstQuotationCenterLocationType.filter((f: { CenterGuid: any; }) => f.CenterGuid == event.CenterGuid);
      }
    }
    else if (type=='' && event==undefined){
      this.buttonDisable = true
      this.clearControl.reset();
      this.CenterclearControl.reset();
      this.locationsList = this.defaultData.LstQuotationCenterLocationType;
      this.centerList = this.defaultData.LstQuotationStateDetailsType.filter((f: { CenterGuid: any; }) => this.locationsList.some((filter: { CenterGuid: any; }) => filter.CenterGuid === f.CenterGuid));
    }
    if(event!=undefined && type=='supplier'){
      this.supplierGuid = event.SupplierGuid
    }else if(event==undefined && type=='supplier'){
      this.supplierGuid = null
    } 
  }
}
