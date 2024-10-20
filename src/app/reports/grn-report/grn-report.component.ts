import { Component, OnInit } from '@angular/core';
import { NgbCalendar, NgbDateParserFormatter, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { Workbook } from 'exceljs';
import { saveAs } from 'file-saver';
import { GrnService } from 'src/app/core/Services/grn.service';
import { DatePipe } from '@angular/common';
import { AuthenticationService } from 'src/app/core/Services/authentication.service';
import { CustomDateParserFormatter } from 'src/app/core/Services/ngbdate-format.service';
import { QuotationService } from 'src/app/core/Services/quotation.service';
import { FormControl } from '@angular/forms';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ColumnMode } from '@swimlane/ngx-datatable';
@Component({
  selector: 'app-grn-report',
  templateUrl: './grn-report.component.html',
  styleUrls: ['./grn-report.component.scss'],
  providers: [
    { provide: NgbDateParserFormatter, useClass: CustomDateParserFormatter },
  ],
})
export class GrnReportComponent implements OnInit {
  shimmerVisible:boolean;
ColumnMode = ColumnMode;
loadingIndicator : boolean = true;
  selectedToDate: any="";
  selectfromDate: any="";
  UnparsedHtml: any = '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta name="viewport" content="width=device-width,initial-scale=1"><title>GRN Report</title><style>table{border-collapse:collapse;border:1px solid #000}table td,table th{border-bottom:1px solid #000;border-right:1px solid #000;padding:5px;text-align:left;word-wrap:break-word;word-break:break-all;font-size:10px}table th{background-color:#ccc}.logo{height:28px;display:flex;align-items:center;justify-content:center;padding:20px 0}</style></head><body><table style="text-align:center;table-layout:fixed" width="100%"><tbody><tr><td><div class="logo"><img data-v-0e549244="" src="assets/images/YodaLIMSLogo.png" alt="Yoda LIMS"></div></td></tr></tbody></table><table style="text-align:center;table-layout:fixed" width="100%"><tbody><tr><td style="text-align:center;font-weight:700;font-size:16px">GRN Report</td></tr><tr><td style="text-align:center;font-weight:700;font-size:14px">As On :%%newDate%%</td></tr></tbody></table><table style="table-layout:fixed;margin-top:20px" width="100%"><thead><tr><th>GRN #</th><th>No. of items</th><th>Supplier</th><th>Invoice #</th><th>Purchase Order #</th><th>GRN Date</th><th>GRN By</th><th>Checked By</th><th>Checked Date</th><th>Approved By</th><th>Approved Date</th></tr></thead><tbody><tr id="grnreport"><td>%%GRN#%%</td><td>%%ItemQty%%</td><td>%%SupplierName%%</td><td>%%Invoice#%%</td><td>%%PurchaseOrder#%%</td><td>%%GRNDate%%</td><td>%%GRNBy%%</td><td>%%ChekedByName%%</td><td>%%ChekedDate%%</td><td>%%AprovedByName%%</td><td>%%AprovedDate%%</td></tbody></table></body></html>';
  LocationList: any = [];
  GrnList: any=[];
  ToDate: string = '';
  FromDate: string = '';
  FilterOn: string = '';
  Status: string = '';
  CenterTypeGuid: any = '';
  StateGuid: any = '';
  ZoneGuid: any = '';
  CityGuid: any = '';
  CenterGuid: any = '';
  LocationGuid: any = [];
  ReportTypeInExcelGuid: any = '';
  GRNTypeGuid: any = '';
  TotalCount: any;
  grnreport: any = [];
  CenterList: any=[];
  newDate: any;
  formattedDate: any;
  defaultData: any=[];
  noDataFound: boolean=false;
  isDisable: boolean = true;
  clearControl: FormControl = new FormControl();
  CenterclearControl: FormControl = new FormControl();
  clearTodateControl: FormControl = new FormControl();
  buttonDisable:boolean=true;
  clearFromdateControl : FormControl= new FormControl();
  totalPageNumbers:any;
  constructor(
    private grnService: GrnService,
    private datepipe:DatePipe,
    private authservice: AuthenticationService,
    private quotationservice:QuotationService,
    public calendar: NgbCalendar,
  ) { }

