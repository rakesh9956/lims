import { DatePipe } from '@angular/common';
import { Component, OnInit, TemplateRef } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Workbook } from 'exceljs';
import * as saveAs from 'file-saver';
import { AuthenticationService } from 'src/app/core/Services/authentication.service';
import { IndentService } from 'src/app/core/Services/indent.service';

@Component({
  selector: 'app-si-pending-items',
  templateUrl: './si-pending-items.component.html',
  styleUrls: ['./si-pending-items.component.scss']
})
export class SiPendingItemsComponent implements OnInit {

  TotalCount: any;
  pages: number;
  pageSize: any = 10;
  item: any = [];
  page : any = 1;
  pagePI : any = 1;
  itemOptionsPerPage = [40, 80, 120, 160, 200, 240, 280, 320];
  itemsPerPage = 40;
  ItemSelect: any;
  rowCount: any = 40;
  maxSize: number = 3;
  boundaryLinks: boolean = true;
  size: string = 'lg';
  AllIntedentDetails: any;
  SIindentList: any;
  PIindentList: any;
  filterdSIindentList: any=[];
  filterdPIindentList: any=[];
  SIItemDetails: any;
  searchingData: any;
  distinctSIs: any=[];
  distinctPIs: any=[];
  currentPage: any;
  FromLocationGuid:any='';
  ToLocationGuid:any='';
  defaultNavActiveId = 1;
  TotalCountPI: any;
  type : any
  shimmerVisible :boolean
  constructor(private indentService: IndentService,public authservice: AuthenticationService,private modalService: NgbModal, private datePipe: DatePipe) { }

