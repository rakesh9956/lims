import { Component, TemplateRef, ViewChild } from '@angular/core';
import { ColumnMode } from '@swimlane/ngx-datatable';
import { Subject } from 'rxjs';
import { GlobalService } from 'src/app/core/Services/global.service';
import { AllItemsService } from 'src/app/core/Services/all-items.service';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Workbook } from 'exceljs';
import * as saveAs from 'file-saver';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthenticationService } from 'src/app/core/Services/authentication.service';

@Component({
  selector: 'app-all-items',
  templateUrl: './all-items.component.html',
  styleUrls: ['./all-items.component.scss']
})


export class AllItemsComponent {

  @ViewChild(DatatableComponent) table: DatatableComponent;

  /*** Paginatin Option Starts ***/
  maxSize: number = 3;
  boundaryLinks: boolean = true;
  size: string = 'lg';
  itemsPerPage: any = 40;
  /*** Paginatin Option Starts ***/
  shimmerVisible: boolean;
  defaultNavActiveId = 1;
  rows: any[] = [];
  filteredData: any[] = [];
  loadingIndicator = true;
  currentPage = 1;
  ColumnMode = ColumnMode;
  ItemsData: any = [];
  pageNumber: any = 1;
  rowCount: any = 40;
  pageSize: any = 40
  Keyword: any = null;
  orderBy: any = '';
  sortType: any = 'desc';
  ItemGuid: any;
  type: any = [];
  days = [{ value: 1, days: "15", }, { value: 2, days: "30" }, { value: 3, days: "45" }, { value: 4, days: 'Clear Filter' }]
  currentDateTime: string | null;
  exipersIn: any = [];
  StcokItemList: any = [];
  modelChanged = new Subject<string>();
  keyword: any = '';
  lowStock: any = [];
  exipiryStock: any = [];
  expStock: any = [];
  lowStockItems: any = [];
  stockItems: any = [];
  filterItemNo: any[];
  searchItem: string = '';
  totalLength: any;
  allItemsCount: any;
  lowStockCount: any;
  searchlowStockItem: any;
  searchExpirayItem: any;
  totalStockCount: any;
  noItemsFound: boolean=false;
  forLowStockItems: any=[];
  Print: any;
  IsActive:boolean=false;
  ItemName: any;
  IsShow: boolean = true;
  reason: string='';
  Itemguid : any;
  status :boolean;
  userGuid: any = null;
  constructor(
    private allItemsService: AllItemsService,
    public globalService: GlobalService,
    public datepipe: DatePipe,
    private modalService: NgbModal,
    private route: ActivatedRoute,
    public authservice: AuthenticationService) {
    this.currentDateTime = this.datepipe.transform((new Date), 'MM/dd/yyyy h:mm:ss');
  }

  ngOnInit(): void {
    let editButton = localStorage.getItem("Type");
    console.log(editButton);
    if(editButton == "All Items"){
      let pageNum = localStorage.getItem("pageNumber");
      this.pageNumber = pageNum;
      localStorage.removeItem("Type");
      localStorage.removeItem("pageNumber");

    }
    this.ItemGuid = this.route.snapshot.paramMap.get('ItemGuid') || '';
    if (window.outerWidth < 480) {
      this.maxSize = 2;
      this.boundaryLinks = false;
      this.size = 'sm';
    }
    this.allItems();
    this.userGuid = localStorage.getItem('UserGuid');
  }
  PopupfordeleteItem(content: TemplateRef<any>, size:any) {
    this.modalService.open(content, { size: size }).result.then((result: string) => {
      console.log("Modal closed" + result);
    }).catch((res: any) => { });
  }
  /**
   * this change event to chanege search
   * @param event 
   */
  changeSearch(event: any) {
    this.pageNumber = 1;
    this.pageSize = 40;
    this.modelChanged.next(event.target.value);
  }
  /**
   * this change event to chage the page number
   * @param event 
   */
  ChangePagenumber(event: any) {
    this.pageNumber = event;
    this.allItems();
  }

  /**
   * This event for search filter option
   *  */

