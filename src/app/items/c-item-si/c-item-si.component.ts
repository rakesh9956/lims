import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-c-item-si',
  templateUrl: './c-item-si.component.html',
  styleUrls: ['./c-item-si.component.scss']
})
export class CItemSiComponent implements OnInit {

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
  @Input()  itemSIDetails : any[];


  constructor() { }

  ngOnInit(): void {
  }

  ChangePagenumber(event: any) {
    this.pageNumber = event;    
   }

}
