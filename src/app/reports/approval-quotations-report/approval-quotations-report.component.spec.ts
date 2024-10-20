import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApprovalQuotationsReportComponent } from './approval-quotations-report.component';

describe('ApprovalQuotationsReportComponent', () => {
  let component: ApprovalQuotationsReportComponent;
  let fixture: ComponentFixture<ApprovalQuotationsReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ApprovalQuotationsReportComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApprovalQuotationsReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
