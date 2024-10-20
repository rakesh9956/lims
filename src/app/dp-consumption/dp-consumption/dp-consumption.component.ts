import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthenticationService } from 'src/app/core/Services/authentication.service';
import { IndentService } from 'src/app/core/Services/indent.service';
import { PurchaseOrderService } from 'src/app/core/Services/purchase-order.service';

@Component({
  selector: 'app-dp-consumption',
  templateUrl: './dp-consumption.component.html',
  styleUrls: ['./dp-consumption.component.scss']
})
export class DpConsumptionComponent implements OnInit {
  defaultNavActiveId = 1;
  shimmerVisible: boolean;
  CenterLocation: any
  ReceivedItems: any
  SelectedLocationGuid: any = [];
  IndentItemsDetailForm: FormGroup = {} as any;
  ConsumeDetailItems: FormArray = {} as any;
  index: any;
  UserGuid: any;
  Consumeitemslist: any = [];
  IsShow: boolean = true;
  isQuantityCheck: boolean = false;
  consumedItems: any = [];
  inHandItems: any = []
  allinHandItems: any = [];
  allConsumedItems: any = [];
  keyword:any='';
  isAnyValueFilled: boolean =false;
  constructor(
    private indentService: IndentService,
    private purchaseOrderService: PurchaseOrderService,
    private modalService: NgbModal,
    private fb: FormBuilder,
    private authservice: AuthenticationService
  ) { }

