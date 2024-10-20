import { Component, OnInit } from "@angular/core";
import { ColumnMode } from "@swimlane/ngx-datatable";
import { debounceTime, Subject } from "rxjs";
import { AllItemsService } from "../../core/Services/all-items.service";
import autoTable from "jspdf-autotable";
import jsPDF from "jspdf";
import { Workbook } from "exceljs";
import { DatePipe } from "@angular/common";
import * as saveAs from "file-saver";
import { NgbCalendar } from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: "app-get-all-cpts",
  templateUrl: "./get-all-cpts.component.html",
  styleUrls: ["./get-all-cpts.component.scss"],
})
export class GetAllCptsComponent implements OnInit {
  isMenuCollapsed: boolean = true;
  shimmerVisible: boolean;
  loadingIndicator = true;
  ColumnMode = ColumnMode;
  itemOptionsPerPage = [40, 80, 120, 160, 200, 240, 280, 320];
  keyword: string = " ";
  itemOrder: any = " ";
  sort: string = "desc";
  pageNumber = 1;
  rowCount = 40;
  allLiveCptList: any = [];
  TotalCount: any;
  IsShow: boolean = false;
  maxSize: number = 3;
  boundaryLinks: boolean = true;
  size: string = "lg";
  itemsPerPage: any = 40;
  modelChanged = new Subject<string>();
  CPTNO: any;
  CPTGuid: any;
  FromDate: any;
  ToDate: any;
  AllCPTReport: any;
  selectfromDate: any;
 
  constructor(
    private allItemsService: AllItemsService,
    public calendar: NgbCalendar,
  ) {
    this.modelChanged.pipe(debounceTime(1000)).subscribe((model) => {
      this.keyword = model;
      this.GetAllCpt();
    });
  }

  ngOnInit(): void {
    this.GetAllCpt();
    if (window.outerWidth < 480) {
      this.maxSize = 2;
      this.boundaryLinks = false;
      this.size = "sm";
    }
  }
  GetAllCpt() {
    this.shimmerVisible = true;
    this.keyword =
      this.keyword == undefined || this.keyword == null
        ? this.keyword || ""
        : this.keyword;
    this.allItemsService
      .GetAllLiveCpts(
        this.pageNumber,
        this.rowCount,
        this.keyword,
        this.itemOrder,
        this.sort
      )
      .subscribe(
        (data) => {
          this.allLiveCptList = data.Result.lstGetAllLiveCpts;
          if (this.allLiveCptList?.length > 0) {
            this.TotalCount = data.Result.TotalCount;
            this.IsShow = false;
          } else {
            this.IsShow = true;
          }
          this.shimmerVisible = false;
        },
        (error) => {
          this.shimmerVisible = false;
        }
      );
  }
  ChangePagenumber(event: any) {
    this.pageNumber = event;
    this.GetAllCpt();
  }

