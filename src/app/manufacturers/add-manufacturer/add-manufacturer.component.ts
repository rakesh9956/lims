import { Component, TemplateRef } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, throttleTime } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GlobalService } from 'src/app/core/Services/global.service';
import { ManufactureService } from 'src/app/core/Services/manufacture.service';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthenticationService } from 'src/app/core/Services/authentication.service';
 import { FormValueTrimeer,UsernameValidator } from 'src/Utils/validators';
@Component({
  selector: 'app-add-manufacturer',
  templateUrl: './add-manufacturer.component.html',
  styleUrls: ['./add-manufacturer.component.scss']
})
export class AddManufacturerComponent {
  shimmerVisible:boolean;
  manufactureForm: FormGroup = {} as any;
  ManufactureGuid:any= "00000000-0000-0000-0000-000000000000";
  getManufactureData: any;
  FormChanged: boolean=false;
  DuplicateCheck: boolean = false;
  EmailValid: boolean = false;
  EmailResponse: string = "";
  keyword:any;
  itemOrder:any;
  sort:any;
  pageNumber:number=1;
  rowCount:number=40;
  modelChanged = new Subject<string>();
  CheckDuplicateManufacture:boolean=false;
  constructor(
    private fb: FormBuilder,
    private manufactureService: ManufactureService,
    private modalService: NgbModal,public globalService: GlobalService,
    private router: Router,
    private route : ActivatedRoute,
    private authService: AuthenticationService)  {
      this.modelChanged.pipe(debounceTime(1000)).subscribe(model => {
        this.keyword = model;
        this.GetDuplicateManufacture();
      });
     }

  ngOnInit(): void {
    this.ManufactureGuid = this.route.snapshot.paramMap.get('ManufactureGuid') || '';
    if (this.ManufactureGuid != '') {
      this.clickedit();
    }
    this.initForms();
    this.manufactureForm.valueChanges.pipe(distinctUntilChanged(), throttleTime(500)).subscribe((values: any) => {
      this.FormChanged = true;
    }
    );
  }

 
  initForms(): void {
    this.manufactureForm = this.fb.group({
    ManufactureGuid: [this.ManufactureGuid],
    ManufactureName: ['', [Validators.required, UsernameValidator.cannotContainSpace]],
    Contactperson:[''],
    Dlno: ['', Validators.compose([Validators.pattern(/^[A-Za-z]{2}-\d{2}-\d{7}$/)])],
    Tinno: ['',Validators.compose([Validators.pattern(/^[A-Za-z]{5}\d{4}[A-Za-z]{1}$/)])],
    Mobile:[''],
    Phone:[''],
     Email: ['', Validators.compose([Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)])],
    Fax:[''],
    Address:['', [Validators.required, UsernameValidator.cannotContainSpace]],
    Address2:['',],
    Address3:['',],
    Country: ['India', Validators.required],
    City:[''],
    Pincode:['']
    
   })
}

