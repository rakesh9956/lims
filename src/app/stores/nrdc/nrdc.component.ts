import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AllItemsService } from 'src/app/core/Services/all-items.service';
import { AuthenticationService } from 'src/app/core/Services/authentication.service';
import { IndentService } from 'src/app/core/Services/indent.service';
import * as html2pdf from 'html2pdf.js';
import { formatDate } from '@angular/common';
import { AllReportsService } from 'src/app/core/Services/all-reports.service';
import { Subject, debounceTime } from 'rxjs';

@Component({
  selector: 'app-nrdc',
  templateUrl: './nrdc.component.html',
  styleUrls: ['./nrdc.component.scss']
})
export class NrdcComponent implements OnInit {
  shimmerVisible: boolean;
  isMenuCollapsed: boolean = true;
  nrdcItemsList: any = [];
  RowCount: any = 40;
  Keyword: any = '';
  TotalCount: any = '';
  PageNumber: any = 1;
  maxSize: number;
  itemOptionsPerPage = [40, 80, 120, 160, 200, 240, 280, 320];
  boundaryLinks: boolean = true;
  size: string = 'lg';
  CenterLocation: any = [];
  Location: any;
  items: any;
  FromLocationGuid: any;
  ReturnItems: any = [];
  ReturnItemsDetailForm: FormGroup = {} as any;
  lstRetunnitemDetails: any[] = [];
  clearControl: FormControl = new FormControl();
  getNRDCDetails: any;
  nrdcdetails: any=[];
  UnparsedHtml: any = '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Supplier Quotation</title><style>table{border-collapse:collapse;border:1px solid #000}table td,table th{border-bottom:1px solid #000;border-right:1px solid #000;padding:5px;text-align:left;word-wrap:break-word;word-break:break-all;font-size:10px}table tr:last-child td{border-bottom:none}p{margin:0}</style></head><body><table style="text-align:center;table-layout:fixed" width="100%"><tbody><tr><td><div style="height:28px;display:flex;align-items:center;padding:20px 0"><img data-v-0e549244="" src="assets/images/YodaLIMSLogo.png" alt="Yoda LIMS"></div></td></tr></tbody></table><table style="table-layout:fixed;background-color:#ccc" width="100%"><tbody><tr><td style="font-weight:700;font-size:24px;text-align:center">Duplicate Non Returnable Challan</td></tr></tbody></table><table style="table-layout:fixed" width="100%"><tbody><tr><td style="font-size:10px"><b>NRDC #:</b>%%NRDC%%</td><td style="font-size:10px"><b>NRDC Date:</b>%%NRDCDate%%</td></tr><tr><td style="font-size:10px"><b>Stock Point:</b>%%stockpoint%%</td><td style="font-size:10px"><b>vendor CD :</b>%%supierid%%</td></tr><tr><td style="font-size:10px"><b>Created By:</b>%%createsby%%</td><td style="font-size:10px"><b>Created Date:</b>%%createdDate%%</td></tr><table width="100%"><tbody><tr><td style="font-size:10px"><b>Vendor Name:</b>%%supliername%%</td></tr></tbody></table></tbody></table><table style="table-layout:fixed;background-color:#ccc;margin-top:20px" width="100%"><tbody><tr><td style="font-size:14px"><b>Item Details:</b></td></tr></tbody></table><table style="table-layout:fixed" width="100%"><thead><tr><th>Item CD</th><th>Item name</th><th>Vendor Item name</th><th>Batch</th><th>Expiry Date</th><th>Quantity</th><th>Purchase rate</th><th>Purchase Value</th></tr></thead><tbody><tr id="GRNItemDetails"><th>%%ItemCode%%</th><th>%%ItenName%%</th><th>%%VendorItemName%%</th><th>%%BatchNumber%%</th><th>%%ExpiryDate%%</th><th>%%Quantity%%</th><th>%%ItemRate%%</th><th>%%ItemTotalPrice%%</th></tr></tbody><tr><td style="font-size:10px;text-align:right" colspan="7"><b>Total Purchase Value:</b></td><td style="font-size:10px">%%TotalAmount%%</td></tr></table></body></html>';
  UserGuid: any;
  LstNRDCItemDetails: FormArray = {} as any;
  SelectedItemList: any=[];
  FromDate: any='';
  ToDate: any='';
  CenterGuid: any='';
  isChecked: boolean=false;
  Buttonshow: boolean;
  OrderBy:any='';
  SortType:any='desc';
  modelChanged = new Subject<string>();
  constructor(
    private modalService: NgbModal,
    public authservice: AuthenticationService,
    private itemService: AllItemsService,
    private indentService: IndentService,
    private allreportservice:AllReportsService,
    private fb: FormBuilder,
  ) { 
    this.modelChanged.pipe(debounceTime(1000)).subscribe(model => {
      this.Keyword = model;
      this.getNRDCDefaults();
    });
  }

