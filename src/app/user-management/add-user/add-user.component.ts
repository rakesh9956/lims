import { Component, TemplateRef } from '@angular/core';
import { NgbDateStruct, NgbModal, NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { UserManagementService } from 'src/app/core/Services/user-management.service';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import { HttpErrorResponse } from '@angular/common/http';
import { GlobalService } from 'src/app/core/Services/global.service';
import { debounceTime, map } from 'rxjs/operators';
import { AuthenticationService } from 'src/app/core/Services/authentication.service';
import { CustomDateParserFormatter } from 'src/app/core/Services/ngbdate-format.service'
import { Subject } from 'rxjs';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { GrnAgainstPoComponent } from 'src/app/grn/grn-against-po/grn-against-po.component';
import { error } from 'console';
import { FormValueTrimeer, UsernameValidator } from 'src/Utils/validators';
import { IndentService } from 'src/app/core/Services/indent.service';
import * as XLSX from 'xlsx';
import { DatePipe } from '@angular/common';
@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.scss'],
  providers: [
    { provide: NgbDateParserFormatter, useClass: CustomDateParserFormatter },
  ],
})
export class AddUserComponent {
  XLdata : any;
  department = [
    "BIOCHEMISTRY",
    "HAEMATOLOGY",
    "ONCOLOGY GENETICS",
    "OBESITY & DIABETES GENETICS",
    "TRANSPLANT IMMUNOGENETICS",
    "NEUROMUSCULAR DISORDER GENETICS",
    "HEMATOLOGICAL GENETICS",
    "HORMONE ASSAYS",
    "IMMUNOLOGY",
    "MAMMOGRAPHY",
    "MISCELLANEOUS , AMB, ANAESTHESIA CHARGES",
    "NEUROLOGY",
    "DENTAL",
    "CARDIOLOGY",
    "GASTROENTEROLOGY",
    "CYTOGENETICS",
    "MOLECULAR BIOLOGY",
    "SEROLOGY",
    "MICROBIOLOGY",
    "VIROLOGY",
    "CLINICAL PATHOLOGY",
    "CLINICAL VIROLOGY",
    "CLINICAL IMMUNOLOGY",
    "CYTOPATHOLOGY",
    "PATHOLOGY",
    "RADIOLOGY",
    "OPHTHALMOLOGY",
    "ANATOMICAL PATHOLOGY",
    "HAEMOSTASIS AND THROMBOSIS",
    "HISTOPATHOLOGY",
    "ENDOCRINOLOGY",
    "CYTOLOGY",
    "RADIOTHERAPY",
    "NUCLEAR MEDICINE",
    "MEDICAL ONCOLOGY",
    "SURGICAL ONCOLOGY",
    "PAEDIATRIC SURGERY",
    "CARDIOTHORACIC SURGERY",
    "VASCULAR SURGERY",
    "GENERAL SURGERY",
    "ORTHOPAEDICS",
    "OBSTETRICS AND GYNAECOLOGY",
    "PAEDIATRICS",
    "NEONATOLOGY",
    "PSYCHIATRY",
    "PHYSIOTHERAPY",
    "DIETETICS",
    "PHARMACOLOGY",
    "ANAESTHESIOLOGY",
    "COMMUNITY MEDICINE"
  ];

  //   approvalTypes = [
  //     "Access Amount Approval",
  //     "Approval",
  //     "Cancel",
  //     "Checker",
  //     "Issue Item",
  //     "Item Replacement",
  //     "Maker",
  //     "PI Close",
  //     "PO Close After Approval",
  //     "PO Full Edit After Approval",
  //     "PO Qty Edit After Approval",
  //     "PO Reject",
  //     "PO ReOpen",
  //     "POD Payment",
  //     "Post",
  //     "Save",
  //     "SI Close",
  //     "Supplier Return",
  //     "UnPost"
  // ];
  shimmerVisible: boolean;
  StateLocationDetails:any;
  b2bUsers: boolean = true;
  makeActive: boolean;
  selectedDate: NgbDateStruct; 
  employeeDetailsForm: FormGroup = {} as any;
  b2buserDetailsForm: FormGroup = {} as any;
  centerForm: FormGroup = {} as any;
  designationForm: FormGroup = {} as any;
  lstDesignation: any = [];
  lstCenter: any = [];
  lstLocations: any = [];
  lstZone: any = [];
  lstState: any = [];
  lstRole: any = [];
  FormChanged: boolean = false;
  save: boolean = false;
  getEmployeedata: any;
  dob: string;
  EmployeeGuid: any;
  startDate: string;
  LstRoles: any = [] = []
  lstApproval: any;
  lstAppRight: any;
  ApprovalList: any = [] = [];
  ApprovalDetailsQO: any = [] = [];
  ApprovalDetailsSCRAP: any = [] =[];
  ApprovalDetailsSUPPLIER: any = [] =[];
  ApprovalDetailsMANUFACTURE: any = [] =[];
  ApprovalDetailsSRF: any = [] =[];
  ApprovalDetailsVQ: any = [] = [];
  ApprovalDetailsGRN: any = [] = [];
  ApprovalDetailsPO: any = [] = [];
  ApprovalDetailsPI: any = [] = [];
  ApprovalDetailsPOD: any = [] = [];
  ApprovalDetailsSI: any = [] = [];
  ApprovalDetailsSR: any = [] = [];
  ApprovalDetailsSPV: any = [] = [];
  ApprovalDetailsVM: any = [] = [];
  ApprovalDetailsIM: any = [] = [];
  ApprovalDetailsIS: any = [] = [];
  //Location:any=[];
  RolesGuid: any;
  rolesdata: any = "";
  selectedRoles = [];
  selectedRoleNames = [];
  minDate: any;
  DuplicateCheck: boolean = false;
  EmailResponse: string = "";
  EmailValid: boolean = false;
  SpinnerCheck: boolean = false;
  isdisable: boolean;
  countrycode: any;
  getJason: boolean;
  isPsVisible: boolean = false;
  isCpVisible: boolean = false;
  isdeleted: any;
  duplicate: any
  currenDate: any = [];
  dobMinDate: any;
  minYear: any;
  minMonth: number;
  minDay: number;
  maxAge: string;
  dobMaxDate: string[];
  maxYear: number;
  maxMonth: number;
  maxDay: number;
  UserGuid: string;
  maxDate = new Date();
  password: any;
  passworderror: any;
  maxCurDate: { year: number; month: number; day: number; };
  cpIsValid: boolean = false;
  modelChanged = new Subject<any>();
  keyword: any;
  SearchType: any;
  SearchCount: boolean = false;
  defaultRole: any[] = [];
  dropdownSettings: IDropdownSettings = {};
  CenterdropdownSettings: IDropdownSettings = {};
  poDropdownSettings: IDropdownSettings = {};
  piDropdownSettings: IDropdownSettings = {};
  departmentsDropdownSettings: IDropdownSettings = {};
  roleDropdownSettings: IDropdownSettings = {};
  ItemDropdownSettings: IDropdownSettings = {};
  TypeNamelist: any;
  confirmForm: FormGroup<any>;
  duplicatePwd: any = '@Qwerttrewq12qwe';
  SelectedUserDetails: any;
  ActivityStatus: boolean = false
  lstDepartment: any[] = [];
  roles: any = '';
  Role: any = '';
  Roles: any = '';
  adminDisabled: boolean;
  IsvalidPasword: boolean = false;
  isOptionSelected: boolean = false
  StateDetails: any;
  result: string;
  isDropdownDisabled: boolean
  customDesignation: any;
  b2BlstRole: any=[];
  lstItems: any=[];
  Allitems: any=[];
  Clienttype =[ 
    {item_id: 1, item_text: 'B2B' },
    {item_id: 2, item_text: 'Corporate' },
    {item_id: 3, item_text: 'PUP' },
    {item_id: 4, item_text: 'HUB' },
    {item_id: 5, item_text: 'RRL' },
    {item_id: 6, item_text: 'STAT' },
  ];
  PaymentRoles = [
    { Id: '1', DesignationName: 'Accounts' },
    { Id: '2', DesignationName: 'Admin' },
  ];
  totalCount: any;
  pageNumber: number;
  itemsPerPage: any;
  rowCount: any;
  pageSize: any;
  ClienttyeSettings: { idField: string; textField: string; itemsShowLimit: number; singleSelection?: boolean | undefined; tooltipField?: string | undefined; disabledField?: string | undefined; enableCheckAll?: boolean | undefined; selectAllText?: string | undefined; unSelectAllText?: string | undefined; allowSearchFilter?: boolean | undefined; clearSearchFilter?: boolean | undefined; maxHeight?: number | undefined; limitSelection?: number | undefined; searchPlaceholderText?: string | undefined; noDataAvailablePlaceholderText?: string | undefined; noFilteredDataAvailablePlaceholderText?: string | undefined; closeDropDownOnSelection?: boolean | undefined; showSelectedItemsAtTop?: boolean | undefined; defaultOpen?: boolean | undefined; allowRemoteDataSearch?: boolean | undefined; };
  QuotationXL: boolean;
  constructor(private modalService: NgbModal,
    private userManagementService: UserManagementService,
    public globalService: GlobalService,
    private fb: FormBuilder,
    private router: Router,
    private datePipe: DatePipe,
    private route: ActivatedRoute,
    private authService: AuthenticationService,
    private indentService:IndentService) {
    const today = new Date();
    const minAge = 18;
    const minDate = new Date(today.getFullYear() - minAge, today.getMonth(), today.getDate());
    // this.minDate = minDate.toISOString().split('T')[0];
    this.minDate = minDate.toLocaleDateString();
    const maxAge = 60;
    const maxDate = new Date(today.getFullYear() - maxAge, today.getMonth(), today.getDate());
    this.maxAge = maxDate.toLocaleDateString();
    const current = new Date();
    this.maxCurDate = {
      year: current.getFullYear(),
      month: current.getMonth() + 1,
      day: current.getDate()
    }
    this.modelChanged
      .pipe(debounceTime(3000))
      .subscribe(model => {
        this.keyword = model.keyword;
        this.SearchType = model.searchType
        this.GetDuplicateUserDetails()
      })
  }

