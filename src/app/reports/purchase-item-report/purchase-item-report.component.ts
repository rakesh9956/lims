import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { NgbCalendar, NgbDateParserFormatter, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { Workbook } from 'exceljs';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AllItemsService } from 'src/app/core/Services/all-items.service';
import { AuthenticationService } from 'src/app/core/Services/authentication.service';
import { CustomDateParserFormatter } from 'src/app/core/Services/ngbdate-format.service';
import { ColumnMode } from '@swimlane/ngx-datatable';
import { QuotationService } from 'src/app/core/Services/quotation.service';

@Component({
  selector: 'app-purchase-item-report',
  templateUrl: './purchase-item-report.component.html',
  styleUrls: ['./purchase-item-report.component.scss'],
  providers: [{ provide: NgbDateParserFormatter, useClass: CustomDateParserFormatter }]
})
export class PurchaseItemReportComponent implements OnInit {
  shimmerVisible:boolean;
  ColumnMode = ColumnMode;
  loadingIndicator : boolean = true;
  UnparsedHtml: any = '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Indent Report</title><style>table{border-collapse:collapse;border:1px solid #000}table td,table th{border-bottom:1px solid #000;border-right:1px solid #000;padding:5px;text-align:left;word-wrap:break-word;word-break:break-all;font-size:10px}table th{background-color:#ccc}.logo{height:28px;display:flex;align-items:center;justify-content:center;padding:20px 0}</style></head><body><table style="text-align:center;table-layout:fixed" width="100%"><tbody><tr><td><div class="logo"><img data-v-0e549244="" src="assets/images/YodaLIMSLogo.png" alt="Yoda LIMS"></div></td></tr></tbody></table><table style="text-align:center;table-layout:fixed" width="100%"><tbody><tr><td style="text-align:center;font-weight:700;font-size:16px">Purchase Item Report</td></tr><tr><td style="text-align:center;font-weight:700;font-size:14px">As On :%%newDate%%</td></tr></tbody></table><table style="table-layout:fixed;margin-top:20px" width="100%"><thead><tr><th>Location name</th><th>Manufacture name</th><th>Created date</th><th>Item name</th><th>Catalog no.</th><th>PO number</th><th>Item price</th><th>Ordered qty</th><th>Order value</th><th>Pack size</th><th>Approved by</th><th>Checked by</th></tr></thead><tbody><tr id="purchaseReport"><td>%%LocationName%%</td><td>%%Manufacture name%%</td><td>%%Created date%%</td><td>%%ItemName%%</td><td>%%Catalog no.%%</td><td>%%PONumber%%</td><td>%%ItemPrice%%</td><td>%%Ordered Qty%%</td><td>%%Order Value%%</td><td>%%Pack Size%%</td><td>%%ApprovedBy%%</td><td>%%CheckedByName%%</td></tr><tr><th colspan="10" style="text-align:right">Total Amount</th><td>%%TotalAmount%%</td></tr></tbody></table></body></html>';
  locations: any;
  locationGuid: any = [];
  fromDate: any = '';
  toDate: any = '';
  newDate: string | null;
  purchaseReport: any = []
  CenterName: FormControl = new FormControl();
  LocationName: FormControl = new FormControl();
  ClearFromDate: FormControl = new FormControl();
  ClearToDate: FormControl = new FormControl();
  TotalCount: any;
  locationsList: any;
  centerList: any;
  defaultData: any;  
  TotalOrdervalue:any;
  selectfromDate: any;
  isDisabled: Boolean = true;
  noDataFound: boolean = false;
  totalPageNumbers : any
  constructor(
    private purcahseItemService: AllItemsService,
    private datepipe: DatePipe,
    private authservice: AuthenticationService,
    private quotationservice: QuotationService,
    public calendar: NgbCalendar
  ) { }

