import { Component, OnInit, TemplateRef } from '@angular/core';
import { Router } from '@angular/router';
import { ColumnMode } from '@swimlane/ngx-datatable';
import { debounceTime, Subject } from 'rxjs';
import { Person, PeoplesData } from 'src/app/core/dummy-datas/peoples.data';
import { StoreLocationsService } from 'src/app/core/Services/store-locations.service';
import { GlobalService } from 'src/app/core/Services/global.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-centers',
  templateUrl: './centers.component.html',
  styleUrls: ['./centers.component.scss']
})
export class CentersComponent {
  shimmerVisible:boolean;
  maxSize: number = 3;
  boundaryLinks: boolean = true;
  size: string = 'lg';
  rows = [];
  loadingIndicator = true;
  reorderable = true;
  ColumnMode = ColumnMode;
  selectedSuppName: string;
  people: Person[] = [];
  pageNumber = 1;
  rowCount: any = 40;
  allCentres: any = [];
  itemsPerPage = 40;
  pageSize: any = 40;
  totalCount: any = '';
  itemOptionsPerPage = [40, 80, 120, 160, 200, 240, 280, 320];
  companies: any[] = [];
  keyword: any = '';
  Keyword: any = null;
  modelChanged = new Subject<string>();
  CompanyName: string[];
  isMenuCollapsed: boolean = true;
  centeerName: any;
  centerGuid: any;
  noCentersFound: boolean;
  CenterPannelGuid: any = '';
  AllStores: any=[];
  storeGuid: any;
  LocationGuid: any;
  filterAllStores: any=[];
  constructor(
    private centreService: StoreLocationsService,
    private router: Router,
    private glocalService: GlobalService,
    private modalService: NgbModal,
    private storeService: StoreLocationsService,
  ) {
    this.fetch((data: any) => {
      // this.rows = companies
      // this.rows = data.filter((row: { CompanyName: string; }) => row.CompanyName.toLowerCase());
      setTimeout(() => {
        this.loadingIndicator = false;
      }, 1500);
    });
    this.modelChanged.pipe(debounceTime(1000)).subscribe(model => {
      this.Keyword = model;
      this.getAllCentreDetails();
    });
  }

  ngOnInit(): void {
    if (window.innerWidth < 480) {
      this.maxSize = 2;
      this.boundaryLinks = false;
      this.size = 'sm';
    }
    this.getAllCentreDetails();
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

  getAllCentreDetails() {
    // this.glocalService.startSpinner();
    this.shimmerVisible=true;
    this.keyword = (this.Keyword == undefined || this.Keyword == null) ? this.Keyword || "" : this.Keyword;
    let cen = {
      PageNumber: this.pageNumber,
      RowCount: this.rowCount,
      Keyword: this.keyword,
      OrderBy: '',
      SortType: 'desc'
    }
    this.centreService.GetAllCentres(cen).subscribe(data => {
      // this.glocalService.stopSpinner();
      this.shimmerVisible=true;
      this.allCentres = data || [];      
      // this.searchCentres = data.CompanyName
      // this.companies = this.allCentres.filter((C: { CompanyName: any; }) => C.CompanyName);
      this.companies = data.filter((C: { CompanyName: any; PanelGuid: any }) => C.CompanyName).map((C: { CompanyName: any; PanelGuid: any }) => { return { CompanyName: C.CompanyName, PanelGuid: C.PanelGuid } });
      // console.log(this.companies)
      // this.companies = this.allCentres.filter(function (row: any) {
      //   return {
      //     CompanyName: row.CompanyName, CompanyGuid: row.PanelGuid
      //   }     
      // })
      this.shimmerVisible=false;
      if (this.allCentres.length == 0) {
        this.noCentersFound = true;
      } else {
        this.noCentersFound = false;
      }
      this.totalCount = this.allCentres[0]?.TotalCount;
    })
  }
  upDateCentre(Centre: any) {
    // localStorage.setItem('centre',JSON.stringify(Centre.PanelGuid))
    localStorage.setItem('Centre', Centre)
    this.router.navigateByUrl("stores/new-center");
  }
  addCentre(AddCentre: any) {
    this.router.navigate(["stores/new-center", { AddCentre }])
  }
  ChangeEvent(rowNo: any) {
    this.itemsPerPage = rowNo.target.value;
    this.rowCount = rowNo.target.value;
    this.pageSize = rowNo.target.value;
    this.pageNumber = 1
    this.getAllCentreDetails();
  }
  updateFilter(event: any) {
    this.modelChanged.next(event.target.value)
  }

  GetAllData(event: any) {
    this.pageNumber = event;
    this.getAllCentreDetails();
  }
  openBasicModal(content: TemplateRef<any>) {
    this.modalService.open(content, { size: 'md' }).result.then((result: string) => {
      console.log("Modal closed" + result);
    }).catch((res: any) => { });
  }

  deleteCenter(event: any) {
    this.centeerName = event.CompanyName;
    this.centerGuid = event.PanelGuid;
  }
  DeleteCenter() {
    let delCen = {
      CenterPanelGuid: this.centerGuid
    }
    this.centreService.deleteCenter(delCen).subscribe((data) => {
      this.getAllCentreDetails();
    }, err => {

    })
  }
  /**
   * this event used to select the center
   * @param event 
   */
  Center(event: any) {
    this.centeerName = event.CompanyName;
    this.centerGuid = event.PanelGuid;
    this.LocationGuid=event.LocationGuid;
    this.GetLocationByGuid();
  }
  /**
     * this method used to get the all centers
     */
  GetLocationByGuid() {
    // this.glocalService.startSpinner();
    this.shimmerVisible=true;
    this.storeService.GetLocationByGuid().subscribe(data => {
      this.AllStores = data || [];
      this.filterAllStores = this.AllStores.filter((store: { Guid: any }) => this.LocationGuid !== store.Guid);
      // this.glocalService.stopSpinner();
      this.shimmerVisible=false;
    },
      err => {
        // this.glocalService.stopSpinner();
        this.shimmerVisible=false;
      })
  }
  /**
   * this event used to change the center
   * @param event 
   */
  SelectCenter(event: any) {
    if (!event) {
      this.storeGuid = ''
    }
    else {
      this.storeGuid = event.Guid
    }
  }
  /**
   * this method to save the location to center
   */
  UpdateCenterLocation() {
    // this.glocalService.startSpinner();
    this.shimmerVisible=true;
    let input = {
      CenterPanelGuid: this.centerGuid,
      LocationGuid: this.storeGuid,
    }
    this.storeService.UpdateCenterLocation(input).subscribe(data => {
      // this.glocalService.stopSpinner();
      this.shimmerVisible=false;
      this.getAllCentreDetails();
    },
      err => {
        // this.glocalService.stopSpinner();
        this.shimmerVisible=false;
      })
  }
}
