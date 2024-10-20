import { Component, OnInit } from '@angular/core';
import { AllReportsService } from 'src/app/core/Services/all-reports.service';
import { DatePipe } from '@angular/common';
import { Workbook } from 'exceljs';
import * as saveAs from 'file-saver';
import { QuotationService } from 'src/app/core/Services/quotation.service';
import { AuthenticationService } from 'src/app/core/Services/authentication.service';
import { FormControl } from '@angular/forms';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import { ColumnMode } from '@swimlane/ngx-datatable';


@Component({
  selector: 'app-low-stock-report',
  templateUrl: './low-stock-report.component.html',
  styleUrls: ['./low-stock-report.component.scss']
})
export class LowStockReportComponent implements OnInit {
  shimmerVisible:boolean;
  UnparsedHtml: any = '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Low Stock Report</title><style>table{border-collapse:collapse;border:1px solid #000}table td,table th{border-bottom:1px solid #000;border-right:1px solid #000;padding:5px;text-align:left;word-wrap:break-word;word-break:break-all;font-size:10px}table th{background-color:#ccc}.logo{height:28px;display:flex;align-items:center;justify-content:center;padding:20px 0}</style></head><body><table style="text-align:center;table-layout:fixed" width="100%"><tbody><tr><td><span class="logo"><img data-v-0e549244="" src="assets/images/YodaLIMSLogo.png" alt="Yoda LIMS"></span></td></tr></tbody></table><table style="text-align:center;table-layout:fixed" width="100%"><tbody><tr><td style="text-align:center;font-weight:700;font-size:16px">Low Stock Report</td></tr><tr><td style="text-align:center;font-weight:700;font-size:14px">As on : %%Date%%</td></tr></tbody></table><table style="table-layout:fixed;margin-top:20px" width="100%"><thead><tr><th>Item Name</th><th>Category</th><th>Sub-Category</th><th>Machine</th><th>Barcode</th><th>Low stock count</th><th>Remaining Qty</th></tr></thead><tbody><tr id="lowstockreport"><td>%%ItemName%%</td><td>%%Category%%</td><td>%%SubCategory%%</td><td>%%Machine%%</td><td>%%Barcode%%</td><td>%%Lowstockcount%%</td><td>%%RemainingQty%%</td></tr></tbody></table></body></html>';
  lowStockReports: any = [];
  currentDate: string | null;
  loadingIndicator: boolean = true;
  ColumnMode = ColumnMode;
  LocationGuid: any = null;
  defaultData: any = [];
  locationsList: any = [];
  centerList: any = [];
  isDisable: boolean = true;
  noDataFound: boolean = false;
  clearControl: FormControl = new FormControl();
  totalPageNumbers : any;
  CenterclearControl: FormControl = new FormControl();
  constructor(private allReportservice: AllReportsService, 
    private datePipe: DatePipe,
     private quotationservice: QuotationService, 
     private authservice: AuthenticationService) {
    const formatDate = new Date();
    this.currentDate = this.datePipe.transform(formatDate, 'dd-MM-yyyy');
  }

  ngOnInit(): void {
    this.getDefualtData()
  }


  getLowStockReport(TypeName:any = null) {
    this.shimmerVisible=true
    this.allReportservice.getLowStockReports(this.LocationGuid).subscribe(data => {
      this.lowStockReports = data.Result 
      this.shimmerVisible = false;
      if (this.lowStockReports?.length == 0) {
        this.noDataFound = true
      } else {
        TypeName == 'pdf' ? this.downloadReport() : TypeName == 'excel' ?  this.downloadExcel() : "";
        this.noDataFound = false
      }
    }, error => {
      this.shimmerVisible = false;
    })
  }