  /**
   * This method is used to get all items
   */
  allItems() {
    this.shimmerVisible = true;
    // this.globalService.startSpinner();
    this.keyword = (this.Keyword == undefined || this.Keyword == null) ? this.Keyword || "" : this.Keyword;
    let items = {
      PageNumber: this.pageNumber==null?1:this.pageNumber,
      RowCount: this.rowCount,
      Keyword: this.keyword,
      OrderBy: this.orderBy,
      SortType: this.sortType,
      IsActive:false
    }
    this.allItemsService.getAllItems(items).subscribe(data => {
      this.forLowStockItems=data.Result.getAllItemsResponses
      this.filteredData = data.Result.getAllItemsResponses.filter((value: any, index: any, self: any) => {
        const firstIndex = self.findIndex((item: any) => item.ItemGuid === value.ItemGuid || item.ItemName === value.ItemName);
        return index === firstIndex;
      });
      this.ItemsData = this.filteredData.filter((value: any, index: any, self: any) => {
        const firstIndex = self.findIndex((item: any) => item.ItemGuid === value.ItemGuid || item.ItemName === value.ItemName);
        return index === firstIndex;
      });
      this.allItemsCount = this.filteredData.length
      this.StcokItemList = data.Result.getStockItemsResponses
      localStorage.setItem('myArrayData', JSON.stringify(this.ItemsData));
      this.shimmerVisible = false;
      // this.globalService.stopSpinner();
    },

      error => {
        this.shimmerVisible = false;
        this.globalService.stopSpinner();
      });
  }


  getItems(event: any) {
    this.searchItem = ""
    this.searchlowStockItem = ""
    this.searchExpirayItem = ""
    this.type = []
    if (event == "All Items") {
      this.type = event;
      this.ItemsData = this.filteredData
    }
    if(event=="ExpiryItems"){
      this.noItemsFound=false
      this.exipiryStock = this.forLowStockItems.filter((obj:any) => new Date(obj.ExpiryDate) > new Date());
      this.exipiryStock = this.exipiryStock.filter((data: any) => data.ExpiresOn).sort((a: any, b: any) => a.ExpiresOn - b.ExpiresOn);
      this.expStock = this.exipiryStock
      this.totalLength = this.expStock.length
    }
    else if (event == "LowStockItems"||'Print' && !this.searchlowStockItem) {
      this.Print=event
      this.noItemsFound=false
      const lowStocksFilter: any = []
      this.filterItemNo = [...new Set(this.forLowStockItems.map((obj:any) => obj.ItemNo))];

      this.filterItemNo.forEach((items: any) => {
        let ItemQuantity = this.forLowStockItems.filter((item:any) => item.ItemNo === items).reduce((acc:any, item:any) => acc + item.SumofRemainingQuantity, 0);

        const filters = this.forLowStockItems.filter((item:any) => ItemQuantity <= item.LowStockCount && ItemQuantity > 0 && item.ItemNo === items)
        const filterDuplicates = filters.filter((value: any, index: any, self: any) => {
          return index === self.findIndex((t: any) => (
            t.ItemGuid === value.ItemGuid || t.ItemName === value.ItemName
          ));
        })
        const lowStocks = filterDuplicates.map((obj: any) => obj.ItemNo === items ? { ...obj, ItemQuantity: ItemQuantity } : obj);
        lowStocksFilter.push(...lowStocks)
        this.lowStock = lowStocksFilter
      })
      this.lowStock.sort((a : any, b : any) => a.LowStockCount - b.LowStockCount);
      this.lowStockItems = this.lowStock
      this.lowStockCount = this.lowStockItems.length
      if(this.Print=='Print'){
        this.shimmerVisible = true;
        setTimeout(() => {
          this.downloadExcel();
          this.shimmerVisible = false;
        }, 1000);
      }
    }
    
    if (event == 'StockItems') {
      this.exipiryStock = []
      this.noItemsFound=false
      this.stockItems = this.StcokItemList
      this.totalStockCount= this.stockItems.length
    }
  }