  openBasicModal(content: TemplateRef<any>) {
    this.modalService.open(content, { size: 'md' }).result.then((result) => {
      console.log("Modal closed" + result);
    }).catch((res) => { });
  }

  ngOnInit(): void {
    this.customDesignation = '';
    this.getMinMaxDate();
    this.GetItemDetails();
    this.EmployeeGuid = this.route.snapshot.paramMap.get('EmployeeGuid') || '';
    this.UserGuid = this.authService.LoggedInUser.UserGuid;
    let UserDetais: any = localStorage.getItem('SelectedUserGuid')
    this.SelectedUserDetails = JSON.parse(UserDetais)
    const currentDate = new Date();
    this.selectedDate = { year: currentDate.getFullYear(), month: currentDate.getMonth() + 1, day: currentDate.getDate() };
    this.getJson();
    this.getUserSDefaults();
    this.initpayoutsettingsForm()
    this.employeeDetailsForm.valueChanges.pipe()
      .subscribe(values => {
        this.FormChanged = true;
      }
      );
      this.b2buserDetailsForm.valueChanges.pipe()
      .subscribe(values => {
        this.FormChanged = true;
      }
      );

    this.dropdownSettings = {
      singleSelection: false,
      idField: 'Guid',
      textField: 'TypeName',
      enableCheckAll: false,
      itemsShowLimit: 3,
      allowSearchFilter: true
    };
    this.CenterdropdownSettings = {
      ...this.dropdownSettings,
      idField: 'CenterGuid',
      textField: 'CompanyName',
      singleSelection: false,
      itemsShowLimit: 2
    };

    this.poDropdownSettings = {
      ...this.dropdownSettings,
      itemsShowLimit: 2,
    };

    this.piDropdownSettings = {
      ...this.dropdownSettings,
      itemsShowLimit: 2,
    };

    this.departmentsDropdownSettings = {
      ...this.dropdownSettings,
      idField: 'LocationGuid',
      textField: 'Location',
      itemsShowLimit: 2,
    };
    this.ClienttyeSettings = {
      ...this.dropdownSettings,
      idField: 'item_id',
      textField: 'item_text',
      itemsShowLimit: 2,
    };
    this.roleDropdownSettings = {
      ...this.dropdownSettings,
      idField: 'RoleGuid',
      textField: 'RoleName',
      singleSelection: true,

    };
    this.ItemDropdownSettings = {
      ...this.dropdownSettings,
      idField: 'ItemGuid',
      textField: 'ItemName',
      itemsShowLimit: 4,

    };
    //this.genarateEmployeeCode()

    const userType = this.route.snapshot.paramMap.get("userType")

    userType === "b2b-user" ? this.b2bUsers = true : this.b2bUsers = false
  }

  async uploadData(event: any): Promise<void> {
    const file = event.target.files[0];
    if (file) {
      await this.readExcelFile(file);
    }
  }

  readExcelFile(file: File) {
    const reader = new FileReader();

    reader.onload = async (e: any) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      // Assuming the Excel sheet is named 'Sheet1'
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      // Parse the worksheet data and handle date format
      this.XLdata = XLSX.utils.sheet_to_json(worksheet, { raw: false, dateNF: 'yyyy-mm-dd' });
      this.QuotationXL=true;
      // Your data is now in jsonData, and dates are parsed correctly
       await this.saveXLDetails();
      await this.SaveEmployeeXMLData();  
    };