  getDefualtData() {
    // this.globalService.startSpinner()
    this.shimmerVisible=true;
    this.LocationGuid = this.authservice.LoggedInUser.DEFAULTROLES.toLowerCase().includes('ADMIN'.toLowerCase()) && this.authservice.LoggedInUser.LOCATIONSGUID == '00000000-0000-0000-0000-000000000000' ? '00000000-0000-0000-0000-000000000000' : this.authservice.LoggedInUser.LOCATIONSGUID.split(",");
    this.quotationservice.getQuotationPostDefaults(this.LocationGuid).subscribe(({ Result }) => {
      this.defaultData = Result;
      // this.globalService.stopSpinner()
      this.shimmerVisible=false;
      this.locationsList = Result.LstQuotationCenterLocationType;
      this.centerList = Result.LstQuotationStateDetailsType.filter((f: { CenterGuid: any; }) => this.locationsList.some((filter: { CenterGuid: any; }) => filter.CenterGuid === f.CenterGuid));
      // this.globalService.stopSpinner()
      this.shimmerVisible=false;
    })
  }
  onCenterChange(event: any) {
    this.filterData(event);
    this.clearControl.reset(); 
}

  filterData(event: any) {
    this.LocationGuid = []
    if (event != undefined) {
      if (event.CenterLocationGuid != undefined) {
        this.isDisable = false
        this.noDataFound = false
        this.LocationGuid = event.CenterLocationGuid
      }
      //this.centerList = this.defaultData.LstQuotationStateDetailsType.filter((f: { CenterGuid: any; }) => f.CenterGuid == event.CenterGuid);
      this.locationsList = this.defaultData.LstQuotationCenterLocationType.filter((f: { CenterGuid: any; }) => f.CenterGuid == event.CenterGuid);
    } else {
      this.LocationGuid = ""
      this.clearControl.reset();
      this.CenterclearControl.reset();
      this.isDisable = true
      this.noDataFound = false
      this.locationsList = this.defaultData.LstQuotationCenterLocationType
      this.centerList = this.defaultData.LstQuotationStateDetailsType.filter((f: { CenterGuid: any; }) => this.locationsList.some((filter: { CenterGuid: any; }) => filter.CenterGuid === f.CenterGuid));
    }
  }
  downloadExcel() {
    const header = ['ItemName','Item Code','UOM','Category', 'Sub-Category', 'Machine', 'Barcode','Stock Limit','On Hand'];
    // Create workbook and worksheet
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('Sharing Data');
    worksheet.addRow([null,null,null,null,"Low Stock Report"])
    const cell1 = worksheet.getCell('E1');
    cell1.alignment = {
      horizontal: 'center'
    };
      cell1.font = {
        bold: true,
        size: 20
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
    worksheet.getColumn(1).width = 50;
    worksheet.getColumn(2).width = 15;
    worksheet.getColumn(3).width = 30;
    worksheet.getColumn(4).width = 30;
    worksheet.getColumn(5).width = 30;
    worksheet.getColumn(6).width = 20;
    worksheet.getColumn(7).width = 20;
    worksheet.getColumn(8).width = 20;
    worksheet.getColumn(9).width = 20;
    // worksheet.addRow([]);
    this.lowStockReports.forEach((item: any) => {
      const row = worksheet.addRow([
        item.ItemName,
        item.ApolloItemCode,
        item.MajorUnitName,
        item.CategoryTypeName,
        item.SubCategoryTypeName,
        item.Machine,
        item.BarcodeNo ?item?.Barcode : 'N/A',
        item.LowStockCount,
        parseFloat(item.SumofRemainingQuantity).toFixed(2) 
      ]);
    });
    const fileName = 'LowStockReport-print.xlsx';
    workbook.xlsx.writeBuffer().then((data: any) => {
      const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, fileName);
    });
  }
  // DownloadPdf() {
  //   let html = "";
  //   html = this.UnparsedHtml;
  //   const replacements: any = {
  //     '%%Date%%': this.currentDate || '',
  //   };
  //   for (const key in replacements) {
  //     html = html.replace(key, replacements[key]);
  //   }
  //   if (this.lowStockReports.length > 0) {
  //     let dochtml: any = '';
  //     dochtml = new DOMParser().parseFromString(html, 'text/html');
  //     let lowstockreport: any = dochtml.querySelector('#lowstockreport');

