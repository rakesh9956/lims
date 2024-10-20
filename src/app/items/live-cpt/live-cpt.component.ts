import { DatePipe } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormArray, FormBuilder, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import {
  NgbCalendar,
  NgbDateParserFormatter,
  NgbDateStruct,
} from "@ng-bootstrap/ng-bootstrap";
import { Workbook } from "exceljs";
import * as saveAs from "file-saver";
import { distinctUntilChanged, throttleTime } from "rxjs";
import { AllItemsService } from "src/app/core/Services/all-items.service";
import { AuthenticationService } from "src/app/core/Services/authentication.service";
import { CustomDateParserFormatter } from "src/app/core/Services/ngbdate-format.service";
import { QuotationService } from "src/app/core/Services/quotation.service";
import * as XLSX from 'xlsx';
@Component({
  selector: "app-live-cpt",
  templateUrl: "./live-cpt.component.html",
  styleUrls: ["./live-cpt.component.scss"],
  providers: [
    { provide: NgbDateParserFormatter, useClass: CustomDateParserFormatter },
  ],
})
export class LiveCptComponent implements OnInit {
  CPTForm = {} as any;
  UserGuid: string;
  LstLIVECPTDetailsUDT: FormArray = {} as any;
  shimmerVisible: boolean;
  LiveCptGuid: string;
  CPTData: any;
  minDate: NgbDateStruct;
  FormChanged: boolean = false;
  removeTestsList: any;
  uploadExcel=false
  XLdata: unknown[];
  defaultData: any;
  LocationList: any;
  centerList: any;
  constructor(
    private fb: FormBuilder,
    public authservice: AuthenticationService,
    private allItemsService: AllItemsService,
    private router: Router,
    public route: ActivatedRoute,
    private calendar: NgbCalendar,
    private datePipe: DatePipe,
    private quotationService: QuotationService,
  ) {}

  ngOnInit(): void {
    const today = this.calendar.getToday();
    this.minDate = {
      year: today.year,
      month: today.month,
      day: today.day,
    };
    this.UserGuid = this.authservice.LoggedInUser.UserGuid;
    this.LiveCptGuid = this.route.snapshot.paramMap.get("LiveCptGuid") || "";
    this.initForms();
    this.GetReportsLocation()
    if (this.LiveCptGuid) {
      this.GetLiveCPTByGuid();
    }
    this.CPTForm.valueChanges.pipe(distinctUntilChanged(), throttleTime(500)).subscribe((values: any) => {
      this.FormChanged = true;
    })
  }

  initForms(): void {
    this.CPTForm = this.fb.group({
      CPTGuid: [this.LiveCptGuid],
      UserGuid: [this.UserGuid],
      CenterGuid:[null, [Validators.required]],
      LstLIVECPTDetailsUDT: this.fb.array([
        this.fb.group({
          TestName: ["", [Validators.required]],
          TestCode: ["", [Validators.required]],
          Department: ["", [Validators.required]],
          FromDate: ["", [Validators.required]],
          ToDate: ["", [Validators.required]],
          NoOfTests: ["", [Validators.required]],
          OnBoardStack: [null],
          OnHandStack: [null],
          IsDeleted: [false],
          CPTId: [null],
        }),
      ]),
    });
  }
  addTestDetail() {
    const newItemGroup = this.fb.group({
      TestName: ["", [Validators.required]],
      TestCode: ["", [Validators.required]],
      Department: ["", [Validators.required]],
      FromDate: ["", [Validators.required]],
      ToDate: ["", [Validators.required]],
      NoOfTests: ["", [Validators.required]],
      OnBoardStack: [null],
      OnHandStack: [null],
      IsDeleted: [false],
      CPTId: [null],
    });
    this.addItemslist.push(newItemGroup);
  }
  get addItemslist(): FormArray<any> {
    return this.CPTForm.get("LstLIVECPTDetailsUDT") as FormArray;
  }

