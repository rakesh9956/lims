import { HttpErrorResponse } from '@angular/common/http';
import { Component, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ColumnMode, DatatableComponent } from '@swimlane/ngx-datatable';
import { debounceTime, Subject } from 'rxjs';
import { PurchaseOrderService } from 'src/app/core/Services/purchase-order.service';
import * as html2pdf from 'html2pdf.js';
import { AuthenticationService } from 'src/app/core/Services/authentication.service';
import {NgbDateParserFormatter} from '@ng-bootstrap/ng-bootstrap';
import {CustomDateParserFormatter} from 'src/app/core/Services/ngbdate-format.service'
import { DatePipe } from '@angular/common';
import { QuotationService } from 'src/app/core/Services/quotation.service';
import { FormBuilder, Validators } from '@angular/forms';
import * as moment from 'moment';
import * as _ from 'lodash';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
@Component({
  selector: 'app-all-purchase-orders',
  templateUrl: './all-purchase-orders.component.html',
  styleUrls: ['./all-purchase-orders.component.scss'],
  providers: [
    { provide: NgbDateParserFormatter, useClass: CustomDateParserFormatter },
  ],
})
export class AllPurchaseOrdersComponent {
  [x: string]: any;
  @ViewChild(DatatableComponent) table: DatatableComponent;

  /*** Paginatin Option Starts ***/
  maxSize: number = 3;
  TodayDate :  any;
  TransectionDate : any;
  PurchaseOrderNumber : any;
  boundaryLinks: boolean = true;
  size: string = 'lg';
  fileUrl : any;
  /*** Paginatin Option Starts ***/
  fileToUpload: any;
  shimmerVisible: boolean;
  rows: any[] = [];
  temp: any[] = [];
  UnparsedHtml: any ='<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Purchase Order Report</title><style>table{border-collapse:collapse;border:1px solid #000}table td,table th{border-bottom:1px solid #000;border-right:1px solid #000;padding:5px;text-align:left;word-wrap:break-word;word-break:break-all;font-size:10px}table tr:last-child td{border-bottom:none}p{margin:0}</style></head><body><table style="text-align:center;table-layout:fixed" width="100%"><tbody><tr><td><div style="height:28px;display:flex;align-items:center;padding:20px 0"><img data-v-0e549244="" src="data:image/png;base64,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" alt="Yoda LIMS"></div></td></tr></tbody></table><table style="table-layout:fixed" width="100%"><tbody><tr><td style="font-weight:700;font-size:20px;text-align:center">Purchase Order</td></tr></tbody></table><table style="table-layout:fixed" width="100%"><tbody><tr><td style="font-size:14px"><b>PO No:</b>%%PurchaseOrderNo%%</td><td style="font-size:14px"><b>PO Date:</b>%%POCreatedDate%%</td></tr></tbody></table><table style="table-layout:fixed" width="100%"><tbody><tr><td style="font-weight:700;font-size:14px">Ordered By</td><td rowspan="2" style="font-weight:700;font-size:14px">Vendor details</td></tr><tr><td style="font-weight:700;font-size:14px"><b>Yoda Lifeline Diagnostics Pvt Ltd</b></td></tr><tr><td style="font-size:14px"><p><b>Address:</b>%%StoreLocationAddress%%</p><p><b>Contact:</b>%%ContactPersonNo%%</p><p><b>GST:</b>%%GSTNNO%%</p></td><td style="font-size:14px"><p><b>Vendor name:</b>%%SupplierName%%<p><b>Vendor address:</b>%%Address%%</p><p><b>Contact person:</b>%%PrimaryContactPerson%%</p><p><b>Vendor mobile:</b>%%PrimaryContactPersonMobileNo%%,%%SecondaryContactPersonMobileNo%%</p><p><b>Vendor email:</b>%%VendorEmailId%%</p><p><b>GST:</b>%%GSTIN%%</p></td></tr><td style="font-size:14px"><b>Bill to address</b></td><td style="font-size:14px"><b>Ship to address</b></td><tr><td style="font-size:14px"><p><b>Name:</b>%%CenterName%%</p><p><b>Address:</b>%%BillStoreLocationAddress%%</p><p><b>Contact person:</b>%%BillingContactPerson%%</p><p><b>Mobile:</b>%%BillingMobileNo%%</p><p><b>Email:</b>%%BillingPersonEmail%%</p><p><b>GST:</b>%%BillLocationGST%%</p></td><td style="font-size:14px"><p><b>Name:</b>%%ShippingCenterName%%</p><p><b>Address:</b>%%ShipStoreLocationAddress%%</p><p><b>Contact person:</b>%%shipingContactPerson%%</p><p><b>Mobile:</b>%%ShipingMobileNo%%</p><p><b>Email:</b>%%ShipingPersonEmail%%</p><p><b>GST:</b>%%ShipLocationGST%%</p></td></tr><tr><td style="font-size:14px"><b>Supplier state:</b>%%SupplierState%%</td><td style="font-size:14px"></td></tr></tbody></table><table style="table-layout:fixed" width="100%"><thead><tr><th width="27">S. No.</th><th width="120">Item name/Item code</th><th width="120">Vendor Item Name</th><th width="54">Cat No.</th><th width="54">MFD</th><th width="30">Unit</th><th width="25">Pack size</th><th width="30">Qty</th><th width="54">Unit price</th><th width="30">Disc %</th><th width="20">GST %</th><th width="54">GST amnt.</th><th width="60">Amnt</th></tr></thead><tbody><tr id="PurchaseOrderItemDetails"><td>%%S.NO%%</td><td>%%ItemName%%</td><td>%%VendorItemName%%</td><td>%%CatalogNo%%</td><td>%%ManufactureName%%</td><td>%%MinorUnitName%%</td><td>%%PackSize%%</td><td>%%OrderedQty%%</td><td>&#8377; %%BuyPrice%%</td><td>%%DiscountPer%%</td><td>%%CGST+SGST+UGST%%</td><td>&#8377; %%TaxAmount%%</td><td>&#8377; %%NetAmount%%</td></tr><tr><td colspan="12" style="font-size:12px;text-align:right">Total amount in INR : %%TotalPrice%%</td></tr></tbody></table><table style="width:100%;margin-top:5px"><tbody><tr><td>Created by: %%CreatedBy%%</td><td>Checked by: %%CheckedByName%%</td><td>Approved by: %%AppprovedByName%%</td><td>Recalled by: %%RecallByName%%</td><td>Cancelled by: %%CancelledBy%%</td></tr></tbody></table><table style="width:100%;margin-top:5px"><tbody><tr><td><strong>Payment Term :</strong><strong>%%PaymentTerm%%<strong></strong><br><strong>Delivery term :</strong><strong>%%Deliveryterm%%</strong></td></tr></tbody></table><table style="table-layout:fixed;border:none;margin-top:30px" width="100%"><tbody><tr><td style="font-size:14px;border:none;padding:0;text-align:right"><b>Date:</b>%%PurchaseOrderDownloadDate%%</td></tr><tr><td style="font-size:14px;border:none;padding:0;text-align:right">This is a computer generated document, hence signature is not required.</td></tr></tbody></table></body></html>';
  ColumnMode = ColumnMode;
  sort: string = 'desc';
  pageNumber: any = 1;
  rowCount: any = 40;
  itemOrder: any
  Keyword: string = '';
  AllPurchaseOrderDetails: any=[];
  modelChanged = new Subject<string>();
  filteredData: any;
  PurchaseOrderName: any;
  purchaseOrderGuid: any;
  TotalCount: any;
  itemsPerPage: any = 40;
  itemOptionsPerPage = [40, 80, 120, 160, 200, 240, 280, 320];
  isMenuCollapsed = true;
  roles: any;
  ApprovalRole: any;
  purchaseOrderDetails: any = [];
  PurchaseOrderItemDetails: any = []
  formattedDate: any;
  DepotmentGuid: any;
  Approvalroles: any;
  CenterLocation: any=[];
  reason:string ='';
  locationGuid: any='';
  ShippingLocation: any;
  location: any;
  DeleteQuotation:any;
  status: boolean;
  PaymentDetailForm: any;
  SupplierName:any;
  quotationDetails:any=[];
  SupplierStateName:any;
  locationList:any
  quotationGuid: any=[];
  deliveryState: any;
  deliveryLocationName: any;
  supplierGuid: any=[]=[];
  quotationsList: any=[];
  QuotationGuid:any;
  fromDate: string='';
  toDate: string ='';
  ReasonQuotationNo:any;
  purchaseOrderGuiddata:any=''
  statusdata:any=''
  itemGuid: any=[]=[];
  Isurgent:boolean=false;
  QuotationReason:boolean=false;
  showIcon:boolean=false
  isvalid : boolean=false
  defaultData: any;
  locations: any=[];
  filter:string='';
  filterOptions: any = ['Maker','Checked','Approved','Recall','Cancelled','All'];
  selectedStatus:any='';
  IsChangeQuotation:boolean;
  VendorId:any
  PoDate:any=''
   role:any
   recallReason: string = '';
   body: any = {
    PurchaseOrderGuid: '',
    ApprovalType: '',
    Reason: '',
    UserGuid: '',
    ApprovalPhoneNumber: '',
    ApprovalEmail: '',
    ApprovalName: '',
    ApprovalReason:'',
    CheckedReason:'',
    ApproveReason:'',
    POAttachmentURL:''
  };
  PoAttachmentURL:string =''

