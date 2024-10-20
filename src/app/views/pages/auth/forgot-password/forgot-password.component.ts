import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthenticationService } from 'src/app/core/Services/authentication.service';
import { GlobalService } from 'src/app/core/Services/global.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {

  returnUrl: any;
  forgotPasswordForm: FormGroup = {} as any;
  isSubmitted:boolean=false;
  emailSent = false;
  UserGuid: any;
  isEmailRegistered = false;
  constructor(private router: Router,
    private route: ActivatedRoute,
    private globalService: GlobalService,
    private fb: FormBuilder,
    private authService: AuthenticationService,) { }

  ngOnInit(): void {
    // get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    this.initForm();
  }

  onLoggedin(e: Event) {
    e.preventDefault();
    localStorage.setItem('isLoggedin', 'true');
    if (localStorage.getItem('isLoggedin')) {
      this.router.navigate([this.returnUrl]);
    }
  }

  get email() {
    return this.e?.email.value || '';
  }
  get e() {
    return this.forgotPasswordForm.controls;
  }
  initForm(): void {
    // this.globalService.startSpinner();
    this.forgotPasswordForm = this.fb.group({
      // email: ['', [Validators.required,Validators.email]]
      //email: ['',[Validators.required, Validators.compose([Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z.]+.com+$')])]],
      email: ['',[Validators.required, Validators.compose([Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$')])]],

    });
    // this.globalService.stopSpinner();
  }

  checkUser(): void {
    this.isSubmitted = false;
    if (this.forgotPasswordForm.valid) {
      const v: any = this.forgotPasswordForm.value;
       this.globalService.startSpinner();
      this.authService.CheckUserName(
        (v.email || "").trim()
      ).subscribe(res => {
         this.globalService.stopSpinner();
        if (res.length > 0) {
          let uGuid = res[0].UserGuid;
          localStorage.setItem('UserGuid',uGuid)
         // this.router.navigate(['auth', 'reset-password', uGuid])
          this.emailSent = true;
          //this.notifyService.showSuccess("An email has been sent to the given email address.", "Email sent");
        }
        else {
          this.isSubmitted = true;
          //this.notifyService.showError("Please enter valid email!", 'Forgot password');
        }
  
      }, (err: HttpErrorResponse) => {
        this.isSubmitted = true;
       this.globalService.stopSpinner();
      });
    }
    else {
      this.isSubmitted = false;
      // this.notifyService.showError("Please enter valid email!", 'Forgot password');
    }

}
checkEmailRegistration(email: string): void {
  this.authService.CheckUserName(email).subscribe(
    (res) => {
      this.isEmailRegistered = res.length > 0;
      if (this.isEmailRegistered) {
        this.UserGuid = res[0].UserGuid;
        localStorage.setItem('UserGuid', this.UserGuid);
      }
    },
    (err: HttpErrorResponse) => {
      // Handle error if needed
    }
  );
}
clickmail(){
  this.emailSent = false;
}
}