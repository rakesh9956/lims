import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CItemQuotationsComponent } from './c-item-quotations.component';

describe('CItemQuotationsComponent', () => {
  let component: CItemQuotationsComponent;
  let fixture: ComponentFixture<CItemQuotationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CItemQuotationsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CItemQuotationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
