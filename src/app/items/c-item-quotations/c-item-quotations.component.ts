import { Component, Input, OnInit, TemplateRef } from '@angular/core';
import { QuotationService } from 'src/app/core/Services/quotation.service';
import { Router } from '@angular/router';
import { GlobalService } from 'src/app/core/Services/global.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as html2pdf from 'html2pdf.js';
@Component({
  selector: 'app-c-item-quotations',
  templateUrl: './c-item-quotations.component.html',
  styleUrls: ['./c-item-quotations.component.scss']
})
export class CItemQuotationsComponent implements OnInit {
  IsShow: boolean = true;
  quotationsList: any = [];
  quotationGuid: any = [];
  quotationDetails: any = [];
  locationsList: any = [];
  allItemsList: any = [];
  supplierGuid: any = [] = [];
  itemGuid: any = [] = [];
  locationGuid: any = [] = [];
  keyWords: string = "";
  fromDate: string = '';
  toDate: string = '';
  totalCount: any;
  defaultData: any = [];
  locations: any = [];
  supplierDetails: any = [];
  supplierList: any = [];
  pageNumber: number = 1;
  pageSize: number = 40;
  orderBy: string = "";
  sortType: string = 'desc';
  approved: boolean = false;
  checked: boolean = false;
  created: boolean = false;
  deliveryState: any;
  deliveryLocationName: any;
  supplierStateName: any;
  allItems: any = [];
  itemsList: any = [];
  quotationguid: any;
  status: boolean;
  userGuid: any = null;
  @Input()  itemQuotationData : any[];
  UnparsedHtml: string = '<!DOCTYPE html><html lang="en"> <head> <meta charset="UTF-8"/> <meta http-equiv="X-UA-Compatible" content="IE=edge"/> <meta name="viewport" content="width=device-width,initial-scale=1"/> <title>Supplier Quotation</title> <style>table{border-collapse: collapse; border: 1px solid #000;}table td, table th{border-bottom: 1px solid #000; border-right: 1px solid #000; padding: 5px; text-align: left; word-wrap: break-word; word-break: break-all; font-size: 10px;}table tr:last-child td{border-bottom: none;}p{margin: 0;}</style> </head> <body> <table style="table-layout: fixed; background-color: #ccc;" width="100%"> <tbody> <tr> <td style="font-weight: 700; font-size: 24px; text-align: center;">Supplier Quotation</td></tr></tbody> </table> <table style="table-layout: fixed; background-color: #ccc;" width="100%"> <tbody> <tr> <td style="font-size: 14px;"><b>Quotation No: </b>%%QuotationNo%%</td></tr></tbody> </table> <table style="table-layout: fixed; background-color: #ccc;" width="100%"> <tbody> <tr> <td style="font-size: 14px;"><b>Supplier Name:</b> %%SupplierName%%</td><td style="font-size: 14px;"><b>GST No:</b> %%SupplierGSTIN%%</td></tr></tbody> </table> <table style="table-layout: fixed;" width="100%"> <tbody> <tr> <td style="font-size: 14px; color: red;"><b>Center: </b>%%CenterName%%</td><td style="font-size: 14px; color: red;"><b>Location: </b>%%CenterLocation%%</td></tr></tbody> </table> <table style="table-layout: fixed;" width="100%"> <thead> <tr> <th>S. No.</th> <th>Item</th> <th>HSN Code</th> <th>Catalog No.</th> <th>Manufacture</th> <th>Rate</th> <th>Qty</th> <th>Disc %</th> <th>IGST %</th> <th>SGST %</th> <th>CGST %</th> <th>Amount</th> </tr></thead> <tbody> <tr id="supllierQuotation"> <td>%%ItemSNo%%</td><td>%%ItemName%%</td><td>%%ItemHSN%%</td><td>%%ItemCatalog%%</td><td>%%ItemManufacture%%</td><td>%%ItemRate%%</td><td>%%ItemQty%%</td><td>%%ItemDisc%%</td><td>%%ItemIGST%%</td><td>%%ItemSGST%%</td><td>%%ItemCGST%%</td><td>%%ItemAmount%%</td></tr></tbody> </table> <table style="table-layout: fixed;" width="100%"> <tbody> <tr> <td style="font-weight: 700; font-size: 12px; text-align: right;">Total Amount in INR : %%totalINRAmount%%</td></tr><tr> <td style="font-size: 12px;"><b>Total Amount In Word:</b> %%AmountinWords%%</td></tr><tr> <td style="font-size: 12px;"><b>Total QTY In Word:</b> %%QTYinWords%%</td></tr><tr> <td style="font-size: 12px; color: red;"><b>Terms & Conditions</b></td></tr><tr id="termsandconditionsdata"> <td style="font-size: 10px;">%%Terms%%</td></tr></tbody> </table> </body></html>'
  termsCondition: any = [];

