import { Location } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AllItemsService } from 'src/app/core/Services/all-items.service';
import { AuthenticationService } from 'src/app/core/Services/authentication.service';
import { SupplierService } from 'src/app/core/Services/supplier.service';

@Component({
  selector: 'app-view-item',
  templateUrl: './view-item.component.html',
  styleUrls: ['./view-item.component.scss']
})
export class ViewItemComponent implements OnInit {
  detailsTab: boolean = true;
  suppliersTab: boolean = false;
  quotationsTab: boolean = false;
  purchaseOrderTab: boolean = false;
  goodsReceiptNoteTab: boolean = false;
  siTab: boolean = false;
  indentsTab: boolean = false;
  activityTab: boolean = false;
  ItemGuid: any;
  itemIndentData: any = [];
  itemPurchaseData: any = [];
  itemQuotationData: any = [];
  itemGrntData: any = [];
  ItemData: any;
  itemSIDetails: any;
  alItemListData: any = [];
  Supplierslist: any = [];
  constructor(
    private allItemsService: AllItemsService,
    public route: ActivatedRoute,
    private location: Location,
    private supplierService: SupplierService,
    public authService: AuthenticationService) { }

  ngOnInit(): void {
    this.ItemGuid = this.route.snapshot.paramMap.get('ItemGuid') || '';
    this.getItemHistoryDetails()
    this.getItemDetails()
  }
  gotoTab(tab: any) {
    this.detailsTab = false;
    this.suppliersTab = false;
    this.quotationsTab = false;
    this.purchaseOrderTab = false;
    this.goodsReceiptNoteTab = false;
    this.indentsTab = false;
    this.siTab = false;
    this.activityTab = false;

    if (tab == 'details') {
      this.detailsTab = true;
    } else if (tab == 'suppliers') {
      this.suppliersTab = true;
    } else if (tab == 'quotations') {
      this.quotationsTab = true;
    } else if (tab == 'purchaseOrder') {
      this.purchaseOrderTab = true;
    } else if (tab == 'goodsReceiptNote') {
      this.goodsReceiptNoteTab = true;
    } else if (tab == 'indents') {
      this.indentsTab = true;
    } else if (tab == 'si') {
      this.siTab = true;
    } else if (tab == 'activity') {
      this.activityTab = true;
    }
  }

  getItemHistoryDetails() {
    let DepotmentGuid = this.authService.LoggedInUser.DEFAULTROLES.toLowerCase().includes('ADMIN'.toLowerCase()) && this.authService.LoggedInUser.LOCATIONSGUID == '00000000-0000-0000-0000-000000000000' ? '00000000-0000-0000-0000-000000000000' : this.authService.LoggedInUser.LOCATIONSGUID.split(",")

    this.allItemsService.getItemHistory(this.ItemGuid).subscribe((data) => {
      this.itemIndentData = data.Result.oGetItemIndent
      this.itemPurchaseData = data.Result.oGetItemPurchaseOrderDetails
      this.itemQuotationData = data.Result.oGetItemQuotations
      this.itemGrntData = data.Result.oItemGrnDetails
      if (DepotmentGuid == '00000000-0000-0000-0000-000000000000'){
        this.itemSIDetails = data.Result.oItemSIDetails
      }
      else{
        this.itemSIDetails=data.Result.oItemSIDetails.filter((item:any)=>item.FromLocationGuid==DepotmentGuid)
      }
      this.itemQuotationData = data.Result.oGetItemQuotations.filter((value: any, index: any, self: any) => {
        return index === self.findIndex((t: any) => (
          t.QuotationNo === value.QuotationNo
        ));
      })
      this.alItemListData = this.itemQuotationData.concat(data.Result.oGetItemIndent,
        data.Result.oGetItemPurchaseOrderDetails, data.Result.oItemGrnDetails, this.itemSIDetails)
      this.alItemListData = this.alItemListData.sort((a: any, b: any) => (a.CreatedDt));
      if (this.itemQuotationData.length > 0) {
        this.getSuppliers()
      }
    })

  }

  getSuppliers() {
    this.supplierService.GetAllSuppliers("", "", 'desc', -1, -1,"","").subscribe(data => {
      this.itemQuotationData.forEach((supplier: any) => {
        let supplierList = data.Result.GetAllSuppliers.filter((f: { SupplierGuid: any }) => f.SupplierGuid === supplier.SupplierGuid)
        this.Supplierslist.push(...supplierList)
      })
      this.Supplierslist = this.Supplierslist.sort((a: any, b: any) => a.CreatedDt?.trim().localeCompare(b.CreatedDt.trim()));
      this.Supplierslist = this.Supplierslist.filter((value: any, index: any, self: any) => {
        const firstIndex = self.findIndex((item: any) => item.SupplierGuid === value.SupplierGuid);
        return index === firstIndex;
      });

    },
      error => {
      });
  }






  getItemDetails() {
    this.allItemsService.getItemDetails(this.ItemGuid).subscribe((data) => {
      this.ItemData = data.Result
    })
  }


  /**
   * Type:(click) event
   * for goback to previous page
   */
  goBack() {
    this.location.back()
  }


}
