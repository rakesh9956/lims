import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CItemGrnComponent } from './c-item-grn.component';

describe('CItemGrnComponent', () => {
  let component: CItemGrnComponent;
  let fixture: ComponentFixture<CItemGrnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CItemGrnComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CItemGrnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
