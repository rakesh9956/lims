import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllQuotationsComponent } from './all-quotations.component';

describe('AllQuotationsComponent', () => {
  let component: AllQuotationsComponent;
  let fixture: ComponentFixture<AllQuotationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AllQuotationsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AllQuotationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