  expiresIndays(event: any) {
    this.exipersIn = event.target.value;
    if (this.exipersIn == "15") {
      this.exipiryStock = this.expStock.filter((obj:any) => obj.ExpiresOn > 0 && obj.ExpiresOn <= 15);
    }
    else if (this.exipersIn == "30") {
      this.exipiryStock = this.expStock.filter((obj:any) => obj.ExpiresOn > 0 && obj.ExpiresOn <= 30);
    } else {
      this.exipiryStock = this.expStock.filter((obj:any) => obj.ExpiresOn > 0 && obj.ExpiresOn <= 45);
    }
    if (this.exipersIn == "Clear Filter") {
      this.exipiryStock=this.expStock
    }

    this.totalLength = this.exipiryStock.length;
    this.totalLength?.length<=0?this.noItemsFound==true:this.noItemsFound==false; 
  }

  applyPaginationAndFilter(): void {
    if(this.searchItem==''){
      this.ItemsData = this.filteredData.slice((this.currentPage - 1) * this.itemsPerPage, this.currentPage * this.itemsPerPage);
    }
    else{
      this.ItemsData = this.filteredData.filter((element:any)=>{
        return (element.Department?.toLowerCase().includes(this.searchItem.toLowerCase()) || (element.ItemName?.toLowerCase().includes(this.searchItem.toLowerCase())));
      });
      this.ItemsData = this.ItemsData.slice((this.currentPage - 1) * this.itemsPerPage, this.currentPage * this.itemsPerPage);
    }
    if (this.exipiryStock.length > 0 ) {
      if (this.exipersIn == "15") {
        this.exipiryStock = this.expStock.filter((obj:any) => obj.ExpiresOn > 0 && obj.ExpiresOn <= 15);
      }
      else if (this.exipersIn == "30") {
        this.exipiryStock = this.expStock.filter((obj:any) => obj.ExpiresOn > 0 && obj.ExpiresOn <= 30);
      } else {
        this.exipiryStock = this.expStock.filter((obj:any) => obj.ExpiresOn > 0 && obj.ExpiresOn <= 45);
      }
      if (this.exipersIn == "Clear Filter") {
        this.exipiryStock=this.expStock
      }
      this.exipiryStock = this.exipiryStock.slice((this.currentPage - 1) * this.itemsPerPage, this.currentPage * this.itemsPerPage);
    }
    if (this.lowStock.length > 0) {
      this.lowStock = this.lowStockItems.slice((this.currentPage - 1) * this.itemsPerPage, this.currentPage * this.itemsPerPage);
    }
    if (this.stockItems.length > 0) {
      this.stockItems = this.StcokItemList.slice((this.currentPage - 1) * this.itemsPerPage, this.currentPage * this.itemsPerPage);
    }
    this.globalService.stopSpinner()
  }
  // Define a method to handle page change
  onPageChange(event: any): void {
    localStorage.setItem("pageNumber" , event);
    this.currentPage = event;
    this.applyPaginationAndFilter();
  }

  filterExpirayItems() {
    this.exipiryStock = []
    if (this.exipersIn == "15") {
      this.exipiryStock = this.expStock.filter((item: any) => item.ItemName.toLowerCase().includes(this.searchExpirayItem.toLowerCase()) && item.ExpiresOn > 0 && item.ExpiresOn <= 15);
    }
    else if (this.exipersIn == "30") {
      this.exipiryStock = this.expStock.filter((item: any) => item.ItemName.toLowerCase().includes(this.searchExpirayItem.toLowerCase()) && item.ExpiresOn > 0 && item.ExpiresOn <= 30);
    } else if (this.exipersIn == "45") {
      this.exipiryStock = this.expStock.filter((item: any) => item.ItemName.toLowerCase().includes(this.searchExpirayItem.toLowerCase()) && item.ExpiresOn > 0 && item.ExpiresOn <= 45);
    } else {
      this.exipiryStock = this.expStock.filter((item: any) => item.ItemName.toLowerCase().includes(this.searchExpirayItem.toLowerCase()));
    }
    if(this.exipiryStock.length == 0){
      this.noItemsFound=true
    }else{
      this.noItemsFound=false
    }
    this.totalLength = this.exipiryStock.length

  }


