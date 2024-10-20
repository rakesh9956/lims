import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StockInHandReportComponent } from './stock-in-hand-report.component';

describe('StockInHandReportComponent', () => {
  let component: StockInHandReportComponent;
  let fixture: ComponentFixture<StockInHandReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StockInHandReportComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StockInHandReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
