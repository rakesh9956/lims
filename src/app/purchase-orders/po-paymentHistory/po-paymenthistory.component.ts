import { Component, Injectable, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject, debounceTime } from 'rxjs';
import { PurchaseOrderService } from 'src/app/core/Services/purchase-order.service';

@Component({
    templateUrl: './po-paymenthistory.component.html',
    styleUrls: ['./po-paymenthistory.component.scss']
  })
export class PoPaymentHistoryComponent implements OnInit {
  PaymentHistoryList : any;
  displayUrl : string;
  itemsPerPage: any = 40;
  pageNumber = 1;
  rowCount = 40;
  shimmerVisible: boolean;
  totalCount: any;
  boundaryLinks: boolean = true;
  size: string = 'lg';
  maxSize: number = 3;
  UserGuid : any;
  isMenuCollapsed = true;
  itemOptionsPerPage = [40, 80, 120, 160, 200, 240, 280, 320];
  Keyword : any
  Document: any;
  modelChanged = new Subject<string>();
    constructor(
        private modalService: NgbModal,
        private purchaseOrderService: PurchaseOrderService
      ) {
        this.modelChanged
        .pipe(debounceTime(1000))
        .subscribe(model => {
          this.Keyword = model;
          this.getPaymentHistory();
        })
      }


    ngOnInit(): void {
      this.UserGuid = localStorage.getItem('UserGuid')
      this.getPaymentHistory();
      if (window.outerWidth < 480) {
        this.maxSize = 2;
        this.boundaryLinks = false;
        this.size = 'sm';
      }
       // throw new Error("Method not implemented.");
    }
    ChangePagenumber(event: any) {
      this.pageNumber = event;
      this.getPaymentHistory();
    }
    ChangeEvent(rowNo: any) {
      this.itemsPerPage = rowNo.target.value;
      this.pageNumber = 1
      this.rowCount = rowNo.target.value;
      this.getPaymentHistory();
    }
    changeSearch(Keyword: any) {
      this.pageNumber = 1;
      this.rowCount = 40;
      this.modelChanged.next(Keyword);
    }
  getPaymentHistory(){
    this.shimmerVisible = true;
    this.Keyword = (this.Keyword == undefined || this.Keyword == null) ? this.Keyword || "" : this.Keyword
    let body = {
      rowCount: this.rowCount,
      PageNumber : this.pageNumber,
      Keyword : this.Keyword
    }
    this.purchaseOrderService.getPaymentHistory(body).subscribe(
      (getData) => {
        this.shimmerVisible = false;
        this.PaymentHistoryList = getData;
        this.totalCount =  this.PaymentHistoryList[0]?.TotalCount
      },
      (err) => {
        console.error(err);
        this.shimmerVisible = false;
      });
  }


    openBasicModal(content: TemplateRef<any> , UrlImage : any) {
      this.Document = UrlImage;
        this.modalService.open(content, {backdrop: 'static', keyboard: false, size: 'md' }).result.then((result) => {
          console.log("Modal closed" + result);
        }).catch((res) => { });
      }
      openXlModal(content: TemplateRef<any>) {
        this.modalService.open(content, { size: 'xl' }).result.then((result) => {
          console.log("Modal closed" + result);
        }).catch((res) => { });
      }
}