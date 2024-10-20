import { Component, TemplateRef } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GlobalService } from 'src/app/core/Services/global.service';
import { SupplierService } from 'src/app/core/Services/supplier.service';
import { Subject, debounceTime } from 'rxjs';
import { FormValueTrimeer, UsernameValidator } from 'src/Utils/validators';
import { AuthenticationService } from 'src/app/core/Services/authentication.service';

@Component({
  selector: 'app-new-supplier',
  templateUrl: './new-supplier.component.html',
  styleUrls: ['./new-supplier.component.scss']
})
export class NewSupplierComponent {
  /**
* Type:Properties 
* Declare all the intermediate properies 
*/
  shimmerVisible: boolean;
  suppliersForm: FormGroup = {} as any;
  SupplierGuid: any = "00000000-0000-0000-0000-000000000000"
  LstSupplierDefaultsData: any = [];
  LstCategoryTypes: any = [];
  LstSupplierType: any = [];
  LstCenterStateType: any = [];
  LstCenterCountryType: any = [];
  LstSupplierCategoryfilterType: any = [];
  LstSupplierOrganaizationfilterType: any = [];
  FormChanged: boolean = false;
  // GSTNo: any=[];
  SupplierDerailsForEdit: any = [];
  Keyword: any;
  itemOrder: any;
  sort: string = '';
  pageNumber: any = 1;
  rowCount: any = 1000
  totalCount: boolean = false;
  modelChanged = new Subject<string>();
  supplierList: any=[];
  isDuplicate: boolean;
  Active:any='';
  saveresponse:any
  isEmailDuplicate : boolean ;
  /**
   * 
   * @param fb 
   * @param supplierService 
   */
  constructor(
    private fb: FormBuilder,
    public supplierService: SupplierService,
    private router: Router,
    private modalService: NgbModal,
    public globalService: GlobalService,
    public route: ActivatedRoute,
    private authenticationService: AuthenticationService,
  ) {
    this.modelChanged
      .pipe(debounceTime(1000))
      .subscribe(model => {
        this.Keyword = model;
        this.getSuppliers();
      })
  }
  /**
     * Type : Angular hook 
     * this method is used for on page load functions
     */
  ngOnInit(): void {
    this.SupplierGuid = this.route.snapshot.paramMap.get('SupplierGuid') || '';
    console.log("SupplierGuid",this.SupplierGuid)
    let SupplierDerails: any = localStorage.getItem('SupplierDetails');
    this.SupplierDerailsForEdit = JSON.parse(SupplierDerails);
    this.GetSupplierPostDefaults()
    this.initForms();
    // this.suppliersForm.controls['GSTNo'].setValue(this.GSTNo);
    this.suppliersForm.valueChanges.pipe().subscribe(values => {
      this.FormChanged = true;
    }
    );
    this.getSuppliers();
    //this.isDuplicateEmailOrMobile()
  }
  /**
   * Type: Form
  * This function will setup thte page
  * Forms Initialization
  */
  initForms(): void {
    this.suppliersForm = this.fb.group({
      SupplierGuid: [this.SupplierGuid],
      SupplierName: ['', [Validators.required, UsernameValidator.cannotContainSpace]],
      SupplierCode: ['', [Validators.required]],
      Street:  ['', [Validators.required, UsernameValidator.cannotContainSpace]],
      SupplierTypeGuid: [null, [Validators.required]],
      SupplierCategoryGuid: ['', Validators.required],
      OrganizationTypeGuid: ['', [Validators.required]],
      HouseNo: ['',[Validators.required, UsernameValidator.cannotContainSpace]],
      StateGuid: ['', [Validators.required]],
      CountryGuid: ['', [Validators.required]],
      PinCode: [null, [Validators.required]],
      Landline: [''],
      FaxNo: [''],
      EmailId: ['', Validators.compose([Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/), Validators.required, UsernameValidator.cannotContainSpace])],
      Website: [''],
      OracleVendorCode: [''],
      OracleVendorSite: [''],
      PrimaryContactPerson: ['', [Validators.required, UsernameValidator.cannotContainSpace]],
      PrimaryContactPersonDesignation: ['', [Validators.required, UsernameValidator.cannotContainSpace]],
      PrimaryContactPersonMobileNo: [null, Validators.required],
      PrimaryContactPersonEmailId: ['', Validators.compose([Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/), Validators.required, UsernameValidator.cannotContainSpace])],
      SecondaryContactPerson: [''],
      SecondaryContactPersonDesignation: [''],
      SecondaryContactPersonMobileNo: [''],
      SecondaryContactPersonEmailId: [''],
      PaymentTerms: [''],
      Taxes: [''],
      DeliveryTerms: [''],
      VendorToNotes: [''],
      Address: ['', []],
      BankAccountNo: ['', [Validators.minLength(8),
      Validators.maxLength(20)]],
      BankIFSCCode: ['', [Validators.pattern(/^[A-Za-z]{4}[0][A-Za-z0-9]{6}$/)]],
      BankName: [''],
      BankAddress: [''],
      BankBranch: [''],
      BankCity: [''],
      BankState: [''],
      GSTNo: [null, Validators.compose([
        Validators.pattern('^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$')
      ])],
      GSTStateGuid: [''],
      IsDeleted: [false],
      IsVerified:[false]
    });
  }
  get u() {
    return this.suppliersForm.controls;
  }
  get SupplierName() {
    return this.suppliersForm.value.SupplierName?.trim();
  }
  get HouseNo() {
    return this.suppliersForm.value.HouseNo?.trim();
  }
  get Street() {
    return this.suppliersForm.value.Street?.trim();
  }
  get PrimaryContactPerson() {
    return this.suppliersForm.value.PrimaryContactPerson?.trim();
  }
  get PrimaryContactPersonDesignation() {
    return this.suppliersForm.value.PrimaryContactPersonDesignation?.trim();
  }
  get Address() {
    return this.suppliersForm.value.Address?.trim();
  }
  get PrimaryContactPersonEmailId() {
    return this.suppliersForm.value.PrimaryContactPersonEmailId?.trim();
  }
  get EmailId() {
    return this.suppliersForm.value.EmailId?.trim();
  }
  /**
   * Type:service call
   *  Method - To save the  Supplier Details
   */
  SaveSupplierDetails(): void {
    this.globalService.startSpinner();
    FormValueTrimeer.cleanForm(this.suppliersForm);
    this.supplierService.SaveSupplierDetails(this.suppliersForm.value).subscribe(
      (response) => {
        this.saveresponse=response;
        if( this.suppliersForm.value.SupplierGuid==""){
          this.globalService.stopSpinner()
          this.SendSupplierEmail()
          this.router.navigateByUrl('/auth/supplier-verified');
        }else{
          this.router.navigateByUrl('/suppliers');
        }
        this.globalService.stopSpinner()
      },
      (err) => {
        this.globalService.stopSpinner()
      });
      
  }
   /**
   * Type:service call
   *  Method - To save the  Supplier Details
   */
   SendSupplierEmail(): void {
    const today=new Date();
    const year=today.getFullYear();
    let body={
      to:this.saveresponse.PrimaryContactPersonEmailId,
      Body:"",
      subject: "SupplierVerification",
      lstReplacebleVariables: [
        {
          user: this.saveresponse.SupplierName,
          year: year,
          supplierGuid: this.saveresponse.SupplierGuid
        }
      ]
    }
    this.authenticationService.sendEmail(body).subscribe((res: any) => {
    })
  }
  /**
   * Type:service call
   *  Method - To get supplier post defalut details
   */
  GetSupplierPostDefaults() {
    // this.globalService.startSpinner();
    this.shimmerVisible = true;
    this.supplierService.GetSupplierPostDefaults().subscribe(getsupplierpostresponse => {
      if (getsupplierpostresponse != null && getsupplierpostresponse != undefined) {
        this.LstSupplierDefaultsData = getsupplierpostresponse.Result;
        this.LstCategoryTypes = getsupplierpostresponse.Result.CategoryType;
        this.LstSupplierType = getsupplierpostresponse.Result.SupplierType;
        this.LstSupplierCategoryfilterType = this.LstSupplierType.filter((item: any) => item.Type === 'Category');
        this.LstSupplierOrganaizationfilterType = this.LstSupplierType.filter((item: any) => item.Type === 'Organization');
        this.LstCenterStateType = getsupplierpostresponse.Result.CenterStateType;
        this.LstCenterCountryType = getsupplierpostresponse.Result.CenterCountryType;
        // this.globalService.stopSpinner()
        this.shimmerVisible = false;
      }
      if (this.SupplierGuid) {
        this.GetEditSupplierDetails()
      }
    },
      error => {
        // this.globalService.stopSpinner()
        this.shimmerVisible = false;
      });
  }
  /**
   * this method is used to get the duplicate suppliers while passing the kwyword
   */
  getSuppliers(): any {
    // this.globalService.startSpinner();
    //this.shimmerVisible = true;
    this.Keyword = (this.Keyword == undefined || this.Keyword == null) ? this.Keyword || "" : this.Keyword
    this.supplierService.GetAllSuppliers(this.Keyword, this.itemOrder, this.sort, this.pageNumber, this.rowCount, 'AddSupplier',this.Active).subscribe(data => {
      if (data.Result.TotalCount > 0) {
        this.supplierList=data.Result.GetAllSuppliers       
        this.totalCount = true;
      }
      else {
        this.totalCount = false;
      }
      if(this.SupplierGuid==''){
        let SupplierUnqCount: any = this.supplierList[0]?.SupplierCount      
        const result = 'YDVC' + ('00000' + (Number(SupplierUnqCount) + 1)).slice(-5);
        this.suppliersForm.patchValue({
        SupplierCode: result
      })
    }
      // this.globalService.stopSpinner();
    // this.shimmerVisible = false;
    },
      error => {
        // this.globalService.stopSpinner();
      //  this.shimmerVisible = false;
      });
    //  !this.SupplierGuid?this.focusOutFunction():''
  }
  /**
   * This event is used to search the supplier name
   * @param event 
   */
  updateFilter(event: any) {
    this.modelChanged.next(event.target.value)
  }
  /**
   * Type : click(event)
   *  Method - Mobile number validator
   */
  public matcher(event: any) {
    const allowedRegex = /[0-9]/g;

    if (!event.key.match(allowedRegex)) {
      event.preventDefault();
    }
  }
  /**
    * Type:click event
    * For close the profile
    */
  closeSuppliers() {
    this.suppliersForm.reset({
      CountryGuid: '',
      StateGuid: '',
      OrganizationTypeGuid: '',
      SupplierCategoryGuid: '',
      SupplierType: '',
      GSTStateGuid: '',
      SupplierName: '',
      HouseNo:'',
      Street:'',
      PrimaryContactPerson:'',
      PrimaryContactPersonDesignation:'',
      Address:'',
      PrimaryContactPersonEmailId:'',
      EmailId:'',
      SupplierCode:''


    });
    if (this.SupplierDerailsForEdit) {
      this.GetEditSupplierDetails();
    }
    this.FormChanged=false;
  }
  // openXlModal(content: TemplateRef<any>) {
  //   this.modalService.open(content, {size:'md'}).result.then((result) => {
  //   }).catch((res) => {});
  // }
  onInput(event: any) {
    const input = event.target as HTMLInputElement;
    input.value = input.value.toUpperCase();

  }
  FormReset() {
    this.suppliersForm.reset()
    this.initForms();
    if (this.SupplierGuid) {
      this.suppliersForm.patchValue({
        SupplierName: this.SupplierDerailsForEdit.SupplierName,
        SupplierCode: this.SupplierDerailsForEdit.SupplierCode
      })
    }
  }
  GetEditSupplierDetails() {
    this.suppliersForm.patchValue({
      SupplierGuid: this.SupplierGuid,
      SupplierName: this.SupplierDerailsForEdit.SupplierName,
      SupplierCode: this.SupplierDerailsForEdit.SupplierCode,
      Street: this.SupplierDerailsForEdit.Street,
      SupplierTypeGuid: this.SupplierDerailsForEdit.SupplierCategoryGuid,
      SupplierCategoryGuid: this.SupplierDerailsForEdit.SupplierTypeGuid,
      OrganizationTypeGuid: this.SupplierDerailsForEdit.OrganizationTypeGuid,
      HouseNo: this.SupplierDerailsForEdit.SupplierHouseNo,
      StateGuid: this.SupplierDerailsForEdit.SupplierStateGuid,
      CountryGuid: this.SupplierDerailsForEdit.SupplierCountryGuid,
      PinCode: this.SupplierDerailsForEdit.SupplierPinCode,
      Landline: this.SupplierDerailsForEdit.SupplierLandline,
      FaxNo: this.SupplierDerailsForEdit.SupplierFaxNo,
      EmailId: this.SupplierDerailsForEdit.SupplierEmailId,
      Website: this.SupplierDerailsForEdit.SupplierWebsite,
      OracleVendorCode: this.SupplierDerailsForEdit.OracleVendorCode,
      OracleVendorSite: this.SupplierDerailsForEdit.OracleVendorSite,
      PrimaryContactPerson: this.SupplierDerailsForEdit.PrimaryContactPerson,
      PrimaryContactPersonDesignation: this.SupplierDerailsForEdit.PrimaryContactPersonDesignation,
      PrimaryContactPersonMobileNo: this.SupplierDerailsForEdit.PrimaryContactPersonMobileNo,
      PrimaryContactPersonEmailId: this.SupplierDerailsForEdit.PrimaryContactPersonEmailId,
      SecondaryContactPerson: this.SupplierDerailsForEdit.SecondaryContactPerson,
      SecondaryContactPersonDesignation: this.SupplierDerailsForEdit.SecondaryContactPersonDesignation,
      SecondaryContactPersonMobileNo: this.SupplierDerailsForEdit.SecondaryContactPersonMobileNo,
      SecondaryContactPersonEmailId: this.SupplierDerailsForEdit.SecondaryContactPersonEmailId,
      PaymentTerms: this.SupplierDerailsForEdit.PaymentTerms,
      Taxes: this.SupplierDerailsForEdit.Taxes,
      DeliveryTerms: this.SupplierDerailsForEdit.DeliveryTerms,
      VendorToNotes: this.SupplierDerailsForEdit.VendorToNotes,
      //GSTN: this.SupplierDerailsForEdit.,
      Address: this.SupplierDerailsForEdit.GSTAddress,
      GSTNo: this.SupplierDerailsForEdit.GSTNo,
      GSTStateGuid: this.SupplierDerailsForEdit.GSTNStateGuid,
      BankAccountNo: this.SupplierDerailsForEdit.BankAccountNo ? this.SupplierDerailsForEdit.BankAccountNo : '',
      BankAddress: this.SupplierDerailsForEdit.BankAddress ? this.SupplierDerailsForEdit.BankAddress : '',
      BankBranch: this.SupplierDerailsForEdit.BankBranchName ? this.SupplierDerailsForEdit.BankBranchName : '',
      BankCity: this.SupplierDerailsForEdit.BankCity ? this.SupplierDerailsForEdit.BankCity : '',
      BankIFSCCode: this.SupplierDerailsForEdit.BankIFSCCode ? this.SupplierDerailsForEdit.BankIFSCCode : '',
      BankName: this.SupplierDerailsForEdit.BankName ? this.SupplierDerailsForEdit.BankName : '',
      BankState: this.SupplierDerailsForEdit.BankState ? this.SupplierDerailsForEdit.BankState : '',
      IsVerified:this.SupplierDerailsForEdit.IsVerified==0?false:true,
      IsDeleted:this.SupplierDerailsForEdit.IsDeleted==0?false:true
    }, { emitEvent: true })
    this.FormChanged = false
  }
  openXlModal(content: TemplateRef<any>) {
    this.modalService.open(content, { size: 'md' }).result.then((result) => {
    }).catch((res) => { });
  }
  focusOutFunction() {
    if (this.SupplierGuid == '' && this.suppliersForm.value.SupplierName) {
      let SupplierUnqId: any = this.supplierList[0]?.SupplierCount      
      const result = 'YDVC' + ('00000' + (Number(SupplierUnqId) + 1)).slice(-5);
      this.suppliersForm.patchValue({
        SupplierCode: result
      })
    }
    else {
      this.suppliersForm.patchValue({
        SupplierCode: ''
      })
    }

  }
  isDuplicateEmailOrMobile(): boolean {
    if(this.suppliersForm.value.PrimaryContactPersonMobileNo){
      this.isDuplicate= this.supplierList.some((supplier:any) =>
      supplier.PrimaryContactPersonMobileNo === this.suppliersForm.value.PrimaryContactPersonMobileNo
    );
    }
    return this.isDuplicate
  }
  isDuplicateEmail(): boolean {
    if (this.suppliersForm.value.EmailId) {
      this.isEmailDuplicate = this.supplierList.some((supplier: any) =>
        supplier.SupplierEmailId === this.suppliersForm.value.EmailId
      );
    }
    return this.isEmailDuplicate;
  }
  
  /**
    *  It is used to Remove the the specified local storage item.
    */
  ngOnDestroy(): void {
    localStorage.removeItem('SupplierDetails');
  }
}
