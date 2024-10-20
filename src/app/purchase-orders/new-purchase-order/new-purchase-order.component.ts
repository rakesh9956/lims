import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbDateStruct, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ColumnMode, DatatableComponent } from '@swimlane/ngx-datatable';
import { distinctUntilChanged, throttleTime } from 'rxjs';
import { AuthenticationService } from 'src/app/core/Services/authentication.service';
import { PurchaseOrderService } from 'src/app/core/Services/purchase-order.service';
@Component({
  selector: 'app-new-purchase-order',
  templateUrl: './new-purchase-order.component.html',
  styleUrls: ['./new-purchase-order.component.scss']
})
export class NewPurchaseOrderComponent implements OnInit {
  @ViewChild(DatatableComponent) table: DatatableComponent;
  rows: any[] = [];
  temp: any[] = [];
  loadingIndicator = true;
  reorderable = true;
  selectedDate: NgbDateStruct;
  ColumnMode = ColumnMode;
  comparingQuotes: boolean = false;
  CategoryDefaultsList: any = [];
  CentreDefaultsList: any = [];
  MachineDefaultsList: any = [];
  ManufactureDefaultsList: any = [];
  PODefaultsList: any = [];
  PurchaseSupplierNameList: any[] = [];
  StateList: any[] = [];
  CenterLocacityList: any = [];
  State: any = [];
  SupplierItems: any;
  SupplierDetails: any;
  SupplierItemsList: any
  SearchItems: any;
  StateDetailsList: any = []
  StateDetails: any
  purchaseOrderForm: FormGroup = {} as any;
  lstpurchaseOrderItems: FormArray = {} as any;
  DeliveryLocation: any = [];
  SelectedSupplierItemList: any = [];
  PurchaseOrderGuid: any;
  purchaseOrderDetails: any;
  PurchaseOrderItemDetails: any = [];
  FormChanged: boolean = false;
  isdisable: boolean;
  ItemsListTemp: any;
  constructor(private modalService: NgbModal,
    private fb: FormBuilder,
    private purchaseOrderService: PurchaseOrderService,
    public route: ActivatedRoute,
    private authservice: AuthenticationService,
    private router: Router) {
    this.fetch((data: any) => {
      this.temp = data;
      this.rows = data;
      // setTimeout(() => {
      //   this.loadingIndicator = false;
      // }, 1500);
    });
  }
  /**
  * Type : Angular hook 
  * this method is used for on page load functions
  * 
  */
  ngOnInit(): void {
    this.PurchaseOrderGuid = this.route.snapshot.paramMap.get('PurchaseOrderGuid') || '';
    this.initForms()
    this.GetPurchaseOrderPostDefaults();
    this.purchaseOrderForm.valueChanges.pipe(distinctUntilChanged(), throttleTime(500)).subscribe(values => {
      this.FormChanged = true;
    }
    );

  }
  /**
   * form initialization
   */
  initForms(): void {
    this.purchaseOrderForm = this.fb.group({
      PurchaseOrderGuid: [''],
      CategoryGuid: [null],
      VenderGuid: [null, [Validators.required]],
      VendorStateGuid: [null, [Validators.required]],
      VendorAddress: ['', [Validators.required]],
      VendorGSTIN: ['', [Validators.required]],
      DeliveryStateGuid: [null, [Validators.required]],
      DeliveryCenterGuid: [null, [Validators.required]],
      DeliveryLocationGuid: [null, [Validators.required]],
      PaymentTerm: [null],
      DeliveryTerm: [null],
      NFANo: [''],
      TermsandConditions: [''],
      lstpurchaseOrderItems: this.fb.array([
        this.fb.group({
          ItemName: [null, [Validators.required]],
          ItemGuid: ['', [Validators.required]],
          ManufactureName: [''],
          MachineName: [''],
          POTypeGuid: [null, [Validators.required]],
          POSize: ['', [Validators.required]],
          CategoryTypeName: ['', [Validators.required]],
          HSNCode: ['', [Validators.required]],
          PurchasedUnit: ['', Validators.required],
          ItemRate: ['', Validators.required],
          DiscountPercentage: ['', Validators.required],
          IGSTPer: ['', Validators.required],
          GSTPer: [''],
          SGSTPer: ['', Validators.required],
          DiscountAmount: ['', Validators.required],
          FinalPrice: [''],
          FreeQty: [''],
          CGSTPer: ['', Validators.required],
          ConsumptionUnit: ['', Validators.required],
          OrderQuantity: [null, [Validators.required]],
          TotalItemPrice: [''],
          TotalGSTAmount: ['', Validators.required],
          NetAmount: ['', Validators.required],
          TotalAmount: ['', Validators.required]
        })
      ])
    });
  }

