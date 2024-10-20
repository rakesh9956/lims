import { Component, OnInit, TemplateRef } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router, withRouterConfig } from '@angular/router';
import { error } from 'console';
import { StoreLocationsService } from 'src/app/core/Services/store-locations.service';
import { UserManagementService } from 'src/app/core/Services/user-management.service';
import { GlobalService } from 'src/app/core/Services/global.service';
import { NotificationService } from 'src/app/core/Services/notification.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject, debounceTime } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthenticationService } from 'src/app/core/Services/authentication.service';
import { FormValueTrimeer, UsernameValidator } from 'src/Utils/validators';
@Component({
  selector: 'app-new-center',
  templateUrl: './new-center.component.html',
  styleUrls: ['./new-center.component.scss']
})
export class NewCenterComponent implements OnInit {
  shimmerVisible:boolean;
  centreForm: FormGroup = {} as any;
  locCentre: any;
  LocCentre: any;
  lstPanelCentreType: any = [];
  lstPanelBusinesszone: any = [];
  lstPanelState: any = [];
  lstPanelzone: any = [];
  lstPanelCountry: any = [];
  lstPanelCity: any = [];
  lstPanelLocality: any = [];
  stateGuid: any;
  stateCitys: any;
  cityLocations: any;
  cityGuid: any;
  locLocations: any;
  locGuid: any;
  businessZoneGuid: any;
  stateLoc: any;
  lstPanelHeadquarter: any;
  addNewCentre: any;
  editData: any;
  types: any[] = [];
  labtype: any;
  lstPanelGrup: string[] = [];
  lisPanel: any[] = [];
  isDisabled = false;
  lstDesignation: any[] = [];
  BusinessZoneLoc: any[] = [];
  onCentreForm: boolean;
  isCpVisible: boolean =false;
  isPsVisible: boolean = false;
  cpIsValid: boolean = false;
  DuplicateCheck: boolean = false;
  EmailResponse: string = "";
  EmailValid: boolean = false;
  keyword: any;
  Keyword: any;
  pageNumber =1
  centresName: any;
  rowCount= 40;
  centerExists: boolean;
  modelChanged = new Subject<string>();

  constructor(
    private locationService: StoreLocationsService,
    private fb: FormBuilder,
    private router: ActivatedRoute,
    private route: Router,
    private usermng: UserManagementService,
    private globalService: GlobalService,
    private notificationService: NotificationService,
    private modalService: NgbModal,
    private authService: AuthenticationService,
    private centreService: StoreLocationsService
  ) { 
    this.modelChanged.pipe(debounceTime(1000)).subscribe(model => {
      this.Keyword = model;
      this.getAllCentreDetails();
    });
  }

  ngOnInit(): void {
    this.addNewCentre = this.router.snapshot.params['AddCentre'];
    this.locCentre = localStorage.getItem('Centre');
    // this.LocCentre = JSON.parse(this.locCentre); 
    this.getAddCentreDefaults();
    this.inItForms();
    this.centreForm.valueChanges
      .pipe().subscribe(values => {
        this.onCentreForm = true;
      });
  }

