import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-compare-quotations',
  templateUrl: './compare-quotations.component.html',
  styleUrls: ['./compare-quotations.component.scss']
})
export class CompareQuotationsComponent implements OnInit {

  itemNames: any;
  selectedItemName: any;

  constructor() { }

  ngOnInit(): void {
  }

}