  ngOnInit(): void {
    this.GetSIIndent();
  }
  GetSIIndent() {
    this.shimmerVisible=true
    const store=this.authservice.LoggedInUser.STORE;
    let DepotmentGuid =this.authservice.LoggedInUser.DEFAULTROLES.toLowerCase().includes('ADMIN'.toLowerCase()) && this.authservice.LoggedInUser.LOCATIONSGUID=='00000000-0000-0000-0000-000000000000' ?'00000000-0000-0000-0000-000000000000': this.authservice.LoggedInUser.LOCATIONSGUID.split(",");
     if(store==false || store=='false'){
      this.FromLocationGuid=DepotmentGuid;
     }
     else if(store==true){
      this.ToLocationGuid=DepotmentGuid;
     }
     else{
      this.ToLocationGuid='';
     }
      this.indentService.GetSIPendingindentDetails(this.FromLocationGuid,this.ToLocationGuid, '', '', '').subscribe(
        (data) => {
          this.SIindentList = data.Result || [];
          this.shimmerVisible=false
          const countMap: any = {};
          this.SIindentList.forEach((item: any) => {
            const IndentNo = item.IndentNo;
            countMap[IndentNo] = (countMap[IndentNo] || 0) + 1;
          });
          this.filterdSIindentList = this.SIindentList.filter((item: any, index: any, self: any) => {
            const IndentNo = item.IndentNo;
            if (countMap[IndentNo]) {
              // Calculate the total amount for items with the same ScrapNumber
              const totalAmountSum = self
                .filter((v: any) => v.IndentNo === IndentNo)
                .reduce((sum: number, v: any) => sum + v.totalAmount, 0);
              item.Count = countMap[IndentNo];
              item.TotalAmountSum = totalAmountSum;
            }
            return self.findIndex((v: any) => v.IndentNo === IndentNo) === index;
          });
          this.distinctSIs=this.filterdSIindentList
          this.TotalCount = this.distinctSIs?.length
          this.onPageChange(this.page,'SI')
        })
  }
  GetPIIndent() {
    this.shimmerVisible=true
    const store=this.authservice.LoggedInUser.STORE;
    let DepotmentGuid =this.authservice.LoggedInUser.DEFAULTROLES.toLowerCase().includes('ADMIN'.toLowerCase()) && this.authservice.LoggedInUser.LOCATIONSGUID=='00000000-0000-0000-0000-000000000000' ?'00000000-0000-0000-0000-000000000000': this.authservice.LoggedInUser.LOCATIONSGUID.split(",");
     if(store==false || store=='false'){
      this.FromLocationGuid=DepotmentGuid;
     }
     else if(store==true){
      this.ToLocationGuid=DepotmentGuid;
     }
     else{
      this.ToLocationGuid='';
     }
      this.indentService.GetPIPendingIndentsDetails(this.FromLocationGuid,this.ToLocationGuid, '', '', '').subscribe(
        (data) => {
          this.PIindentList = data.Result || [];
          this.shimmerVisible=false
          const countMap: any = {};
          this.PIindentList.forEach((item: any) => {
            const IndentNo = item.IndentNo;
            countMap[IndentNo] = (countMap[IndentNo] || 0) + 1;
          });
          this.filterdPIindentList = this.PIindentList.filter((item: any, index: any, self: any) => {
            const IndentNo = item.IndentNo;
            if (countMap[IndentNo]) {
              const totalAmountSum = self
                .filter((v: any) => v.IndentNo === IndentNo)
                .reduce((sum: number, v: any) => sum + v.totalAmount, 0);
              item.Count = countMap[IndentNo];
              item.TotalAmountSum = totalAmountSum;
            }
            return self.findIndex((v: any) => v.IndentNo === IndentNo) === index;
          });
          this.distinctPIs=this.filterdPIindentList
          this.TotalCountPI = this.distinctPIs?.length
          this.onPageChange(this.pagePI,'PI')
        })
  }
  openXlModal(content: TemplateRef<any>, size:any) {
    this.modalService.open(content, { size: size }).result.then((result) => {
      console.log("Modal closed" + result);
    }).catch((res) => { });
  }
  selectSI(event:any){
    this.SIItemDetails = this.SIindentList.filter((scrap: any) => scrap.IndentNo == event.IndentNo)
  }
  selectPI(event:any){
    this.SIItemDetails = this.PIindentList.filter((scrap: any) => scrap.IndentNo == event.IndentNo)
  }
  search(event:any){
    this.searchingData = this.distinctSIs
    if ( event.target.value != '') {
      this.filterdSIindentList =  this.searchingData?.filter((item: any) => {
       return item.IndentNo?.toLowerCase().includes(event.target.value.toLowerCase()) || item.FromLocation?.toLowerCase().includes(event.target.value.toLowerCase());
      });
    } 
    else {
      this.filterdSIindentList = this.distinctSIs
    }
    this.TotalCount = this.filterdSIindentList?.length
  }
  searchPI(event:any){
    this.searchingData = this.distinctPIs
    if ( event.target.value != '') {
      this.filterdPIindentList =  this.searchingData?.filter((item: any) => {
       return item.IndentNo?.toLowerCase().includes(event.target.value.toLowerCase()) || item.FromLocation?.toLowerCase().includes(event.target.value.toLowerCase());
      });
    } 
    else {
      this.filterdPIindentList = this.distinctPIs
    }
    this.TotalCountPI = this.filterdPIindentList?.length
  }
  updateDisplayedItems() {
    if(this.type=='SI'){
      const startIndex = (this.page - 1) * this.itemsPerPage;
      const endIndex = startIndex + this.itemsPerPage;
      this.filterdSIindentList = this.distinctSIs.slice(
        startIndex,
        Math.min(endIndex, this.distinctSIs.length)
      );
    }
    else{
      const startIndex = (this.pagePI - 1) * this.itemsPerPage;
      const endIndex = startIndex + this.itemsPerPage;
      this.filterdPIindentList = this.distinctPIs.slice(
        startIndex,
        Math.min(endIndex, this.distinctPIs.length)
      );
    }
  }
  onPageChange(event:any,type : any) {
  if(type=='SI'){
    this.page = event;
  }
else{
  this.pagePI=event
}
  this.type=type
  this.updateDisplayedItems();
  }
  GetSIpendingExcel(type :any){
    this.downloadExcel(type)
  }
  downloadExcel(IndentType : any) {
    const header = [ 'Indent No','Indent from Location','Indent to Location','Item Name','Status','Req Qty','Pending Qty','Item Count','Created By','Created Date','Checked By','Checked Date','Approved By','Approved Date','Expected Date'];
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('Sharing Data');
    const headerRow = worksheet.addRow(header);
    headerRow.eachCell((cell : any, number : any) => {
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
    worksheet.getColumn(3).width = 40;
    worksheet.getColumn(4).width = 20;
    worksheet.getColumn(5).width = 15;
    worksheet.getColumn(6).width = 15;
    worksheet.getColumn(7).width = 20;
    worksheet.getColumn(8).width = 20;
    worksheet.getColumn(9).width = 20;
    worksheet.getColumn(10).width = 20;
    worksheet.getColumn(11).width = 30;
    worksheet.getColumn(12).width = 20;
    worksheet.getColumn(13).width = 30;
    worksheet.getColumn(14).width = 30;
    worksheet.getColumn(15).width = 30;
    let list : any
    IndentType=='SI' ? list=this.SIindentList :   list=this.PIindentList
    list.forEach((item: any) => {
      const row = worksheet.addRow([
        item.IndentNo,
        item.FromLocation,
        item.ToLocation,
        item.ItemName,
        item.FromRights,
        item.ReqQty,
        IndentType=='SI'?item.ReqQty-item.ReceiveQty:item.ReqQty-item.POQty,
        item.Count,
        item.UserName,
        this.datePipe.transform(item.CreatedDt,'dd-MM-yyyy'),
        item.CheckedUserName,
        this.datePipe.transform(item.CheckedDate,'dd-MM-yyyy'),
        item.ApprovedUserName,
        this.datePipe.transform(item.ApprovedDate,'dd-MM-yyyy'),
        this.datePipe.transform(item.ExpectedDate,'dd-MM-yyyy'),
      ]);
    });
    let fileName : any
    IndentType=='SI'? fileName = 'SI Pending Items-print.xlsx' : fileName = 'PI Pending Items-print.xlsx';
    workbook.xlsx.writeBuffer().then((data: any) => {
      const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, fileName);
    });
  }
}
