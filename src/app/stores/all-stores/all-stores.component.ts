import { Component, TemplateRef } from '@angular/core';
import { Router } from '@angular/router';
import { ColumnMode } from '@swimlane/ngx-datatable';
import { debounceTime, Subject } from 'rxjs';
import { Person, PeoplesData } from 'src/app/core/dummy-datas/peoples.data';
import { StoreLocationsService } from 'src/app/core/Services/store-locations.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthenticationService } from 'src/app/core/Services/authentication.service';
@Component({
  selector: 'app-all-stores',
  templateUrl: './all-stores.component.html',
  styleUrls: ['./all-stores.component.scss']
})
export class AllStoresComponent {

   /*** Paginatin Option Starts ***/
   maxSize: number = 3;
   boundaryLinks: boolean = true;
   size: string = 'lg';
   /*** Paginatin Option Starts ***/
  shimmerVisible:boolean;
  rows = [];
  loadingIndicator = true;
  ColumnMode = ColumnMode;
  people: Person[] = [];
  locations: any; 
  itemsPerPage = 40;
  rowCount: any=40;
  pageSize: any=40;
  pageNumber: any=1;
  totalCount: any='';
  itemOptionsPerPage = [40, 80, 120, 160, 200, 240, 280, 320];
  modelChanged = new Subject<string>();
  Keyword: any = '';
  isMenuCollapsed: boolean = true;
  stores= [];
  allCentres: never[];
  storeName: any;
  storeGuid: any;
  Store: any;
  IsShow:boolean=false;
  location: any=[] ;
  isearched: boolean;
  isSleted: boolean;
  keywordName = '';
  constructor(
    private storeService: StoreLocationsService,
    private router: Router,
    private modalService: NgbModal,
    public authservice : AuthenticationService
  ) {
    this.modelChanged.pipe(debounceTime(1000)).subscribe(model => {
      this.Keyword = model;
      this.getCenterLocations();     
    });
  }

  ngOnInit(): void {
    this.Store=this.authservice.LoggedInUser.STORE
    if(window.innerWidth < 480){
      this.maxSize = 2;
      this.boundaryLinks = false;
      this.size = 'sm';
    }
    this.getCentreTypeDefault();
    this.getCenterLocations();
    this.people = PeoplesData.peoples;
  }

  fetch(cb: any) {
    const req = new XMLHttpRequest();
    req.open('GET', `assets/data/stores.json`);

    req.onload = () => {
      cb(JSON.parse(req.response));
    };

    req.send();
  }

  getCenterLocations() {
    this.shimmerVisible=true;
    let IsStore = this.authservice.LoggedInUser.STORE
    let DepotmentGuid =this.authservice.LoggedInUser.DEFAULTROLES.toLowerCase().includes('ADMIN'.toLowerCase()) && this.authservice.LoggedInUser.LOCATIONSGUID=='00000000-0000-0000-0000-000000000000' ?'00000000-0000-0000-0000-000000000000': this.authservice.LoggedInUser.LOCATIONSGUID.split(",")
    if (this.isearched == true) {
      this.Keyword = this.keywordName;
    } else if (this.isSleted == true) {
      this.Keyword = this.location;
    }
    const filteredKeyword = this.location != null && this.Keyword === '' ? this.location : this.Keyword;
    let loc={
      PageNumber: this.pageNumber,
      RowCount: this.rowCount,
      Keyword: filteredKeyword,
      OrderBy: '',
      SortType: 'desc',
      UserLocationGuid:DepotmentGuid,
      IsStore:IsStore
    }
    this.storeService.GetCentreLocation(loc).subscribe(data => {
      this.shimmerVisible=false;
      this.locations = data;
      if(this.locations.length!=0){
        this.IsShow=false;
      }
      else{
        this.IsShow=true;
      }
      this.allCentres = [];
      this.totalCount = this.locations[0]?.TotalCount
    },
    err=> {
      this.shimmerVisible=false;
    })
  }
  /**
   * this service method use to get centers
   */
  getCentreTypeDefault() {
    this.shimmerVisible=true;
    this.storeService.GetCentreTypeDefault().subscribe((data) => {  
      this.shimmerVisible=false;    
    this.stores = data.Result?.LstCentre || []; 
    },err => {
      this.shimmerVisible=false;
    })
  } 
  getGuid(Guid: any) {    
    localStorage.setItem('Guid', JSON.stringify(Guid));    
    this.router.navigate(['/stores/new-store'])
  }

  addStore(AddStore: any) {
    this.router.navigate(['/stores/new-store',{AddStore}])
  }
  
  ChangeEvent(rowNo: any) {
    this.itemsPerPage = rowNo.target.value;
    this.rowCount = rowNo.target.value;
    this.pageSize = rowNo.target.value;
    this.pageNumber = 1
    this.getCenterLocations()
  }
  onSearchCentres(event: any) {
    this.Keyword=""
    this.isSleted = true;
    this.isearched = false;
    this.location = event !== undefined ? event.CompanyName : [];
    this.getCenterLocations();
  }
  onSearchLocation(Keyword: any) {
    this.pageNumber=1;
    this.isearched = true;
    this.isSleted = false;    
    this.modelChanged.next(Keyword);
     }
  GetAllData(event: any) {
    this.pageNumber = event;
    this.getCenterLocations();
  }
  
  openBasicModal(content: TemplateRef<any>) {
    this.modalService.open(content, { size: 'md' }).result.then((result: string) => {
      console.log("Modal closed" + result);
    }).catch((res: any) => { });
  }

  deleteLocation(event: any) {
    this.storeName = event.Location;
    this.storeGuid = event.Guid
  }

  DeleteLocation() { 
    let locDel = {
      CenterLocationGuid: this.storeGuid
    }
    this.shimmerVisible=true;
    this.storeService.deleteStore(locDel).subscribe((data) =>{
      this.getCenterLocations();
      this.shimmerVisible=false;
    },err => {
      this.shimmerVisible=false;
    })
  }
  restrictCharectors(event: any) {
    const allowedRegex = /^[a-zA-Z0-9]*$/;
    const currentValue: string = event.target.value || '';
    const newValue: string = currentValue + event.key;
  
    if (!newValue.match(allowedRegex) || newValue.length > 48) {
      event.preventDefault();
    }
    
  }
}