import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StockVerificationReportComponent } from './stock-verification-report.component';

describe('StockVerificationReportComponent', () => {
  let component: StockVerificationReportComponent;
  let fixture: ComponentFixture<StockVerificationReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StockVerificationReportComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StockVerificationReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
