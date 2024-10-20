import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdjustItemsComponent } from './adjust-items.component';

describe('AdjustItemsComponent', () => {
  let component: AdjustItemsComponent;
  let fixture: ComponentFixture<AdjustItemsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdjustItemsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdjustItemsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
