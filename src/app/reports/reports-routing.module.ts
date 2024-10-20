import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AllReportsComponent } from './all-reports/all-reports.component';
import { ApprovalQuotationsReportComponent } from './approval-quotations-report/approval-quotations-report.component';
import { ConsumeReportComponent } from './consume-report/consume-report.component';
import { GrnReportComponent } from './grn-report/grn-report.component';
import { IndentReportComponent } from './indent-report/indent-report.component';
import { IssueReportComponent } from './issue-report/issue-report.component';
import { LowStockReportComponent } from './low-stock-report/low-stock-report.component';
import { PoReportComponent } from './po-report/po-report.component';
import { StockExpiryReportComponent } from './stock-expiry-report/stock-expiry-report.component';
import { StockInHandReportComponent } from './stock-in-hand-report/stock-in-hand-report.component';
import { StockLedgerReportComponent } from './stock-ledger-report/stock-ledger-report.component';
import { StockStatusReportComponent } from './stock-status-report/stock-status-report.component';
import { StockVerificationReportComponent } from './stock-verification-report/stock-verification-report.component';
import { PurchaseItemReportComponent } from './purchase-item-report/purchase-item-report.component';
import { StockTransactionReportComponent } from './stock-transaction-report/stock-transaction-report.component';
import { LiveCptReportComponent } from './live-cpt-report/live-cpt-report.component';

const routes: Routes = [
  { path: '', component: AllReportsComponent },
  { path: 'approval-quotations-report', component: ApprovalQuotationsReportComponent },
  { path: 'consume-report', component: ConsumeReportComponent },
  { path: 'grn-report', component: GrnReportComponent },
  { path: 'indent-report', component: IndentReportComponent },
  { path: 'issue-report', component: IssueReportComponent },
  { path: 'low-stock-report', component: LowStockReportComponent },
  { path: 'po-report', component: PoReportComponent },
  { path: 'stock-expiry-report', component: StockExpiryReportComponent },
  { path: 'stock-in-hand-report', component: StockInHandReportComponent },
  { path: 'stock-ledger-report', component: StockLedgerReportComponent },
  { path: 'stock-status-report', component: StockStatusReportComponent },
  { path: 'stock-verification-report', component: StockVerificationReportComponent },
  { path: 'purchase-item-report', component: PurchaseItemReportComponent},
  { path: 'stock-transaction-report', component: StockTransactionReportComponent},
  { path: 'live-cpt-report', component: LiveCptReportComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportsRoutingModule { }
