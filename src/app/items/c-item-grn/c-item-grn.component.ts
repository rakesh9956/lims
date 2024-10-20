import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-c-item-grn',
  templateUrl: './c-item-grn.component.html',
  styleUrls: ['./c-item-grn.component.scss']
})
export class CItemGrnComponent implements OnInit {

  /*** Paginatin Option Starts ***/
  maxSize: number = 3;
  boundaryLinks: boolean = true;
  size: string = 'lg';
  /*** Paginatin Option Starts ***/

  IsShow: boolean = true;  
  grnstsatusList: any = [];
  TotalCount: any;
  pageNumber: any = 1;
  itemsPerPage: any=40;
  @Input()  itemGrntData : any[];


  constructor() { }

  ngOnInit(): void {
    if(window.outerWidth < 480){
      this.maxSize = 2;
      this.boundaryLinks = false;
      this.size = 'sm';
    }

    console.log(this.itemGrntData)
  }

  ChangePagenumber(event: any) {
    this.pageNumber = event;    
   }
}
