import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { NgbDateParserFormatter,NgbCalendar, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { Workbook } from 'exceljs';
import { saveAs } from 'file-saver';
import { AuthenticationService } from 'src/app/core/Services/authentication.service';
import { GlobalService } from 'src/app/core/Services/global.service';
import { PurchaseOrderService } from 'src/app/core/Services/purchase-order.service';
import { QuotationService } from 'src/app/core/Services/quotation.service';
import { CustomDateParserFormatter } from 'src/app/core/Services/ngbdate-format.service';
import { FormControl } from '@angular/forms';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ColumnMode } from '@swimlane/ngx-datatable';
@Component({
  selector: 'app-po-report',
  templateUrl: './po-report.component.html',
  styleUrls: ['./po-report.component.scss'],
  providers: [
    { provide: NgbDateParserFormatter, useClass: CustomDateParserFormatter },
  ],
})
export class PoReportComponent implements OnInit {
  shimmerVisible : boolean = true;
 ColumnMode = ColumnMode;
  loadingIndicator : boolean = true;
  UnparsedHtml: any =  '<html lang="en"><head><meta charset="UTF-8"><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Purchase Order Report</title><style>table{border-collapse:collapse;border:1px solid #000}table td,table th{border-bottom:1px solid #000;border-right:1px solid #000;padding:5px;text-align:left;word-wrap:break-word;word-break:break-all;font-size:10px}table th{background-color:#ccc}.logo{height:28px;display:flex;align-items:center;justify-content:center;padding:20px 0}</style></head><body><table style="text-align:center;table-layout:fixed" width="100%"><tbody><tr><td><div class="logo"><img data-v-0e549244="" src="assets/images/YodaLIMSLogo.png" alt="Yoda LIMS"></div></td></tr></tbody></table><table style="text-align:center;table-layout:fixed" width="100%"><tbody><tr><td style="text-align:center;font-weight:700;font-size:16px">Purchase Order Report</td></tr><tr><td style="text-align:center;font-weight:700;font-size:14px">As On :%%ReportDate%%</td></tr></tbody></table><table style="table-layout:fixed;margin-top:20px" width="100%"><thead><tr><th>PO Number</th><th>Total No. Items</th><th width="100">Delivery Location</th><th>Supplier Name</th><th>Gross Total(₹)</th><th>Total Discount(₹)</th><th>Total Tax(₹)</th><th>Net Total(₹)</th><th>Created On</th><th>Created By</th><th>Checked On</th><th>Checked By</th><th>Approved On</th><th>Approved By</th></tr></thead><tbody><tr id="PODetails"><td>%%PurchaseOrderNO%%</td><td>%%TotalNoItems%%</td><td>%%Deliverlocation%%</td><td>%%SupplierName%%</td><td>%%GrossTotal%%</td><td>%%TotalDis%%</td><td>%%TotalTax%%</td><td>%%NetTotal%%</td><td>%%Createdon%%</td><td>%%CreatedBy%%</td><td>%%CheckedDate%%</td><td>%%CheckedBy%%</td><td>%%ApprovedDate%%</td><td>%%ApprovedBy%%</td></tr><tr><th colspan="13" style="text-align:right">Total Amount</th><th>%%TotalAmount%%</th></tr></tbody></table></body></html>';
  FromDate: string='';
  ToDate: any='';
  POType: any = [];
  PODetails: any = [];
  formattedDate: any;
  getpurchaseorderdetails: any = [];
  locationtypelist: any;
  CenterTypeList: any;
  LocationGuid: any = [];
  CenterGuid: any = []
  isSelected:boolean=false
  isDisable: boolean=true;
  selectedToDate: any;
  selectfromDate: any="";
  noDataFound: boolean=false;
  clearControl: FormControl = new FormControl();
  clearCenterControl: FormControl = new FormControl();
  cleardateControl: FormControl = new FormControl();
  clearControls:FormControl = new FormControl();
  ClearDateControl:FormControl = new FormControl();
  buttonDisable:boolean=true;
  suppliersList: any=[];
  supplierGuid: any=null;
  totalPageNumbers : any
  constructor(
    private purchaseOrderService: PurchaseOrderService,
    private quotationService: QuotationService,
    private datepipe: DatePipe,
    private authservice: AuthenticationService,
    public calender:NgbCalendar,
    public globalService: GlobalService

  ) { }