  get addItemslist(): FormArray {
    return this.purchaseOrderForm.get('lstpurchaseOrderItems') as FormArray;

  }
  /**
   * this event is used to add the form array
   */
  AddItems() {
    this.addItemslist.push(this.fb.group({
      ItemName: ['', [Validators.required]],
      ItemGuid: ['', [Validators.required]],
      ManufactureName: ['', [Validators.required]],
      MachineName: [''],
      POTypeGuid: [null, [Validators.required]],
      POSize: ['', [Validators.required]],
      CategoryTypeName: ['', [Validators.required]],
      HSNCode: ['', [Validators.required]],
      PurchasedUnit: ['', Validators.required],
      ItemRate: ['', Validators.required],
      IGSTPer: ['', Validators.required],
      CGSTPer: ['', Validators.required],
      SGSTPer: ['', Validators.required],
      DiscountAmount: ['', Validators.required],
      FinalPrice: [''],
      FreeQty: [''],
      DiscountPercentage: ['', Validators.required],
      ConsumptionUnit: ['', Validators.required],
      OrderQuantity: [null, [Validators.required]],
      TotalItemPrice: [''],
      TotalGSTAmount: ['', Validators.required],
      NetAmount: ['', Validators.required],
      TotalAmount: ['', Validators.required]
    }), { emitEvent: true });
    this.FormChanged = false
    if (this.SupplierItems) {
      this.SupplierItems = this.ItemsListTemp
    }
    // this.ItemsListTemp = this.ItemsListTemp?.filter((Items: any) => Items.ItemGuid != this.SelectedSupplierItemList?.ItemGuid?this.SelectedSupplierItemList.ItemGuid:'');
  }
  /**
   * 
   * @param index this event is used for the remove the array
   */
  removeItems(index: any) {
    this.addItemslist.removeAt(index)
  }
  fetch(cb: any) {
    const req = new XMLHttpRequest();
    req.open('GET', `assets/data/all-items.json`);

    req.onload = () => {
      cb(JSON.parse(req.response));
    };

    req.send();
  }
  openBasicModal(content: TemplateRef<any>) {
    this.modalService.open(content, { size: 'md' }).result.then((result) => {
      console.log("Modal closed" + result);
    }).catch((res) => { });
  }
  /**
   * This method is used to get the default data of purchase order page 
   */
  GetPurchaseOrderPostDefaults() {
    let DepotmentGuid =this.authservice.LoggedInUser.DEFAULTROLES.toLowerCase().includes('ADMIN'.toLowerCase()) && this.authservice.LoggedInUser.LOCATIONSGUID=='00000000-0000-0000-0000-000000000000' ?'00000000-0000-0000-0000-000000000000': this.authservice.LoggedInUser.LOCATIONSGUID.split(",")
    this.purchaseOrderService.GetPurchaseOrderPostDefaults(DepotmentGuid).subscribe(data => {
      this.CategoryDefaultsList = data.Result.LstCategoryType;
      this.CentreDefaultsList = data.Result.LstCentreType;
      this.MachineDefaultsList = data.Result.LstMachineType;
      this.ManufactureDefaultsList = data.Result.LstManufactureType;
      this.PODefaultsList = data.Result.LstPOType;
      this.PurchaseSupplierNameList = data.Result.LstPurchaseSupplierType;
      this.StateList = data.Result.LstStateType;
      this.CenterLocacityList = data.Result.LstCenterLocationType
      this.StateDetailsList = data.Result.LstStateDetails
      if (this.PurchaseOrderGuid != '') {
        this.GetPurchaseOrderDetails()
      }
    },
      (err: HttpErrorResponse) => {
      })
  }
  /**
   * This method is used for Save the purchase order details
   */
  SaveSupplierDetails(): void {
    this.purchaseOrderService.SavePurchaseOrderDetails(this.purchaseOrderForm.value).subscribe(
      (saveitemDetails) => {
        this.router.navigateByUrl('/purchase-orders');
      },
      (err) => {
      });
  }
  /**
   * This method is used for Get the Supplier items by passing supplier guid
   */
  GetSupplierItems(SupplierGuid: any) {
    this.purchaseOrderService.GetSupplierItemsByGuid(SupplierGuid).subscribe(data => {
      this.SupplierItems = data.Result
      this.ItemsListTemp = data.Result
    },
      (err: HttpErrorResponse) => {
      })
  }
  /**
   * 
   * @param event this method is used for Get the selected supplier details 
   */
  GetSupplierDetails(event: any): any {
    this.SupplierDetails = this.PurchaseSupplierNameList.find((s: any) => s.SupplierGuid === event.SupplierGuid);
    this.addItemslist.clear();
    this.AddItems();
    // Update form values with supplier details
    this.purchaseOrderForm.patchValue({
      VendorStateGuid: this.SupplierDetails.StateGuid,
      VendorGSTIN: this.SupplierDetails.GSTNo,
      VendorAddress: this.SupplierDetails.HouseNo += " , " + this.SupplierDetails.SupplierAddress
    }, { emitEvent: true });
    this.FormChanged = true
    this.GetSupplierItems(this.SupplierDetails.SupplierGuid)
  }
  /**
   * 
   * @param ItemSearch this event is used for search the items
   */
  search(ItemSearch: any, i: any): void {
    this.SearchItems = ItemSearch.target.value;
    this.SearchItems = this.SearchItems?.toLowerCase();
    if (this.SearchItems !== "") {
      this.SupplierItemsList = this.SearchItems.toLowerCase();
      let SearchingItems = this.SupplierItems.filter((item: any) => {
        return item.ItemName.toLowerCase().includes(this.SearchItems.toLowerCase());
      });
      this.SupplierItems = SearchingItems
    }

    else {
      this.SupplierItems = this.ItemsListTemp

    }
  }
  /**
   * 
   * @param stateGuid this event is used for get the selected state details
   */
  GetStateDetails(stateGuid: any) {
    this.StateDetails = this.StateDetailsList.filter((s: any) => s.StateGuid === stateGuid)
    if (this.PurchaseOrderGuid != '') {
      this.DeliveryLocation = this.CenterLocacityList.filter((s: any) => s.CenterGuid == this.purchaseOrderDetails.CenterGuid)
    }
  }
  /**
   * this event is used for get the seleced center details
   */
  GetDeliveryCenter() {
    this.DeliveryLocation = this.CenterLocacityList.filter((s: any) => s.CenterGuid == this.purchaseOrderForm.value.DeliveryCenterGuid)
  }
  /**
   * 
   * @param data this event is used for patch the selected item details
   * @param index 
   */
  OnSelectItem(data: any, index: any) {
    this.SelectedSupplierItemList = data
    const itemIndex = this.addItemslist.value.findIndex((item: any) => item.ItemGuid === data.ItemGuid);
    if (itemIndex >= 0 && itemIndex != index) {
      this.isdisable = true;/*  */
      const ItemDetails = this.addItemslist.at(index);
      ItemDetails.patchValue({
        ItemName: ''
      });
    }
    else {
      const ItemDetails = this.addItemslist.at(index);
      ItemDetails.patchValue({
        OrderQuantity: '',
        TotalItemPrice: '',
        TotalGSTAmount: '',
        NetAmount: '',
        TotalAmount: ''
      })
      ItemDetails.patchValue({
        ItemName: data.ItemName,
        ItemGuid: data.ItemGuid,
        ManufactureName: data.ManufactureName,
        MachineName: data.MachineName,
        POSize: data.PackSize,
        CategoryTypeName: data.CategoryTypeName,
        HSNCode: data.HSNCode,
        PurchasedUnit: data.PurchasedUnit,
        ItemRate: data.Rate,
        IGSTPer: data.IGSTPer,
        CGSTPer: data.CGSTPer,
        DiscountAmount: data.DiscountAmt,
        FinalPrice: data.FinalPrice,
        FreeQty: data.FreeQty,
        SGSTPer: data.SGSTPer,
        DiscountPercentage: data.DiscountPer,
        ConsumptionUnit: data.ConsumptionUnit
      }, { emitEvent: true })
      this.FormChanged = true
      this.isdisable = false;
    }
  }
  ItemPricecalculation(ItemGuid: any, index: any) {
    const itemDetails = this.PurchaseOrderItemDetails[index];
    if (itemDetails?.ItemGuid === ItemGuid) {
      this.SelectedSupplierItemList = this.PurchaseOrderItemDetails[index];
    }
    if (this.addItemslist.value[index].OrderQuantity != null) {
      let itemquantity = this.purchaseOrderForm.get('lstpurchaseOrderItems')?.value[index].OrderQuantity
      let ItemPrice = Number(this.SelectedSupplierItemList.Rate)
      let cgstamount = (this.SelectedSupplierItemList.CGSTPer * ItemPrice) / 100
      let Igstamount = (this.SelectedSupplierItemList.IGSTPer * ItemPrice) / 100
      let gstamount = (this.SelectedSupplierItemList.SGSTPer * ItemPrice) / 100
      let totalamount = (cgstamount + Igstamount + gstamount + ItemPrice)
      let totalgstamount = (cgstamount + Igstamount + gstamount)
      let discountAmount = (ItemPrice) * (Number(this.SelectedSupplierItemList.DiscountPer) / 100);
      let NetAmount = (totalamount * itemquantity) - (discountAmount)
      let amount = (totalamount) - (discountAmount)
      const ItemDetails = this.addItemslist.at(index);
      ItemDetails.patchValue({
        TotalItemPrice: totalamount,
        TotalGSTAmount: totalgstamount,
        NetAmount: amount,
        TotalAmount: NetAmount
      }, { emitEvent: true })
    }
    else {
      const ItemDetails = this.addItemslist.at(index);
      ItemDetails.patchValue({
        TotalItemPrice: '',
        NetAmount: '',
        TotalAmount: ''
      }, { emitEvent: true })
    }
  }
  /**
   * This click event is used to reset the Form
   */
  FormReset() {
    this.purchaseOrderForm.reset()
    this.addItemslist.clear();
    this.AddItems();
  }
  addOtherPaymentTerm(event: any) {
    this.purchaseOrderForm.patchValue({
      PaymentTerm: event.target.value
    }, { emitEvent: true })
  }
  addOtherDeliveryTerm(event: any) {
    this.purchaseOrderForm.patchValue({
      DeliveryTerm: event.target.value
    }, { emitEvent: true })
  }
  GetPurchaseOrderDetails() {
    this.purchaseOrderService.GetPurchaseOrderDetails(this.PurchaseOrderGuid).subscribe(data => {
      this.purchaseOrderDetails = data.purchaseOrderDetails;
      this.PurchaseOrderItemDetails = data.POItems
      this.GetSelectedPurchaseOrder()

    },
      (err: HttpErrorResponse) => {
      })
  }
  GetSelectedPurchaseOrder() {
    this.addItemslist.clear()
    this.GetStateDetails(this.purchaseOrderDetails.LocationStateGuid)
    this.GetSupplierItems(this.purchaseOrderDetails.SupplierGuid)
    this.purchaseOrderForm.patchValue({
      PurchaseOrderGuid: this.purchaseOrderDetails.PurchaseOrderGuid,
      CategoryGuid: this.purchaseOrderDetails.CategoryGuid,
      VenderGuid: this.purchaseOrderDetails.SupplierGuid,
      VendorStateGuid: this.purchaseOrderDetails.SupplierStateGuid,
      VendorAddress: this.purchaseOrderDetails.Address,
      VendorGSTIN: this.purchaseOrderDetails.GSTIN,
      DeliveryStateGuid: this.purchaseOrderDetails.LocationStateGuid,
      DeliveryCenterGuid: this.purchaseOrderDetails.CenterGuid,
      DeliveryLocationGuid: this.purchaseOrderDetails.LocationGuid,
      PaymentTerm: this.purchaseOrderDetails.PaymentTermCondition,
      NFANo: this.purchaseOrderDetails.NFANo,
      TermsandConditions: this.purchaseOrderDetails.TermandCondition,
      DeliveryTerm: this.purchaseOrderDetails.PaymentDeliveryTerm
    }, { emitEvent: true })
    this.PurchaseOrderItemDetails.forEach((element: any) => {
      this.addItemslist.push(this.fb.group({
        ItemName: [element.ItemName?element.ItemName:'',Validators.required],
        ItemGuid: element.ItemGuid,
        ManufactureName: element.ManufactureName,
        MachineName: element.MachineName,
        POTypeGuid: element.POTypeGuid,
        POSize: element.PackSize,
        CategoryTypeName: '',
        HSNCode: element.HSNCode,
        PurchasedUnit: element.PurchasedUnit,
        ItemRate: element.Rate,
        DiscountPercentage: element.DiscountPer,
        IGSTPer: element.IGSTPer,
        GSTPer: '',
        SGSTPer: element.SGSTPer,
        DiscountAmount: element.DiscountAmt,
        FinalPrice: '',
        FreeQty: element.FreeQty,
        CGSTPer: element.CGSTPer,
        ConsumptionUnit: element.ConsumptionUnit,
        OrderQuantity: [element.OrderedQty ? element.OrderedQty : '', Validators.required] ,
        TotalItemPrice: '',
        TotalGSTAmount: element.TaxAmount,
        NetAmount: element.NetAmount,
        TotalAmount: element.TotalAmount
      }));
    })
    this.FormChanged = false;
  }
}