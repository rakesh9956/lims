import { ChangeDetectorRef, Component, Injectable, TemplateRef, ViewChild } from '@angular/core';
//import { Component, Injectable, ViewChild } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { NgbDateParserFormatter, NgbDateStruct, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ColumnMode, DatatableComponent } from '@swimlane/ngx-datatable';
import * as html2pdf from 'html2pdf.js';
import { Subject, debounceTime } from 'rxjs';
import { AuthenticationService } from 'src/app/core/Services/authentication.service';
import { GlobalService } from 'src/app/core/Services/global.service';
import { IndentService } from 'src/app/core/Services/indent.service';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { UserPermissionLocationsService } from 'src/app/core/Services/user-permission-locations.service';
import * as XLSX from 'xlsx';
import * as moment from 'moment';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
@Injectable()
export class CustomDateParserFormatter extends NgbDateParserFormatter {
  readonly DELIMITER = '-';
  parse(value: string): NgbDateStruct | null {
    if (value) {
      const date = value.split(this.DELIMITER);
      return {
        day: parseInt(date[0], 10),
        month: parseInt(date[1], 10),
        year: parseInt(date[2], 10),
      };
    }
    return null;
  }
  format(date: NgbDateStruct | null): string {
    if (date) {
      const day = date.day < 10 ? '0' + date.day : date.day;
      const month = date.month < 10 ? '0' + date.month : date.month;
      const year = date.year;
      return day + this.DELIMITER + month + this.DELIMITER + year;
    }
    return '';
  }
}


@Component({
  selector: 'app-all-requests',
  templateUrl: './all-requests.component.html',
  styleUrls: ['./all-requests.component.scss'],
  providers: [
    { provide: NgbDateParserFormatter, useClass: CustomDateParserFormatter },
  ],
})
export class AllRequestsComponent {


