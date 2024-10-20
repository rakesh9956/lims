import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbDateStruct, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ColumnMode } from '@swimlane/ngx-datatable';
import { Subject, debounceTime } from 'rxjs';
import { AllItemsService } from 'src/app/core/Services/all-items.service';
import { AllReportsService } from 'src/app/core/Services/all-reports.service';
import { AuthenticationService } from 'src/app/core/Services/authentication.service';
import { IndentService } from 'src/app/core/Services/indent.service';
import * as html2pdf from 'html2pdf.js';
import { Workbook } from 'exceljs';
import * as saveAs from 'file-saver';
import { DatePipe } from '@angular/common';
@Component({
  selector: 'app-scrap-items',
  templateUrl: './scrap-items.component.html',
  styleUrls: ['./scrap-items.component.scss']
})
export class ScrapItemsComponent implements OnInit {
  shimmerVisible: boolean;
  scrapItemForm: FormGroup = {} as any;
  CenterLocation: any = [];
  LocationGuid: any = '';
  ReceivedItems: any = [];
  ScrapItems: any = [];
  Scrapunit: any = '';
  Scrapquantity: any = '';
  Scrapforreason: any = '';
  itemunits: any;
  UserGuid: string;
  IndentitemGuid: any;
  ScrapItemsList: any = [];
  Location: any = [];
  Items: any = [];
  ItemsList: any;
  isMenuCollapsed: boolean = true;
  RowCount: any = 40;
  Keyword: any = '';
  TotalCount: any = '';
  PageNumber: any = 1;
  maxSize: number = 3;
  boundaryLinks: boolean = true;
  size: string = 'lg';
  loadingIndicator = true;
  ColumnMode = ColumnMode;
  modelChanged = new Subject<string>();
  FilterScrapItemsList: any;
  OrderBy: any = '';
  SortType: any = 'desc';
  itemOptionsPerPage = [40, 80, 120, 160, 200, 240, 280, 320];
  FromDate: any = '';
  ToDate: any = '';
  scrapFromDate: any = ''
  scrapEndDate: any = ''
  removeFromDate: any = null;
  removeTodate: any = null;
  CenterGuid: any = '';
  StockinHand: any = [];
  IsStore: boolean;
  Locations: any = [];
  LstScrapItemsDetails: FormArray = {} as any;
  IsButtonShow: boolean;
  SelectedItemList: any = [];
  isChecked: any;
  isdisable: any;
  filterdScrapItems: any = []
  roles: any;
  Isprint:boolean=false;
  minDate: NgbDateStruct;
  selectedDate: NgbDateStruct;
  UnparsedHtml: any = '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Supplier Quotation</title><style>table{border-collapse:collapse;border:1px solid #000}table td,table th{border-bottom:1px solid #000;border-right:1px solid #000;padding:5px;text-align:left;word-wrap:break-word;word-break:break-all;font-size:10px}table tr:last-child td{border-bottom:none}p{margin:0}</style></head><body><table style="text-align:center;table-layout:fixed" width="100%"><tbody><tr><td><div style="height:28px;display:flex;align-items:center;padding:20px 0"><img data-v-0e549244="" src="assets/images/YodaLIMSLogo.png" alt="Yoda LIMS"></div></td></tr></tbody></table><table style="table-layout:fixed;background-color:#ccc" width="100%"><tbody><tr><td style="font-weight:700;font-size:24px;text-align:center">Scrap Items</td></tr></tbody></table><table style="table-layout:fixed" width="100%"></table><table style="table-layout:fixed;background-color:#ccc;margin-top:20px" width="100%"><tbody><tr><td style="font-size:14px"><b>Item Details:</b></td></tr></tbody></table><table style="table-layout:fixed" width="100%"><thead><tr><th>Scrap number</th><th>Item name</th><th>Vendor Item name</th><th>Batch number</th><th>Scrap Qauntity</th><th>Scrap Unit</th><th>Scrap amount</th><th>Reason For Scrap</th><th>Scrap By Name</th><th>Location</th></tr></thead><tbody><tr id="GRNItemDetails"><th>%%Scrapnumber%%</th><th>%%ItenName%%</th><th>%%VendorItemName%%</th><th>%%BatchNumber%%</th><th>%%ScrapQauntity%%</th><th>%%ScrapUnit%%</th><th>%%Scrapamount%%</th><th>%%ReasonForScrap%%</th><th>%%ScrapByName%%</th><th>%%Location%%</th></tr></tbody><tr><td style="font-size:10px;text-align:right" colspan="9"><b>Total scrap amount:</b></td><td style="font-size:10px">%%TotalAmount%%</td></tr></table><table style="table-layout:fixed;margin-top:50px" width="100%"><tbody><tr><td>Created by:%%CreatedBy%%</td><td>Approved by: %%ApprovedUserName%%</td></tr></tbody></table></body></html>'
  AproveItemlist: any=[];
  PODetails: any;
  constructor(
    private modalService: NgbModal,
    private indentService: IndentService,
    private itemService: AllItemsService,
    public authservice: AuthenticationService,
    private fb: FormBuilder,
    private datepipe: DatePipe,
    public allreportservice: AllReportsService
  ) {
    this.modelChanged.pipe(debounceTime(1000)).subscribe(model => {
      this.Keyword = model;
      this.GetScrapItemsItems();
    });
  }

