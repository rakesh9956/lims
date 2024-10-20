import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, NgForm, ValidationErrors, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthenticationService } from 'src/app/core/Services/authentication.service';
import { GlobalService } from 'src/app/core/Services/global.service';
import { IConfirmPassword } from 'src/app/core/interface/auth';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
  @ViewChild('resetForm') resetForm: NgForm;
  buttonDisabled = false;
  buttonState = '';


  returnUrl: any;
  confirmForm: FormGroup = {} as any;
  submitted = false;
  UserGuid:any;
  messageText:any;
  //isVisible:boolean=false;
  PasswordCheck: boolean;
  errorMessage: string;
  isPasswordInvalid: boolean = false;
  isNpVisible: boolean =false;

  constructor(private router: Router, private route: ActivatedRoute,
    private authService: AuthenticationService,
  private fb:FormBuilder,
  private globalService:GlobalService
  ) { }

  onSubmit(): void {
    if (this.resetForm.valid && !this.buttonDisabled) {
      this.buttonDisabled = true;
      this.buttonState = 'show-spinner';
      
    }
  }

  ngOnInit(): void {  
    this.UserGuid=this.route.snapshot.params['UserGuid']
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    this.initForm();
  }

  initForm(): void {
    this.confirmForm = this.fb.group({
      password: ['',Validators.compose([
        Validators.required, 
        Validators.required,
        this.patternValidator(/[a-z]/, { hasSmallCase: true }),
        this.patternValidator(/[A-Z]/, { hasCapitalCase: true }),
        this.patternValidator(/[?=.*?[0-9]/, { hasNumber: true }),        
        this.patternValidator(/[!@#$%^&*)(]/, { hasSpecialCharacter: true }),
        Validators.minLength(8)
      ])],
      confirmPassword: ['', [Validators.required]]
    },    
    {validators:[this.checkPasswords('password','confirmPassword')]})
  }

  get f() {
    return this.confirmForm.controls;
  }
  get getConfirmPassword() {
    return this.f?.confirmPassword.value;
  }
  get getPassword() {
    return this.f?.password.value;
  }

  

  checkPasswords(passwordKey: string, passwordConfirmationKey: string) {
    return (group: FormGroup) => {
      let passwordInput = group.controls[passwordKey],
          passwordConfirmationInput = group.controls[passwordConfirmationKey];
      if (passwordInput.value !== passwordConfirmationInput.value) {
        return passwordConfirmationInput.setErrors({notEquivalent: true})
      }
      else {
          return passwordConfirmationInput.setErrors(null);
      }
    }
  }

  toggleNpVisibility() {
    this.isNpVisible = !this.isNpVisible;
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

    onLoggedin(e: Event) {
      e.preventDefault();
      localStorage.setItem('isLoggedin', 'true');
      if (localStorage.getItem('isLoggedin')) {
        this.router.navigate([this.returnUrl]);
      }
    }

    updatePassword(): void {
      this.submitted = true;
      if (this.confirmForm.valid) {
        this.submitted = true;
        this.messageText = "";
        const v: any = this.confirmForm.value;
        this.globalService.startSpinner();
        this.authService.UpdatePassword({
          userId: this.UserGuid,
          password: v.password,
          confirmPassword: v.confirmPassword
        } as IConfirmPassword).subscribe(res => {
          if(res.status.toUpperCase() == "SUCCESS"){
            this.globalService.stopSpinner();
            // this.toastr.success("Password changed successfully.","Reset password", {
            //   closeButton: true,
            // });
            this.messageText = res.message;
            this.router.navigate(['auth','login']);
            
          }else{
            this.submitted = false;
            this.globalService.stopSpinner();
            this.messageText = res.message;
            //this.notifyService.showError("Please enter valid email!", 'Forgot password');
          }
          
        }, (err: HttpErrorResponse) => {
          if(err.error.message.toLowerCase()=='last 5 passwords are not accepted. please create a new, unique password for security.'){
            this.PasswordCheck= true;
            this.errorMessage = err.error.message;
          }
          this.submitted = false;
          this.globalService.stopSpinner();
        });
      }
      else {
        this.submitted = true;
        // this.notifyService.showError("Please enter valid confirm password!", 'Reset password');
      }
    }

}
