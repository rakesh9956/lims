import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseItemReportComponent } from './purchase-item-report.component';

describe('PurchaseItemReportComponent', () => {
  let component: PurchaseItemReportComponent;
  let fixture: ComponentFixture<PurchaseItemReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PurchaseItemReportComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PurchaseItemReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