  @ViewChild(DatatableComponent) table: DatatableComponent;
  /*** Paginatin Option Starts ***/
  maxSize: number = 3;
  boundaryLinks: boolean = true;
  size: string = 'lg';
  /*** Paginatin Option Starts ***/
  shimmerVisible:boolean;
  UnparsedHtml: any = '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta name="viewport" content="width=device-width,initial-scale=1"><title>%%IndentType%%</title><style>table{border-collapse:collapse;border:1px solid #000}table td,table th{border-bottom:1px solid #000;border-right:1px solid #000;padding:5px;text-align:left;word-wrap:break-word;word-break:break-all;font-size:10px}table th{background-color:#ccc}</style></head><body><table style="text-align:left;table-layout:fixed" width="100%"><tbody><tr><td><div style="height:28px;display:flex;align-items:center;padding:20px 0"><img data-v-0e549244="" src="assets/images/YodaLIMSLogo.png" alt="Yoda LIMS"></div></td></tr></tbody></table><table style="text-align:center;table-layout:fixed" width="100%"><tbody><tr><td style="text-align:center;font-weight:700;font-size:16px">%%IndenTypeHeader%%</td></tr></tbody></table><table style="table-layout:fixed" width="100%"><tbody><tr><td style="font-size:14px"><b>Indent No:</b>%%IndentNo%%</td><td style="font-size:14px"><b>Indent date:</b>%%IndentDate%%</td></tr></tbody></table><table style="table-layout:fixed" width="100%"><tbody><tr><td style="font-size:14px"><b>Name & Address of sender:</b>%%IndentFromLocation%%</td></tr><tr><td style="font-size:14px"><b>Name & Address of recipient:</b>%%IndentToLocation%%</td></tr><tr><td style="font-size:14px"><b>GSTIN recipient:</b>%%VendorStateGSTNNo%%</td></tr></tbody></table><table style="table-layout:fixed;margin-top:20px" width="100%"><thead><tr><th width="27">S. No.</th><th width="130">Item</th><th>Item Unit</th><th>HSN code</th><th>Catalog No.</th><th>Order qty</th><th>Manufacturer name</th></tr></thead><tbody><tr id="indents"><td>%%S.No%%</td><td>%%ItemName%%</td><td>%%MajorUnitName%%</td><td>%%HsnCode%%</td><td>%%CatalogNo%%</td><td>%%ReqQty%%</td><td>%%Manufacturername%%</td></tr></tbody></table><table style="table-layout:fixed;margin-top:50px" width="100%"><tbody><tr><td>Created by:%%CreatedBy%%</td><td>Checked by: %%CheckedBy%%</td><td>Approved by: %%ApprovedUserName%%</td></tr></tbody></table><table style="table-layout:fixed;border:none;margin-top:50px" width="100%"><tbody><tr><td style="font-size:14px;border:none;padding:0;text-align:right"><b>Date:</b>%%IndentDownloadDate%%</td></tr><tr><td style="font-size:14px;border:none;padding:0;text-align:right">This is a computer generated document, hence signature is not required.</td></tr></tbody></table></body></html>'
  SIUnparsedHtml:any='<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta name="viewport" content="width=device-width,initial-scale=1"><title>%%IndentType%%</title><style>table{border-collapse:collapse;border:1px solid #000}table td,table th{border-bottom:1px solid #000;border-right:1px solid #000;padding:5px;text-align:left;word-wrap:break-word;word-break:break-all;font-size:10px}table th{background-color:#ccc}</style></head><body><table style="text-align:left;table-layout:fixed" width="100%"><tbody><tr><td><div style="height:28px;display:flex;align-items:center;padding:20px 0"><img data-v-0e549244="" src="assets/images/YodaLIMSLogo.png" alt="Yoda LIMS"></div></td></tr></tbody></table><table style="text-align:center;table-layout:fixed" width="100%"><tbody><tr><td style="text-align:center;font-weight:700;font-size:16px">%%IndenTypeHeader%%</td></tr></tbody></table><table style="table-layout:fixed" width="100%"><tbody><tr><td style="font-size:14px"><b>Indent No:</b>%%IndentNo%%</td><td style="font-size:14px"><b>Indent date:</b>%%IndentDate%%</td></tr></tbody></table><table style="table-layout:fixed" width="100%"><tbody><tr><td style="font-size:14px"><b>Name & Address of sender:</b>%%IndentFromLocation%%</td></tr><tr><td style="font-size:14px"><b>Name & Address of recipient:</b>%%IndentToLocation%%</td></tr></tbody></table><table style="table-layout:fixed;margin-top:20px" width="100%"><thead><tr><th width="27">S. No.</th><th>Item</th><th>Item Unit</th><th>Catalog No.</th><th>Order qty</th><th>Manufacturer name</th></tr></thead><tbody><tr id="indents"><td>%%S.No%%</td><td>%%ItemName%%</td><td>%%MajorUnitName%%</td><td>%%CatalogNo%%</td><td>%%ReqQty%%</td><td>%%Manufacturername%%</td></tr></tbody></table><table style="table-layout:fixed;margin-top:50px" width="100%"><tbody><tr><td>Created by:%%CreatedBy%%</td><td>Checked by: %%CheckedBy%%</td><td>Approved by: %%ApprovedUserName%%</td></tr></tbody></table><table style="table-layout:fixed;border:none;margin-top:50px" width="100%"><tbody><tr><td style="font-size:14px;border:none;padding:0;text-align:right"><b>Date:</b>%%IndentDownloadDate%%</td></tr><tr><td style="font-size:14px;border:none;padding:0;text-align:right">This is a computer generated document, hence signature is not required.</td></tr></tbody></table></body></html>'
  rows: any[] = [];
  temp: any[] = [];
  loadingIndicator = true;
  reorderable = true;
  ColumnMode = ColumnMode;
  Keyword: string = '';
  itemOrder: any;
  sort: string = 'desc';
  pageNumber: any = 1;
  itemOptionsPerPage = [40, 80, 120, 160, 200, 240, 280, 320];
  itemsPerPage = 40;
  ItemSelect: any;
  rowCount: any = 40;
  AllIntedentDetails: any;
  TotalCount: any;
  IndentItemDetails: any;
  displayOptionsCollapsed: boolean = true;
  pages: number;
  pageSize: any = 40;
  item: any = [];
  sortclickcount: number = 0;
  IndentOrder = ['IndentFromLocation', 'IndentToLocation'];
  modelChanged = new Subject<string>();
  indentguid: any;
  FromRights: any;
  userGuid: any;
  itemOptionsOrders1: any = [] =
    [{ status: "Created", value: 0, isChecked: false }, { status: "Checked", value: 0, isChecked: false }, { status: "Approved", value: 0, isChecked: false }];
  itemOrder1: string = "None";
  created: boolean;
  checked: boolean;
  approved: boolean;
  isMenuCollapsed = true;
  roles: any;
  IndentLocation: any;
  IndentGuid: any;
  formattedDate:any
  siRole: any;
  IndentType:any
  IndentTypeForview:boolean;
  Approvalroles: any;
  IndentNo: any;
  b2bItems: any=[];
  Status:any;
  InHandQty: any;
  IndentData:any;
  reason:string='';
  isdisable: any;
  AproveItems: any=[];
  indentrowdata:any=[];
  uploadExcel: boolean = true;
  QuotationXL:boolean=false;
  XLdata:any
  ItemStatus: any;
  IndentReasonDetails : any
  isSaveb2b:boolean=false;
  constructor(private modalService: NgbModal, public authservice: AuthenticationService,
    private indentService: IndentService,private router: Router,
    private datepipe:DatePipe,
    private UserPermissionService: UserPermissionLocationsService) {
    this.fetch((data: any) => {
      this.temp = data;
      this.rows = data;
      // setTimeout(() => {
      //   this.loadingIndicator = false;
      // }, 1500);
    });
    this.modelChanged
      .pipe(debounceTime(1000))
      .subscribe(model => {
        this.Keyword = model;
        this.GetAllIndents();
      });
      this.UserPermissionService.reloadEvent.subscribe(() => {
        this.ngOnInit()
  
      });
  }

