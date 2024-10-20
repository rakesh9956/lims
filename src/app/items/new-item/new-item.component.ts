import { HttpErrorResponse } from '@angular/common/http';
import { Component, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbDateParserFormatter, NgbDateStruct, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { distinctUntilChanged, throttleTime } from 'rxjs';
import { AllItemsService } from 'src/app/core/Services/all-items.service';
import { AuthenticationService } from 'src/app/core/Services/authentication.service';
import { GlobalService } from 'src/app/core/Services/global.service.spec';
import { ManufactureService } from 'src/app/core/Services/manufacture.service';
import { CustomDateParserFormatter } from 'src/app/core/Services/ngbdate-format.service';
import { FormValueTrimeer, UsernameValidator } from 'src/Utils/validators';
@Component({
  selector: 'app-new-item',
  templateUrl: './new-item.component.html',
  styleUrls: ['./new-item.component.scss'],
  providers: [
    { provide: NgbDateParserFormatter, useClass: CustomDateParserFormatter },
  ],
})
export class NewItemComponent {
  shimmerVisible: boolean;
  selectedDate: NgbDateStruct;
  itemDetailsForm: FormGroup = {} as any;
  PurchaseForm: FormGroup = {} as any;
  ManufactureForm: FormGroup = {} as any;
  SaveSubcategeorytypeForm: FormGroup = {} as any;
  FormChanged: boolean;
  save: any;
  lstDepartmentType: any = [];
  lstGetItemType: any = [];
  lstMachines: any = [];
  lstManufacturers: any = [];
  lstCategoryType: any = [];
  lstUnits: any = [];
  categoryGuid: any;
  additemSaved = false;
  ItemGuid: any;
  getItemData: any = [];
  data: any;
  DuplicateMachine: any = []
  pageNumber: any = -1;
  rowCount: any = -1;
  keyword: any = null;
  duplicateItem: boolean = false;
  duplicateMfg: boolean = false;
  manufacturers: any[] = [];
  saveAllCustomManufaturer: any[] = [];
  itemOrder: any = '';
  sort: string = 'desc';
  trimmedValue: any = [];
  allItemsData: any = [];
  UserGuid: string;
  Machinename: any;
  checkcatloNo: boolean = false;
  checDepartment: boolean = false;
  CustomPurchase: any;
  DuplicateCusPurchase: any = [];

  constructor(private modalService: NgbModal,
    private allItemsService: AllItemsService,
    private fb: FormBuilder,
    private globalService: GlobalService,
    private router: Router,
    private route: ActivatedRoute,
    private manufatureService: ManufactureService,
    private authservice: AuthenticationService) { }


  ngOnInit(): void {
    this.inititemDetailsForm();
    this.clickaddItem();
    this.getCategory();
    const currentDate = new Date();
    this.selectedDate = { year: currentDate.getFullYear(), month: currentDate.getMonth() + 1, day: currentDate.getDate() };
    this.itemDetailsForm.patchValue({
      fromDate: this.selectedDate
    })
    this.ItemGuid = this.route.snapshot.paramMap.get('ItemGuid') || '';
    if (this.ItemGuid != '') {
      localStorage.setItem("Type" , "All Items");
      this.clickedit();
    }
    this.itemDetailsForm.valueChanges.pipe(distinctUntilChanged(), throttleTime(500)).subscribe((values: any) => {
      this.FormChanged = true;
    });
    this.UserGuid = this.authservice.LoggedInUser.UserGuid
  }
  openBasicModal(content: TemplateRef<any>) {
    this.modalService.open(content, { size: 'md' }).result.then((result) => {
      console.log("Modal closed" + result);
    }).catch((res) => { });
  }
  inititemDetailsForm() {
    this.itemDetailsForm = this.fb.group({
      categoryGuid: [null, [Validators.required]],
      departmentTypeGuid: [null, [Validators.required,UsernameValidator.cannotContainSpace]],
      itemTypeGuid: [null],
      itemName: ['', [Validators.required, UsernameValidator.cannotContainSpace]],
      itemCode: ['', [Validators.required]],
      hsnCode: [''],
      gstnTax: ['', [Validators.minLength(0), Validators.maxLength(8)]],
      temperatureStock: [null, [Validators.required, UsernameValidator.cannotContainSpace]],
      itemDescription: [''],
      // nonExpItem: [''],
      IsExpirable: false,
      fromDate: [null, [Validators.required]],
      barcodeOption: [null, [Validators.required]],
      barcodeGenerationOption: [null, [Validators.required]],
      IssueInFIFO: false,
      manufacturerGuid: [null, [Validators.required]],
      machineGuid: [null, [Validators.required]],
      catalogNumber: ['', [Validators.required,UsernameValidator.cannotContainSpace]],
      purchasedUnitGuid: [null, [Validators.required]],
      converter: ['', [Validators.required]],
      packSize: ['', [Validators.required]],
      consumptionUnitGuid: [null, [Validators.required]],
      issueMultiplier: ['', [Validators.required]],
      noOfTests: [''],
      LowStockCount: [''],
      ItemGuid: [null],
      IsB2BType:[false]
    })
    this.PurchaseForm = this.fb.group({
      PurchasedUnit: ['']
    })
    this.ManufactureForm = this.fb.group({
      Manufacturer: ['']
    })
    this.SaveSubcategeorytypeForm = this.fb.group({
      CategoryTypeGuid: [''],
      SubCategoryTypeName: ['', [Validators.required]],
      Code: [''],
      Description: ['']
    })
  }

  get itemName() {
    return this.itemDetailsForm.value.itemName?.trim();
  }
  get itemCode() {
    return this.itemDetailsForm.value.itemCode;
  }
  get hsnCode() {
    return this.itemDetailsForm.value.hsnCode;
  }
  get temperatureStock(){
    return this.itemDetailsForm.value.temperatureStock?.trim();
  }
  get gstnTax() {
    return this.itemDetailsForm.value.gstnTax;
  }
  get converter() {
    return this.itemDetailsForm.value.converter;
  }
  get issueMultiplier() {
    return this.itemDetailsForm.value.issueMultiplier;
  }
  get noOfTests() {
    return this.itemDetailsForm.value.noOfTests;
  }
  get catalogNumber() {
    return this.itemDetailsForm.value.catalogNumber?.trim();
  }
  get packSize() {
    return this.itemDetailsForm.value.packSize;
  }
  get SubCategoryTypeName() {
    return this.SaveSubcategeorytypeForm.value.SubCategoryTypeName?.trim();
  } 

 
  getManufacturerPlaceholder() {
    return this.itemDetailsForm.get('manufacturerGuid')?.value ? 'Select manufacturer' : 'Custom placeholder when empty';
  }

  openXlModal(content: TemplateRef<any>) {
    this.modalService.open(content, { size: 'md' }).result.then((result) => {
      console.log("Modal closed" + result);
    }).catch((res) => { });
  }

  onclicksave() {
    if (this.itemDetailsForm.valid) {
      let postbody: any = {
        Manufacturer: this.itemDetailsForm.value.Manufacturer,
        PurchasedUnit: this.itemDetailsForm.value.PurchasedUnit,
        ConsumptionUnit: this.itemDetailsForm.value.ConsumptionUnit
      }
    }
    // this.globalService.startSpinner();
    this.additemSaved = true;
    FormValueTrimeer.cleanForm(this.itemDetailsForm);
    this.allItemsService.saveAddItems(this.itemDetailsForm.value).subscribe(
      (Data) => {
        this.shimmerVisible = true;
        // this.globalService.stopSpinner();
        this.FormChanged = false;
        this.router.navigate(['items'])
      },
      (err: HttpErrorResponse) => {
        this.shimmerVisible = false;
        this.additemSaved = false;
        //this.globalService.stopSpinner();
      }
    );

  }

  clickaddItem() {
    this.shimmerVisible = true;
    // this.globalService.startSpinner();
    this.allItemsService.getItemsDefaults().subscribe(
      (data) => {

        this.lstDepartmentType = data.Result.getDepartmentType;
        this.lstGetItemType = data.Result.GetItemType;
        this.lstMachines = data.Result.getMachines.map((element: any) => ({
          MachineName: element.MachineName.toUpperCase(),
          MachineGuid: element.MachineGuid.toLowerCase()
        }));

        this.lstManufacturers = data.Result.getManufactures;
        this.lstUnits = data.Result.getUnits;
        this.shimmerVisible = false;
      }, err => {
        //this.globalService.stopSpinner();
        this.shimmerVisible = false;
      })
  }
  getCategory() {
    this.allItemsService.getCategory().subscribe((Data) => {
      this.lstCategoryType = Data.Result;
    })
  }

  clickedit() {
    this.allItemsService.getItemDetails(this.ItemGuid).subscribe((data) => {
      this.getItemData = data.Result
      const fromdate = { year: new Date(this.getItemData[0].CreatedDt).getFullYear(), month: new Date(this.getItemData[0].CreatedDt).getMonth() + 1, day: new Date(this.getItemData[0].CreatedDt).getDate() };
      this.selectedDate = { year: new Date(this.getItemData[0].CreatedDt).getFullYear(), month: new Date(this.getItemData[0].CreatedDt).getMonth() + 1, day: new Date(this.getItemData[0].CreatedDt).getDate() };

      this.itemDetailsForm.patchValue({
        ItemGuid: this.getItemData[0].ItemGuid,
        categoryGuid: this.getItemData[0].CategoryTypeGuid,
        departmentTypeGuid: this.getItemData[0].DepartmentGuid,
        itemTypeGuid: this.getItemData[0].ItemtypeGuid,
        itemName: this.getItemData[0].ItemName,
        itemCode: this.getItemData[0].ItemCode,
        hsnCode: this.getItemData[0].ItemHSNCode,
        gstnTax: this.getItemData[0].GstTax,
        temperatureStock: this.getItemData[0].Temperature,
        itemDescription: this.getItemData[0].ItemDescription,
        IsExpirable: this.getItemData[0].NonExpiryItem,
        barcodeOption: this.getItemData[0].BarcodeOption,
        barcodeGenerationOption: this.getItemData[0].BarcodeGenOption,
        IssueInFIFO: this.getItemData[0].FifoNumber,
        manufacturerGuid: this.getItemData[0].ManufactureGuid,
        machineGuid: this.getItemData[0].MachineGuid,
        catalogNumber: this.getItemData[0].CatalogNumber,
        purchasedUnitGuid: this.getItemData[0].PurchaseUnitGuid,
        converter: this.getItemData[0].Converter,
        packSize: this.getItemData[0].PackSize,
        consumptionUnitGuid: this.getItemData[0].ConsumptionUnitGuid,
        issueMultiplier: this.getItemData[0].IssueMultiplier,
        noOfTests : this.getItemData[0].NoOfTests,
        fromDate: fromdate,
        LowStockCount: this.getItemData[0].LowStockCount,
        IsB2BType: this.getItemData[0]?.IsB2BType
      }, { emitEvent: true })
      this.FormChanged = false;
    })
  }
  clickActivate() {
    this.globalService.startSpinner();
    this.allItemsService.DeleteItem(this.ItemGuid).subscribe((data: any) => {
      this.router.navigate(['items'])
      this.globalService.stopSpinner();
    },
      (err: HttpErrorResponse) => {
        this.globalService.stopSpinner();
    })
  }
  
  resetForm() {
    this.itemDetailsForm.markAsUntouched();
    this.itemDetailsForm.reset()
    this.FormChanged = false;
    if(this.ItemGuid!=''){
      this.clickedit();
    }
    this.save = false;
    this.itemDetailsForm.patchValue({
      fromDate:this.selectedDate,
      IssueInFIFO:false, 
      ItemGuid:'',
      gstnTax:'',
      itemDescription:'',
      IsExpirable:false
    })
  }

  clearValidations() {
    this.duplicateMfg = false;
  }


  consumptionsave() {
    //this.FormChanged = true;
  }

  purchasesave() {
    this.PurchaseForm.value.PurchasedUnit
    this.allItemsService.savePurchaseUnit(this.PurchaseForm.value.PurchasedUnit).subscribe((data) => {
      this.itemDetailsForm.patchValue({
        purchasedUnitGuid: data.PurchaseUnitGuid
      })
      this.clickaddItem()
    })
  }

  manufacturesave() {
    //this.globalService.startSpinner();
    let data = this.ManufactureForm.value.Manufacturer;
    this.allItemsService.saveManufacturer(data).subscribe((data) => {
      // this.globalService.stopSpinner();
      this.saveAllCustomManufaturer = data.ManufacturerGuid;
      this.clickaddItem();
      this.lstManufacturers = []
      this.lstManufacturers.push(this.saveAllCustomManufaturer)
      this.itemDetailsForm.patchValue({
        manufacturerGuid: data.ManufacturerGuid
      })
    }, err => {
     // this.globalService.stopSpinner();
    })
  }
  //  Nonexpiryitem(event:any){
  //   console.log(this.itemDetailsForm.value.nonExpItem)
  //     if (this.itemDetailsForm.value.nonExpItem){
  //      this.isdisable = false

  //   }
  //   else{
  //     this.isdisable = true
  //   }

  //  }
  //  disables($event:any){
  //   if (this.itemDetailsForm.value.fromDate != ""){
  //     this.itemDetailsForm.get('nonExpItem')?.disable()

  //   }

  //  }


  allItems(event: any) {
    this.duplicateItem = false;
    // this.keyword = event.ItemName
    if (this.allItemsData.length > 0) {
      const itemNameLowerCase = event.ItemName.toLowerCase();
      this.duplicateItem = this.allItemsData.some((element: any) =>
        element.ItemName.toLowerCase() === itemNameLowerCase
      );
      this.itemDetailsForm.patchValue({
        itemName: ''
      })
      this.allItemsData = []
    } else {
      this.duplicateItem = false;
    }
  }

  changeItem(event: any) {
    if (event.target.value.trim()!='') {
      this.duplicateItem = false
      const storedData = localStorage.getItem('myArrayData');
      this.allItemsData = storedData ? JSON.parse(storedData) : [];
      this.allItemsData = this.allItemsData.filter((item: any) =>
        item.ItemName.toLowerCase().includes(this.itemDetailsForm.value.itemName.toLowerCase())
      );
    } else {
      this.allItemsData = []
    }
  }






  nonExpiryItem() {
    if (this.itemDetailsForm.get('IsExpirable')?.value) {
      this.itemDetailsForm.patchValue({
        IsExpirable: true
      })
    } else {
      this.itemDetailsForm.patchValue({
        IsExpirable: false
      })
    }
  }


  onFifo() {
    if (this.itemDetailsForm.get('IssueInFIFO')?.value) {
      this.itemDetailsForm.patchValue({
        IssueInFIFO: true
      })
    } else {
      this.itemDetailsForm.patchValue({
        IssueInFIFO: false
      })
    }
  }
  /* Checks the Duplicate value of Manufacturers*/
  checkManufacturer(event: any) {
   // this.globalService.startSpinner();
    this.keyword = event.target.value.toLowerCase();
    this.keyword = (this.keyword == undefined || this.keyword == null) ? this.keyword || "" : this.keyword;
    this.manufatureService.getManufacture(this.keyword, this.itemOrder, this.sort, this.pageNumber, this.rowCount).subscribe((data) => {
      this.manufacturers = data.filter((m: any) => m.ManufactureName.toLowerCase() == this.keyword);
      if (this.manufacturers.length > 0) {
        this.duplicateMfg = true;
      } else {
        this.duplicateMfg = false;
      }
    }, error => {
    //  this.globalService.stopSpinner();
    });
  }

  validateInput() {
    const gstnNo = this.itemDetailsForm.value.gstnTax;
    if (gstnNo > 100) {
      const truncatedGstn = Math.floor(gstnNo / 10); // Keep only the first two digits
      this.itemDetailsForm.patchValue({
        gstnTax: truncatedGstn
      });
    }
  }

  // this Event Using Trim the input to the first 8 digits
  HsnCodeInput(event: any) {
    this.itemDetailsForm.value.hsnCode;
    const input = event.target as HTMLInputElement;
    this.trimmedValue = input.value.trim();
    this.trimmedValue = this.trimmedValue.replace(/[^0-9]/g, '')
    if (this.trimmedValue != "") {
      this.trimmedValue = this.trimmedValue.slice(0, 10);
      this.itemDetailsForm.patchValue({
        hsnCode: this.trimmedValue
      });
    }
  }

  focusOutFunction() {
    this.allItems(this.itemDetailsForm.value.itemName)
    if ( this.itemDetailsForm.value.itemName!='' && this.ItemGuid == '' || this.itemDetailsForm.value.itemName && this.duplicateItem == false) {
      let ItemUnqId = localStorage.getItem('ItemUnqId')
      const fullName = this.itemDetailsForm.value.itemName;
      const firstName = fullName.split(' ')[0];
      const result = (firstName.slice(0, 3).toUpperCase()) + (Number(ItemUnqId));
      this.itemDetailsForm.patchValue({
        itemCode: result
      })
    }
    else {
      this.itemDetailsForm.patchValue({
        itemCode: ''
      })
    }

  }
  restrictCharectors(event: any) {
    const allowedRegex = /[0-9]/g;
    if (!event.key.match(allowedRegex)) {
      event.preventDefault();
    }
  }
  SaveMachine() {
    let body = {
      machineName: this.Machinename,
      userGuid: this.UserGuid
    }
    this.allItemsService.SaveMachine(body).subscribe((data: any) => {
      this.clickaddItem()
      this.itemDetailsForm.patchValue({
        machineGuid: data.Result.MachineGuid
      })
    })
  }
  CheckMachineDuplicate(event: any) {
    const inputValue = event.target.value.trim(); 
    if (inputValue === '') 
    {
      this.Machinename = ''; 
    } 
     this.DuplicateMachine = this.lstMachines.filter((Machinename: any) => Machinename.MachineName.toLowerCase() === inputValue.toLowerCase());
  }
  /**
   * this method used to save department
   */
  SaveSubcategeorytype() {
    this.SaveSubcategeorytypeForm.patchValue({
      CategoryTypeGuid: this.itemDetailsForm.value.categoryGuid
    })
    this.allItemsService.SaveSubcategeorytype(this.SaveSubcategeorytypeForm.value).subscribe((data: any) => {
      this.itemDetailsForm.patchValue({
        departmentTypeGuid: data.SubCategoryTypeGuid
      })
      this.SaveSubcategeorytypeForm.reset();
      this.clickaddItem();
    },
      err => {

      })
  }
  DepartmentCheck(event: any) {
    const inputvalue=event.target.value.trim();
    let duplicateCatlog = this.lstDepartmentType.filter((item: any) => item.SubCategoryTypeName.toLowerCase() == inputvalue.toLowerCase())
    if (duplicateCatlog?.length > 0) {
      this.checDepartment = true
    }
    else {
      this.checDepartment = false
    }
  }
  CatlogduplicateCheck(event: any) {
    if (event.target.value != "" && event.target.value.toLowerCase()!='n/a') {
      const storedData = localStorage.getItem('myArrayData');
      let AllItemsData = storedData ? JSON.parse(storedData) : [];
      let duplicateCatlog = AllItemsData.filter((item: any) => item.CatalogNo.toLowerCase() == event.target.value.toLowerCase())
      if (duplicateCatlog?.length > 0) {
        this.checkcatloNo = true
      }
      else {
        this.checkcatloNo = false
      }
    }
  }

  saveCustomPurchase() {
    let body ={
      unitName: this.CustomPurchase
    }
    this.allItemsService.SaveCustomPurchaseUnit(body).subscribe(data => {
      this.clickaddItem();
      this.itemDetailsForm.patchValue({
        purchasedUnitGuid: data.PurchasedUnitGuid
      })
    })
  }

  CheckCustomPurchaseDuplicate(event: any) {
    const inputValue = event.target.value.trim(); 
    if (inputValue === '') 
    {
      this.CustomPurchase = ''; 
    } 
     this.DuplicateCusPurchase = this.lstUnits.filter((CusPurchase: any) => CusPurchase.UnitName.toLowerCase() === inputValue.toLowerCase());
  }
  /**
   * this change event used to select the b2b2 type item
   */
  IsB2BType(){
    if (this.itemDetailsForm.get('IsB2BType')?.value) {
      this.itemDetailsForm.patchValue({
        IsB2BType: true
      })
    } else {
      this.itemDetailsForm.patchValue({
        IsB2BType: false
      })
    }
  }
}