  inItForms(): void {
    this.centreForm = this.fb.group({
      CentreTypeGuid: [null, [Validators.required]],
      Type: [null],
      //PatientType: [''],
      CenterName: ['',[Validators.required, UsernameValidator.cannotContainSpace]],
      CenterCode: [''],
      UHIDAbbCode: [''],
      Address: ['',[Validators.required, UsernameValidator.cannotContainSpace]],
      CountryGuid: [''],
      BusinessZoneGuid: [''],
      StateGuid:[null],
      CityGuid: [null],
      //CityZoneGuid: [null],
      LocalityGuid: [null],
      LandlineNo: [''],
      MobileNo: ['',Validators.compose([Validators.pattern('^[0-9]{10}$')])],
      Email: ['', Validators.compose([Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)])],
      ContactPersonName: [''],
      ContactPersonMobile: ['',Validators.compose([Validators.pattern('^[0-9]{10}$')])],
      ContactPersonEmail: ['', Validators.compose([Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)])],
      Designation: [null],
      OwnerName: [''],
      PanCardNo: ['', Validators.compose([Validators.pattern('^[A-Za-z]{5}[0-9]{4}[A-Za-z]$')])],
      PancardName: [''],
      SalesManager: [''],
      ProMaster: [''],
      PaymentMode: [''],
      RollingAdvance: [''],
      InvoiceEmailID: [''],
      SecurityAmountComment: [''],
      MinBusinessCom: [''],
      GSTTIN: [''],
      InvoiceBillingCycle: [''],
      BankName: [''],
      AccountNo: [''],
      IFSCCode: [''],
      InvoiceTo: [''],
      InvoiceDisplayName: [''],
      InvoiceDisplayNo: [''],
      InvoiceDisplayAddress: [''],
      MinCashBooking: [''],
      TagProcessingLabGuid: [''],
      TagBusinessUnitGuid: [''],
      SecurityDeposit: [''],
      IntimationLimit: [''],
      ReportingLimit: [''],
      BookingLimit: [''],
      ShowIntimation: [''],
      LockPrinting: [''],
      LockBooking: [''],
      PaymentExpiryDate: [''],
      BarCodeType: [''],
      SetofBarCode: [''],
      SampleCollectionOnRegistration: [''],
      BarcodePrintedCenterVisit: [''],
      BarcodePrintedHomecollectionVisit: [''],
      HideAmountInBooking: [''],
      ShowBalanceAmount: [''],
      HideReceiptRate: [''],
      SampleReCollectAfterReject: [''],
      AllowDoctorShare: [''],
      MRPBill: [''],
      userName: ['', [Validators.required, Validators.email]],
      UserPassword: ['' ,Validators.compose([
        Validators.required,
        this.patternValidator(/[?=.*?[0-9]/, { hasNumber: true }),
        this.patternValidator(/[A-Z]/, { hasCapitalCase: true }),
        this.patternValidator(/[a-z]/, { hasSmallCase: true }),
        this.patternValidator(/[!@#$%^&*)(]/, { hasSpecialCharacter: true }),
        Validators.minLength(8)
      ])],  
      LedgerPassword: ['', [Validators.required]],
      PanelGuid: [''],
      ZoneGuid: [null],
      Country: [''],
      centreTypeGuid: [null, [Validators.required]],
      Mobile: [''],
      ContactPerson: ['',[Validators.required, UsernameValidator.cannotContainSpace]]
      // PatientType: []
    },
    { validators: [this.checkPasswords('UserPassword', 'LedgerPassword')] })
    
  }

  patternValidator(regex: RegExp, error: ValidationErrors) {
    return (control: AbstractControl): any => {
      if (!control.value) {
        // if control is empty return no error
        return null;
      }

      // test the value of the control against the regexp supplied
      const valid = regex.test(control.value);

      // if true, return no error (no error), else return error passed in the second parameter
      return valid ? null : error;
    };
  }

  checkPasswords(passwordKey: string, passwordConfirmationKey: string) {
    return (group: FormGroup) => {
      let passwordInput = group.controls[passwordKey],
        passwordConfirmationInput = group.controls[passwordConfirmationKey];
      if (passwordInput.value !== passwordConfirmationInput.value) {
        return passwordConfirmationInput.setErrors({ notEquivalent: true })
      }
      else {
        return passwordConfirmationInput.setErrors(null);
      }
    }
  }
  getAddCentreDefaults() {
    // this.globalService.startSpinner();
    this.shimmerVisible=true;
    this.locationService.GetAddCentreDefaults().subscribe(data => {
      this.lstDesignation = data.Result?.LstDesignationType
      this.lstPanelCentreType = data.Result?.LstPanelCentreType || [];
      this.lstPanelBusinesszone = data.Result?.LstPanelBusinesszone || [];
      this.lstPanelHeadquarter = data.Result?.LstPanelHeadquarter || [];
      this.lstPanelState = data.Result?.LstPanelState || [];
      this.lstPanelzone = data.Result?.LstPanelzone || [];
      this.lstPanelCountry = data.Result?.LstPanelCountry[0] || [];
      this.lstPanelCity = data.Result?.LstPanelCity || [];
      this.lstPanelLocality = data.Result?.LstPanelLocality || [];
      this.lstPanelGrup = data.Result?.LstPanelPanelGroup || [];
      if (this.locCentre != null && this.addNewCentre == null) {
        // this.businessZoneGuid = this.lstPanelBusinesszone.filter((BG: {BusinesszoneGuid:any}) => BG.BusinesszoneGuid);
        // this.lstPanelCountry = data.Result?.LstPanelCountry || [];
        // this.lstPanelBusinesszone = data.Result?.LstPanelBusinesszone || [];
        // this.stateLoc = this.lstPanelState.filter((BG: {StateGuid:any}) => BG.StateGuid);
        // this.stateCitys = this.lstPanelCity.filter((BG: {CityGuid:any}) => BG.CityGuid);
        // this.cityLocations = this.lstPanelzone.filter((BG: {ZoneGuid:any}) => BG.ZoneGuid);
        // this.lstPanelCentreType = data.Result?.LstPanelCentreType || [];
        this.editCentre();
      }
      this.onCentreForm = false;
      // this.globalService.stopSpinner();
      this.shimmerVisible=false;

    }, err => {
      // this.notificationService.showError()
      // this.globalService.stopSpinner();
      this.shimmerVisible=false;
    })
  }

  centerDuplicateCheck(event: any) {
    // this.Keyword = event.target.value;
    this.modelChanged.next(event.target.value);      
  }

  getAllCentreDetails() {
    // this.globalService.startSpinner();
    this.shimmerVisible=true;
    this.keyword = (this.Keyword == undefined || this.Keyword == null) ? this.Keyword || "" : this.Keyword;
    let cen = {
      PageNumber: this.pageNumber,
      RowCount: this.rowCount,
      Keyword: this.keyword,
      OrderBy: '',
      SortType: 'desc'
    }
    this.centreService.GetAllCentres(cen).subscribe(data => {     
      // this.globalService.stopSpinner();
      this.shimmerVisible=false;
      this.centresName = data.filter((C: { CompanyName: any }) => C.CompanyName.toLowerCase() == this.keyword.toLowerCase()) || []; 
      if(this.centresName?.length>0){        
        this.centerExists = true;
      }else {
        this.centerExists = false;
      }
    },err=> {
      // this.globalService.stopSpinner();
      this.shimmerVisible=false;
    })
  }

  saveNewCentre() {
    // this.globalService.startSpinner();
    this.shimmerVisible=true;
    if (this.addNewCentre) {
      this.locCentre = ''
    }
    FormValueTrimeer.cleanForm(this.centreForm);  
    let cen = {
      CentreTypeGuid: this.centreForm.value.CentreTypeGuid,
      Type: this.centreForm.value.Type,
      PanelGroup: this.centreForm.value.PatientType,
      CenterName: this.centreForm.value.CenterName,
      CentreCode: this.centreForm.value.CenterCode,
      UHIDCode: this.centreForm.value.UHIDAbbCode,
      Address: this.centreForm.value.Address,
      Country: this.centreForm.value.Country,
      BussinessZoneGuid: this.centreForm.value.BusinessZoneGuid,
      StateGuid: this.centreForm.value.StateGuid,
      CityGuid: this.centreForm.value.CityGuid,
      // ContactPersonNo :this.centreForm.value.ContactPersonNo,
      LocalityGuid: this.centreForm.value.LocalityGuid==null || this.centreForm.value.LocalityGuid.length==0 ?'':this.centreForm.value.LocalityGuid,
      LandlineNo: this.centreForm.value.LandlineNo,
      CityZoneGuid: this.centreForm.value.ZoneGuid,
      MobileNo: this.centreForm.value.MobileNo,
      Email: this.centreForm.value.Email,
      ContactPersonName: this.centreForm.value.ContactPerson,
      // ContactPersonMobile: this.centreForm.value.MobileNo,
      ContactPersonEmail: this.centreForm.value.ContactPersonEmail,
      Designation: this.centreForm.value.Designation,
      OwnerName: this.centreForm.value.OwnerName,
      PanCardNo: this.centreForm.value.PanCardNo,
      PANCardName: this.centreForm.value.PancardName,
      SalesManager: this.centreForm.value.SalesManager,
      ProMaster: this.centreForm.value.ProMaster,
      PaymentMode: this.centreForm.value.PaymentMode,
      RollingAdvance: this.centreForm.value.RollingAdvance,
      InvoiceEmailID: this.centreForm.value.InvoiceEmailID,
      SecurityAmountComment: this.centreForm.value.SecurityAmountComment,
      MinBusinessCom: this.centreForm.value.MinBusinessCom,
      GSTTIN: this.centreForm.value.GSTTIN,
      InvoiceBillingCycle: this.centreForm.value.InvoiceBillingCycle,
      BankName: this.centreForm.value.BankName,
      AccountNo: this.centreForm.value.AccountNo,
      IFSCCode: this.centreForm.value.IFSCCode,
      InvoiceTo: this.centreForm.value.InvoiceTo,
      InvoiceDisplayName: this.centreForm.value.InvoiceDisplayName,
      InvoiceDisplayNo: this.centreForm.value.InvoiceDisplayNo,
      InvoiceDisplayAddress: this.centreForm.value.InvoiceDisplayAddress,
      MinCashBooking: this.centreForm.value.MinCashBooking,
      TagProcessingLabGuid: this.centreForm.value.TagProcessingLabGuid || null,
      TagBusinessUnitGuid: this.centreForm.value.TagBusinessUnitGuid || null,
      SecurityDeposit: this.centreForm.value.SecurityDeposit,
      IntimationLimit: this.centreForm.value.IntimationLimit,
      ReportingLimit: this.centreForm.value.ReportingLimit,
      BookingLimit: this.centreForm.value.BookingLimit,
      ShowIntimation: this.centreForm.value.ShowIntimation,
      LockPrinting: this.centreForm.value.LockPrinting,
      LockBooking: this.centreForm.value.LockBooking,
      PaymentExpiryDate: this.centreForm.value.PaymentExpiryDate,
      BarCodeType: this.centreForm.value.BarCodeType,
      SetofBarCode: this.centreForm.value.SetofBarCode,
      SampleCollectionOnRegistration: this.centreForm.value.SampleCollectionOnRegistration,
      BarcodePrintedCenterVisit: this.centreForm.value.BarcodePrintedCenterVisit,
      BarcodePrintedHomecollectionVisit: this.centreForm.value.BarcodePrintedHomecollectionVisit,
      HideAmountInBooking: this.centreForm.value.HideAmountInBooking,
      ShowBalanceAmount: this.centreForm.value.ShowBalanceAmount,
      // HideReceiptRate: this.centreForm.value.HideReceiptRate,
      SampleReCollectAfterReject: this.centreForm.value.SampleReCollectAfterReject,
      AllowDoctorShare: this.centreForm.value.AllowDoctorShare,
      MRPBill: this.centreForm.value.MRPBill,
      UserName: this.centreForm.value.UserName,
      UserPassword: this.centreForm.value.UserPassword,
      LedgerPassword: this.centreForm.value.LedgerPassword,
      PanelGuid: this.locCentre || null,
      CountryGuid: this.centreForm.value.CountryGuid,
      Category: this.centreForm.value.centreTypeGuid,
      ContactPersonMobile: this.centreForm.value.ContactPersonMobile
    }
    this.locationService.saveCentreDetails(cen).subscribe(data => {
      this.onCentreForm = false;
      // this.globalService.stopSpinner();
      this.shimmerVisible=false;
      this.route.navigate(['/stores/centers'])

    }, err => {
      // this.globalService.stopSpinner();
      this.shimmerVisible=false;
    })
  }

  editCentre() {
    let cen = {
      PanelGuid: this.locCentre
    }
    this.cpIsValid = true;
    this.locationService.getEditCentre(cen).subscribe(data => {
      // this.globalService.stopSpinner();
      this.shimmerVisible=false;
      this.editData = data[0]
      if (this.locCentre != null && this.addNewCentre == null) {
        this.centreForm.patchValue({
          CenterName: this.editData.CompanyName,
          Address: this.editData.Address,
          StateGuid: this.editData.StateGuid,
          CityGuid: this.editData.CityGuid,
          Email: this.editData.EmailId,
          ContactPerson: this.editData.ContactPerson,
          ContactPersonEmail: this.editData.ContactPersonEmail,
          ContactPersonMobile: this.editData.ContactPersonMobile,
          BankName: this.editData.BankName,
          IFSCCode: this.editData.IFSCCode,
          InvoiceDisplayName: this.editData.InvoiceDisplayName,
          InvoiceTo: this.editData.InvoiceTo,
          PaymentMode: this.editData.PaymentMode,
          // ContactPersonNo: this.editData.Phone,
          BusinessZoneGuid: this.editData.BussinessZoneGuid,
          HideReceiptRate: this.editData.HideReceiptRate,
          IntimationLimit: this.editData.IntimationLimit,
          PanCardNo: this.editData.PANNo,
          OwnerName: this.editData.OwnerName,
          Country: this.editData.Country,
          State: this.editData.State,
          LandlineNo: this.editData.LandlineNo,
          ZoneGuid: this.editData.ZoneGuid,
          CentreTypeGuid: this.editData.CenterTypeGuid,
          PancardName: this.editData.PANCardName,
          UHIDAbbCode: this.editData.UHIDCode,
          CenterCode: this.editData.CentreCode,
          centreTypeGuid: this.editData.CenterTypeGuid,
          PatientType: this.editData.PatientType,
          MobileNo: this.editData.MobileNo,
          Designation: this.editData.Designation,
         userName: this.editData.EmailId,
         UserPassword: this.editData.PanelPassword,
         LedgerPassword: this.editData.PanelPassword,
         LocalityGuid: this.editData.LocalityGuid=="00000000-0000-0000-0000-000000000000"?
         null:this.editData.LocalityGuid      
        })
        this.getType();
        this.getBusinessGuid();
        this.getStateGuid();
        this.getCityGuid();
        this.getLocationGuid();
        // this.getType(event);
        // this.getType(event);
        // console.log("dqwcwefwe",this.centreForm.value) 
        this.onCentreForm = false;
      }
    }, err => {
      console.log("error")
      // this.globalService.stopSpinner();
      this.shimmerVisible=false;
    })
  }

  getStateGuid() {
    this.stateGuid = this.centreForm.value.StateGuid;
    this.stateCitys = this.lstPanelCity.filter((i: { StateGuid: any; }) => i.StateGuid == this.stateGuid);
  }

  getCityGuid() {
    this.cityGuid = this.centreForm.value.CityGuid;
    this.cityLocations = this.lstPanelzone.filter((i: { CityGuid: any; }) => i.CityGuid == this.cityGuid);
  }

  getLocationGuid() {
    this.locGuid = this.centreForm.value.ZoneGuid;
    this.locLocations = this.lstPanelLocality.filter((i: { ZoneGuid: any; }) => i.ZoneGuid == this.locGuid);
  }
  getLocalityGuid(event:any){
    if(!event){
     this.centreForm.patchValue({
      LocalityGuid:[]
     })
    }
    else{
      this.locGuid = this.centreForm.value.LocalityGuid;
      this.locLocations = this.lstPanelLocality.filter((i: { LocalityGuid: any; }) => i.LocalityGuid == this.locGuid);
    }
  }
  getBusinessGuid(change?:any) {
    this.businessZoneGuid = this.centreForm.value.BusinessZoneGuid;
    this.stateLoc = this.lstPanelHeadquarter.filter((lpb: { BusinesszoneGuid: any }) => lpb.BusinesszoneGuid == this.businessZoneGuid);
    // this.BusinessZoneLoc = this.lstPanelHeadquarter.filter((lpb: { BusinesszoneGuid: any }) => lpb.BusinesszoneGuid == this.businessZoneGuid);    
    if (this.locCentre != null && (this.addNewCentre == null)&&change!='change') {
      this.centreForm.patchValue({
        StateGuid: this.editData.StateGuid,
        CityGuid: this.editData.CityGuid,
        ZoneGuid: this.editData.ZoneGuid
      })
    } else {
      this.centreForm.patchValue({
        // StateGuid: [''],
        // CityGuid: [''],
        // ZoneGuid: ['']
      })
      this.stateCitys = [''];
      this.cityLocations = [''];
    }
  }

  getType() {
    if (this.centreForm.value.CentreTypeGuid) {
      this.types = this.lstPanelCentreType.filter((T: { CentreTypeGuid: any }) => T.CentreTypeGuid == this.centreForm.value.CentreTypeGuid);
      this.labtype = this.types.filter((ct: { category: any }) => ct.category == "HUB");
      if (this.labtype.length != 0) {
        this.lisPanel = this.lstPanelGrup;
        this.centreForm.get('PatientType')?.setValidators([Validators.required]);
        this.isDisabled = false
      } else {
        // this.lisPanel = ['']; 
        this.centreForm.get('PatientType')?.clearValidators();
        this.isDisabled = true;
      }
    }
  }

  openXlModal(content: TemplateRef<any>) {
    this.modalService.open(content, { size: 'md' }).result.then((result) => {
    }).catch((res) => { });
  } 

  resetCentre() {
    this.centreForm.markAsUntouched()
    this.centreForm.patchValue({
      Type: '',
      //PatientType: '',
      CenterName: '',
      CenterCode: '',
      UHIDAbbCode: '',
      Address: '',
      CountryGuid: '',
      BusinessZoneGuid: '',
      StateGuid: [],
      CityGuid: [],
      //CityZoneGuid: '',
      LocalityGuid: [],
      LandlineNo: '',
      MobileNo: '',
      Email: '',
      ContactPersonName: '',
      ContactPersonMobile: '',
      ContactPersonEmail: '',
      Designation: [],
      OwnerName: '',
      PanCardNo: '',
      PancardName: '',
      SalesManager: '',
      ProMaster: '',
      PaymentMode: '',
      RollingAdvance: '',
      InvoiceEmailID: '',
      SecurityAmountComment: '',
      MinBusinessCom: '',
      GSTTIN: '',
      InvoiceBillingCycle: '',
      BankName: '',
      AccountNo: '',
      IFSCCode: '',
      InvoiceTo: '',
      InvoiceDisplayName: '',
      InvoiceDisplayNo: '',
      InvoiceDisplayAddress: '',
      MinCashBooking: '',
      TagProcessingLabGuid: '',
      TagBusinessUnitGuid: '',
      SecurityDeposit: '',
      IntimationLimit: '',
      ReportingLimit: '',
      BookingLimit: '',
      ShowIntimation: '',
      LockPrinting: '',
      LockBooking: '',
      PaymentExpiryDate: '',
      BarCodeType: '',
      SetofBarCode: '',
      SampleCollectionOnRegistration: '',
      BarcodePrintedCenterVisit: '',
      BarcodePrintedHomecollectionVisit: '',
      HideAmountInBooking: '',
      ShowBalanceAmount: '',
      HideReceiptRate: '',
      SampleReCollectAfterReject: '',
      AllowDoctorShare: '',
      MRPBill: '',
      userName: '',
      UserPassword: '',
      LedgerPassword: '',
      PanelGuid: '',
      ZoneGuid: [],
      Country: '',
      centreTypeGuid: [],
      Mobile: '',
      ContactPerson: '',
      CentreTypeGuid: [],
      // PatientType: []
    })
    this.editCentre();
this.onCentreForm=false;
    // this.centreForm.reset();

  }

  get c() {
    return this.centreForm.controls;
  }

  get UHIDAbbCode() {
    return this.c?.UHIDAbbCode.value?.trim() || '';
  }

  get CentreTypeGuid() {
    return this.c?.CentreTypeGuid.value || '';
  }

  get centreTypeGuid() {
    return this.c?.centreTypeGuid.value || '';
  }

  get PatientType() {
    return this.c?.PatientType.value || '';
  }

  get CenterName() {
    return this.c?.CenterName.value?.trim() || '';
  }

  get CenterCode() {
    return this.c?.CenterCode.value?.trim() || '';
  }

  get Country() {
    return this.c?.Country.value || '';
  }

  get BusinessZoneGuid() {
    return this.c?.BusinessZoneGuid.value || '';
  }

  get StateGuid() {
    return this.c?.StateGuid.value || '';
  }

  get CityGuid() {
    return this.c?.CityGuid.value || '';
  }

  get ZoneGuid() {
    return this.c?.ZoneGuid.value || '';
  }

  get MobileNo() {
    return this.c?.MobileNo.value || '';
  }

  get Email() {
    return this.c?.Email.value?.trim() || '';
  }

  get ContactPersonEmail() {
    return this.c?.ContactPersonEmail.value?.trim() || '';
  }

  get ContactPerson() {
    return this.c?.ContactPerson.value?.trim() || '';
  }

  get ContactPersonMobile() {
    return this.c?.ContactPersonMobile.value || '';
  }

  get Designation() {
    return this.c?.Designation.value || '';
  }

  get OwnerName() {
    return this.c?.OwnerName.value?.trim() || '';
  }

  get PancardName() {
    return this.c?.PancardName.value?.trim() || '';
  }

  get PanCardNo() {
    return this.c?.PanCardNo.value?.trim() || '';
  }

  get Address() {
    return this.c?.Address.value?.trim() || '';
  }

  get Username() {
    return this.c?.UserName.value || '';
  }

  get LedgerPassword() {
    return this.c?.LedgerPassword.value || '';
  }

  // phoneNoValidator(number: any) {
  //   if (String(number.target.value).length == 10) {
  //   }
  //   return number.target.value = number.target.value.replace(/[^0-9.]/g, '');
  // }
  phoneNoValidator(number: any): any {

    if (number.charCode >= 48 && number.charCode <= 57) {

    } else {
      return false;

    }

  }
  togglePsVisibility() {
    this.isPsVisible = !this.isPsVisible;
  }
  toggleCpVisibility() {
    this.isCpVisible = !this.isCpVisible;
  }
  
  onFocusOutEvent(event: any){
    if(event.target.value == this.centreForm.value.UserPassword) {
      this.cpIsValid = true;
    } else {
      this.cpIsValid =false;
    }
 }

 getPassswordValidation(event: any) {
  if(event.target.value == this.centreForm.value.LedgerPassword) {
    this.cpIsValid = true;
  } else {
    this.cpIsValid =false;
  }
 }
 focusOutFunction() {
  this.EmailResponse = '';
  this.EmailValid = false;
  this.DuplicateCheck = false;
  if (this.Email && this.centreForm.get('Email')?.valid) {
    //this.SpinnerCheck=true;
    this.authService.CheckUserEmail(this.Email).subscribe((data) => {
      //this.SpinnerCheck=false;
      debounceTime(500)
      if (data.result == false) {
        this.EmailValid = false;
        this.DuplicateCheck = true;
        //this.notifyService.showError(data.message, 'Register');
      }
      if (data.result == true) {
        this.EmailValid = true;
        this.DuplicateCheck = true;
        //this.notifyService.showSuccess(data.message, 'Register');
      }
      this.EmailResponse = data.message
    },
      (err: HttpErrorResponse) => {
        this.EmailValid = false;
        //this.SpinnerCheck=false;
        this.DuplicateCheck = false;
        //this.notifyService.showError('Failed!', 'Register');
      })
  }
}
 EmailKeyup(event: any) {
  if (event.target.value) {
    this.EmailResponse = '';
    this.EmailValid = false;
    this.DuplicateCheck = false;
  }
}

defaultEmail(event: any) {  
  this.centreForm.patchValue({
    userName: event.target.value
  })
}

// get userName() {
//   return this.centreForm.value.userName
// }
}