  ngOnInit(): void {
    let type = localStorage.getItem("Type");
    if(type == "Indents"){
      let pageNum = localStorage.getItem("pageNumber");
      this.pageNumber = pageNum||1;
      // if(this.pageNumber=null){
      //   this.pageNumber=1
      // }
      let PageCount = localStorage.getItem("PerPage");
      this.itemsPerPage =PageCount ? parseInt(PageCount): 40 ;
      this.rowCount =PageCount ? parseInt(PageCount): 40 ;
      localStorage.removeItem("Type");
      localStorage.removeItem("pageNumber");
      localStorage.removeItem("PerPage");
    }
    const currentDate = new Date();
    this.formattedDate = this.datepipe.transform(currentDate, 'dd-MMM-yyyy hh:mm a');
    if (window.outerWidth < 480) {
      this.maxSize = 2;
      this.boundaryLinks = false;
      this.size = 'sm';
    }
    this.userGuid = localStorage.getItem('UserGuid');
    this.roles=this.authservice.LoggedInUser.PIROLES
    let lstOfRoles = this.authservice.LoggedInUser.PIROLES.split(',')
   this.Approvalroles= lstOfRoles.filter((roles:any)=>roles=='Approval')
    this.siRole =this.authservice.LoggedInUser.SIROLES
    this.GetAllIndents()
  }

  fetch(cb: any) {
    const req = new XMLHttpRequest();
    req.open('GET', `assets/data/all-requests.json`);

    req.onload = () => {
      cb(JSON.parse(req.response));
    };

    req.send();
  }

