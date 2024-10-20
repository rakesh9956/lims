import { Component, ViewChild } from '@angular/core';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { ColumnMode } from '@swimlane/ngx-datatable';
import { UserManagementService } from 'src/app/core/Services/user-management.service';
import { ActivatedRoute, Router } from '@angular/router';
import { GlobalService } from 'src/app/core/Services/global.service';
import { Subject, debounceTime } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthenticationService } from 'src/app/core/Services/authentication.service';
import { Workbook } from 'exceljs';
import { saveAs } from 'file-saver';
import { transform } from 'lodash';
import { DatePipe } from '@angular/common';
@Component({
  selector: 'app-all-users',
  templateUrl: './all-users.component.html',
  styleUrls: ['./all-users.component.scss']
})
export class AllUsersComponent {

  @ViewChild(DatatableComponent) table: DatatableComponent;
  shimmerVisible: boolean;
  ClientType : any = null;
  rows:any[] = [];
  temp:any[] = [];
  loadingIndicator = true;
  reorderable = true;
  usersList:any=[];
  keyword: any;
  itemOrder: any;
  sort: any;
  pageNumber= 1;
  pageSize: any= 40;
  rowCount: any= 40;
  orderBy:any ='';
  sortType: any = 'desc';
  Active: any;
  //DeActive: any=0;
  Center: any = '';
  EmployeeGuid: any;
  getEmployeedata: any;
  UserGuid: any;
  modelChanged = new Subject<string>();
  keyWords: string = "";
  isMenuCollapsed: boolean = true;
  itemsPerPage = 40;
  itemOptionsPerPage = [40, 80, 120, 160, 200];
  ColumnMode = ColumnMode;
  totalCount: any;
  UserName: any;
  userEmail: any;
  disabled: boolean;
  FormChanged: boolean;
  inActive: boolean;
  lstCenter: any;
  boundaryLinks: boolean = true;
  maxSize: number = 3;
  size: string = 'lg'; 
  CompanyName: string[];
  centers=["All", "Active", "Inactive"];
  CompanyStatus: string[];
  Isprint:boolean=false;
  defaultNavActiveId = 1;
  filteredClients:any=[]


  constructor(private userManagementService: UserManagementService,
    private router: Router,
    private route: ActivatedRoute,
    public globalService: GlobalService,
    private datepipe: DatePipe,
    private authservice: AuthenticationService,) {
    this.fetch((data: any) => {
      this.temp = data;
      this.rows = data;
      setTimeout(() => {
        this.loadingIndicator = false;
      }, 1500);
    });
    this.modelChanged
      .pipe(debounceTime(1000))
      .subscribe(model => {
        this.keyword = model
        this.GetAllUsers(this.ClientType)
      });
  }

  ngOnInit(): void {
    if(window.innerWidth < 480){
      this.maxSize = 2;
      this.boundaryLinks = false;
      this.size = 'sm';
    }
    this.EmployeeGuid = this.route.snapshot.paramMap.get('employeeGuid') || '';
    this.UserGuid = this.route.snapshot.paramMap.get('userGuid') || '';
    this.getUserSDefaults()
    this.GetAllUsers()
    this.userEmail = this.authservice.LoggedInUser.Email;
  }

  fetch(cb: any) {
    const req = new XMLHttpRequest();
    req.open('GET', `assets/data/all-users.json`);

    req.onload = () => {
      cb(JSON.parse(req.response));
    };

    req.send();
  }

  updateFilter(event: any) {
    const val = event.target.value.toLowerCase();
    // filter our data
    const temp = this.temp.filter(function (d) {
      return d.name.toLowerCase().indexOf(val) !== -1 || !val;
    });
    // update the rows
    this.rows = temp;
    // Whenever the filter changes, always go back to the first page
    this.table.offset = 0;

  }

  changeSearch(Keyword: any) {
    this.pageNumber = 1;
    this.pageSize = 40;
    this.modelChanged.next(Keyword.target.value);
  }

  ChangeEvent(rowNo: any) {
    this.pageNumber=1;
    this.itemsPerPage = rowNo.target.value;
    this.rowCount = rowNo.target.value;
    this.pageSize = rowNo.target.value;
    this.GetAllUsers(this.ClientType);
  }

  getUserSDefaults() {
    this.userManagementService.getUserDefaults().subscribe((data) => {
      this.lstCenter = data.CentresType;
    })
  }