  ngOnInit(): void {
    this.getGrnReportsLocation();
    const currentDate = new Date();
    this. formattedDate = this.datepipe.transform(currentDate, 'dd-MMM-yyyy hh:mm a');
  }

  getGrnReportsLocation() { 
    // this.globalService.startSpinner();
    this.shimmerVisible=true;
    const DepotmentGuid =this.authservice.LoggedInUser.DEFAULTROLES.toLowerCase().includes('ADMIN'.toLowerCase()) && this.authservice.LoggedInUser.LOCATIONSGUID=='00000000-0000-0000-0000-000000000000' ?'00000000-0000-0000-0000-000000000000': this.authservice.LoggedInUser.LOCATIONSGUID.split(",");
    this.quotationservice.getQuotationPostDefaults(DepotmentGuid).subscribe(({ Result })=> {
      this.defaultData = Result;
      this.LocationList = Result.LstQuotationCenterLocationType;
      this.CenterList =Result.LstQuotationStateDetailsType.filter((f: { CenterGuid: any; }) => this.LocationList.some((filter: { CenterGuid: any; }) => filter.CenterGuid === f.CenterGuid));
      // this.globalService.stopSpinner();
      this.shimmerVisible=false;
    }, error => {
      // this.globalService.stopSpinner();
      this.shimmerVisible=false;
      });

  }
  getGrnReports(type:any = null) {
    // this.globalService.startSpinner();
    this.shimmerVisible=true;
    this.GrnList=[];
    if(this.LocationGuid.length==0){
      this.LocationGuid =this.authservice.LoggedInUser.DEFAULTROLES.toLowerCase().includes('ADMIN'.toLowerCase()) && this.authservice.LoggedInUser.LOCATIONSGUID=='00000000-0000-0000-0000-000000000000' ?'00000000-0000-0000-0000-000000000000': this.authservice.LoggedInUser.LOCATIONSGUID.split(",");
    }
    this.grnService.GetGrnReports(this.FromDate, this.ToDate, this.FilterOn, this.Status, this.CenterTypeGuid, this.ZoneGuid, this.StateGuid, this.CityGuid, this.CenterGuid, this.LocationGuid, this.ReportTypeInExcelGuid, this.GRNTypeGuid).subscribe(data => {
      this.GrnList = data || [];
      // this.GrnList=this.GrnList.reverse()
      // this.GrnList = this.GrnList.filter((obj: { ItemCode: any, GRN:any,PurchaseOrder:any}, index: any, self: any[]) =>
      //   index === self.findIndex((item) => (
      //     item.ItemCode === obj.ItemCode && item.GRN === obj.GRN && item.PurchaseOrder === obj.PurchaseOrder
      //   ))
      // );
      this.TotalCount = this.GrnList.length;
      // this.globalService.stopSpinner();
      this.shimmerVisible=false;
      if(this.GrnList?.length == 0){
        this.noDataFound=true
      }else{
        type=='pdf'? this. downloadReport(): type=='excel' ? this.downloadExcel() : '';
        this.noDataFound=false
      }
    }, error => {
      // this.globalService.stopSpinner();
      this.shimmerVisible=false;
    })
    
  }
  /**
   * this event used to select the from date
   * @param event 
   */
  selectFromDate(event: any) {
    this.clearTodateControl.reset()
    this.isDisable = true
    this.noDataFound = false
    this.selectfromDate = event
   this.ToDate=''
     //this.selectedToDate =""
    this.FromDate = event.year + "-" + event.month + "-" + event.day  
  }
  /**
   * this event used to select the To date 
   */
  selectToDate(event: any) {
    this.isDisable = false
    this.noDataFound = false
    this.selectedToDate = event;
    this.ToDate = event.year + "-" + event.month + "-" + event.day
  }
  /**
   * this change event used to change the location and item details
   * @param event 
   */
  ChangeLocation(event: any) { 
    this.LocationGuid=''
    if (event != undefined) {
          if (event.CenterLocationGuid != undefined) {
            // this.isDisable = false
            // this.noDataFound = false
            this.buttonDisable=false
            this.LocationGuid = event.CenterLocationGuid
          }
          this.CenterList = this.defaultData.LstQuotationStateDetailsType.filter((f: { CenterGuid: any; }) => f.CenterGuid == event.CenterGuid);
          this.LocationList = this.defaultData.LstQuotationCenterLocationType.filter((f: { CenterGuid: any; }) => f.CenterGuid == event.CenterGuid);
        } else {
          this.clearControl.reset();
          this.CenterclearControl.reset();
          this.buttonDisable=true
          // this.noDataFound = false
          // this.isDisable = false
          this.LocationList = this.defaultData.LstQuotationCenterLocationType
          this.CenterList = this.defaultData.LstQuotationStateDetailsType.filter((f: { CenterGuid: any; }) => this.LocationList.some((filter: { CenterGuid: any; }) => filter.CenterGuid === f.CenterGuid));
        }
  }
  removeDates() {
    this.GrnList = [];
    this.buttonDisable=true
    this.isDisable = true
    this.noDataFound = false
    this.FromDate = ""
    this.ToDate = ""
    this.LocationGuid = ""
    this.CenterGuid = ""
    this.clearControl.reset();
    this.CenterclearControl.reset();
    this.clearTodateControl.reset()
    this.clearFromdateControl.reset()
    this.LocationList = this.defaultData.LstQuotationCenterLocationType
    this.CenterList = this.defaultData.LstQuotationStateDetailsType.filter((f: { CenterGuid: any; }) => this.LocationList.some((filter: { CenterGuid: any; }) => filter.CenterGuid === f.CenterGuid));
  }
  async downloadReport(){
  await  this.downloadPdf();
    this.downloadPdfNew();
  }
  prepareData(): any[] {
    interface GRN {
        GRN: string;
        ItemQty: string;
        SupplierName: any;
        Invoice: any;
        PurchaseOrder: any;
        GRNDate: any;
        GRNBy: any;
        ChekedDate: any;
        ChekedByName: any;
        AprovedDate: any;
        AprovedByName: any;
        PoAmount: any;
        PendingPoAmount: any;
        ItemCode: any;
        ItemPrice: any;
        ItemName: any;
        VendorItemName : string;
    }
    return this.GrnList.map((grn: GRN, index: number) => [
        { content: index + 1, styles: { minCellWidth: 10 } },
        { content: grn.GRN, styles: { minCellWidth: 20 } },
        { content: grn.ItemName, styles: { minCellWidth: 22 } },
        { content: grn.VendorItemName ? grn.VendorItemName : "N/A", styles: { minCellWidth: 22 } },
        { content: grn.ItemCode, styles: { minCellWidth: 22 } },
        { content: grn.ItemQty, styles: { minCellWidth: 15 } },
        { content: grn.ItemPrice, styles: { minCellWidth: 18 } },
        { content: grn.SupplierName, styles: { minCellWidth: 30 } },
        { content: grn.Invoice, styles: { minCellWidth: 17 } },
        { content: grn.PurchaseOrder, styles: { minCellWidth: 28 } },
        { content: grn.PoAmount, styles: { minCellWidth: 20 } },
        { content: grn.PendingPoAmount, styles: { minCellWidth: 20 } },
        { content: (grn.GRNDate + grn.GRNBy), styles: { minCellWidth: 20 } },
        { content: grn.ChekedDate == null ? "N/A" : (grn.ChekedDate + grn.ChekedByName), styles: { minCellWidth: 20 } },
        { content: grn.AprovedDate == null ? "N/A" : (grn.AprovedDate + grn.AprovedByName), styles: { minCellWidth: 20 } },
    ]);
}
  downloadPdf() {
    const doc = new jsPDF({ orientation: 'landscape' });
    const imageHeight = 15;
    const cursorY = imageHeight + 30;
    const tableWidth = 290;
    let currentPageNumber = 0;
    autoTable(doc, {
      head: [this.createHeaderCols()],
      body:  this.prepareData(),
      startY: cursorY,
      tableWidth: tableWidth,
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
      imageHeight,
    );
    function createTitle(data:any){
      const headline1Content = 'GRN Report Summary';
      const headline1XPos = 120;
      const headline1YPos = imageYPos + imageHeight + 10-data;
      const headline1FontSize = 10;
      doc
        .text(headline1Content, headline1XPos, headline1YPos)
        .setFontSize(headline1FontSize);
    }
    const createSubTitle = (data:any) =>{
      const headline2Content = 'Period From: ' + this.datepipe.transform(this.FromDate, "dd-MM-yyyy") + ' Period To: ' + this.datepipe.transform(this.ToDate, "dd-MM-yyyy");
      const headline2XPos = 120;
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
    doc.save('grn-report.pdf');
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
      { content: 'GRN#', styles: { ...headerColStyles } },
      { content: 'Item Name', styles: { ...headerColStyles } },
      { content: 'Vendor Item Name', styles: { ...headerColStyles } },
      { content: 'Item Code', styles: { ...headerColStyles } },
      { content: 'Item Qty', styles: { ...headerColStyles } },
      { content: 'Item Price', styles: { ...headerColStyles } },
      { content: 'Vendor Name', styles: { ...headerColStyles } },
      { content: 'Invoice#', styles: { ...headerColStyles } },
      { content: 'PurchaseOrder', styles: { ...headerColStyles } },
      { content: 'PO Amount', styles: { ...headerColStyles } },
      { content: 'Pending Item (Amt)', styles: { ...headerColStyles } },
      { content: 'GRN', styles: { ...headerColStyles } },
      { content: 'Checked ', styles: { ...headerColStyles } },
      { content: 'Approved ', styles: { ...headerColStyles } },
    ];
  }
  downloadExcel() {
    const header = [ 'GRN','Item Name','Vendor Item Name','Item Code','Item Qty','Vendor Name' , 'Vendor Code','Invoice#','PurchaseOrder','PO Amount','Pending Item (Amt)','GRN','GRN By','Checked Date','Checked By','Approved Date','Approved By'];
    // Create workbook and worksheet
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('Sharing Data');
    const fromDateParts = this.FromDate.split('-');
  const toDateParts = this.ToDate.split('-');
  const formattedFromDate = this.FromDate != "" ?fromDateParts[2] + '-' + fromDateParts[1] + '-' + fromDateParts[0] : null;
  const formattedToDate = this.ToDate != "" ? toDateParts[2] + '-' + toDateParts[1] + '-' + toDateParts[0]:null;
  const headline2Content = 'Period From: ' + formattedFromDate + ' Period To: ' + formattedToDate;
  worksheet.addRow([null,null,null,null,null,null,null,null,"GRN Report"])
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
    worksheet.getColumn(2).width = 20;
    worksheet.getColumn(3).width = 10;
    worksheet.getColumn(4).width = 20;
    worksheet.getColumn(5).width = 20;
    worksheet.getColumn(6).width = 20;
    worksheet.getColumn(7).width = 20;
    worksheet.getColumn(8).width = 20;
    worksheet.getColumn(9).width = 20;
    worksheet.getColumn(10).width= 20;
    worksheet.getColumn(11).width= 20;
    worksheet.getColumn(12).width= 30;
    worksheet.getColumn(13).width = 30;
    worksheet.getColumn(14).width= 30;
    worksheet.getColumn(15).width= 30;
    worksheet.getColumn(16).width= 30;


    // worksheet.addRow([]);

    // Add Data and Conditional Formatting
    this.GrnList.forEach((item: any) => {
      const row = worksheet.addRow([
        item.GRN,
        item.ItemName,
        item.VendorItemName ? item.VendorItemName : "N/A",
        item.ItemCode,
        item.ItemQty,
        item.SupplierName,
        item.SupplierCode || "N/A",
        item.Invoice,
        item.PurchaseOrder, 
        item.PoAmount,
        item.PendingPoAmount,      
        item.GRNDate=='0001-01-01T00:00:00' ?'N/A':item.GRNDate,
        item.GRNBy==null ? 'N/A' :item.GRNBy,
        item.ChekedDate=='0001-01-01T00:00:00' ?'N/A':item.ChekedDate,
        item.ChekedByName==null ? 'N/A' :item.ChekedByName,
        item.AprovedDate=='0001-01-01T00:00:00'  ?'N/A':item.AprovedDate,
        item.AprovedByName ==null ? 'N/A' :item.AprovedByName
      ]);
    });
    // Create a file name for the downloaded file
    const fileName = 'GrnReport-print.xlsx';
    // Generate Excel File with given name
    workbook.xlsx.writeBuffer().then((data: any) => {
      const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, fileName);
    });
  }
  removeData(){
    this.LocationGuid=[]
  }
}