  updateFilter(event: any) {
    const val = event.target.value.toLowerCase();
    // filter our data
    const temp = this.temp.filter(function (d) {
      return d.itemName.toLowerCase().indexOf(val) !== -1 || !val;
    });
    // update the rows
    this.rows = temp;
    // Whenever the filter changes, always go back to the first page
    this.table.offset = 0;
  }
  openBasicModal(content: TemplateRef<any>) {
    this.modalService.open(content, { backdrop: 'static', keyboard: false,size: 'md' }).result.then((result: string) => {
      console.log("Modal closed" + result);
    }).catch((res: any) => { });
  }
  openXlModal(content: TemplateRef<any>, size:any) {
    this.modalService.open(content, {backdrop: 'static', keyboard: false, size: size }).result.then((result) => {
      console.log("Modal closed" + result);
    }).catch((res) => { });
  }
  ChangeEvent(rowNo: any) {
    this.itemsPerPage = rowNo.target.value;
    localStorage.setItem("PerPage" , rowNo.target.value);
    this.rowCount = rowNo.target.value;
    this.pageNumber = 1;
    this.GetAllIndents();
  }
  GetAllIndents() {
    let DepotmentGuid =this.authservice.LoggedInUser.DEFAULTROLES.toLowerCase().includes('ADMIN'.toLowerCase()) && this.authservice.LoggedInUser.LOCATIONSGUID=='00000000-0000-0000-0000-000000000000' ?'00000000-0000-0000-0000-000000000000': this.authservice.LoggedInUser.LOCATIONSGUID.split(",")
    let IsStore=this.authservice.LoggedInUser.STORE
    // this.globalService.startSpinner();
    if(this.authservice.LoggedInUser.B2BTYPE=='true'||this.authservice.LoggedInUser.B2BTYPE==true){
      this.IndentType='B2BSI'
    }
    this.shimmerVisible = true;
    this.indentService.GetAllIndentDetails(this.pageNumber, this.rowCount, this.Keyword, this.itemOrder, this.sort,DepotmentGuid,this.IndentType,IsStore).subscribe(
      (GetAllIndentDetails) => {
        this.AllIntedentDetails = GetAllIndentDetails.getAllIndents
        this.TotalCount = GetAllIndentDetails.TotalCount
        // this.globalService.stopSpinner();
        this.shimmerVisible = false;
      },
      (err) => {
        // this.globalService.stopSpinner();
        this.shimmerVisible = false;
      });
  }
  /**
   * this service method used  to get indent items details
   * @param IndentData 
   */
  GetIndentItemDeatilsByGuid(IndentData: any) {
    this.isSaveb2b=false;
    // this.globalService.startSpinner();
    this.indentrowdata=IndentData;
    this.IndentNo=this.indentrowdata.IndentNo
    this.ItemStatus=this.indentrowdata.FromRights
    this.shimmerVisible = true;
    this.indentService.GetIndentItemDeatilsByGuid(IndentData.IndentGuid,IndentData.IndentType).subscribe(
      (IndentDetails) => {
        this.IndentItemDetails = IndentDetails.Result.getIndentItems;
        this.IndentReasonDetails=this.IndentItemDetails[0]
        this.IndentTypeForview=this.IndentItemDetails[0].IndentType=='SI'?false:true;
        this.InHandQty = this.IndentItemDetails.reduce((accumulator: any, currentValue: { NewQty: any; }) => {const decimalReqQty = parseFloat(currentValue.NewQty==null?0:currentValue.NewQty);return accumulator + decimalReqQty; }, 0);
        // this.globalService.stopSpinner();
        this.shimmerVisible = false;
        this.AproveItems= this.IndentItemDetails.map((obj: { IndentGuid: any,ReqQty:any,NewQty:any}) => ({
          IndentGuid:obj.IndentGuid,
          RquestQty:obj.ReqQty,
          AprovedQty:IndentData.IndentType=='B2BSI'?obj.ReqQty>obj.NewQty?obj.NewQty:obj.ReqQty:obj.ReqQty || 0,
          Remarks:''
         }))
        if(IndentData.IndentType=='B2BSI' && (this.FromRights=='Approved'||IndentData.FromRights=="Checked")){
        this.SetB2BItems();
        //this.IndentStatus();
        }
        else if(this.FromRights=='Checked' || this.FromRights=='Approved'){
          this.IndentStatus();
        }
      },
      (err) => {
        // this.globalService.stopSpinner();
        this.shimmerVisible = false;
      })
  }
  /** Total Number Of Pages*/
  TotalNumberOfPages(pageSize: number) {
    this.pages = this.TotalCount / this.pageSize
    if (this.TotalCount / pageSize != 0) {
      this.pages = this.pages + 1;
    }
    this.item = [];
    for (var i = 1; i <= this.pages; i++) {
      this.item == i;
      this.item.push(i);
    }
    // this.globalService.stopSpinner();
  }
  /** Get All Data*/
  GetAllData(event: any) {
    localStorage.setItem("pageNumber" , event);
    this.pageNumber = event;
    this.GetAllIndents();
  }
  changeSearch(Keyword: any) {
    this.pageNumber = 1;
    localStorage.setItem("pageNumber" , "1");
    this.rowCount = 40;
    this.modelChanged.next(Keyword);
  }
  /**
 * this method is used to change the order by
 * @param managejob t
 */
  ChangeManageuser($event: any) {
    // if (this.itemOrder == managejob) {
    //   if (this.sortclickcount % 2 == 0) {
    //     this.sort = 'asc'
    //     this.sortclickcount = this.sortclickcount + 1
    //   }
    //   else {
    //     this.sort = 'desc';
    //     this.sortclickcount = this.sortclickcount + 1;
    //   }
    // }
    // else {   
    console.log('sdfsdf', $event.target.value)
    this.sortclickcount = 0;
    this.sort = 'asc';
    this.sortclickcount = this.sortclickcount + 1;
    this.itemOrder = $event.target.value;
    // }
    this.GetAllIndents();
  }
  changestatus(IndentData:any,Status:any){ 
    this.indentguid = IndentData.IndentGuid
    this.FromRights = Status
    this.IndentData=IndentData
  }
  onUpdateStatus(IndentData:any,Status:any) {
    this.indentguid = IndentData.IndentGuid
    this.FromRights = Status,
    this.IndentType=IndentData.IndentType
    this.GetIndentItemDeatilsByGuid(IndentData)  
    //this.GetIndentItemDeatilsByGuid(this.IndentData);
  }
  onStatusUpdate(){
      this.GetIndentItemDeatilsByGuid(this.IndentData);
  }
  /**
   * this event used to set b2b user save items
   */
      SetB2BItems(){
        this.b2bItems = this.IndentItemDetails.map((obj: { BatchQuantity: any,ReqQty:any,NewQty:any,ItemGuid:any,IndentNo:any,ItemName:any}) => ({
          BatchQuantity:obj.ReqQty>obj.NewQty?obj.NewQty:obj.ReqQty,
          ReqQty:obj.ReqQty,
          NewQty:obj.ReqQty>obj.NewQty?obj.NewQty:obj.ReqQty,
          ItemGuid:obj.ItemGuid,
          IndentNo:obj.IndentNo,
          ItemName:obj.ItemName,
          inHandQty:obj.NewQty
        }))
      }
   /**
    * this event used to chnage the aproved quantity
    * @param event 
    * @param index 
    */
   ChangeQuantity(event:any,index:any){
     let Quantity=this.b2bItems[index].NewQty
     let value=event.target.value
     let value1=parseInt(value)
     if(Quantity<value1){
       this.b2bItems[index].BatchQuantity=Quantity;
       this.AproveItems[index].AprovedQty=Quantity
      }
      else{
        this.b2bItems[index].BatchQuantity=value
        this.AproveItems[index].AprovedQty=value
     }
    }
  /**
   * this service save method used to update indent status
   */
  IndentStatus() {
    this.shimmerVisible = true;
    this.isSaveb2b==true? this.FromRights="Approved":this.FromRights;
    let input = {
      LstIndentAproved:this.AproveItems,
      UserGuid: this.userGuid,
      FromRights: this.FromRights,
      CheckedReason:this.FromRights=="Checked"?this.reason:"",
      ApproveReason:this.FromRights=="Approved"?this.reason:""
    }
    this.indentService.IndentStatus(input).subscribe(data => {
      let updateData = data;
      this.reason=""
      this.FromRights='';
      this.IndentType='';
      this.GetAllIndents();
      this.shimmerVisible = false;
    },
    (err: HttpErrorResponse) => {
      this.shimmerVisible = false;
    })
  }
  /**
   * this service method used to save b2bitems
   */
  SaveB2Bitems(){
    const ItemsList=this.b2bItems.map((obj: { BatchQuantity:any,ItemGuid:any,IndentNo:any}) => ({
      BatchQuantity:obj.BatchQuantity,
      ReqQty:obj.BatchQuantity,
      NewQty:obj.BatchQuantity,
      ItemGuid:obj.ItemGuid,
      IndentNo:obj.IndentNo,
    }))
    let input = {
      LstReceiveItems:ItemsList,
      userGuid:this.userGuid
    }
    this.indentService.SaveB2BReceivedItems(input).subscribe(data => {
      let updateData = data;
      this.isSaveb2b=true;
      this.IndentStatus();
    },
    (err: HttpErrorResponse) => {
      this.shimmerVisible = false;
    })
  }
  FiltersCheck(value: any) {

    if (value.length > 0) {
      this.itemOptionsOrders1.forEach((element: any) => {
        value.forEach((val: any) => {
          if (element.status == val.status) {
            element.isChecked = true
          }
        })
      });
    } else {
      this.itemOptionsOrders1.forEach((element: any) => {
        element.isChecked = false
        this.created = true
      });
    }
    this.pageNumber = 1
    this.created = false;
    this.checked = false;
    this.approved = false;
    if (value == "clear") {
      this.itemOptionsOrders1.forEach((element: any) => {
        element.isChecked = false
      });
      this.created = false;
      this.checked = false;
      this.approved = false;
      if (!this.created && !this.checked && !this.approved) {
        this.itemOrder1 = "None"
      }
    } else {
      if (this.itemOptionsOrders1.some((f: any) => f.isChecked && f.status == 'Created')) {
        this.created = true;
      }
      if (this.itemOptionsOrders1.some((f: any) => f.isChecked && f.status == 'Checked')) {
        this.checked = true;
      }
      if (this.itemOptionsOrders1.some((f: any) => f.isChecked && f.status == 'Approved')) {
        this.approved = true;
      }
      this.itemOrder1 = this.created && this.checked && this.approved ? "Created,Checked,Approved" :
        this.created && this.checked && this.approved ? "Created,Checked,Approved" :
          this.created && this.approved && this.checked ? "Created,Approved,Checked" :
            this.created ? "Created" : this.checked ? 'Checked' : this.approved ? 'Approved' : 'None';
    }
    this.GetAllIndents()
  }

