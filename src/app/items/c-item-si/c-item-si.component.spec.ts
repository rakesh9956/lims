import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CItemSiComponent } from './c-item-si.component';

describe('CItemSiComponent', () => {
  let component: CItemSiComponent;
  let fixture: ComponentFixture<CItemSiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CItemSiComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CItemSiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
