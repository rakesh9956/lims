import { Component, OnInit, ViewChild, ElementRef, Inject, Renderer2 } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { NavigationExtras, Router } from '@angular/router';
import { AuthenticationService } from 'src/app/core/Services/authentication.service';
import { UserManagementService } from 'src/app/core/Services/user-management.service';
import { UserPermissionLocationsService } from 'src/app/core/Services/user-permission-locations.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {

  UserName: any;
  userEmail: any;
  PermissionLocations: any
  selectedlocation: any;
  B2BType:any
  constructor(
    private authservice: AuthenticationService,
    @Inject(DOCUMENT) private document: Document,
    private renderer: Renderer2,
    private router: Router,
    private authService: AuthenticationService,
    private UserPermissionService: UserPermissionLocationsService,
  ) { }

  ngOnInit(): void {
    this.userEmail = this.authservice.LoggedInUser.Email;
    this.UserName = this.authservice.LoggedInUser.FirstName
    let data = localStorage.getItem('SelectedLocationGuid')
    let data1 = localStorage.getItem('SelectedStore')
    let isstore = this.authservice.LoggedInUser.STORE
    if(isstore=='false'){
      this.selectedlocation=this.authService.LoggedInUser.USERLOCATIONSGUID.toLowerCase()
    }
    if (data) {
      this.selectedlocation = data
      this.UserPermissionService.ChangeLocation(data);
      this.UserPermissionService.editUser(data1);
    }
    this.UserPermissionService.UserPermissionLocations.subscribe(user => {
      if (user == '') {
        let PermissionLocations: any = localStorage.getItem('UserPermissinlocations')
        this.PermissionLocations = JSON.parse(PermissionLocations)
      }
      else {
        this.PermissionLocations = user;
      }
    })
    this.B2BType=this.authService.LoggedInUser.B2BTYPE
  }


  /**
   * Sidebar toggle on hamburger button click
   */
  toggleSidebar(e: Event) {
    e.preventDefault();
    this.document.body.classList.toggle('sidebar-open');
  }

  /**
   * Logout
   */
  onLogout(e: Event) {
    e.preventDefault();
    this.authService.logout();
    localStorage.removeItem('isLoggedin');
    localStorage.removeItem('SelectedLocationGuid')
    localStorage.removeItem('UserDeportments')
    this.UserPermissionService.editUser('');
    if (!localStorage.getItem('isLoggedin')) {
      this.router.navigate(['/auth/login']);
    }
  }
  Changelocation(event: any) {
    if (event != undefined) {
      localStorage.setItem('SelectedLocationGuid', event.LocationGuid)
      localStorage.setItem('SelectedStore', event.Store)
      this.selectedlocation = event.LocationGuid
      console.log(this.selectedlocation)
      this.UserPermissionService.ChangeLocation(event.LocationGuid);
      this.UserPermissionService.editUser(event.Store);

    }
    else {
      let UserPerDepotments: any = localStorage.getItem('UserDeportments')
      localStorage.setItem('SelectedLocationGuid', UserPerDepotments)
      this.selectedlocation = []
      this.UserPermissionService.ChangeLocation('');
      this.UserPermissionService.editUser('');
      localStorage.removeItem('SelectedStore')
      localStorage.removeItem('SelectedLocationGuid')
    }
    if(this.authservice.LoggedInUser.B2BTYPE==false || this.authservice.LoggedInUser.B2BTYPE=='false'){
      if (this.router.url == '/dashboard') {
        this.UserPermissionService.reload();
      }
      else {
        this.router.navigate(['/dashboard'])
      }
    }
    else{
      this.router.navigate(['/requests'])
      this.UserPermissionService.reload();
    }
  }
}
