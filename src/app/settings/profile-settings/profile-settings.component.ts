import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthenticationService } from 'src/app/core/Services/authentication.service';
import { GlobalService } from 'src/app/core/Services/global.service';
import { NotificationService } from 'src/app/core/Services/notification.service';
import { UserManagementService } from 'src/app/core/Services/user-management.service';
import { UsernameValidator } from 'src/app/views/pages/advanced-form-elements/form-validation/form-validation.component';

@Component({
  selector: 'app-profile-settings',
  templateUrl: './profile-settings.component.html',
  styleUrls: ['./profile-settings.component.scss']
})
export class ProfileSettingsComponent implements OnInit {

  accountTab = true;
  profileTab = false;
  profileForm: FormGroup = {} as any;
  FormChanged: Boolean = false
  data: any;
  profileGuid: any;
  countrycode: any;
  ProfileSubmitted: boolean;
  EmployeeProfile: any;
  getJason: boolean;
  isdisable: boolean;
  Email: string | null;
  onProfileSubmitForm: boolean= true;
  resetDisable: boolean;
  showSuccessMessage: boolean = false;
  Phonenumber: any;



  constructor(
    private fb: FormBuilder,
    private authService: AuthenticationService,
    private globalService: GlobalService,
    private notificationService: NotificationService,
    private router: Router,
    private userManagementService: UserManagementService,
  ) {
    this.profileGuid = localStorage.getItem('UserGuid')
    this.Email = localStorage.getItem('Email')
    this.Phonenumber=localStorage.getItem('mobileNo')
  }

  ngOnInit(): void {
    // this.userManagementService.name.subscribe(data => {
    //   this.Phonenumber = data
    //  });
    this.initform();
    // this.getJson();
    this.UpdateEmployeeProfile();
    this.profileForm.valueChanges
      .pipe().subscribe(values => {
        this.onProfileSubmitForm = false;
      });
    this.profileForm.patchValue({
      emailId: this.Email
    })
    console.log( this.authService.LoggedInUser)
    this.onProfileSubmitForm = true;
  }
  // getJson(): void {
  //   this.authService.GetJson().subscribe(
  //     (data => {
  //       if (data != undefined && data != null) {
  //         this.countrycode = data;
  //       }
  //     })
  //   )
  // }

  initform() {
    this.profileForm = this.fb.group({
      userGuid: [this.profileGuid],
      emailId: ['', Validators.compose([Validators.required, Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z.]+.com+$')])],
      fullName: ['', [Validators.required, UsernameValidator.cannotContainSpace]],
      countrycode: ['+91', [Validators.required]],
      mobileNumber: ['', Validators.pattern('[- +()0-9]+')],
    });
  }
  Oncountrychange($event: any) {
    this.profileForm.patchValue({
      mobileNumber: ""
    })
    this.isdisable = false;
  }
  get f() {
    return this.profileForm.controls;
  }
  get email() {
    return this.f?.emailId.value || '';
  }

  UpdateEmployeeProfile(): void {
   this.profileForm.patchValue({
      userGuid: this.profileGuid,
      emailId: this.EmployeeProfile ? this.EmployeeProfile.emailId : this.authService.LoggedInUser.Email || '',
      fullName: this.EmployeeProfile ? this.EmployeeProfile.fullName : this.authService.LoggedInUser.FirstName || '',
      countrycode: this.EmployeeProfile ? this.EmployeeProfile.countrycode : this.authService.LoggedInUser.CountryCode || '+91',
      mobileNumber: this.EmployeeProfile ? this.EmployeeProfile.mobileNumber : this.authService.LoggedInUser.PhoneNumber||'',
     }, { emitEvent: true })
    this.FormChanged = false
    this.onProfileSubmitForm = true;
  }

  formReset() {
    this.globalService.startSpinner();
    this.profileForm.markAsUntouched();
    this.profileForm.patchValue({
      userGuid: '',
      //emailId:'',
      //fullName: '',
      //countrycode: '+91',
      //mobileNumber: '',
  
    })
    let data = this.profileForm.value
    data.userGuid = this.profileGuid;
    this.onProfileSubmitForm=true;
    //this.FormChanged=false;
    this.globalService.stopSpinner();
  }


  formupdate() {
    let data = this.profileForm.value
    data.userGuid = this.profileGuid
    this.authService.UpdateEmployeeProfile(this.profileForm.value).subscribe((data: any) => {
      localStorage.setItem('accountSettingUpdatedmobileNO',this.profileForm.value.mobileNumber||'')
      this.showSuccessMessage = true; 
      this.router.navigateByUrl('/settings/profile-settings');
      setTimeout(() => {
      this.router.navigateByUrl('/dashboard');
    }, 3000);
    })
    this.FormChanged = false;
    this.onProfileSubmitForm=true;
  }

  navigateSettings(tab: any) {
    this.accountTab = false;
    this.profileTab = false;

    if (tab == 'account') {
      this.accountTab = true;
    }
    else if (tab == 'profile') {
      this.profileTab = true;
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

  phoneNoValidator(data: any) {
    if (String(data.target.value).length == 10 && this.profileForm.value.countrycode) {
    }
    return data.target.value = data.target.value.replace(/[^0-9.]/g, '');
      }
  changeSearch(event: any) {
    // this.modelChanged.next(event.target.value);
    if (event.target.value) {
      this.resetDisable = false;
    }
  }
 

}