  constructor(private modalService: NgbModal, private quotationService: QuotationService, private route: Router, private globalService: GlobalService) 
  {
   }

  ngOnInit(): void {
   //this.getAllQuotationDetails()
  }

  // getQuotations():any {
  // }


  openXlModal(content: TemplateRef<any>) {
    this.modalService.open(content, { size: 'xl' }).result.then((result) => {
      console.log("Modal closed" + result);
    }).catch((res) => { });
  }

  /**
   * 
   * @param row 
   * this method is used for getAllQuotationDetails
   */
  getAllQuotationDetails() {
    this.globalService.startSpinner();
    this.quotationService.getAllQuotations(this.supplierGuid, this.itemGuid, this.locationGuid, this.keyWords, this.fromDate, this.toDate, this.pageNumber, this.pageSize, this.orderBy, this.sortType, this.created, this.checked, this.approved).subscribe(data => {
      this.quotationsList = data.allQuotations
      this.globalService.stopSpinner();
      this.totalCount = data.TotalCount
      if (this.supplierGuid.length > 0 || this.itemGuid.length > 0 || this.fromDate ||this.toDate ) {
        if (this.locationGuid.length == 0) {
          this.locationsList = []
          this.quotationsList.forEach((obj: any) => {
            this.locations = this.defaultData.Result.LstQuotationCenterLocationType.filter((f: { CenterLocationGuid: any }) => f.CenterLocationGuid == obj.DeliveryLocationGuid)
            this.locationsList.push(...this.locations)
            this.locations = this.locationsList.filter((value: any, index: any, self: any) => {
              return self.indexOf(value) === index;
            })
            this.getQuotationByGuid('')
          })
        }
      } else {
        this.locations = this.defaultData.Result.LstQuotationCenterLocationType
      }
      if (this.locationGuid.length > 0 || this.itemGuid.length > 0 || this.fromDate || this.toDate) {
        if (this.supplierGuid.length == 0) {
          this.supplierList = []
          this.quotationsList.forEach((obj: any) => {
            this.supplierDetails = this.defaultData.Result.LstQuotationSupplierType.filter((f: { SupplierGuid: any }) => f.SupplierGuid == obj.SupplierGuid)
            this.supplierList.push(...this.supplierDetails)
            this.supplierDetails = this.supplierList
            this.supplierDetails = this.supplierDetails.filter((value: any, index: any, self: any) => {
              return self.indexOf(value) === index;
            })
          })
        }
      } else {
        this.supplierDetails = this.defaultData.Result.LstQuotationSupplierType
      }
      this.getQuotationByGuid('')
    })
  }

  /**
   * 
   * @param row 
   * this method is used for getQuotationByGuid
   */
  getQuotationByGuid(row: any) {
    this.quotationGuid = []
    this.deliveryState=row.DeliveryStateName
    this.deliveryLocationName=row.DeliveryLocationName
    this.supplierStateName= row.SupplierSateName
    if (row.QuotationGuid != undefined) {
      this.quotationGuid = row.QuotationGuid
    }else{
      if (this.supplierGuid.length > 0 || this.locationGuid.length > 0) {
        this.quotationsList.forEach((Quotation: any) => {
          this.quotationGuid.push(Quotation.QuotationGuid)
        })
      }
    }   
    this.quotationService.getQuotationsByGuid(this.quotationGuid).subscribe(data => {
      this.quotationDetails = data.getQuotationsResponses
      if (this.supplierGuid.length > 0 || this.locationGuid.length > 0  || this.fromDate || this.toDate) {
        if (this.itemGuid.length == 0) {
          this.allItemsList = []
          this.quotationDetails.forEach((obj: any) => {
            this.allItems = this.itemsList.Result.filter((f: { ItemGuid: any }) => f.ItemGuid == obj.ItemGuid)
            this.allItemsList.push(... this.allItems)
            this.allItems = this.allItemsList.filter((value: any, index: any, self: any) => {
              return index === self.findIndex((t:any) => (
                t.ItemGuid === value.ItemGuid
              ));
            })
          })
        }
      } else {
        this.allItems = this.itemsList.Result  
        this.allItems =this.allItems.filter((value: any, index: any, self: any) => {
          return index === self.findIndex((t:any) => (
            t.ItemGuid === value.ItemGuid || t.ItemName === value.ItemName
          ));
        })   
      }  
    })
  }

  onUpdateStatus(QuotationGuid: any, Status: any) {
    this.quotationguid = QuotationGuid
    this.status = Status
    this.updateQuotationStatus()
  }

