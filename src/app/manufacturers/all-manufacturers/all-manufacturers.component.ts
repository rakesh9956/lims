import { HttpErrorResponse } from '@angular/common/http';
import { Component, TemplateRef, ViewChild } from '@angular/core';
import { ColumnMode, DatatableComponent } from '@swimlane/ngx-datatable';
import { Subject, debounceTime } from 'rxjs';
import { ManufactureService } from 'src/app/core/Services/manufacture.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthenticationService } from 'src/app/core/Services/authentication.service';

@Component({
  selector: 'app-all-manufacturers',
  templateUrl: './all-manufacturers.component.html',
  styleUrls: ['./all-manufacturers.component.scss']
})
export class AllManufacturersComponent {
  @ViewChild(DatatableComponent) table: DatatableComponent;
  IsShow: boolean = false;
  /*** Paginatin Option Starts ***/
  maxSize: number = 3;
  boundaryLinks: boolean = true;
  size: string = 'lg';
/**
* Type:Properties 
* Declare all the intermediate properies 
*/
  shimmerVisible:boolean;
  rows = [];
  loadingIndicator = true;
  ColumnMode = ColumnMode;
  keyword: string = ' ';
  itemOrder: any = ' '
  sort: string = 'desc';
  pageNumber = 1;
  rowCount = 40;
  manufacturelist: any=[];
  ManufacturGuid: any;
  filteredData: any[] = [];
  TotalCount: any;
  modelChanged = new Subject<string>();
  ManufactureName: any;
  pageSize: number = 40;
  itemsPerPage: any= 40;
  itemOptionsPerPage = [40, 80, 120, 160, 200, 240, 280, 320];
  Roles: any;
  constructor(
    private manufactureService: ManufactureService,
    private modalService: NgbModal,
    private authservice:AuthenticationService
  ) {
    this.modelChanged.pipe(debounceTime(1000)).subscribe(model => {
      this.keyword = model;
      this.GetManufacture();
    });
    this.fetch((data: any) => {
      this.rows = data;
      setTimeout(() => {
        this.loadingIndicator = false;
      }, 1500);
    });
  }

  ngOnInit(): void {
    this.GetManufacture()
    if (window.outerWidth < 480) {
      this.maxSize = 2;
      this.boundaryLinks = false;
      this.size = 'sm';
    }
    this.Roles =this.authservice.LoggedInUser.MANUFACTUREROLES
  }

  fetch(cb: any) {
    const req = new XMLHttpRequest();
    req.open('GET', `assets/data/manufacturers.json`);

    req.onload = () => {
      cb(JSON.parse(req.response));
    };
    req.send();
  }
/**Get Manufacture Details */
  GetManufacture(){
    this.shimmerVisible=true;
    this.keyword = (this.keyword == undefined || this.keyword == null) ? this.keyword || "" : this.keyword;
     this.manufactureService.getManufacture(this.keyword, this.itemOrder, this.sort, this.pageNumber, this.rowCount,'').subscribe((data) => {
      this.manufacturelist =data;
      if(this.manufacturelist.length > 0){
        this.TotalCount=this.manufacturelist[0].TotalCount;
        this.IsShow=false
      }else{
        this.IsShow=true
      }
      this.filteredData =data;
      this.shimmerVisible=false;
   },
    error => {
      this.shimmerVisible=false;
    });
  }
  ChangeEvent(rowNo: any) {
    this.itemsPerPage = rowNo.target.value;
    this.pageNumber = 1
    this.rowCount = rowNo.target.value;
    this.GetManufacture();
  }
  changeSearch(Keyword: any) {
    this.pageNumber = 1;
    this.rowCount = 40;
    this.modelChanged.next(Keyword.target.value);
  }
  DeleteManufacture() {
    this.shimmerVisible=true;
    this.manufactureService.DeleteManufacture( this.ManufacturGuid).subscribe((data: any) => {
      this.GetManufacture();
      this.shimmerVisible=false;
    },
      (err: HttpErrorResponse) => {
        this.shimmerVisible=false;
      })
  }
  openBasicModal(content: TemplateRef<any>) {
    this.modalService.open(content, { size: 'md' }).result.then((result: string) => {
      console.log("Modal closed" + result);
    }).catch((res: any) => { });
  }
  ManufactureDetails(row: any) {
  this.ManufactureName = row.ManufactureName
    this.ManufacturGuid = row.ManufacturGuid
  }
  ChangePagenumber(event: any) {
    this.pageNumber = event;
    this.GetManufacture();
  }
}