  ngOnInit(): void {
    const currentDate = new Date();
    this.newDate = this.datepipe.transform(currentDate, 'dd-MMM-yyyy hh:mm a');
    this.getDefaultData();
  }
  async downloadReport(){
    await  this.DownloadPdf();
    this.DownloadPdfNew();
}
  DownloadPdf() {
    const doc = new jsPDF({ orientation: 'landscape' });
    const imageHeight = 15;
    const cursorY = imageHeight + 40;
    const tableWidth = 290;
    interface Stock {
      LocationName: string;
      ManufactureName: string;
      CreatedDt: any;
      ItemName: any;
      VendorItemName : string;
      CatalogNo: any;
      PurchaseOrderNo: any;
      Rate: any;
      OrderedQty: any;
      OrderValue:any;
      PackSize: any;
      AppprovedByName: any;
      CheckedByName: any;
      ReleasedCount: any;
      NewQty:any
    }
    const data = this.locations.map((stock: Stock, index: number) => [
      { content: index + 1, styles: { minCellWidth: 8 } },
      { content: stock.LocationName== null ? 'N/A' :stock.LocationName, styles: { minCellWidth: 10 } }, 
      { content: stock.ManufactureName, styles: { minCellWidth: 10 } },
      { content: stock.CreatedDt, styles: { minCellWidth: 20 } },
      { content: stock.ItemName==null?'N/A':stock.ItemName, styles: { minCellWidth: 10 } },
      { content: stock.VendorItemName==null?'N/A':stock.VendorItemName, styles: { minCellWidth: 10 } },
      { content: stock.CatalogNo, styles: { minCellWidth: 20 } },
      { content: stock.PurchaseOrderNo==null?"N/A":stock.PurchaseOrderNo },
      { content: stock.Rate==null?"N/A":stock.Rate, styles: { minCellWidth: 20 } },
      { content: stock.OrderedQty==null?"N/A":stock.OrderedQty },
      { content: stock.OrderValue == null ? "N/A" : parseFloat(stock.OrderValue).toFixed(2) },
      { content: stock.PackSize==null?"N/A":stock.PackSize, styles: { minCellWidth: 20 } },
      { content: stock.AppprovedByName, styles: { minCellWidth: 20 } },
      { content: stock.CheckedByName, styles: { minCellWidth: 20 } },
      { content: stock.OrderValue == null ? "N/A" : parseFloat(stock.OrderValue).toFixed(2) },
    ]);
    let totalOrderValue = 0;
    this.locations.forEach((stock: Stock) => {
      if (stock.OrderValue != null) {
        totalOrderValue += parseFloat(stock.OrderValue);
      }
    });
    data.push(this.createTotalRow(totalOrderValue));
    let currentPageNumber = 0;
    autoTable(doc, {
      head: [this.createHeaderCols()],
      body: data,
      startY: cursorY,
      tableWidth: tableWidth,
      margin: { left: 3 },
      didDrawPage: (data) => {
        currentPageNumber++; 
        this.totalPageNumbers=currentPageNumber
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
      const headline1Content = 'Purchase Item Report Summary';
      const headline1XPos = 110;
      const headline1YPos = imageYPos + imageHeight + 10-data;
      const headline1FontSize = 10;
      doc
        .text(headline1Content, headline1XPos, headline1YPos)
        .setFontSize(headline1FontSize);
    }
    const createSubTitle = (data:any) =>{
    const headline2Content = 'Period From: ' + this.datepipe.transform(this.fromDate, "dd-MM-yyyy") + ' Period To: ' + this.datepipe.transform(this.toDate, "dd-MM-yyyy");
      const headline2XPos = 110;
      const headline2YPos = imageYPos + imageHeight + 16-data;
      const headline2FontSize = 10;
      doc
        .text(headline2Content, headline2XPos, headline2YPos)
        .setFontSize(headline2FontSize);
    }
    const cursorY = imageHeight + 40;
    const tableWidth = 290;
    interface Stock {
      LocationName: string;
      ManufactureName: string;
      CreatedDt: any;
      ItemName: any;
      VendorItemName : string;
      CatalogNo: any;
      PurchaseOrderNo: any;
      NetAmount: any;
      OrderedQty: any;
      OrderValue:any;
      PackSize: any;
      AppprovedByName: any;
      CheckedByName: any;
      ReleasedCount: any;
      NewQty:any
    }
    const data = this.locations.map((stock: Stock, index: number) => [ 
      { content: index + 1, styles: { minCellWidth: 8 } },
      { content: stock.LocationName== null ? 'N/A' :stock.LocationName, styles: { minCellWidth: 10 } }, 
      { content: stock.ManufactureName, styles: { minCellWidth: 10 } },
      { content: stock.CreatedDt, styles: { minCellWidth: 20 } },
      { content: stock.ItemName==null?'N/A':stock.ItemName, styles: { minCellWidth: 10 } },
      { content: stock.VendorItemName==null?'N/A':stock.VendorItemName, styles: { minCellWidth: 10 } },
      { content: stock.CatalogNo, styles: { minCellWidth: 20 } },
      { content: stock.PurchaseOrderNo==null?"N/A":stock.PurchaseOrderNo },
      { content: stock.NetAmount==null?"N/A":stock.NetAmount, styles: { minCellWidth: 20 } },
      { content: stock.OrderedQty==null?"N/A":stock.OrderedQty },
      { content: stock.OrderValue == null ? "N/A" : parseFloat(stock.OrderValue).toFixed(2) },
      { content: stock.PackSize==null?"N/A":stock.PackSize, styles: { minCellWidth: 20 } },
      { content: stock.AppprovedByName, styles: { minCellWidth: 20 } },
      { content: stock.CheckedByName, styles: { minCellWidth: 20 } },
      { content: stock.OrderValue == null ? "N/A" : parseFloat(stock.OrderValue).toFixed(2) },
    ]);
    let totalOrderValue = 0;
    this.locations.forEach((stock: Stock) => {
      if (stock.OrderValue != null) {
        totalOrderValue += parseFloat(stock.OrderValue);
      }
    });
    data.push(this.createTotalRow(totalOrderValue));
    let currentPageNumber = 0;
    autoTable(doc, {
      head: [this.createHeaderCols()],
      body: data,
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
    doc.save('Purchase-item-report.pdf');
  }
  public createTotalRow(totalOrderValue: any) {
    return [
      {
        content: '',
        styles: { minCellWidth: 10 },
        colSpan: this.createHeaderCols().length - 3,
      },
      {
        content: `Total: Rs.${totalOrderValue}`,
        styles: { minCellWidth: 10 },
        colSpan: 3,
      },
    ];
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
      { content: 'Manufacture name', styles: { ...headerColStyles } },
      { content: 'Created date', styles: { ...headerColStyles } },
      { content: 'Item name', styles: { ...headerColStyles } },
      { content: 'Vendor Item name', styles: { ...headerColStyles } },
      { content: 'Catlog no.', styles: { ...headerColStyles } },
      { content: 'Po number', styles: { ...headerColStyles } },
      { content: 'Item price', styles: { ...headerColStyles } },
      { content: 'Ordered Qty', styles: { ...headerColStyles } },
      { content: 'Order Value', styles: { ...headerColStyles } },
      { content: 'Pack size', styles: { ...headerColStyles } },
      { content: 'Approved by', styles: { ...headerColStyles } },
      { content: 'Checked by', styles: { ...headerColStyles } },
    ];
  }

  downloadExcel() {
    const header = ['Location name', 'Manufacture', 'Created date', 'Item name','Vendor Item Name', 'Catalog no.', 'PO number', 'Item price', 'Ordered qty','Ordered value', 'Pack size', 'Approved by', 'Checked by'];
    // Create workbook and worksheet
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('Sharing Data');
    // Add Header Row
    const fromDateParts = this.fromDate.split('-');
    const toDateParts = this.toDate.split('-');
    const formattedFromDate = this.fromDate != "" ?fromDateParts[2] + '-' + fromDateParts[1] + '-' + fromDateParts[0] : null;
    const formattedToDate = this.toDate != "" ? toDateParts[2] + '-' + toDateParts[1] + '-' + toDateParts[0]:null;
    const headline2Content = 'Period From: ' + formattedFromDate + ' Period To: ' + formattedToDate;
    worksheet.addRow([null,null,null,null,null,"Purchase Item Report"])
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
    worksheet.getColumn(3).width = 30;
    worksheet.getColumn(4).width = 20;
    worksheet.getColumn(5).width = 40;
    worksheet.getColumn(6).width = 30;
    worksheet.getColumn(7).width = 30;
    worksheet.getColumn(8).width = 30;
    worksheet.getColumn(9).width = 20;
    worksheet.getColumn(10).width = 30;
    worksheet.getColumn(11).width = 30;
    worksheet.getColumn(12).width = 30;
    // worksheet.addRow([]);
    // Add Data and Conditional Formatting
    this.locations.forEach((item: any) => {
      const row = worksheet.addRow([
        item.LocationName == null ? 'N/A' : item.LocationName,
        item.ManufactureName,
        item.CreatedDt,
        item.ItemName,
        item.VendorItemName ? item.VendorItemName : 'N/A',
        item.CatalogNo == null ? 'N/A' : item.CatalogNo,
        item.PurchaseOrderNo,
        item.NetAmount,
        parseFloat(item.OrderedQty) || 0,
        item.OrderValue != null && !isNaN(item.OrderValue) ? parseFloat(item.OrderValue) : 'N/A',
        item.PackSize,
        item.AppprovedByName,
        item.CheckedByName
      ]);
    });
    let totalOrderValue = 0;
    this.locations.forEach((stock: any) => {
      if (stock.OrderValue != null) {
        totalOrderValue += parseFloat(stock.OrderValue);
      }
    });
    worksheet.addRow([]);
    worksheet.addRow(['','','','','','','',`Total : ${totalOrderValue}`]);
    // Create a file name for the downloaded file
    const fileName = 'Purchase-Item-Report-print.xlsx';
    // Generate Excel File with given name
    workbook.xlsx.writeBuffer().then((data: any) => {
      const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, fileName);
    });
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

  getPurchaseItems(type: any = null) {
    // this.globalService.startSpinner();
    this.shimmerVisible=true;
    if(this.locationGuid.length==0){
      this.locationGuid =this.authservice.LoggedInUser.DEFAULTROLES.toLowerCase().includes('ADMIN'.toLowerCase()) && this.authservice.LoggedInUser.LOCATIONSGUID=='00000000-0000-0000-0000-000000000000' ?'00000000-0000-0000-0000-000000000000': this.authservice.LoggedInUser.LOCATIONSGUID.split(",");
    }
    let Itm = {
      UserLocationGuid: this.locationGuid,
      FromDate: this.fromDate,
      ToDate: this.toDate
    }
    this.purcahseItemService.GetPurchaseItemReports(Itm).subscribe((data) => {  
      // this.globalService.stopSpinner();
      this.shimmerVisible=false;  
        this.locations = data;
        const sum = data.reduce((accumulator: any, object: { Rate: any; }) => {
          return accumulator + object.Rate;
        }, 0);
        this.TotalCount = sum; 
        const OrderValueSum = data.reduce((accumulator: number, object: { OrderValue: any; }) => {
          return accumulator + parseFloat(object.OrderValue);
        }, 0);
        this.TotalOrdervalue = parseFloat(OrderValueSum.toFixed(2));
        
        console.log(this.TotalOrdervalue,'rere')
        if(this.locations?.length == 0){
          this.noDataFound=true
        }else{
          type=='pdf'? this.downloadReport():type=='excel'? this.downloadExcel() : "";
          this.noDataFound=false
        }
      },err => {
        // this.globalService.stopSpinner();
        this.shimmerVisible=false;
      })
    }
 
  ChangeLocation(event: any) {
    this.locationGuid = []
    if (event != undefined) {
      if (event.CenterLocationGuid != undefined) {      
        this.locationGuid = event.CenterLocationGuid
      }
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
    this.noDataFound = false
  }

  selectToDate(event: any) {
    if(!this.selectfromDate) {
    this.isDisabled = true
    // this.noDataFound = true 
    } else{
      this.isDisabled = false
      this.noDataFound = false 
    }      
    this.toDate = event.year + "-" + event.month + "-" + event.day;    
  }

  clearData() {
    this.locations=null;
    this.isDisabled = true;
    this.noDataFound = false;
    this.toDate = '';
    this.fromDate = '';
    this.selectfromDate = '';
    this.locationGuid = [];
    this.CenterName.reset();
    this.LocationName.reset();
    this.ClearFromDate.reset();
    this.ClearToDate.reset();
    this.locationsList = this.defaultData.LstQuotationCenterLocationType;
    this.centerList = this.defaultData.LstQuotationStateDetailsType.filter((f: { CenterGuid: any; }) => this.locationsList.some((filter: { CenterGuid: any; }) => filter.CenterGuid === f.CenterGuid));
  }

}