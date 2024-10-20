import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ColumnMode } from '@swimlane/ngx-datatable';
import { debounceTime, Subject } from 'rxjs';
import { GlobalService } from 'src/app/core/Services/global.service';
import { SupplierService } from 'src/app/core/Services/supplier.service';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { HttpErrorResponse } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { AuthenticationService } from 'src/app/core/Services/authentication.service';
// import SuppliersData from '../../../assets/data/suppliers.json';


@Component({
  selector: 'app-all-suppliers',
  templateUrl: './all-suppliers.component.html',
  styleUrls: ['./all-suppliers.component.scss']
})
export class AllSuppliersComponent implements OnInit {

  @ViewChild(DatatableComponent) table: DatatableComponent;
  shimmerVisible:boolean;
  IsShow: boolean = true;
  /*** Paginatin Option Starts ***/
  maxSize: number = 3;
  boundaryLinks: boolean = true;
  size: string = 'lg';
  /*** Paginatin Option Ends ***/

    /**
* Type:Properties 
* Declare all the intermediate properies 
*/
  rows: any[] = [];
  filteredData: any[] = [];
  loadingIndicator = true;
  reorderable = true;
  ColumnMode = ColumnMode;
  selectedSuppName: string;
  selectedOrgType: string;
  selectedSuppCat: string;
  Keyword: string ;
  Supplierslist: any = [];
  itemOrder :any
  OrderBy: string = '';
  sort: string = '';
  rowCount: number = 40;
  modelChanged = new Subject<string>();
  TotalCount: any;
  pageSize: number = 40;
  itemsPerPage: any= 40;
  itemOptionsPerPage = [40, 80, 120, 160, 200, 240, 280, 320];
  totalCount: any;
  pageNumber: any = 1;
  pageCount: number = -1;
  SupplierGuid: any;
  SupplierName:any;
  isMenuCollapsed = true;
  ISPurchseIndent: any;
  IsPurchseOrder: any;
  Active:any='All';
  Roles: any;
  PendingPoData: any = [];
  constructor(
    public supplierService: SupplierService,
    public globalService: GlobalService,
    private router: Router,
    private modalService: NgbModal,
    private authservice:AuthenticationService
  ) {
    this.fetch((data: any) => {
      this.rows = data;
      setTimeout(() => {
        this.loadingIndicator = false;
      }, 1500);
    });
    this.modelChanged
      .pipe(debounceTime(1000))
      .subscribe(model => {
        this.Keyword = model;
        this.getSuppliers();
      })
  }

  ngOnInit() {
    this.getSuppliers();
    if (window.outerWidth < 480) {
      this.maxSize = 2;
      this.boundaryLinks = false;
      this.size = 'sm';
    }
    this.Roles =this.authservice.LoggedInUser.SUPPLIERROLES
  }
  Popupfordeletesupplier(content: TemplateRef<any>, size:any) {
    this.modalService.open(content, { size: size }).result.then((result: string) => {
      console.log("Modal closed" + result);
    }).catch((res: any) => { });
  }
  fetch(cb: any) {
    const req = new XMLHttpRequest();
    req.open('GET', `assets/data/suppliers.json`);

    req.onload = () => {
      cb(JSON.parse(req.response));
    };

    req.send();
  }
   /**
    * Type: ngOnInit calls
    * This is to get Suppliers
    */
  getSuppliers():any {
    // this.globalService.startSpinner();
    this.shimmerVisible=true;
    this.Keyword = (this.Keyword == undefined || this.Keyword == null) ? this.Keyword || "" : this.Keyword
    this.supplierService.GetAllSuppliers(this.Keyword, this.itemOrder, this.sort, this.pageNumber, this.rowCount,"",this.Active).subscribe(data => {
      this.filteredData = data.Result.GetAllSuppliers;
      this.Supplierslist = data.Result.GetAllSuppliers;
      this.TotalCount=data.Result
      this.totalCount =data.Result.TotalCount
      // this.globalService.stopSpinner();
      this.shimmerVisible=false;
    },
      error => {
        // this.globalService.stopSpinner();
        this.shimmerVisible=false;
      });
  }
    /**
   * Type :(click) Event Function
   *  This method is used in serach with debouncing concept
   */
    changeSearch(Keyword: any) {
      this.pageNumber = 1;
      this.pageSize = 40;
      this.modelChanged.next(Keyword);
      // this.getSuppliers();
    }

    ChangeEvent(rowNo: any) {
      this.itemsPerPage = rowNo.target.value;
      this.pageNumber = 1
      this.rowCount = rowNo.target.value;
      this.getSuppliers();
    }
    updateFilter(event: any) {
      this.modelChanged.next(event.target.value)
    }
    OnEditSupplier(SupplierDetails:any){
      localStorage.setItem('SupplierDetails', JSON.stringify(SupplierDetails));    
      this.router.navigate(['/suppliers/new-supplier',SupplierDetails.SupplierGuid])
    }
    SendSupplierEmail(data: any): void {
      const today = new Date();
      const year = today.getFullYear();
      let body = {
        to: data.SupplierEmailId,
        Body: "",
        subject: "SupplierVerification",
        lstReplacebleVariables: [
          {
            user: data.SupplierName,
            year: year,
            supplierGuid: data.SupplierGuid
          }
        ]
      };
    
      this.authservice.sendEmail(body).subscribe(
        (res: any) => {
          this.router.navigateByUrl('auth/supplier-verified')
          console.log('Email sent successfully!', 'Success');
        },
        (error: any) => {
          console.log('Failed to send email!', 'Error');
        }
      );
    }

    /**
   * this change event to chage the page number
   * @param event 
   */
  ChangePagenumber(event: any) {
    this.pageNumber = event;
    this.getSuppliers();
  }
  DeleteSupplier() {
    this.globalService.startSpinner();
    this.supplierService.DeleteSupplierDetails(this.SupplierGuid).subscribe((data: any) => {
      this.getSuppliers();
      this.globalService.stopSpinner();
    },
      (err: HttpErrorResponse) => {
        this.globalService.stopSpinner();
      })
    }
    deleteSupplierDetails(SupplierData: any) {
      this.SupplierName = SupplierData.SupplierName;
      this.SupplierGuid=SupplierData.SupplierGuid;
      this.ISPurchseIndent=SupplierData.ISPurchseIndent;
      this.IsPurchseOrder=SupplierData.IsPurchseOrder;
      this.GetSupplierPendingPo()
    }
    AddSupplier(){
      localStorage.setItem('SupplierUnqId',this.filteredData[0].SupplierUnqId)
    }
    Changeusers(event:any){
      console.log(event.target.value);
      let option=event.target.value;
      if(option==="In-Active"){
        this.Active="In-Active";
      }
       else if(option === "Active"){
        this.Active="Active";
      }
      else if(option === "New"){
        this.Active="New";
       } else {
        this.Active = "";
      }
      this.getSuppliers();
    }

  GetSupplierPendingPo(){
    this.supplierService.GetSupplierPendingPo(this.SupplierGuid).subscribe(data => {
      this.PendingPoData = data.Result;
      console.log("PendingPoData",this.PendingPoData)
    })
  }
}