  ngOnInit(): void {
    const currentDate = new Date();
    this.formattedDate = this.datepipe.transform(currentDate, 'dd-MMM-yyyy hh:mm a');
    this.GetPurchaseOrderDetails()
    this.shimmerVisible=false;
  }

  GetPurchaseOrderDetails() {
    let DepotmentGuid = this.authservice.LoggedInUser.DEFAULTROLES.toLowerCase().includes('ADMIN'.toLowerCase()) && this.authservice.LoggedInUser.LOCATIONSGUID=='00000000-0000-0000-0000-000000000000' ? '00000000-0000-0000-0000-000000000000' : this.authservice.LoggedInUser.LOCATIONSGUID.split(",")
    this.quotationService.getQuotationPostDefaults(DepotmentGuid).subscribe(({Result}) => {
      this.getpurchaseorderdetails = Result;
      this.suppliersList=Result.LstQuotationSupplierType
      this.locationtypelist = Result.LstQuotationCenterLocationType;
      this.CenterTypeList = Result.LstQuotationStateDetailsType.filter((f: { CenterGuid: any; }) => this.locationtypelist.some((filter: { CenterGuid: any; }) => filter.CenterGuid === f.CenterGuid));   
 });
    
  }
  OnSelectPOType(type: any = null) {
    this.shimmerVisible= true;
     if(this.LocationGuid?.length==0  || this.LocationGuid==undefined){
      this.LocationGuid =this.authservice.LoggedInUser.DEFAULTROLES.toLowerCase().includes('ADMIN'.toLowerCase()) && this.authservice.LoggedInUser.LOCATIONSGUID=='00000000-0000-0000-0000-000000000000' ?'00000000-0000-0000-0000-000000000000': this.authservice.LoggedInUser.LOCATIONSGUID.split(",");
    }
    this.purchaseOrderService.GetIndentReports(this.FromDate, this.ToDate, this.POType, this.LocationGuid, this.CenterGuid,this.supplierGuid).subscribe(data => {
      // this.PODetails = data.Result.getpurchaseOrderReporters
      this.PODetails = data.Result.getpurchaseOrderReporters.filter((obj: { PurchaseOrderNo: any; }, index: any, self: any[]) =>
          index === self.findIndex((item) => (
            item.PurchaseOrderNo === obj.PurchaseOrderNo
          ))
        );
        this.shimmerVisible= false;
        if (this.PODetails?.length == 0) {
          this.noDataFound = true
        }
        else {
          type=='pdf'? this.downloadReport(): type=='xl'?  this.downloadExcel() : "";
          this.noDataFound=false
        }
        this.shimmerVisible= false;
    },
      (err: HttpErrorResponse) => {
        this.shimmerVisible= false;
      })
  }
  Change(event: any) {
    this.isSelected=true
    this.LocationGuid = event.CenterLocationGuid
  }
  SelectFromDate(event: any) {
    this.cleardateControl.reset()
    this.isDisable=true
    this.isSelected=false
    this.selectfromDate = event
    this.FromDate = event.year + "-" + event.month + "-" + event.day;
    this.ToDate=''
    }
  