  updateQuotationStatus() {
    let input = {
      QuotationGuid: this.quotationguid,
      UserGuid: this.userGuid,
      ApprovalStatus: this.status
    }
    this.quotationService.updateQuotationsData(input).subscribe(data => {
      let updateData = data
      this.getAllQuotationDetails()
    })
  }

  DownloadPdf(quotation: any,print:any) {
    let totalPrice = 0  
    let html="";
    html=this.UnparsedHtml;
    this.quotationService.getQuotationsByGuid(quotation.QuotationGuid).subscribe(data => {
      this.quotationDetails = data.getQuotationsResponses
      this.termsCondition = data.getTermsConditions
      let count = this.quotationDetails.length
      for (let qou of this.quotationDetails) {
        totalPrice += qou.BuyPrice;
      } 
      let myInt = Math.round(totalPrice);
      const numWords = require('num-words')
      const amountInWords = numWords(myInt)
      const numbWords = require('num-words')
      const numberInWords = numbWords(count)

      if (this.quotationDetails.length > 0) {
        const replacements: any = {
          '%%QuotationNo%%': this.quotationDetails[0].QuotationNo || '',
          '%%SupplierName%%': this.quotationDetails[0].SupplierName || '',
          '%%SupplierGSTIN%%': this.quotationDetails[0].GSTNNo || '',
          '%%CenterName%%': quotation.DeliveryCentername || '',
          '%%CenterLocation%%': quotation.DeliveryLocationName || '',
          '%%totalINRAmount%%': totalPrice || '',
          '%%AmountinWords%%': amountInWords || '',
          '%%QTYinWords%%': numberInWords || '',
        };
        for (const key in replacements) {
          html = html.replace(key, replacements[key]);
        }

        let dochtml: any = '';
        dochtml = new DOMParser().parseFromString(html, 'text/html');
        let supllierQuotation: any = dochtml.querySelector('#supllierQuotation');

        if (supllierQuotation) {
          supllierQuotation.innerHTML = '';
          for (let i = 0; i < this.quotationDetails.length; i++) {
            let updatedTemplate: any = '';
            updatedTemplate = this.UnparsedHtml
              .replace('%%ItemSNo%%', this.quotationDetails[i].ItemId)
              .replace('%%ItemName%%', this.quotationDetails[i].ItemName)
              .replace('%%ItemHSN%%', this.quotationDetails[i].HSNCode)
              .replace('%%ItemCatalog%%', this.quotationDetails[i].CatalogNo)
              .replace('%%ItemManufacture%%', this.quotationDetails[i].ManufactureName)
              .replace('%%ItemRate%%', this.quotationDetails[i].Rate)
              .replace('%%ItemQty%%', this.quotationDetails[i].Qty)
              .replace('%%ItemDisc%%', this.quotationDetails[i].DiscountPer)
              .replace('%%ItemIGST%%', this.quotationDetails[i].IGSTPer)
              .replace('%%ItemSGST%%', this.quotationDetails[i].SGSTPer)
              .replace('%%ItemCGST%%', this.quotationDetails[i].CGSTPer)
              .replace('%%ItemAmount%%', this.quotationDetails[i].BuyPrice)

            let jobElement: any = '';
            jobElement = new DOMParser().parseFromString(updatedTemplate, 'text/html').querySelector('#supllierQuotation');
            supllierQuotation.appendChild(jobElement);
          }
        }
        let termsandcondition: any = dochtml.querySelector('#termsandconditionsdata');

        if (termsandcondition) {
          termsandcondition.innerHTML = '';
          for (let j = 0; j < this.termsCondition.length; j++) {
            let updatedTemplate1: any = '';
            updatedTemplate1 = this.UnparsedHtml
              .replace('%%Terms%%', this.termsCondition[j].TermsCondition)

            let term: any = '';
            term = new DOMParser().parseFromString(updatedTemplate1, 'text/html').querySelector('#termsandconditionsdata');
            termsandcondition.appendChild(term);
          }
        }
        html = dochtml.documentElement.outerHTML;
        const options = {
          filename: `supplier-quotation.pdf`,
          margin: 0.2,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 1 },
          jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
        };
        const element = html;
        if(print!=""){
          html2pdf().from(element).set(options).outputPdf('datauristring').then((pdfAsString:any) => {
            // Open the PDF in a new window for printing 
            const printWindow:any = window.open();
             printWindow.document.write('<html><head><title>Print</title></head><body style="margin:0;padding:0"><embed width="100%" height="100%" src="' + pdfAsString + '" type="application/pdf" /></body></html>');
              printWindow.document.close(); 
              printWindow.focus(); 
             // Print the PDF after a short delay 
             setTimeout(() => { 
             printWindow.print(); 
           }, 250); 
           });
        }else{
          html2pdf().from(element).set(options).save();
        }
      }
    })
  }

}
