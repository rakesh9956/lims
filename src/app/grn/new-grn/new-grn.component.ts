import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { ColumnMode } from '@swimlane/ngx-datatable';


@Component({
  selector: 'app-new-grn',
  templateUrl: './new-grn.component.html',
  styleUrls: ['./new-grn.component.scss']
})
export class NewGrnComponent implements OnInit {
  @ViewChild(DatatableComponent) table: DatatableComponent;
  rows:any[] = [];
  temp:any[] = [];
  loadingIndicator = true;
  reorderable = true;
  selectedDate: NgbDateStruct;
  ColumnMode = ColumnMode;


  
  constructor() {
    this.fetch((data: any) => {
      this.temp = data;
      this.rows = data;
      // setTimeout(() => {
      //   this.loadingIndicator = false;
      // }, 1500);
    });
  }

  ngOnInit(): void {
  }

  fetch(cb: any) {
    const req = new XMLHttpRequest();
    req.open('GET', `assets/data/all-items.json`);

    req.onload = () => {
      cb(JSON.parse(req.response));
    };

    req.send();
  }

  updateFilter(event: any) {
    const val = event.target.value.toLowerCase();

    // filter our data
    const temp = this.temp.filter(function (d) {
      return d.itemName.toLowerCase().indexOf(val) !== -1 || !val;
    });
    
    // update the rows
    this.rows = temp;
    // Whenever the filter changes, always go back to the first page
    this.table.offset = 0;
  }

}