  ngOnInit(): void {
    this.getNRDCDefaults();
    this.getLocationDefaults();
    this.inItForms();
    this.UserGuid = localStorage.getItem('UserGuid') || '';
  }
  inItForms(): void {
    this.ReturnItemsDetailForm = this.fb.group({
      IsReturn: [''],
      UserGuid: [''],
      LstNRDCItemDetails: this.fb.array([
        this.fb.group({
          ItemName: [''],
          ReturnQuantity: [''],
          ReturnReason: [''],
          StockGuid: [''],
          Unitprice: [''],
          Totalprice: [''],
          StockinhandQty: [''],
          BatchNumber: [''],
          ExpiryDate: [''],
          IsSelectItem:[false]
        })
      ])
    })
  }
  get addItemslist(): FormArray<any> {
    return this.ReturnItemsDetailForm.get('LstNRDCItemDetails') as FormArray;

  }
  AddItems() {
    this.addItemslist.push(this.fb.group({
      ItemName: ['',[Validators.required]],
      VendorItemName: [''],
      ReturnQuantity: ['', [Validators.required]],
      ReturnReason: [''],
      IndentGuid: ['',[Validators.required]],
      StockGuid: [''],
      Location: ['',[Validators.required]],
      Unitprice: [''],
      Totalprice: [''],
      StockinhandQty: [''],
      RejectnUnit: [''],
      BatchNumber: [''],
      RejectReason: [''],
      ExpiryDate: ['',[Validators.required]],
      vendername:['',[Validators.required]]
    }));
  }
  //restricted the popup modal
  openBackDropCustomClass(content: TemplateRef<any>) {
    this.items = ''
    this.modalService.open(content, { backdrop: 'static', keyboard: false, size: 'lg' });
  }
  /**
* this service method used to get all locations
*/
  getLocationDefaults() {
    this.shimmerVisible = true;
    this.itemService.getQuotationPostDefaults().subscribe(data => {
      const Locations = data.Result.LstQuotationCenterLocationType || [];
      if (this.authservice.LoggedInUser.LOCATIONSGUID == '00000000-0000-0000-0000-000000000000') {
        this.CenterLocation = Locations
      }
      else {
        this.CenterLocation = Locations.filter((item: any) => item.CenterLocationGuid.toLowerCase() === this.authservice.LoggedInUser.LOCATIONSGUID.toLowerCase());
      }
      this.shimmerVisible = false;
    },
      err => {
        this.shimmerVisible = false;
      })
  }
  getNRDCDefaults() {
    this.shimmerVisible = true;
    this.itemService.getNRDCDetails(this.PageNumber,this.RowCount,this.Keyword,this.OrderBy,this.SortType).subscribe(data => {
      this.nrdcdetails = data || [];
      this.TotalCount=this.nrdcdetails[0]?.TotalCount
      this.shimmerVisible = false;
    },
      err => {
        this.shimmerVisible = false;
      })
  }
  /**
   * this event used to select the location
   * @param event 
   */
  SelectLocation(event: any) {
      this.items = [];
      this.ReturnItems = [];
      this.ReturnItemsDetailForm.reset();
      this.inItForms();
      this.Buttonshow=true;
      this.isChecked=false;
      this.FromLocationGuid = event.CenterLocationGuid;
      this.GetStockinHandReports();
  }
  /**
  * This  method is used to get the stock items 
  */
  GetStockinHandReports(){
    this.ReturnItems = [];
    if(this.FromLocationGuid.length==0){
      this.FromLocationGuid =this.authservice.LoggedInUser.DEFAULTROLES.toLowerCase().includes('ADMIN'.toLowerCase()) && this.authservice.LoggedInUser.LOCATIONSGUID=='00000000-0000-0000-0000-000000000000' ?'00000000-0000-0000-0000-000000000000': this.authservice.LoggedInUser.LOCATIONSGUID.split(",");
    }
    this.allreportservice.GetStockinHandReports(this.FromDate,this.ToDate,this.CenterGuid,this.FromLocationGuid).subscribe(data => {
        this.SelectedItemList = data ||[];
        this.ReturnItems =  this.SelectedItemList.filter((obj: { ItemGuid: any; }, index: any, self: any[]) =>
            index === self.findIndex((item) => (
              item.ItemGuid === obj.ItemGuid
            ))
          );
        },
        (err: HttpErrorResponse) => {
      })
  }
  selectCheckBox(event:any,i:any){
    const Ischeked=event.target.checked
    const ItemDetails = this.addItemslist.at(i);
    if(Ischeked==true){
      ItemDetails.patchValue({
        IsSelectItem: true,
      }); 
      ItemDetails.get('ReturnReason')?.setValidators([Validators.required])
      ItemDetails.get('ReturnReason')?.updateValueAndValidity()
    }
    else{
      ItemDetails.patchValue({
        IsSelectItem: false,
      }); 
      ItemDetails.get('ReturnReason')?.clearValidators()
      ItemDetails.get('ReturnReason')?.updateValueAndValidity()
    }
    this.isChecked = this.addItemslist.value.some((f: any) => f.IsSelectItem);
  }
  /**
   * this event used to select the items
   * @param event 
   */
  SelectItems(event: any) {
    this.addItemslist.clear();
    const selectedItems = this.SelectedItemList.filter((item: any) => {
      return event.some((selectedItem: { ItemGuid: any; }) => selectedItem.ItemGuid === item.ItemGuid);
    });
    if (event.length == 0) {
      this.inItForms();
    }
    else {
      selectedItems.forEach((element: any) => {
        this.addItemslist.push(this.fb.group({
          ItemName: element.ItemName,
          VendorItemName: element.VendorItemName,
          StockGuid: element.StockGuid,
          Unitprice: element.UnitPrice,
          Totalprice: element.InHandQuantity*element.UnitPrice,
          StockinhandQty: element.InHandQuantity,
          BatchNumber: element.BatchNumber,
          ExpiryDate: element.ExpiryDate,
          ReturnReason:[''],
          ReturnQuantity: element.InHandQuantity,
          IsSelectItem:false,
          vendername:element.SuplierName
        }))
      });
      this.ReturnItemsDetailForm.patchValue({
        IsReturn: true,
        UserGuid: this.UserGuid,
      })
      this.Buttonshow=true;
      this.isChecked=false;
    }
  }
  /**
   * this service method used to save return items to vender
   */
  Savenrdcitems() {
    this.shimmerVisible = true;
    this.ReturnItemsDetailForm.value.LstNRDCItemDetails = this.addItemslist.value.filter((control: any) => control.IsSelectItem === true).map((control: any) => control);
    this.indentService.SaveNRDCitems(this.ReturnItemsDetailForm.value).subscribe(
      (data) => {
        this.shimmerVisible = false;
        this.getNRDCDefaults();
        this.ReturnItemsDetailForm.reset();
      },
      (err) => {
        this.shimmerVisible = false;
      })
  }
  reset() {
    this.clearControl.reset();
    this.ReturnItemsDetailForm.reset();
    this.inItForms();
  }
  DownloadPdf(item: any, print: any) {
    let html = "";
    html = this.UnparsedHtml;
    const replacements: any = {
      '%%ItenName%%': item.itemname || '',
      '%%VendorItemName%%': item.VendorItemName?item.VendorItemName:'N/A' || '',
      '%%Quantity%%': item.qty.toString().match(/^\d+(?:\.\d{0,2})?/) || '',
      '%%ItemRate%%': item.unitprice.toString().match(/^\d+(?:\.\d{0,2})?/) || '',
      '%%ItemTotalPrice%%': item.TotalPrice.toString().match(/^\d+(?:\.\d{0,2})?/) || '',
      '%%stockpoint%%': item.LocationName || '',
      '%%supierid%%': item.Vendercode == "" || null ? 'N/A' : item.Vendercode || '',
      '%%supliername%%': item.venderName || '',
      '%%ExpiryDate%%': item.ExpiryDate == '0001-01-01T00:00:00' ? 'N/A' : formatDate(item.ExpiryDate, 'dd-MM-yyyy', 'en') || '',
      '%%BatchNumber%%': item.BatchNumber || '',
      '%%ItemCode%%': item.ItemCode == null || "" ? 'N/A' : item.ItemCode || '',
      '%%TotalAmount%%': item.TotalPrice.toString().match(/^\d+(?:\.\d{0,2})?/) || '',
      '%%NRDC%%': 'NRDC' + item.StockId || '',
      '%%createsby%%': item.UserName || '',
      '%%NRDCDate%%': item.ReturnedDate == '0001-01-01T00:00:00' ? 'N/A' : formatDate(item.ReturnedDate, 'dd-MM-yyyy', 'en') || '',
      '%%createdDate%%': item.ReturnedDate == '0001-01-01T00:00:00' ? 'N/A' : formatDate(item.ReturnedDate, 'dd-MM-yyyy', 'en') || ''

    };
    for (const key in replacements) {
      html = html.replace(key, replacements[key]);
    }
    let dochtml: any = '';
    dochtml = new DOMParser().parseFromString(html, 'text/html');
    html = dochtml.documentElement.outerHTML
    const options = {
      filename: `NRDCItems-Details.pdf`,
      margin: 0.2,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 1 },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'landscape' }
    };
    const element = html;
    if (print != "") {
      html2pdf().from(element).set(options).outputPdf('datauristring').then((pdfAsString: any) => {
        // Open the PDF in a new window for printing 
        const printWindow: any = window.open();
        printWindow.document.write('<html><head><title>Print</title></head><body style="margin:0;padding:0"><embed width="100%" height="100%" src="' + pdfAsString + '" type="application/pdf" /></body></html>');
        printWindow.document.close();
        printWindow.focus();
        // Print the PDF after a short delay 
        setTimeout(() => {
          printWindow.print();
        }, 250);
      });
    } else {
      html2pdf().from(element).set(options).save();
    }
  }
  /**
   * this event used to change the NRDC quantity
   * @param event 
   */
  Changequantity(event: any, index: any) {
    const ReturnQuantityCountControl = this.ReturnItemsDetailForm.get('LstNRDCItemDetails.' + index + '.ReturnQuantity');
    const TotalpriceCountControl = this.ReturnItemsDetailForm.get('LstNRDCItemDetails.' + index + '.Totalprice');
    const returnQuantity = ReturnQuantityCountControl?.value; 
    const stockInHandQty = this.ReturnItemsDetailForm.get('LstNRDCItemDetails')?.value[index].StockinhandQty;
    const unitPrice = this.ReturnItemsDetailForm.get('LstNRDCItemDetails')?.value[index].Unitprice;

    if (returnQuantity === 0) {
      this.Buttonshow = false;
    } else if (returnQuantity > stockInHandQty) {
      ReturnQuantityCountControl?.setValue(stockInHandQty);
      TotalpriceCountControl?.setValue(stockInHandQty * unitPrice);
      this.Buttonshow = true;
    } else {
      TotalpriceCountControl?.setValue(returnQuantity * unitPrice);
      this.Buttonshow = true;
    }
  }
 /**
   * This event used to change the row count
   * @param event 
   */
 ChangeEvent(event:any){
  this.RowCount=event.target.value;
  this.PageNumber=1;
  this.getNRDCDefaults();
}
/**
 * this event used to change the pagenumber
 * @param event 
 */
ChangePagenumber(event:any){
  this.PageNumber=event
  this.getNRDCDefaults();
}
/**
 * this event used to change the search
 * @param event 
 */
changeSearch(event:any){
  this.PageNumber = 1;
  this.RowCount = 40;
  this.modelChanged.next(event.target.value);
}
}
