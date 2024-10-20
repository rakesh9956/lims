import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, TemplateRef } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ColumnMode } from '@swimlane/ngx-datatable';
import { debounceTime, Subject } from 'rxjs';
import { PeoplesData, Person } from 'src/app/core/dummy-datas/peoples.data';
import { AllItemsService } from 'src/app/core/Services/all-items.service';
import { GlobalService } from 'src/app/core/Services/global.service';

@Component({
  selector: 'app-item-types',
  templateUrl: './item-types.component.html',
  styleUrls: ['./item-types.component.scss']
})
export class ItemTypesComponent implements OnInit {
  shimmerVisible: boolean;
  people: Person[];
  loadingIndicator = true;
  rows: any[] = [];
  ColumnMode = ColumnMode;
  sort: string = 'desc';
  modelChanged = new Subject<string>();
  pageNumber: any = 1
  rowCount: any = 40;
  itemsPerPage = 40;
  totalCount: any;
  AllItemTypes: any=[];
  Keyword = ''
  itemOrder  = '';
  noItemsFound: boolean;
  ItemTypeGuid: any;
  ItemTypeName: any;
  constructor(
    public allItemsService: AllItemsService,
    public globleService: GlobalService,
    private modalService: NgbModal,
  ) {
    this.fetch((data: any) => {
      this.rows = data;
      // setTimeout(() => {
      //   this.loadingIndicator = false;
      // }, 1500);
    });
    this.modelChanged
    .pipe(debounceTime(1000))
   .subscribe(model=>{
    this.Keyword=model;
    this.GetItemTypes();
   })
  }
  /**
    * Type : Angular hook 
    * this method is used for on page load functions
    */
  ngOnInit(): void {
    this.people = PeoplesData.peoples;
    this.GetItemTypes()
  }

  fetch(cb: any) {
    const req = new XMLHttpRequest();
    req.open('GET', `assets/data/item-types.json`);

    req.onload = () => {
      cb(JSON.parse(req.response));
    };

    req.send();
  }
  /**
   * This method is used to Get the all ItemTypes
   */
  GetItemTypes() {
    this.shimmerVisible = true;
    // this.globleService.startSpinner();
    this.allItemsService.GetItemTypes(this.pageNumber, this.rowCount, this.Keyword, this.itemOrder, this.sort).subscribe(data => {
      // this.globleService.stopSpinner();
      this.shimmerVisible = false;
      this.AllItemTypes = data.Result.getAllItemTypes || [];
      if(this.AllItemTypes.length == 0){
        this.noItemsFound=true;
      }else{
        this.noItemsFound=false;
        this.shimmerVisible = false;
      }
    })
  }
  /**
   * This Method is used to Get set the selected item details while click on Edit action
   * @param ItemTypesDetails 
   */
  GetSelectedItemType(ItemTypesDetails: any) {
    let ItemTypes = JSON.stringify(ItemTypesDetails)
    localStorage.setItem('ItemTypeDeatils', ItemTypes)
  }


    /**
 * Type :(keyup) Event Function
 * This method is used for search in the vc center
 */
    changeSearch(keyword: any) {
      this.modelChanged.next(keyword);
    }
    searchItem(){
      if(this.AllItemTypes.length == 0){
        this.noItemsFound=true;
      }else{
        this.noItemsFound=false;
      }
    }
    openBasicModal(content: TemplateRef<any>) {
      this.modalService.open(content, { size: 'md' }).result.then((result: string) => {
        console.log("Modal closed" + result);
      }).catch((res: any) => { });
    }
    ItemtypeDetails(row: any) {
      this.ItemTypeName = row.ItemTypeName
        this.ItemTypeGuid = row.ItemTypeGuid
      }
      DeleteItemtype() {
        this.shimmerVisible = true;
        this.allItemsService.DeleteItemtype( this.ItemTypeGuid).subscribe((data: any) => {
          this.GetItemTypes()
        },
          (err: HttpErrorResponse) => {
            this.shimmerVisible=false
          })
      }
}
