import { DatePipe } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormControl } from "@angular/forms";
import {
  NgbCalendar,
  NgbDateParserFormatter,
  NgbDateStruct,
} from "@ng-bootstrap/ng-bootstrap";
import { Workbook } from "exceljs";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { AllItemsService } from "src/app/core/Services/all-items.service";
import { AuthenticationService } from "src/app/core/Services/authentication.service";
import { CustomDateParserFormatter } from "src/app/core/Services/ngbdate-format.service";
import { ColumnMode } from "@swimlane/ngx-datatable";
import { QuotationService } from "src/app/core/Services/quotation.service";

@Component({
  selector: "app-live-cpt-report",
  templateUrl: "./live-cpt-report.component.html",
  styleUrls: ["./live-cpt-report.component.scss"],
})
export class LiveCptReportComponent implements OnInit {
  shimmerVisible: boolean;
  ColumnMode = ColumnMode;
  loadingIndicator: boolean = true;
  UnparsedHtml: any =
    '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Indent Report</title><style>table{border-collapse:collapse;border:1px solid #000}table td,table th{border-bottom:1px solid #000;border-right:1px solid #000;padding:5px;text-align:left;word-wrap:break-word;word-break:break-all;font-size:10px}table th{background-color:#ccc}.logo{height:28px;display:flex;align-items:center;justify-content:center;padding:20px 0}</style></head><body><table style="text-align:center;table-layout:fixed" width="100%"><tbody><tr><td><div class="logo"><img data-v-0e549244="" src="assets/images/YodaLIMSLogo.png" alt="Yoda LIMS"></div></td></tr></tbody></table><table style="text-align:center;table-layout:fixed" width="100%"><tbody><tr><td style="text-align:center;font-weight:700;font-size:16px">Purchase Item Report</td></tr><tr><td style="text-align:center;font-weight:700;font-size:14px">As On :%%newDate%%</td></tr></tbody></table><table style="table-layout:fixed;margin-top:20px" width="100%"><thead><tr><th>Location name</th><th>Manufacture name</th><th>Created date</th><th>Item name</th><th>Catalog no.</th><th>PO number</th><th>Item price</th><th>Ordered qty</th><th>Order value</th><th>Pack size</th><th>Approved by</th><th>Checked by</th></tr></thead><tbody><tr id="purchaseReport"><td>%%LocationName%%</td><td>%%Manufacture name%%</td><td>%%Created date%%</td><td>%%ItemName%%</td><td>%%Catalog no.%%</td><td>%%PONumber%%</td><td>%%ItemPrice%%</td><td>%%Ordered Qty%%</td><td>%%Order Value%%</td><td>%%Pack Size%%</td><td>%%ApprovedBy%%</td><td>%%CheckedByName%%</td></tr><tr><th colspan="10" style="text-align:right">Total Amount</th><td>%%TotalAmount%%</td></tr></tbody></table></body></html>';
  locations: any;
  locationGuid: any = [];
  fromDate: any = "";
  toDate: any = "";
  newDate: string | null;
  purchaseReport: any = [];
  CenterName: FormControl = new FormControl();
  LocationName: FormControl = new FormControl();
  ClearFromDate: FormControl = new FormControl();
  ClearToDate: FormControl = new FormControl();
  TestCodes: FormControl = new FormControl();
  TotalCount: any;
  locationsList: any;
  centerList: any;
  defaultData: any;
  TotalOrdervalue: any;
  selectfromDate: any;
  isDisabled: Boolean = true;
  noDataFound: boolean = false;
  totalPageNumbers: any;
  AllCPTReport: any = [];
  KitLiveCPT: number;
  allLiveCptList: any;
  TestCode:string=''
  constructor(
    private allItemsService: AllItemsService,
    private datepipe: DatePipe,
    private authservice: AuthenticationService,
    private quotationservice: QuotationService,
    public calendar: NgbCalendar,
    private datePipe: DatePipe
  ) {}

