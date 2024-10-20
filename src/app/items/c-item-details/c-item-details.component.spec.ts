import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CItemDetailsComponent } from './c-item-details.component';

describe('CItemDetailsComponent', () => {
  let component: CItemDetailsComponent;
  let fixture: ComponentFixture<CItemDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CItemDetailsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CItemDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