  OnSelectToDate(event: any) {
    this.isDisable=false
    this.noDataFound = false
    this.selectedToDate = event
    this.ToDate = event.year + "-" + event.month + "-" + event.day;
    }
    ChangeLocation(event: any, type: any){
      if(event!=undefined && type==''){
        if(event.CenterLocationGuid!=undefined || event.CenterGuid){
          this.buttonDisable = false
          this.LocationGuid = event.CenterLocationGuid
          this.CenterTypeList = this.getpurchaseorderdetails.LstQuotationStateDetailsType.filter((f: { CenterGuid: any; }) => f.CenterGuid == event.CenterGuid);
          this.locationtypelist = this.getpurchaseorderdetails.LstQuotationCenterLocationType.filter((f: { CenterGuid: any; }) => f.CenterGuid == event.CenterGuid);
        }
      }
      else if (type=='' && event==undefined){
        this.buttonDisable = true
        this.clearControl.reset()
        this.clearCenterControl.reset()
        this.locationtypelist = this.getpurchaseorderdetails.LstQuotationCenterLocationType;
        this.CenterTypeList = this.getpurchaseorderdetails.LstQuotationStateDetailsType.filter((f: { CenterGuid: any; }) => this.locationtypelist.some((filter: { CenterGuid: any; }) => filter.CenterGuid === f.CenterGuid));
      }
      if(event!=undefined && type=='supplier'){
        this.supplierGuid = event.SupplierGuid
      }else{
        this.supplierGuid = null
      } 
    }
    removeDates() {
      this.PODetails =[];
      this.buttonDisable=true
      this.isDisable = true
      this.noDataFound = false
      this.FromDate = ""
      this.ToDate = ""
      this.LocationGuid=''
      this.CenterGuid=""
      this.supplierGuid=""
      this.buttonDisable=true
      this.clearControl.reset();
      this.clearCenterControl.reset();
      this.cleardateControl.reset()
      this.ClearDateControl.reset();
      this.clearControls.reset();
      this.locationtypelist = this.getpurchaseorderdetails.LstQuotationCenterLocationType;
      this.CenterTypeList = this.getpurchaseorderdetails.LstQuotationStateDetailsType.filter((f: { CenterGuid: any; }) => this.locationtypelist.some((filter: { CenterGuid: any; }) => filter.CenterGuid === f.CenterGuid));
    }
    
async downloadReport(){
  await  this.DownloadPdf();
  this.DownloadPdfNew();
}
PrepareData() : any[]{
  interface Purchase {
    Location: string;
    CreatedBy: string;
    PurchaseOrderNo: string;
    VendorName: string;
    IndentNo: string;
    GrossTotal: any;
    DiscountOnTotal:any
    TaxAmount: any;
    NetTotal: any;
    POType: any;
    CheckedDate: any;
    CheckedByName: any;
    ApprovedDate: any;
    AppprovedByName: any;
    CreatedDt: any;
    ItemsCount: any;
  }
 return this.PODetails.map((purchase: Purchase, index: number) => [
    { content: index + 1, styles: { minCellWidth: 10 } },
    { content: purchase.Location, styles: { minCellWidth: 25 } }, 
    { content: purchase.PurchaseOrderNo, styles: { minCellWidth: 30 } },
    { content: purchase.VendorName, styles: { minCellWidth: 20 } },
    { content: purchase.IndentNo, styles: { minCellWidth: 25 } },
    { content: purchase.GrossTotal.toString().match(/^\d+(?:\.\d{0,2})?/), styles: { minCellWidth: 20 } },
    { content: purchase.DiscountOnTotal.toString().match(/^\d+(?:\.\d{0,2})?/), styles: { minCellWidth: 15 } },
    { content: purchase.TaxAmount.toString().match(/^\d+(?:\.\d{0,2})?/), styles: { minCellWidth: 20 } },
    { content: purchase.NetTotal.toString().match(/^\d+(?:\.\d{0,2})?/), styles: { minCellWidth: 20 } },
    { content: purchase.POType, styles: { minCellWidth: 25 } },
    { content: purchase.CheckedDate==null?"N/A":(purchase.CheckedDate+purchase.CheckedByName),styles: { minCellWidth: 13 } },
    { content: purchase.ApprovedDate==null?"N/A":(purchase.ApprovedDate+purchase.AppprovedByName), styles: { minCellWidth: 13 } },
    { content: purchase.CreatedDt + purchase.CreatedBy, styles: { minCellWidth: 13 } },
    { content: purchase.ItemsCount, styles: { minCellWidth: 3 } },
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
    const headline1Content = 'Purchase Order Report Summary';
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
  doc.save('Purchase-order.pdf');
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
    { content: 'Deliverlocation', styles: { ...headerColStyles } },
    { content: 'PurchaseOrderNO', styles: { ...headerColStyles } },
    { content: 'SupplierName', styles: { ...headerColStyles } },
    { content: 'IndentNo', styles: { ...headerColStyles } },
    { content: 'GrossTotal', styles: { ...headerColStyles } },
    { content: 'TotalDis', styles: { ...headerColStyles } },
    { content: 'TotalTax', styles: { ...headerColStyles } },
    { content: 'NetPrice', styles: { ...headerColStyles } },
    { content: 'POType', styles: { ...headerColStyles } },
    //{ content: 'CheckedDate', styles: { ...headerColStyles } },
    { content: 'Checked', styles: { ...headerColStyles } },
    //{ content: 'ApprovedDate', styles: { ...headerColStyles } },
    { content: 'Approved', styles: { ...headerColStyles } },
    { content: 'Created', styles: { ...headerColStyles } },
    { content: 'TotalItems', styles: { ...headerColStyles } },
  ];
}
  downloadExcel()
  {
    const header = ['PO Number','Total No. Items','Delivery Location','Supplier Name','Supplier Code', 'Gross Total(₹)','Total Discount(₹)', 'Total Tax(₹)', 'Net Price(₹)','Created On', 'Created By', 'Checked On','Checked By',
    'Approved On','Approved By','Recalled On','Recalled By','Cancelled On','Cancelled By','Quotation Reason','Alternate Quotation','IsUrgent'];
    // Create workbook and worksheet
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('Sharing Data');
    const fromDateParts = this.FromDate.split('-');
    const toDateParts = this.ToDate.split('-');
    const formattedFromDate = this.FromDate != "" ?fromDateParts[2] + '-' + fromDateParts[1] + '-' + fromDateParts[0] : null;
    const formattedToDate = this.ToDate != "" ? toDateParts[2] + '-' + toDateParts[1] + '-' + toDateParts[0]:null;
    const headline2Content = 'Period From: ' + formattedFromDate + ' Period To: ' + formattedToDate;
    worksheet.addRow([null,null,null,null,null,null,null,"PO Report"])
    worksheet.addRow([null,null,null,null,null,null,null,headline2Content])
    const cell1 = worksheet.getCell('H1');
  const cell2 = worksheet.getCell('H2');
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
    worksheet.getColumn(1).width = 40;
    worksheet.getColumn(2).width = 30;
    worksheet.getColumn(3).width = 30;
    worksheet.getColumn(4).width = 30;
    worksheet.getColumn(5).width = 30;
    worksheet.getColumn(6).width = 30;
    worksheet.getColumn(7).width = 30;
    worksheet.getColumn(8).width = 30;
    worksheet.getColumn(9).width = 30;
    worksheet.getColumn(10).width = 30;
    worksheet.getColumn(11).width = 30;
    worksheet.getColumn(12).width = 30;
    worksheet.getColumn(13).width = 30;
    worksheet.getColumn(14).width = 30;
    worksheet.getColumn(15).width = 30;
    worksheet.getColumn(16).width = 30;
    worksheet.getColumn(17).width = 30;
    worksheet.getColumn(18).width = 30;
    worksheet.getColumn(19).width = 30;
    worksheet.getColumn(20).width = 30;
    // worksheet.addRow([]);

    // Add Data and Conditional Formatting
    this.PODetails.forEach((d: any) => {
      const row = worksheet.addRow([
        d.PurchaseOrderNo,
        d.ItemsCount,
        d.Location,
        d.VendorName,
        d.VendorCode || "N/A",
        parseFloat(d.GrossTotal),
        d.DiscountOnTotal,
        parseFloat(d.TaxAmount),
        parseFloat(d.NetTotal),
        d.CreatedDt ? d.CreatedDt : 'N/A',
        d.CreatedBy ? d.CreatedBy : 'N/A',
        d.CheckedDate ? d.CheckedDate:'N/A',
        d.CheckedByName ? d.CheckedByName : 'N/A',
        d.ApprovedDate ? d.ApprovedDate : 'N/A',
        d.AppprovedByName ? d.AppprovedByName : 'N/A',
        d.RecallDate &&  d.RecallDate !=='0001-01-01T00:00:00' ? new Date(d.RecallDate).toLocaleDateString('en-GB').split('/').join('-') : 'N/A',
        d.RecallByName ? d.RecallByName : 'N/A',
        d.CancelDate && d.CancelDate !== '0001-01-01T00:00:00' ? new Date(d.CancelDate).toLocaleDateString('en-GB').split('/').join('-') : 'N/A',
        d.CancelledBy ? d.CancelledBy : 'N/A',
        d.ChangeQuotatioNoReaason ? d.ChangeQuotatioNoReaason : 'N/A' ,
        d.ChangeQuotatioNoReaason!=='' ? false : true,
        d.Isurgent ? d.Isurgent : 'N/A'
      ]);
    });
    // Create a file name for the downloaded file
    const fileName = 'PurchaseOrderReport-print.xlsx';
    // Generate Excel File with given name
    workbook.xlsx.writeBuffer().then((data: any) => {
      const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, fileName);
    });
    this.globalService.stopSpinner();
  }

  Onremove() {
    this.LocationGuid = []
  }
    
}




