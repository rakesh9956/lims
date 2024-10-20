import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StockStatusReportComponent } from './stock-status-report.component';

describe('StockStatusReportComponent', () => {
  let component: StockStatusReportComponent;
  let fixture: ComponentFixture<StockStatusReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StockStatusReportComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StockStatusReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
