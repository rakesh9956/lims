import { Component, TemplateRef, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbDateParserFormatter, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectComponent } from '@ng-select/ng-select';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { distinctUntilChanged, throttleTime } from 'rxjs';
import { AuthenticationService } from 'src/app/core/Services/authentication.service';
import { GlobalService } from 'src/app/core/Services/global.service';
import { IndentService } from 'src/app/core/Services/indent.service';
import { CustomDateParserFormatter } from 'src/app/core/Services/ngbdate-format.service';

@Component({
  selector: 'app-new-request',
  templateUrl: './new-request.component.html',
  styleUrls: ['./new-request.component.scss'],
  providers: [
    { provide: NgbDateParserFormatter, useClass: CustomDateParserFormatter },
  ],
})

export class NewRequestComponent {
  @ViewChild(DatatableComponent) table: DatatableComponent;
  @ViewChild('Request', { static: true }) requestModal!: TemplateRef<any>;
  @ViewChild('DispatchRequest', { static: true }) DispatchRequestModal!: TemplateRef<any>;
  @ViewChild('PIRequest', { static: true }) PIRequest!: TemplateRef<any>;
  shimmerVisible: boolean;
  SiItemCount : number = 0;
  isDispatched : boolean = false;
  reorderable = true;
  indentForm = {} as any;
  lstCurrentLocation: any;
  ItemNameList: string = "";;
  lstRequestLocation: any = [];
  lstCategoryType: any = [];
  lstIndentLocation: any = [];
  lstLocationsstore: any = []
  SearchItems: any;
  lstLocationItems: any = []
  ItemsList: any;
  lstIndentItem: FormArray = {} as any;
  SlectedLocationItemList: any;
  IndentItemDetails: any = [];
  IndentGuid: any = [];
  SelectedItems: any[] = []
  isdisable: boolean = false;
  LocationItems: any = [];
  FormChanged: boolean;
  newDate: any;
  UserGuid: any;
  SIApprovedDetails: any = [];
  SelectedSIItems: any = [];
  SelectedSIItem: any;
  siRoles: any;
  @ViewChild('ngSelectComponent') ngSelectComponent: NgSelectComponent;
  SIApprovedDetail: any;
  roles: any;
  lsttLocationsstore: any;
  Allitems: any;
  newData: any = [];
  LocationItemsForPI: any;
  IndentItemQuotations: any;
  IndentType: any = [];
  SpinnerCheck: boolean = false;
  ReqQty : any;
  reasonIndex :any;
  /**
    * Type:constructor
    * this is used to intialze the imported services
    * @param fb 
    * @param location 
    * @param indentService 
    * @param globalService 
    * 
    */