  copiedScreenshot: string | ArrayBuffer | null = null;
  constructor(private modalService: NgbModal,
    private purchaseOrderService: PurchaseOrderService,
    private fb: FormBuilder,
    private router: Router, private quotationService: QuotationService,public authservice: AuthenticationService,
    private datepipe:DatePipe,
    private authenticationService: AuthenticationService
  ) {
    this.fetch((data: any) => {
      this.temp = data;
      this.rows = data;
      // setTimeout(() => {
      //   this.loadingIndicator = false;
      // }, 1500);
    });
    this.modelChanged
      .pipe(debounceTime(1000))
      .subscribe(model => {
        this.Keyword = model;
        this.GetAllPurchaseOrderDetails();
      })
  }

  captureScreenshot() {
    // Here implement your code to capture the screenshot
    // This could involve using libraries like html2canvas or any other method
    
    // For demonstration purpose, I'm just setting a base64 encoded string as screenshot
    this.copiedScreenshot = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/4QCMRXhpZgAATU0AKgAAAAgAA1IBAAAAIAAAAPgAAAQgCAAABAAAAPgEAAAMAAAABAAYAAAEAAAD/2wBDAAoHBwkHBgoJCAkLCwoMDxkQDw4ODx4WFxIZJCAmJSMgIyIoLTkwKCo2KyIjMkQyNjs9QEBAJjBGS0U+Sjk/QD3/2wBDAQsLCw8NDx0QEB09KSMpPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT3/wAARCAABAAEDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD7/8wBJaKACgAAAAAFNACgAMAAAAAAA1AEoABQAAAAAKADUAFAAAAAAA1AEoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD//2Q==';
  }

  copyScreenshot() {
    if (this.copiedScreenshot) {
      this.clipboardService.copyFromContent(this.copiedScreenshot.toString());
    }
  }

  RemoveImage(){
    this.fileUrl = "";
    console.log("ahaha")
    const editableDiv = document.getElementById("editableDiv");
    if (editableDiv) {
        editableDiv.innerHTML = ""; // or innerHTML = ""
        editableDiv.style.color = "#adb7c1";
        editableDiv.setAttribute("contenteditable", "true");
        editableDiv.classList.add('PasteContent')
    }
    this.PaymentDetailForm?.patchValue({imageUrl : this.fileUrl})
  }

  textValues(){
    const editableDiv = document.getElementById("editableDiv");
    if (editableDiv){
      if (editableDiv && editableDiv.innerText) {
        editableDiv.innerText = '';
      }else{
        editableDiv.classList.add('PasteContent')
      }
    }
  }

  pasteImage(event: any) {
    console.log(event)
    const pastedImage = event.clipboardData.files[0];
    this.fileToUpload = pastedImage;
    const formData: FormData = new FormData();
    var fileName = this.fileToUpload?.name;
    fileName = fileName.substring(0, fileName.lastIndexOf('.'));
    formData.append('File', this.fileToUpload, this.fileToUpload?.name);
    formData.append('FileName', ("").concat(this.fileToUpload.name));
    this.purchaseOrderService.Uploadfiles(formData).subscribe((data: any) => {
      this.fileUrl = data?.result;
      const editableDiv = document.getElementById("editableDiv");
      if (editableDiv) {
        editableDiv.innerText = "file Uploaded";
          editableDiv.classList.remove('PasteContent')
        editableDiv.style.color = "#1bbd09";
        editableDiv.setAttribute("contenteditable", "false");
      }
      this.PaymentDetailForm.patchValue({ imageUrl: data?.result?.toString() });
    },
    
      (err: any) => {
      });
  }