  //     if (lowstockreport) {
  //       lowstockreport.innerHTML = '';
  //       for (let i = 0; i < this.lowStockReports.length; i++) {
  //         let updatedTemplate: any = '';
  //         updatedTemplate = this.UnparsedHtml
  //           .replace('%%ItemName%%', this.lowStockReports[i].ItemName)
  //           .replace('%%Category%%', this.lowStockReports[i].CategoryTypeName)
  //           .replace('%%SubCategory%%', this.lowStockReports[i].SubCategoryTypeName)
  //           .replace('%%Machine%%', this.lowStockReports[i].Machine)
  //           .replace('%%Barcode%%', this.lowStockReports[i].BarcodeNo)
  //           .replace('%%Lowstockcount%%', this.lowStockReports[i].LowStockCount)
  //           .replace('%%RemainingQty%%', this.lowStockReports[i].SumofRemainingQuantity)
  //         let jobElement: any = '';
  //         jobElement = new DOMParser().parseFromString(updatedTemplate, 'text/html').querySelector('#lowstockreport');
  //         lowstockreport.appendChild(jobElement);
  //       }
  //     }
  //     html = dochtml.documentElement.outerHTML;

  //   }
  //   const options = {
  //     filename: `low stock-report.pdf`,
  //     margin: 0.2,
  //     image: { type: 'jpeg', quality: 0.98 },
  //     html2canvas: { scale: 1 },
  //     jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
  //   };
  //   const element = html;
  //   html2pdf().from(element).set(options).save();


  // }
  async downloadReport(){
    await  this.DownloadPdf();
    this.DownloadPdfNew();
}
PrepareData():any[]{
  interface Stock {
    CategoryTypeName: string;
    ItemName: string;
    ApolloItemCode:string;
    MajorUnitName:string;
    SubCategoryTypeName: any;
    Machine: any;
    LowStockCount: any;
    SumofRemainingQuantity: any;
    ChekedDate: any;
    ToLocation: any;
  }
 return this.lowStockReports.map((stock: Stock, index: number) => [ 
    { content: index + 1, styles: { minCellWidth: 10 } },
    { content: stock.ItemName==null?"N/A":stock.ItemName, styles: { minCellWidth: 23 } },
    { content: stock.ApolloItemCode==null?"N/A":stock.ApolloItemCode, styles: { minCellWidth: 20 } },
    { content: stock.MajorUnitName==null?"N/A":stock.MajorUnitName, styles: { minCellWidth: 23 } },
    { content: stock.CategoryTypeName, styles: { minCellWidth: 10 } }, 
    { content: stock.SubCategoryTypeName, styles: { minCellWidth: 20 } },
    { content: stock.Machine==null?'N/A':stock.Machine, styles: { minCellWidth: 10 } },
    { content: stock.LowStockCount==null?"N/A":stock.LowStockCount, styles: { minCellWidth: 23 } },
    { content: stock.SumofRemainingQuantity == '' ?"N/A": stock.SumofRemainingQuantity.replace(/\.?0+$/, ''), styles: { minCellWidth: 20 } }, 
  ]);
}
  DownloadPdf() {
    const doc = new jsPDF({ orientation: 'landscape' });
    const imageHeight = 15;
    const cursorY = imageHeight + 30;
    const tableWidth = 290
    let currentPageNumber = 0;
    autoTable(doc, {
      head: [this.createHeaderCols()],
      body: this.PrepareData(),
      startY: cursorY,
      tableWidth: tableWidth,
      margin: { left: 3 },
      didDrawPage: (data) => {
        currentPageNumber++; 
        this.totalPageNumbers =currentPageNumber
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
      const headline1Content = 'Low Stock Report Summary';
      const headline1XPos = 110;
      const headline1YPos = imageYPos + imageHeight + 10-data;
      const headline1FontSize = 10;
      doc
        .text(headline1Content, headline1XPos, headline1YPos)
        .setFontSize(headline1FontSize);
    }
    const createSubTitle = (data:any) =>{
      const headline2Content = 'As On: ' + this.currentDate;
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
    doc.save('low-stock-report.pdf');
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
      { content: 'Item Code', styles: { ...headerColStyles } },
      { content: 'UOM', styles: { ...headerColStyles } },
      { content: 'Category', styles: { ...headerColStyles } },
      { content: 'Sub-Category', styles: { ...headerColStyles } },
      { content: 'Machine', styles: { ...headerColStyles } },
      // { content: 'Barcode', styles: { ...headerColStyles } },
      { content: 'Stock Limit', styles: { ...headerColStyles } },
      { content: 'On Hand', styles: { ...headerColStyles } },
    ];
  }
}