  changeSearch(Keyword: any) {
    this.pageNumber = 1;
    this.rowCount = 40;
    this.modelChanged.next(Keyword.target.value);
  }
  DownloadPdf(data: any, print: any) {
    const doc = new jsPDF({ orientation: "landscape" });
    this.allItemsService
      .GetLiveCPTByGuid(data.LiveCptGuid)
      .subscribe((Details) => {
        let LiveCptDetails = Details.Result.getLiveCptDetailsResponses;
        let array = 0;
        for (let data of LiveCptDetails) {
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
              content: "No Of Tests",
              styles: {
                ...mainTableColStyles,
                cellWidth: 15,
                lineColor: "#03c136",
                lineWidth: 0.1,
              },
            },
            {
              content: "From Date",
              styles: {
                ...mainTableColStyles,
                cellWidth: 18,
                lineColor: "#03c136",
                lineWidth: 0.1,
              },
            },
            {
              content: "To Date",
              styles: {
                ...mainTableColStyles,
                cellWidth: 18,
                lineColor: "#03c136",
                lineWidth: 0.1,
              },
            },
            {
              content: "ItemName",
              styles: {
                ...mainTableColStyles,
                cellWidth: 40,
                lineColor: "#03c136",
                lineWidth: 0.1,
              },
            },
            {
              content: "SubCategoryName",
              styles: {
                ...mainTableColStyles,
                cellWidth: 30,
                lineColor: "#03c136",
                lineWidth: 0.1,
              },
            },
            {
              content: "OnHandStock",
              styles: {
                ...mainTableColStyles,
                cellWidth: 15,
                lineColor: "#03c136",
                lineWidth: 0.1,
              },
            },
            {
              content: "OnBoardStock",
              styles: {
                ...mainTableColStyles,
                cellWidth: 15,
                lineColor: "#03c136",
                lineWidth: 0.1,
              },
            },
            {
              content: "ConsumeQty",
              styles: {
                ...mainTableColStyles,
                cellWidth: 15,
                lineColor: "#03c136",
                lineWidth: 0.1,
              },
            },
            {
              content: "ItemRate",
              styles: {
                ...mainTableColStyles,
                cellWidth: 15,
                lineColor: "#03c136",
                lineWidth: 0.1,
              },
            },
            {
              content: "CPT Amount",
              styles: {
                ...mainTableColStyles,
                cellWidth: 20,
                lineColor: "#03c136",
                lineWidth: 0.1,
              },
            },
          ];
        }

        function createBodyRows() {
          let bodyRows = [];
          for (let i = 0; i < LiveCptDetails.length; i++) {
            bodyRows.push([
              {
                content: String(i + 1),
                styles: { minCellWidth: 10, fontSize: 8 },
              },
              {
                content: LiveCptDetails[i].TestCode,
                styles: { minCellWidth: 40, fontSize: 8 },
              },
              {
                content: LiveCptDetails[i].TestName || "N/A",
                styles: { minCellWidth: 40, fontSize: 8 },
              },
              {
                content: LiveCptDetails[i].NoOfTests || "N/A",
                styles: { minCellWidth: 15, fontSize: 8 },
              },
              {
                content: LiveCptDetails[i].FromDate
                  ? new Date(LiveCptDetails[i].FromDate).toLocaleDateString(
                      "en-GB",
                      { day: "2-digit", month: "2-digit", year: "numeric" }
                    )
                  : "N/A",
                styles: { minCellWidth: 18, fontSize: 8 },
              },
              {
                content: LiveCptDetails[i].ToDate
                  ? new Date(LiveCptDetails[i].ToDate).toLocaleDateString(
                      "en-GB",
                      { day: "2-digit", month: "2-digit", year: "numeric" }
                    )
                  : "N/A",
                styles: { minCellWidth: 18, fontSize: 8 },
              },
              {
                content: LiveCptDetails[i].ItemName || "N/A",
                styles: { minCellWidth: 40, fontSize: 8 },
              },
              {
                content: LiveCptDetails[i].SubCategoryName || "N/A",
                styles: { minCellWidth: 30, fontSize: 8 },
              },
              {
                content: LiveCptDetails[i].OnHandStock || "N/A",
                styles: { minCellWidth: 20, fontSize: 8 },
              },
              {
                content: LiveCptDetails[i].OnBoardStock || "N/A",
                styles: { minCellWidth: 20, fontSize: 8 },
              },
              {
                content: LiveCptDetails[i].ConsumeQty || "N/A",
                styles: { minCellWidth: 20, fontSize: 8 },
              },
              {
                content: LiveCptDetails[i].ItemRate || "N/A",
                styles: { minCellWidth: 20, fontSize: 8 },
              },
              {
                content: LiveCptDetails[i].TotalPrice || "N/A",
                styles: { minCellWidth: 20, fontSize: 8 },
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
              [
                {
                  content: `LIVE CPT No: ${data.LIVCPTNo || ""}`,
                  styles: {
                    fillColor: "#fff",
                    textColor: "#000000",
                    lineWidth: 0.1,
                    lineColor: "#cecece",
                  },
                },
                {
                  content: `LIVE CPT Date: ${
                    data.CreatedDt
                      ? new Date(data.CreatedDt).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })
                      : ""
                  }`,
                  styles: {
                    fillColor: "#fff",
                    textColor: "#000000",
                    lineWidth: 0.1,
                    lineColor: "#cecece",
                  },
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
        if (print === "print") {
          const pdfOutput = doc.output("bloburl");
          const printWindow: any = window.open(pdfOutput);
          setTimeout(() => {
            printWindow.print();
          }, 250);
        } else {
          doc.save(`${data.LIVCPTNo}.pdf`);
        }
      });
  }
  selectFromDate(event: any) {
    this.ToDate = "";
    this.selectfromDate = event;
    this.FromDate = event.year + "-" + event.month + "-" + event.day;
  }
  selectToDate(event: any) {
    this.ToDate = event.year + "-" + event.month + "-" + event.day;
  }
  CPTReportData(TypeName: any = null) {
    this.allItemsService.GetAllCPTReport(this.FromDate, this.ToDate,'','').subscribe(
      (data: any) => {
        this.AllCPTReport = data.Result;
        TypeName == "pdf"
          ? ""
          : TypeName == "excel"
          ? this.downloadExcel()
          : "";
      },
      (error: any) => {
        this.shimmerVisible = false;
      }
    );
  }
  downloadExcel() {
    const header = [
      "S.No",
      "Item Code",
      "CAT Number",
      "Manufacturer",
      "Item Name",
      "Item Category",
     "Test Code",
     "Test Name",
     "Tests per Kit",
     "Qty Issued",
     "Item Buy Price",
     "UOM",
     "On Hand Qty",
     "On Board qty (in tests)",
     "Consumed Qty",
     "Tests Registered As per LIS",
     "Kit CPT",
     "Kit Live CPT",
     "No.Of Time CPT Increased"
    ];
    // Create workbook and worksheet
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet("Sharing Data");
    const fromDateParts = this.FromDate.split("-");
    const toDateParts = this.ToDate.split("-");
    const formattedFromDate =
      this.FromDate != ""
        ? fromDateParts[2] + "-" + fromDateParts[1] + "-" + fromDateParts[0]
        : null;
    const formattedToDate =
      this.ToDate != ""
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

    worksheet.getColumn(1).width = 10;
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

    this.AllCPTReport.forEach((item: any,index:number) => {
      const formulaResult =
        ((item.ConsumeQty / item.NoOfTests) *
          (item.ItemRate / item.NoOfTestFotItem)) |
        0;

      const row = worksheet.addRow([
        index+1,
        item.ItemCode,
        item.CATNumber,
        item.Manufacturer,
        item.ItemName,
        item.SubCategoryName,
        item.TestCode,
        item.TestName,
        item.NoOfTestFotItem,
        item.IssueQty,
        item.ItemRate,
        item.UOM,
        item.OnHandStock,
        item.OnBoardStock,
        item.ConsumeQty,
        item.NoOfTests,
        item.NoOfTestFotItem == 0 ? 0 : item.ItemRate / item.NoOfTestFotItem,
        formulaResult,
        (formulaResult/(item.NoOfTestFotItem == 0 ? 0 : item.ItemRate / item.NoOfTestFotItem))
        // liveCPTSumByTestCode[item.TestCode],
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
}
