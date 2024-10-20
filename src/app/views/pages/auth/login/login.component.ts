import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators,ReactiveFormsModule } from '@angular/forms';
import { GlobalService } from 'src/app/core/Services/global.service';
import { HttpErrorResponse } from '@angular/common/http';
import { NotificationService } from 'src/app/core/Services/notification.service';
import { AuthenticationService } from 'src/app/core/Services/authentication.service';
import { ILogin } from 'src/app/core/interface/auth';
import { distinctUntilChanged, throttleTime } from 'rxjs';
import { UserManagementService } from 'src/app/core/Services/user-management.service';
import { UserPermissionLocationsService } from 'src/app/core/Services/user-permission-locations.service';



@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  returnUrl: any;
  loginForm: FormGroup = {} as any;
  isSubmited = false;
  IsShown = false;
  submitted = false;
  ValidUser: boolean = false;
  isVisible: boolean = false;
  password:any;
  passworderror:any;
  LoginErrorMsg:any;
  PermissionLocations:any
  constructor(private router: Router, private route: ActivatedRoute,
    private globalService: GlobalService,
    private fb: FormBuilder,
    private authenticationService: AuthenticationService,
    private notifyService: NotificationService,
    private userManagmentService: UserManagementService,
    private UserPermissionService: UserPermissionLocationsService,
    ) { }

  ngOnInit(): void {
    // get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    this.initForm()
    this.loginForm.valueChanges.pipe(distinctUntilChanged(), throttleTime(500)).subscribe(values => {

       this.IsShown = false;
      
      }
      
    );
  }

  initForm(): void {
    this.loginForm = this.fb.group({
      userName: ['', [Validators.required]],
      password: ['', [Validators.required]] 
    });
  }
    

 // onLoggedin(e: Event) {
  //  e.preventDefault();  
 // }

  get f() {
    return this.loginForm.controls;
  }
  get passWord ()
  {
      return this.f?.password.value || '';
  }
   /**
   * Type :Click Event Function
   * This method is used for click of login button 
   */
   onLoggedin(): void {
    this.globalService.startSpinner();
    this.submitted = true;
    this.IsShown = false;
   // if (this.loginForm.valid) {
      const v: any = this.loginForm.value;
      this.submitted = true;
      this.ValidUser = true;
      this.authenticationService.login({
        userName: (this.loginForm.value.userName|| "").trim(),
        password: this.loginForm.value.password,
        authType: "password"
        }as ILogin).subscribe(res => {
          if(localStorage.getItem('EmailVerified')=='true'){
          localStorage.setItem('isLoggedin', 'true');  
          if (localStorage.getItem('isLoggedin')) {
            this.GetUserPermissionLocations()
            this.router.navigate([this.authenticationService.LoggedInUser.DEFAULTROLES?.toLocaleLowerCase()=='b2b client'?'/requests':this.returnUrl]);
          }
        }else{
        let UserGuid=localStorage.getItem('ResendGuid')
          // this.router.navigateByUrl('/auth/not-verified');
          this.router.navigate(['/auth/user-not-verified',UserGuid])
        }
        this.globalService.stopSpinner();
        
        },
       (err: HttpErrorResponse) => {
        this.submitted = false;
        this.ValidUser = false;
        this.passworderror=err.error.error_description;
        this.globalService.stopSpinner();
        if (err.error.error_description && this.IsShown == false) {
          this.IsShown = true;
          err.error.error_description = err.error.error_description.replace(/[^a-zA-Z0-9]/g, " ")
          this.LoginErrorMsg=(err.error.error_description.charAt(0).toUpperCase() + err.error.error_description.slice(1) + "!");
        }

      });
    // }
    // else {
    //  this.globalService.stopSpinner();
    // }
  }
 

  togglePasswordVisibility() {
    this.isVisible = !this.isVisible;
  }
  GetUserPermissionLocations() {
    let DepotmentGuid = this.authenticationService.LoggedInUser.DEFAULTROLES.toLowerCase().includes('ADMIN'.toLowerCase()) && this.authenticationService.LoggedInUser.LOCATIONSGUID == '00000000-0000-0000-0000-000000000000' ? '00000000-0000-0000-0000-000000000000' : this.authenticationService.LoggedInUser.LOCATIONSGUID.split(",")
    this.userManagmentService.GetUserPermissionLocations(DepotmentGuid).subscribe(
      (data) => {
        this.PermissionLocations = data;
        this.UserPermissionService.Userdeortments(this.PermissionLocations);
        localStorage.setItem('UserPermissinlocations',JSON.stringify(this.PermissionLocations))  
        localStorage.setItem('UserDeportments',this.authenticationService.LoggedInUser.LOCATIONSGUID)
        localStorage.setItem('DefaultStore',this.authenticationService.LoggedInUser.STORE)
      },
      (err) => {
        this.globalService.stopSpinner();

      });
  }

}