  GetAllUsers(type : any = null) {
    if(this.ClientType != type){
      this.pageNumber = 1;
    }
    this.ClientType=type;
    // this.globalService.startSpinner();
    this.shimmerVisible=true;
    if (this.Active == undefined) { this.Active = '' }
    this.usersList = [];
    if(this.Isprint==true){
      this.pageNumber=-1;
    }
    this.keyword = (this.keyword == undefined || this.keyword == null) ? this.keyword || "" : this.keyword;
    this.userManagementService.getAllUsers(this.pageNumber, this.rowCount, this.keyword, this.orderBy, this.sortType, this.Active, this.Center, type).subscribe(data => {
      this.usersList = data.lstGetUsers;
      this.filteredClients = data.lstGetUsers;
      if(this.Isprint==true){
        this.downloadExcel();
      }
      // this.globalService.stopSpinner();
      this.shimmerVisible=false;
      this.totalCount = data.TotalCount;
    }, (err: HttpErrorResponse) => {
      // this.globalService.stopSpinner();
      this.shimmerVisible=false;
    })
  }

  // clickDeactivate(EmployeeGuid: any, UserGuid: any) {
  //   let body = {
  //     EmployeeGuid: EmployeeGuid,
  //     UserGuid: UserGuid
  //   }
  //   this.userManagementService.deactivateUser(body).subscribe((data) => {
  //   })
  //   this.GetAllUsers()
  // }

  statuschange($event: any) {
    // console.log($event.target.value)
    if ($event === "Active") {
      this.Active = true;
      this.pageNumber= 1;
      this.GetAllUsers(this.ClientType)
    }
    else if ($event === "Inactive") {
      this.Active = false;
      this.inActive = true;
      this.pageNumber= 1;
      this.GetAllUsers(this.ClientType)
    }
    else {
      this.Active = ''
      this.pageNumber= 1;
      this.GetAllUsers(this.ClientType)
    }
  }
  
  ChangeEventForCenter(event: any) {
   this.pageNumber=1;
    if(event!=null){
      this.Center=event
      this.GetAllUsers(this.ClientType);
    }
    else{
      this.Center=[],
      this.GetAllUsers(this.ClientType);
    }
    

  }

  GetAllData(event: any) {
    this.pageNumber = event;
    this.GetAllUsers(this.ClientType);
  }
  OnSelectUser(cen:any){
    if(cen.Roles?.toLowerCase()=='b2b client'){
      this.router.navigate(['/user-management/b2b-user',cen.EmployeeGuid]);
    }
    else{
      this.router.navigate(['user-management/new-user',cen.EmployeeGuid])
    }
    localStorage.setItem('SelectedUserGuid',JSON.stringify(cen))
  }


  AddItem() {
    localStorage.setItem('EmployeeUnqId', this.usersList[0]?.EmployeeUnqId)

    
  }

  downloadExcel() {
    const header = [ 'EmployeeName','Employee code','UserName','StoreLocation','Mobile','Roles','Designation','Pincode','Email','Center','EmployeeUnqId','Headquarters','CreatedDate','Status'];
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('Sharing Data');
    const headerRow = worksheet.addRow(header);
    headerRow.eachCell((cell, number) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFFF00' },
        bgColor: { argb: 'FF0000FF' }
      };
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    });
    worksheet.getColumn(1).width = 30;
    worksheet.getColumn(2).width = 20;
    worksheet.getColumn(3).width = 30;
    worksheet.getColumn(4).width = 30;
    worksheet.getColumn(5).width = 15;
    worksheet.getColumn(6).width = 30;
    worksheet.getColumn(7).width = 20;
    worksheet.getColumn(8).width = 20;
    worksheet.getColumn(9).width = 20;
    worksheet.getColumn(10).width = 30;
    worksheet.getColumn(11).width = 20;
    worksheet.getColumn(12).width = 30;
    worksheet.getColumn(12).width = 20;
    worksheet.getColumn(12).width = 15;
   // worksheet.addRow([]);
    this.usersList.forEach((item: any) => {
      const row = worksheet.addRow([
        item.EmployeeName,
        item.EmployeeId,
        item.UserName,
        item.StoreLocation,
        item.Mobile,
        item.Roles,
        item.Designation,
        item.Pincode,
        item.Email,
        item.Center,
        item.EmployeeUnqId,
        item.Headquarters,
        this.datepipe.transform(item.CreatedDate,'dd-MM-yyyy'),
        item.IsDeleted==false?'Active':'In Active'
      ]);
    });
    const fileName = 'UserList-print.xlsx';
    workbook.xlsx.writeBuffer().then((data: any) => {
      const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, fileName);
      this.Isprint=false;
      this.pageNumber=1;
     this.GetAllUsers(this.ClientType);
    });
  }
  GetAllUsersExcel(){
    this.Isprint=true
    this.pageNumber=-1;
    this.GetAllUsers(this.ClientType);
  }
}
