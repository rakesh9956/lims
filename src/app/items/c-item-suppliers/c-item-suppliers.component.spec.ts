import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CItemSuppliersComponent } from './c-item-suppliers.component';

describe('CItemSuppliersComponent', () => {
  let component: CItemSuppliersComponent;
  let fixture: ComponentFixture<CItemSuppliersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CItemSuppliersComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CItemSuppliersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