  ngOnInit(): void {
    this.UserGuid = localStorage.getItem('UserGuid')
    let type = localStorage.getItem("Type");
    console.log(type, "type")
    if(type == "Purchase Orders"){
      let pageNum = localStorage.getItem("pageNumber");
      this.pageNumber = pageNum ? parseInt(pageNum) : 1;
      console.log(pageNum, "pageNum", this.pageNumber);
      let PageCount = localStorage.getItem("PerPage");
      this.itemsPerPage = PageCount ? parseInt(PageCount) : 40;
      this.rowCount = PageCount ? parseInt(PageCount) : 40;
      localStorage.removeItem("Type");
      localStorage.removeItem("pageNumber");
      localStorage.removeItem("PerPage");
    }
    const currentDate = new Date();
     const date = moment(currentDate , "DD-MM-yyyy")
    this.TodayDate = { year: +moment(currentDate).format('YYYY'), month: +moment(currentDate).format('MM'), day: +moment(currentDate).format('DD') };;
    this.formattedDate = this.datepipe.transform(currentDate, 'dd-MMM-yyyy hh:mm a');
    if (window.outerWidth < 480) {
      this.maxSize = 2;
      this.boundaryLinks = false;
      this.size = 'sm';
    }
    this.roles = this.authservice.LoggedInUser.POROLES
    this.paymentRole=this.authservice.LoggedInUser.paymentRoles
    this.role= this.authservice.LoggedInUser.DEFAULTROLES.toLowerCase().includes('ADMIN'.toLowerCase())
    let lstOfRoles = this.authservice.LoggedInUser.POROLES.split(',')
   this.Approvalroles= lstOfRoles.filter((roles:any)=>roles=='Approval')
    this.GetAllPurchaseOrderDetails();
    this.GetLocationsAndSuppliersByDefault();
    this.initForms();
  }
  initForms(): void {
    this.PaymentDetailForm = this.fb.group({
      purchaseOrderGuid:null,
      BankName: ["",[Validators.required]],
      TransectionID: [null,[Validators.required]],
      InvoiceNumber:[null,[Validators.required]],
      TransectionDate: [null, [Validators.required]],
      Modeofpayment: ["",[Validators.required]],
      Remarks: ["",[Validators.required]],
      PoNumber:[],
      TotalAmount:[],
      Dueamount:[],
      PaidAmount:["",[Validators.required]],
      DueAmount:[],
      status : [""],
      imageUrl : ["",[Validators.required]],
    });
  }

  /**
   * this method used to add invoice documents
   * @param $event
   */

  markAsTouched(controlName: string) {
    this.PaymentDetailForm.get(controlName)?.markAsTouched();
  }
  UplodeInvoice(event: any) {
    this.fileToUpload = event.srcElement.files[0];
    const formData: FormData = new FormData();
    var fileName = this.fileToUpload.name;
    fileName = fileName.substring(0, fileName.lastIndexOf('.'));
    formData.append('File', this.fileToUpload, this.fileToUpload.name);
    formData.append('FileName', ("").concat(this.fileToUpload.name));
    this.purchaseOrderService.Uploadfiles(formData).subscribe((data: any) => {
      this.fileUrl = data.result;
      const editableDiv = document.getElementById("editableDiv");
      if (editableDiv) {
        editableDiv.classList.remove('PasteContent')
          editableDiv.innerText = "file Uploaded"; // or innerHTML = ""
          editableDiv.style.color = "#1bbd09";
          editableDiv.setAttribute("contenteditable", "false");
      }
      this.PaymentDetailForm.patchValue({imageUrl : this.fileUrl})
    },
      (err: any) => {
      });
  }


  get f() {
    return this.PaymentDetailForm.controls;
  }

  fetch(cb: any) {
    const req = new XMLHttpRequest();
    req.open('GET', `assets/data/all-purchase-orders.json`);

    req.onload = () => {
      cb(JSON.parse(req.response));
    };

    req.send();
  }

  openXlModal(content: TemplateRef<any>) {
    this.modalService.open(content, { size: 'xl' }).result.then((result) => {
      console.log("Modal closed" + result);
    }).catch((res) => { });
  }
  openBasicModal(content: TemplateRef<any>) {
    this.modalService.open(content, {backdrop: 'static', keyboard: false,  size: 'md' }).result.then((result: string) => {
    }).catch((res: any) => { });
  }
  
  updateFilter(event: any) {
    this.modelChanged.next(event.target.value)
    // const val = event.target.value.toLowerCase();
    // const filteredData = this.filteredData.filter(function (d) {
    //   return Object.keys(d).some(function (k) {
    //     return d[k]?.toString().toLowerCase().indexOf(val) !== -1 || !val;
    //   }
    //   );
    // });
    // // update the rows
    // this.ItemsData = filteredData;
    // // Whenever the filter changes, always go back to the first page
    // this.table.offset = 0;
  }
  getPurchase(data: any): void {
    console.log("data", data);
    this.PurchaseOrderGuid = data.PurchaseOrderGuid;
    this.PurchaseOrderNumber = data.PurchaseOrderNo;
    this.PoNumber = data.PurchaseOrderNo;
    this.invoiceNumber=data.InvoiceNumber;
    this.SupplierName=data.SupplierName;
    this.VendorId=data.SupplierId,
    this.PoDate=this.datepipe.transform(data.CreatedDate, 'dd-MM-yyyy');
    const formattedPrice = parseFloat(data.Price).toFixed(2);
    const dueAmount =  parseInt(formattedPrice) -data.DueAmount;
    this.PaymentDetailForm.patchValue({
      TotalAmount: formattedPrice,
      Dueamount: dueAmount
    });
    this.previousPaidAmount=parseInt(formattedPrice)-dueAmount
  }

