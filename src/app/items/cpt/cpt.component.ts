import { Component, OnInit } from "@angular/core";
import { FormArray, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import {
  debounceTime,
  distinctUntilChanged,
  Subject,
  throttleTime,
} from "rxjs";
import { AllItemsService } from "src/app/core/Services/all-items.service";
import { AuthenticationService } from "src/app/core/Services/authentication.service";
import { QuotationService } from "src/app/core/Services/quotation.service";

@Component({
  selector: "app-cpt",
  templateUrl: "./cpt.component.html",
  styleUrls: ["./cpt.component.scss"],
})
export class CptComponent implements OnInit {
  SpinnerCheck: boolean = false;
  testForm = {} as any;
  parentForm = {} as any;
  UserGuid: string;
  lstCPTDetails: FormArray = {} as any;
  shimmerVisible: boolean;
  SearchItems: any;
  allItems: any;
  Keyword: any;
  pageNumber: number = 1;
  rowCount: number = 40;
  itemOrder: string = "";
  sort: string = "";
  IsActive: boolean = true;
  editAllItems: any;
  modelChanged = new Subject<string>();
  TestCodeChanged = new Subject<{
    TestCode: string;
    ItemIndex: number;
    TestIndex: number;
    ItemGuid: string;
  }>();
  allItemsList: any;
  FormChanged: boolean = false;
  lstDepartmentType: any;
  lstGetItemType: any;
  CPTGuid: string = "";
  CPTDetails: any;
  removeTestsList: any;
  TestCodeKeyword: string;
  TotalCount: number;
  isDuplicate: boolean = false;
  constructor(
    private fb: FormBuilder,
    public authservice: AuthenticationService,
    private allItemsService: AllItemsService,
    public route: ActivatedRoute,
    private quotationService: QuotationService,
    private router: Router
  ) {
    this.modelChanged.pipe(debounceTime(1000)).subscribe((model) => {
      this.Keyword = model;
      this.getAllItemDetails();
    });
    this.TestCodeChanged.pipe(debounceTime(1000)).subscribe((data) => {
      this.TestCodeKeyword = data.TestCode;
      this.GetAllCpt(data?.ItemIndex, data?.TestIndex, data?.ItemGuid);
    });
  }

  /**
   * Lifecycle hook that is called after the component is initialized.
   * It calls the initForms() method to initialize the form controls.
   */
  ngOnInit(): void {
    this.UserGuid = this.authservice.LoggedInUser.UserGuid;
    this.CPTGuid = this.route.snapshot.paramMap.get("CPTGuid") || "";
    this.initForms();
    this.getItemDefaults();
    if (this.CPTGuid) {
      this.getCPTByGuid();
    }
    this.parentForm.valueChanges
      .pipe(distinctUntilChanged(), throttleTime(500))
      .subscribe((values: any) => {
        this.FormChanged = true;
      });
  }
  /**
   * Initializes the form controls and their validators.
   *
   * The form group is created with the following controls:
   * - CPTGuid: empty string
   * - itemGuid: required
   * - UserGuid: required
   * - lstCPTDetails: an array of form groups with the following controls:
   *   - testName: required
   *   - testCode: required
   */
  initForms(): void {
    this.parentForm = this.fb.group({
      CPTGuid: [this.CPTGuid],
      UserGuid: [this.UserGuid],
      ItemDetailsList: this.fb.array([]),
    });
    if (!this.CPTGuid) {
      this.addForm();
    }
  }
  get forms(): FormArray {
    return this.parentForm.get("ItemDetailsList") as FormArray;
  }
  createForm(): FormGroup {
    return this.fb.group({
      itemGuid: [null, [Validators.required]],
      ItemName: [null, [Validators.required]],
      itemTypeGuid: [null, [Validators.required]],
      departmentTypeGuid: [null, [Validators.required]],
      lstCPTDetails: this.fb.array([
        this.fb.group({
          TestName: ["", [Validators.required]],
          TestCode: ["", [Validators.required]],
          CPTId: [""],
          isDeleted: [false],
          DuplicateItemCheck: [false],
        }),
      ]),
    });
  }
  addForm() {
    this.forms.push(this.createForm());
  }
  /**
   * Returns the FormArray for the list of tests in the form.
   * This is a convenience property that makes it easier to access the FormArray
   * that contains the list of tests in the form.
   * @returns a FormArray containing the list of tests in the form.
   */
  addCPTDetail(formIndex: number): void {
    const lstCPTDetails = this.getCPTDetails(formIndex);
    lstCPTDetails.push(
      this.fb.group({
        TestName: ["", [Validators.required]],
        TestCode: ["", [Validators.required]],
        CPTId: [""],
        isDeleted: [false],
        DuplicateItemCheck: [false],
      })
    );
  }
  getCPTDetails(formIndex: number): FormArray {
    return this.forms.at(formIndex).get("lstCPTDetails") as FormArray;
  }
  get ItemDetailsList(): FormArray {
    return this.parentForm.get("ItemDetailsList") as FormArray;
  }

  /**
   * Removes the test at the given index from the list of tests in the form.
   * @param index the index of the test to remove
   */
  removeItems(index: any) {
    this.ItemDetailsList.removeAt(index);
  }
  removeTest(index: number, ItemIndex: number, item: any) {
    this.removeTestsList?.map((items: any) => {
      if (items.CPTId === item.value.CPTId) {
        items.IsDeleted = true;
      }
    });
    let data: any = this.getCPTDetails(ItemIndex);
    data.removeAt(index);
  }
  getItemDefaults() {
    this.shimmerVisible = true;
    // this.globalService.startSpinner();
    this.allItemsService.getItemsDefaults().subscribe(
      (data) => {
        this.lstDepartmentType = data.Result.getDepartmentType;
        this.lstGetItemType = data.Result.GetItemType;
        this.shimmerVisible = false;
      },
      (err) => {
        //this.globalService.stopSpinner();
        this.shimmerVisible = false;
      }
    );
  }
  changeSearch(event: any) {
    this.modelChanged.next(event.target.value);
  }
  getAllItemDetails() {
    this.allItems = [];
    this.Keyword =
      this.Keyword == undefined || this.Keyword == null
        ? this.Keyword || ""
        : this.Keyword;
    if (this.Keyword != "") {
      this.SpinnerCheck = true;
    }
    this.quotationService
      .getAllItems(
        this.pageNumber,
        this.rowCount,
        this.Keyword,
        this.itemOrder,
        this.sort,
        this.IsActive
      )
      .subscribe((data) => {
        this.allItems = data.Result.getAllItemsResponses;
        this.SpinnerCheck = false;
        if (this.Keyword != "") {
          this.allItems = this.allItems.filter(
            (value: any, index: any, self: any) => {
              return (
                index ===
                  self.findIndex(
                    (t: any) =>
                      (t.ItemGuid === value.ItemGuid ||
                        t.ItemName === value.ItemName) &&
                      value.IsDeleted == false
                  ) && value.ApprovalStatus === 2
              );
            }
          );
        } else {
          this.editAllItems = this.allItems.filter(
            (value: any, index: any, self: any) => {
              return (
                index ===
                  self.findIndex(
                    (t: any) =>
                      (t.ItemGuid === value.ItemGuid ||
                        t.ItemName === value.ItemName) &&
                      value.IsDeleted == false
                  ) && value.ApprovalStatus === 2
              );
            }
          );
        }
      });
  }
  ItemSearch(event: any, index: number) {
    this.allItemsList = this.allItems.filter(
      (Items: any) =>
        Items.ItemGuid == event.ItemGuid && Items.ItemName == event.ItemName
    );
    let data = this.forms.at(index);
    data.patchValue({
      itemGuid: event.ItemGuid,
      ItemName: event.ItemName,
      departmentTypeGuid: event.DepartmentGuid,
      itemTypeGuid: event.ItemTypeGuid,
    });
    this.allItems = this.allItemsList?.filter(
      (Items: any) =>
        Items.ItemGuid != event.ItemGuid && Items.ItemName != event.ItemName
    );
  }

  CPTFormReset() {
    this.parentForm.reset();
    this.ItemDetailsList?.clear();
    this.addForm();
    if (this.CPTGuid) {
      this.getCPTByGuid();
    }
    this.FormChanged = false;
  }
  saveCPT() {
    this.removeTestsList = this.removeTestsList?.filter(
      (d: any) => d.IsDeleted == true
    );
    this.parentForm.value.ItemDetailsList.forEach((data: any) => {
      this.removeTestsList?.forEach((data1: any) => {
        if (data.itemGuid == data1.ItemGuid) {
          data.lstCPTDetails.push({
            TestName: data1.TestName,
            TestCode: data1.TestCode,
            CPTId: data1.CPTId,
            isDeleted: data1.IsDeleted,
          });
        }
      });
    });
    this.allItemsService.saveCPT(this.parentForm.value).subscribe(
      (saveitemDetails: any) => {
        this.shimmerVisible = false;
        this.router.navigateByUrl("/items/all-cpt");
      },
      (err: any) => {
        // this.globalservice.stopSpinner();
        this.shimmerVisible = false;
      }
    );
  }
  getCPTByGuid() {
    this.shimmerVisible = true;
    this.allItemsService.GetCPTByGuid(this.CPTGuid).subscribe(
      (cptDetails: any) => {
        this.CPTDetails = cptDetails.Result;
        this.removeTestsList = cptDetails.Result;
        this.bindCPTDetailsForEdit();
      },
      (err: any) => {
        // this.globalservice.stopSpinner();
        this.shimmerVisible = false;
      }
    );
  }
  bindCPTDetailsForEdit() {
    const itemDetailsArray: any = this.parentForm.get(
      "ItemDetailsList"
    ) as FormArray;
    itemDetailsArray.clear();
    const itemFormGroup = this.createForm();
    itemFormGroup.patchValue({
      itemGuid: this.CPTDetails[0].ItemGuid,
      ItemName: this.CPTDetails[0].ItemName,
      itemTypeGuid: this.CPTDetails[0].ItemTypeGuid,
      departmentTypeGuid: this.CPTDetails[0].DepartmentTypeGuid,
    });
    const cptDetailsArray = itemFormGroup.get("lstCPTDetails") as FormArray;
    cptDetailsArray.clear();
    this.CPTDetails.forEach(
      (element: any) => {
        cptDetailsArray.push(
          this.fb.group({
            TestName: [element.TestName, [Validators.required]],
            TestCode: [element.TestCode, [Validators.required]],
            CPTId: [element.CPTId],
            isDeleted: [element.IsDeleted],
            DuplicateItemCheck: [false],
          })
        );
      },
      { emitEvent: true }
    );
    itemDetailsArray.push(itemFormGroup);
    this.FormChanged = false;
    this.shimmerVisible = false;
  }
  checkDuplicateTest(
    event: any,
    ItemIndex: number,
    TestIndex: number,
    ItemGuid: string
  ) {
    const TestCode = event.target.value;
    this.TestCodeChanged.next({ TestCode, ItemIndex, TestIndex, ItemGuid });
  }
  GetAllCpt(ItemIndex: number, TestIndex: number, ItemGuid: string) {
    this.TestCodeKeyword =
      this.TestCodeKeyword == undefined || this.TestCodeKeyword == null
        ? this.TestCodeKeyword || ""
        : this.TestCodeKeyword;
    this.allItemsService
      .GetAllCpts(
        this.pageNumber,
        this.rowCount,
        "",
        this.itemOrder,
        this.sort,
        this.TestCodeKeyword,
        ItemGuid
      )
      .subscribe(
        (data) => {
          this.TotalCount = data.Result.TotalCount;
          const dataaa = this.forms.at(ItemIndex) as FormGroup;
          const cptDetailsArray = dataaa.get("lstCPTDetails") as FormArray;
          const testItem = cptDetailsArray.at(TestIndex) as FormGroup;
          testItem.patchValue({
            DuplicateItemCheck: this.TotalCount > 0,
          });
        },
        (error) => {
          this.shimmerVisible = false;
        }
      );
  }
  hasDuplicateItems(): boolean {
    const itemDetailsList = this.parentForm.get("ItemDetailsList") as FormArray;
    if (!itemDetailsList || itemDetailsList.length === 0) {
      return false;
    }

    return itemDetailsList.controls.some((itemGroup: any) => {
      const cptDetails = itemGroup.get("lstCPTDetails") as FormArray;
      return cptDetails.controls.some((detailGroup: any) => {
        return detailGroup.get("DuplicateItemCheck")?.value === true;
      });
    });
  }
  isTestCodeDuplicate(itemIndex: number, testIndex: number): boolean {
    const itemDetailsList: any = this.parentForm.get(
      "ItemDetailsList"
    ) as FormArray;
    const currentItem = itemDetailsList?.at(itemIndex);
    const currentTestCode: any =
      currentItem?.get("lstCPTDetails").value[testIndex].TestCode;
    const currentItemGuid: any = currentItem?.get("itemGuid")?.value; // Fetch the current ItemGuid

    if (!currentTestCode || !currentItemGuid) {
      return false;
    }

    for (let i = 0; i < itemDetailsList.length; i++) {
      const item = itemDetailsList.at(i);
      const itemGuid = item.get("itemGuid")?.value;
      const cptDetails = item.get("lstCPTDetails") as FormArray;

      for (let j = 0; j < cptDetails.length; j++) {
        if (i === itemIndex && j === testIndex) {
          continue; // Skip current item
        }

        const testCode = cptDetails.at(j).get("TestCode")?.value;

        // Check for duplicate TestCode and ItemGuid
        if (
          testCode &&
          testCode === currentTestCode &&
          itemGuid === currentItemGuid
        ) {
          this.isDuplicate = true;
          return true; // Duplicate found
        }
      }
    }

    this.isDuplicate = false;
    return false; // No duplicate found
  }
}
