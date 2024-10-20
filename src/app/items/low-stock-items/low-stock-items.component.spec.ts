import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LowStockItemsComponent } from './low-stock-items.component';

describe('LowStockItemsComponent', () => {
  let component: LowStockItemsComponent;
  let fixture: ComponentFixture<LowStockItemsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LowStockItemsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LowStockItemsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