//Saving Manufacture details//
SaveManufactureDetails(): void {
  // this.globalService.startSpinner();
  this.shimmerVisible=true;
  FormValueTrimeer.cleanForm(this.manufactureForm); 
  this.manufactureService.SaveManufacture(this.manufactureForm.value).subscribe(
      (data) => {
        this.router.navigate(['/manufacturers']);
        // this.globalService.stopSpinner();
        this.shimmerVisible=false;
      },
      (err) => {
        // this.globalService.stopSpinner();
        this.shimmerVisible=false;
      });
  }
  openXlModal(content: TemplateRef<any>) {
    this.modalService.open(content, {size:'md'}).result.then((result) => {
    }).catch((res) => {});
  }
   /**
   * Type:click event
   * For close the profile
   */
  closeManufacture() {
    this.manufactureForm.reset({
      ManufactureGuid:'',
      Tinno:'',
      Dlno:'',
      Country:'India',
      Mobile:'',
      Address:'',
    });
      if(this.ManufactureGuid ){ 
      this.clickedit();  
      }  
      
      this.FormChanged=false
    }  
  EmailKeyup(event: any) {
    if (event.target.value) {
      this.EmailResponse = '';
      this.EmailValid = false;
      this.DuplicateCheck = false;
    }
  }
  focusOutFunction() {
    this.EmailResponse = '';
    this.EmailValid = false;
    this.DuplicateCheck = false;
    if (this.Email && this.manufactureForm.get('Email')?.valid) {
      //this.SpinnerCheck=true;
      this.authService.CheckUserEmail(this.Email).subscribe((data: { result: boolean; message: string; }) => {
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
  // faxValidator(data:any) {  
  //   if (String(data.target.value).length == 10 && this.manufactureForm.value.countrycode) {     
  //   }
  //   return data.target.value = data.target.value.replace(/[^0-9.]/g, '');
  // }
  faxValidator(number: any): any {
 if (number.charCode >= 48 && number.charCode <= 57) {

 } else {
   return false;

 }
 }
 get u() {
  return this.manufactureForm.controls;
}
  get ManufactureName(){
        return this.manufactureForm.value.ManufactureName?.trim();
      }
  get Contactperson(){
        return this.manufactureForm.value.Contactperson;
      }
  get Address(){
        return this.manufactureForm.value.Address?.trim();
      }
  get Mobile(){
        return this.manufactureForm.value.Mobile;
      }
  get Fax(){
        return this.manufactureForm.value.Fax;
      }
  get Email(){
        return this.manufactureForm.value.Email;
      }
  get Country(){ 
        return this.manufactureForm.value.Country;
      }
  get City(){  
        return this.manufactureForm.value.City;
      }
  get Pincode(){ 
        return this.manufactureForm.value.Pincode;
      }
  get Dlno(){ 
        return this.manufactureForm.value.Dlno;
      }
  get Tinno(){   
        return this.manufactureForm.value.Tinno;
      }

  clickedit(){
    // this.globalService.startSpinner();
    this.shimmerVisible=true;
    this.manufactureService.getManufactureDetails(this.ManufactureGuid).subscribe((data)=>{
      this.getManufactureData = data.Result  
      this.manufactureForm.patchValue({
        ManufactureGuid: this.getManufactureData[0].ManufactureGuid,
        ManufactureName: this.getManufactureData[0].ManufactureName,
        Contactperson:this.getManufactureData[0].ContactPerson,
        Address: this.getManufactureData[0].Address,
        Address2: this.getManufactureData[0].Address2,
        Address3: this.getManufactureData[0].Address3,
        Phone: this.getManufactureData[0].PhoneNumber,
        Mobile: this.getManufactureData[0].MobileNumber,
        Fax:this.getManufactureData[0].Fax,
        Email:this.getManufactureData[0].Email,
        Country:this.getManufactureData[0].Country,        
        City: this.getManufactureData[0].City,
        Pincode: this.getManufactureData[0].PinCode, 
        Dlno:this.getManufactureData[0].DlNo,
        Tinno:this.getManufactureData[0].TinNo                
      })
      this.FormChanged = false;
      // this.globalService.stopSpinner();
      this.shimmerVisible=false;
    },(err) => {
      // this.globalService.stopSpinner();
      this.shimmerVisible=false;
    }
    )
   }
/**Get the duplicate manufactures by passing keyword */
GetDuplicateManufacture(){
  this.keyword = (this.keyword == undefined || this.keyword == null) ? this.keyword || "" : this.keyword;
   this.manufactureService.getManufacture(this.keyword, this.itemOrder, this.sort, this.pageNumber, this.rowCount,'AddManufacture').subscribe((data) => {
    this.CheckDuplicateManufacture=data?.length>0?true:false
    console.log('ciad',this.CheckDuplicateManufacture)
 },
  error => {
    this.globalService.stopSpinner();
  });
}
/**
 * Used to search 
 * @param Keyword 
 */
changeSearch(Keyword: any) {
  this.pageNumber = 1;
  this.rowCount = 40;
  this.modelChanged.next(Keyword.target.value);
}
}
