import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LowStockReportComponent } from './low-stock-report.component';

describe('LowStockReportComponent', () => {
  let component: LowStockReportComponent;
  let fixture: ComponentFixture<LowStockReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LowStockReportComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LowStockReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
