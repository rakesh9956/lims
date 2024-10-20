import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReportsRoutingModule } from './reports-routing.module';
import { AllReportsComponent } from './all-reports/all-reports.component';
import { StockStatusReportComponent } from './stock-status-report/stock-status-report.component';
import { ConsumeReportComponent } from './consume-report/consume-report.component';
import { IssueReportComponent } from './issue-report/issue-report.component';
import { StockExpiryReportComponent } from './stock-expiry-report/stock-expiry-report.component';
import { LowStockReportComponent } from './low-stock-report/low-stock-report.component';
import { IndentReportComponent } from './indent-report/indent-report.component';
import { GrnReportComponent } from './grn-report/grn-report.component';
import { PoReportComponent } from './po-report/po-report.component';
import { StockLedgerReportComponent } from './stock-ledger-report/stock-ledger-report.component';
import { StockVerificationReportComponent } from './stock-verification-report/stock-verification-report.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AngularDoubleScrollModule } from 'angular-double-scroll';
import { ApprovalQuotationsReportComponent } from './approval-quotations-report/approval-quotations-report.component';
import { StockInHandReportComponent } from './stock-in-hand-report/stock-in-hand-report.component';
import { PurchaseItemReportComponent } from './purchase-item-report/purchase-item-report.component';
import { SharedModule } from 'src/shared/shared.module';
import { StockTransactionReportComponent } from './stock-transaction-report/stock-transaction-report.component';
import { NgxDatatableModule } from '@swimlane/ngx-datatable'; 
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { LiveCptReportComponent } from './live-cpt-report/live-cpt-report.component';

@NgModule({
  declarations: [
    AllReportsComponent,
    StockStatusReportComponent,
    ConsumeReportComponent,
    IssueReportComponent,
    StockExpiryReportComponent,
    LowStockReportComponent,
    IndentReportComponent,
    GrnReportComponent,
    PoReportComponent,
    StockLedgerReportComponent,
    StockVerificationReportComponent,
    ApprovalQuotationsReportComponent,
    StockInHandReportComponent,
    PurchaseItemReportComponent,
    StockTransactionReportComponent,
    LiveCptReportComponent

  ],
  imports: [
    CommonModule,
    ReportsRoutingModule,
    NgbModule,
    NgSelectModule,
    FormsModule,
    ReactiveFormsModule,
    AngularDoubleScrollModule,
    SharedModule,
    NgxDatatableModule,
    NgMultiSelectDropDownModule
  ]
})
export class ReportsModule { }