  paidamount(event: any): void {
    const paidAmount = parseFloat(event.target.value);
    const totalAmount = this.PaymentDetailForm.value.Dueamount;
    if (isNaN(paidAmount)) {
      this.isvalid = false; 
    } else if (paidAmount > totalAmount) {
      this.isvalid = true;   
    } else {
      this.isvalid = false;  
    }
  }
    SavePayment(): void {
      this.shimmerVisible = true;
      const today=new Date()
      let input={
        purchaseOrderGuid: this.PurchaseOrderGuid,
        PurchaseOrderNo : this.PurchaseOrderNumber,
        bankname: this.PaymentDetailForm.value.BankName,
        transectionid: this.PaymentDetailForm.value.TransectionID,
        InvoiceNumber:this.PaymentDetailForm.value.InvoiceNumber,
        transectiondate:moment(this.PaymentDetailForm.TransectionDate),
        modeofpayment: this.PaymentDetailForm?.value?.Modeofpayment,
        remarks: this.PaymentDetailForm?.value?.Remarks,
        totalAmount: parseInt(this.PaymentDetailForm?.value?.TotalAmount),
        paidAmount: parseInt(this.PaymentDetailForm.value.PaidAmount),
        status: "",
        imageUrl: this.PaymentDetailForm.value.imageUrl,
        poNumber:this.PurchaseOrderNumber,
        CreatedBy : this.UserGuid,
        UpdatedBy : this.UserGuid,
      }
      this.purchaseOrderService.SavePaymentHistory(input).subscribe(
        (saveitemDetails) => {
          this.shimmerVisible = false;
          this.SendVerificationEmail();
          this.resetfrom()
          this.router.navigate(['/purchase-orders/po-payhistory']);
        },
        (err) => {
          this.shimmerVisible = false;
        });
    }  
    SendVerificationEmail(): void {
      const today = new Date();
      const year = today.getFullYear();
      const dueamount = parseInt(this.PaymentDetailForm?.value?.Dueamount) - parseInt(this.PaymentDetailForm.value.PaidAmount);
    const totalamount = parseInt(this.PaymentDetailForm?.value?.TotalAmount);
    const PaidAmount = totalamount - dueamount;

    let percentagePaid = (PaidAmount / totalamount) * 100;
    percentagePaid = parseInt(percentagePaid.toString(), 10);
    console.log("percentagePaid",percentagePaid)
      let status=""
      if(percentagePaid==100){
        status="FullyPaid"
      }
      if(percentagePaid>=75 && percentagePaid<=99){
        status="Mostly Paid"
      }
      if(percentagePaid>=50 && percentagePaid<75){
        status="Partially Paid"
      }
      if(percentagePaid<50){
        status="Payment Due"
      }
      const formattedDate = `${this.PaymentDetailForm.value.TransectionDate.day}/${this.PaymentDetailForm.value.TransectionDate.month}/${this.PaymentDetailForm.value.TransectionDate.year}`;
      let body = {
        to: this.Suppliermail,
        Body: "",
        subject: "PaymentVerification",
        lstReplacebleVariables: [
          {
            user: this.SupplierName,
            year: year,
            PoDate: this.PoDate,
            VendorId: this.VendorId,
            totalAmount: this.PaymentDetailForm?.value?.TotalAmount,
            paidAmount: this.previousPaidAmount,
            dueAmount: parseInt(this.PaymentDetailForm?.value?.Dueamount) - parseInt(this.PaymentDetailForm.value.PaidAmount),
            transactionId: this.PaymentDetailForm.value.TransectionID,
            orderId: this.PurchaseOrderNumber,
            currentliPaidAmount: this.PaymentDetailForm.value.PaidAmount,
            PaymentDate: formattedDate,
            status:status,
            InvoiceNo:this.PaymentDetailForm.value.InvoiceNumber,
          },
        ],
      };
      this.authservice.sendEmail(body).subscribe((res: any) => {});
    }
    
    resetfrom(){
      this.PaymentDetailForm.reset();
      this.fileUrl="";
      this.PaymentDetailForm.patchValue({imageUrl : this.fileUrl,
        BankName : '',
        PaidAmount : "",
        Remarks : "",
        Modeofpayment : "",
        TransectionDate : null,
        TransectionID : null,
        InvoiceNumber:null
      })
      
      this.PaymentDetailForm.get('Modeofpayment').setValue('');
    }
    restrictCharectors(event: any) {
      const allowedRegex = /[0-9]/g;
      if (!event.key.match(allowedRegex)) {
        event.preventDefault();
      }
    }  
  GetAllPurchaseOrderDetails() {
    this.DepotmentGuid =this.authservice.LoggedInUser.DEFAULTROLES.toLowerCase().includes('ADMIN'.toLowerCase()) && this.authservice.LoggedInUser.LOCATIONSGUID=='00000000-0000-0000-0000-000000000000' ?'00000000-0000-0000-0000-000000000000': this.authservice.LoggedInUser.LOCATIONSGUID.split(",");
    this.shimmerVisible=true;
    this.purchaseOrderService.GetAllPurchaseOrderDetails(this.Keyword, this.itemOrder, this.sort, this.pageNumber, this.rowCount,this.Isurgent,this.filter,this.IsChangeQuotation,this.DepotmentGuid).subscribe(data => {
      this.AllPurchaseOrderDetails = data.Result.getAllPurchaseOrders
      if(this.AllPurchaseOrderDetails==null){
        this.shimmerVisible=false;
        this.TotalCount = 0;
      }
      this.filteredData = data.Result.getAllPurchaseOrders;
      this.totallength=this.filteredData?.length
      this.TotalCount = data.Result.TotalCount    
      this.shimmerVisible=false;
    },
      (err: HttpErrorResponse) => {  
        this.shimmerVisible=false;
      }
    )
  }
  Getevent(event:any){
    console.log(event.target.value)
    if(event.target.value=='All'){
      this.filter='';
      this.GetAllPurchaseOrderDetails()
    }else{
    this.filter=event.target.value;
    this.GetAllPurchaseOrderDetails()
    }
  }
     /**
  * This method is used for Get the Supplier items by passing supplier guid
  */
     GetLocationsAndSuppliersByDefault() {
      this.shimmerVisible = true;
      let DepotmentGuid = this.authservice.LoggedInUser.DEFAULTROLES.toLowerCase().includes('ADMIN'.toLowerCase()) && this.authservice.LoggedInUser.LOCATIONSGUID == '00000000-0000-0000-0000-000000000000' ? '00000000-0000-0000-0000-000000000000' : this.authservice.LoggedInUser.LOCATIONSGUID.split(",")
      this.purchaseOrderService.GetPOAgainstPIPostDefaults(DepotmentGuid).subscribe(data => {
        this.CenterLocation = data.Result.LstCenterLocations;
        this.shimmerVisible = false;
      },
        (err: HttpErrorResponse) => {
          this.shimmerVisible = false;
        })
    }
  onSelect(dataTableActions: any) {
    let PurchaseOrderDetails = JSON.stringify(dataTableActions)
    localStorage.setItem('PurchaseOrderDetails', PurchaseOrderDetails)
    // this.router.navigate(['/purchase-orders/new-purchase-order', dataTableActions.PurchaseOrderGuid]);
  }
  /**
   *
   * @param row
   * this event is used for get the selected purcahse order details
   */
  PurchaseOrderDetailas(row: any) {
    this.PurchaseOrderName = row.SupplierName
    this.purchaseOrderGuid = row.PurchaseOrderGuid;
    this.purchaseorderNo=row.PurchaseOrderNo
    this.ShippingLocation=row.ShippingLocation;
    this.location=row.StoreName
    this.locationGuid=row.ShippinglocationGuid=='00000000-0000-0000-0000-000000000000'||null?row.LocationGuid:row.ShippinglocationGuid
  }
  /**
   * this method is used for delete the purchase order details
   */
  DeletePurchaseOrder() {
    this.UserGuid=this.authservice.LoggedInUser.UserGuid
    this.purchaseOrderService.DeletePurchaseOrderDetails(this.purchaseOrderGuid,this.UserGuid).subscribe(data => {
      this.GetAllPurchaseOrderDetails()
    },
      (err: HttpErrorResponse) => {
      })

  }
    /**
   * this service method used to update shipping location
   */
    UpdateShippingLocation() {
      this.purchaseOrderService.UpdateShipiingLocation(this.purchaseOrderGuid,this.locationGuid).subscribe(data => {
        this.GetAllPurchaseOrderDetails()
      },
        (err: HttpErrorResponse) => {
        })
    }
  OnSelectPO(event: any) {
    const status = event.Status;
    const indentNo = event.IndentNo;
    localStorage.setItem("InvoiceNo",event.InvoiceNumber)
    if(status=='Approved'||status=='Checked'||status=='Maker'){
      let urlParams=[event.PurchaseOrderGuid, status? status : indentNo ? '' : undefined];
      this.router.navigate(indentNo ? ['/purchase-orders/po-against-pi', ...urlParams] : ['/purchase-orders/new-purchase-order', ...urlParams]);

    }
    else{
      let urlParams = [event.PurchaseOrderGuid, indentNo ? '' : undefined];
      this.router.navigate(indentNo ? ['/purchase-orders/po-against-pi', ...urlParams] : ['/purchase-orders/new-purchase-order', ...urlParams]);

    }
    //const urlParams = [event.PurchaseOrderGuid, status === 'Approved' ? status : indentNo ? '' : undefined];
    //this.router.navigate(indentNo ? ['/purchase-orders/po-against-pi', ...urlParams] : ['/purchase-orders/new-purchase-order', ...urlParams]);
    // if(event.Status=='Approved') {
    //   this.router.navigate(['/purchase-orders/po-against-pi', event.PurchaseOrderGuid, event.Status]);
    // }
    // else if (event.IndentNo) {
    //   this.router.navigate(['/purchase-orders/po-against-pi', event.PurchaseOrderGuid, '']);
    // }
    // else {
    //   this.router.navigate(['/purchase-orders/new-purchase-order', event.PurchaseOrderGuid]);
    // }

  }