  ngOnInit(): void {
    this.UserGuid = localStorage.getItem('UserGuid') || '';
    this.roles=this.authservice.LoggedInUser.SCRAPROLES
    const currentDate = new Date();
    this.selectedDate = { year: currentDate.getFullYear(), month: currentDate.getMonth() + 1, day: currentDate.getDate() };
    this.getLocationDefaults();
    this.GetScrapItemsItems();
    this.inItForms();
    //this.GetScrapItemDetails()
  }
  inItForms(): void {
    this.scrapItemForm = this.fb.group({
      UserGuid: [this.UserGuid],
      IsStore: [''],
      fromApproval:[''],
      ScrapNumberS:[''],
      LstScrapItemsDetails: this.fb.array([
        this.fb.group({
          BatchNumber: ['', Validators.required],
          ScrapItemQuantity: [''],
          ScrapQuantity: ['', Validators.required],
          ScrapUnits: ['', Validators.required],
          ScrapReason: [''],
          ReceivedQuantity: [''],
          LocationGuid: ['', Validators.required],
          ItemGuid: ['', Validators.required],
          StockGuid: [''],
          IndentIssueGuid: [''],
          MechineName: [''],
          ItemName: [''],
          VendorItemName: [''],
          TotalQuantity: [0],
          IssueMultiplier: [''],
          IsSelectItem: [false],
          TotalAmount: [''],
          UnitPrice: ['']
        })
      ])
    })
  }
  get ScrapItemslist(): FormArray<any> {
    return this.scrapItemForm.get('LstScrapItemsDetails') as FormArray;
  }
  openModal(content: TemplateRef<any>, size: string = 'lg') {
    this.modalService.open(content, { size: size }).result.then((result) => {
      console.log("Modal closed" + result);
    }).catch((res) => { });
  }
  //restricted the popup modal
  openBackDropCustomClass(content: TemplateRef<any>) {
    this.modalService.open(content, { backdrop: 'static', keyboard: false, size: 'lg' });
  }
  /**
  * this service method used to get all locations
  */
  getLocationDefaults() {
    this.shimmerVisible = true;
    this.itemService.getQuotationPostDefaults().subscribe(data => {
      this.Locations = data.Result.LstQuotationCenterLocationType || [];
      if (this.authservice.LoggedInUser.LOCATIONSGUID == '00000000-0000-0000-0000-000000000000') {
        this.CenterLocation = this.Locations
      }
      else {
        this.CenterLocation = this.Locations.filter((item: any) => item.CenterLocationGuid.toLowerCase() === this.authservice.LoggedInUser.LOCATIONSGUID.toLowerCase());
      }
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
    this.LocationGuid = event?.CenterLocationGuid
    this.IsStore = event?.IsStore;
    this.scrapItemForm.patchValue({
      UserGuid: this.UserGuid,
      IsStore: this.IsStore
    })
    if (event != undefined && event.IsStore == false) {
      this.GetReceivedItemsDetails(event.CenterLocationGuid)
    }
    else if (event != undefined && event.IsStore == true) {
      this.GetStockinHandReports(event.CenterLocationGuid)
    }
    else {
      this.inItForms();
      this.scrapItemForm.reset();
      this.ScrapItemslist.reset();
      this.itemunits = '';
      this.Items = [];
      this.ScrapItems = [];
      this.ReceivedItems = [];
      this.Location = [];
      this.ScrapItems = [];
    }
  }
  /**
  * This  method is used to get the scrap items b
  */
  GetReceivedItemsDetails(LocationGuid: any) {
    this.FilterScrapItemsList = [];
    this.ReceivedItems = [];
    this.indentService.GetReceivedItemsDetails(LocationGuid).subscribe(data => {
      this.ItemsList = data.Result || []
      this.ItemsList=this.ItemsList.filter((item:any) => item.IsDeleted==false );
      this.SelectedItemList = this.ItemsList.filter((item: { ReceiveQty: any, ScrapQuantity: any, DPConsumeQty: any, ReturnQuantity: any,IsDeleted:any }) => (item.ReceiveQty) - (item.DPConsumeQty) - (item.ReturnQuantity) - (item.ScrapQuantity) > 0 && item.IsDeleted==false);
      this.ReceivedItems = this.SelectedItemList.filter((obj: { ItemGuid: any; }, index: any, self: any[]) =>
        index === self.findIndex((item) => (
          item.ItemGuid === obj.ItemGuid
        ))
      );
    },
      (err: HttpErrorResponse) => {
        this.shimmerVisible = false;
      })
  }
  /**
  * this service method used to Get department items
  * @param type 
  */
  GetStockinHandReports(LocationGuid: any) {
    this.ReceivedItems = [];
    if (this.LocationGuid.length == 0) {
      this.LocationGuid = this.authservice.LoggedInUser.DEFAULTROLES.toLowerCase().includes('ADMIN'.toLowerCase()) && this.authservice.LoggedInUser.LOCATIONSGUID == '00000000-0000-0000-0000-000000000000' ? '00000000-0000-0000-0000-000000000000' : this.authservice.LoggedInUser.LOCATIONSGUID.split(",");
    }
    this.allreportservice.GetStockinHandReports(this.FromDate, this.ToDate, this.CenterGuid, this.LocationGuid).subscribe(data => {
      this.SelectedItemList = data || [];
      this.ReceivedItems = this.SelectedItemList.filter((obj: { ItemGuid: any; }, index: any, self: any[]) =>
        index === self.findIndex((item) => (
          item.ItemGuid === obj.ItemGuid
        ))
      );
    }, error => {
    })
  }
  get ScrapForReason() {
    return this.scrapItemForm.value.ScrapForReason?.trim();
  }
  /**
* This  method is used to get the scrap items 
*/
  GetScrapItemsItems() {
    this.FilterScrapItemsList = [];
    this.shimmerVisible = true;
    if (this.LocationGuid.length == 0) {
      this.LocationGuid = this.authservice.LoggedInUser.DEFAULTROLES.toLowerCase().includes('ADMIN'.toLowerCase()) && this.authservice.LoggedInUser.LOCATIONSGUID == '00000000-0000-0000-0000-000000000000' ? '00000000-0000-0000-0000-000000000000' : this.authservice.LoggedInUser.LOCATIONSGUID.split(",");
    }
    if(this.Isprint==true){
      this.PageNumber=-1;
    }
    this.itemService.getScrapItemsItems(this.PageNumber, this.RowCount, this.Keyword, this.OrderBy, this.SortType,this.scrapFromDate, this.scrapEndDate, this.LocationGuid).subscribe(data => {
      this.ScrapItemsList = data.Result || [];
      this.TotalCount = this.ScrapItemsList[0]?.TotalCount;

      const countMap: any = {};
      this.ScrapItemsList.forEach((item: any) => {
        const scrapNumber = item.ScrapNumber;
        countMap[scrapNumber] = (countMap[scrapNumber] || 0) + 1;
      });

      this.filterdScrapItems = this.ScrapItemsList
      .filter((item: any, index: any, self: any) => {
        const scrapNumber = item.ScrapNumber;
        if (countMap[scrapNumber]) {
          // Calculate the total amount for items with the same ScrapNumber
          const totalAmountSum = self
            .filter((v: any) => v.ScrapNumber === scrapNumber)
            .reduce((sum: number, v: any) => sum + v.totalAmount, 0);
          item.Count = countMap[scrapNumber];
          item.TotalAmountSum = totalAmountSum;
        }
        return self.findIndex((v: any) => v.ScrapNumber === scrapNumber) === index;
      });
      if(this.Isprint==true){
        this.downloadExcel();
      }
      this.shimmerVisible = false;
    },
      (err: HttpErrorResponse) => {
        this.shimmerVisible = false;
      })
  }
  /**
   * this service method used to save scrap items
   */
  SaveScrapItem() {
    this.scrapItemForm.patchValue({
      fromApproval:false
    })
    //FormValueTrimeer.cleanForm(this.scrapItemForm); 
    this.scrapItemForm.value.LstScrapItemsDetails = this.ScrapItemslist.value.filter((control: any) => control.IsSelectItem === true).map((control: any) => control);
    this.indentService.SaveScrapItemDetails(this.scrapItemForm.value).subscribe(
      (data) => {
        this.shimmerVisible = false;
        this.LocationGuid = '';
        location.reload();
        this.GetScrapItemsItems();
      },
      (err) => {
        this.shimmerVisible = false;
      })
  }
  selectCheckBox(event: any, i: any) {
    const Ischeked = event.target.checked
    const ItemDetails = this.ScrapItemslist.at(i);
    if (Ischeked == true) {
      ItemDetails.patchValue({
        IsSelectItem: true
      });
      ItemDetails.get('ScrapReason')?.setValidators([Validators.required])
      ItemDetails.get('ScrapReason')?.updateValueAndValidity()
    }
    else {
      ItemDetails.patchValue({
        IsSelectItem: false
      });
      ItemDetails.get('ScrapReason')?.clearValidators()
      ItemDetails.get('ScrapReason')?.updateValueAndValidity()
    }
    this.isChecked = this.ScrapItemslist.value.some((f: any) => f.IsSelectItem);
  }
  /**
   * this event used to get the scrap items in popup
   * @param Item 
   */
  SelectItem(Item: any) {
    this.ScrapItemslist.clear();
    const selectedItems = this.SelectedItemList.filter((item: any) => {
      return Item.some((selectedItem: { ItemGuid: any; }) => selectedItem.ItemGuid === item.ItemGuid);
    });
    if (selectedItems.length > 0) {
      if (this.IsStore == false) {
        selectedItems.forEach((element: any) => {
          this.ScrapItemslist.push(this.fb.group({
            BatchNumber: element.BatchNumber,
            ScrapQuantity: element.ReceiveQty - element.ScrapQuantity - element.DPConsumeQty - element.ReturnQuantity,
            ScrapUnits: (element.ReceiveQty - element.ScrapQuantity - element.DPConsumeQty - element.ReturnQuantity) * element.IssueMultiplier,
            ReceivedQuantity: element.ReceiveQty,
            LocationGuid: this.LocationGuid,
            ItemGuid: element.ItemGuid,
            StockGuid: element.StockPhycicalGuid,
            IndentIssueGuid: element.IndentGuid,
            MechineName: element.MachineName,
            ItemName: element.ItemName,
            VendorItemName: element.VendorItemName,
            TotalQuantity: element.ReceiveQty - element.ScrapQuantity - element.DPConsumeQty - element.ReturnQuantity,
            ScrapReason: [''],
            IssueMultiplier: element.IssueMultiplier,
            IsSelectItem: false,
            TotalAmount: element.ReceiveQty * element.UnitPrice,
            UnitPrice: element.UnitPrice
          }))
        });
      }
      else {
        selectedItems.forEach((element: any) => {
          this.ScrapItemslist.push(this.fb.group({
            BatchNumber: element.BatchNumber,
            ScrapQuantity: element.InHandQuantity,
            ScrapUnits: element.InHandQuantity * element.IssueMultiplier,
            ReceivedQuantity: element.InHandQuantity,
            LocationGuid: this.LocationGuid,
            ItemGuid: element.ItemGuid,
            StockGuid: element.StockGuid,
            IndentIssueGuid: '',
            MechineName: element.MachineName,
            ItemName: element.ItemName,
            VendorItemName: element.VendorItemName,
            TotalQuantity: element.InHandQuantity,
            ScrapReason: [''],
            IssueMultiplier: element.IssueMultiplier,
            IsSelectItem: false,
            TotalAmount: element.InHandQuantity * element.UnitPrice,
            UnitPrice: element.UnitPrice
          }))
        });
      }
    } else {
      this.inItForms()
    }

  }
  /**
   * this event used to change the scrap item units
   * @param event 
   */
  ChangeUnit(event: any, index: any) {
    const ScrapQuantityCountControl = this.scrapItemForm.get('LstScrapItemsDetails.' + index + '.ScrapQuantity');
    const ScrapUnitsCountControl = this.scrapItemForm.get('LstScrapItemsDetails.' + index + '.ScrapUnits');
    if (this.scrapItemForm.get('LstScrapItemsDetails')?.value[index].ScrapQuantity == 0) {
      this.IsButtonShow = true;
    }
    else if (this.scrapItemForm.get('LstScrapItemsDetails')?.value[index].ScrapQuantity > this.scrapItemForm.get('LstScrapItemsDetails')?.value[index].TotalQuantity) {
      ScrapQuantityCountControl?.setValue(this.scrapItemForm.get('LstScrapItemsDetails')?.value[index].TotalQuantity);
      this.IsButtonShow = false;
    }
    else {
      ScrapQuantityCountControl?.setValue(this.scrapItemForm.get('LstScrapItemsDetails')?.value[index].ScrapQuantity);
      this.IsButtonShow = false;
    }
    const ScrapQuantity = this.scrapItemForm.get('LstScrapItemsDetails')?.value[index].ScrapQuantity;
    const IssueMultiplier = this.scrapItemForm.get('LstScrapItemsDetails')?.value[index].IssueMultiplier;
    ScrapUnitsCountControl?.setValue(ScrapQuantity * IssueMultiplier)
    let ItemCalculation = this.ScrapItemslist.at(index)
    ItemCalculation.patchValue({
      TotalAmount: ItemCalculation.value.ScrapQuantity * ItemCalculation.value.UnitPrice
    })
  }
  /**
 * this event used to change the search
 * @param event 
 */
  changeSearch(event: any) {
    this.PageNumber = 1;
    this.RowCount = 40;
    this.modelChanged.next(event.target.value);
  }
  /**
   * this event used to change pagenumber
   * @param event 
   */
  ChangePageNumber(event: any) {
    this.PageNumber = event;
    this.GetScrapItemsItems();
  }
  /**
   * This event used to change the row count
   * @param event 
   */
  ChangeEvent(event: any) {
    this.PageNumber = 1;
    this.RowCount = event.target.value
    this.GetScrapItemsItems();
  }
  ClosePopup() {
    this.ReceivedItems = [];
    this.Location = [];
    this.ScrapItems = [];
    this.ScrapItemslist.reset();
    this.scrapItemForm.reset();
    this.itemunits = '';
    this.Items = [];
    this.inItForms();
  }
  async GetScrapItemDetails(ScrapName : any = null) {
    try {
      const Scrapvalue = `${ScrapName?.ScrapNumber?.toString()}`;
      const result = await this.itemService.GetScrapItemsDetails(Scrapvalue).toPromise();
      this.PODetails = result.Result;
      this.TotalCount = this.PODetails[0]?.TotalCount;      
    } catch (error) {
      console.error("Error fetching scrap item details", error);
    }
  }
  async DownloadPdf(data: any, print: any) {
   await this.GetScrapItemDetails(data);
    let item: any = this.PODetails.filter((scrap: any) => scrap.ScrapNumber == data.ScrapNumber)
    console.log("items",item);

    let html = "";
    html = this.UnparsedHtml;
    let array = 0;
    for (let data of item) {
      const netTotal = parseFloat(data.BuyPrice);
      const totalQuantity = parseFloat(data.ScrapQuantity);
      if (!isNaN(netTotal) && !isNaN(totalQuantity)) {
        array += (netTotal * totalQuantity);
      }
    }
    const replacements: any = {
      '%%TotalAmount%%':array,
      '%%CreatedBy%%' :item[0].ScrapByUserName,
      '%%ApprovedUserName%%':data.ApprovedByName?data.ApprovedByName:'N/A'
    };
    for (const key in replacements) {
      html = html.replace(key, replacements[key]);
    }
    let dochtml: any = '';
    dochtml = new DOMParser().parseFromString(html, 'text/html');
    let PODetails: any = dochtml.querySelector('#GRNItemDetails');
    if (PODetails) {
      PODetails.innerHTML = '';
      for (let i = 0; i < item.length; i++) {
        let updatedTemplate: any = '';
        updatedTemplate = this.UnparsedHtml
          .replace('%%Scrapnumber%%', item[i].ScrapNumber || '')
          .replace('%%ItenName%%', item[i].ItemName)
          .replace('%%VendorItemName%%', item[i].VendorItemName?item[i].VendorItemName:'N/A')
          .replace('%%BatchNumber%%', item[i].BatchNumber || '')
          .replace('%%Scrapamount%%', item[i].BuyPrice * item[i].ScrapQuantity || '')
          .replace('%%ScrapQauntity%%', item[i].ScrapQuantity)
          .replace('%%ScrapUnit%%', item[i].ScrapUnits)
          .replace('%%ReasonForScrap%%', item[i].ScrapReason)
          .replace('%%ScrapByName%%', item[i].ScrapByUserName)
          .replace('%%Location%%', item[i].Location)
          // .replace('%%Approvedby%%', item[i].ApprovedByName?item[i].ApprovedByName:'N/A')

        let jobElement: any = '';
        jobElement = new DOMParser().parseFromString(updatedTemplate, 'text/html').querySelector('#GRNItemDetails');
        PODetails.appendChild(jobElement);
      }
      html = dochtml.documentElement.outerHTML;
    }
    const options = {
      filename: `Scrap item-print.pdf`,
      margin: 0.1,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 1 },
      jsPDF: { unit: 'in', format: 'a3', orientation: 'landscape' }
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
  scrapApproval(){
    this.ScrapItemslist.reset()
    let item: any = this.AproveItemlist;
      item.forEach((element: any) => {
        this.ScrapItemslist.push(this.fb.group({
          BatchNumber: element.BatchNumber,
          ScrapQuantity: element.AproveQuantity,
          ScrapUnits: element.ScrapUnits,
          ReceivedQuantity: element.ReceivedQuantity,
          LocationGuid: '',
          ItemGuid: '',
          StockGuid: element.StockGuid,
          IndentIssueGuid: element.IndentIssueGuid,
          MechineName: '',
          ItemName: element.ItemName,
          TotalQuantity: '',
          ScrapReason: element.ScrapReason,
          IssueMultiplier: '',
          IsSelectItem: true,
          TotalAmount:  element.totalAmount,
          UnitPrice:'',
          ScrapGuid:element.ScrapGuid,
        }))
      });
      this.scrapItemForm.patchValue({
        fromApproval:true,
        IsStore:item[0].IsStore,
        ScrapNumberS:item[0].ScrapNumber
      })
      //FormValueTrimeer.cleanForm(this.scrapItemForm); 
      this.scrapItemForm.value.LstScrapItemsDetails = this.ScrapItemslist.value.filter((control: any) => control.IsSelectItem === true).map((control: any) => control);
      this.indentService.SaveScrapItemDetails(this.scrapItemForm.value).subscribe(
        (data) => {
          this.shimmerVisible = false;
          this.LocationGuid = '';
          this.GetScrapItemsItems();
        },       
        (err) => {
          this.shimmerVisible = false;
        })
    }
    async SetscrapItems(event:any,item1:any){
      await this.GetScrapItemDetails(item1);
      this.AproveItemlist=[];
      this.AproveItemlist = this.PODetails.filter((i:any) => i.ScrapNumber === item1.ScrapNumber).map((item: any) => {
        return { ...item, AproveQuantity:item.InHandQty>item.ScrapQuantity?item.ScrapQuantity:item.InHandQty,ScrapUnits:item.ScrapUnits/item.ScrapQuantity*item.InHandQty>item.ScrapQuantity?item.ScrapQuantity:item.InHandQty };
      });
      this.isdisable = this.AproveItemlist.reduce((total: any, item: { InHandQty: any; }) => total + item.InHandQty, 0) === 0;
    }
    openXlModal(content: TemplateRef<any>, size:any) {
      this.modalService.open(content, { size: size }).result.then((result) => {
        console.log("Modal closed" + result);
      }).catch((res) => { });
    }

   downloadExcel() {
    const fromDateParts = this.scrapFromDate.split('-');
      const toDateParts = this.scrapEndDate.split('-');
      const formattedFromDate = this.scrapEndDate != "" ?fromDateParts[2] + '-' + fromDateParts[1] + '-' + fromDateParts[0] : null;
      const formattedToDate = this.scrapEndDate != "" ? toDateParts[2] + '-' + toDateParts[1] + '-' + toDateParts[0]:null;
      const headline2Content = 'Period From: ' + formattedFromDate + ' Period To: ' + formattedToDate;
    const header = [ 'Scrap Number','Items count','Scrap amount','Scrap Qauntity','Scrap Unit','Scrap By Name','Approved by','Scrap Date','Location'];
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('Sharing Data');
    worksheet.addRow(["SCRAP ITEMS"])
    worksheet.addRow([headline2Content])
    worksheet.addRow([])
    const headerRow = worksheet.addRow(header);
    headerRow.eachCell((cell, number) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFFF00' },
        bgColor: { argb: 'FF0000FF' }
      };
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    });
    worksheet.getColumn(1).width = 30;
    worksheet.getColumn(2).width = 20;
    worksheet.getColumn(3).width = 30;
    worksheet.getColumn(4).width = 30;
    worksheet.getColumn(5).width = 15;
    worksheet.getColumn(6).width = 30;
    worksheet.getColumn(7).width = 20;
    worksheet.getColumn(8).width = 20;
    worksheet.getColumn(9).width = 40;
    //worksheet.addRow([]);
    this.filterdScrapItems.forEach((item: any) => {
      const row = worksheet.addRow([
        item.ScrapNumber,
        item.itemCount,
        item.TotalAmountSum,
        item.totalScrapQuantity,
        item.totalScrapUnits,
        item.ScrapByUserName,
        item.ApprovedByName?item.ApprovedByName:'N/A',
        this.datepipe.transform(item.ScrapDate,'dd-MM-yyyy'),
        item.Location
      ]);
    });
    const fileName = 'ScrapList-print.xlsx';
    this.Isprint=false;
    workbook.xlsx.writeBuffer().then((data: any) => {
      const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, fileName);
      this.PageNumber=1;
      this.GetScrapItemsItems();
    });
  }
  GetScrapExcel(){
    this.Isprint=true
    this.PageNumber=-1;
    this.GetScrapItemsItems();
  }
  ClearFilter() {
    this.removeFromDate = '';
    this.removeTodate = '';
    this.Keyword=''
    this.scrapFromDate='';
    this.scrapEndDate='';
    this.GetScrapItemsItems();
  }
  selectFromDate(event: any) {
    this.removeTodate = null
    this.scrapFromDate = event.year + "-" + event.month + "-" +  event.day;
      this.GetScrapItemsItems();
  }
  selectToDate(event: any) {
    // this.minDate = event
    this.scrapEndDate = event.year + "-" + event.month + "-" +  event.day;
    this.GetScrapItemsItems()
  }
}
