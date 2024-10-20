import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbCalendar, NgbDateParserFormatter, NgbDateStruct, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ColumnMode, DatatableComponent, } from '@swimlane/ngx-datatable';
import * as _ from 'lodash';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { Subject, Subscription, debounceTime, distinctUntilChanged, throttleTime } from 'rxjs';
import { AllItemsService } from 'src/app/core/Services/all-items.service';
import { AuthenticationService } from 'src/app/core/Services/authentication.service';
import { CustomDateParserFormatter } from 'src/app/core/Services/ngbdate-format.service';
import { QuotationService } from 'src/app/core/Services/quotation.service';
import { GrnService } from 'src/app/core/Services/grn.service';
@Component({
  selector: 'app-new-quotation',
  templateUrl: './new-quotation.component.html',
  styleUrls: ['./new-quotation.component.scss'],
  providers: [
    { provide: NgbDateParserFormatter, useClass: CustomDateParserFormatter },
  ],
})
export class NewQuotationComponent implements OnInit {
  /**
   * variable  declare
  */
  @ViewChild(DatatableComponent) table: DatatableComponent;
  shimmerVisible: boolean;
  rows: any[] = [];
  temp: any[] = [];
  loadingIndicator = true;
  selectedDate: NgbDateStruct;
  minDate: NgbDateStruct;
  ColumnMode = ColumnMode;
  newQuotationForm: FormGroup = {} as any;
  supplierDetails: any = [];
  supplierFilter: any = [];
  deliveryState: any = [];
  subscriptions: Subscription | any;
  centerDetails: any = [];
  deliverLocation: any = [];
  MachineDetails: any = [];
  allItems: any = [];
  Keyword: any = "";
  itemOrder: any = '';
  sort: any = '';
  pageNumber: number = 1;
  rowCount: number = 40;
  modelChanged = new Subject<string>();
  supplierType: any = [];
  itemName: any = '';
  lstItemsDetails: FormArray = {} as any;
  lstTermCondition: FormArray = {} as any;
  stateList: any = [];
  defaultpurchaseDetails: any;
  allItemsList: any = [];
  gstNumber: any;
  quotationGuid: any;
  quotationsList: any = [];
  editAllItems: any = [];
  removeItemsList: any = [];
  termsConditionList: any = [];
  removetermConditionsList: any = [];
  isdisable: boolean = false;
  FormChanged: boolean = false;
  deliveryLocationFilters: any = [];
  userGuid: string | null;
  hideItems: boolean = true;
  stateGuid: any;
  igstEntered: boolean = false;
  dropdownSettings: IDropdownSettings = {};
  dropdownDeliveryState: IDropdownSettings = {};
  dropdownCenterType: IDropdownSettings = {};
  dropdownCenter: IDropdownSettings = {};
  removeLocations: any = [];
  SpinnerCheck: boolean = false;
  selectFromDate: NgbDateStruct;
  IsActive:boolean=true;
  combinedArray:any=[]
  lstManufacturers: any = [];
  fileToUpload: any;
  isFileUplodad: boolean;
  ShowPdfFile: string;
  InvoiceDocument: any;
  FileName: any;
  File: string;
  FilePath: any;
  OriginalFileName: any;
  Document: any;
  ListInvoiceDocuments: FormArray = {} as any;
  InvoiceDocumentsList: any;
  QuotationItem: any;
  ItemCancelReason:string
  ItemquotationGuid:string
  ApprovalStatus:any
  constructor(private modalService: NgbModal, private quotationService: QuotationService, private fb: FormBuilder, private router: Router, private allItemsService: AllItemsService,
    private calendar: NgbCalendar,
    private active: ActivatedRoute,
    public authservice: AuthenticationService,
    private grnService: GrnService
  ) {
    this.fetch((data: any) => {
      this.temp = data;
      this.rows = data;
    });
    this.subscriptions = new Subscription();
    this.modelChanged
      .pipe(debounceTime(1000))
      .subscribe(model => {
        this.Keyword = model
        this.getAllItemDetails()
      });

    const today = this.calendar.getToday();
    this.minDate = {
      year: today.year, month: today.month, day: today.day
    };


  }

  ngOnInit(): void {
    this.quotationGuid = this.active.snapshot.paramMap.get('QuotationGuid')
    this.userGuid = localStorage.getItem('UserGuid');
    this.getSupplierType()
    this.getpurchaseorderPostDefaults()
    this.inItForm()
    this.getManufacturers()

    this.newQuotationForm.valueChanges.pipe(distinctUntilChanged(), throttleTime(500)).subscribe((values: any) => {
      this.FormChanged = true;
    }
    );
    this.InvoiceDocuments.removeAt(0)
    this.dropdownSettings = {
      singleSelection: false,
      idField: 'CenterLocationGuid',
      textField: 'CenterLocationName',
      enableCheckAll: false,
      itemsShowLimit: 2,
      allowSearchFilter: true
    };

    this.dropdownDeliveryState = {
      singleSelection: false,
      idField: 'StateGuid',
      textField: 'State',
      enableCheckAll: false,
      itemsShowLimit: 2,
      allowSearchFilter: false,
      disabledField: 'StateGuid'
    };

    this.dropdownCenterType = {
      singleSelection: false,
      idField: 'CenterTypeGuid',
      textField: 'CenterType',
      enableCheckAll: false,
      itemsShowLimit: 2,
      allowSearchFilter: false,
      disabledField: 'CenterTypeGuid'
    };

    this.dropdownCenter = {
      singleSelection: false,
      idField: 'CenterGuid',
      textField: 'CenterName',
      enableCheckAll: false,
      itemsShowLimit: 2,
      allowSearchFilter: false,
      disabledField: 'CenterGuid'
    };
  }

