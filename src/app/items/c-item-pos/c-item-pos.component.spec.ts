import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CItemPosComponent } from './c-item-pos.component';

describe('CItemPosComponent', () => {
  let component: CItemPosComponent;
  let fixture: ComponentFixture<CItemPosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CItemPosComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CItemPosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