  DownloadPdf(data: any, print: any) {
    const doc = new jsPDF({ orientation: 'landscape' });
    this.indentService.GetIndentItemDeatilsByGuid(data.IndentGuid,data.IndentType).subscribe(
      (IndentDetails) => {
        let IndentItemDetails = IndentDetails.Result.getIndentItems;
        let array = 0;
        for (let data of IndentItemDetails) {
          const netTotal = parseFloat(data.NetAmount);
          if (!isNaN(netTotal)) {
            array += netTotal;
          }
        }
      let IndentHeader= (IndentItemDetails[0]?.IndentType === 'SI') ? 'Store indent' : (IndentItemDetails[0]?.IndentType === 'B2BSI')? 'B2B Store Indent' : 'Purchase Indent';
      const headerColStyles = {
        fontSize: 8,
        fillColor: '#00435d',
        textColor: '#fff',
        lineColor: '#fff',
        minCellWidth : 10
      };

      const mainTableColStyles={
        ...headerColStyles,
        cellWidth : 14.5
      }
  
      const footerRowStyles = {
        fontSize: 8,
        fillColor: '#00435d',
        textColor: '#fff',
        lineColor: '#fff',
      };
  
      function createHeaderCols() {
        return [
          { content: 'S.No', styles: { ...mainTableColStyles,cellWidth : 40} },
          { content: 'Item Name', styles: { ...mainTableColStyles,cellWidth : 50 } }, 
          { content: 'Item Unit', styles: { ...mainTableColStyles,cellWidth : 50 } },
          { content: 'Catalog No', styles: { ...mainTableColStyles,cellWidth : 50 } },
          { content: 'Order qty', styles: { ...mainTableColStyles,cellWidth : 50 } },
          { content: 'Manufacturer Name', styles: { ...mainTableColStyles,cellWidth : 50 } },
        ];
      }
  
      function createBodyRows() {
        let bodyRows = [];
        for (let i = 0; i < IndentItemDetails.length; i++) {
          bodyRows.push([
            { content: String(i + 1), styles: { minCellWidth: 40 , fontSize : 8} },
            { content: IndentItemDetails[i].ItemName, styles: { minCellWidth: 50,fontSize : 8 } },
            { content: IndentItemDetails[i].MajorUnitName  || 'N/A', styles: { minCellWidth: 50,fontSize : 8 } },
            { content: IndentItemDetails[i].CatalogNo || 'N/A', styles: { minCellWidth: 50,fontSize : 8 } },
            { content: IndentItemDetails[i].ReqQty || 'N/A', styles: { minCellWidth: 50,fontSize : 8 } },
            { content: IndentItemDetails[i].ManufactureName || 'N/A', styles: { minCellWidth: 50,fontSize : 8 } },
          ]);
        }
        return bodyRows;
      }
      const imageUrl = 'https://yoda-task-manager.s3.ap-south-1.amazonaws.com/users/profile/verificationdocuments/yodalimslogo.png';
      const imageWidth = 110;
      const imageHeight = 15;
      const imageXPos = 100;
      const imageYPos = 5;
  
      doc.addImage(imageUrl, 'PNG', imageXPos, imageYPos, imageWidth, imageHeight);
  
      let cursorY1 = imageYPos + imageHeight + 5;
      const tableWidth = 290;

      function createSecondaryImg() {
        const imageWidth = 70;
        const imageHeight = 10;
        const imageXPos = 220;
        const imageYPos = 8;
        doc.addImage(imageUrl, 'PNG', imageXPos, imageYPos, imageWidth, imageHeight);
      }

      function createPageFooter() {
        const currentDate = new Date();
        const formattedDate = currentDate.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'long',
          year: 'numeric'
        }).replace(/ /g, '-');
        const text = `Date: ${formattedDate}\nThis is computer generated document, hence signature is not required.`;
        const xPos = 290;
        const yPos = 190;
        doc.text(text, xPos, yPos, { align: 'right' }).setFontSize(8);
      }
  
      function createTitle(yPos: any) {
        const headline1Content = IndentHeader;
        const headline1XPos = 3;
        const headline1YPos = imageYPos + 5 - yPos;
        const headline1FontSize = 10;
        return doc.text(headline1Content, headline1XPos, headline1YPos).setFontSize(headline1FontSize);
      }
      function generateGRNTable() {
        return autoTable(doc, {
          foot: [
            [
              {
                content: `${IndentHeader}`,
                styles: { fillColor: '#fff', textColor: '#000000', lineWidth: 0.1, lineColor: '#cecece',halign:'center' ,fontSize : 14},
                colSpan : 2
              },
            ],
            [
              {
                content: `Indent No: ${data.IndentNo || ''}`,
                styles: { fillColor: '#fff', textColor: '#000000', lineWidth: 0.1, lineColor: '#cecece' },
              },
              {
                content: `Indent date: ${data.IndentDate ? new Date(data.IndentDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) : ''}`,
                styles: { fillColor: '#fff', textColor: '#000000', lineWidth: 0.1, lineColor: '#cecece' },
              },
            ],
            [
              {
                content: `Name & Address of sender: ${data.IndentFromLocation }`,
                styles: { fillColor: '#fff', textColor: '#000000', lineWidth: 0.1, lineColor: '#cecece' },
                colSpan : 2
              },
            ],
            [
              {
                content: `Name & Address of recipient: ${data.IndentToLocation}`,
                styles: { fillColor: '#fff', textColor: '#000000', lineWidth: 0.1, lineColor: '#cecece' },
                colSpan : 2
              },
            ],
          ],
          startY: cursorY1,
          theme: 'grid',
          tableWidth: tableWidth,
          margin: { left: 3 },
        });
      }
      function createUsersQuotationData() {
        return autoTable(doc, {
          body:  [
            [
            {content : `Created by : ${data.CreatedBy || ''}`,colSpan: 2,styles : {...footerRowStyles} },
            {content : `Checked by : ${data.CheckedUserName || ''}`,colSpan: 2,styles : {...footerRowStyles} },
            {content : `Approved by : ${data.ApprovedUserName || ''}` ,colSpan: 2,styles : {...footerRowStyles} },
           ] 
          ],
          theme: 'grid',
          tableWidth: tableWidth,
          margin: { left: 3, top: 30 },
          willDrawPage: (data) => {},
          didDrawPage: (data) => {
            if (data.pageNumber > 1) {
              createTitle(0);
              createSecondaryImg();
            }
          },
        });
      }
  
      function generateMainTable() {
        return autoTable(doc, {
          head: [createHeaderCols()],
          body: createBodyRows(),
          theme: 'grid',
          tableWidth: tableWidth,
          margin: { left: 3, top: 30 },
          willDrawPage: (data) => {},
          didDrawPage: (data) => {
            if (data.pageNumber > 1) {
              createTitle(0);
              createSecondaryImg();
            }
          },
        });
      }
  
      generateGRNTable();
      generateMainTable();
      createUsersQuotationData()
      createPageFooter();
      if (print === "print") {
        const pdfOutput = doc.output('bloburl');
        const printWindow :any = window.open(pdfOutput);
        setTimeout(() => {
          printWindow.print();
        }, 250);
      } else {
        doc.save(`indent${data.IndentNo}.pdf`);
      }
  })
}
  /**
    * this method is used for delete the purchase order details
    */
  DeletePurchaseOrder() {
    // this.globalService.startSpinner();
    this.shimmerVisible = true;
    this.indentService.DeleteIndentDetails(this.IndentGuid).subscribe((data: any) => {
      this.GetAllIndents()
    },
      (err: HttpErrorResponse) => {
        // this.globalService.stopSpinner();
        this.shimmerVisible = false;
      })

  }
  deleteIndentDetails(IndentData: any) {
    this.IndentLocation = IndentData.IndentToLocation;
    this.IndentNo = IndentData.IndentNo;
    this.IndentGuid=IndentData.IndentGuid
  }
  /**
   * this event used to filter the indents based on Indent Type 
   * @param IndentType 
   */
  SelectIndenttype(IndentType:any){
    var selectedValues:any = [];
    let  checkboxSI:any = document.getElementById('si') || false;
    var checkboxPI:any = document.getElementById('pi') || false;
    var checkboxb2b:any = document.getElementById('b2b') || false;
    // Add or remove value from selectedValues array based on checkbox state
    if (checkboxSI.checked && checkboxPI.checked && checkboxb2b.checked) { 
        selectedValues = ['SI', 'PI','B2BSI'];
    } if (checkboxSI && checkboxSI.checked) {
        selectedValues.push('SI');
    }  if (checkboxPI && checkboxPI.checked) {
        selectedValues.push('PI');
    }  if (checkboxb2b && checkboxb2b.checked) {
        selectedValues.push('B2BSI');
    }
    this.IndentType=selectedValues.join(",")
    this.GetAllIndents()
  }
  onEditIndent(IndentData:any){
    localStorage.setItem('IndentType',IndentData.IndentType)
    this.router.navigate(['/requests/new-request', IndentData.IndentGuid]);
  }
  ChangeRemark(event:any,index:any){
    const value=event.target.value
    this.AproveItems[index].Remarks=value
  }

  uploadData(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.readExcelFile(file);
    }
  }

  readExcelFile(file: File) {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      // Assuming the Excel sheet is named 'Sheet1'
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      // Parse the worksheet data and handle date format
      this.XLdata = XLSX.utils.sheet_to_json(worksheet, { raw: false, dateNF: 'yyyy-mm-dd' });
      this.QuotationXL=true;
    };
    reader.readAsArrayBuffer(file);
  }


  SaveIndentFromXLData(){
    debugger
    let ItemsDetailsFromXLList :any=[]
    this.XLdata.filter((data:any) => data?.DATE).map((x:any) => { 
      //if(x.CATNumber == "NA"){
        let data = moment(x?.DATE,'MM-DD-YYYY')?.format('DD-MM-YYYY') 
        let ItemsDetailsFromXL ={
          createddate: moment(data, 'DD-MM-YYYY')?.format('YYYY-MM-DD[T]HH:mm:ss.SSS[Z]'),
          panelCode: x.PANELCODE,
          itemName: x.ITEMNAME,
          qty: x.QTY,
          CATNumber : x.CATNumber
        }
        ItemsDetailsFromXLList?.push(ItemsDetailsFromXL)
     // }
    })
    console.log(ItemsDetailsFromXLList , "CATNumber")
    this.indentService.saveIndentFromXL(ItemsDetailsFromXLList).subscribe((data) => {
      console.log(data);
    })

  }
  clearReason() {
  this.reason = ''; 
  this.FromRights='';
}
}