  fetch(cb: any) {
    const req = new XMLHttpRequest();
    req.open('GET', `assets/data/quotations.json`);
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

  openXlModal(content: TemplateRef<any>) {
    this.modalService.open(content, { size: 'md' }).result.then((result) => {
      console.log("Modal closed" + result);
    }).catch((res) => { });
  }

  openLgModal(content: TemplateRef<any>) {
    this.modalService.open(content, { size: 'xl' }).result.then((result) => {
      console.log("Modal closed" + result);
    }).catch((res) => { });
  }

  openBasicModal(content: TemplateRef<any>) {
    this.modalService.open(content, { size: 'md' }).result.then((result) => {
      console.log("Modal closed" + result);
    }).catch((res) => { });
  }

  /**
   * This method is used for Form Validations
  */
  inItForm() {
    this.newQuotationForm = this.fb.group({
      UserGuid: null,
      QuotationGuid: null,
      SupplierGuid: [null, [Validators.required]],
      StateGuid: [null],
      GSTNNO: [''],
      Vendoraddress: [''],
      supplierType: [null],
      lstStates: [null],
      CentreType: [null],
      lstCenters: [null],
      lstLocations: [null, [Validators.required]],
      FromDate: [null, [Validators.required]],
      ToDate: [null, [Validators.required]],
      QuotationRefNo: [null, [Validators.required]],
      ApprovalStatus:[''],
      lstItemsDetails: this.fb.array([
        this.fb.group({
          ItemGuid: [''],
          PackSize: ['', [Validators.required]],
          Rate: ['', [Validators.required]],
          Discount: ['', [Validators.required]],
          IGST: ['', [Validators.required]],
          CGST: ['', [Validators.required]],
          SGST: ['', [Validators.required]],
          DiscountAmount: ['', [Validators.required]],
          TotalGSTAmount: ['', [Validators.required]],
          BuyPrice: ['', [Validators.required]],
          CatalogNo: [''],
          Category: [''],
          HSNCode: [''],
          ItemName: ['', [Validators.required]],
          VendorItemName : ['', [Validators.required]],
          ItemNo: [''],
          Machine: [''],
          MajorUnitName: [''],
          MinorUnitName: [''],
          Manufacturer: [null],
          ManufactureGuid: [null],
          ItemCategoryName: [''],
          QuotationId: [null],
          ISDeleted: [false],
          DuplicateItemCheck: [''],
          ItemQuotationGuid:[''],
          ItemCancel:[''],
          ApprovalStatus:['']
        })
      ]),
      ListInvoiceDocuments: this.fb.array([
        this.fb.group({
          FileName: [''],
          File: [''],
          ItemName: [''],
          FilePath: [''],
          OriginalFileName: [''],
          FileDate: [''],
          NewFileName: [''],
          IsDeleted: [false]
        })
      ]),
      lstTermCondition: this.fb.array([
        this.fb.group({
          TermCondition: ['', [Validators.required]],
          Id: [null],
          IsDeleted: [false]
        })
      ])
    })
  }

  quotationFormReset() {
    this.newQuotationForm.reset()
    this.FormChanged=false;
    this.addItemslist.clear()
    this.addTermConditionlist.clear()
    this.InvoiceDocuments.clear()
    this.AddItems();
    this.AddTermCondition();
    this.getAllQuotationDetails();
  }
  /**
   * This method is used for filter data based formarray
  */
  get addItemslist(): FormArray<any> {
    return this.newQuotationForm.get('lstItemsDetails') as FormArray;
  }

  get addTermConditionlist(): FormArray<any> {
    return this.newQuotationForm.get('lstTermCondition') as FormArray;
  }
  get InvoiceDocuments(): FormArray {
    return this.newQuotationForm.get('ListInvoiceDocuments') as FormArray;
  }
  AddTermCondition() {
    this.addTermConditionlist.push(this.fb.group({
      TermCondition: ['', [Validators.required]],
      Id: [null],
      IsDeleted: [false]
    }));
  }

  removeTermCondition(index: any) {
    this.removetermConditionsList.map((items: any) => {
      if (items.Id == this.addTermConditionlist.value[index].Id) {
        items.IsDeleted = true
      }
    })
    this.addTermConditionlist.removeAt(index)
  }
  /**
   * This event is used for removed multiple adding addiems
  */
  removeItems(index: any) {
    this.removeItemsList.map((items: any) => {
      if (items.ItemGuid == this.addItemslist.value[index].ItemGuid) {
        items.ISDeleted = true
      }
    })
    this.addItemslist.removeAt(index)
  }

  /**
   * This method is used for multiple adding addiems
  */
  AddItems() {
    this.addItemslist.push(this.fb.group({
      ItemGuid: [''],
      PackSize: ['', [Validators.required]],
      Rate: ['', [Validators.required]],
      Discount: ['', [Validators.required]],
      IGST: ['', [Validators.required]],
      CGST: ['', [Validators.required]],
      SGST: ['', [Validators.required]],
      DiscountAmount: ['', [Validators.required]],
      TotalGSTAmount: ['', [Validators.required]],
      BuyPrice: ['', [Validators.required]],
      CatalogNo: [''],
      Category: [''],
      // GSTTax: [''],
      HSNCode: [''],
      ItemName: ['', [Validators.required]],
      VendorItemName : ['', [Validators.required]],
      ItemNo: [''],
      Machine: [''],
      MajorUnitName: [''],
      MinorUnitName: [''],
      Manufacturer: [''],
      ManufactureGuid: [null],
      ItemCategoryName: [''],
      QuotationId: [null],
      ISDeleted: [false],
      DuplicateItemCheck: [''],
      ItemQuotationGuid:[''],
      ItemCancel:[''],
      ApprovalStatus:['']
    }));
  }


  /**
    * This method is used for saveQuotationsDetails
   */
  saveQuotationsDetails() {
    if (this.quotationGuid) {
      this.removeItemsList = this.removeItemsList.filter((d: any) => d.ISDeleted == true)
      this.addItemslist.value.push(...this.removeItemsList)
      let removedInvoiceDetails= this.InvoiceDocumentsList.filter((d: any) => d.IsDeleted == true)
      this.InvoiceDocuments.value.push(...removedInvoiceDetails)
    }
    this.removetermConditionsList = this.removetermConditionsList.filter((d: any) => d.IsDeleted == true)
    this.addTermConditionlist.value.push(...this.removetermConditionsList)

    const fromDate = new Date();
    fromDate.setFullYear(this.newQuotationForm.value.FromDate.year, this.newQuotationForm.value.FromDate.month - 1, this.newQuotationForm.value.FromDate.day);
    this.newQuotationForm.value.FromDate = fromDate.toISOString();
    const ToDate = new Date();
    ToDate.setFullYear(this.newQuotationForm.value.ToDate.year, this.newQuotationForm.value.ToDate.month - 1, this.newQuotationForm.value.ToDate.day);
    this.newQuotationForm.value.ToDate = ToDate.toISOString();
    const quotation: any = this.newQuotationForm.value
    let data: any = {
      QuotationGuid: quotation.QuotationGuid,
      SupplierGuid: quotation.SupplierGuid,
      UserGuid: this.userGuid,
      lstItemsDetails: quotation.lstItemsDetails,
      lstLocations: quotation.lstLocations,
      lstTermCondition: quotation.lstTermCondition,
      FromDate: quotation.FromDate,
      ToDate: quotation.ToDate,
      QuotationRefNo: quotation.QuotationRefNo,
      QuotationLogData: this.combinedArray.length==0?  null : this.combinedArray,
      LstInvioceDocuments:this.InvoiceDocuments.value
    }
    this.quotationService.saveQuotationsData(data).subscribe(data => {
      this.router.navigateByUrl('/quotations')
    })
  }


  /**
    * This method is used for get all Items
  */
  getAllItemDetails() {
    this.allItems = [];
    this.Keyword = (this.Keyword == undefined || this.Keyword == null) ? this.Keyword || "" : this.Keyword;
    if (this.Keyword != '') {
      this.SpinnerCheck = true;
    }
    this.quotationService.getAllItems(this.pageNumber, this.rowCount, this.Keyword, this.itemOrder, this.sort,this.IsActive)
      .subscribe(data => {
        this.allItems = data.Result.getAllItemsResponses;
        this.SpinnerCheck = false;
        if (this.Keyword != '') {
          this.allItems = this.allItems
            .filter((value: any, index: any, self: any) => {
              return index === self.findIndex((t: any) => (
                (t.ItemGuid === value.ItemGuid || t.ItemName === value.ItemName) && value.IsDeleted == false
              )) && value.ApprovalStatus === 2;
            });
        } else {
          this.editAllItems = this.allItems
            .filter((value: any, index: any, self: any) => {
              return index === self.findIndex((t: any) => (
                (t.ItemGuid === value.ItemGuid || t.ItemName === value.ItemName) && value.IsDeleted == false
              )) && value.ApprovalStatus === 2;
            });
        }
      });
}

  /**
  * This method is used for get Defualt SupplierType
  */
  getSupplierType() {
    this.quotationService.getSupplierPostDefaults().subscribe(data => {
      this.supplierType = data.Result.SupplierType
      this.supplierType = this.supplierType.filter((f: { Type: any; }) => f.Type == 'Category');
    })
  }

  /**
  * This method is used for get all Defualt Calls List for Quotations
  */
  getpurchaseorderPostDefaults() {
    let DepotmentGuid = this.authservice.LoggedInUser.DEFAULTROLES.toLowerCase().includes('ADMIN'.toLowerCase()) && this.authservice.LoggedInUser.LOCATIONSGUID == '00000000-0000-0000-0000-000000000000' ? '00000000-0000-0000-0000-000000000000' : this.authservice.LoggedInUser.LOCATIONSGUID.split(",")
    // this.globalService.startSpinner();
    this.shimmerVisible = true;
    this.quotationService.getQuotationPostDefaults(DepotmentGuid).subscribe(data => {
      this.defaultpurchaseDetails = data
      this.supplierDetails = data.Result.LstQuotationSupplierType
      this.supplierFilter = this.supplierDetails.sort((a: any, b: any) => a.SupplierName?.trim().localeCompare(b.SupplierName.trim()));
      this.deliveryState = data.Result.LstQuotationStateType
      this.centerDetails = data.Result.LstQuotationCenterTypeResponcse
      this.deliverLocation = data.Result.LstQuotationCenterLocationType
      this.MachineDetails = data.Result.LstQuotationMachineType
      this.stateList = data.Result.LstQuotationStateDetailsType
      if (this.quotationGuid != null) {
        this.getAllQuotationDetails()
        this.getAllItemDetails()
      }
      // this.globalService.stopSpinner();
      this.shimmerVisible = false;
    })

  }

  /**
   *
   * @param getAllQuotationDetails this method is used for getQuotations Details
   */
  getAllQuotationDetails() {
    // this.globalService.startSpinner();
    this.shimmerVisible = true;
    // this.addTermConditionlist.clear()
    this.quotationService.getQuotationsByGuid(this.quotationGuid).subscribe(data => {
      this.quotationsList = data.getQuotationsResponses
      this.supplierFilter = this.supplierDetails.filter((f: { SupplierGuid: any; }) => f.SupplierGuid == this.quotationsList[0].SupplierGuid);
      this.termsConditionList = data.getTermsConditions
      this.InvoiceDocumentsList = data.listinvoiceDocuments
      // this.globalService.stopSpinner();
      this.shimmerVisible = false;
      this.getQuotationData()
      this.addItemslist.value.forEach((f: any) => {
        this.removeItemsList.push(f);
      })
      this.addTermConditionlist.value.forEach((f: any) => {
        this.removetermConditionsList.push(f);
      })
    },
      (err: HttpErrorResponse) => {
        // this.globalService.stopSpinner();
        this.shimmerVisible = false;
      })
  }

  getQuotationData() {
    this.hideItems = false;
    this.addItemslist.clear();
    this.addTermConditionlist.clear();
    this.quotationsList = this.quotationsList.filter((value: any, index: any, self: any) => {
      const firstIndex = self.findIndex((item: any) => item.ItemGuid === value.ItemGuid || item.ItemName === value.ItemName);
      return index === firstIndex;
    });
    const FromDate = new Date(this.quotationsList[0].FromDate);
    const ToDate = new Date(this.quotationsList[0].ToDate);
    this.minDate = { year: FromDate.getFullYear(), month: FromDate.getMonth() + 1, day: FromDate.getDate() };
    const selectedDeliveryLocationArray = this.quotationsList[0].LocationGuids.split(',').filter((value: any, index: any, self: any) => self.indexOf(value) === index);
    const selectedLocations = this.deliverLocation.filter((le: any) => selectedDeliveryLocationArray.some((e: any) => le.CenterLocationGuid.toLowerCase() === e.trim().toLowerCase()));
    const selectedCenters = selectedLocations.map((filter: any) => this.stateList.filter((f: any) => f.Centertype === filter.CenterType && f.CenterGuid === filter.CenterGuid)).flat();
    const selectedStates = selectedLocations.map((filter: any) => this.deliveryState.filter((f: any) => f.StateGuid === filter.StateGuid)).flat();
    const selectedCenterTypes = selectedCenters.map((type: any) => this.centerDetails.filter((f: any) => f.CenterType === type.Centertype)).flat();
    this.ApprovalStatus=this.quotationsList[0].ApprovalStatus
    this.newQuotationForm.patchValue({
      UserGuid: this.userGuid,
      QuotationGuid: this.quotationGuid,
      SupplierGuid: this.quotationsList[0].SupplierGuid,
      StateGuid: this.quotationsList[0].SupplierStateName,
      GSTNNO: this.quotationsList[0].GSTNNo,
      Vendoraddress: this.quotationsList[0].SupplierAddress,
      lstStates: selectedStates,
      CentreType: selectedCenterTypes,
      lstCenters: selectedCenters,
      lstLocations: selectedLocations,
      FromDate: { year: FromDate.getFullYear(), month: FromDate.getMonth() + 1, day: FromDate.getDate() },
      ToDate: { year: ToDate.getFullYear(), month: ToDate.getMonth() + 1, day: ToDate.getDate() },
      QuotationRefNo: this.quotationsList[0].QuotationRefNo,
      supplierType: this.quotationsList[0].SupplierTypeName
    }, { emitEvent: true });
    this.FormChanged = false
    this.quotationsList.forEach((items: any) => {
      this.addItemslist.push(this.fb.group({
        ItemGuid: items.ItemGuid,
        PackSize: items.PackSize,
        Rate: [items.Rate || '', Validators.required],
        Discount: [items.DiscountPer || 0, Validators.required],
        IGST: items.IGSTPer,
        CGST: [items.CGSTPer || 0, Validators.required],
        SGST: [items.SGSTPer || 0, Validators.required],
        DiscountAmount: items.DiscountAmt,
        TotalGSTAmount: items.GSTAmount,
        Manufacturer: items.ManufactureName,
        ItemName: items.ItemName,
        QuotationId: items.QuotationId,
        Machine: items.MachineName,
        BuyPrice: items.BuyPrice,
        VendorItemName : items.VendorItemName,
        ManufactureGuid : items.ManufactureGuid,
        ItemQuotationGuid:items.QuotationGuid,
        ItemCancel:items.ItemCancel,
        ApprovalStatus:items.ApprovalStatus
      }));
    });
    this.termsConditionList.forEach((terms: any) => {
      this.addTermConditionlist.push(this.fb.group({
        TermCondition: [terms.TermsCondition || '', Validators.required],
        Id: terms.Id,
        ISDeleted: 0
      }));
    });
    this.InvoiceDocumentsList.forEach((documents: any) => {
      this.InvoiceDocuments.push(this.fb.group({
        FileName: documents.FileName,
        FilePath:documents.FilePath,
        OriginalFileName:documents.OriginalFileName,
        Id:documents.Id,
        IsDeleted:documents.IsDeleted,
        QuotationNo:documents.QuotationNo
      }));
    });
    this.removeLocations = this.newQuotationForm.get('lstLocations')?.value;
    let combinedObject:any= {
      quotationsList: this.quotationsList,
      termsConditionList: this.termsConditionList
    };
    this.combinedArray=combinedObject;
    // if (lstLocationsValue) {
    //   this.removeLocations.push(lstLocationsValue);
    // }
  }

  /**
 *
 * @param onSupplierDetails this method is used for get Supplier Details
 */
  onSupplierDetails(event: any) {
    if (event != null) {
      this.supplierFilter = this.defaultpurchaseDetails.Result.LstQuotationSupplierType.filter((f: { SupplierGuid: any; }) => f.SupplierGuid == event);
      this.newQuotationForm.patchValue({
        StateGuid: this.supplierFilter[0].State,
        GSTNNO: this.supplierFilter[0].GSTNo,
        Vendoraddress: this.supplierFilter[0].HouseNo += "," + this.supplierFilter[0].SupplierAddress,
        supplierType: this.supplierFilter[0].SupplierTypeName
      }, { emitEvent: true })
      this.FormChanged = true
    } else {
      this.newQuotationForm.patchValue({
        StateGuid: '',
        GSTNNO: '',
        Vendoraddress: '',
        supplierType: '',
      })
    }

  }

  /**
  *
  * @param ondDeleiverystate this event is used for filter State related data
  */
  ondDeleiverystate(event: any) {
    if (event.length > 0) {
      this.stateGuid = event[0].StateGuid
      this.stateList = []
      // this.deliverLocation=[]
      event.forEach((filter: any) => {
        let centers = this.defaultpurchaseDetails.Result.LstQuotationStateDetailsType.filter((f: { StateGuid: any; }) => f.StateGuid == filter.StateGuid);
        this.stateList.push(...centers)
      })
    } else {
      this.stateList = this.defaultpurchaseDetails.Result.LstQuotationStateDetailsType
    }
  }

  /**
   *
   * @param onchangeCenter this event is used for filter Location related data
   */
  onCenterLocation(event: any) {
    if (event.length > 0) {
      this.deliverLocation = []
      event.forEach((filter: any) => {
        let centerLocations = this.defaultpurchaseDetails.Result.LstQuotationCenterLocationType.filter((f: { CenterGuid: any; StateGuid: any }) => f.CenterGuid == filter.CenterGuid && f.StateGuid == this.stateGuid);
        this.deliverLocation.push(...centerLocations)
      })
    } else {
      this.deliverLocation = this.defaultpurchaseDetails.Result.LstQuotationCenterLocationType
    }
  }

  /**
  *
  * @param onchangeCenter this event is used for filter center related data
  */
  onchangeCenter(event: any) {
    if (event.length > 0) {
      this.stateList = this.defaultpurchaseDetails.Result.LstQuotationStateDetailsType.filter((f: { Centertype: any; StateGuid: any; }) => f.Centertype == event[0].CenterType && f.StateGuid == this.stateGuid);
    } else {
      this.stateList = this.defaultpurchaseDetails.Result.LstQuotationStateDetailsType
    }
  }

  onchangeToState(event: any[]) {
    if (event.length > 0) {
      this.hideItems = false
      let deliveryLocations: any = []
      let stateFilter: any = []
      let selectedStates: any = []
      let centerFilters: any = []
      let selectedCenters: any = []
      let centerType: any = []
      let selectedCenterType: any = []
      let centerTypeDetails: any = []
      this.deliveryLocationFilters = []
      event.forEach((location: any) => {
        deliveryLocations = this.defaultpurchaseDetails.Result.LstQuotationCenterLocationType.filter((f: { CenterLocationGuid: any; }) => f.CenterLocationGuid == location.CenterLocationGuid);
        deliveryLocations.forEach((filter: any) => {
          centerFilters = this.defaultpurchaseDetails.Result.LstQuotationStateDetailsType.filter((f: { CenterGuid: any; Centertype: any }) => f.Centertype == filter.CenterType && f.CenterGuid == filter.CenterGuid)
          stateFilter = this.defaultpurchaseDetails.Result.LstQuotationStateType.filter((f: { StateGuid: any; }) => f.StateGuid == filter.StateGuid)
          selectedStates.push(...stateFilter)
          selectedCenters.push(...centerFilters)
          this.deliveryState = Array.from(new Set(selectedStates));
          this.stateList = selectedCenters
        })
        selectedCenters.forEach((type: any) => {
          centerType = this.centerDetails.filter((f: { CenterType: any }) => f.CenterType == type.Centertype)
          selectedCenterType.push(...centerType)
          centerTypeDetails = Array.from(new Set(selectedCenterType));
        })
        this.newQuotationForm.patchValue({
          lstStates: this.deliveryState || '',
          lstCenters: selectedCenters || '',
          CentreType: centerTypeDetails || ''
        }, { emitEvent: true })
        this.FormChanged = true
      })
    } else {
      this.newQuotationForm.patchValue({
        lstStates: '',
        lstCenters: '',
        CentreType: ''
      })
      this.deliveryState = this.defaultpurchaseDetails.Result.LstQuotationStateType
      this.stateList = this.defaultpurchaseDetails.Result.LstQuotationStateDetailsType
      this.hideItems = true
    }
    if (this.quotationGuid != null && this.removeLocations.length > event.length) {
      this.newQuotationForm.value.lstLocations = this.removeLocations.map((item: any) => ({
        ...item,
        LocationDeleted: !event.some(item1 => item1.CenterLocationGuid === item.CenterLocationGuid)
      }));
    }

    if (event.length === 0) {
      this.removeLocations = this.removeLocations.map((item: any) => ({ ...item, LocationDeleted: true }));
    }

    if (this.removeLocations.length === 1 && event.length === 1) {
      this.removeLocations.push(...event);
      this.newQuotationForm.value.lstLocations = this.removeLocations;
    }
  }

  /**
  *
  * @param changeSearch this event is used for search the items
  */
  changeSearch(event: any, index: any) {
    this.modelChanged.next(event.target.value);
    const ItemDetails = this.addItemslist.at(index);
    ItemDetails.patchValue({
      Rate: '',
      Discount: '',
      CGST: '',
      SGST: '',
      TotalGSTAmount: '',
      DiscountAmount: '',
      IGST: '',
      Manufacturer: '',
      PackSize: '',
      BuyPrice: '',
      Machine: '',
      ManufactureGuid : ''
      // UTGST: '',
    }, { emitEvent: true })

  }

  /**
  *
  * @param ItemSearch this event is used for search the items
  */
  ItemSearch(event: any, index: any) {
    this.isdisable = false;
    this.allItemsList = this.allItems.filter((Items: any) => Items.ItemGuid == event.ItemGuid && Items.ItemName == event.ItemName);
    this.gstNumber = event.GSTTax
    const duplicateIndex = this.addItemslist.value.findIndex((item: any, index: number) =>
      item.ItemGuid == event.ItemGuid && index != this.addItemslist.length - 1);
    if (duplicateIndex >= 0) {
      const itemControl = this.addItemslist.at(index);
      itemControl.patchValue({
        ItemName: '',
        ItemGuid: ''
      });
      this.addItemslist.value[index].DuplicateItemCheck = true
    } else {
      const ItemDetails = this.addItemslist.at(index);
      ItemDetails.patchValue({
        ItemGuid: event.ItemGuid,
        PackSize: Number(event.PackSize), 
        CatalogNo: event.CatalogNo,
        Category: event.Category,
        HSNCode: event.HSNCode,
        ItemName: event.ItemName,
        ItemNo: event.ItemNo,
        Machine: event.Machine,
        MajorUnitName: event.MajorUnitName,
        MinorUnitName: event.MinorUnitName,
        Manufacturer: event.Manufacturer,
        ItemCategoryName: event.Category,
        ManufactureGuid: event.ManfactureGuid,
      }, { emitEvent: true })
    }
    this.allItems = this.allItemsList?.filter((Items: any) => Items.ItemGuid != event.ItemGuid && Items.ItemName != event.ItemName);
  }


  /**
  *
  * @param changeRate this event is used for calculate item prices
  */
  changeRate(event: any, index: any) {
    let discountAmount: any = 0
    let totalGstAmount: any = 0
    let totalGst: any = ''
    let finalPrice: any = 0
    let IGSTper: any = 0
    const itemDetails = this.addItemslist.at(index);
    const item = this.newQuotationForm.get('lstItemsDetails')?.value[index];
    const itemPrice = parseFloat(item.Rate);
    const cgstper = parseFloat(item.CGST) || 0;
    const CGSTper = cgstper > 100 ? Math.floor(cgstper / 10) : cgstper
    let sgstper = item.SGST || 0;
    const SGSTper = sgstper > 100 ? Math.floor(sgstper / 10) : sgstper
    const discountPer = parseFloat(item.Discount) || 0;
    const Discountper = discountPer > 100 ? Math.floor(discountPer / 10) : discountPer
    discountPer > 0 ? (itemPrice - (itemPrice * discountPer / 100)) : 0;
    discountAmount = discountPer > 0 ? ((itemPrice * Discountper / 100)) : 0;
    const TotalRateofdiscount = discountPer > 0 ? (itemPrice - (itemPrice * Discountper / 100)) : 0
    finalPrice = TotalRateofdiscount + totalGstAmount;
    const igstPer = item.IGST || '';
    IGSTper = igstPer > 100 ? Math.floor(igstPer / 10) : igstPer
    if (CGSTper != 0 && SGSTper != 0 && CGSTper <= 50 && SGSTper <= 50) {
      const totalGst = CGSTper + Number(SGSTper)
      const totalGstAmount = TotalRateofdiscount ? (totalGst * TotalRateofdiscount) / 100 : (totalGst * itemPrice / 100);
      finalPrice = TotalRateofdiscount ? (TotalRateofdiscount) + totalGstAmount : (totalGstAmount + itemPrice);
      itemDetails.patchValue({
        TotalGSTAmount: totalGstAmount || 0,
        DiscountAmount: discountAmount || 0,
        IGST: SGSTper != 0 ? 0 : totalGst || 0,
        BuyPrice: finalPrice || 0,
        SGST: SGSTper == 0 ? '' : SGSTper
      }, { emitEvent: true });
    } else {
      const TotalGst = CGSTper + SGSTper
      const totalGstAmount = TotalGst > 0 ? (TotalRateofdiscount ? (Number(TotalGst) * TotalRateofdiscount) / 100 : (Number(TotalGst) * itemPrice / 100)) : (TotalRateofdiscount ? (Number(IGSTper) * TotalRateofdiscount) / 100 : (Number(IGSTper) * itemPrice / 100));
      finalPrice = TotalRateofdiscount ? (TotalRateofdiscount) + totalGstAmount : (totalGstAmount + itemPrice);
      itemDetails.patchValue({
        TotalGSTAmount: totalGstAmount || 0,
        DiscountAmount: discountAmount || 0,
        IGST: (this.quotationGuid && (this.addItemslist.value[index].SGST == 0 && this.addItemslist.value[index].CGST == 0)) ? this.addItemslist.value[index].IGST : ((this.addItemslist.value[index].SGST == ''   && this.addItemslist.value[index].CGST == '') || (this.addItemslist.value[index].SGST == 0 && this.addItemslist.value[index].CGST == 0) ? this.addItemslist.value[index].IGST : 0),
        BuyPrice: finalPrice || 0,
        // SGST: SGSTper == 0 ? '' : SGSTper
      }, { emitEvent: true });
    }

    if (discountPer > 100 || cgstper > 50 || sgstper > 50) {
      itemDetails.patchValue({
        Discount: discountPer > 100 ? Math.floor(discountPer / 10) : discountPer,
        CGST: cgstper > 50 ? Math.floor(cgstper / 10) : cgstper,
        SGST: sgstper > 50 ? Math.floor(sgstper / 10) : sgstper,
      });
    }
  }

  changeIgst(index: any) {
    const itemDetails = this.addItemslist.at(index);
    const item = this.newQuotationForm.get('lstItemsDetails')?.value[index];
    const igstPer = item.IGST || 0;
    const IGSTper = igstPer > 100 ? Math.floor(igstPer / 10) : igstPer
    const itemPrice = parseFloat(item.Rate);
    const discountPer = parseFloat(item.Discount) || 0;
    const discountwithGst = discountPer > 0 ? (itemPrice - (itemPrice * discountPer / 100)) : 0
    const totalGstAmount = discountwithGst > 0 ? (discountwithGst * IGSTper / 100) : (IGSTper * itemPrice) / 100;
    const discountAmount = discountPer > 0 ? (itemPrice - (itemPrice * discountPer / 100)) : 0;
    const finalPrice = discountAmount > 0 ? discountAmount + (discountAmount * IGSTper / 100) : (itemPrice + totalGstAmount);
    itemDetails.patchValue({
      IGST: IGSTper || '',
      CGST: 0,
      SGST: 0,
      TotalGSTAmount: totalGstAmount || 0,
      BuyPrice: finalPrice || 0,
    });
  }



  onDateSelect(date: NgbDateStruct) {
    this.selectFromDate = date
    this.selectedDate = date
    this.newQuotationForm.patchValue({
      ToDate: ''
    });
  }

  restrictCharectors(event: any) {
    const allowedRegex = /[0-9]/g;
    if (!event.key.match(allowedRegex)) {
      event.preventDefault();
    }
  }

  restrictCharectorsInTax(event: any) {
    const allowedRegex = /[0-9.]/g;
    if (!event.key.match(allowedRegex)) {
      event.preventDefault();
    }
  }
  onClickMultiselect(formcontrolName: any) {
    this.newQuotationForm.get(formcontrolName)?.markAsTouched();
  }
  getManufacturers() {
    this.allItemsService.getItemsDefaults().subscribe(
      (data) => {
        this.lstManufacturers = data.Result.getManufactures;
        this.shimmerVisible = false;
      }, err => {
        this.shimmerVisible = false;
      })
  }
  changeManufacture(event: any, index: any) {
    const ItemDetails = this.addItemslist.at(index);
    if (event === null || event === undefined) {
      ItemDetails.patchValue({
        ManufactureGuid: null,
        Manufacturer: null,
        PackSize: ''
      }, { emitEvent: false });
    } else {
      ItemDetails.patchValue({
        ManufactureGuid: event.ManufactureGuid,
        Manufacturer: event.ManufactureName,
        PackSize: ''
      }, { emitEvent: false });
    }
  }
  UplodeInvoice(event: any) {
    this.FormChanged = true
    this.fileToUpload = event.srcElement.files[0];
    const allowed_types = ['application/pdf', 'application/msword', 'application/docx', 'application/doc', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!_.includes(allowed_types, event.target.files[0]?.type)) {
      const resumePdfInput = document.getElementById('upload-resume') as HTMLInputElement
      if (resumePdfInput) {
        resumePdfInput.value = '';
      }

      this.isFileUplodad = true
      this.ShowPdfFile = "Please upload pdf, doc, docx file only!";
      return; 
    }
    const formData: FormData = new FormData();
    var fileName = this.fileToUpload.name;
    fileName = fileName.substring(0, fileName.lastIndexOf('.'));
    formData.append('File', this.fileToUpload, this.fileToUpload.name);
    formData.append('FileName', ("").concat(this.fileToUpload.name));
    this.grnService.Uploadinvoice(formData).subscribe((data:any) => {
      this.isFileUplodad = false
      this.InvoiceDocument = data.result;
      this.FileName = this.fileToUpload.name,
      this.File = 'null',
      this.FilePath = data.result,
      this.OriginalFileName = this.fileToUpload.type
      this.AddInvoice()
    },
      (err) => {
      });
  }
  PreviewInvoice(value: any) {
    this.Document = value;
  }
  onRemoveFile(){
    const resumePdfInput = document.getElementById('upload-resume') as HTMLInputElement
    resumePdfInput.value = ''
  }
  AddInvoice(){
    this.InvoiceDocuments.push(this.fb.group({
      FileName: this.FileName,
      File: this.File,
      FilePath: this.FilePath,
      OriginalFileName: this.OriginalFileName
    }))
  }
  /**
   * this event used to remove the documents
   * @param index
   */
  remove(index: any) {
    this.FormChanged=true
    const resumePdfInput = document.getElementById('upload-resume') as HTMLInputElement
    if (resumePdfInput) {
      resumePdfInput.value = '';
    }
    if (this.quotationGuid != '') {
      this.InvoiceDocumentsList?.map((element: any) => {
        if (element.Id == this.InvoiceDocuments.value[index].Id) {
          element.IsDeleted = true
        }
      });
    }
    this.InvoiceDocuments.removeAt(index)
  }
  selectQuotation(ItemDetails:any){
    this.QuotationItem=ItemDetails?.ItemName
    this.ItemquotationGuid=ItemDetails?.ItemQuotationGuid
  }
  UpdateQuotationCancel() {
    let input = {
      QuotationGuid: this.ItemquotationGuid,
      UserGuid: this.userGuid,
      CancelReason: this.ItemCancelReason,
      IsCancel: true 
    }; 
    this.quotationService.UpdateQuotationItemCancel(input).subscribe(
      (data: any) => {
        this.ItemquotationGuid = '';
        this.getAllQuotationDetails()
      },
      (err: any) => {
        
      }
    );
  } 
}


