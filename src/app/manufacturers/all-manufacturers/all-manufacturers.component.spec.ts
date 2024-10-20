import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllManufacturersComponent } from './all-manufacturers.component';

describe('AllManufacturersComponent', () => {
  let component: AllManufacturersComponent;
  let fixture: ComponentFixture<AllManufacturersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AllManufacturersComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AllManufacturersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
