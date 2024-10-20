import { Component, Input, OnInit, TemplateRef } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PurchaseOrderService } from 'src/app/core/Services/purchase-order.service';
import { AuthenticationService } from 'src/app/core/Services/authentication.service';
import { HttpErrorResponse } from '@angular/common/http';
import { GlobalService } from 'src/app/core/Services/global.service';
import { ColumnMode } from '@swimlane/ngx-datatable';
@Component({
  selector: 'app-c-item-pos',
  templateUrl: './c-item-pos.component.html',
  styleUrls: ['./c-item-pos.component.scss']
})
export class CItemPosComponent implements OnInit {

  /*** Paginatin Option Starts ***/
  maxSize: number = 3;
  boundaryLinks: boolean = true;
  size: string = 'lg';
  /*** Paginatin Option Starts ***/
  IsShow: boolean = true;
  grnstsatusList: any = [];
  AllPurchaseOrderDetails: any;
  TotalCount: any;
  pageNumber: any = 1;
  itemsPerPage: any=40;
  itemOrder: any;
  Keyword: string = '';
  filteredData: any;
  PurchaseOrderName: any;
  purchaseOrderGuid: any;
  sort: string = 'desc';
  rowCount: any = 40;
  loadingIndicator = true;
  ColumnMode = ColumnMode;
  roles:any;
  @Input() itemPurchaseData : any[];
  UserGuid: string;


  constructor(private purchaseOrderService: PurchaseOrderService, private router: Router,private authservice: AuthenticationService, private modalService: NgbModal, private globalService:GlobalService) { }

  ngOnInit(): void {
    if(window.outerWidth < 480){
      this.maxSize = 2;
      this.boundaryLinks = false;
      this.size = 'sm';
    }
    this.GetAllPurchaseOrderDetails();

    console.log(this.itemPurchaseData)
  }

  GetAllPurchaseOrderDetails() {
    this.globalService.startSpinner();
    this.purchaseOrderService.GetAllPurchaseOrderDetails(this.Keyword, this.itemOrder, this.sort, this.pageNumber, this.rowCount).subscribe(data => {
      this.AllPurchaseOrderDetails = data.Result.getAllPurchaseOrders,
      this.filteredData = data.Result.getAllPurchaseOrders;
      this.TotalCount=data.Result.TotalCount
      this.globalService.stopSpinner();
    },
    (err: HttpErrorResponse) => {
      this.globalService.stopSpinner();
    }
    )
  }
  onSelect(dataTableActions: any) {
    let PurchaseOrderDetails = JSON.stringify(dataTableActions)
    localStorage.setItem('PurchaseOrderDetails', PurchaseOrderDetails)
    // this.router.navigate(['/purchase-orders/new-purchase-order', dataTableActions.PurchaseOrderGuid]);
  }
  /**
   * this method is used for delete the purchase order details
   */
  DeletePurchaseOrder() {
    this.UserGuid=this.authservice.LoggedInUser.UserGuid
    this.purchaseOrderService.DeletePurchaseOrderDetails(this.purchaseOrderGuid,this.UserGuid).subscribe(data => {
      this.GetAllPurchaseOrderDetails()
    },
      (err: HttpErrorResponse) => {
      })

  }
   OnSelectPO(event:any){
    if(event.IndentNo){
      this.router.navigate(['/purchase-orders/po-against-pi', event.PurchaseOrderGuid]);
    }
    else{
      this.router.navigate(['/purchase-orders/new-purchase-order', event.PurchaseOrderGuid]);
    }
     
  }
  openBasicModal(content: TemplateRef<any>) {
    this.modalService.open(content, { size: 'md' }).result.then((result) => {
      console.log("Modal closed" + result);
    }).catch((res) => { });
  }

  /**
   *
   * @param row
   * this event is used for get the selected purcahse order details
   */
  PurchaseOrderDetailas(row: any) {
    this.PurchaseOrderName = row.SupplierName
    this.purchaseOrderGuid = row.PurchaseOrderGuid
  }
  /**
   * this change event change the row number
   * @param rowNo 
   */
  ChangeEvent(rowNo: any) {
    this.itemsPerPage = rowNo.target.value;
    this.rowCount = rowNo.target.value;
    this.GetAllPurchaseOrderDetails();
  }
  ChangePagenumber(event: any) {
    this.pageNumber = event;
    this.GetAllPurchaseOrderDetails();
   }
  ChangePOStatus(PurchaseOrderGuid: any, ApprovalType: any) {
    let body: any = {
      PurchaseOrderGuid: PurchaseOrderGuid,
      ApprovalType: ApprovalType,
      UserGuid: this.authservice.LoggedInUser.UserGuid
    }
    this.purchaseOrderService.UpdatePurchaseOrderStatus(body).subscribe(data => {
      this.GetAllPurchaseOrderDetails()
    },
      (err: HttpErrorResponse) => {
      })

  }	

}
