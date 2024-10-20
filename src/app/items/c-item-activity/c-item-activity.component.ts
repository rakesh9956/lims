import { Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
@Component({
  selector: 'app-c-item-activity',
  templateUrl: './c-item-activity.component.html',
  styleUrls: ['./c-item-activity.component.scss']
})
export class CItemActivityComponent implements OnInit {

  IsShow: boolean = true;
  @Input() alItemListData: any[];
  alItemIndentData: any = [];
  alItemQuotationData: any = [];
  alItemPurchaseData: any = [];
  alItemGrnData: any = [];
  alItemSiData: any = [];
  alItemPurchaseDetails: any = [];
  quotationFilterData: any=[];
  indentFilterDetails: any=[];
  grnFilterDetails: any=[];
  @Input()  Supplierslist : any[];
  supplierFilterDetails: any=[];

  constructor(
    private modalService: NgbModal,
  ) { }

  ngOnInit(): void {
    this.alItemQuotationData = this.alItemListData.filter(item => item.QuotationType === 'Quotation');
    this.alItemIndentData = this.alItemListData.filter(item => item.IndentTypeName === 'Indent');
    this.alItemPurchaseData = this.alItemListData.filter(item => item.PurchaseOrderType === 'purchaseOrder');
    this.alItemGrnData = this.alItemListData.filter(item => item.GrnType === 'Grn');
    this.alItemSiData = this.alItemListData.filter(item => item.SIType === 'Si');
 }

  openBasicXlModal(content: TemplateRef<any>) {
    this.modalService.open(content, { size: 'xl' }).result.then((result) => {
      console.log("Modal closed" + result);
    }).catch((res) => { });
  }
  openBasicLgModal(content: TemplateRef<any>) {
    this.modalService.open(content, { size: 'lg' }).result.then((result) => {
      console.log("Modal closed" + result);
    }).catch((res) => { });
  }

  PurchaseOrderGuid(Guid: any) {
    this.alItemPurchaseDetails = this.alItemListData.filter(item => item.PurchaseOrderGuid === Guid);
  }

  QuotationDataFilter(Guid: any) {
    this.quotationFilterData = this.alItemListData.filter(item => item.QuotationType === 'Quotation' && item.QuotationGuid === Guid);
  }

  indentFilterData(Guid:any){
  this.indentFilterDetails = this.alItemListData.filter(item => item.IndentTypeName === 'Indent' && item.IndentGuid === Guid);
  }

  grnFilterData(Guid:any){
   this.grnFilterDetails= this.alItemGrnData = this.alItemListData.filter(item => item.GrnType === 'Grn' && item.GrnGuid ===Guid);
  }

 SiFilterData(Guid:any){
    this.grnFilterDetails= this.alItemSiData = this.alItemListData.filter(item => item.SIType === 'Si' && item.SIGuid === Guid);
   }

supplierFilterData(Guid:any){
   this.supplierFilterDetails = this.Supplierslist.filter(item => item.SupplierGuid === Guid);
}
}
