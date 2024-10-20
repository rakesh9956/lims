import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-c-item-indents',
  templateUrl: './c-item-indents.component.html',
  styleUrls: ['./c-item-indents.component.scss']
})
export class CItemIndentsComponent implements OnInit {

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
  @Input()  itemIndentData : any[];


  constructor() { }

  ngOnInit(): void {
    if(window.outerWidth < 480){
      this.maxSize = 2;
      this.boundaryLinks = false;
      this.size = 'sm';
      console.log(this.itemIndentData)
    }
  }
  ChangePagenumber(event: any) {
    this.pageNumber = event;    
   }
}