  // DownloadPdf() {
  //   const element = this.UnparsedHtml;
  //   html2pdf().from(element).set(options).save();

  //   const options = {
  //     margin: 0.2,
  //     filename: `POReport.pdf`,
  //     image: { type: 'jpeg', quality: 0.98 },
  //     html2canvas: { scale: 1 },
  //     jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
  //   };

  // }
  /**
  * this change event change the row number
  * @param rowNo 
  */
  ChangeEvent(rowNo: any) {
    this.itemsPerPage = rowNo.target.value;
    this.rowCount = rowNo.target.value;
    localStorage.setItem("PerPage" , rowNo.target.value);
    this.pageNumber = 1;
    this.GetAllPurchaseOrderDetails();
  }
  ChangePagenumber(event: any) {
    this.pageNumber = event;
    localStorage.setItem("pageNumber" , event);
    this.GetAllPurchaseOrderDetails();
  }
  UpdateStatus() {
    this.ChangePOStatus(this.purchaseOrderGuiddata,this.statusdata);
  }

  async ChangePOStatus(PurchaseOrderGuid: any, ApprovalType: any) {
    this.body.PurchaseOrderGuid = PurchaseOrderGuid;
    this.body.ApprovalType = ApprovalType;
    this.body.UserGuid = this.authservice.LoggedInUser.UserGuid;
    this.body.ApprovalPhoneNumber = this.authservice.LoggedInUser.PhoneNumber;
    this.body.ApprovalEmail = this.authservice.LoggedInUser.Email;
    this.body.ApprovalName = this.authservice.LoggedInUser.FirstName;
    this.body.CheckedReason = ApprovalType === "Checker" ? this.reason : '';
    this.body.ApproveReason = ApprovalType !== "Checker" ? this.reason : '';
    this.body.PoDate = this.PoDate || "";
    this.body.VendorId = this.VendorId || "";

    if (ApprovalType === 'Approval') {
      await this.DownloadPdf(PurchaseOrderGuid, '', '', 'Approval');
      setTimeout(async()=>{
        this.body.POAttachmentURL = this.PoAttachmentURL || '';
          this.updateStatus(ApprovalType);
      },2000)
      
    }
    else{
      this.updateStatus(ApprovalType);
    }
   
  }
  DownloadPdf(PurchaseOrderGuid: any, Status: any, print: any, from?: string) {
    const doc = new jsPDF({ orientation: 'landscape' });
    this.purchaseOrderService.GetPurchaseOrderDetails(PurchaseOrderGuid).subscribe(async data => {
      let purchaseOrderDetails = data.purchaseOrderDetails || '';
      let PurchaseOrderItemDetails = data.POItems.filter((obj: { IndentNo: any; ItemGuid: any }, index: any, self: any[]) =>
        index === self.findIndex((item) => (
          item.IndentNo === obj.IndentNo && item.ItemGuid === obj.ItemGuid
        ))
      ) || '';
      const headerColStyles = {
        fontSize: 8,
        fillColor: '#f8fcf2',
        textColor: '#000000',
        lineColor: '#03c136',
        minCellWidth : 10
      };
      const mainTableColStyles={
        ...headerColStyles,
         lineColor: '#03c136',
      }
  
      const footerRowStyles = {
        fontSize: 8,
        fillColor: '#f8fcf2',
        lineColor: '#03c136',
        textColor: '#000000',
      };
  
      function createHeaderCols() {
        return [
          { content: 'S.NO', styles: { ...mainTableColStyles, cellWidth: 15 ,   lineColor: '#03c136',lineWidth: 0.1 } },
          { content: 'Item Name', styles: { ...mainTableColStyles, cellWidth: 30, lineColor: '#03c136',lineWidth: 0.1 }  },
          { content: 'Vendor Item Name', styles: { ...mainTableColStyles, cellWidth: 40,lineColor: '#03c136',lineWidth: 0.1 } },
          { content: 'Catalog No', styles: { ...mainTableColStyles, cellWidth: 20,lineColor: '#03c136',lineWidth: 0.1 } },
          { content: 'Manufacturer Name', styles: { ...mainTableColStyles, cellWidth: 30,lineColor: '#03c136',lineWidth: 0.1 } },
          { content: 'Unit', styles: { ...mainTableColStyles, cellWidth: 15,lineColor: '#03c136',lineWidth: 0.1 } },
          { content: 'Pack Size', styles: { ...mainTableColStyles, cellWidth: 20,lineColor: '#03c136',lineWidth: 0.1 } },
          { content: 'Qty', styles: { ...mainTableColStyles , cellWidth: 15,lineColor: '#03c136',lineWidth: 0.1} },
          { content: 'Unit Price', styles: { ...mainTableColStyles , cellWidth: 20,lineColor: '#03c136',lineWidth: 0.1} },
          { content: 'Disc %', styles: { ...mainTableColStyles , cellWidth: 15,lineColor: '#03c136',lineWidth: 0.1 }},
          { content: 'GST %', styles: { ...mainTableColStyles , cellWidth: 15,lineColor: '#03c136',lineWidth: 0.1} },
          { content: 'Buy Price', styles: { ...mainTableColStyles , cellWidth: 20,lineColor: '#03c136',lineWidth: 0.1} },
          { content: 'GST Amount', styles: { ...mainTableColStyles, fontSize: 7, cellWidth: 15,lineColor: '#03c136',lineWidth: 0.1 } },
          { content: 'Amount', styles: { ...mainTableColStyles, fontSize: 7, cellWidth: 20,lineColor: '#03c136',lineWidth: 0.1 } },
        ];
      }
  
      function createBodyRows() {
        let bodyRows = [];
        for (let i = 0; i < PurchaseOrderItemDetails.length; i++) {
          if (PurchaseOrderItemDetails[i].OrderedQty === "0.00") {
            continue;
          }
          bodyRows.push([
            { content: String(i + 1), styles: { minCellWidth: 15, fontSize: 8 } },
            { content: PurchaseOrderItemDetails[i].ItemName || '', styles: { minCellWidth: 30, fontSize: 8 } },
            { content: PurchaseOrderItemDetails[i].VendorItemName || 'N/A', styles: { minCellWidth: 40, fontSize: 8 } },
            { content: PurchaseOrderItemDetails[i].CatalogNo || 'N/A', styles: { minCellWidth: 20, fontSize: 8 } },
            { content: PurchaseOrderItemDetails[i].ManufactureName || 'N/A', styles: { minCellWidth: 30, fontSize: 8 } },
            { content: PurchaseOrderItemDetails[i].MinorUnitName || 'N/A', styles: { minCellWidth: 15, fontSize: 8 } },
            { content: PurchaseOrderItemDetails[i].PackSize || '', styles: { minCellWidth: 20, fontSize: 8 } },
            { content: PurchaseOrderItemDetails[i].OrderedQty || 'N/A', styles: { minCellWidth: 15, fontSize: 8 } },
            { content: PurchaseOrderItemDetails[i].Rate || '', styles: { minCellWidth: 20, fontSize: 8 } },
            { content: PurchaseOrderItemDetails[i].DiscountPer || '', styles: { minCellWidth: 15, fontSize: 8 } },
            { content: (PurchaseOrderItemDetails[i].CGST + PurchaseOrderItemDetails[i].SGST) === 0 && PurchaseOrderItemDetails[i].IGST === 0 ? PurchaseOrderItemDetails[i].IGST : (PurchaseOrderItemDetails[i].IGST ? PurchaseOrderItemDetails[i].IGST : (PurchaseOrderItemDetails[i].CGST + PurchaseOrderItemDetails[i].SGST)), styles: { minCellWidth: 15, fontSize: 8 } },
            { content: PurchaseOrderItemDetails[i].UnitPrice || '', styles: { minCellWidth: 20, fontSize: 8 } },
            { content: PurchaseOrderItemDetails[i].TaxAmount || '', styles: { minCellWidth: 15, fontSize: 8 } },
            { content: PurchaseOrderItemDetails[i].NetAmount || 'N/A', styles: { minCellWidth: 20, fontSize: 8 } },
          ]);
        }
        return bodyRows;
      }
  
      const imageUrl = 'https://yoda-inventory-management.s3.ap-south-1.amazonaws.com/yodalims/invoices/yoda diagnostics logo copy_page-0001.jpg';
      const imageWidth = 110;
      const imageHeight = 15;
      const imageXPos = 100;
      const imageYPos = 5;
  
      doc.addImage(imageUrl, 'PNG', imageXPos, imageYPos, imageWidth, imageHeight);
  
      let cursorY1 = imageYPos + imageHeight + 5;
      const tableWidth = 290;
  
      function createSecondaryImg() {
        const imageWidth = 70;
        const imageHeight = 10;
        const imageXPos = 220;
        const imageYPos = 8;
        doc.addImage(imageUrl, 'PNG', imageXPos, imageYPos, imageWidth, imageHeight);
      }
  
      function createPageFooter() {
        const currentDate = new Date();
        const formattedDate = currentDate.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'long',
          year: 'numeric'
        }).replace(/ /g, '-');
        const text = `Date: ${formattedDate}\nThis is a computer generated document, hence signature is not required.`;
        const xPos = 292;
        const yPos = 200;
        doc.setFontSize(12)
        doc.text(text, xPos, yPos, { align: 'right' })
      }
  
      function createTitle(yPos: any) {
        const headline1Content = 'Purchase Order';
        const headline1XPos = 3;
        const headline1YPos = imageYPos + 5 - yPos;
        const headline1FontSize = 10;
        return doc.text(headline1Content, headline1XPos, headline1YPos).setFontSize(headline1FontSize);
      }
      function createSubTitle(yPos: any) {
        const headline2Content = `PO No: ${purchaseOrderDetails.PurchaseOrderNo}\nPO Date: ${purchaseOrderDetails.POCreatedDate}`;
        const headline2XPos = 3;
        const headline2YPos = imageYPos + 20 - yPos;
        const headline2FontSize = 10;
        return doc.text(headline2Content, headline2XPos, headline2YPos).setFontSize(headline2FontSize);
      }


      function generateGRNTable() {
        autoTable(doc, {
          head: [
            [
              { content: 'Purchase Order', colSpan: 2, styles: { ...headerColStyles, fontSize: 14, fontStyle: 'bold', halign: 'center',lineWidth: 0.1, lineColor: '#03c136',  } }
            ]
          ],
          body: [
            [
              { content: `PO No : ${purchaseOrderDetails.PurchaseOrderNo}`, styles: { fillColor: '#fff', textColor: '#000000', lineWidth: 0.1, lineColor: '#03c136' } },
              { content: `PO Date : ${purchaseOrderDetails.POCreatedDate}`, styles: { fillColor: '#fff', textColor: '#000000', lineWidth: 0.1, lineColor: '#03c136' } },
            ],
            [
              { content: 'Ordered By', styles: { fillColor: '#fff', textColor: '#000000', lineWidth: 0.1, lineColor: '#03c136' } },
              { content: 'Vendor details', rowSpan: 2, styles: { fillColor: '#fff', textColor: '#000000', lineWidth: 0.1, lineColor: '#03c136' } },
            ],
            [
              { content: 'Yoda Lifeline Diagnostics Pvt Ltd', styles: { fillColor: '#fff', textColor: '#000000', lineWidth: 0.1, lineColor: '#03c136' } },
            ],
            [
              { content: `Address: ${purchaseOrderDetails.StoreLocationAddress}\nContact: ${purchaseOrderDetails.OrderedContactPersonNo}\nGSTIN: ${purchaseOrderDetails.GSTNNO}`, styles: { fillColor: '#fff', lineWidth: 0.1, lineColor: '#03c136' } },
              { content: `Vendor name: ${purchaseOrderDetails.SupplierName}\nVendor address: ${purchaseOrderDetails.Address}\nContact person: ${purchaseOrderDetails.PrimaryContactPerson}\nVendor mobile: ${purchaseOrderDetails.PrimaryContactPersonMobileNo}\nVendor email: ${purchaseOrderDetails.VendorEmailId}\nGST: ${purchaseOrderDetails.GSTIN}`, styles: { fillColor: '#fff', lineWidth: 0.1, lineColor: '#03c136' } }
            ],
            [
              { content: 'Bill to address', styles: { fillColor: '#fff', textColor: '#000000', lineWidth: 0.1, lineColor: '#03c136' } },
              { content: 'Ship to address',  styles: { fillColor: '#fff', textColor: '#000000', lineWidth: 0.1, lineColor: '#03c136' } },
            ],
            [
              { content: `Name: ${purchaseOrderDetails.CenterLocation}\nAddress: ${purchaseOrderDetails.StoreLocationAddress}\nContact person: ${purchaseOrderDetails.OrderedContactPerson}\nMobile: ${purchaseOrderDetails.OrderedContactPersonNo}\nEmail: ${purchaseOrderDetails.OrderedContactPersonEmail}\nGST: ${purchaseOrderDetails.GSTNNO}`, styles: { fillColor: '#fff', lineWidth: 0.1, lineColor: '#03c136' }},
              { content: `Name: ${purchaseOrderDetails.ShipLocation ? purchaseOrderDetails.ShipLocation : purchaseOrderDetails.CenterLocation}\nAddress: ${purchaseOrderDetails.ShipStoreLocationAddress ? purchaseOrderDetails.ShipStoreLocationAddress : purchaseOrderDetails.StoreLocationAddress}\nContact person: ${purchaseOrderDetails.ShipContactPerson ? purchaseOrderDetails.ShipContactPerson : purchaseOrderDetails.OrderedContactPerson}\nMobile: ${purchaseOrderDetails.ShipContactPersonNo ? purchaseOrderDetails.ShipContactPersonNo : purchaseOrderDetails.OrderedContactPersonNo}\nEmail: ${purchaseOrderDetails.ShipContactPersonEmail ? purchaseOrderDetails.ShipContactPersonEmail : purchaseOrderDetails.OrderedContactPersonEmail}\nGST: ${purchaseOrderDetails.ShipGSTNNO ? purchaseOrderDetails.ShipGSTNNO : purchaseOrderDetails.GSTNNO}`, styles: { fillColor: '#fff', lineWidth: 0.1, lineColor: '#03c136' } }
            ],
          ],
          startY: cursorY1,
          theme: 'grid',
          tableWidth: tableWidth,
          margin: { left: 3 },
          didDrawPage: (data) => {
            if (data.pageNumber > 1) {
              createTitle(0);
              createSubTitle(8);
              createSecondaryImg();
            }
          },
        });
      }
      function createMainTableFooter() {
        return [
          [{content: `Total  amount in INR :  ${purchaseOrderDetails.POTotalAmount.toString().match(/^\d+(?:\.\d{0,2})?/) || '0'}`,colSpan: 15,styles : {...footerRowStyles, lineColor: '#03c136', lineWidth: 0.1}}],
          [
          {content : `Created by :${purchaseOrderDetails.CreatedBy || ''}`,colSpan: 3,styles : {...footerRowStyles, lineColor: '#03c136', lineWidth: 0.1 } },
          {content : `Checked by : ${Status == "Maker" ? '' : purchaseOrderDetails.CheckedByName}`,colSpan: 3,styles : {...footerRowStyles, lineColor: '#03c136', lineWidth: 0.1} },
          {content : `Approved by :${purchaseOrderDetails.AppprovedByName || "N/A"}` ,colSpan: 3,styles : {...footerRowStyles, lineColor: '#03c136', lineWidth: 0.1} },
          {content : `Recall by : ${purchaseOrderDetails.RecallByName == null ? "" : purchaseOrderDetails.RecallByName || ''}`,colSpan: 2,styles : {...footerRowStyles, lineColor: '#03c136', lineWidth: 0.1} },
          {content : `Cancel by : ${purchaseOrderDetails.CancelledBy == null ? "" : purchaseOrderDetails.CancelledBy || ''}` ,colSpan: 3,styles : {...footerRowStyles, lineColor: '#03c136', lineWidth: 0.1}}
         ],
         [{content: `Payment Term : ${purchaseOrderDetails.PaymentTermCondition || ''}\nDelivery Term : ${purchaseOrderDetails.PaymentDeliveryTerm}`,colSpan: 15,styles : {...footerRowStyles}}] 
        ]
      }
  
      let totalPages = 0;
      let currentPageNumber = 0;
      function generateMainTable() {
        return autoTable(doc, {
          head: [createHeaderCols()],
          body: createBodyRows(),
          foot : createMainTableFooter(),
          theme: 'grid',
          styles: {
            lineColor: '#03c136',
            lineWidth: 0.5, 
          },
          tableWidth: tableWidth,
          margin: { left: 3, top: 30 },
          willDrawPage: (data) => {
            currentPageNumber++
            totalPages = currentPageNumber;
          },
          didDrawPage: (data) => {
            const yPos = data.pageNumber > 1 ? 30 : 5;
            if (data.pageNumber > 1) {
              createTitle(0);
              createSubTitle(8);
              createSecondaryImg();
            }
          },
        });
      }
  
      generateGRNTable();
      generateMainTable();
      createPageFooter();
      createMainTableFooter()
  
      let dateString = purchaseOrderDetails.POCreatedDate;
      let [day, month, year] = dateString.split('-');
      let dateObj = new Date(`${year}-${month}-${day}`);
      let formattedDay = String(dateObj.getDate()).padStart(2, '0');
      let formattedMonth = String(dateObj.getMonth() + 1).padStart(2, '0');
      let formattedYear = String(dateObj.getFullYear());
      let formattedDate = formattedDay + formattedMonth + formattedYear;
      if (print !== "") {
        const pdfOutput = doc.output('bloburl');
        const printWindow: any = window.open(pdfOutput);
        setTimeout(() => {
          printWindow.print();
        }, 250);
      } else {
        if (from) {
          // Generate PDF blob and upload it
          const pdfBlob = await doc.output('blob');
          const formData = new FormData();
          formData.append('File', pdfBlob, `POReport_${purchaseOrderDetails.PurchaseOrderNo}_${purchaseOrderDetails.SupplierCode}_${formattedDate}.pdf`);
          formData.append('FileName', `POReport_${purchaseOrderDetails.PurchaseOrderNo}_${purchaseOrderDetails.SupplierCode}_${formattedDate}.pdf`);
          const data = await this.purchaseOrderService.Uploadfiles(formData).toPromise();
          this.PoAttachmentURL = data.result;
        }
    else {
      doc.save(`POReport_${purchaseOrderDetails.PurchaseOrderNo + "_" + purchaseOrderDetails.SupplierCode + "_" + formattedDate}.pdf`);
    }
       
      }
    });
  
    this.invoiceGuid = '';
    this.GetAllPurchaseOrderDetails();
  }
  
  async setPdfUrl(formData:any) {
   
    const data = await this.purchaseOrderService.Uploadfiles(formData).toPromise();
    this.PoAttachmentURL = data.result;
  }


  updateStatus(ApprovalType: any) {
    this.purchaseOrderService.UpdatePurchaseOrderStatus(this.body).subscribe(data => {
      this.UserName = data?.UserName;
      if (ApprovalType == "Recall") {
        this.SendRecallVerificationEmail(this.UserName);
      }
      this.GetAllPurchaseOrderDetails();
      this.reason = '';
    })
  }
  
  SendRecallVerificationEmail(username:any): void {
    const today=new Date();
    const year=today.getFullYear();
    let body={
      to:this.Suppliermail,
      Body:"",
      subject: "RecallVerification",
      lstReplacebleVariables: [
        {
          user: this.SupplierName,
          year: year,
          orderId: this.OderId,
          recallby:username,
          Recallreason:this.recallReason,
          PoDate:this.PoDate,
          VendorId:this.VendorId
        }
      ]
    }
    this.recallReason=''
    this.authenticationService.sendEmail(body).subscribe((res: any) => {
    })
  }
  confirmRecall() {
    this.body.Reason = this.recallReason;
    this.ChangePOStatus(   this.PurchaseOrderGuid1 , 'Recall');
  }

  getPurchaseOrder(data:any){
    this.PurchaseOrderGuid1 = data.PurchaseOrderGuid
    this.Suppliermail=data.SupplierMail
    this.SupplierName=data.SupplierName,
    this.OderId=data.PurchaseOrderNo
    this.PoDate=this.datepipe.transform(data.CreatedDate, 'dd-MM-yyyy');
    this.VendorId=data.SupplierId
    this.PurchaseOrderGuid = data.PurchaseOrderGuid;
    this.PurchaseOrderNumber = data.PurchaseOrderNo;
    this.PoNumber = data.PurchaseOrderNo;
    this.invoiceNumber=data.InvoiceNumber;
    this.VendorId=data.SupplierId,
    this.Email=data.SupplierMail
    const formattedPrice = parseFloat(data.Price).toFixed(2);
    const dueAmount =  parseInt(formattedPrice) -data.DueAmount;
    this.PaymentDetailForm.patchValue({
      TotalAmount: formattedPrice,
      Dueamount: dueAmount
    });
    this.previousPaidAmount=parseInt(formattedPrice)-dueAmount
  }
  /**
   * this change event used to select the location
   * @param event 
   */
  Changelocation(event:any){
    if(!event){
      this.locationGuid=''
    }
    else{
      this.locationGuid=event.LocationGuid
    }
    
  }
  getQuotationByGuid(row: any) {
    this.quotationGuid = [];
    this.locationList = "";
    this.deliveryState = row.DeliveryStateName
    this.deliveryLocationName = row.DeliveryLocationName
    this.SupplierStateName = row.SupplierSateName
    if (row && row.QuotationGuid !== undefined) {
      this.quotationGuid = row.QuotationGuid;
    } else {
      if (
        this.supplierGuid.length > 0 ||
        this.locationGuid.length > 0 ||
        this.fromDate ||
        this.toDate ||
        this.itemGuid.length > 0
      ) {
        this.quotationsList.forEach((Quotation: any) => {
          if (Quotation && Quotation.QuotationGuid !== undefined) {
            this.quotationGuid.push(Quotation.QuotationGuid);
          }
        });
      }
    }  
    this.quotationService.getQuotationsByGuid(row).subscribe(data => {
      const uniqueItemKeys: string[] = [];
       this.quotationDetails = data.getQuotationsResponses
       this.quotationDetails = this.quotationDetails.filter((quotation: any) => {
        const itemName = quotation.ItemName; 
        const itemCategoryName = quotation.ItemCategoryName; 
        const uniqueKey = `${itemName}-${itemCategoryName}`;
        // Check if the item is unique
        if (!uniqueItemKeys.includes(uniqueKey)) {
          uniqueItemKeys.push(uniqueKey);
          return true;
        }
        return false;
      });
      if (this.quotationDetails.length > 0) {
        const locationNames = data.getQuotationsResponses[0].LocationName.split(',').filter((value: any, index: any, self: any) => self.indexOf(value) === index);
        const myString = locationNames.join(', ');
        this.locationList = myString
      }
    }, (err: HttpErrorResponse) => {
      this.globalService.stopSpinner();
      this.noQuotationFound = true
    })
  }
  getpurchaseorderPostDefaults() {
    let DepotmentGuid =this.authservice.LoggedInUser.DEFAULTROLES.toLowerCase().includes('ADMIN'.toLowerCase()) && this.authservice.LoggedInUser.LOCATIONSGUID=='00000000-0000-0000-0000-000000000000' ?'00000000-0000-0000-0000-000000000000': this.authservice.LoggedInUser.LOCATIONSGUID.split(",")
    this.quotationService.getQuotationPostDefaults(DepotmentGuid).subscribe(data => {
      this.defaultData = data
      this.locations = data.Result.LstQuotationCenterLocationType
     
    })
  }
  filterByUrgent(event:any) {
     
   if(event.target.checked==true)
   {
    this.Isurgent=true
   }
   else{
    this.Isurgent=false
   }
   this.GetAllPurchaseOrderDetails()

  }
  filterByQuotation(event:any) { 
    this.IsChangeQuotation=event.target.checked;
    this.GetAllPurchaseOrderDetails()
  }
// QuotationReasons(){

// if (this.ReasonQuotationNo && this.ReasonQuotationNo) {
//   this.showIcon  = true;
// }
// else {
//   this.showIcon  = false;
//  }
//   }
  changestatus(purcahse:any,Status:any){ 
    this.purchaseOrderGuiddata=purcahse.PurchaseOrderGuid
    this.VendorId=purcahse.SupplierId
    this.PoDate=this.datepipe.transform(purcahse.CreatedDate, 'dd-MM-yyyy');
    this.statusdata=Status
  }
  clearReason(){
  this.recallReason=''
  }
}
