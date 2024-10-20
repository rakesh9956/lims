import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AllItemsService } from 'src/app/core/Services/all-items.service';
import { GlobalService } from 'src/app/core/Services/global.service';
import {FormValueTrimeer, UsernameValidator } from 'src/Utils/validators';

@Component({
  selector: 'app-new-item-type',
  templateUrl: './new-item-type.component.html',
  styleUrls: ['./new-item-type.component.scss']
})
export class NewItemTypeComponent implements OnInit {
  /**
  * Type:Properties 
  * Declare all the intermediate properies 
  */
  shimmerVisible:boolean;
  SubCategoryList: any;
  ItemTypeForm: FormGroup = {} as any;
  SelectedItemTypeDetails: any;
  FormChanged: Boolean = false
  duplicateItem: any;
  /**
   * 
   * @param allItemsService 
   * @param fb 
   * @param router 
   */
  constructor(
    public allItemsService: AllItemsService,
    private fb: FormBuilder,
    private router: Router,
    public globleService: GlobalService) { }

  ngOnInit(): void {
    this.GetItemsDefault();
    this.initForms();
    let ItemDetails: any
    ItemDetails = localStorage.getItem('ItemTypeDeatils')
    if (ItemDetails != null) {
      this.SelectedItemTypeDetails = JSON.parse(ItemDetails)
      this.GetSelectedItemTypeDetails()
    }

    this.ItemTypeForm.valueChanges
      .pipe(
    )
      .subscribe(values => {
        this.FormChanged = true;
      }
      );
  }
  /**
     * Type : initForm 
    * Form Initialization
    */
  initForms() {
    this.ItemTypeForm = this.fb.group({
      ItemTypeGuid: [''],
      SubCategoryTypeGuid: [null, [Validators.required]],
      ItemTypeName: ['', [Validators.required , UsernameValidator.cannotContainSpace ]],
      ItemTypeCode: [''],
      Description: ['', [Validators.required, UsernameValidator.cannotContainSpace]],
      //Status: ['true']
    })
  }

get ItemTypeName(){
  return this.ItemTypeForm.value.ItemTypeName?.trim()
}
get Description(){
  return this.ItemTypeForm.value.Description?.trim()
}
  /**
 * This method is used to Get the all ItemTypes
 */
  GetItemTypes(event: any) {
    this.allItemsService.GetItemTypes().subscribe(data => {
    const ItemType = data.Result.getAllItemTypes || [];
      if (ItemType.length > 0) {
        const itemNameLowerCase = event.target.value.toLowerCase();
        this.duplicateItem = ItemType.some((element: any) =>
          element.ItemTypeName.toLowerCase() === itemNameLowerCase
        );
      } else {
        this.duplicateItem = false;
      }
    })
  }












  /**
   * This method is used for get the SubCategoryName deafult dewtails while saving the data 
   */
  GetItemsDefault() {
    this.shimmerVisible = true;
    this.allItemsService.GetItemTypesDefault().subscribe(data => {
      this.SubCategoryList = data.Result.getDepartmentType
      this.shimmerVisible = false;
    },
    (err: HttpErrorResponse) => {
      this.shimmerVisible = false;
      
    })
  }
  /**
   * This method is used for Save the Item Types
   */
  SaveItemTypes() {
    FormValueTrimeer.cleanForm(this.ItemTypeForm);
    this.allItemsService.SaveItemTypes(this.ItemTypeForm.value).subscribe(data => {
      this.router.navigateByUrl('/items/item-types');
    })
  }
  /**
   * This method is used for Get the selected item type details 
   */
  GetSelectedItemTypeDetails() {
    this.ItemTypeForm.patchValue({
      ItemTypeGuid: this.SelectedItemTypeDetails ? this.SelectedItemTypeDetails.ItemTypeGuid : '',
      SubCategoryTypeGuid: this.SelectedItemTypeDetails ? this.SelectedItemTypeDetails.CategoryTypeGuid : '',
      ItemTypeName: this.SelectedItemTypeDetails ? this.SelectedItemTypeDetails.ItemTypeName : '',
      ItemTypeCode: this.SelectedItemTypeDetails ? this.SelectedItemTypeDetails.ItemTypeCode : '',
      Description: this.SelectedItemTypeDetails ? this.SelectedItemTypeDetails.Description : '',
      //Status: ['true']
    }, { emitEvent: true })
    this.FormChanged = false
  }
  /**
   * This click event is used for reset the form
   */
  formReset() {
    this.ItemTypeForm.reset();
    if(this.SelectedItemTypeDetails){
      this.GetSelectedItemTypeDetails();
    }
    this.duplicateItem = false;
     this.FormChanged=false;
  }
  /**
   *  It is used to Remove the the specified local storage item.
   */
  ngOnDestroy() {
    localStorage.removeItem('ItemTypeDeatils');
  }
}
