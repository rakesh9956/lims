import { Component, OnInit, TemplateRef } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ColumnMode } from '@swimlane/ngx-datatable';
import { debounceTime, Subject } from 'rxjs';
import { AllItemsService } from 'src/app/core/Services/all-items.service';

@Component({
  selector: 'app-all-cpt',
  templateUrl: './all-cpt.component.html',
  styleUrls: ['./all-cpt.component.scss']
})
export class AllCptComponent implements OnInit {

  shimmerVisible:boolean;
  loadingIndicator = true;
  ColumnMode = ColumnMode;
  itemOptionsPerPage = [40, 80, 120, 160, 200, 240, 280, 320];
  keyword: string = ' ';
  itemOrder: any = ' '
  sort: string = 'desc';
  pageNumber = 1;
  rowCount = 40;
  allCptList: any = [];
  TotalCount: any;
  IsShow: boolean = false;
  maxSize: number = 3;
  boundaryLinks: boolean = true;
  size: string = 'lg';
  itemsPerPage: any= 40;
  modelChanged = new Subject<string>();
  CPTNO: any;
  CPTGuid: any;
  constructor( private allItemsService: AllItemsService, private modalService: NgbModal) {     
    this.modelChanged.pipe(debounceTime(1000)).subscribe(model => {
    this.keyword = model;
    this.GetAllCpt();
  });
}

  ngOnInit(): void {
    this.GetAllCpt();
    if (window.outerWidth < 480) {
      this.maxSize = 2;
      this.boundaryLinks = false;
      this.size = 'sm';
    }
  }
  GetAllCpt(){
    this.shimmerVisible=true;
    this.keyword = (this.keyword == undefined || this.keyword == null) ? this.keyword || "" : this.keyword;
     this.allItemsService.GetAllCpts(this.pageNumber,this.rowCount,this.keyword, this.itemOrder, this.sort,'').subscribe((data) => {
      this.allCptList =data.Result.lstgetAllCpts;
      if(this.allCptList?.length > 0){
        this.TotalCount=data.Result.TotalCount;
        this.IsShow=false
      }else{
        this.IsShow=true
      }
      this.shimmerVisible=false;
   },
    error => {
      this.shimmerVisible=false;
    });
  }
  ChangePagenumber(event: any) {
    this.pageNumber = event;
    this.GetAllCpt();
  }
  GetAllData(event: any) {
    this.pageNumber = event;
    this.GetAllCpt();
  }

  changeSearch(Keyword: any) {
    this.pageNumber = 1;
    this.rowCount = 40;
    this.modelChanged.next(Keyword.target.value);
  }
  deleteCPT(){
    this.shimmerVisible = true;
    let body={
      cptGuid:this.CPTGuid
    }
    this.allItemsService.DeleteCPTByGuid(body).subscribe(
      (cptDetails: any) => {
        this.GetAllCpt()
      },
      (err: any) => {
        // this.globalservice.stopSpinner();
        this.shimmerVisible = false;
      }
    );
  }
  openBasicModal(content: TemplateRef<any>) {
    this.modalService.open(content, { backdrop: 'static', keyboard: false ,size: 'md' }).result.then((result: string) => {
      console.log("Modal closed" + result);
    }).catch((res: any) => { });
  }
  Delquotation(row: any) {
    this.CPTNO = row.CPTNo
    this.CPTGuid = row.CPTGuid
  }
  ChangeEvent(rowNo: any) {
    this.pageNumber = 1
    this.itemsPerPage = rowNo.target.value;
    this.rowCount = rowNo.target.value;
    this. GetAllCpt();
  }
}