    reader.readAsArrayBuffer(file);
  }

  genarateEmployeeCode() {
    let EmployeeUnqId: any
    EmployeeUnqId = localStorage.getItem('EmployeeUnqId')
    this.result = (('YLD'));
    this.employeeDetailsForm.patchValue({
      employeeCode: this.result 
    })
    this.b2buserDetailsForm.patchValue({
      employeeCode: this.result
    })
  }


  initpayoutsettingsForm() {
    this.employeeDetailsForm = this.fb.group({
      employeeGuid: [null],
      employeeCode: ['', [Validators.required]],
      name: ['', [Validators.required, UsernameValidator.cannotContainSpace]],
      DesignationGuid: [null],
      streetNo: [''],
      locality: [''],
      city: [''],
      pincode: ['', [Validators.pattern('[0-9]{6}')]],
      houseNo: [''],
      ofcStreetNo: [''],
      ofcLocality: [''],
      ofcCity: [''],
      ofcPincode: ['', [Validators.pattern('[0-9]{6}')]],
      // email: ['', Validators.compose([Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z.]+.com+$')])],
      email: ['', Validators.compose([Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/), Validators.required, UsernameValidator.cannotContainSpace])],
      updatedEmail: [''],
      countrycode: ['+91', [Validators.required]],
      phoneNo: [''],
      mobileNo: [''],
      fathersName: [''],
      mothersName: [''],
      dob: [null],
      qualification: [''],
      esiNumber: [''],
      epfNumber: [''],
      panNumber: ['', [Validators.pattern('^[A-Za-z]{5}[0-9]{4}[A-Za-z]$')]],
      passportNumber: [''],
      startDate: [null],
      bloodGroup: [''],
      AccessMobileApp: [''],
      allowSharing: [''],
      approveSpecialRate: [''],
      amrValueAccess: [''],
      hideRate: [''],
      approveAmendmentofMachineReading: [''],
      sampleLogisticReject: [''],
      globalReportAccess: [''],
      GRNApprovals: [''],
      IMApprovals: [''],
      ISApprovals: [''],
      PIApprovals: [''],
      POApprovals: [''],
      PODApprovals: [''],
      SIApprovals: [''],
      SPVApprovals: [''],
      SRApprovals: [''],
      VMApprovals: [''],
      VQApprovals: [''],
      QOApprovals: [''],
      SCRAPApprovals: [''],
      SRFApprovals: [''],
      SUPPLIERApprovals: [''],
      MANUFACTUREApprovals: [''],
    //  CenterLocationList : [null , [Validators.required]],
      LstDeapartments: [null, [Validators.required]],
      StateGuid: [null, [Validators.required]],
      ZoneGuid: [null, [Validators.required]],
      CenterGuid: [null, [Validators.required]],
      CenterLocationGuid: [null, [Validators.required]],
      defaultCenter: [''],
      defaultRoles: [''],
      userName: ['', [Validators.required, Validators.email]],
      EmailConfirmed:[false],
      paymentRoles:[null],
      password: ['', Validators.compose([
        Validators.required,
        this.patternValidator(/[?=.*?[0-9]/, { hasNumber: true }),
        this.patternValidator(/[A-Z]/, { hasCapitalCase: true }),
        this.patternValidator(/[a-z]/, { hasSmallCase: true }),
        this.patternValidator(/[!@#$%^&*)(]/, { hasSpecialCharacter: true }),
        Validators.minLength(8)
      ])],
      confirmPassword: ['', [Validators.required]],
      LstRoles: ['', [Validators.required]],
    }),
      { validators: [this.checkPasswords('password', 'confirmPassword')] }
    this.designationForm = this.fb.group({
      designation: [null, [Validators.required]]
    })
    this.b2buserDetailsForm = this.fb.group({
      employeeGuid: [''],
      name:[null, [Validators.required]],
      employeeCode: [null, [Validators.required, Validators.pattern('YOD-[A-Za-z]{2}-[0-9]{4}')]],
      countrycode: ['+91'],
      mobileNo:[''],
      phoneNo:['', [Validators.pattern('^[A-Za-z]{5}[0-9]{4}[A-Za-z]$')]],
      LstDeapartments:[null, [Validators.required]],
      LstRoles:[null, [Validators.required]],
      SIApprovals:[''],
      LstItemDetails: ['',[Validators.required]],
      email:[null, [Validators.required]],
      Clienttype:[null,[Validators.required]],
      password: ['', Validators.compose([
        Validators.required,
        this.patternValidator(/[?=.*?[0-9]/, { hasNumber: true }),
        this.patternValidator(/[A-Z]/, { hasCapitalCase: true }),
        this.patternValidator(/[a-z]/, { hasSmallCase: true }),
        this.patternValidator(/[!@#$%^&*)(]/, { hasSpecialCharacter: true }),
        Validators.minLength(8)
      ])],
      confirmPassword: ['', [Validators.required]],
      EmailConfirmed:[true],
      userName:['', Validators.compose([Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/), Validators.required, UsernameValidator.cannotContainSpace])]
    }),
    { validators: [this.checkPasswords('password', 'confirmPassword')] }
    this.centerForm = this.fb.group({
      center: ['', [Validators.required]]
    })
  }
  get lstRoles(): FormArray {
    return this.employeeDetailsForm.get('LstRoles') as FormArray;
  }

  get f() {
    return this.employeeDetailsForm.controls
  }

  getUserSDefaults() {
    this.shimmerVisible = true;
    this.userManagementService.getUserDefaults().subscribe((data) => {
      this.lstDesignation = data.DesignationType;
      this.lstLocations = data.CentresType;
      this.lstCenter = data.CenterDetails;
      // const newArray = data.CenterLocations;
      // this.lstDepartment = newArray.filter((Location:any) => Location.Location !== null);
      const newArray = data.CenterLocations;
      // Field to be added
      var extraField = 'disabled';
      //const extraLocations = { CompanyName: 'ALL', CenterGuid: '00000000-0000-0000-0000-000000000000' };
      //this.lstLocations.unshift(extraLocations);
      const extraDepartment = { Location: 'ALL', LocationGuid: '00000000-0000-0000-0000-000000000000' };
      this.lstDepartment = newArray.filter((item: { Location: any; }) => item.Location !== null && item.Location !== "");
      this.lstDepartment.unshift(extraDepartment);
      // Iterate through the array
      // for (var i = 0; i < this.lstDepartment.length; i++) {
      //   // Add the extra field to each element
      //   this.lstDepartment[i][extraField] = 'false';
      // }
      this.lstZone = data.ZoneType;
      this.lstState = data.StateType;
      this.lstRole = data.RoleType;
      this.b2BlstRole = this.lstRole.filter((role: { RoleName: any; }) => role.RoleName.toLowerCase() === 'b2b client');
      this.lstAppRight = data.AppRightType
      this.lstApproval = data.ApprovalType
      this.ApprovalDetailsVQ = this.lstApproval.filter((approval: { AppRightFor: string; TypeName: any }) => approval.AppRightFor == 'VQ' && approval.TypeName != null);
      this.ApprovalDetailsGRN = this.lstApproval.filter((approval: { AppRightFor: string; TypeName: any }) => approval.AppRightFor == 'GRN' && approval.TypeName != null);
      this.ApprovalDetailsIM = this.lstApproval.filter((approval: { AppRightFor: string; TypeName: any }) => approval.AppRightFor == 'IM' && approval.TypeName != null);
      this.ApprovalDetailsIS = this.lstApproval.filter((approval: { AppRightFor: string; TypeName: any }) => approval.AppRightFor == 'IS' && approval.TypeName != null);
      this.ApprovalDetailsPO = this.lstApproval.filter((approval: { AppRightFor: string; TypeName: any }) => approval.AppRightFor == 'PO' && approval.TypeName != null);
      this.ApprovalDetailsPOD = this.lstApproval.filter((approval: { AppRightFor: string; TypeName: any }) => approval.AppRightFor == 'POD' && approval.TypeName != null);
      this.ApprovalDetailsPI = this.lstApproval.filter((approval: { AppRightFor: string; TypeName: any }) => approval.AppRightFor == 'PI' && approval.TypeName != null);
      this.ApprovalDetailsSI = this.lstApproval.filter((approval: { AppRightFor: string; TypeName: any }) => approval.AppRightFor == 'SI' && approval.TypeName != null);
      this.ApprovalDetailsSR = this.lstApproval.filter((approval: { AppRightFor: string; TypeName: any }) => approval.AppRightFor == 'SR' && approval.TypeName != null);
      this.ApprovalDetailsSPV = this.lstApproval.filter((approval: { AppRightFor: string; TypeName: any }) => approval.AppRightFor == 'SPV' && approval.TypeName != null);
      this.ApprovalDetailsVM = this.lstApproval.filter((approval: { AppRightFor: string; TypeName: any }) => approval.AppRightFor == 'VM' && approval.TypeName != null);
      this.ApprovalDetailsQO = this.lstApproval.filter((approval: { AppRightFor: string; TypeName: any }) => approval.AppRightFor == 'QO' && approval.TypeName != null);
      this.ApprovalDetailsSCRAP = this.lstApproval.filter((approval: { AppRightFor: string; TypeName: any }) => approval.AppRightFor == 'SCRAP' && approval.TypeName != null);
      this.ApprovalDetailsSRF = this.lstApproval.filter((approval: { AppRightFor: string; TypeName: any }) => approval.AppRightFor == 'SRF' && approval.TypeName != null);
      this.ApprovalDetailsSUPPLIER = this.lstApproval.filter((approval: { AppRightFor: string; TypeName: any }) => approval.AppRightFor == 'SUPPLIER' && approval.TypeName != null);
      this.ApprovalDetailsMANUFACTURE = this.lstApproval.filter((approval: { AppRightFor: string; TypeName: any }) => approval.AppRightFor == 'MANUFACTURE' && approval.TypeName != null);
      if (this.EmployeeGuid != '' && this.customDesignation == '') {
        this.clickedit();
      }
      // this.globalService.stopSpinner();
      this.shimmerVisible = false;
      //this.FormChanged = false;
    }, err => {
      // this.globalService.stopSpinner();
      this.shimmerVisible = false;
    })
  }
  async saveXLDetails() {
  let lstItemsDetailsFromXL: any[] = [];
  let createdDate = moment(new Date()).format('YYYY/MM/DD[T]HH:mm:ss');
  
  const data = this.XLdata?.map(async (x: any) => {
    if (x?.City != "Select" || x?.City != "") {
      const userDetails = {
        email: x?.Panel_Code,
        password: "Welcome@123",
        confirmPassword: "Welcome@123",
        CreateDate: createdDate,
        UpdateDate: createdDate,
        FirstName: x?.Company_Name,
        PhoneNumber: x?.Mobile,
        CountryCode: "+91",
        EmailConfirmed: true,
        UserName: x?.Panel_Code,
        Clienttype: x?.PanelGroup,
        // city : x?.City
      };

      await lstItemsDetailsFromXL.push(userDetails);
    }
  });
 await  this.userManagementService.saveXMLDetails(lstItemsDetailsFromXL).subscribe((data) =>{
    let user = data ;
    console.log(user);
  })
  console.log(lstItemsDetailsFromXL);
}

SaveEmployeeXMLData(){
  let lstEMployeeDetailsFromXML : any =[];
  let createdDate = moment(new Date()).format('YYYY/MM/DD[T]HH:mm:ss');
  
  const data = this.XLdata?.map((x: any) => {
    if (x?.City != "Select" || x?.City != "") {
      const splitdata ={ Location : x?.Company_Name , ClientCode :x.Panel_Code }
      console.log(splitdata)
      const userDetails = {
        email: x?.Panel_Code,
        createdDt: createdDate,
        name: x?.Company_Name,
        phone : x?.Mobile,
        mobile : x?.Mobile,
        countryCode: "+91",
        lstRoles: [
          {
              "RoleGuid": "425cbb16-4cdc-496b-80e7-40934bf6234a",
              "RoleName": "B2B CLIENT"
          }
      ],
      sIApprovals: [
        {
            "Guid": "4139e598-86e1-4b28-ad86-4993879b3070",
            "TypeName": "Maker"
        },
        {
            "Guid": "fff59e3f-ea6b-4e7f-bc72-826ceef06f3e",
            "TypeName": "Checker"
        },
        {
            "Guid": "7cd73eb3-7cff-43dc-a2db-23e4021e3386",
            "TypeName": "Approval"
        },
        {
            "Guid": "ba16d369-f6a2-40bc-85d2-7425c6fc0ab4",
            "TypeName": "SI Close"
        }
    ],
    lstItemDetails: [
      {
          "ItemGuid": "00000000-0000-0000-0000-000000000000",
          "ItemName": "ALL"
      }
  ],
  lstApproval: [
    {
        "Guid": "4139e598-86e1-4b28-ad86-4993879b3070",
        "TypeName": "Maker"
    },
    {
        "Guid": "fff59e3f-ea6b-4e7f-bc72-826ceef06f3e",
        "TypeName": "Checker"
    },
    {
        "Guid": "7cd73eb3-7cff-43dc-a2db-23e4021e3386",
        "TypeName": "Approval"
    },
    {
        "Guid": "ba16d369-f6a2-40bc-85d2-7425c6fc0ab4",
        "TypeName": "SI Close"
    }
],
lstDeapartments: [splitdata],
        EmployeeId: x?.Panel_Code,
        EmployeeCode:x?.Panel_Code,
      };

      lstEMployeeDetailsFromXML.push(userDetails);
    }
  });
  console.log(lstEMployeeDetailsFromXML);
  this.userManagementService.saveEmployeeXMLDetails(lstEMployeeDetailsFromXML).subscribe((data)=> {
let EmployeeData = data;
console.log(EmployeeData);
  })
}

  clickSave() {
     // this.globalService.startSpinner();
    this.shimmerVisible = true;
    let createdDate = moment(new Date()).format('YYYY/MM/DD[T]HH:mm:ss');
    const v: any = this.b2bUsers==true?this.b2buserDetailsForm.value:this.employeeDetailsForm.value;
    this.userManagementService.registerUser({
      email: (v.email || "").trim(),
      password: v.password,
      confirmPassword: v.confirmPassword,
      CreateDate: createdDate,
      UpdateDate: createdDate,
      FirstName: v.name,
      PhoneNumber: v.mobileNo,
      CountryCode: v.countrycode,
      EmailConfirmed:v.EmailConfirmed,
      UserName:v.userName,
      Clienttype :v.Clienttype,
      paymentRoles:this.employeeDetailsForm.value.paymentRoles
    } as any).subscribe((user) => {
      let users = user;
      if(this.b2bUsers==true){
        let approle = [];
      approle.push(...this.b2buserDetailsForm.value.SIApprovals)
      let filteredArray = approle.filter(function (value) { return value !== "" && value !== " " && value !== null && value !== undefined; });
      this.b2buserDetailsForm.value.lstApproval = filteredArray;
      const date: any = this.b2buserDetailsForm.value.dob ? this.b2buserDetailsForm.value.dob?.year + "-" + this.b2buserDetailsForm.value.dob.month + "-" + this.b2buserDetailsForm.value.dob.day : null;
      this.b2buserDetailsForm.value.dob = date
      const dateone: any = this.b2buserDetailsForm.value.startDate ? this.b2buserDetailsForm.value.startDate?.year + "-" + this.b2buserDetailsForm.value.startDate.month + "-" + this.b2buserDetailsForm.value.startDate.day : null;
      this.b2buserDetailsForm.value.startDate = dateone;
      const data = this.b2buserDetailsForm.value.LstDeapartments;

      if (data && data.length > 0) {
        const filteredData = data.filter(
          (item: any) =>
            item.Location === 'ALL' &&
            item.LocationGuid === '00000000-0000-0000-0000-000000000000'
        );
        this.b2buserDetailsForm.value.LstDeapartments = filteredData.length > 0 ? filteredData : (this.b2buserDetailsForm.value.LstDeapartments?.length > 0 ? this.b2buserDetailsForm.value.LstDeapartments : this.b2buserDetailsForm.value.LstDeapartments = []);
      }
      ;
      this.userManagementService.saveEmployeeDetails(this.b2buserDetailsForm.value).subscribe(
        (Data) => {
          this.FormChanged = false;
          this.router.navigate(['/user-management']);
          this.shimmerVisible = false;
        },
        (err: HttpErrorResponse) => {
          this.shimmerVisible = false;
        })
      }
      else{
        let approle = [];
      approle.push(...this.employeeDetailsForm.value.VQApprovals, ...this.employeeDetailsForm.value.VMApprovals, ...this.employeeDetailsForm.value.SRApprovals, ...this.employeeDetailsForm.value.SPVApprovals, ...this.employeeDetailsForm.value.SIApprovals, ...this.employeeDetailsForm.value.PODApprovals, ...this.employeeDetailsForm.value.POApprovals,
        ...this.employeeDetailsForm.value.PIApprovals, ...this.employeeDetailsForm.value.ISApprovals, ...this.employeeDetailsForm.value.IMApprovals, ...this.employeeDetailsForm.value.GRNApprovals, ...this.employeeDetailsForm.value.QOApprovals, ...this.employeeDetailsForm.value.SCRAPApprovals,
        ...this.employeeDetailsForm.value.SRFApprovals,...this.employeeDetailsForm.value.SUPPLIERApprovals,...this.employeeDetailsForm.value.MANUFACTUREApprovals)
      let filteredArray = approle.filter(function (value) { return value !== "" && value !== " " && value !== null && value !== undefined; });
      this.employeeDetailsForm.value.lstApproval = filteredArray;
      const date: any = this.employeeDetailsForm.value.dob ? this.employeeDetailsForm.value.dob?.year + "-" + this.employeeDetailsForm.value.dob.month + "-" + this.employeeDetailsForm.value.dob.day : null;
      // const formattedDate: string = date.toISOString().slice(0, 10);
      this.employeeDetailsForm.value.dob = date
      const dateone: any = this.employeeDetailsForm.value.startDate ? this.employeeDetailsForm.value.startDate?.year + "-" + this.employeeDetailsForm.value.startDate.month + "-" + this.employeeDetailsForm.value.startDate.day : null;
      // const formattedDateone: string = dateone.toISOString().slice(0, 10);
      this.employeeDetailsForm.value.startDate = dateone;
      const data = this.employeeDetailsForm.value.LstDeapartments;
      if (data && data.length > 0) {
        const filteredData = data.filter(
          (item: any) =>
            item.Location === 'ALL' &&
            item.LocationGuid === '00000000-0000-0000-0000-000000000000'
        );
        this.employeeDetailsForm.value.LstDeapartments = filteredData.length > 0 ? filteredData : (this.employeeDetailsForm.value.LstDeapartments?.length > 0 ? this.employeeDetailsForm.value.LstDeapartments : this.employeeDetailsForm.value.LstDeapartments = []);
      }
      const CenterLocations = this.employeeDetailsForm.value.CenterLocationList;
      if(CenterLocations?.length > 0){
        const AllCenters = CenterLocations?.filter((data:any)=> 
        data?.CenterGuid == "00000000-0000-0000-0000-000000000000"  &&
         data?.CompanyName == "ALL"
        );
        this.employeeDetailsForm.value.CenterLocationList = AllCenters?.length > 0 ? AllCenters : (this.employeeDetailsForm.value.CenterLocationList.length > 0 ? this.employeeDetailsForm.value.CenterLocationList : this.employeeDetailsForm.value.CenterLocationList = []);
      };
        this.userManagementService.saveEmployeeDetails(this.employeeDetailsForm.value).subscribe(
          (Data) => {
            this.FormChanged = false;
            this.router.navigate(['/user-management']);
            // this.globalService.stopSpinner();
            this.shimmerVisible = false;
          },
          (err: HttpErrorResponse) => {
            // this.globalService.stopSpinner();
            this.shimmerVisible = false;
          })
      }
    },
      (err: HttpErrorResponse) => {
        this.passworderror = err.error.error_description;
        // this.globalService.stopSpinner();
        this.shimmerVisible = false;
      }
    );
  }

  get userName() {
    return this.employeeDetailsForm.value.userName
  }

  focusOutFunction() {
    this.EmailResponse = '';
    this.EmailValid = false;
    this.DuplicateCheck = false;
    if (this.email && this.employeeDetailsForm.get('email')?.valid || this.b2buserDetailsForm.get('userName')?.valid) {
      this.SpinnerCheck = true;
      this.authService.CheckUserEmail(this.b2bUsers==true?this.b2buserDetailsForm.value.userName:this.email).subscribe((data) => {
        //this.SpinnerCheck=true;
        debounceTime(500)
        if (data.result == false) {
          this.EmailValid = false;
          this.DuplicateCheck = true;
          //this.notifyService.showError(data.message, 'Register');
        }
        if (data.result == true) {
          this.EmailValid = true;
          this.DuplicateCheck = false;
          //this.notifyService.showSuccess(data.message, 'Register');
        }
        this.SpinnerCheck = false;
        this.EmailResponse = data.message
      },
        (err: HttpErrorResponse) => {
          this.EmailValid = false;
          this.DuplicateCheck = false;
          this.SpinnerCheck = false;
          //this.notifyService.showError('Failed!', 'Register');
        })
    }
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
  UpdateEmployee() {
    if (this.getEmployeedata.Email == this.employeeDetailsForm.value.email) {
      // this.globalService.startSpinner();
      this.shimmerVisible = true;
      let approle = [];
      approle.push(...this.employeeDetailsForm.value.VQApprovals, ...this.employeeDetailsForm.value.VMApprovals, ...this.employeeDetailsForm.value.SRApprovals, ...this.employeeDetailsForm.value.SPVApprovals, ...this.employeeDetailsForm.value.SIApprovals, ...this.employeeDetailsForm.value.PODApprovals, ...this.employeeDetailsForm.value.POApprovals,
        ...this.employeeDetailsForm.value.PIApprovals, ...this.employeeDetailsForm.value.ISApprovals, ...this.employeeDetailsForm.value.IMApprovals, ...this.employeeDetailsForm.value.GRNApprovals, ...this.employeeDetailsForm.value.QOApprovals, ...this.employeeDetailsForm.value.SCRAPApprovals,
        ...this.employeeDetailsForm.value.SRFApprovals,...this.employeeDetailsForm.value.SUPPLIERApprovals,...this.employeeDetailsForm.value.MANUFACTUREApprovals)
      let filteredArray = approle.filter(function (value) { return value !== "" && value !== " " && value !== null && value !== undefined; });
      this.employeeDetailsForm.value.lstApproval = filteredArray;
      const date: any = this.employeeDetailsForm.value.startDate ? this.employeeDetailsForm.value.startDate.year + "-" + this.employeeDetailsForm.value.startDate.month + "-" + this.employeeDetailsForm.value.startDate.day : null;
      this.employeeDetailsForm.value.startDate = date
      const dateone: any = this.employeeDetailsForm.value.dob ? this.employeeDetailsForm.value.dob.year + "-" + this.employeeDetailsForm.value.dob.month + "-" + this.employeeDetailsForm.value.dob.day : null;
      this.employeeDetailsForm.value.dob = dateone;
      const data = this.employeeDetailsForm.value.LstDeapartments;
      if (data && data.length > 0) {
        const filteredData = data.filter(
          (item: any) =>
            item.Location === 'ALL' &&
            item.LocationGuid === '00000000-0000-0000-0000-000000000000'
        );

        this.employeeDetailsForm.value.LstDeapartments = filteredData.length > 0 ? filteredData : (this.employeeDetailsForm.value.LstDeapartments?.length > 0 ? this.employeeDetailsForm.value.LstDeapartments : this.employeeDetailsForm.value.LstDeapartments = []);
      }
      ;
      this.userManagementService.saveEmployeeDetails(this.employeeDetailsForm.value).subscribe(
        (Data) => {
          this.FormChanged = false;
          localStorage.setItem('mobileNo', this.employeeDetailsForm.value.mobileNo);
         this.router.navigate(['/user-management']);
        },
        (err: HttpErrorResponse) => {
          // this.globalService.stopSpinner();
          this.shimmerVisible = false;
        })
    }
    else {  
      // this.globalService.startSpinner()
      this.shimmerVisible = true;
      let createdDate = moment(new Date()).format('YYYY/MM/DD[T]HH:mm:ss');
      const v: any = this.employeeDetailsForm.value;
      this.userManagementService.updateEmail({
        email: (v.email || "").trim(),
        UpdateDate: createdDate,
        UserGuid: this.SelectedUserDetails.UserGuid
      } as any).subscribe((user) => {
        let approle = [];
        approle.push(...this.employeeDetailsForm.value.VQApprovals, ...this.employeeDetailsForm.value.VMApprovals, ...this.employeeDetailsForm.value.SRApprovals, ...this.employeeDetailsForm.value.SPVApprovals, ...this.employeeDetailsForm.value.SIApprovals, ...this.employeeDetailsForm.value.PODApprovals, ...this.employeeDetailsForm.value.POApprovals,
          ...this.employeeDetailsForm.value.PIApprovals, ...this.employeeDetailsForm.value.ISApprovals, ...this.employeeDetailsForm.value.IMApprovals, ...this.employeeDetailsForm.value.GRNApprovals, ...this.employeeDetailsForm.value.QOApprovals, ...this.employeeDetailsForm.value.SCRAPApprovals,
          ...this.employeeDetailsForm.value.SRFApprovals,...this.employeeDetailsForm.value.SUPPLIERApprovals,...this.employeeDetailsForm.value.MANUFACTUREApprovals)
        let filteredArray = approle.filter(function (value) { return value !== "" && value !== " " && value !== null && value !== undefined; });
        this.employeeDetailsForm.value.lstApproval = filteredArray;
        const date: any = this.employeeDetailsForm.value.startDate ? this.employeeDetailsForm.value.startDate.year + "-" + this.employeeDetailsForm.value.startDate.month + "-" + this.employeeDetailsForm.value.startDate.day : null;
        this.employeeDetailsForm.value.startDate = date
        const dateone: any = this.employeeDetailsForm.value.dob ? this.employeeDetailsForm.value.dob.year + "-" + this.employeeDetailsForm.value.dob.month + "-" + this.employeeDetailsForm.value.dob.day : null;
        this.employeeDetailsForm.value.dob = dateone;
        this.userManagementService.saveEmployeeDetails(this.employeeDetailsForm.value).subscribe(
          (Data) => {
            this.FormChanged = false;
            this.router.navigate(['/user-management']);
          },
          (err: HttpErrorResponse) => {
            // this.globalService.stopSpinner();
            this.shimmerVisible = false;
          })
      },
      )
    }
  }
  Oncountrychange($event: any) {
    this.employeeDetailsForm.patchValue({
      mobileNumber: ""
    })
    this.isdisable = false;
  }
  get employeeCode() {
    return this.employeeDetailsForm.value.employeeCode;
  }
  get name() {
    return this.employeeDetailsForm.value.name?.trim();
  }

  get u() {
    return this.employeeDetailsForm.controls;
  }
  get b2b() {
    return this.b2buserDetailsForm.controls;
  }

  get streetNo() {
    return this.employeeDetailsForm.value.streetNo;
  }

  get locality() {
    return this.employeeDetailsForm.value.locality;
  }

  get city() {
    return this.employeeDetailsForm.value.city;
  }

  get ofcPincode() {
    return this.employeeDetailsForm.value.ofcPincode;
  }

  get Pincode() {
    return this.employeeDetailsForm.value.pincode;
  }

  get houseNo() {
    return this.employeeDetailsForm.value.houseNo;
  }

  get ofcStreetNo() {
    return this.employeeDetailsForm.value.ofcStreetNo;
  }

  get ofcLocality() {
    return this.employeeDetailsForm.value.ofcLocality;
  }

  get ofcCity() {
    return this.employeeDetailsForm.value.ofcCity;
  }

  get mobileNo() {
    return this.employeeDetailsForm.value.mobileNo;
  }
  get phoneNo() {
    return this.employeeDetailsForm.value.phoneNo;
  }
  get fathersName() {
    return this.employeeDetailsForm.value.fathersName;
  }
  get mothersName() {
    return this.employeeDetailsForm.value.mothersName;
  }
  get esiNumber() {
    return this.employeeDetailsForm.value.esiNumber;
  }
  get epfNumber() {
    return this.employeeDetailsForm.value.epfNumber;
  }
  get panNumber() {
    return this.employeeDetailsForm.value.panNumber;
  }
  get confirmPassword() {
    return this.u?.confirmPassword.value || '';
  }
  get passWord() {
    return this.u?.password.value || '';
  }
  get email() {
    return this.u?.email.value?.trim() || '';
  }
  reset() {
    this.shimmerVisible = true;
    this.IsvalidPasword = false;
    this.StateDetails = [];
    this.EmailResponse = ''
    this.employeeDetailsForm.markAsUntouched();
    if (this.EmployeeGuid != '') {
      this.clickedit();
    }
    if (this.EmployeeGuid == '') {
      this.employeeDetailsForm.patchValue({
        userName: '',
        password: '',
        confirmPassword: ''
      })
    }
    this.designationForm.patchValue({
      designation: ''
    })
    this.centerForm.patchValue({
      center: ''
    })
    this.save = false;
    this.SpinnerCheck = false;
    this.employeeDetailsForm.reset();
    this.IsvalidPasword=false;
    this.cpIsValid=false
    this.roles = [];
    this.defaultRole = []
    this.shimmerVisible = false;
    if (this.EmployeeGuid == '') {
      //this.genarateEmployeeCode()
      this.employeeDetailsForm.patchValue({
        employeeCode: '',
        countrycode: '+91',
        SPVApprovals: '',
        SIApprovals: '',
        PODApprovals: '',
        POApprovals: '',
        PIApprovals: '',
        ISApprovals: '',
        IMApprovals: '',
        GRNApprovals: '',
        QOApprovals: '',
        SCRAPApprovals: '',
        SRFApprovals: '',
        SUPPLIERApprovals: '',
        MANUFACTUREApprovals: '',
        VQApprovals: '',
        SRApprovals: '',
        VMApprovals: ''
      })
    }
    this.FormChanged = false;
  }

  clickedit() {
    this.cpIsValid = true;
    // this.globalService.startSpinner();
    this.shimmerVisible = true;
    this.userManagementService.getUserDetails(this.EmployeeGuid).subscribe((data) => {
      // this.globalService.stopSpinner();
      this.getEmployeedata = data;
      this.makeActive = data.IsDeleted;
      this.isdeleted = this.getEmployeedata.IsDeleted
      const DOB = this.getEmployeedata.DOB === '0001-01-01T00:00:00'
        ? null : {
          year: new Date(this.getEmployeedata.DOB).getFullYear(),
          month: new Date(this.getEmployeedata.DOB).getMonth() + 1,
          day: new Date(this.getEmployeedata.DOB).getDate()
        }
      const StartDate = this.getEmployeedata.StartDate === '0001-01-01T00:00:00'
        ? null
        : {
          year: new Date(this.getEmployeedata.StartDate).getFullYear(),
          month: new Date(this.getEmployeedata.StartDate).getMonth() + 1,
          day: new Date(this.getEmployeedata.StartDate).getDate()
        };
      if (this.b2bUsers == true) {
        this.b2buserDetailsForm.patchValue({
          employeeGuid: this.EmployeeGuid,
          employeeCode: this.getEmployeedata.EmployeeId,
          name: this.getEmployeedata.Name,
          mobileNo: this.getEmployeedata.Mobile,
          phoneNo: this.getEmployeedata.Phone,
          email: this.getEmployeedata.Email,
          password: this.duplicatePwd,
          confirmPassword: this.duplicatePwd,
          UserName: this.getEmployeedata.Email,
          userName: this.getEmployeedata.UserName,
          LocationGuid: this.getEmployeedata.Locality,
          Clienttype: this.getEmployeedata.Clienttype
        })
        let testselected: any[] = []
        const selectedRoleGuidsArray = this.getEmployeedata.EmployeeRolesIds?.split(','); // convert to an array
        selectedRoleGuidsArray.forEach((e: any) => {
          let asd = this.lstRole.filter((le: { RoleGuid: any; }) => le.RoleGuid.toLowerCase() == e.trim().toLowerCase())
          testselected.push(...asd);
          this.adminDisabled = false;
        });
        let approles: any[] = [];
        const slectedapproles = this.getEmployeedata.ApprovalTypes.split(','); // convert to an array
        slectedapproles.forEach((a: any) => {
          let asd = this.lstApproval.filter((la: { Guid: any; }) => la.Guid.toLowerCase() == a.trim().toLowerCase())
          approles.push(...asd)
        });
        this.b2buserDetailsForm.patchValue({ SIApprovals: approles.filter(e => e.AppRightFor.toLowerCase() == 'si' && e.TypeName != null) });
        this.b2buserDetailsForm.patchValue({ LstRoles: testselected });
        let departmentSelected: any[] = [];
        if (this.getEmployeedata.Departments?.length) {
          const departmentsSelect = this.getEmployeedata.Departments?.split(','); // convert to an array
          departmentsSelect.forEach((e: any) => {
            let dep = this.lstDepartment.filter((lg: { LocationGuid: any; }) => lg.LocationGuid.toLowerCase() == e.trim().toLowerCase())
            departmentSelected.push(...dep)
            this.b2buserDetailsForm.patchValue({ LstDeapartments: departmentSelected });
          });
          let ListItemDetails: any[] = [];
          const Itemslist = this.getEmployeedata.ItemGuid?.split(',');
          if (Itemslist) {
            Itemslist.forEach((e: any) => {
              let dep = this.Allitems.filter((lg: { ItemGuid: any; }) => lg.ItemGuid.toLowerCase() === e.trim().toLowerCase());
              ListItemDetails.push(...dep);
            });
            this.b2buserDetailsForm.patchValue({ LstItemDetails: ListItemDetails });
          }
        }
        else {
          this.b2buserDetailsForm.patchValue({ LstDeapartments: [] });
        }
        this.shimmerVisible = false;
        this.FormChanged = false;
      }
      else {
        this.employeeDetailsForm.patchValue({
          employeeGuid: this.EmployeeGuid,
          employeeCode: this.getEmployeedata.EmployeeId,
          //locality: this.getEmployeedata.Location ,
          name: this.getEmployeedata.Name,
          //houseNo: this.getEmployeedata.HouseNo ,
          DesignationGuid: this.getEmployeedata.DesignationGuid == '00000000-0000-0000-0000-000000000000' ? null : this.getEmployeedata.DesignationGuid,
          streetNo: this.getEmployeedata.StreetName,
          locality: this.getEmployeedata.Locality,
          city: this.getEmployeedata.City,
          pincode: this.getEmployeedata.Pincode,
          houseNo: this.getEmployeedata.PermanentHouseNo,
          ofcStreetNo: this.getEmployeedata.PermanentStreetName,
          ofcLocality: this.getEmployeedata.PermanentLocality,
          ofcCity: this.getEmployeedata.PermanentCity,
          ofcPincode: this.getEmployeedata.PermanentPincode,
          email: this.getEmployeedata.Email,
          countrycode: this.getEmployeedata.CountryCode,
          phoneNo: this.getEmployeedata.Phone,
          mobileNo: this.getEmployeedata.Mobile,
          dob: DOB,
          qualification: this.getEmployeedata.Qualification,
          bloodGroup: this.getEmployeedata.BloodGroup,
          fathersName: this.getEmployeedata.FatherName,
          mothersName: this.getEmployeedata.MotherName,
          esiNumber: this.getEmployeedata.ESINo,
          epfNumber: this.getEmployeedata.EPFNo,
          panNumber: this.getEmployeedata.PANNo,
          passportNumber: this.getEmployeedata.PassportNo,
          startDate: StartDate,
          allowSharing: this.getEmployeedata.AllowSharing,
          accessMobileApp: this.getEmployeedata.AccessMobileApp,
          approveSpecialRate: this.getEmployeedata.ApproveSpecialRate,
          amrValueAccess: this.getEmployeedata.AMRValueAccess,
          hideRate: this.getEmployeedata.IsHideRate,
          //approveAmendmentofMachineReading: this.getEmployeedata.EPFNo ,
          sampleLogisticReject: this.getEmployeedata.IsSampleLogisticReject,
          globalReportAccess: this.getEmployeedata.GlobalReportAccess,
          //Approvals:this.getEmployeedata.GlobalReportAccess ,
          //departments: this.getEmployeedata.EPFNo ,
          StateGuid: this.getEmployeedata.StateGuid,
          ZoneGuid: this.getEmployeedata.ZoneGuid,
          CenterGuid: this.getEmployeedata.CenterLocationGuid,
          //defaultCenter: this.getEmployeedata.EPFNo ,
          defaultRoles: this.getEmployeedata.RoleGuid,
          userName: this.getEmployeedata.UserName,
          password: this.duplicatePwd,
          confirmPassword: this.duplicatePwd,
          CenterLocationGuid: this.getEmployeedata.CenterGuid,
          LocationGuid: this.getEmployeedata.Locality,
          updatedEmail: this.getEmployeedata.Email,
          paymentRoles:this.getEmployeedata.paymentRoles
        })
        this.StateDetails = this.StateDetails = this.lstLocations.filter((data: any) => data.CenterGuid == this.getEmployeedata.CenterGuid)
        const lisdef = this.lstRole.filter((le: { RoleGuid: any; }) => le.RoleGuid == this.getEmployeedata.RoleGuid);
        this.defaultRole = lisdef;
        let str = this.getEmployeedata.EmployeeRolesIds
        let testselected: any[] = []
        const selectedRoleGuidsArray = this.getEmployeedata.EmployeeRolesIds?.split(','); // convert to an array
        selectedRoleGuidsArray.forEach((e: any) => {
          let asd = this.lstRole.filter((le: { RoleGuid: any; }) => le.RoleGuid.toLowerCase() == e.trim().toLowerCase())
          testselected.push(...asd);
          this.adminDisabled = testselected.some((obj) => obj.RoleName === "ADMIN");
        });
        let departmentSelected: any[] = [];
        if (this.getEmployeedata.Departments?.length) {
          const departmentsSelect = this.getEmployeedata.Departments?.split(','); // convert to an array
          departmentsSelect.forEach((e: any) => {
            let dep = this.lstDepartment.filter((lg: { LocationGuid: any; }) => lg.LocationGuid.toLowerCase() == e.trim().toLowerCase())
            departmentSelected.push(...dep)
            this.employeeDetailsForm.patchValue({ LstDeapartments: departmentSelected });
          });
        } else {
          this.employeeDetailsForm.patchValue({ LstDeapartments: [] });
        }

        let approles: any[] = [];
        const slectedapproles = this.getEmployeedata.ApprovalTypes.split(','); // convert to an array
        slectedapproles.forEach((a: any) => {
          let asd = this.lstApproval.filter((la: { Guid: any; }) => la.Guid.toLowerCase() == a.trim().toLowerCase())
          approles.push(...asd)
        });
        let CenterLocationArray: any[] = [];
        let CenterLocationGuidList = this.getEmployeedata?.CenterLocationList?.split(',');
        CenterLocationGuidList?.forEach((element: any) => {
          let centerFilter = this.lstLocations?.filter((data: any) => data?.CenterGuid?.toLowerCase() == element.trim().toLowerCase());
          CenterLocationArray.push(...centerFilter);
        });
        const AllCenters = CenterLocationGuidList?.filter((element:any)=> element == "00000000-0000-0000-0000-000000000000");
      if(AllCenters?.length != 0){
        this.StateLocationDetails  = this.lstLocations?.filter((data:any)=> data?.CenterGuid != "00000000-0000-0000-0000-000000000000"  && data?.CompanyName != "ALL");

      }else{

        this.StateLocationDetails = CenterLocationArray;
      }
        this.employeeDetailsForm.patchValue({ CenterLocationList: CenterLocationArray });
        this.employeeDetailsForm.patchValue({ GRNApprovals: approles.filter(e => e.AppRightFor.toLowerCase() == 'grn' && e.TypeName != null) });
        this.employeeDetailsForm.patchValue({ IMApprovals: approles.filter(e => e.AppRightFor.toLowerCase() == 'im' && e.TypeName != null) });
        this.employeeDetailsForm.patchValue({ ISApprovals: approles.filter(e => e.AppRightFor.toLowerCase() == 'is' && e.TypeName != null) });
        this.employeeDetailsForm.patchValue({ PIApprovals: approles.filter(e => e.AppRightFor.toLowerCase() == 'pi' && e.TypeName != null) });
        this.employeeDetailsForm.patchValue({ POApprovals: approles.filter(e => e.AppRightFor.toLowerCase() == 'po' && e.TypeName != null) });
        this.employeeDetailsForm.patchValue({ PODApprovals: approles.filter(e => e.AppRightFor.toLowerCase() == 'pod' && e.TypeName != null) });
        this.employeeDetailsForm.patchValue({ SPVApprovals: approles.filter(e => e.AppRightFor.toLowerCase() == 'spv' && e.TypeName != null) });
        this.employeeDetailsForm.patchValue({ SRApprovals: approles.filter(e => e.AppRightFor.toLowerCase() == 'sr' && e.TypeName != null) });
        this.employeeDetailsForm.patchValue({ VMApprovals: approles.filter(e => e.AppRightFor.toLowerCase() == 'vm' && e.TypeName != null) });
        this.employeeDetailsForm.patchValue({ VQApprovals: approles.filter(e => e.AppRightFor.toLowerCase() == 'vq' && e.TypeName != null) });
        this.employeeDetailsForm.patchValue({ SIApprovals: approles.filter(e => e.AppRightFor.toLowerCase() == 'si' && e.TypeName != null) });
        this.employeeDetailsForm.patchValue({ QOApprovals: approles.filter(e => e.AppRightFor.toLowerCase() == 'qo' && e.TypeName != null) });
        this.employeeDetailsForm.patchValue({ SCRAPApprovals: approles.filter(e => e.AppRightFor.toLowerCase() == 'scrap' && e.TypeName != null) });
        this.employeeDetailsForm.patchValue({ SRFApprovals: approles.filter(e => e.AppRightFor.toLowerCase() == 'srf' && e.TypeName != null) });
        this.employeeDetailsForm.patchValue({ SUPPLIERApprovals: approles.filter(e => e.AppRightFor.toLowerCase() == 'supplier' && e.TypeName != null) });
        this.employeeDetailsForm.patchValue({ MANUFACTUREApprovals: approles.filter(e => e.AppRightFor.toLowerCase() == 'manufacture' && e.TypeName != null) });
        // this.selectedRoles = selectedRoleGuidsArray;
        this.employeeDetailsForm.patchValue({ LstRoles: testselected });
        
        // this.selectedRoleNames = this.lstRole
        //   .filter((role: { RoleGuid: any; }) => selectedRoleGuidsArray.includes(role.RoleGuid))
        //   .map((role: { RoleName: any; }) => role.RoleName);
        this.FormChanged = false;
        this.roles = [];
        this.shimmerVisible = false;
        // this.globalService.stopSpinner();
      }
    }, err => {
      // this.globalService.stopSpinner();
      this.shimmerVisible = false;
    })
  }

  designationsave(event: any) {
    this.customDesignation = event
    this.designationForm.value.designation
    this.userManagementService.saveDesignation(this.designationForm.value.designation).subscribe((data) => {
      this.resetDesignationPopUp();
     this.getUserSDefaults();
      this.employeeDetailsForm.patchValue({
        DesignationGuid: data.DesignationGuid
      })
    })
    this.FormChanged=true;
  }

  centersave() {
    this.centerForm.value.center
    this.userManagementService.saveCenter(this.centerForm.value.center).subscribe((data) => {
      this.resetCenterPopup();
      this.getUserSDefaults();
      this.employeeDetailsForm.patchValue({ CenterGuid: data.CenterGuid })
    })
  }

  // RolesSelect(event: any) {
  //   this.defaultRole = event;
  //   event.forEach((role: any) => {
  //     this.lstRoles.push(this.fb.group({
  //       LstRoles: role.RoleGuid
  //     }));
  //   })
  // }

  onitemSelect(event: any) {
    this.defaultRole=[];
    this.defaultRole.push(event);
    this.defaultRole.filter((item, index) => {
      return this.defaultRole.indexOf(item) === index
    });
    this.employeeDetailsForm.get('LstRoles')?.markAsTouched();
  }
  onlocationSelect(event: any) {
    this.employeeDetailsForm.get('LstDeapartments')?.markAsTouched();
  }
  onSelectCenters(event: any) {
    this.employeeDetailsForm.get('CenterLocationList')?.markAsTouched();
  }
  // onSelectAll(items: any) {
  //   // this.defaultRole = this.lstRole.map((x: { RoleGuid: any; }) => x.RoleGuid);
  //   // this.resetTable();
  // }

  onselectAll(items: any) {
    this.defaultRole = this.lstRole.map((x: { RoleGuid: any; }) => x.RoleGuid);
    // this.resetTable();
  }

  onDeSelectRoles(event: any) {
    const newArray = this.defaultRole.filter((item) => item.RoleGuid !== event.RoleGuid);
    this.defaultRole = newArray;
    this.defaultRole?.length !== 0 ? this.defaultRole : this.employeeDetailsForm.patchValue({ defaultRoles: '' });
    this.roles = '';
  }
  onItemDeSelectRoles(formcontrolName: any) {
    this.employeeDetailsForm.get(formcontrolName)?.markAsUntouched();
  }
  onClickMultiselect(formcontrolName: any) {
    
    this.employeeDetailsForm.get(formcontrolName)?.markAsTouched();
    if("CenterLocationList" === formcontrolName ){
      this.StateLocationDetails=[];
      const LocationDetails =this.employeeDetailsForm.value.CenterLocationList;
      const AllCenters = LocationDetails?.filter((data:any)=> data?.CenterGuid == "00000000-0000-0000-0000-000000000000"  && data?.CompanyName == "ALL");
      if(AllCenters?.length != 0){
        this.StateLocationDetails  = this.lstLocations?.filter((data:any)=> data?.CenterGuid != "00000000-0000-0000-0000-000000000000"  && data?.CompanyName != "ALL");

      }else{

        this.StateLocationDetails = LocationDetails;
      }
    }
  }
  onClickitemMultiselect(formcontrolName: any) {
    this.employeeDetailsForm.get(formcontrolName)?.markAsTouched();
  }
  // onDeSelectAll(event: any) {
  //   this.roles=''
  // }

  // onDeSelectDepartments(event: any) {
  //   const depArray = this.lstDepartment.filter((item) => item.LocationGuid !== event.LocationGuid);
  //   this.lstDepartment = depArray;
  // }

  phoneNoValidator(number: any): any {
    if (number.charCode >= 48 && number.charCode <= 57) {

    } else {
      return false;
    }

  }
  landlineNoValidator(number: any): any {
    if (number.charCode >= 48 && number.charCode <= 57) {
    } else {
      return false;
    }
  }
  getJson(): void {
    this.authService.GetJson().subscribe(
      (data => {
        if (data != undefined && data != null) {
          this.countrycode = data;
          this.getJason = true
        }
      })
    )
  }

  togglePsVisibility() {
    this.isPsVisible = !this.isPsVisible;
  }
  toggleCpVisibility() {
    this.isCpVisible = !this.isCpVisible;
  }
  // updateStatus(){
  //   this.makeActive = !this.makeActive;
  // }
  changeSearch(Keyword: any) {
    let data = this.lstDesignation.filter(((f: { DesignationName: string; }) => f.DesignationName.toLowerCase() == Keyword.toLowerCase()))
    this.duplicate = false;
    if (data?.length > 0) {
      this.duplicate = true;

    }
  }
  keyDownHandler(event: any) {
    this.changeSearch(event.target.value.trim());
  }

  getMinMaxDate() {
    this.dobMinDate = this.minDate.split('/');
    this.minYear = Number(this.dobMinDate[2]);
    this.minMonth = Number(this.dobMinDate[0]);
    this.minDay = Number(this.dobMinDate[1]);
    this.dobMaxDate = this.maxAge.split('/');
    this.maxYear = Number(this.dobMaxDate[2]);
    this.maxMonth = Number(this.dobMaxDate[0]);
    this.maxDay = Number(this.dobMaxDate[1]);
  }

  onFocusOutEvent(event: any) {  
    if(event.target.value == this.employeeDetailsForm.value.password){
      this.cpIsValid = true;
      this.IsvalidPasword = true;
    }
    else if(event.target.value == this.b2buserDetailsForm.value.password) {
      this.cpIsValid = true;
      this.IsvalidPasword = true;
    } else {
      this.IsvalidPasword = false;
      this.cpIsValid = false;
    }
  }
  onFocusOutEvents(event: any) {
    if(event.target.value == this.employeeDetailsForm.value.password){
      this.cpIsValid = true;
      this.IsvalidPasword = true;
    }
    else if (event.target.value == this.b2buserDetailsForm.value.confirmPassword) {
      this.cpIsValid = true;
      this.IsvalidPasword = true;
    } else {
      this.cpIsValid = false;
      this.IsvalidPasword=false;
    }
  }

  resetCenterPopup() {
    this.centerForm.reset();
  }

  resetDesignationPopUp() {
    this.designationForm.reset();
  }

  clickDeactivate(deactive: any) {
    // this.globalService.startSpinner()
    this.shimmerVisible = true;
    if (deactive == "Deactive") {
      this.makeActive = true;
    } else {
      this.makeActive = false;
    }
    let body = {
      EmployeeGuid: this.EmployeeGuid,
      UserGuid: this.SelectedUserDetails.UserGuid,
      IsActive: this.makeActive
    }
    this.userManagementService.deactivateUser(body).subscribe((data) => {
      this.router.navigateByUrl("/user-management");
      // this.globalService.stopSpinner()
      this.shimmerVisible = false;
    }, (err: HttpErrorResponse) => {
      // this.globalService.stopSpinner();
      this.shimmerVisible = false;
    })
  }

  GetDuplicateUserDetails() {
    // this.globalService.startSpinner();
    this.shimmerVisible = true;
    this.userManagementService.GetDuplicateUserDetails(this.keyword, this.SearchType).subscribe(data => {
      this.SearchCount = data.SearchCount > 0 ? true : false
      // this.globalService.stopSpinner();
      this.shimmerVisible = false;
    }, (err: HttpErrorResponse) => {
      // this.globalService.stopSpinner();
      this.shimmerVisible = false;
    })

  }
  SearchDeatils(KeyWord: any, SearchType: any) {
    if (KeyWord.target.value != '') {
      //this.shimmerVisible = true;
      this.modelChanged.next({ keyword: KeyWord.target.value, searchType: SearchType })
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
    this.employeeDetailsForm.patchValue({
      userName: event.target.value
    })
  }
  // onItemSelect(event: any){
  //   const selectedLocation = event.Location;

  // this.lstDepartment.forEach((option) => {
  //   if (option.Location !== selectedLocation && selectedLocation === 'ALL') {
  //     option.disabled = true;
  //   } else {
  //     option.disabled = false; // Enable the options that match the selected location
  //   }
  // });

  // }
  ChangeCenter(event: any) {
    if (event == undefined) {
      this.StateDetails = []
      this.employeeDetailsForm.patchValue({
        StateGuid: null
      })
    } else {
      this.StateDetails = this.lstLocations.filter((data: any) => data.CenterGuid == event.CenterGuid)
      this.employeeDetailsForm.patchValue({
        StateGuid: this.StateDetails[0].StateGuid
      })
    }
  }
  onLocationSelect(event: any) {
    this.isDropdownDisabled = this.employeeDetailsForm.value.LstDeapartments[0].Location == 'ALL' ? true : false
    // this.document.getElementById("#Name").disabled= false
  }
  click(event:any){
    this.b2buserDetailsForm.patchValue({
      UserName:event.target.value
    })
  }
  Updateb2bEmployee(){
    if (this.getEmployeedata.Email == this.b2buserDetailsForm.value.email) {
      // this.globalService.startSpinner();
      this.shimmerVisible = true;
      let approle = [];
      approle.push(...this.b2buserDetailsForm.value.SIApprovals)
      let filteredArray = approle.filter(function (value) { return value !== "" && value !== " " && value !== null && value !== undefined; });
      this.b2buserDetailsForm.value.lstApproval = filteredArray;
      const date: any = this.b2buserDetailsForm.value.startDate ? this.b2buserDetailsForm.value.startDate.year + "-" + this.b2buserDetailsForm.value.startDate.month + "-" + this.b2buserDetailsForm.value.startDate.day : null;
      this.b2buserDetailsForm.value.startDate = date
      const dateone: any = this.b2buserDetailsForm.value.dob ? this.b2buserDetailsForm.value.dob.year + "-" + this.b2buserDetailsForm.value.dob.month + "-" + this.b2buserDetailsForm.value.dob.day : null;
      this.b2buserDetailsForm.value.dob = dateone;
      const data = this.b2buserDetailsForm.value.LstDeapartments;
      if (data && data.length > 0) {
        const filteredData = data.filter(
          (item: any) =>
            item.Location === 'ALL' &&
            item.LocationGuid === '00000000-0000-0000-0000-000000000000'
        );

        this.b2buserDetailsForm.value.LstDeapartments = filteredData.length > 0 ? filteredData : (this.b2buserDetailsForm.value.LstDeapartments?.length > 0 ? this.b2buserDetailsForm.value.LstDeapartments : this.b2buserDetailsForm.value.LstDeapartments = []);
      }
      ;
    }
    this.userManagementService.saveEmployeeDetails(this.b2buserDetailsForm.value).subscribe(
      (Data) => {
        this.FormChanged = false;
       this.router.navigate(['/user-management']);
      },
      (err: HttpErrorResponse) => {
        // this.globalService.stopSpinner();
        this.shimmerVisible = false;
      })
  }
  /**
   * this event used to reset the b2buserdata
   */
  B2Breset(){
    this.b2buserDetailsForm.reset();
      this.b2buserDetailsForm.patchValue({
        name: '',
        mobileNo: '',
        phoneNo: '',
        LstDeapartments:'',
        SIApprovals:'',
        email:'',
        confirmPassword:'',
        password:'',
        UserName:'',
        LstRoles:'',
        employeeCode:'',
        Clienttype:null,
        countrycode:'+91',
        EmailConfirmed:''
      })     
      if (this.EmployeeGuid != '') {
        this.clickedit();
      }
      this.FormChanged = false;
    }
    /**
     * this event used to patch the email and username
     * @param event 
     */
    B2BCode(event:any){
      this.b2buserDetailsForm.patchValue({
        email:event.target.value,
        userName:event.target.value
      })    
    }
    /**
     * this service method used to Get the b2b Items
     */
    GetItemDetails() {
      this.shimmerVisible = true
      this.indentService.Getindentitems(this.b2bUsers).subscribe(data => {
        this.Allitems = data.oGetIndentitems;
        const extraDepartment = { ItemName: 'ALL', ItemGuid: '00000000-0000-0000-0000-000000000000' };
        this.Allitems.unshift(extraDepartment);
        this.lstItems=this.Allitems
        this.SpinnerCheck = false;
        this.shimmerVisible = false;
      },
      error => {
        this.shimmerVisible = false;
      });
  }
  ChangeEvent(rowNo: any) {
    this.pageNumber=1;
    this.itemsPerPage = rowNo.target.value;
    this.rowCount = rowNo.target.value;
    this.pageSize = rowNo.target.value;
    this.GetAllUsers();
  }
  GetAllUsers() {
  }
}