  ngOnInit(): void {
    this.UserGuid = localStorage.getItem('UserGuid') || '';
    this.GetLocationsByDefault();
    this.intForm();
    this.ConsumeItemslist.removeAt(this.index = 0)
    let SelectedLocationGuid = this.authservice.LoggedInUser.LOCATIONSGUID?.toLowerCase()
    if(SelectedLocationGuid || this.authservice.LoggedInUser.STORE==false){
      this.SelectedLocationGuid = (SelectedLocationGuid =='00000000-0000-0000-0000-000000000000' || SelectedLocationGuid.split(',').length>1)?[]:SelectedLocationGuid
      this.GetReceivedItemsDetails(SelectedLocationGuid)
    }
  }
  intForm() {
    this.IndentItemsDetailForm = this.fb.group({
      ConsumeDetailItems: this.fb.array([
        this.fb.group({
          ItemName: [''],
          VendorItemName: [''],
          ItemGuid: [''],
          BatchNumber: [''],
          ConsumeQuantity: [0, [Validators.required]],
          ReasonForUse: [''],
          Units: [''],
          ReceiveQty: [''],
          IndentNo: [''],
          oldConsumeQuantity: [''],
          oldUnits: [''],
          Checked : [false],
          OnBoardStock: [0],
          OnHandStock: [0],
        })
      ])
    })
  }
  /**
* this method is formcontols
*/
  get ConsumeItemslist(): FormArray {
    return this.IndentItemsDetailForm.get('ConsumeDetailItems') as FormArray;
  }
  //restricted the popup modal
  openBackDropCustomClass(content: TemplateRef<any>) {
    this.modalService.open(content, { backdrop: 'static', keyboard: false, size: 'xl' });
  }
  /**
  * This method is used for Get the Supplier items by passing supplier guid
  */
  GetLocationsByDefault() {
    let DepotmentGuid = this.authservice.LoggedInUser.DEFAULTROLES.toLowerCase().includes('ADMIN'.toLowerCase()) && this.authservice.LoggedInUser.LOCATIONSGUID == '00000000-0000-0000-0000-000000000000' ? '00000000-0000-0000-0000-000000000000' : this.authservice.LoggedInUser.LOCATIONSGUID.split(",")
    // this.globalService.startSpinner();
    this.shimmerVisible = true;
    this.purchaseOrderService.GetPOAgainstPIPostDefaults(DepotmentGuid).subscribe(data => {
      this.CenterLocation = data.Result.LstCenterLocations
      // this.globalService.stopSpinner();
      this.shimmerVisible = false;
    },
      (err: HttpErrorResponse) => {
        // this.globalService.stopSpinner();
        this.shimmerVisible = false;
      })
  }
  SelectLocation(event: any) {
    this.SelectedLocationGuid = event?.LocationGuid;
    this.consumedItems=[];
    this.inHandItems=[];
    this.allinHandItems=[];
    this.allConsumedItems=[];
    if (event != undefined) {
      this.GetReceivedItemsDetails(event.LocationGuid);
    }
    else {
      this.ReceivedItems = [];
      this.SelectedLocationGuid = [];
      this.IsShow = true;
    }
  }
  /**
   * This  method is used to get the ReceivedItemsDetails items by passing the location guid
   * @param LocationGuid 
   */
  GetReceivedItemsDetails(LocationGuid: any) {
    // this.globalService.startSpinner();
    this.keyword='';
    this.consumedItems=[];
    this.allConsumedItems=[];
    this.shimmerVisible = true;
    this.indentService.GetReceivedItemsDetails(LocationGuid).subscribe(data => {
      if(LocationGuid=='00000000-0000-0000-0000-000000000000'){
        this.IsShow=true
      }else{
        this.IsShow=false
      }
      this.ReceivedItems = data.Result;
      this.ReceivedItems.forEach((element: any) => {
        if (element.Status == false && element.IsReturn == false && element.ConsumeQty - element.ReturnQuantity - element.ScrapQuantity != 0 && element.ReceiveQty != element.ScrapQuantity) {          
          this.consumedItems.push(element)
          this.allConsumedItems.push(element)
        }
        else {
          this.inHandItems.push(element)
          this.allinHandItems.push(element)
        }
      });
      this.IsShow = false;
      // this.globalService.stopSpinner();
      this.shimmerVisible = false;
    },
      (err: HttpErrorResponse) => {
        // this.globalService.stopSpinner();
        this.shimmerVisible = false;
      })
  }
  /**
  * this event Set the Consume items
  * @param event 
  */
  SetConsumeItems(event: any) {
    this.Consumeitemslist = this.ReceivedItems.filter((item: { ItemGuid: any; BatchNumber: any; IndentNo: any }) => 
      item.ItemGuid === event.ItemGuid && 
      item.BatchNumber === event.BatchNumber && 
      item.IndentNo === event.IndentNo
    );
    this.Consumeitemslist.forEach((element: {
      ItemName: any,VendorItemName:any, BatchNumber: any, ItemGuid: any, ConsumeQty: any, IssueMultiplier: any, ReceiveQty: any, ReturnQuantity: any, ScrapQuantity: any, IndentNo: any, IndentGuid : any, ExpiryDate : any,
      OnHandStock: number, OnBoardStock: number
    }) => {
      const consumeQuantity = element.ConsumeQty - element.ReturnQuantity - element.ScrapQuantity;
      if (consumeQuantity > 0) { 
        this.ConsumeItemslist.push(this.fb.group({
          ItemName: element.ItemName,
          VendorItemName: element.VendorItemName,
          BatchNumber: element.BatchNumber,
          ItemGuid: element.ItemGuid,
          ConsumeQuantity: [consumeQuantity, [Validators.required]],
          ReasonForUse: '',
          Units: consumeQuantity * element.IssueMultiplier,
          ReceiveQty: element.ReceiveQty,
          IndentNo: element.IndentNo,
          oldConsumeQuantity: consumeQuantity,
          oldUnits: consumeQuantity * element.IssueMultiplier,
          IndentGuid : element.IndentGuid,
          ExpiryDate : element.ExpiryDate,
          Checked : false,
          OnHandStock: element.OnHandStock,
          OnBoardStock: element.OnBoardStock,
        }));
      }
    });
    this.listenToFormChanges();
  }
  
