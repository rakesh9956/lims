import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { IConfirmPassword, ILogin } from 'src/app/core/interface/auth';
import { AuthenticationService } from 'src/app/core/Services/authentication.service';
import { GlobalService } from 'src/app/core/Services/global.service';
import { NotificationService } from 'src/app/core/Services/notification.service';

@Component({
  selector: 'app-account-settings',
  templateUrl: './account-settings.component.html',
  styleUrls: ['./account-settings.component.scss']
})
export class AccountSettingsComponent implements OnInit {
  confirmForm: FormGroup = {} as any;
  isCpVisible: boolean =false;
  isNpVisible: boolean =false;
  PasswordCheck: boolean;
  errorMessage: string;
  UserGuid :any;
  Username: string;
  currentPassword: any;
  currentpass: boolean;
  onnetworkSubmit: boolean;
  Email: string | null;
  DuplicateCheck: boolean;
  isdisable: boolean;
  EmailResponse: any='';
  isResetClicked:boolean=false;
  currentPasswordIncorrect: boolean = false;
  isPasswordInvalid: boolean = false;

  constructor(
    private globalService: GlobalService,
    private fb: FormBuilder,
    private notificationService: NotificationService,
    private authservice :AuthenticationService,
    private router: Router
  ) {
    // this.profileGuid=localStorage.getItem('UserGuid')
    this.Email= localStorage.getItem('Email')
  }

  ngOnInit(): void {
    this.UserGuid=localStorage.getItem('UserGuid')
    this.initForm();
    this.confirmForm.valueChanges
      .pipe().subscribe(values => {
        // if (values.password != "" || values.confirmPassword != "") {
        this.onnetworkSubmit = true;
        // } else {
        //   this.onnetworkSubmit = false;
        // }
      });

  }
  initForm(): void {
    this.confirmForm = this.fb.group({
      password: ['', Validators.compose([
        Validators.required,
        this.patternValidator(/[?=.*?[0-9]/, { hasNumber: true }),
        this.patternValidator(/[A-Z]/, { hasCapitalCase: true }),
        this.patternValidator(/[a-z]/, { hasSmallCase: true }),
        this.patternValidator(/[!@#$%^&*)(]/, { hasSpecialCharacter: true }),
        Validators.minLength(8)
      ])],
      confirmPassword: ['', [Validators.required]],
      currentPassword: ['', [Validators.required]]
    },
      { validators: [this.checkPasswords('password', 'confirmPassword')] })
  }
  reset() {
    this.confirmForm.markAsUntouched();
    this.confirmForm.patchValue({
      //EmailResponse: '',
      currentPassword:'',
      password: '',
      confirmPassword: ''
    })
    // this.isResetClicked = true;
    this.PasswordCheck=false,
      this.EmailResponse= ''
      this.isNpVisible=false
      this.isCpVisible=false
  }

  errorevent(event:any) {
    this.DuplicateCheck = false;
  }
  get f() {
    return this.confirmForm.controls;
  }
  get getCurrentPassword() {
    return this.f?.currentPassword.value;
  }
  get getPassword() {
    return this.f?.password.value;
  }
  get getConfirmPassword() {
    return this.f?.confirmPassword.value;
  }
  get cpasswordvalid() {
    return this.confirmForm.get('currentPassword');
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

  login(): void {
    this.globalService.startSpinner();
    this.authservice.login({
      userName: (this.Username || "").trim(),
      password: this.currentPassword,
      authType: "password"
    } as ILogin).subscribe((res: any) => {
      this.currentpass = false;
      this.globalService.stopSpinner();
    }, (err: HttpErrorResponse) => {
      this.globalService.stopSpinner();
      this.currentpass = true;
      this.updatePassword();
      if (err.error.error_description) {
      }
    });
  }
  updatePassword(): void {
    if (this.confirmForm.valid) {
      //this.PasswordCheck = false;
      const v: any = this.confirmForm.value;
      this.globalService.startSpinner();
      this.authservice.UpdatePassword({
        userId:this.UserGuid,
        password: v.password,
        confirmPassword: v.confirmPassword
      } as IConfirmPassword).subscribe(res => {
        if (res.status.toUpperCase() == "SUCCESS") {
          //this.onnetworkSubmit=false
          this.globalService.stopSpinner();
          this.router.navigate(['/auth/login']);
          this.authservice.flushToken();
          this.globalService.stopSpinner();
          // this.toastr.success("Password changed successfully.", "Account settings", { 
          //   closeButton: true,
          // });
        } else {
          this.globalService.stopSpinner();
        }
      }, (err: HttpErrorResponse) => {
        this.PasswordCheck= true;
        this.errorMessage = err.error.message;
        //this.router.navigate(['/settings/account-settings']);
        this.globalService.stopSpinner();

      });
    }
  }

  /**
  * Type:Getter Form control Method
  * This id getter method for login form controls
  */
  get CPassword() {
    return this.confirmForm.value.currentPassword || "";
  }


  /**
   * Type:Getter Form control Method
   * This id getter method for login form controls
   */


  focusOutFunction() {
    this.currentpass = false;
    //this.DuplicateCheck = true;
    //this.EmailResponse = '';
    if (this.CPassword && this.confirmForm.controls['currentPassword'].valid) {
      //this.globalService.startSpinner();
      this.authservice.login({
        userName: (this.authservice.LoggedInUser.Email || "").trim(),
        password: this.confirmForm.value.currentPassword,
        authType: "password"
      } as ILogin).subscribe(res => {
        this.currentpass = false;
        this.DuplicateCheck = false;
        //  this.onnetworkSubmit=false
        //this.globalService.stopSpinner();
      },
        (err: HttpErrorResponse) => {
          this.DuplicateCheck = true;
          this.globalService.stopSpinner();
          if (this.currentpass == true) {
            this.updatePassword();
          } else {
            this.EmailResponse = err.error.error_description;
          }
          //this.globalService.stopSpinner();
        });
    }
    else {
      this.isdisable = false;
      //this.EmailResponse = "Please enter current password!"
    }
  }
  toggleCpVisibility() {
    this.isCpVisible = !this.isCpVisible;
  }
  toggleNpVisibility() {
    this.isNpVisible = !this.isNpVisible;
  }
 updatepassword(event: any) {
    if(this.errorMessage !=""){
      this.PasswordCheck = false;
    }

  }

}