  ngOnInit(): void {
    const currentDate = new Date();
    this.newDate = this.datepipe.transform(currentDate, "dd-MMM-yyyy hh:mm a");
    this.getDefaultData();
    this.GetAllCpt();
  }
  GetAllCpt() {
    this.shimmerVisible = true;
    this.allItemsService.GetAllLiveCpts(1, 20, "", "", "").subscribe(
      (data) => {
        this.allLiveCptList = data.Result.lstGetAllLiveCpts;
        if (this.allLiveCptList?.length > 0) {
          this.TotalCount = data.Result.TotalCount;
        }
        this.shimmerVisible = false;
      },
      (error) => {
        this.shimmerVisible = false;
      }
    );
  }
  DownloadPdfNew(allCPTReport: any) {
    const doc = new jsPDF({ orientation: "landscape" });

    let array = 0;
    for (let data of allCPTReport) {
      const netTotal = parseFloat(data.NetAmount);
      if (!isNaN(netTotal)) {
        array += netTotal;
      }
    }
    const headerColStyles = {
      fontSize: 8,
      fillColor: "#f8fcf2",
      textColor: "#000000",
      lineColor: "#03c136",
      minCellWidth: 10,
    };

    const mainTableColStyles = {
      ...headerColStyles,
      cellWidth: 14.5,
    };

    const footerRowStyles = {
      fontSize: 8,
      fillColor: "#00435d",
      textColor: "#fff",
      lineColor: "#fff",
    };

    function createHeaderCols() {
      return [
        {
          content: "S.No",
          styles: {
            ...mainTableColStyles,
            cellWidth: 10,
            lineColor: "#03c136",
            lineWidth: 0.1,
          },
        },
        {
          content: "Test Code",
          styles: {
            ...mainTableColStyles,
            cellWidth: 40,
            lineColor: "#03c136",
            lineWidth: 0.1,
          },
        },
        {
          content: "Test Name",
          styles: {
            ...mainTableColStyles,
            cellWidth: 40,
            lineColor: "#03c136",
            lineWidth: 0.1,
          },
        },
        {
          content: "Item Code",
          styles: {
            ...mainTableColStyles,
            cellWidth: 20,
            lineColor: "#03c136",
            lineWidth: 0.1,
          },
        },
        {
          content: "CAT Number",
          styles: {
            ...mainTableColStyles,
            cellWidth: 20,
            lineColor: "#03c136",
            lineWidth: 0.1,
          },
        },
        {
          content: "Manufacturer",
          styles: {
            ...mainTableColStyles,
            cellWidth: 25,
            lineColor: "#03c136",
            lineWidth: 0.1,
          },
        },
        {
          content: "Item Name",
          styles: {
            ...mainTableColStyles,
            cellWidth: 40,
            lineColor: "#03c136",
            lineWidth: 0.1,
          },
        },
        {
          content: "Item Category",
          styles: {
            ...mainTableColStyles,
            cellWidth: 30,
            lineColor: "#03c136",
            lineWidth: 0.1,
          },
        },
        {
          content: "Tests Regostered As per LIS",
          styles: {
            ...mainTableColStyles,
            cellWidth: 18,
            lineColor: "#03c136",
            lineWidth: 0.1,
          },
        },
        {
          content: "Test CPT",
          styles: {
            ...mainTableColStyles,
            cellWidth: 15,
            lineColor: "#03c136",
            lineWidth: 0.1,
          },
        },
        {
          content: "Kit Live CPT",
          styles: {
            ...mainTableColStyles,
            cellWidth: 15,
            lineColor: "#03c136",
            lineWidth: 0.1,
          },
        },
        {
          content: "No.Of Times  CPT Increased",
          styles: {
            ...mainTableColStyles,
            cellWidth: 18,
            lineColor: "#03c136",
            lineWidth: 0.1,
          },
        },
      ];
    }

    function createBodyRows() {
      let formulaResult: any;
      allCPTReport?.forEach((item: any) => {
        formulaResult =
          ((item.ConsumeQty / item.NoOfTests) *
            (item.ItemRate / item.NoOfTestFotItem)) |
          0;
      });
      let bodyRows = [];
      for (let i = 0; i < allCPTReport.length; i++) {
        bodyRows.push([
          {
            content: String(i + 1),
            styles: { minCellWidth: 10, fontSize: 8 },
          },
          {
            content: allCPTReport[i].TestCode,
            styles: { minCellWidth: 40, fontSize: 8 },
          },
          {
            content: allCPTReport[i].TestName || "N/A",
            styles: { minCellWidth: 40, fontSize: 8 },
          },
          {
            content: allCPTReport[i].ItemCode || "N/A",
            styles: { minCellWidth: 20, fontSize: 8 },
          },
          {
            content: allCPTReport[i].CATNumber || "N/A",
            styles: { minCellWidth: 20, fontSize: 8 },
          },
          {
            content: allCPTReport[i].Manufacturer || "N/A",
            styles: { minCellWidth: 25, fontSize: 8 },
          },
          {
            content: allCPTReport[i].ItemName || "N/A",
            styles: { minCellWidth: 40, fontSize: 8 },
          },
          {
            content: allCPTReport[i].SubCategoryName || "N/A",
            styles: { minCellWidth: 30, fontSize: 8 },
          },
          {
            content: allCPTReport[i].NoOfTests || "N/A",
            styles: { minCellWidth: 15, fontSize: 8 },
          },
          {
            content:
              allCPTReport[i].NoOfTestFotItem === 0
                ? 0
                : allCPTReport[i].ItemRate / allCPTReport[i].NoOfTestFotItem ||
                  "N/A",
            styles: { minCellWidth: 15, fontSize: 8 },
          },
          {
            content:
              ((allCPTReport[i].ConsumeQty / allCPTReport[i].NoOfTests) *
                (allCPTReport[i].ItemRate / allCPTReport[i].NoOfTestFotItem)) |
                0 || "N/A",
            styles: { minCellWidth: 15, fontSize: 8 },
          },
          {
            content:
              allCPTReport[i].NoOfTestFotItem === 0
                ? 0
                : (
                    ((allCPTReport[i].ConsumeQty / allCPTReport[i].NoOfTests) *
                      (allCPTReport[i].ItemRate /
                        allCPTReport[i].NoOfTestFotItem)) /
                    (allCPTReport[i].ItemRate / allCPTReport[i].NoOfTestFotItem)
                  )
                    .toString()
                    .match(/^\d+(?:\.\d{0,9})?/) || "N/A",
            styles: { minCellWidth: 15, fontSize: 8 },
          },
        ]);
      }
      return bodyRows;
    }
    const imageUrl =
      "https://yoda-inventory-management.s3.ap-south-1.amazonaws.com/yodalims/invoices/yoda diagnostics logo copy_page-0001.jpg";
    const imageWidth = 110;
    const imageHeight = 15;
    const imageXPos = 100;
    const imageYPos = 5;

    doc.addImage(
      imageUrl,
      "PNG",
      imageXPos,
      imageYPos,
      imageWidth,
      imageHeight
    );

    let cursorY1 = imageYPos + imageHeight + 5;
    const tableWidth = 290;

    function createSecondaryImg() {
      const imageWidth = 70;
      const imageHeight = 10;
      const imageXPos = 220;
      const imageYPos = 8;
      doc.addImage(
        imageUrl,
        "PNG",
        imageXPos,
        imageYPos,
        imageWidth,
        imageHeight
      );
    }

    function createPageFooter() {
      const currentDate = new Date();
      const formattedDate = currentDate
        .toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })
        .replace(/ /g, "-");
      // const text = `Date: ${formattedDate}\nThis is comput
    }

    function createTitle(yPos: any) {
      const headline1Content = "Live CPT";
      const headline1XPos = 3;
      const headline1YPos = imageYPos + 5 - yPos;
      const headline1FontSize = 10;
      return doc
        .text(headline1Content, headline1XPos, headline1YPos)
        .setFontSize(headline1FontSize);
    }
    function generateGRNTable() {
      return autoTable(doc, {
        foot: [
          [
            {
              content: "Live CPT",
              styles: {
                fillColor: "#fff",
                textColor: "#000000",
                lineWidth: 0.1,
                lineColor: "#cecece",
                halign: "center",
                fontSize: 14,
              },
              colSpan: 2,
            },
          ],
        ],
        startY: cursorY1,
        theme: "grid",
        tableWidth: tableWidth,
        margin: { left: 3 },
      });
    }

    function generateMainTable() {
      return autoTable(doc, {
        head: [createHeaderCols()],
        body: createBodyRows(),
        theme: "grid",
        tableWidth: tableWidth,
        margin: { left: 3, top: 30 },
        willDrawPage: (data) => {},
        didDrawPage: (data) => {
          if (data.pageNumber > 1) {
            createTitle(0);
            createSecondaryImg();
          }
        },
      });
    }

    generateGRNTable();
    generateMainTable();
    createPageFooter();
    doc.save(`Live-CPT-report.pdf`);
  }
  downloadExcel() {
    const header = [
      "S.No",
      "Test Code",
      "Test Name",
      "Item Code",
      "CAT Number",
      "Manufacture",
      "Item Name",
      "Item Category",
      "Tests Regostered As per LIS",
      "Test CPT",
      "Kit Live CPT",
      "No.Of Times CPT Increased",
    ];
    // Create workbook and worksheet
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet("Sharing Data");
    const fromDateParts = this.fromDate.split("-");
    const toDateParts = this.toDate.split("-");
    const formattedFromDate =
      this.fromDate != ""
        ? fromDateParts[2] + "-" + fromDateParts[1] + "-" + fromDateParts[0]
        : null;
    const formattedToDate =
      this.toDate != ""
        ? toDateParts[2] + "-" + toDateParts[1] + "-" + toDateParts[0]
        : null;
    const headline2Content =
      "Period From: " + formattedFromDate + " Period To: " + formattedToDate;
    worksheet.addRow([null, null, null, null, null, null, "Live CPT Report"]);
    worksheet.addRow([null, null, null, null, null, null, headline2Content]);
    const cell1 = worksheet.getCell("G1");
    const cell2 = worksheet.getCell("G2");
    cell1.alignment = { horizontal: "center" };
    cell2.alignment = { horizontal: "center" };
    cell1.font = { bold: true, size: 20 };
    cell2.font = { bold: true, size: 15 };
    worksheet.addRow([]);
    // Add Header Row
    const headerRow = worksheet.addRow(header);
    // Cell Style : Fill and Border
    headerRow.eachCell((cell: any, number: any) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFFFFF00" },
        bgColor: { argb: "FF0000FF" },
      };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });

    worksheet.getColumn(1).width = 30;
    worksheet.getColumn(2).width = 15;
    worksheet.getColumn(2).width = 15;
    worksheet.getColumn(3).width = 40;
    worksheet.getColumn(4).width = 20;
    worksheet.getColumn(5).width = 20;
    worksheet.getColumn(6).width = 20;
    worksheet.getColumn(7).width = 20;
    worksheet.getColumn(8).width = 20;
    worksheet.getColumn(9).width = 20;
    worksheet.getColumn(10).width = 20;
    worksheet.getColumn(11).width = 20;
    worksheet.getColumn(12).width = 15;
    worksheet.getColumn(13).width = 30;
    worksheet.getColumn(14).width = 30;
    worksheet.getColumn(15).width = 30;

    const liveCPTSumByTestCode: { [testCode: string]: number } = {};

    this.AllCPTReport.forEach((item: any) => {
      const formulaResult =
        ((item.ConsumeQty / item.NoOfTests) *
          (item.ItemRate / item.NoOfTestFotItem)) |
        0;

      if (item.TestCode) {
        if (!liveCPTSumByTestCode[item.TestCode]) {
          liveCPTSumByTestCode[item.TestCode] = 0;
        }
        liveCPTSumByTestCode[item.TestCode] += formulaResult;
      }
    });

    this.AllCPTReport.forEach((item: any, index: number) => {
      const formulaResult =
        ((item.ConsumeQty / item.NoOfTests) *
          (item.ItemRate / item.NoOfTestFotItem)) |
        0;
      const row = worksheet.addRow([
        index + 1,
        item.TestCode,
        item.TestName,
        item.ItemCode,
        item.CATNumber,
        item.Manufacture,
        item.ItemName,
        item.SubCategoryName,
        item.NoOfTests,
        item.NoOfTestFotItem == 0 ? 0 : item.ItemRate / item.NoOfTestFotItem,
        formulaResult,
        formulaResult /
          (item.NoOfTestFotItem == 0
            ? 0
            : item.ItemRate / item.NoOfTestFotItem),
      ]);
    });
    const fileName = "LiveCPT-print.xlsx";
    workbook.xlsx.writeBuffer().then((data: any) => {
      const blob = new Blob([data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      saveAs(blob, fileName);
    });
  }

  getDefaultData() {
    // this.globalService.startSpinner()
    this.shimmerVisible = true;
    const DepotmentGuid =
      this.authservice.LoggedInUser.DEFAULTROLES.toLowerCase().includes(
        "ADMIN".toLowerCase()
      ) &&
      this.authservice.LoggedInUser.LOCATIONSGUID ==
        "00000000-0000-0000-0000-000000000000"
        ? "00000000-0000-0000-0000-000000000000"
        : this.authservice.LoggedInUser.LOCATIONSGUID.split(",");
    this.quotationservice.getQuotationPostDefaults(DepotmentGuid).subscribe(
      ({ Result }) => {
        // this.globalService.stopSpinner();

        this.defaultData = Result;
        this.locationsList = Result.LstQuotationCenterLocationType;
        this.centerList = Result.LstQuotationStateDetailsType.filter(
          (f: { CenterGuid: any }) =>
            this.locationsList.some(
              (filter: { CenterGuid: any }) =>
                filter.CenterGuid === f.CenterGuid
            )
        );
      },
      (err) => {
        // this.globalService.stopSpinner();
        this.shimmerVisible = false;
      }
    );
  }

  getCPTDetails(type: any = null) {
    // this.globalService.startSpinner();
    this.shimmerVisible = true;
    this.allItemsService.GetAllCPTReport(this.fromDate, this.toDate,this.locationGuid,this.TestCode).subscribe(
      (data) => {
        // this.globalService.stopSpinner();
        this.shimmerVisible = false;
        this.AllCPTReport = data.Result;
        this.AllCPTReport.forEach((item: any) => {
          this.KitLiveCPT =
            ((item.ConsumeQty / item.NoOfTests) *
              (item.ItemRate / item.NoOfTestFotItem)) |
            0;
        });
        if (this.AllCPTReport?.length == 0) {
          this.noDataFound = true;
        } else {
          type == "pdf"
            ? this.DownloadPdfNew(this.AllCPTReport)
            : type == "excel"
            ? this.downloadExcel()
            : "";
          this.noDataFound = false;
        }
      },
      (err) => {
        // this.globalService.stopSpinner();
        this.shimmerVisible = false;
      }
    );
  }

  ChangeLocation(event: any) {
    this.locationGuid = [];
    if (event != undefined) {
      if (event.CenterGuid != undefined) {
        this.locationGuid = event.CenterGuid;
      }
    } else {
      this.CenterName.reset();
      this.LocationName.reset();
    }
  }
  ChangeTest(event: any) {
    this.TestCode = '';
    if (event != undefined) {
      if (event.TestCode != undefined) {
        this.TestCode = event.TestCode;
      }
    } else {
      this.TestCodes.reset()
    }
  }
  selectFromDate(event: any) {
    this.toDate = "";
    this.ClearToDate.reset();
    this.isDisabled = true;
    this.selectfromDate = event;
    this.fromDate = event.year + "-" + event.month + "-" + event.day;
    this.noDataFound = false;
  }

  selectToDate(event: any) {
    if (!this.selectfromDate) {
      this.isDisabled = true;
      // this.noDataFound = true
    } else {
      this.isDisabled = false;
      this.noDataFound = false;
    }
    this.toDate = event.year + "-" + event.month + "-" + event.day;
  }

  clearData() {
    this.AllCPTReport=[]
    this.locations = null;
    this.isDisabled = true;
    this.noDataFound = false;
    this.toDate = "";
    this.fromDate = "";
    this.selectfromDate = "";
    this.locationGuid = [];
    this.CenterName.reset();
    this.LocationName.reset();
    this.ClearFromDate.reset();
    this.ClearToDate.reset();
    this.TestCodes.reset();
    this.TestCode = '';
  }
}
