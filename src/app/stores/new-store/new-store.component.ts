import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { StoreLocationsService } from 'src/app/core/Services/store-locations.service';
import { GlobalService } from 'src/app/core/Services/global.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormValueTrimeer, UsernameValidator } from 'src/Utils/validators';
import * as moment from 'moment';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-new-store',
  templateUrl: './new-store.component.html',
  styleUrls: ['./new-store.component.scss']
})
export class NewStoreComponent implements OnInit{
  shimmerVisible:boolean;
  locationForm: FormGroup = {} as any;
  businessJone: any=[];
  center: any=[];
  city: any=[];
  state: any=[];
  pages: number;
  TotalCount: any;
  pageSize: any=40;
  item: any=[];
  keyword: any='';
  rowCount: any=40;
  itemOrder: any="";
  sort: string='';
  pageNumber=1;
  centerLocation: any=[];
  selectedCenterLoc: any=[];
  contactPerson: any=[];
  contactphone: any=[];
  locationGuid: any;
  locGuid: any = {}
  centers: any = [];
  LocGuid: any;
  centerName: any;
  addNew: any;
  onLocationForm: boolean;
  XLdata: any;
  constructor(
    private storeService: StoreLocationsService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private globleService: GlobalService,
    private modalService: NgbModal
  ) {  }

  ngOnInit(): void {
    this.addNew = this.route.snapshot.params['AddStore'];
    this.locGuid = localStorage.getItem('Guid');
    this.LocGuid = JSON.parse(this.locGuid);
    this.getCentreTypeDefault();
    this.initforms();
    this.locationForm.valueChanges
    .pipe().subscribe(values => {
      this.onLocationForm = true;
    });
  }

  initforms(): void {
    this.locationForm = this.fb.group({
      businessJone: [''],
      categoryTypes: [''],
      stateName: [''],
      cityName: [''],
      Guid: [null, [Validators.required]],
      Location: ['',[Validators.required,UsernameValidator.cannotContainSpace]],
      Locations: ['',],
      ContactPerson: ['',[Validators.required, UsernameValidator.cannotContainSpace]],
      ContactPersonNo: ['', Validators.compose([Validators.pattern('^[0-9]{10}$')])],
      Address:['',[Validators.required, UsernameValidator.cannotContainSpace]],
    //Email:['',Validators.compose([Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')])]
      Email: ['', Validators.compose([Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)])],
      IsStore:[false]

    })
  }
  get Location(){
    return this.locationForm.value.Location?.trim();
  }
  
  get ContactPerson(){
    return this.locationForm.value.ContactPerson?.trim();
  }
  
  get Address(){
    return this.locationForm.value.Address?.trim();
  }

  get Email(){
    return this.locationForm.value.Email?.trim();
  }
  get ContactPersonNo(){
    return this.locationForm.value.ContactPersonNo?.trim();
  }
  getCentreTypeDefault() {
    // this.globleService.startSpinner();
    this.shimmerVisible=true;
    this.storeService.GetCentreTypeDefault().subscribe((data) => {  
      // this.globleService.stopSpinner(); 
      this.shimmerVisible=false;    
    this.center = data.Result?.LstCentre || [];      
      if(this.locGuid!=null && this.addNew==null) {
        // this.addNew = []  
        this.locationForm.patchValue({ 
          Guid: this.LocGuid.PannelGuid,        
          Location: this.LocGuid.Location,
          Locations : this.LocGuid.Locations,
          ContactPerson: this.LocGuid.ContactPerson,
          ContactPersonNo: this.LocGuid.ContactPersonNo,
          Address: this.LocGuid.StoreLocationAddress,
          Email: this.LocGuid.ContactPersonEmail,
          autoConsumeOn: true,
          autoSIReceived: 0,
          IsStore:this.LocGuid.IsStore
        })
        this.onLocationForm = false;
        this.shimmerVisible=false;
      }    
    },err => {
      this.shimmerVisible=false;
    })
  }  

  saveLocationDetails() {
    // this.globleService.startSpinner();
    this.shimmerVisible=true;
    if(this.addNew !=null) {
      this.LocGuid = [''];
    }  
    FormValueTrimeer.cleanForm(this.locationForm);    
    let loc={
      PanelGuid: this.locationForm.value.Guid,
      LocationGuid: this.LocGuid.Guid,
      Location: this.locationForm.value.Location,
      contactPerson: this.locationForm.value.ContactPerson,
      ContactPersonNo: this.locationForm.value.ContactPersonNo,
      StoreLocationAddress: this.locationForm.value.Address,
      ContactPersonEmail: this.locationForm.value.Email,
      autoConsumeOn: true,
      autoSIReceived: 0,
      IsStore:this.locationForm.value.IsStore 
    }

    console.log(loc);
    this.storeService.SaveLocationDetail(loc).subscribe((data)=>{
      this.onLocationForm = false;
      // this.globleService.startSpinner();
      this.shimmerVisible=true;
      //this.centerSelect=[];
      this.router.navigate(['/stores'])
    },err => {
      this.shimmerVisible=false;
    })
  }

  uploadData(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.readExcelFile(file);
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
      this.XLdata = await XLSX.utils.sheet_to_json(worksheet, { raw: false, dateNF: 'yyyy-mm-dd' });
      // this.QuotationXL=true;
      // Your data is now in jsonData, and dates are parsed correctly
      // this.saveXLDetails();
      
    };

    reader.readAsArrayBuffer(file);
   
  }

  SaveLocationEMployee(){
    let LocationDetailsFromXML : any =[];
  let createdDate = moment(new Date()).format('YYYY/MM/DD[T]HH:mm:ss');
  
  const data = this.XLdata?.map(async (x: any) => {
    if (x?.City != "Select" || x?.City != "") {
      const splitdata = x?.TagProcessingLab?.split('[')[0]
      console.log(splitdata)
      const userDetails = {
          PanelGuid: splitdata,
          Location: x.Company_Name,
          contactPerson: x.Name,
          ContactPersonNo: x.Phone,
          StoreLocationAddress: x.Add1,
          ContactPersonEmail: x.EmailID,
          autoConsumeOn: true,
          autoSIReceived: 0,
          IsStore:false 
      }
      await LocationDetailsFromXML.push(userDetails);
    }
  }); 

  this.storeService.saveXMLLocationDetails(LocationDetailsFromXML).subscribe((data : any) => {
    const Userdata = data;
    console.log(Userdata);
  })
  

  }

  phoneNoValidator(number: any) {
    if (String(number.target.value).length == 10) {
    }
    return number.target.value = number.target.value.replace(/[^0-9.]/g, '');
  }

  openXlModal(content: TemplateRef<any>) {
    this.modalService.open(content, {size:'md'}).result.then((result) => {
    }).catch((res) => {});
  }

  resetStore() {
    this.locationForm.reset();
    
    this.getCentreTypeDefault();
    this.locationForm.patchValue({
      IsStore:false
    })
    this.onLocationForm = false;
  }

  get l() {
    return this.locationForm.controls;
  }
}
