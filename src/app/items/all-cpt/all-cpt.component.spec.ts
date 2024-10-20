import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllCptComponent } from './all-cpt.component';

describe('AllCptComponent', () => {
  let component: AllCptComponent;
  let fixture: ComponentFixture<AllCptComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AllCptComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AllCptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