  filterAllItems() {
    this.ItemsData = this.filteredData.filter((element:any)=>{
      return ((element.Department?.toLowerCase().includes(this.searchItem.toLowerCase())) || (element.ItemName?.toLowerCase().includes(this.searchItem.toLowerCase())) || (element.CatalogNo?.toLowerCase().includes(this.searchItem.toLowerCase())));
    });
    if(this.ItemsData.length == 0){
      this.noItemsFound=true
    }else{
      this.noItemsFound=false
    }
    this.allItemsCount = this.ItemsData.length
  }

  filterLowStockItems() {
    this.lowStock = []
    this.lowStock = this.lowStockItems.filter((item: any) => item.ItemName.toLowerCase().includes(this.searchlowStockItem.toLowerCase()));
    if(this.lowStock.length == 0){
      this.noItemsFound=true
    }else{
      this.noItemsFound=false
    }
    this.lowStockCount = this.lowStock.length
  }

  filterStockItems() {
    this.stockItems = []
    this.stockItems = this.StcokItemList.filter((item: any) => item.ItemName.toLowerCase().includes(this.searchItem.toLowerCase()));
    if(this.stockItems.length == 0){
      this.noItemsFound=true
    }else{
      this.noItemsFound=false
    }
    this.totalStockCount=this.stockItems.length
  }

  AddItem() {
    localStorage.setItem('ItemUnqId', this.ItemsData[0].ItemUnqId)
  }
  downloadExcel() {
    const header = [ 'Item Name','Hsn Code','Catalog #','Category','Department','Manufacturer','Machine','Is Expirable'];
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('Sharing Data');
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
    worksheet.getColumn(4).width = 30;
    worksheet.getColumn(5).width = 15;
    worksheet.getColumn(6).width = 40;
    worksheet.getColumn(7).width = 40;
    worksheet.getColumn(8).width = 20;
    worksheet.getColumn(9).width = 20;
    worksheet.getColumn(10).width = 20;
    //worksheet.addRow([]);
    this.ItemsData.forEach((item: any) => {
      const row = worksheet.addRow([
        item.ItemName,
        item.HSNCode?item.HSNCode:'N/A',
        item.CatalogNo,
        item.Category,
        item.Department,
        item.Manufacturer,
        item.Machine?item.Machine:'N/A',
        item.IsExpirable
      ]);
    });
    const fileName = 'Items-print.xlsx';
    workbook.xlsx.writeBuffer().then((data: any) => {
      const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, fileName);
      this.currentPage=1;
    });
  }
  DeleteItem() {
    this.globalService.startSpinner();
    this.allItemsService.DeleteItem(this.ItemGuid).subscribe((data: any) => {
      this.allItems();
      this.globalService.stopSpinner();
    },
      (err: HttpErrorResponse) => {
        this.globalService.stopSpinner();
    })
  }
  deleteItemDetails(row:any){
    this.ItemName=row.ItemName
    this.ItemGuid=row.ItemGuid
  }
  clearReason() {
    this.reason = ''; 
  }
  openBasicModal(content: TemplateRef<any>) {
    this.modalService.open(content, { backdrop: 'static', keyboard: false ,size: 'md' }).result.then((result: string) => {
      console.log("Modal closed" + result);
    }).catch((res: any) => { });
  }
  onUpdateStatus() {
    this.updateQuotationStatus()
  }
  updateQuotationStatus() {
    let input = {
      ItemGuid: this.Itemguid,
      UserGuid: this.userGuid,
      ApprovalStatus: this.status,
      ApproveReason: this.status == true ? this.reason : '',
      CheckedReason: this.status != true ? this.reason : ''
    }
    this.allItemsService.updateItemStatusData(input).subscribe((data : any) => {
    let updateData = data
    this.allItems()
    this.reason=''
  })
    this.shimmerVisible = true;
    this.shimmerVisible = false; 
  }
  change(item:any,Status:any){
    this.Itemguid=item.ItemGuid
    console.log(item)
    this.status=Status
   }
}