  /**
   * this Service method used to save the Consumed items
   */
  SaveConsumeItems(): void {
    this.ConsumeItemslist.value.forEach((element: any, index: any) => {
      const barcodedetails = this.ConsumeItemslist.at(index)
      barcodedetails.patchValue({
        ReasonForUse: element.ReasonForUse,
        Units: element.Units
      });
    });
    const selectedItems = this.IndentItemsDetailForm.value.ConsumeDetailItems.filter(     
      (item: any) => item.Checked=== true
    );
    let input = {
      userGuid: this.UserGuid,
      LstConsumeItems: selectedItems
    }
    // this.globalService.startSpinner();
    this.shimmerVisible = true;
    this.indentService.SaveConsumeDetails(input).subscribe(
      (data) => {
        this.inHandItems=[];
        this.consumedItems=[];
        this.GetReceivedItemsDetails(this.SelectedLocationGuid);
        this.ConsumeItemslist.clear();
        this.IndentItemsDetailForm.reset();
        // this.globalService.stopSpinner();
        this.shimmerVisible = false;
      },
      (err) => {
        // this.globalService.stopSpinner();
        this.shimmerVisible = false;
      })
  }
  ChangeConsumeQuantity(item: any, index: any) {
    if (this.IndentItemsDetailForm.get('ConsumeDetailItems')?.value[index].ConsumeQuantity == 0) {
      this.isQuantityCheck = true
    }
    else {
      if (this.IndentItemsDetailForm.get('ConsumeDetailItems')?.value[index].ConsumeQuantity > this.IndentItemsDetailForm.get('ConsumeDetailItems')?.value[index].oldConsumeQuantity) {
        const consumedetails = this.ConsumeItemslist.at(index)
        consumedetails.patchValue({
          ConsumeQuantity: this.IndentItemsDetailForm.get('ConsumeDetailItems')?.value[index].oldConsumeQuantity,
          Units: this.IndentItemsDetailForm.get('ConsumeDetailItems')?.value[index].oldUnits
        });
        this.isQuantityCheck = false
      }
      else {
        const Unitquantity = this.IndentItemsDetailForm.get('ConsumeDetailItems')?.value[index].ConsumeQuantity;
        const ConsumeQty = Unitquantity * this.Consumeitemslist[index].IssueMultiplier;
        this.ConsumeItemslist.value.forEach((element: any, indexs: any) => {
          const consumedetails = this.ConsumeItemslist.at(index)
          consumedetails.patchValue({
            Units: ConsumeQty
          });
        })
        this.isQuantityCheck = false
      }
    }


  }
  ChangeConsume(item: any, index: any) {
    const Unitquantity = this.IndentItemsDetailForm.get('ConsumeDetailItems')?.value[index].Units;
    const remainingquantity = (this.Consumeitemslist[index].ConsumeQty * this.Consumeitemslist[index].IssueMultiplier) - (Unitquantity);
    const ConsumeQty = (this.Consumeitemslist[index].ConsumeQty) - (remainingquantity / this.Consumeitemslist[index].IssueMultiplier);
    this.ConsumeItemslist.value.forEach((element: any, indexs: any) => {
      const consumedetails = this.ConsumeItemslist.at(index)
      consumedetails.patchValue({
        ConsumeQuantity: ConsumeQty
      });
    })
  }
  setvalidauion(value: number, index: any) {
    const releasedCountControl = this.IndentItemsDetailForm.get('ConsumeDetailItems.' + index + '.Units');
    if (!value || value <= 0) {
      releasedCountControl?.setValue((this.Consumeitemslist[index].ConsumeQty - this.Consumeitemslist[index].ReturnQuantity) * this.Consumeitemslist[index].IssueMultiplier)
    }
    else if ((this.Consumeitemslist[index].ConsumeQty - this.Consumeitemslist[index].ReturnQuantity) * this.Consumeitemslist[index].IssueMultiplier < value) {
      releasedCountControl?.setValue((this.Consumeitemslist[index].ConsumeQty - this.Consumeitemslist[index].ReturnQuantity) * this.Consumeitemslist[index].IssueMultiplier);
    }
    else {
      releasedCountControl?.setValue(value);
    }
  }
  search(event: any, From: any) {
    if (From == 'Consumed' && event.target.value != '') {
      this.consumedItems = this.allConsumedItems?.filter((item: any) => {
        return item.ItemName.toLowerCase().includes(event.target.value.toLowerCase()) || item.BatchNumber.toLowerCase().includes(event.target.value.toLowerCase());
      });
    }
    else {
      this.consumedItems = this.allConsumedItems
    }

    if (From == 'InHandItems' && event.target.value != '') {
      this.inHandItems = this.allinHandItems?.filter((item: any) => {
        return item.ItemName.toLowerCase().includes(event.target.value.toLowerCase()) || item.BatchNumber.toLowerCase().includes(event.target.value.toLowerCase());
      });
    }
    else {
      this.inHandItems = this.allinHandItems
    }

  }
  filterItems(From: any) {
    this.keyword='';
    if (From == 'InHandItems') {
      this.inHandItems = this.allinHandItems
    }
    else{
      this.consumedItems = this.allConsumedItems
    }
  }
  Checkeditem(event: any, item: any, indexs: any) {
    const Ischecked = event.target.checked;
    this.ConsumeItemslist.controls.forEach((control :any, index :any) => {
      if (index === indexs) {
        control.patchValue({
          Checked: Ischecked,
        });
      }
    });
  }
  listenToFormChanges(): void {
    this.IndentItemsDetailForm.get('ConsumeDetailItems')?.valueChanges.subscribe(values => {
      this.isAnyValueFilled = values.some((item: any) => {
        return (
          !!item.Checked
        );
      });
    });
  }  
}
