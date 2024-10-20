import { Component, Input, OnInit } from '@angular/core';
import { SupplierService } from 'src/app/core/Services/supplier.service';
import { GlobalService } from 'src/app/core/Services/global.service';

@Component({
  selector: 'app-c-item-suppliers',
  templateUrl: './c-item-suppliers.component.html',
  styleUrls: ['./c-item-suppliers.component.scss']
})
export class CItemSuppliersComponent implements OnInit {

  IsShow: boolean = true;
  Keyword: string ;
  filteredData: any[] = [];
  TotalCount: any;
  itemOrder :any
  OrderBy: string = '';
  sort: string = 'desc';
  pageNumber: any = -1;
  rowCount: any = -1;
  @Input()  Supplierslist : any[];
  constructor(
    public supplierService: SupplierService,
    public globalService: GlobalService) { }

  ngOnInit(): void {
    this.Supplierslist = this.Supplierslist.filter((value: any, index: any, self: any) => {
      const firstIndex = self.findIndex((item: any) => item.SupplierGuid === value.SupplierGuid || item.SupplierName === value.SupplierName);
      return index === firstIndex;
    });
   // this.getSuppliers()
   console.log (this.Supplierslist)
  }

 
}
