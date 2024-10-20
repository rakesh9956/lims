import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GetAllCptsComponent } from './get-all-cpts.component';

describe('GetAllCptsComponent', () => {
  let component: GetAllCptsComponent;
  let fixture: ComponentFixture<GetAllCptsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GetAllCptsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GetAllCptsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
