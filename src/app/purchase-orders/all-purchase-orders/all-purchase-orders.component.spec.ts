import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllPurchaseOrdersComponent } from './all-purchase-orders.component';

describe('AllPurchaseOrdersComponent', () => {
  let component: AllPurchaseOrdersComponent;
  let fixture: ComponentFixture<AllPurchaseOrdersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AllPurchaseOrdersComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AllPurchaseOrdersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
