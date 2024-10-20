import { formatDate } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {NgbCalendar, NgbDateParserFormatter, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { Workbook } from 'exceljs';
import { AllReportsService } from 'src/app/core/Services/all-reports.service';
import { AuthenticationService } from 'src/app/core/Services/authentication.service';
import * as html2pdf from 'html2pdf.js';
import { saveAs } from 'file-saver';
import { FormControl } from '@angular/forms';
import { QuotationService } from 'src/app/core/Services/quotation.service';
import { CustomDateParserFormatter } from 'src/app/core/Services/ngbdate-format.service';
import { IndentService } from 'src/app/core/Services/indent.service';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { ColumnMode } from '@swimlane/ngx-datatable';

@Component({
  selector: 'app-stock-in-hand-report',
  templateUrl: './stock-in-hand-report.component.html',
  styleUrls: ['./stock-in-hand-report.component.scss'],
  providers: [
    { provide: NgbDateParserFormatter, useClass: CustomDateParserFormatter },
  ],
})
export class StockInHandReportComponent implements OnInit {
  shimmerVisible: boolean
  CenterLocacityList: any;
  UnparsedHtml: any = '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Indent Report</title><style>table{border-collapse:collapse;border:1px solid #000}table td,table th{border-bottom:1px solid #000;border-right:1px solid #000;padding:5px;text-align:left;word-wrap:break-word;word-break:break-all;font-size:10px}table th{background-color:#ccc}.logo{height:28px;display:flex;align-items:center;justify-content:center;padding:20px 0}</style></head><body><table style="text-align:center;table-layout:fixed" width="100%"><tbody><tr><td><div class="logo"><img data-v-0e549244="" src="assets/images/YodaLIMSLogo.png" alt="Yoda LIMS"></div></td></tr></tbody></table><table style="text-align:center;table-layout:fixed" width="100%"><tbody><tr><td style="text-align:center;font-weight:700;font-size:16px">Stock In Hand Report</td></tr><tr><td style="text-align:center;font-weight:700;font-size:14px">As On :%%newDate%%</td></tr></tbody></table><table style="table-layout:fixed;margin-top:20px" width="100%"><thead><tr><th>Item Name</th><th>Manufacture Name</th><th>Department Name</th><th>PackSize</th><th>Machine Name</th><th>CatalogNo</th><th>Item Code</th><th>Category</th><th>InHand Quantity</th><th style="width:85px">InHand Quantity price (U)</th><th>Expiry Quantity</th><th style="width:80px">Expiry Quantity price (U)</th></thead><tbody><tr id="inhandreport"><td>%%ItemName%%</td><td>%%ManufactureName%%</td><td>%%DepartmentName%%</td><td>%%PackSize%%</td><td>%%MachineName%%</td><td>%%CatalogNo%%</td><td>%%ItemCode%%</td><td>%%CategoryTypeName%%</td><td>%%InHandQuantity%%</td><td>%%InHandQuantityPrice%%</td><td>%%ExpiryQuantity%%</td><td>%%ExpiryQuantityPrice%%</td></tr><tr></tr></tbody></table></body></html>';
  StockinHandReports:any=[]
  FromDate:string = '';
  ToDate:string = '';
  CenterGuid: any='';
  LocationGuid: any= '';
  LocationList: any;
  currentDate: string | null;
  newDate: string;
  isDisable: boolean = true;
  clearControl: FormControl = new FormControl(); 
  clearCenterControl: FormControl = new FormControl(); 
  clearItemControl: FormControl = new FormControl();
  clearfromdateControl: FormControl = new FormControl();
  dropdownSettings: IDropdownSettings = {};
  noDataFound: boolean;
  defaultData: any = [];
  minDate:NgbDateStruct;
  Allitems:[];
  loadingIndicator : boolean = true;
  ColumnMode = ColumnMode;
  ItemGuid:any=[];
  Location:string;
  constructor(private allreportservice:AllReportsService,
    private authservice: AuthenticationService,
    private quotationservice: QuotationService, private calendar: NgbCalendar, private indentService:IndentService ) { }

  ngOnInit(): void {
  this.GetStockinHandReportsLocation();
  const newDate1 = {day: new Date().getDate(),month: new Date().getMonth() + 1,year: new Date().getFullYear()};
  this.newDate = formatDate(new Date(newDate1.year, newDate1.month - 1, newDate1.day), 'dd-MM-yyyy', 'en'); 
  const today = this.calendar.getToday();
     this.minDate = {
       year: today.year, month: today.month, day: today.day
     };
     this.GetAllItems();
   this.dropdownSettings = {
      singleSelection: false,
      idField: 'ItemGuid',
      textField: 'ItemName',
      enableCheckAll: false,
      itemsShowLimit: 3,
      allowSearchFilter: true
    };
  }
  GetStockinHandReports(type:any){
    this.shimmerVisible=true;
    if(this.LocationGuid.length==0){
      this.LocationGuid =this.authservice.LoggedInUser.DEFAULTROLES.toLowerCase().includes('ADMIN'.toLowerCase()) && this.authservice.LoggedInUser.LOCATIONSGUID=='00000000-0000-0000-0000-000000000000' ?'00000000-0000-0000-0000-000000000000': this.authservice.LoggedInUser.LOCATIONSGUID.split(",");
    }
    this.allreportservice.GetStoreStockinHandReports(this.CenterGuid,this.LocationGuid,this.ItemGuid).subscribe(data => {
       this.StockinHandReports = data ||[];
       if (this.StockinHandReports?.length == 0) {
        this.noDataFound = true 
      } else {
         type == 'PDF' ? this.DownloadPdf() :type == 'XL'? this.downloadExcel():'';
        this.noDataFound = false
      }
      this.shimmerVisible=false;
    },error => {
      this.shimmerVisible=false;
    })
  }
  GetStockinHandReportsLocation() {
    this.shimmerVisible=true;
    let DepotmentGuid=this.authservice.LoggedInUser.DEFAULTROLES.toLowerCase().includes('ADMIN'.toLowerCase()) && this.authservice.LoggedInUser.LOCATIONSGUID=='00000000-0000-0000-0000-000000000000' ? '00000000-0000-0000-0000-000000000000' : this.authservice.LoggedInUser.LOCATIONSGUID.split(",")
    this.quotationservice.getQuotationPostDefaults(DepotmentGuid).subscribe((data: any) => {
      this.defaultData=data.Result
      this.LocationList = data.Result.LstQuotationCenterLocationType; 
      this.CenterLocacityList = data.Result.LstQuotationStateDetailsType.filter((f: { CenterGuid: any; }) => this.LocationList.some((filter: { CenterGuid: any; }) => filter.CenterGuid === f.CenterGuid));
      this.shimmerVisible=false;
    }, error => {
    this.shimmerVisible=false;
  })
}
  /**
   * this service method used to get all items
   */
  GetAllItems() {
    this.shimmerVisible = true;
    this.indentService.Getindentitems(false).subscribe(data => {
       const Itemsdata = data.oGetIndentitems;
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
   * this change event used to change the location and item details
   * @param event 
   */
  ChangeLocation(event: any) {
    this.LocationGuid = event.CenterLocationGuid;
    this.Location=event.location;
    this.isDisable = false
    //this.GetconsumeReports();
	
  }
  filterData(event: any) {
    if (event != undefined) {
      if (event.CenterLocationGuid != undefined) {
        this.noDataFound = false
        this.Location="";
        this.LocationGuid = event.CenterLocationGuid;
        this.Location = event.CenterLocationName;
      }
      this.LocationList = this.defaultData.LstQuotationCenterLocationType.filter((f: { CenterGuid: any; }) => f.CenterGuid == event.CenterGuid);
      this.CenterLocacityList = this.defaultData.LstQuotationStateDetailsType.filter((f: { CenterGuid: any; }) => f.CenterGuid == event.CenterGuid);
    }
      else {
        this.LocationGuid="";
        this.Location="";
        this.clearControl.reset();
        this.clearCenterControl.reset();
        this.clearItemControl.reset();
        this.noDataFound = false
        this.LocationList = this.defaultData.LstQuotationCenterLocationType
        this.CenterLocacityList = this.defaultData.LstQuotationStateDetailsType.filter((f: { CenterGuid: any; }) => this.LocationList.some((filter: { CenterGuid: any; }) => filter.CenterGuid === f.CenterGuid));
      }
  }
  DownloadPdf() {
    let html = "";
    html = this.UnparsedHtml;
    const replacements: any = {
      '%%Date%%': this.currentDate || '',
      '%%TotalAmount%%': this.StockinHandReports[0].TotalAmount || 0,
      '%%newDate%%':  this.newDate || '',
    };
    for (const key in replacements) {
      html = html.replace(key, replacements[key]);
    }
    if (this.StockinHandReports.length > 0) {
      let dochtml: any = '';
      dochtml = new DOMParser().parseFromString(html, 'text/html');
      let StockinHandReports: any = dochtml.querySelector('#inhandreport');

      if (StockinHandReports) {
        StockinHandReports.innerHTML = '';
        let totalAmount = 0; 
        for (let i = 0; i < this.StockinHandReports.length; i++) {
          let updatedTemplate: any = '';
          if (this.StockinHandReports[i].InHandQuantity >= 0) {
            let updatedTemplate: any = '';
          updatedTemplate = this.UnparsedHtml
          .replace('%%ItemName%%', this.StockinHandReports[i].ItemName)
          .replace('%%ManufactureName%%', this.StockinHandReports[i].ManufactureName)
          .replace('%%DepartmentName%%', this.StockinHandReports[i].DepartmentName)
          .replace('%%PackSize%%', this.StockinHandReports[i].PackSize)
          .replace('%%MachineName%%', this.StockinHandReports[i].MachineName)
          .replace('%%CatalogNo%%', this.StockinHandReports[i].CatalogNo)
          .replace('%%ItemCode%%', this.StockinHandReports[i].ApolloItemCode)
          .replace('%%CategoryTypeName%%', this.StockinHandReports[i].CategoryTypeName)
          .replace('%%InHandQuantity%%', this.StockinHandReports[i].InHandQuantity==null?0:this.StockinHandReports[i].InHandQuantity)
          .replace('%%ExpiryQuantity%%', this.StockinHandReports[i].ExpiryQuantity==null?0:this.StockinHandReports[i].ExpiryQuantity)
          .replace('%%InHandQuantityPrice%%', this.StockinHandReports[i].InHandQuantity==null?0:this.StockinHandReports[i].InHandQuantityPrice)
          .replace('%%ExpiryQuantityPrice%%', this.StockinHandReports[i].ExpiryQuantity==null?0:this.StockinHandReports[i].ExpiryQuantityPrice)
          let jobElement: any = '';
          jobElement = new DOMParser().parseFromString(updatedTemplate, 'text/html').querySelector('#inhandreport');
          StockinHandReports.appendChild(jobElement);
          totalAmount += parseFloat(this.StockinHandReports[i].ItemAmount); 
          }
        }
      }
     html = dochtml.documentElement.outerHTML;

    }
    const options = {
      filename: `stockinhand-report.pdf`,
      margin: 0.1,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 1 },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'landscape' }
    };
    const element = html;
    html2pdf().from(element).set(options).save();
  }
  downloadExcel() {
    const header = ['Item Name','Manufacture Name', 'Department Name', 'PackSize','Machine Name', 'CatalogNo','ItemCode','Category','In Hand Quantity','In Hand Quantity price (U)','Expiry Quantity','Expiry Quantity price (U)'];
    // Create workbook and worksheet
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('Sharing Data');
    const headline1Content = 'Date: ' + this.newDate;
    const headline2Content= this.Location?'Location: ' + this.Location:'';
    worksheet.addRow([null,null,null,null,"Stock In Hand Report"])
    worksheet.addRow([null,null,null,null,headline1Content])
    worksheet.addRow([null,null,null,null,headline2Content])
    const cell1 = worksheet.getCell('E1');
    const cell2 = worksheet.getCell('E2');
    const cell3 = worksheet.getCell('E3');
    cell1.alignment = {
      horizontal: 'center'
    };
      cell1.font = {
        bold: true,
        size: 20
      };
      cell2.font = {
        bold: true,
        size: 20
      };
      cell3.font = {
        bold: true,
        size: 15
      };
    worksheet.addRow([])
    const headerRow = worksheet.addRow(header);
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
    worksheet.getColumn(2).width = 20;
    worksheet.getColumn(3).width = 20;
    worksheet.getColumn(4).width = 20;
    worksheet.getColumn(5).width = 30;
    worksheet.getColumn(6).width = 30;
    worksheet.getColumn(6).width = 20;
    worksheet.getColumn(7).width = 20;
    worksheet.getColumn(8).width = 20;
    worksheet.getColumn(9).width = 15;
    worksheet.getColumn(10).width = 20;
    worksheet.getColumn(11).width = 25;
    worksheet.getColumn(12).width = 25;
    worksheet.getColumn(13).width = 25;
    this.StockinHandReports.forEach((item: any) => {
      const row = worksheet.addRow([
        item.ItemName,
        item.ManufactureName,
        item.DepartmentName,
        item.PackSize,
        item.MachineName,
        item.CatalogNo,
        item.ApolloItemCode,
        item.CategoryTypeName,
        item.InHandQuantity==null?0:item.InHandQuantity,
        item.InHandQuantity==null?0:item.InHandQuantityPrice,
        item.ExpiryQuantity==null?0:item.ExpiryQuantity,
        item.ExpiryQuantity==null?0:item.ExpiryQuantityPrice,
      ]);
    
  });
    const fileName = 'Stock InHand Reports-print.xlsx';
    workbook.xlsx.writeBuffer().then((data: any) => {
      const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, fileName);
    });
  }
  Onremove() {
    // this.LocationGuid = []
  }
   /**
   * this event used to select the item
   * @param event 
   */
   selectItem(event:any){
    if(event==undefined){
      this.ItemGuid=[];
    }
   else{
    this.ItemGuid.push(event.ItemGuid);
   }
  }
  DeselectItem(event: any) {
    if (event === undefined) {
        this.ItemGuid = [];
    } else {
        this.ItemGuid = this.ItemGuid.filter((item: any) => item !== event.ItemGuid);
    }
  }
}