  removeTestDetail(index: number,item:any) {
    this.removeTestsList?.map((element:any) => {
       if (element.CPTId === item.value.CPTId) {
        element.IsDeleted = true;
      }
    });
    this.addItemslist.removeAt(index);
  }
  GetReportsLocation() {
    this.shimmerVisible = true;
    let DepartmentGuid = this.authservice.LoggedInUser.DEFAULTROLES.toLowerCase().includes('ADMIN'.toLowerCase()) && this.authservice.LoggedInUser.LOCATIONSGUID == '00000000-0000-0000-0000-000000000000' ? '00000000-0000-0000-0000-000000000000' :
      this.authservice.LoggedInUser.LOCATIONSGUID.split(",");
    this.quotationService.getQuotationPostDefaults(DepartmentGuid).subscribe((data: any,) => {
      this.defaultData = data.Result;
      this.LocationList = data.Result.LstQuotationCenterLocationType;
      this.centerList = data.Result.LstQuotationStateDetailsType.filter((f: { CenterGuid: any; }) => this.LocationList.some((filter: { CenterGuid: any; }) => filter.CenterGuid === f.CenterGuid));
      this.shimmerVisible = false;
    }, error => {
      this.shimmerVisible = false;
    })
  }
  SaveCPTDetails() {
    this.CPTForm.value.LstLIVECPTDetailsUDT.forEach((element: any) => {
      element.FromDate = `${element.FromDate.year}-${element.FromDate.month}-${element.FromDate.day}`;
      element.ToDate = `${element.ToDate.year}-${element.ToDate.month}-${element.ToDate.day}`;
    });
    if(this.LiveCptGuid){
      this.removeTestsList = this.removeTestsList?.filter(
        (d: any) => d.IsDeleted == true
      );
      this.addItemslist.value.push(...this.removeTestsList)
      console.log('this.addItemslist.value',this.addItemslist.value)
      console.log('this.removeTestsList',this.removeTestsList)
    }
    
    this.allItemsService.SaveLiveCPT(this.CPTForm.value).subscribe(
      (saveitemDetails: any) => {
        this.shimmerVisible = false;
        this.router.navigateByUrl("/items/all-live-cpt");
      },
      (err: any) => {
        // this.globalservice.stopSpinner();
        this.shimmerVisible = false;
      }
    );
  }
  /**
   * This method is used to get the live cpt details by guid.
   * This method call the service method GetLiveCPTByGuid and subscribe the response.
   * If the response is success then it will set the shimmerVisible to false.
   * If there is any error then it will also set the shimmerVisible to false.
   */
  GetLiveCPTByGuid() {
    this.shimmerVisible = true;
    this.allItemsService.GetLiveCPTByGuid(this.LiveCptGuid).subscribe(
      (CPTitemDetails: any) => {
        this.shimmerVisible = false;
        this.CPTData = CPTitemDetails.Result.getLiveCPTByGuid;
        this.removeTestsList = CPTitemDetails.Result.getLiveCPTByGuid;
        this.patchEditedValues();
      },
      (err: any) => {
        // this.globalservice.stopSpinner();
        this.shimmerVisible = false;
      }
    );
  }
  patchEditedValues() {
    this.addItemslist.clear();
    this.CPTForm.patchValue({
      CenterGuid:this.CPTData[0].CenterGuid
    })
    this.CPTData?.forEach((element: any) => {
      this.addItemslist.push(
        this.fb.group({
          TestName: [element.TestName, Validators.required],
          TestCode: [element.TestCode, Validators.required],
          Department: [element.Department, Validators.required],
          ToDate: [
            {
              day: new Date(element.ToDate).getDate(),
              month: new Date(element.ToDate).getMonth() + 1,
              year: new Date(element.ToDate).getFullYear(),
            },
            Validators.required,
          ],
          FromDate: [
            {
              day: new Date(element.FromDate).getDate(),
              month: new Date(element.FromDate).getMonth() + 1,
              year: new Date(element.FromDate).getFullYear(),
            },
            Validators.required,
          ],
          NoOfTests: [element.NoOfTests, Validators.required],
          OnBoardStack: '',
          OnHandStack: '',
          IsDeleted: [element.IsDeleted, Validators.required],
          CPTId: [element.CPTId, Validators.required],
        })
      );
    }, { emitEvent: true });
    this.FormChanged=false
  }
  resetForm(){
    this.addItemslist.clear();
    this.addTestDetail();
    if (this.LiveCptGuid) {
      this.GetLiveCPTByGuid();
    }
    this.FormChanged=false
  }
  downloadSampleExcel()
  {
    const header = ['TestCode','TestName','Department','FromDate', 'ToDate','NoOfTests', 'OnBoardStack', 'OnHandStack'];
    // Create workbook and worksheet
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('Sharing Data');
    // Add Header Row
    const headerRow = worksheet.addRow(header);
    // Cell Style : Fill and Border
    headerRow.eachCell((cell:any, number:any) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFFF00' },
        bgColor: { argb: 'FF0000FF' }
      };
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    });
    worksheet.getColumn(1).width = 30;
    worksheet.getColumn(2).width = 30;
    worksheet.getColumn(3).width = 30;
    worksheet.getColumn(4).width = 30;
    worksheet.getColumn(5).width = 30;
    worksheet.getColumn(6).width = 30;
    worksheet.getColumn(7).width = 30;
    worksheet.getColumn(8).width = 30;

    worksheet.addRow([]);
     // Create a file name for the downloaded file
     const fileName = 'LiveCPT.xlsx';
     // Generate Excel File with given name
     workbook.xlsx.writeBuffer().then((data: any) => {
       const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
       saveAs(blob, fileName);
     });
  }
  uploadData(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.readExcelFile(file);
    }
  }
  readExcelFile(file: File) {
    const reader = new FileReader();

    reader.onload = (e: any) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      // Assuming the Excel sheet is named 'Sheet1'
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      // Parse the worksheet data and handle date format
      this.XLdata = XLSX.utils.sheet_to_json(worksheet, { raw: false, dateNF: 'yyyy-mm-dd' });
      // Your data is now in jsonData, and dates are parsed correctly
      console.log('this.XLdata',this.XLdata);
    };

    reader.readAsArrayBuffer(file);
  }
  SaveQutaionFromXLData(){
    let lstItemsDetailsFromXL :any=[]
    this.LiveCptGuid?null:this.addItemslist.clear();
    this.XLdata?.forEach((element: any) => {
      this.addItemslist.push(
        this.fb.group({
          TestName: element.TestName,
          TestCode: element.TestCode,
          Department: element.Department,
          ToDate: [
            {
              day: new Date(element.ToDate).getDate(),
              month: new Date(element.ToDate).getMonth() + 1,
              year: new Date(element.ToDate).getFullYear(),
            },
            Validators.required,
          ],
          FromDate: [
            {
              day: new Date(element.FromDate).getDate(),
              month: new Date(element.FromDate).getMonth() + 1,
              year: new Date(element.FromDate).getFullYear(),
            },
            Validators.required,
          ],
          NoOfTests: element.NoOfTests,
          OnBoardStack: '',
          OnHandStack: '',
          IsDeleted:false,
          CPTId: '',
        })
      );
    }, { emitEvent: true });
    this.uploadExcel=false
  }
}
