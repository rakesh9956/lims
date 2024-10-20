import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StockExpiryReportComponent } from './stock-expiry-report.component';

describe('StockExpiryReportComponent', () => {
  let component: StockExpiryReportComponent;
  let fixture: ComponentFixture<StockExpiryReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StockExpiryReportComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StockExpiryReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