  constructor(
    private fb: FormBuilder,
    private indentService: IndentService,
    private globalservice: GlobalService,
    public route: ActivatedRoute,
    private router: Router,
    public authservice: AuthenticationService,
    private modalService: NgbModal) {
    this.fetch((data: any) => {
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
    this.UserGuid = this.authservice.LoggedInUser.UserGuid
    this.IndentGuid = this.route.snapshot.paramMap.get('IndentGuid') || '';
    if(this.IndentGuid != '' ){
      localStorage.setItem("Type", "Indents");;
    }
    this.newDate = { day: new Date().getDate(), month: new Date().getMonth() + 1, year: new Date().getFullYear() };
    this.getCategoryType();
    this.getIndentLocation();
    this.initForms();
    this.indentForm.valueChanges.pipe(distinctUntilChanged(), throttleTime(500)).subscribe((values: any) => {
      this.FormChanged = true;

    }
    );
    this.roles = this.authservice.LoggedInUser.PIROLES
    this.siRoles = this.authservice.LoggedInUser.SIROLES
    console.log(this.authservice.LoggedInUser)
  }
  /**
        * Type : initForm 
       * Form Initialization
       */
  initForms(): void {
    this.indentForm = this.fb.group({
      IndentGuid: [''],
      IndentType: ['', [Validators.required]],
      CurrentLocationGuid: [null, [Validators.required]],
      RequestLocationGuid: [null, [Validators.required]],
      Category: [''],
      categoryType: [null],
      Remark: ['', [Validators.required]],
      UserGuid: this.UserGuid,
      lstIndentItem: this.fb.array([
        this.fb.group({
          ItemName: [null, [Validators.required]],
          ItemGuid: [null, [Validators.required]],
          ManufactureName: [null],
          MachineName: [null],
          HSNCode: [''],
          ItemRate: [''],
          ConsumptionUnit: [''],
          QtyNo: [null, [Validators.required]],
          Reason: [null],
          MajorUnitName: [''],
          LabRequiredDate: [''],
          IsDeleted: [false],
          IndentId: [''],
          POSize: [null],
          InHandQuantity: [''],
          InPOQuantity: [''],
          VendorId: [''],
          SupplierName: [null],
          VendorStateId: [''],
          FromRights: [''],
          NetAmount: [''],
          QuotationGuid: [''],
          RemainingQtyforSI: [''],
          SGSTPer: [''],
          CGSTPer: [''],
          IGSTPer: [''],
          DiscountPer: [''],
          Unitprice: [''],
          DuplicateItemCheck: [],
          IndentNo: [''],
          LabDate: [null, [Validators.required, Validators.pattern(/^(\d{4})-(\d{2})-(\d{2})$/)]],
          CatlogNo: [''],
          QuotationNo: [null],
          FromActiveSI:[false]
        })
      ])
    });
  }
  /**
        * Type : event
       * This event is used for add the form array when we are click on add item
       */
  get addItemslist(): FormArray<any> {
    return this.indentForm.get('lstIndentItem') as FormArray;

  }
  /**
   * Type:Click event
    * this event is used to add the form array
    */
  AddItems() {
    const newItemGroup = this.fb.group({
      ItemName: [null, [Validators.required]],
      ItemGuid: [null, [Validators.required]],
      ManufactureName: [null],
      MachineName: [null],
      HSNCode: [''],
      CatlogNo: [''],
      ItemRate: [''],
      ConsumptionUnit: [''],
      QtyNo: [null, [Validators.required]],
      Reason: [null], 
      MajorUnitName: [''],
      LabRequiredDate: [''],
      IsDeleted: [false],
      IndentId: [''],
      POSize: [null],
      InHandQuantity: [''],
      InPOQuantity: [''],
      VendorId: [''],
      SupplierName: [null],
      VendorStateId: [''],
      FromRights: [''],
      NetAmount: [''],
      QuotationGuid: [''],
      RemainingQtyforSI: [''],
      SGSTPer: [''],
      CGSTPer: [''],
      IGSTPer: [''],
      DiscountPer: [''],
      Unitprice: [''],
      DuplicateItemCheck: [''],
      IndentNo: [''],
      LabDate: [null, [Validators.required]],
      IsReason : [false],
      ReqQuantity : [''],
      FromActiveSI:[false]
    });
    this.addItemslist.push(newItemGroup);
  }
  openBackDropCustomClass(content: TemplateRef<any>) {
    this.modalService.open(content, { backdrop: 'static', keyboard: false, size: 'xl' });
  }
  /**
   * 
   * @param index 
   * Type:Click event
   * This event is used for remove the form array
   */
  removeItems(index: any) {
    if (this.SelectedSIItem) {
      this.SelectedSIItem.forEach((element: any, indexValue: any) => {
        if (element.ItemGuid == this.addItemslist.value[index].ItemGuid && element.IndentNo == this.addItemslist.value[index].IndentNo) {
          this.SelectedSIItem.splice(indexValue, 1);
          this.ngSelectComponent.writeValue(this.SelectedSIItem);
        }

      });
      this.SelectedSIItem.forEach((element: any, indexValue: any) => {
        if (element.ItemGuid == this.newData[index]?.ItemGuid && element.IndentNo == this.newData[index]?.IndentNo) {
          this.newData.splice(indexValue, 1);
          this.ngSelectComponent.writeValue(this.SelectedSIItem);
        }

      });
    }
    if (this.IndentGuid != '') {
      this.SelectedItems.map((element: any) => {
        if (element.ItemGuid == this.addItemslist.value[index].ItemGuid) {
          element.IsDeleted = true
        }
      });
    }
    this.addItemslist.removeAt(index)
  }
  /***
   * This method is used for get the default indent location 
   */
  getIndentLocation() {
    // this.globalservice.startSpinner();
    this.shimmerVisible = true;
    let DepotmentGuid = this.authservice.LoggedInUser.DEFAULTROLES.toLowerCase().includes('ADMIN'.toLowerCase()) && this.authservice.LoggedInUser.LOCATIONSGUID == '00000000-0000-0000-0000-000000000000' ? '00000000-0000-0000-0000-000000000000' : this.authservice.LoggedInUser.LOCATIONSGUID.toLowerCase().split(",");
    this.indentService.GetIndentLocation().subscribe(
      (data) => {
        this.lstCurrentLocation = data.getIndentTypeResponse
        this.lstRequestLocation = data.getIndentLocationResponse
        this.lstLocationsstore = data.getIndentLocationsStores
        if (DepotmentGuid == '00000000-0000-0000-0000-000000000000') {
          this.lstIndentLocation = data.getIndentLocationResponse
        }
        else {
          let OriginalLstIndentLocation = data.getIndentLocationResponse
          const filteredLocations = OriginalLstIndentLocation.filter((LocationData: any) =>
            DepotmentGuid.includes(LocationData.LocationGuid)
          );
          this.lstIndentLocation = filteredLocations;
        }
        if (this.IndentGuid) {
          this.GetIndentItemDeatilsByGuid();
        }
        else{
          this.shimmerVisible = false;
        }
        // this.globalservice.stopSpinner();      
      },
      (err) => {
        this.globalservice.stopSpinner();
        this.shimmerVisible = false;
      });
  }
  GetApprovedSIForPI(LocationGuid?:string) {
    if (!this.IndentGuid) {
     // this.shimmerVisible = true;
    }
    this.indentService.GetApprovedSIForPI(LocationGuid).subscribe(
      (Result: any) => {
        this.SIApprovedDetails = Result
        this.SIApprovedDetail = Result.filter((obj: { IndentNo: any; ItemGuid: any }, index: any, self: any[]) =>
          index === self.findIndex((item) => (
            item.IndentNo === obj.IndentNo
          ))
        );
      //   this.SelectedSIItem = this.SIApprovedDetails.filter((obj: { itemguid: any }) =>
      //   this.IndentItemDetails.some((x: { itemguid: any; }) => x.itemguid == obj.itemguid)
      // );
          //  this.shimmerVisible = false;
      }, (err) => {
        this.shimmerVisible = false;
      })

  }
  /**
   * This method is used for get the category type while initially page lodaining
   */
  getCategoryType() {
    this.indentService.getCategory().subscribe(
      (Data: { Result: any; }) => {
        this.lstCategoryType = Data.Result
      })
  }
  /**
   * 
   * @param FromLocationGuid
   * This event is used for get the Indent items when Select the Current Location by passing location guid
   */
  Getindentitems() {
    this.lstLocationItems = []
    this.indentService.Getindentitems(this.authservice.LoggedInUser.B2BTYPE).subscribe(
      (Data) => {
        this.lstLocationItems = Data.oGetIndentitems
        this.LocationItems = Data.oGetIndentitems
        this.LocationItemsForPI = Data.oGetIndentitems
        this.lstLocationItems = Data.oGetIndentitems.filter((value: any, index: any, self: any) => {
          const firstIndex = self.findIndex((item: any) => item.ItemGuid === value.ItemGuid);
          return index === firstIndex;
        });
        if (this.IndentGuid) {
          this.GetApprovedSIForPI()
        }
      })
  }
  /**'
   * Type:Input event
   * This input event is used for search the items
   */
  search(ItemSearch: any, index: any): void {
    this.SearchItems = ItemSearch.target.value;
    this.SearchItems = this.SearchItems?.toLowerCase();
    if (this.indentForm.value.IndentType == 'PI') {
      if (this.SearchItems !== "") {
        let s1 = this.lstLocationItems?.filter((item: any) => {
          return item.ItemName.toLowerCase().includes(this.SearchItems.toLowerCase()) || item.CatalogNo.toLowerCase().includes(this.SearchItems.toLowerCase());
        });
        this.ItemsList = s1
      }
      else {
        this.addItemslist.at(index).reset();
        let date = this.addItemslist.at(index)
        if (this.IndentGuid) {
          date.patchValue({
            IndentId: this.SelectedItems[index]?.IndentId
          })
        }
        this.isdisable = false
        this.ItemsList = this.LocationItems
      }
    }
    else {
      if (this.SearchItems !== "") {
        let s1 = this.lstLocationItems?.filter((item: any) => {
          return item.ItemName.toLowerCase().includes(this.SearchItems.toLowerCase()) || item.CatalogNo.toLowerCase().includes(this.SearchItems.toLowerCase());
        });
        this.ItemsList = s1
      }
      else {
        this.addItemslist.at(index).reset();
        let date = this.addItemslist.at(index)
        if (this.IndentGuid) {
          date.patchValue({
            IndentId: this.SelectedItems[index]?.IndentId
          })
        }
        this.isdisable = false
        this.ItemsList = this.LocationItems
      }
    }

  }
    /**
   * 
   * @param FromLocationGuid
   *
   */
    GetQuantityOnLocationAndItem(CurrentLocationGuid : any,ItemGuid : any,index : any  , type : any = null) {
      this.reasonIndex=index
      this.indentService.GetQuantityOnLocationAndItem(CurrentLocationGuid,ItemGuid).subscribe(
        (Data) => {
           this.ReqQty = Data.Result[0]?.ReqQty || 0
           const ReceiveByUserName = Data.Result[0]?.ReceiveByUserName || null
           let ConsumeQty=Data.Result[0]?.ConsumeQty || 0
           let name = this.addItemslist.at(this.reasonIndex);
           name.patchValue({ ReqQuantity: this.ReqQty });
           if(this.ReqQty>0 && !this.indentForm.get('lstIndentItem')?.value[index].DuplicateItemCheck && ConsumeQty == 0 && type){
            if(index == 0){
              this.ItemNameList += type + " " ;
            }else{
              this.ItemNameList = this.ItemNameList + ", "+ type  ;
            }
            this.isDispatched = true;
           }
           if(this.ReqQty>0 && !this.indentForm.get('lstIndentItem')?.value[index].DuplicateItemCheck && ConsumeQty == 0 && ReceiveByUserName != null && type === null){
            this.openBasicModal();
          }
           if(this.ReqQty>0 && !this.indentForm.get('lstIndentItem')?.value[index].DuplicateItemCheck && ConsumeQty == 0 && ReceiveByUserName == null && type === null){
            this.openDispatchRequestBasicModal();
          }

          if(this.ItemNameList != '' && this.SiItemCount == index && this.isDispatched == true){
            this.PIRequestBasicModal();
          }
        })
    }
    openBasicModal() {
      this.modalService.open(this.requestModal, {  backdrop: 'static', keyboard: false,size: 'md' }).result.then((result: any) => {
        console.log("Modal closed" + result);
      }).catch((res: any) => { });
    }
    openDispatchRequestBasicModal() {
      this.modalService.open(this.DispatchRequestModal, {  backdrop: 'static', keyboard: false,size: 'md' }).result.then((result: any) => {
        console.log("Modal closed" + result);
      }).catch((res: any) => { });
    }
    PIRequestBasicModal() {
      this.modalService.open(this.PIRequest, {  backdrop: 'static', keyboard: false,size: 'md' }).result.then((result: any) => {
        console.log("Modal closed" + result);
      }).catch((res: any) => { });
    }
    resonClick() {
      const lstIndentItem = this.indentForm.get('lstIndentItem') as FormArray;
      
      lstIndentItem.controls.forEach((control: AbstractControl, index: number) => {
        if (index === this.reasonIndex) {
          if (this.indentForm.value.IndentType === 'SI') {
            control.get('Reason')?.setValidators([Validators.required]);
            control.get('Reason')?.updateValueAndValidity();
          } else {
            control.get('Reason')?.clearValidators();
            control.get('Reason')?.updateValueAndValidity();
          }
        }
      });
      let name = this.addItemslist.at(this.reasonIndex);
      name.patchValue({ IsReason: true });
    }
    
  /**
   * 
   * @param event 
   * @param index 
   * Type:(click) event 
   * This event is used for patch the item details when selecting the item 
   */
  OnSelectedItem(event: any, index: any) {
    this.SlectedLocationItemList = event
   
    const itemIndex = this.addItemslist.value.findIndex((item: any) => item.ItemGuid === event.ItemGuid);
    if (itemIndex >= 0 && itemIndex != index) {
      const itemControl = this.addItemslist.at(index);
      itemControl.patchValue({
        ItemName: '',
        ItemGuid: ''
      });
      this.addItemslist.value[index].DuplicateItemCheck = true
    }

    else {
      // if(this.indentForm.value.IndentType=='SI' ){
        this. GetQuantityOnLocationAndItem(this.indentForm.value.CurrentLocationGuid,event.ItemGuid,index) 
      //}
      const ItemDetails = this.addItemslist.at(index);
      ItemDetails.patchValue({
        ItemName: event.ItemName,
        ItemGuid: event.ItemGuid,
        ManufactureName: event.Manufacturer,
        MachineName: event.Machine,
        POSize: event.PackSize,
        HSNCode: event.HSNCode,
        ItemRate: event.Rate,
        OrderQuantity: event.Qty,
        MajorUnitName: event.MajorUnitName,
        InHandQuantity: this.authservice.LoggedInUser.B2BTYPE==true||this.authservice.LoggedInUser.B2BTYPE=='true'?event.ApprovedQty:event.InNewQty,
        InPOQuantity: event.ApprovedQty,
        VendorId: event.VendorId,
        SupplierName: event.SupplierName,
        VendorStateId: event.VendorStateId,
        FromRights: event.FromRights,
        QuotationGuid: event.QuatationGuid,
        IsDeleted: false,
        SGSTPer: event.SGSTPer,
        CGSTPer: event.CGSTPer,
        IGSTPer: event.IGSTPer,
        DiscountPer: event.DiscountPer,
        Unitprice: event.UnitPrice,
        CatlogNo: event.CatalogNo
      }, { emitEvent: true })
      this.isdisable = false;

    }


  }

  fetch(cb: any) {
    const req = new XMLHttpRequest();
    req.open('GET', `assets/data/all-items.json`);

    req.onload = () => {
      cb(JSON.parse(req.response));
    };

    req.send();
  }
  /**
   * 
   * @param event 
   * This method is used for patch the Location details when selecting the current location 
   */

  OnLocationSelected(LocationFrom?: any) {
    this.addItemslist.clear()
    this.AddItems()
    this.SelectedSIItem = null
    this.indentForm.value.IndentType=='PI'?this.GetApprovedSIForPI(this.indentForm.value.RequestLocationGuid):''
    // this.lstRequestLocation = this.lstIndentLocation.filter((x: { LocationGuid: any; }) => x.LocationGuid !== this.indentForm.value.CurrentLocationGuid)
    // this.Getindentitems(this.indentForm.value.RequestLocationGuid)
  }

  /**
   * Type:(click) 
   * This event is used for Save the Indent details.
   */
  SaveIndentDetails() {
    // this.globalservice.startSpinner();
    this.shimmerVisible = true;
    if (this.IndentGuid != '') {
      this.SelectedItems = this.SelectedItems.filter((d: any) => d.IsDeleted == true)
      this.addItemslist.value.push(...this.SelectedItems)
      this.SelectedItems.forEach(ec => {
        this.addItemslist.push(this.fb.group({
          ItemName: ec.ItemName,
          ItemGuid: ec.ItemGuid,
          ManufactureName: ec.ManufactureName,
          MachineName: ec.MachineName,
          HSNCode: ec.HSNCode,
          ItemRate: ec.ItemRate,
          ConsumptionUnit: ec.ConsumptionUnit,
          QtyNo: ec.QtyNo,
          Reason : ec.Reason?.trim(),
          MajorUnitName: ec.MajorUnitName,
          LabRequiredDate: ec.LabRequiredDate,
          IsDeleted: ec.IsDeleted,
          IndentId: ec.IndentId,
          POSize: ec.POSize,
          InHandQuantity: ec.InHandQuantity,
          InPOQuantity: ec.InPOQuantity,
          VendorId: ec.VendorId,
          SupplierName: ec.SupplierName,
          VendorStateId: ec.VendorStateId,
          FromRights: ec.FromRights,
          NetAmount: ec.NetAmount,
          QuotationGuid: ec.QuotationGuid,
          //  LabDate:ec.LabRequiredDate
        }));
      })
    }
    this.addItemslist.value.forEach((element: any, index: any) => {
      const date = this.addItemslist.at(index);
      date.patchValue({
        LabRequiredDate: element.IndentId && (element.LabDate == element.LabRequiredDate || !element.LabDate) ? element.LabRequiredDate.year + "-" + element.LabRequiredDate.month + "-" + element.LabRequiredDate.day :
          element.LabDate.year + "-" + element.LabDate.month + "-" + element.LabDate.day
      });
    });
    if(this.authservice.LoggedInUser.B2BTYPE==true || this.authservice.LoggedInUser.B2BTYPE=='true' && this.IndentGuid==''){
      this.indentForm.patchValue({
        IndentType:'B2B'+this.indentForm.value.IndentType
      })
    }
    this.indentService.SaveIndentDetails(this.indentForm.value).subscribe(
      (saveitemDetails: any) => {
        // this.globalservice.stopSpinner();
        this.shimmerVisible = false;
        this.router.navigateByUrl('/requests');
      },
      (err: any) => {
        // this.globalservice.stopSpinner();
        this.shimmerVisible = false;
      });
  }
  /**
   * 
   * @param index 
   * @param ItemGuid 
   * Type:Input event
   * This event is used for caluclate the rate when enter the quantity
   */
  ItemQuantityCalculation(index: any, ItemGuid: any) {
    let itemquantity = this.indentForm.get('lstIndentItem')?.value[index].QtyNo
    let UnitPrice = (this.addItemslist.value[index].Unitprice)
    let TotalAmount = Number(UnitPrice) * itemquantity
    const ItemDetails = this.addItemslist.at(index);
    ItemDetails.patchValue({
      NetAmount: TotalAmount
    }, { emitEvent: true })
    if (itemquantity > this.addItemslist.value[index].InHandQuantity) {
      ItemDetails.patchValue({
        NetAmount: TotalAmount,
        RemainingQtyforSI: (itemquantity) - (this.addItemslist.value[index].InHandQuantity)
      }, { emitEvent: true })
    }
  }
  /**
   * This event is used for get the event details when Edit the indent details.
   */
  GetIndentItemDeatilsByGuid() {
    // this.globalservice.startSpinner();
    this.shimmerVisible = true;
    this.IndentType = localStorage.getItem('IndentType')
    this.indentService.GetIndentItemDeatilsByGuid(this.IndentGuid, this.IndentType).subscribe(
      (IndentDetails: any) => {
        this.IndentItemDetails = IndentDetails.Result.getIndentItems;
        this.IndentItemQuotations = IndentDetails.Result.oGetIndentQuotationsForItemResponse
        if (this.IndentType == 'PI') {
           this.GetApprovedSIForPI(this.IndentItemDetails[0].ToLocationGuid)
          this.IndentItemQuotations = IndentDetails.Result.oGetIndentQuotationsForItemResponse.filter((value: any, index: any, self: any) => {
            const firstIndex = self.findIndex((item: any) => item.ItemGuid === value.ItemGuid && item.QuotationNo === value.QuotationNo);
            return index === firstIndex;
          });
        }
        this.GetSelectedIndentDetails()
        if (this.IndentItemDetails != null && this.IndentItemDetails != undefined) {
          this.addItemslist.value.forEach((f: any) => {
            this.SelectedItems.push(f);
          })
        }
      },
      (err) => {
        // this.globalservice.stopSpinner();
        this.shimmerVisible = false;
      })
  }
  /**
   * This event is used for patch tyhe indent details when edit the indent details.
   */
  GetSelectedIndentDetails() {
    this.addItemslist.clear()
    // this.OnLocationSelected(this.IndentItemDetails[0].FromLocationGuid)
    this.indentForm.patchValue({
      UserGuid: this.UserGuid,
      IndentGuid: this.IndentGuid,
      IndentType: this.IndentItemDetails[0].IndentType,
      CurrentLocationGuid: this.IndentItemDetails[0].FromLocationGuid,
      RequestLocationGuid: this.IndentItemDetails[0].ToLocationGuid,
      Remark: this.IndentItemDetails[0].Narration
    }, { emitEvent: true })
    this.FormChanged = false;
    // if (this.IndentType == 'PI') {
    //   this.Getindentitems(this.IndentItemDetails[0].ToLocationGuid);
    // }
    // else {
    this.OnSelectIndentType(this.IndentItemDetails[0].ToLocationGuid)
    // } 
    const quotationValidators = this.indentForm.value.IndentType === 'PI'
      ? [Validators.required]
      : null;
    this.IndentItemDetails.forEach((element: any) => {
      this.addItemslist.push(this.fb.group({
        ItemName: [element.ItemName ? element.ItemName : null, Validators.required],
        ItemGuid: element.ItemGuid,
        ManufactureName: element.ManufactureName,
        MachineName: element.MachineName,
        POTypeGuid: element.POTypeGuid,
        POSize: element.PackSize,
        QtyNo: [element.ReqQty ? element.ReqQty : null, Validators.required],
        Reason: [element.Reason?.trim() ],
        HSNCode: element.HsnCode,
        ItemRate: element.Rate,
        NetAmount: element.NetAmount,
        MajorUnitName: element.MinorUnitName,
        LabRequiredDate: ({ day: new Date(element.ExpectedDate).getDate(), 
        month: new Date(element.ExpectedDate).getMonth() + 1, year: new Date(element.ExpectedDate).getFullYear() }),
        LabDate: [new Date(this.newDate.year, this.newDate.month - 1, this.newDate.day) <= new Date(element.ExpectedDate) 
  ? {
      day: new Date(element.ExpectedDate).getDate(),
      month: new Date(element.ExpectedDate).getMonth() + 1,
      year: new Date(element.ExpectedDate).getFullYear()
    }
  : '',Validators.required],
        IndentId: element.IndentId,
        IsDeleted: element.IsDeleted,
        VendorId: element.VendorId,
        SupplierName: element.SupplierName,
        VendorStateId: element.VendorStateId,
        FromRights: element.FromRights,
        InPOQuantity: element.INPOQty,
        InHandQuantity: this.authservice.LoggedInUser.B2BTYPE==true||this.authservice.LoggedInUser.B2BTYPE=='true'?element.ApprovedQty:element.NewQty,
        QuotationGuid: element.QuotationGuid,
        SGSTPer: element.TaxPerSGST,
        CGSTPer: element.TaxPerCGST,
        UTGSTPer: element.TaxPerUTGST,
        IGSTPer: element.TaxPerIGST,
        DiscountPer: element.DiscountPercentage,
        Unitprice: element.UnitPrice,
        CatlogNo: element.CatalogNo,
        QuotationNo: null
      }));
    })
    this.OnselectStore()
    this.globalservice.stopSpinner();
  }
  /**
   * This method is used for reset the form details
   */
  FormReset() {
    if (this.IndentGuid == '') {
      this.indentForm.reset();
    }
    this.addItemslist.clear();
    this.AddItems();
    this.indentForm.patchValue({ Remark: '' })
    if (this.IndentGuid) {
      this.GetSelectedIndentDetails();
    }
    this.SelectedSIItem = [];
    this.FormChanged = false
  }
  OnSelectIndentType(LocationGuid?:string) {
    //if (this.indentForm.value.IndentType == 'SI') {
    this.shimmerVisible = true
    this.indentService.Getindentitems(this.authservice.LoggedInUser.B2BTYPE,LocationGuid).subscribe(data => {
      const Allitems = data.oGetIndentitems;
      if(this.authservice.LoggedInUser.B2BTYPE==true||this.authservice.LoggedInUser.B2BTYPE=='true'){
        let ListItemDetails: any[] = [];
        const Itemslist = this.authservice.LoggedInUser.ITEMGUIDS?.split(',');
        Itemslist?.forEach((e: any) => {
          let dep = Allitems.filter((lg: { ItemGuid: any; }) => lg.ItemGuid.toLowerCase() === e.trim().toLowerCase());
          ListItemDetails.push(...dep);
          });
          if(this.authservice.LoggedInUser.ITEMGUIDS=='00000000-0000-0000-0000-000000000000'){
            this.Allitems=Allitems
          }else{
            this.Allitems=ListItemDetails
          }
       }
      else{
       this.Allitems=Allitems
      }
      this.lstLocationItems = this.Allitems.filter((value: any, index: any, self: any) => {
        const firstIndex = self.findIndex((item: any) => item.ItemGuid === value.ItemGuid || item.ItemName === value.ItemName);
        return index === firstIndex;
      });
      this.SpinnerCheck = false;
      this.shimmerVisible = false;
    },
      error => {
        this.shimmerVisible = false;
      });
    //}
  }
  OnSelectSIItems(event: any) {
    this.ItemNameList="";
    for (let i = this.addItemslist.value.length - 1; i >= 0; i--) {
      if (this.addItemslist.value[i].ItemName === null) {
        this.removeItems(i);
      }
    }
    if (this.SelectedSIItem.length == 1 && this.addItemslist.value[0]?.ItemName == null) {
      this.addItemslist.clear()
    }
    this.SelectedSIItems = []
    this.SelectedSIItems.push(...this.SIApprovedDetails.filter((eventdata: any) => eventdata.IndentNo == event.IndentNo))
    this.SiItemCount = this.SelectedItems?.length
    this.SelectedSIItems.forEach((element: any , index : any) => {
      this. GetQuantityOnLocationAndItem(this.indentForm.value.CurrentLocationGuid,element.ItemGuid,index , element.ItemName) 
      this.addItemslist.push(this.fb.group({
        ItemName: [element.ItemName ? element.ItemName : null, Validators.required],
        ItemGuid: element.ItemGuid,
        ManufactureName: element.ManufactureName,
        MachineName: element.MachineName ? element.MachineName : '',
        POTypeGuid: element.POTypeGuid,
        POSize: element.PackSize,
        QtyNo: element.ReqQty,
        Reason: element.Reason?.trim(),
        HSNCode: element.HsnCode,
        ItemRate: element.Rate,
        NetAmount: element.NetAmount,
        MajorUnitName: element.MinorUnitName,
        LabRequiredDate: {
          day: new Date(element.ExpectedDate).getDate(),
          month: new Date(element.ExpectedDate).getMonth() + 1,
          year: new Date(element.ExpectedDate).getFullYear()
        },
        LabDate: new Date(element.ExpectedDate).getDate() >= this.newDate.day &&
          new Date(element.ExpectedDate).getMonth() + 1 >= this.newDate.month &&
          new Date(element.ExpectedDate).getFullYear() >= this.newDate.year ? ({ day: new Date(element.ExpectedDate).getDate(), month: new Date(element.ExpectedDate).getMonth() + 1, year: new Date(element.ExpectedDate).getFullYear() }) : [null, [Validators.required]],
        IndentId: element.IndentId,
        IsDeleted: false,
        VendorId: element.VendorId,
        SupplierName: element.SupplierName,
        VendorStateId: element.VendorStateId,
        FromRights: element.FromRights,
        InPOQuantity: element.INPOQty,
        InHandQuantity: this.authservice.LoggedInUser.B2BTYPE==true||this.authservice.LoggedInUser.B2BTYPE=='true'?element.ApprovedQty:element.NewQty,
        QuotationGuid: element.QuotaionGuid,
        SGSTPer: element.TaxPerSGST,
        CGSTPer: element.TaxPerCGST,
        UTGSTPer: element.TaxPerUTGST,
        IGSTPer: element.TaxPerIGST,
        DiscountPer: element.DiscountPercentage,
        Unitprice: element.UnitPrice,
        IndentNo: element.IndentNo,
        CatlogNo: element.CatalogNo,
        FromActiveSI:true
      }));
    });
    this.isDispatched = false;
  }
  Onremove(event: any) {
    // const itemIndex = this.addItemslist.value.findIndex((item: any) => item.ItemGuid === event.value.ItemGuid && event.value.IndentNo === item.IndentNo);
    for (let i = this.addItemslist.length - 1; i >= 0; i--) {
      const element: any = this.addItemslist.at(i);
      if (element.value.IndentNo == event.value.IndentNo) {
        this.addItemslist.removeAt(i);
      }
    }
    if (this.SelectedSIItem.length == 0 && (this.addItemslist.value.length == 0 || (this.addItemslist.value[0] && this.addItemslist.value[0].ItemName == null))) {
      this.AddItems();
    }
  }
  onSelectClose() {
    const clearedItems: any = this.ngSelectComponent.viewPortItems;

    // Remove items from addItemslist based on matching ItemGuid
    for (let index = this.addItemslist.value.length - 1; index >= 0; index--) {
      const array1Item = this.addItemslist.value[index];
      const foundIndex = this.SIApprovedDetails.filter((array2Item: any) =>
        array2Item.ItemGuid === array1Item.ItemGuid && array2Item.IndentNo === array1Item.IndentNo
      );
      if (foundIndex.length > 0) {
        this.addItemslist.removeAt(index);
      }
    }

    if (this.addItemslist.value.length === 0) {
      this.AddItems();
    }
  }


  OnselectStore(event?: any) {
    this.lsttLocationsstore = null
    if (event != undefined && event.PanelId) {
      this.lsttLocationsstore = this.lstLocationsstore.filter((data: any) => data.PanelId == event.PanelId)
      this.indentForm.patchValue({
        RequestLocationGuid: null
      })
    }
    if (this.IndentGuid) {
      this.lsttLocationsstore = this.lstLocationsstore.filter((data: any) => data.LocationGuid == this.indentForm.value.RequestLocationGuid)
    }
    if (event == undefined && !this.IndentGuid) {
      this.indentForm.patchValue({
        RequestLocationGuid: null
      })
    }
  }
  /**
   * validation for Quantity fileld
   * @param event 
   * @param index 
   */
  Change(event: any, index: any) {
    const ItemDetails = this.addItemslist.at(index);
    const quantity = event.target.value
    const newQuantity = parseInt(quantity)
      ItemDetails.patchValue({
        QtyNo: event.target.value
      })
  }
  Onclickreason(valueindex : any){
    const lstIndentItem = this.indentForm.get('lstIndentItem') as FormArray;
    lstIndentItem.controls.forEach((control: AbstractControl, index: number) => {
      if (index === valueindex) {
        if (this.indentForm.value.IndentType === 'SI') {
          control.get('Reason')?.setValidators([Validators.required]);
          control.get('Reason')?.updateValueAndValidity();
        } else {
          control.get('Reason')?.clearValidators();
          control.get('Reason')?.updateValueAndValidity();
        }
      }
    });
   }
   onChangeIndentType(){
    if (!this.IndentGuid) {
      this.indentForm.patchValue({
        CurrentLocationGuid: null,
        RequestLocationGuid: null,
        Remark: ''
      })
      this.addItemslist.clear();
      this.AddItems();
    }
   }
}