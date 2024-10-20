import { Component, NgModule, OnInit } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgbDateStruct, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectComponent } from '@ng-select/ng-select';
import { AppComponent } from 'src/app/app.component';
import { PurchaseOrderService } from 'src/app/core/Services/purchase-order.service';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';



@Component({
  selector: 'app-po-view',
  templateUrl: './po-view.component.html',
  styleUrls: ['./po-view.component.scss']
})

export class PoViewComponent implements OnInit {
  [x: string]: any;
  PurchaseOrderNo:any;
  shimmerVisible: boolean;
  selectedSimpleItem = 'Two';
  simpleItems = [];
  Viewitemdetails:any=[];
  SupplierItems: any;
  listPurchaseOrderDetails:any=[];
  listItemDetails:any=[];
  activeAccordionIds: string[] = ['tab-1'];
  listPurchaseOrderNo:any=[];
  PoNumbersData:any=[] 
  constructor(private purchaseOrderService: PurchaseOrderService,private fb: FormBuilder) {
    this.form = this.fb.group({
      supplierNames: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.PurchaseOrderNo = localStorage.getItem('PurchaseOrderNo')
    this.PurchaseOrderGuid = localStorage.getItem('PurchaseOrderGuid')
    console.log("PurchaseOrderGuid",this.PurchaseOrderGuid)
    this.GetEditPOView();
    this.GetPurchaseOrderDetails()
  }

  GetEditPOView() {
    this.shimmerVisible = true;
    this.purchaseOrderService.GetEditPOView(this.PurchaseOrderNo).subscribe((data: any) => {
      this.listPurchaseOrderDetails = data.purchaseOrderDetails1 || [];
      this.listPurchaseOrderDetails = data.purchaseOrderDetails1.filter((obj: { IndentNo: any; PurchaseOrderNo: any }, index: any, self: any[]) =>
        index === self.findIndex((item) => (
          item.IndentNo === obj.IndentNo && item.PurchaseOrderNo === obj.PurchaseOrderNo
        ))
      );
      this.listItemDetails = data.POItems1 || [];
    },
    (err: any) => {
      this.globalService.stopSpinner();
    });
  }
  GetPurchaseOrderDetails() {
    
    this.shimmerVisible = true;
    this.purchaseOrderService.GetPurchaseOrderDetails(this.PurchaseOrderGuid).subscribe(data => {
      this.purchaseOrderDetails = data.purchaseOrderDetails;
      this.PurchaseOrderItemDetails = data.POItems.filter((obj: { IndentNo: any; ItemGuid: any }, index: any, self: any[]) =>
        index === self.findIndex((item) => (
          item.IndentNo === obj.IndentNo && item.ItemGuid === obj.ItemGuid
        ))
      );
      this.PurchaseViewDetails=this.purchaseOrderDetails
      //this.QuotationItemlist = data.oItemQuotations
      //this.listItemDetails=data.POItems
    },
      (err: HttpErrorResponse) => {
        this.shimmerVisible = false;
      })
  }

  handleCheckboxChange(event:any){ 
    this.allcheckbox=true
      this.addItemslist.value.forEach((element: any) => {
      if(event.target.checked==true){
        element.IsSelected=true;  
        this.isChecked=true;            
      }
      else {
        element.IsSelected=false;   
        this.isChecked=false;            
   
      }
    }
  )
}
purchasenumber(event: any) {
  const panel = event.panelId.replace('tab-', '') ;
  const array=parseInt(panel)-1
  const PurchaseOrderNo=this.listPurchaseOrderDetails[array].PurchaseOrderNo
  this.PoNumbersData = this.listItemDetails.filter((purchaseOrderNo: string) => purchaseOrderNo === PurchaseOrderNo);
  console.log(this.PoNumbersData)
}
}

